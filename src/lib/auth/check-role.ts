import { getCurrentUserId, createClient } from '@/lib/supabase/server';

export async function checkRole(allowedRoles: ('admin' | 'super_admin')[]) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthorized');

  const supabase = await createClient();
  const { data } = await supabase
    .from('users_profile')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (!data || !allowedRoles.includes(data.role as 'admin' | 'super_admin')) {
    throw new Error('Forbidden');
  }
}
