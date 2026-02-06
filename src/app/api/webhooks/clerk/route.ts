import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: { type: string; data: { id: string; email_addresses?: { email_address: string }[]; first_name?: string; last_name?: string } };

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as typeof evt;
  } catch (err) {
    console.error('Webhook verification failed:', {
      error: err instanceof Error ? err.message : 'Unknown error',
      svixId: svix_id,
      svixTimestamp: svix_timestamp,
    });
    return new Response('Invalid signature', { status: 400 });
  }

  const { id, email_addresses, first_name, last_name } = evt.data;
  const eventType = evt.type;

  const supabase = createAdminClient();

  if (eventType === 'user.created') {
    const email = email_addresses?.[0]?.email_address ?? `user-${id}@placeholder.local`;

    let displayName =
      first_name && last_name ? `${first_name} ${last_name}` : email.split('@')[0];

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
        clerk_id: id,
        email,
        display_name: displayName,
      })
      .select('id')
      .maybeSingle();

    if (insertError) {
      console.error('Webhook users_profile insert error:', insertError);
      return new Response('DB error', { status: 500 });
    }

    if (profile) {
      await supabase.from('health_profiles').insert({
        user_id: profile.id,
      });
    }
  }

  if (eventType === 'user.deleted') {
    await supabase.from('users_profile').delete().eq('clerk_id', id);
  }

  if (eventType === 'user.updated') {
    const email = email_addresses?.[0]?.email_address ?? null;
    if (email) {
      const { error } = await supabase
        .from('users_profile')
        .update({ email })
        .eq('clerk_id', id);
      if (error) console.error('Webhook user.updated error:', error);
    }
  }

  return Response.json({ success: true });
}
