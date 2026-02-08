import {
  createClient,
  createAdminClient,
} from '@/lib/supabase/server';
import { decrypt } from '@/lib/security/encryption';

export interface CompatibilityResult {
  compatible: boolean;
  warningLevel: 'safe' | 'warning' | 'danger';
  warnings: string[];
  concerns: Array<{
    type: 'allergy' | 'medication' | 'blacklist';
    ingredient: string;
    reason: string;
  }>;
}

function isEncrypted(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.split(':').length === 3 &&
    /^[a-f0-9]+:[a-f0-9]+:[a-f0-9]+$/i.test(value)
  );
}

function decryptField(value: unknown): string[] {
  if (value == null) return [];
  if (isEncrypted(value)) {
    try {
      return JSON.parse(decrypt(value));
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) return value;
  return [];
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^가-힣a-zA-Z0-9]/g, '')
    .replace(/\s+/g, '');
}

function matchesIngredient(
  ingredientNorm: string,
  ingredientName: string,
  checkNorm: string,
  checkName: string
): boolean {
  return (
    ingredientNorm.includes(checkNorm) ||
    checkNorm.includes(ingredientNorm) ||
    ingredientName.includes(checkName) ||
    checkName.includes(ingredientName)
  );
}

export async function checkProductCompatibility(
  productId: string,
  userId: string
): Promise<CompatibilityResult> {
  const result: CompatibilityResult = {
    compatible: true,
    warningLevel: 'safe',
    warnings: [],
    concerns: [],
  };

  try {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('health_profiles')
      .select('allergies, medications, blacklist_ingredients')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return result;
    }

    const allergies = decryptField(profile.allergies);
    const medications = decryptField(profile.medications);
    const blacklist = decryptField(profile.blacklist_ingredients);

    if (allergies.length === 0 && blacklist.length === 0) {
      return result;
    }

    const adminSupabase = createAdminClient();
    const { data: productIngredients } = await adminSupabase
      .from('product_ingredients')
      .select(
        `
        ingredient_id,
        ingredients (
          name_ko,
          name_ko_normalized
        )
      `
      )
      .eq('product_id', productId)
      .order('position');

    if (!productIngredients || productIngredients.length === 0) {
      return result;
    }

    for (const pi of productIngredients) {
      const ingredient = pi.ingredients as
        | { name_ko?: string; name_ko_normalized?: string }
        | null;
      if (!ingredient) continue;

      const ingredientName = ingredient.name_ko || '';
      const normalized =
        ingredient.name_ko_normalized ||
        normalize(ingredientName);

      for (const allergy of allergies) {
        const allergyNorm = normalize(allergy);
        if (
          matchesIngredient(normalized, ingredientName, allergyNorm, allergy)
        ) {
          result.compatible = false;
          result.warningLevel = 'danger';
          result.concerns.push({
            type: 'allergy',
            ingredient: ingredientName,
            reason: `알러지 성분: ${allergy}`,
          });
        }
      }

      for (const item of blacklist) {
        const itemNorm = normalize(item);
        if (
          matchesIngredient(normalized, ingredientName, itemNorm, item)
        ) {
          result.compatible = false;
          if (result.warningLevel !== 'danger') {
            result.warningLevel = 'warning';
          }
          result.concerns.push({
            type: 'blacklist',
            ingredient: ingredientName,
            reason: `피해야 할 성분: ${item}`,
          });
        }
      }

      for (const med of medications) {
        const medNorm = normalize(med);
        if (
          matchesIngredient(normalized, ingredientName, medNorm, med)
        ) {
          if (result.warningLevel !== 'danger') {
            result.warningLevel = 'warning';
          }
          result.concerns.push({
            type: 'medication',
            ingredient: ingredientName,
            reason: `복용 약물과 상호작용 가능: ${med}`,
          });
        }
      }
    }

    result.warnings = result.concerns.map(
      (c) => `${c.ingredient}: ${c.reason}`
    );
  } catch (error) {
    console.error('Ingredient analyzer error:', error);
    result.compatible = true;
    result.warningLevel = 'safe';
  }

  return result;
}

export async function checkMultipleProducts(
  productIds: string[],
  userId: string
): Promise<Map<string, CompatibilityResult>> {
  const map = new Map<string, CompatibilityResult>();

  await Promise.all(
    productIds.map(async (id) => {
      const result = await checkProductCompatibility(id, userId);
      map.set(id, result);
    })
  );

  return map;
}
