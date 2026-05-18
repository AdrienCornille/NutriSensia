// ============================================================================
// Recipe Auto-Tags: computed badges for calories, time, and nutrition profile
// Pure utility — no DB dependency, usable both server-side and client-side
// ============================================================================

// ── Auto-tag value constants ──

export const CALORIE_TAGS = {
  'cal-lt-200': { label: '< 200 kcal', min: 0, max: 200 },
  'cal-200-300': { label: '200-300 kcal', min: 200, max: 300 },
  'cal-300-400': { label: '300-400 kcal', min: 300, max: 400 },
  'cal-400-500': { label: '400-500 kcal', min: 400, max: 500 },
  'cal-500-600': { label: '500-600 kcal', min: 500, max: 600 },
  'cal-gt-600': { label: '+ 600 kcal', min: 600, max: Infinity },
} as const;

export const TIME_TAGS = {
  'time-lt-15': { label: '< 15 min', max: 15 },
  'time-lt-30': { label: '< 30 min', max: 30 },
  'time-lt-45': { label: '< 45 min', max: 45 },
  'time-lt-60': { label: '< 1 heure', max: 60 },
  'time-gt-60': { label: '> 1 heure', max: Infinity },
} as const;

export const NUTRITION_TAGS = {
  'low-carb': { label: 'Low carb', description: '< 25% glucides' },
  'high-protein': {
    label: 'Riche en protéines',
    description: '> 30% protéines',
  },
  'low-fat': { label: 'Low fat', description: '< 20% lipides' },
  'high-fiber': { label: 'Riche en fibres', description: '> 6g / portion' },
} as const;

// ── Tag group config (single source of truth for display) ──

export type TagGroupSlug =
  | 'calories'
  | 'time'
  | 'nutrition'
  | 'meal-type'
  | 'flavor'
  | 'everyday'
  | 'healthy-treats'
  | 'season'
  | 'cuisine'
  | 'occasion'
  | 'wellness'
  | 'diet'
  | 'allergen';

export interface TagGroupConfig {
  slug: TagGroupSlug;
  label: string;
  color: string;
  autoComputed: boolean;
  phase: number;
}

export const TAG_GROUP_CONFIG: TagGroupConfig[] = [
  // Auto-computed (Phase 1)
  {
    slug: 'calories',
    label: 'Calories',
    color: '#F97316',
    autoComputed: true,
    phase: 1,
  },
  {
    slug: 'time',
    label: 'Temps total',
    color: '#3B82F6',
    autoComputed: true,
    phase: 1,
  },
  {
    slug: 'nutrition',
    label: 'Profil nutritionnel',
    color: '#22C55E',
    autoComputed: true,
    phase: 1,
  },
  // Manual (Phase 1)
  {
    slug: 'meal-type',
    label: 'Type de repas',
    color: '#8B5CF6',
    autoComputed: false,
    phase: 1,
  },
  {
    slug: 'flavor',
    label: 'Saveurs',
    color: '#EC4899',
    autoComputed: false,
    phase: 1,
  },
  {
    slug: 'everyday',
    label: 'Quotidien',
    color: '#6B7280',
    autoComputed: false,
    phase: 1,
  },
  {
    slug: 'healthy-treats',
    label: 'Plaisirs healthy',
    color: '#6366F1',
    autoComputed: false,
    phase: 1,
  },
  {
    slug: 'season',
    label: 'Saison',
    color: '#14B8A6',
    autoComputed: false,
    phase: 1,
  },
  {
    slug: 'cuisine',
    label: 'Cuisine du monde',
    color: '#F59E0B',
    autoComputed: false,
    phase: 1,
  },
  {
    slug: 'occasion',
    label: 'Occasion',
    color: '#F472B6',
    autoComputed: false,
    phase: 1,
  },
  {
    slug: 'wellness',
    label: 'Bien-être & énergie',
    color: '#10B981',
    autoComputed: false,
    phase: 1,
  },
  // Future phases
  {
    slug: 'diet',
    label: 'Courant alimentaire',
    color: '#059669',
    autoComputed: false,
    phase: 2,
  },
  {
    slug: 'allergen',
    label: 'Allergènes',
    color: '#16A34A',
    autoComputed: false,
    phase: 3,
  }, // green = allergen-free
];

export const TAG_GROUP_MAP = Object.fromEntries(
  TAG_GROUP_CONFIG.map(g => [g.slug, g])
) as Record<TagGroupSlug, TagGroupConfig>;

// ── All auto-tag labels (for display) ──

export const DIET_AUTO_TAGS: Record<
  string,
  { label: string; description: string }
> = {
  vegan: { label: 'Végan', description: 'Aucun ingrédient animal' },
  'vegan-uncertain': {
    label: 'Végan ?',
    description: 'Probable — ingrédients mixtes/inconnus',
  },
  vegetarien: { label: 'Végétarien', description: 'Pas de viande ni poisson' },
  'vegetarien-uncertain': {
    label: 'Végétarien ?',
    description: 'Probable — ingrédients mixtes/inconnus',
  },
  'pesco-vegetarien': {
    label: 'Pesco-végétarien',
    description: 'Pas de viande terrestre',
  },
  'pesco-vegetarien-uncertain': {
    label: 'Pesco-vég ?',
    description: 'Probable — ingrédients mixtes/inconnus',
  },
  paleo: { label: 'Paléo', description: 'Pas de produits laitiers' },
  'paleo-uncertain': {
    label: 'Paléo ?',
    description: 'Probable — ingrédients mixtes/inconnus',
  },
};

