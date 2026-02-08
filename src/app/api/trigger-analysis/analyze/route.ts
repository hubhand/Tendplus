import { getCurrentUserId, createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all trigger analyses for user
    const { data: analyses, error: analysesError } = await supabase
      .from('trigger_analysis')
      .select('id, product_id, reaction_type')
      .eq('user_id', userId);

    if (analysesError || !analyses || analyses.length === 0) {
      return Response.json({ suspects: [], safe: [] });
    }

    const goodProductIds = analyses
      .filter((a) => a.reaction_type === 'good')
      .map((a) => a.product_id);

    const badProductIds = analyses
      .filter((a) => a.reaction_type === 'bad')
      .map((a) => a.product_id);

    if (goodProductIds.length === 0 || badProductIds.length === 0) {
      return Response.json({ suspects: [], safe: [] });
    }

    // Get ingredients for good products
    const { data: goodIngredients } = await supabase
      .from('product_ingredients')
      .select(
        `
        ingredient_id,
        ingredients (
          id,
          name_ko
        )
      `
      )
      .in('product_id', goodProductIds);

    // Get ingredients for bad products
    const { data: badIngredients } = await supabase
      .from('product_ingredients')
      .select(
        `
        ingredient_id,
        ingredients (
          id,
          name_ko
        )
      `
      )
      .in('product_id', badProductIds);

    // Build sets
    const goodIngredientMap = new Map<
      string,
      { id: string; name: string; count: number }
    >();
    const badIngredientMap = new Map<
      string,
      { id: string; name: string; count: number }
    >();

    // Count good ingredients
    goodIngredients?.forEach(
      (pi: { ingredients?: { id: string; name_ko: string } | null }) => {
        const ingredient = pi.ingredients;
        if (!ingredient) return;

        const existing = goodIngredientMap.get(ingredient.id);
        if (existing) {
          existing.count++;
        } else {
          goodIngredientMap.set(ingredient.id, {
            id: ingredient.id,
            name: ingredient.name_ko,
            count: 1,
          });
        }
      }
    );

    // Count bad ingredients
    badIngredients?.forEach(
      (pi: { ingredients?: { id: string; name_ko: string } | null }) => {
        const ingredient = pi.ingredients;
        if (!ingredient) return;

        const existing = badIngredientMap.get(ingredient.id);
        if (existing) {
          existing.count++;
        } else {
          badIngredientMap.set(ingredient.id, {
            id: ingredient.id,
            name: ingredient.name_ko,
            count: 1,
          });
        }
      }
    );

    // Find suspects (in bad but not in good, or much higher in bad)
    const suspects: Array<{
      ingredient_id: string;
      ingredient_name: string;
      confidence_score: number;
      good_count: number;
      bad_count: number;
      total_good: number;
      total_bad: number;
    }> = [];
    const safe: string[] = [];

    badIngredientMap.forEach((badData, ingredientId) => {
      const goodData = goodIngredientMap.get(ingredientId);
      const badCount = badData.count;
      const goodCount = goodData?.count || 0;

      // Calculate confidence
      // Formula: (bad_ratio) * (1 - good_ratio)
      const badRatio = badCount / badProductIds.length;
      const goodRatio =
        goodProductIds.length > 0 ? goodCount / goodProductIds.length : 0;
      const confidence = badRatio * (1 - goodRatio);

      // Suspect if confidence > 0.3 (30%)
      if (confidence >= 0.3) {
        suspects.push({
          ingredient_id: ingredientId,
          ingredient_name: badData.name,
          confidence_score: confidence,
          good_count: goodCount,
          bad_count: badCount,
          total_good: goodProductIds.length,
          total_bad: badProductIds.length,
        });
      }
    });

    // Find safe ingredients (in good but not in bad)
    goodIngredientMap.forEach((goodData, ingredientId) => {
      const badData = badIngredientMap.get(ingredientId);
      if (!badData) {
        safe.push(goodData.name);
      }
    });

    // Sort suspects by confidence
    suspects.sort((a, b) => b.confidence_score - a.confidence_score);

    // Save to cache (trigger_suspects table)
    if (suspects.length > 0) {
      // Delete old suspects for this user
      await supabase
        .from('trigger_suspects')
        .delete()
        .eq('user_id', userId);

      // Insert new suspects
      const suspectsToInsert = suspects.map((s) => ({
        user_id: userId,
        ingredient_id: s.ingredient_id,
        ingredient_name: s.ingredient_name,
        confidence_score: s.confidence_score,
        good_count: s.good_count,
        bad_count: s.bad_count,
        total_good: s.total_good,
        total_bad: s.total_bad,
      }));

      await supabase.from('trigger_suspects').insert(suspectsToInsert);
    }

    console.log(
      `Analysis complete: ${suspects.length} suspects, ${safe.length} safe`
    );

    return Response.json({
      suspects: suspects.map(
        ({ ingredient_id, ...rest }) => rest
      ),
      safe: safe.slice(0, 20), // Limit safe ingredients to 20
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
