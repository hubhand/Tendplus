'use client';

/**
 * TEND+ Supabase 클라이언트 (Clerk Native Integration)
 *
 * 2026년 권장 방식: JWT Template deprecated → Clerk Dashboard에서 Supabase 통합 활성화
 * - https://dashboard.clerk.com/setup/supabase
 * - Supabase Dashboard → Authentication → Add provider → Clerk
 *
 * @see https://clerk.com/docs/integrations/databases/supabase
 * @see https://supabase.com/docs/guides/auth/third-party/clerk
 */

import { useMemo } from 'react';
import { useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// PUBLISHABLE_KEY(신규) 또는 ANON_KEY(레거시) 지원
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function useSupabaseClient() {
  const { session } = useSession();

  return useMemo(
    () =>
      createClient(supabaseUrl, supabaseAnonKey, {
        accessToken: async () => (await session?.getToken()) ?? null,
      }),
    [session]
  );
}
