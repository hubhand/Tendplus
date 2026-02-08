import { getCurrentUserId, createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Count good products
    const { count: goodCount } = await supabase
      .from('trigger_analysis')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('reaction_type', 'good');

    // Count bad products
    const { count: badCount } = await supabase
      .from('trigger_analysis')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('reaction_type', 'bad');

    return Response.json({
      good: goodCount || 0,
      bad: badCount || 0,
    });
  } catch (error) {
    console.error('Counts API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
