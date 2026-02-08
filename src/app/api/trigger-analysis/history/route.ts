import { getCurrentUserId, createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch trigger analysis with product details
    const { data: analyses, error } = await supabase
      .from('trigger_analysis')
      .select(
        `
        id,
        reaction_type,
        notes,
        created_at,
        products (
          id,
          name
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('History fetch error:', error);
      return Response.json(
        { error: 'Failed to fetch history' },
        { status: 500 }
      );
    }

    // Count ingredients for each product
    const history = await Promise.all(
      (analyses || []).map(
        async (analysis: {
          id: string;
          reaction_type: string;
          notes: string | null;
          created_at: string;
          products?: { id: string; name: string } | null;
        }) => {
          const productId = analysis.products?.id;
          const { count } = productId
            ? await supabase
                .from('product_ingredients')
                .select('*', { count: 'exact', head: true })
                .eq('product_id', productId)
            : { count: 0 };

          return {
            id: analysis.id,
            product_name: analysis.products?.name || '알 수 없는 제품',
            reaction_type: analysis.reaction_type,
            notes: analysis.notes,
            created_at: analysis.created_at,
            ingredients_count: count || 0,
          };
        }
      )
    );

    return Response.json({ history });
  } catch (error) {
    console.error('History API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
