import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/sync-profile
 *
 * Webhook 이전 가입자 대응: users_profile에 레코드가 없으면 Clerk 데이터로 생성
 * - 로그인 필수
 * - 이미 있으면 200 반환
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('users_profile')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle();

  if (existing) {
    return Response.json({ success: true, alreadyExists: true });
  }

  let email = `user-${userId}@placeholder.local`;
  let displayName = email.split('@')[0];

  try {
    const user = await currentUser();
    if (user) {
      const primaryEmail = user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId) ?? user.emailAddresses?.[0];
      if (primaryEmail?.emailAddress) {
        email = primaryEmail.emailAddress;
      }
      const firstName = user.firstName ?? '';
      const lastName = user.lastName ?? '';
      displayName = firstName && lastName ? `${firstName} ${lastName}`.trim() : email.split('@')[0];
    }
  } catch (err) {
    console.error('sync-profile Clerk user fetch error:', err);
  }

  const { data: existingNames } = await supabase
    .from('users_profile')
    .select('display_name')
    .ilike('display_name', `${displayName}%`);

  if (existingNames && existingNames.length > 0) {
    const maxNum = existingNames.reduce((max, row) => {
      const match = row.display_name?.match(/_(\d+)$/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 1);
    if (maxNum >= 1) {
      displayName = `${displayName}_${maxNum + 1}`;
    }
  }

  const { data: profile, error: insertError } = await supabase
    .from('users_profile')
    .insert({
      clerk_id: userId,
      email,
      display_name: displayName,
    })
    .select('id')
    .maybeSingle();

  if (insertError) {
    console.error('sync-profile users_profile insert error:', insertError);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }

  if (profile) {
    const { error: hpError } = await supabase.from('health_profiles').insert({
      user_id: profile.id,
    });
    if (hpError) {
      console.error('sync-profile health_profiles insert error:', hpError);
    }
  }

  return Response.json({ success: true });
}
