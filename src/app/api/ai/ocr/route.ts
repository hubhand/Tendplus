import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCurrentUserId } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/api/rate-limiter';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY not set in .env.local');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

  const { imageBase64 } = await req.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `이미지에서 제품 성분을 추출하세요.

JSON 형식으로 반환:
{
  "product_name": "제품명",
  "ingredients_list": ["성분1", "성분2", ...],
  "confidence": 0.9
}`;

  try {
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const data = JSON.parse(jsonMatch[0]);

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Gemini OCR error:', error);
    return Response.json(
      { error: 'OCR 실패', needsManualInput: true },
      { status: 500 }
    );
  }
}
