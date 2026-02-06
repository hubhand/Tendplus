import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    console.error('❌ CRON_SECRET not configured');
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const authHeader = req.headers.get('x-vercel-cron-secret');

  if (authHeader !== process.env.CRON_SECRET) {
    console.error('❌ Unauthorized cron request');
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    const { data: items, error } = await supabase.rpc(
      'get_expiring_items_kst',
      { days_threshold: 3 }
    );

    if (error) {
      console.error('❌ RPC error:', error);
      throw error;
    }

    if (!items || items.length === 0) {
      console.log('✅ No expiring items');
      return Response.json({
        message: '알림 대상 없음',
        count: 0,
      });
    }

    console.log(`📦 Found ${items.length} expiring items`);

    const itemIds = items.map((i: { id: string }) => i.id);
    await supabase
      .from('pantry_items')
      .update({ notified_at: new Date().toISOString() })
      .in('id', itemIds);

    for (const item of items) {
      await supabase.from('notifications').insert({
        user_id: item.user_id,
        type: 'expiry_warning',
        title: '유통기한 임박',
        body: `제품이 ${item.days_until_expiry}일 후 만료됩니다.`,
        data: {
          pantry_item_id: item.id,
          product_id: item.product_id,
          expiry_date: item.expiry_date,
        },
      });
    }

    console.log('✅ Notifications created');

    return Response.json({
      message: '알림 생성 완료',
      count: items.length,
    });
  } catch (error) {
    console.error('❌ Cron error:', error);
    return Response.json(
      { error: 'Cron 실행 실패' },
      { status: 500 }
    );
  }
}
