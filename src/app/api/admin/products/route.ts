import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // Check admin permission
    await requireAdmin();

    const body = await req.json();
    const {
      name,
      brand,
      price,
      shop_url,
      image_url,
      description,
      ingredients,
    } = body;

    if (!name) {
      return Response.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Create product (only include columns that exist in schema)
    const productInsert: Record<string, unknown> = {
      name,
      brand: brand || null,
      price: price || null,
      shop_url: shop_url || null,
      image_url: image_url || null,
      description: description || null,
      category: 'shop',
    };

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(productInsert)
      .select()
      .single();

    if (productError) {
      console.error('Product creation error:', productError);
      return Response.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    console.log('Product created:', product.id);

    // Add ingredients if provided
    if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
      for (let i = 0; i < ingredients.length; i++) {
        const ingredientName =
          typeof ingredients[i] === 'string'
            ? ingredients[i]
            : String(ingredients[i] ?? '');
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
          console.log('Ingredient linked:', ingredientName);
        }
      }
    }

    return Response.json({ success: true, product });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Unauthorized')
    ) {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.error('Admin product creation error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      id,
      name,
      brand,
      price,
      shop_url,
      image_url,
      description,
      ingredients,
    } = body;

    if (!id || !name) {
      return Response.json(
        { error: 'ID and name are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Update product
    const { error: productError } = await supabase
      .from('products')
      .update({
        name,
        brand,
        price,
        shop_url,
        image_url,
        description,
      })
      .eq('id', id);

    if (productError) {
      console.error('Product update error:', productError);
      return Response.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    console.log('Product updated:', id);

    // Update ingredients if provided
    if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
      // Delete existing ingredient links
      await supabase.from('product_ingredients').delete().eq('product_id', id);

      console.log('Deleted old ingredient links');

      // Add new ingredients
      for (let i = 0; i < ingredients.length; i++) {
        const ingredientName = ingredients[i];
        if (!ingredientName) continue;

        const normalized = ingredientName
          .toLowerCase()
          .replace(/[^가-힣a-zA-Z0-9]/g, '')
          .replace(/\s+/g, '');

        let { data: ingredient } = await supabase
          .from('ingredients')
          .select('id')
          .ilike('name_ko_normalized', normalized)
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
          await supabase
            .from('product_ingredients')
            .insert({
              product_id: id,
              ingredient_id: ingredient.id,
              position: i + 1,
            });

          console.log('Ingredient linked:', ingredientName);
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Unauthorized')
    ) {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.error('Admin product update error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Delete product_ingredients first (foreign key constraint)
    const { error: ingredientsError } = await supabase
      .from('product_ingredients')
      .delete()
      .eq('product_id', id);

    if (ingredientsError) {
      console.error('Failed to delete product ingredients:', ingredientsError);
    }

    // Delete scan_history if exists
    const { error: scanError } = await supabase
      .from('scan_history')
      .delete()
      .eq('product_id', id);

    if (scanError) {
      console.error('Failed to delete scan history:', scanError);
    }

    // Delete product
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (productError) {
      console.error('Product deletion error:', productError);
      return Response.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    console.log('Product deleted:', id);

    return Response.json({ success: true });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Unauthorized')
    ) {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.error('Admin product deletion error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
