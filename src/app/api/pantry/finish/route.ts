import { getCurrentUserId, createClient } from '@/lib/supabase/server';
import { calculateAdjustedCycle } from '@/lib/subscription/calculate-cycle';

/**
 * POST /api/pantry/finish
 * "다 썼어요" API (Phase 11)
 * 
 * 수정 #16: pantry_items → subscriptions 조회 분리
 * 수정 #17: pantry_items.added_at 사용 (purchased_at로)
 */
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { pantryItemId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { pantryItemId } = body;
  if (!pantryItemId) {
    return Response.json({ error: 'pantryItemId required' }, { status: 400 });
  }

  const supabase = await createClient();

  // 수정 #16: pantry_items만 조회
  const { data: pantryItem, error: pantryError } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('id', pantryItemId)
    .eq('user_id', userId)
    .maybeSingle();

  if (pantryError) {
    console.error('pantry_items query error:', pantryError);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }

  if (!pantryItem) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const now = new Date();

  // 1. pantry_items 상태를 'empty'로 업데이트
  const { error: updateError } = await supabase
    .from('pantry_items')
    .update({ status: 'empty' })
    .eq('id', pantryItemId);

  if (updateError) {
    console.error('pantry_items update error:', updateError);
    return Response.json({ error: 'Update failed' }, { status: 500 });
  }

  // 2. consumption_patterns에 기록 (수정 #17: added_at 사용)
  if (pantryItem.added_at) {
    const { error: patternError } = await supabase
      .from('consumption_patterns')
      .insert({
        user_id: userId,
        product_id: pantryItem.product_id,
        pantry_item_id: pantryItemId,
        purchased_at: pantryItem.added_at,
        finished_at: now.toISOString(),
      });

    if (patternError) {
      console.error('consumption_patterns insert error:', patternError);
      // 패턴 기록 실패는 치명적이지 않으므로 계속 진행
    }
  }

  // 수정 #16: subscriptions 별도 조회
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', pantryItem.product_id)
    .maybeSingle();

  if (subError) {
    console.error('subscriptions query error:', subError);
    return Response.json({ error: 'Subscription query failed' }, { status: 500 });
  }

  // 3. 구독이 있으면 주기 자동 조정
  if (subscription) {
    // 최근 5개 패턴 조회
    const { data: patterns, error: patternsError } = await supabase
      .from('consumption_patterns')
      .select('actual_duration_days')
      .eq('user_id', userId)
      .eq('product_id', pantryItem.product_id)
      .order('finished_at', { ascending: false })
      .limit(5);

    if (patternsError) {
      console.error('consumption_patterns query error:', patternsError);
    }

    // calculateAdjustedCycle로 주기 계산
    const adjustedCycle = patterns ? calculateAdjustedCycle(patterns) : null;
    const nextCycle = adjustedCycle || subscription.current_cycle_days || 30;

    // subscriptions 업데이트
    const nextReminderAt = new Date(
      now.getTime() + nextCycle * 24 * 60 * 60 * 1000
    );

    const { error: subUpdateError } = await supabase
      .from('subscriptions')
      .update({
        last_finished_at: now.toISOString(),
        current_cycle_days: nextCycle,
        next_reminder_at: nextReminderAt.toISOString(),
      })
      .eq('id', subscription.id);

    if (subUpdateError) {
      console.error('subscriptions update error:', subUpdateError);
      return Response.json({ error: 'Subscription update failed' }, { status: 500 });
    }

    return Response.json({
      success: true,
      nextCycle,
      nextReminderAt: nextReminderAt.toISOString(),
    });
  }

  return Response.json({ success: true });
}
