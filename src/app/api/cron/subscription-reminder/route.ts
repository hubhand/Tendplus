import { createAdminClient } from '@/lib/supabase/server';

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
  const now = new Date();

  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .lte('next_reminder_at', now.toISOString());

  if (error) {
    console.error('subscriptions query error:', error);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }

  if (!subs || subs.length === 0) {
    return Response.json({ message: '알림 대상 없음', count: 0 });
  }

  for (const sub of subs) {
    await supabase.from('notifications').insert({
      user_id: sub.user_id,
      type: 'subscription_reminder',
      title: '재구매 시기 알림',
      body: `${sub.current_cycle_days}일 주기 재구매 시기입니다.`,
      data: { subscription_id: sub.id, product_id: sub.product_id },
    });

    const nextReminderAt = new Date(
      now.getTime() + (sub.current_cycle_days ?? 30) * 24 * 60 * 60 * 1000
    );

    await supabase
      .from('subscriptions')
      .update({ next_reminder_at: nextReminderAt.toISOString() })
      .eq('id', sub.id);
  }

  return Response.json({ message: '알림 생성 완료', count: subs.length });
}
