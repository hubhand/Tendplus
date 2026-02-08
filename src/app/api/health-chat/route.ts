import { getCurrentUserId, createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/security/encryption';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

function isEncrypted(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.split(':').length === 3 &&
    /^[a-f0-9]+:[a-f0-9]+:[a-f0-9]+$/i.test(value)
  );
}

function decryptField(value: unknown): unknown {
  if (value == null) return value;
  if (isEncrypted(value)) {
    try {
      return JSON.parse(decrypt(value));
    } catch {
      return value;
    }
  }
  return value;
}

function encryptField(value: unknown): string {
  return encrypt(JSON.stringify(value ?? []));
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { message } = body;
  if (!message) {
    return Response.json({ error: 'Message required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('health_profiles')
    .select('allergies, medications, skin_concerns, chronic_conditions, blacklist_ingredients')
    .eq('user_id', userId)
    .maybeSingle();

  const existingAllergies = profile ? (decryptField(profile.allergies) as string[] || []) : [];
  const existingMedications = profile ? (decryptField(profile.medications) as string[] || []) : [];
  const existingSkinConcerns = profile ? (decryptField(profile.skin_concerns) as string[] || []) : [];
  const existingChronicConditions = profile ? (decryptField(profile.chronic_conditions) as string[] || []) : [];
  const existingBlacklist = profile ? (decryptField(profile.blacklist_ingredients) as string[] || []) : [];

  const systemPrompt = `당신은 건강 정보 수집 및 상담 전문 AI 어시스턴트입니다.

[사용자의 현재 건강 프로필]
- 알러지: ${existingAllergies.join(', ') || '없음'}
- 복용약: ${existingMedications.join(', ') || '없음'}
- 피부고민: ${existingSkinConcerns.join(', ') || '없음'}
- 만성질환: ${existingChronicConditions.join(', ') || '없음'}
- 피해야 할 성분: ${existingBlacklist.join(', ') || '없음'}

[당신의 역할]
1. 사용자의 질문에 대해 현재 건강 프로필을 참고하여 답변합니다
2. 새로운 건강 정보를 발견하면 추출하여 JSON으로 반환합니다
3. 약물-식품 상호작용, 알러지 주의사항 등을 안내합니다

[중요 지침]
- 사용자가 복용 중인 약이 있다면 반드시 언급하세요
- 약물-음주 상호작용은 매우 중요합니다. 복용약이 있다면 음주 위험을 경고하세요
- 알러지가 있다면 관련 식품/성분 주의사항을 알려주세요
- 의학적 판단은 전문가 상담을 권장하되, 알려진 위험은 명확히 경고하세요

[응답 형식]
항상 JSON 형식으로 응답하세요:
{
  "extracted_data": {
    "allergies": ["새로 발견된 알러지"],
    "medications": ["새로 발견된 약물"],
    "skin_concerns": ["새로 발견된 피부고민"],
    "chronic_conditions": ["새로 발견된 만성질환"],
    "blacklist_ingredients": ["새로 발견된 피해야 할 성분"]
  },
  "reply": "친절하고 자세한 한글 답변"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              { text: `사용자: ${message}` }
            ]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('AI response:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ reply: text });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const updateData: Record<string, string> = {};

    if (parsed.extracted_data) {
      const fields = {
        allergies: existingAllergies,
        medications: existingMedications,
        skin_concerns: existingSkinConcerns,
        chronic_conditions: existingChronicConditions,
        blacklist_ingredients: existingBlacklist
      };

      for (const [key, existing] of Object.entries(fields)) {
        const newData = parsed.extracted_data[key] || [];
        if (Array.isArray(newData) && newData.length > 0) {
          const merged = [...new Set([...existing, ...newData])];
          updateData[key] = encryptField(merged);
        }
      }

      if (Object.keys(updateData).length > 0) {
        updateData.updated_at = new Date().toISOString();
        await supabase
          .from('health_profiles')
          .update(updateData)
          .eq('user_id', userId);
        console.log('Profile updated:', Object.keys(updateData));
      }
    }

    return Response.json({ reply: parsed.reply });
  } catch (error) {
    console.error('Health chat error:', error);
    return Response.json(
      { reply: '죄송합니다. 오류가 발생했어요. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
