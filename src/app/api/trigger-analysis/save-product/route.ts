import { getCurrentUserId, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, ingredients } = await req.json();

    if (!name || !ingredients || !Array.isArray(ingredients)) {
      return Response.json({ error: 'Invalid data' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        category: 'scanned',
      })
      .select()
      .single();

    if (productError) {
      console.error('Product creation error:', productError);
      return Response.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    // Add ingredients
    for (let i = 0; i < ingredients.length; i++) {
      const ingredientName =
        typeof ingredients[i] === 'string'
          ? ingredients[i]
          : String(ingredients[i]);

      if (!ingredientName.trim()) continue;

      const normalized = ingredientName
        .toLowerCase()
        .replace(/[^가-힣a-zA-Z0-9]/g, '')
        .replace(/\s+/g, '');

      let { data: ingredient } = await supabase
        .from('ingredients')
        .select('id')
        .eq('name_ko_normalized', normalized)
        .maybeSingle();

      if (!ingredient) {
        const { data: newIngredient } = await supabase
          .from('ingredients')
          .insert({ name_ko: ingredientName.trim() })
          .select('id')
          .single();

        ingredient = newIngredient ?? null;
      }

      if (ingredient) {
        await supabase.from('product_ingredients').upsert(
          {
            product_id: product.id,
            ingredient_id: ingredient.id,
            position: i + 1,
          },
          { onConflict: 'product_id,ingredient_id', ignoreDuplicates: true }
        );
      }
    }

    return Response.json({
      success: true,
      productId: product.id,
    });
  } catch (error) {
    console.error('Save product error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