export const ALLERGEN_AUTO_TAGS: Record<string, { label: string }> = {
  'sans-gluten': { label: 'Sans gluten' },
  'sans-gluten-uncertain': { label: 'Sans gluten ?' },
  'sans-lactose': { label: 'Sans lactose' },
  'sans-lactose-uncertain': { label: 'Sans lactose ?' },
  'sans-oeuf': { label: 'Sans œuf' },
  'sans-oeuf-uncertain': { label: 'Sans œuf ?' },
  'sans-arachide': { label: 'Sans arachide' },
  'sans-arachide-uncertain': { label: 'Sans arachide ?' },
  'sans-fruits-a-coque': { label: 'Sans fruits à coque' },
  'sans-fruits-a-coque-uncertain': { label: 'Sans fruits à coque ?' },
  'sans-poisson-crustace': { label: 'Sans poisson / crustacé' },
  'sans-poisson-crustace-uncertain': { label: 'Sans poisson / crustacé ?' },
  'sans-soja': { label: 'Sans soja' },
  'sans-soja-uncertain': { label: 'Sans soja ?' },
};

export const AUTO_TAG_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(CALORIE_TAGS).map(([k, v]) => [k, v.label])
  ),
  ...Object.fromEntries(
    Object.entries(TIME_TAGS).map(([k, v]) => [k, v.label])
  ),
  ...Object.fromEntries(
    Object.entries(NUTRITION_TAGS).map(([k, v]) => [k, v.label])
  ),
  ...Object.fromEntries(
    Object.entries(DIET_AUTO_TAGS).map(([k, v]) => [k, v.label])
  ),
  ...Object.fromEntries(
    Object.entries(ALLERGEN_AUTO_TAGS).map(([k, v]) => [k, v.label])
  ),
};

// ── Computation functions ──

export interface AutoTag {
  tag_group: string;
  tag_value: string;
}

/**
 * Compute calorie range tag from total recipe calories and servings.
 * Returns null if calories data is missing.
 */
export function computeCalorieTag(
  caloriesTotal: number | null | undefined,
  servings: number
): string | null {
  if (caloriesTotal == null || caloriesTotal <= 0 || servings <= 0) return null;
  const perServing = caloriesTotal / servings;

  for (const [key, { min, max }] of Object.entries(CALORIE_TAGS)) {
    if (perServing >= min && perServing < max) return key;
  }
  return 'cal-gt-600';
}

/**
 * Compute time bracket tag from prep + cook time.
 */
export function computeTimeTag(prepTime: number, cookTime: number): string {
  const total = prepTime + cookTime;
  if (total <= 15) return 'time-lt-15';
  if (total <= 30) return 'time-lt-30';
  if (total <= 45) return 'time-lt-45';
  if (total <= 60) return 'time-lt-60';
  return 'time-gt-60';
}

/**
 * Compute nutrition profile tags from macros.
 * Uses the Atwater factors: protein=4kcal/g, carbs=4kcal/g, fat=9kcal/g.
 */
export function computeNutritionTags(
  macros: {
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    fiberG: number | null;
  },
  servings: number
): string[] {
  const tags: string[] = [];

  const cal = macros.calories;
  const prot = macros.proteinG;
  const carbs = macros.carbsG;
  const fat = macros.fatG;
  const fiber = macros.fiberG;

  if (cal == null || cal <= 0) return tags;

  if (prot != null) {
    const protPct = ((prot * 4) / cal) * 100;
    if (protPct > 30) tags.push('high-protein');
  }

  if (carbs != null) {
    const carbPct = ((carbs * 4) / cal) * 100;
    if (carbPct < 25) tags.push('low-carb');
  }

  if (fat != null) {
    const fatPct = ((fat * 9) / cal) * 100;
    if (fatPct < 20) tags.push('low-fat');
  }

  if (fiber != null && servings > 0) {
    const fiberPerServing = fiber / servings;
    if (fiberPerServing > 6) tags.push('high-fiber');
  }

  return tags;
}

/**
 * Compute all auto-tags for a recipe.
 */
export function computeAllAutoTags(recipe: {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
}): AutoTag[] {
  const tags: AutoTag[] = [];

  // Time
  tags.push({
    tag_group: 'time',
    tag_value: computeTimeTag(recipe.prepTimeMinutes, recipe.cookTimeMinutes),
  });

  // Calories
  const calTag = computeCalorieTag(recipe.calories, recipe.servings);
  if (calTag) {
    tags.push({ tag_group: 'calories', tag_value: calTag });
  }

  // Nutrition profile
  const nutriTags = computeNutritionTags(
    {
      calories: recipe.calories,
      proteinG: recipe.proteinG,
      carbsG: recipe.carbsG,
      fatG: recipe.fatG,
      fiberG: recipe.fiberG,
    },
    recipe.servings
  );
  for (const t of nutriTags) {
    tags.push({ tag_group: 'nutrition', tag_value: t });
  }

  return tags;
}
