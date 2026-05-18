// ============================================================================
// Recipe Allergen Analyzer
// Detects allergen-free badges from recipe ingredient data.
// Three confidence levels: guaranteed, uncertain, contains.
// Pure utility — no DB dependency.
// ============================================================================

export const TRACKED_ALLERGENS = [
  'gluten',
  'lactose',
  'oeuf',
  'arachide',
  'fruits-a-coque',
  'poisson-crustace',
  'soja',
] as const;

export type AllergenSlug = (typeof TRACKED_ALLERGENS)[number];

export const ALLERGEN_LABELS: Record<AllergenSlug, string> = {
  gluten: 'Sans gluten',
  lactose: 'Sans lactose',
  oeuf: 'Sans œuf',
  arachide: 'Sans arachide',
  'fruits-a-coque': 'Sans fruits à coque',
  'poisson-crustace': 'Sans poisson / crustacé',
  soja: 'Sans soja',
};

export type AllergenConfidence = 'guaranteed' | 'uncertain' | 'contains';

export interface AllergenResult {
  allergen: AllergenSlug;
  label: string;
  confidence: AllergenConfidence;
  /** Number of ingredients that contain this allergen */
  containsCount: number;
  /** Number of ingredients without CIQUAL link (could contain anything) */
  unknownCount: number;
}

export interface IngredientAllergenData {
  food_id: string | null;
  allergens: string[] | null; // from foods.allergens
}

/**
 * Analyze a recipe's ingredients to determine allergen-free badges.
 *
 * For each tracked allergen:
 * - "guaranteed" (green): all ingredients have CIQUAL data, none contains this allergen
 * - "uncertain" (yellow): no known ingredient contains it, but some lack CIQUAL data
 * - "contains" (red): at least one ingredient contains this allergen
 *
 * @param ingredients - array of { food_id, allergens } for each recipe ingredient
 * @returns array of AllergenResult for each tracked allergen
 */
export function analyzeAllergens(
  ingredients: IngredientAllergenData[]
): AllergenResult[] {
  if (ingredients.length === 0) return [];

  const unknownCount = ingredients.filter(i => !i.food_id).length;

  return TRACKED_ALLERGENS.map(allergen => {
    const containsCount = ingredients.filter(
      i => i.allergens && i.allergens.includes(allergen)
    ).length;

    let confidence: AllergenConfidence;
    if (containsCount > 0) {
      confidence = 'contains';
    } else if (unknownCount > 0) {
      confidence = 'uncertain';
    } else {
      confidence = 'guaranteed';
    }

    return {
      allergen,
      label: ALLERGEN_LABELS[allergen],
      confidence,
      containsCount,
      unknownCount,
    };
  });
}

/**
 * Convert allergen results to auto-tag values.
 * Only includes "Sans X" badges (guaranteed and uncertain).
 * "contains" allergens are NOT tagged (absence = contains).
 */
export function getAllergenAutoTags(
  results: AllergenResult[]
): { tag_group: string; tag_value: string }[] {
  return results
    .filter(r => r.confidence !== 'contains')
    .map(r => ({
      tag_group: 'allergen',
      tag_value:
        r.confidence === 'guaranteed'
          ? `sans-${r.allergen}`
          : `sans-${r.allergen}-uncertain`,
    }));
}
