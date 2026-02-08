import { getCurrentUserId, createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, reactionType, notes } = await req.json();

    if (!productId || !reactionType || !['good', 'bad'].includes(reactionType)) {
      return Response.json({ error: 'Invalid data' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('trigger_analysis')
      .insert({
        user_id: userId,
        product_id: productId,
        reaction_type: reactionType,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Record analysis error:', error);
      return Response.json({ error: 'Failed to record' }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Record API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('trigger_analysis')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete analysis error:', error);
      return Response.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
