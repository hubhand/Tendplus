import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCurrentUserId, createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/api/rate-limiter';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY not set in .env.local');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

function extractNames(rows: unknown[] | null): string[] {
  return [
    ...new Set(
      (rows ?? [])
        .map((i: unknown) => {
          const ing = (i as { ingredients?: { name_ko?: string | null } | { name_ko?: string | null }[] | null })
            ?.ingredients;
          if (Array.isArray(ing)) return ing[0]?.name_ko;
          return ing?.name_ko;
        })
        .filter((name): name is string => Boolean(name))
    ),
  ];
}

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

  let goodProductIds: string[] = [];
  let badProductIds: string[] = [];
  try {
    const body = await req.json();
    goodProductIds = Array.isArray(body?.goodProductIds) ? body.goodProductIds : [];
    badProductIds = Array.isArray(body?.badProductIds) ? body.badProductIds : [];
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = await createClient();

  let goodIngs: unknown[] = [];
  let badIngs: unknown[] = [];

  if (goodProductIds.length > 0) {
    const { data } = await supabase
      .from('product_ingredients')
      .select('ingredient_id, ingredients(name_ko)')
      .in('product_id', goodProductIds);
    goodIngs = data ?? [];
  }

  if (badProductIds.length > 0) {
    const { data } = await supabase
      .from('product_ingredients')
      .select('ingredient_id, ingredients(name_ko)')
      .in('product_id', badProductIds);
    badIngs = data ?? [];
  }

  const goodIngredients = extractNames(goodIngs);
  const badIngredients = extractNames(badIngs);
  const differenceIngredients = badIngredients.filter(
    (name) => !goodIngredients.includes(name)
  );

  let suspectedIngredients: string[] = [];
  let confidence: number | null = null;

  if (differenceIngredients.length > 0) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const prompt = `다음 화장품/식품 성분들 중 피부 반응(알레르기, 자극 등)을 유발할 가능성이 있는 성분을 분석해주세요.
좋은 제품 성분: ${goodIngredients.join(', ') || '(없음)'}
나쁜 제품 성분: ${badIngredients.join(', ')}
차이 성분(나쁜 제품에만 있음): ${differenceIngredients.join(', ')}

JSON 형식으로만 반환:
{"suspected": ["의심성분1", "의심성분2", ...], "confidence": 0.0~1.0}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        suspectedIngredients = Array.isArray(parsed?.suspected)
          ? parsed.suspected
          : [];
        confidence =
          typeof parsed?.confidence === 'number' ? parsed.confidence : null;
      }
    } catch (err) {
      console.error('Gemini trigger-analysis error:', err);
    }
  }

  const { error } = await supabase.from('trigger_analyses').insert({
    user_id: userId,
    good_products: goodProductIds,
    bad_products: badProductIds,
    good_ingredients: goodIngredients,
    bad_ingredients: badIngredients,
    difference_ingredients: differenceIngredients,
    suspected_ingredients: suspectedIngredients,
    confidence,
  });

  if (error) {
    console.error('trigger_analyses insert error:', error);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }

  return Response.json({
    success: true,
    good_ingredients: goodIngredients,
    bad_ingredients: badIngredients,
    difference_ingredients: differenceIngredients,
    suspected_ingredients: suspectedIngredients,
    confidence,
  });
}
