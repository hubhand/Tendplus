import { getCurrentUserId, createClient, createAdminClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/api/rate-limiter';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResult = await checkRateLimit(userId);
  if (!rateLimitResult.allowed) {
    return Response.json(
      {
        error: '요청이 너무 많습니다',
        retryAfter: rateLimitResult.retryAfter,
        failClosed: rateLimitResult.failClosed,
      },
      { status: 429 }
    );
  }

  let body: { imageBase64?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { imageBase64 } = body;
  if (!imageBase64) {
    return Response.json({ error: 'imageBase64 required' }, { status: 400 });
  }

  const base64Data = imageBase64.includes(',')
    ? imageBase64.split(',')[1]
    : imageBase64;

  const prompt = `이미지에서 제품 성분을 추출하세요.

JSON 형식으로 반환:
{
  "product_name": "제품명",
  "ingredients_list": ["성분1", "성분2", ...],
  "confidence": 0.9
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data,
                  },
                },
                { text: prompt },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const apiResponse = await response.json();
    const text = apiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const data = JSON.parse(jsonMatch[0]);

    try {
      const supabase = createAdminClient();

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: data.product_name || 'Unknown Product',
          category: 'scanned',
        })
        .select()
        .single();

      if (productError) {
        console.error('Product insert error:', productError);
      }

      if (product && data.ingredients_list && Array.isArray(data.ingredients_list)) {
        for (let i = 0; i < data.ingredients_list.length; i++) {
          const ingredientRaw = data.ingredients_list[i];

          const ingredientName =
            typeof ingredientRaw === 'string'
              ? ingredientRaw
              : ingredientRaw?.name || ingredientRaw?.text || String(ingredientRaw);

          if (!ingredientName || typeof ingredientName !== 'string') {
            console.log('Skipping invalid ingredient:', ingredientRaw);
            continue;
          }

          const normalized = ingredientName
            .toLowerCase()
            .replace(/[^가-힣a-zA-Z0-9]/g, '')
            .replace(/\s+/g, '');

          let { data: ingredient } = await supabase
            .from('ingredients')
            .select('id')
            .eq('name_ko_normalized', normalized)
            .maybeSingle();

          if (!ingredient) {
            const { data: newIngredient, error: ingredientError } = await supabase
              .from('ingredients')
              .insert({ name_ko: ingredientName })
              .select('id')
              .single();

            if (!ingredientError && newIngredient) {
              ingredient = newIngredient;
            }
          }

          if (ingredient) {
            await supabase
              .from('product_ingredients')
              .upsert(
                {
                  product_id: product.id,
                  ingredient_id: ingredient.id,
                  position: i + 1,
                },
                { onConflict: 'product_id,ingredient_id', ignoreDuplicates: true }
              );
          }
        }

        console.log('Product and ingredients saved to database');
      }

      const userSupabase = await createClient();
      await userSupabase.from('scan_history').insert({
        user_id: userId,
        product_id: product?.id,
        ocr_result: data,
        confidence: data.confidence,
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Gemini OCR error:', error);
    return Response.json(
      { error: 'OCR 실패', needsManualInput: true },
      { status: 500 }
    );
  }
}
