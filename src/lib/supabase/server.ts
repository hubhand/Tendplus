/**
 * TEND+ Supabase 서버 클라이언트 (Clerk Native Integration)
 *
 * 2026년 권장 방식: JWT Template deprecated
 * - Clerk Dashboard → Supabase 통합 활성화
 * - auth().getToken()으로 세션 토큰 전달
 *
 * @see https://clerk.com/docs/integrations/databases/supabase
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */

import { auth } from '@clerk/nextjs/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// PUBLISHABLE_KEY(신규) 또는 ANON_KEY(레거시) 지원
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Clerk 세션 토큰을 사용하는 Supabase 클라이언트 (RLS 적용)
 * - /api/admin, /api/cron 제외한 일반 라우트에서만 사용
 * - 비로그인 시 anon 키로 요청 (public RLS 정책 적용)
 */
export async function createServerSupabaseClient() {
  const { getToken } = await auth();
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => (await getToken()) ?? null,
  });
}

/**
 * Supabase 공식 quickstart 호환 alias
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */
export const createClient = createServerSupabaseClient;

/**
 * Service Role 키를 사용하는 관리자 클라이언트
 * - /api/admin, /api/cron에서만 사용
 * - RLS 우회 (절대 일반 라우트에서 사용 금지)
 */
export function createAdminClient() {
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
}

/**
 * 현재 로그인한 사용자의 users_profile.id (uuid) 반환
 * - Clerk auth().userId로 clerk_id 조회
 * - API 라우트에서 인증 확인용
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('users_profile')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle();

  if (error) {
    console.error('getCurrentUserId error:', error);
    return null;
  }
  return data?.id ?? null;
}
