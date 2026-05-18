// ============================================================================
// Recipe Diet Analyzer
// Detects dietary compatibility (vegan, vegetarian, pescatarian, paleo)
// from recipe ingredient origins.
// Pure utility — no DB dependency, usable both server-side and client-side
// ============================================================================

export type FoodOrigin =
  | 'animal'
  | 'dairy'
  | 'egg'
  | 'fish'
  | 'seafood'
  | 'plant'
  | 'mixed'
  | 'unknown';

export type DietType = 'vegan' | 'vegetarien' | 'pesco-vegetarien' | 'paleo';

export interface DietSuggestion {
  diet: DietType;
  confident: boolean; // false if any ingredient is 'mixed' or 'unknown'
  reason: string;
}

export const DIET_TAG_LABELS: Record<DietType, string> = {
  vegan: 'Végan',
  vegetarien: 'Végétarien',
  'pesco-vegetarien': 'Pesco-végétarien',
  paleo: 'Paléo',
};

// These origins are NOT compatible with each diet
const DIET_EXCLUSIONS: Record<DietType, FoodOrigin[]> = {
  vegan: ['animal', 'dairy', 'egg', 'fish', 'seafood'],
  vegetarien: ['animal', 'fish', 'seafood'],
  'pesco-vegetarien': ['animal'],
  paleo: ['dairy'], // paleo also excludes grains/legumes but we can't detect that from origin alone
};

/**
 * Analyze a recipe's ingredients to suggest compatible diets.
 *
 * @param ingredientOrigins - array of origin_type for each ingredient
 * @returns array of DietSuggestion, from most restrictive (vegan) to least
 */
export function analyzeDietCompatibility(
  ingredientOrigins: FoodOrigin[]
): DietSuggestion[] {
  if (ingredientOrigins.length === 0) return [];

  const hasMixed = ingredientOrigins.includes('mixed');
  const hasUnknown = ingredientOrigins.includes('unknown');
  const uncertain = hasMixed || hasUnknown;

  // Filter out mixed/unknown for exclusion checks — they can't disqualify
  // but they make the result "not confident"
  const knownOrigins = ingredientOrigins.filter(
    o => o !== 'mixed' && o !== 'unknown'
  );

  const suggestions: DietSuggestion[] = [];

  for (const [diet, exclusions] of Object.entries(DIET_EXCLUSIONS) as [
    DietType,
    FoodOrigin[],
  ][]) {
    const hasExcluded = knownOrigins.some(origin =>
      exclusions.includes(origin)
    );

    if (!hasExcluded) {
      let reason: string;
      if (diet === 'vegan') {
        reason = "Aucun ingrédient d'origine animale détecté";
      } else if (diet === 'vegetarien') {
        reason = 'Pas de viande, poisson ou crustacés';
      } else if (diet === 'pesco-vegetarien') {
        reason = 'Pas de viande terrestre';
      } else {
        reason = 'Compatible paléo (pas de produits laitiers)';
      }

      suggestions.push({
        diet,
        confident: !uncertain,
        reason,
      });
    }
  }

  return suggestions;
}

/**
 * Convert diet suggestions to recipe_tag_assignments-compatible tag slugs.
 * Only returns the most specific compatible diets.
 * E.g., if vegan, don't also return vegetarian (it's implied).
 */
export function getDietTagSlugs(suggestions: DietSuggestion[]): string[] {
  const diets = suggestions.map(s => s.diet);

  // Return most specific only
  if (diets.includes('vegan')) return ['vegan'];
  if (diets.includes('vegetarien')) return ['vegetarien'];
  if (diets.includes('pesco-vegetarien')) return ['pesco-vegetarien'];

  // Paleo is independent, can coexist with others
  const result: string[] = [];
  if (diets.includes('paleo')) result.push('paleo');

  return result;
}
