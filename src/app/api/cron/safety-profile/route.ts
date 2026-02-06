import { createAdminClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/security/encryption';

function isEncrypted(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.split(':').length === 3 &&
    /^[a-f0-9]+:[a-f0-9]+:[a-f0-9]+$/i.test(value)
  );
}

function parseBlacklist(value: unknown): string[] {
  if (value == null) return [];
  if (isEncrypted(value)) {
    try {
      const parsed = JSON.parse(decrypt(value));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
}

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    console.error('CRON_SECRET not configured');
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const authHeader = req.headers.get('x-vercel-cron-secret');
  if (authHeader !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: profiles, error } = await supabase
    .from('health_profiles')
    .select('user_id, blacklist_ingredients')
    .not('blacklist_ingredients', 'eq', '[]');

  if (error) {
    console.error('health_profiles query error:', error);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return Response.json({ message: '알림 대상 없음', count: 0 });
  }

  for (const p of profiles) {
    const ingredients = parseBlacklist(p.blacklist_ingredients);
    if (ingredients.length > 0) {
      await supabase.from('notifications').insert({
        user_id: p.user_id,
        type: 'safety_reminder',
        title: '성분 주의 알림',
        body: `주의 성분 ${ingredients.length}개가 등록되어 있습니다.`,
        data: { blacklist: ingredients },
      });
    }
  }

  return Response.json({ message: '알림 생성 완료', count: profiles.length });
}
