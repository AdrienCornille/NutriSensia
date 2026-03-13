import type { NutritionalProfile } from '@/types/nutritional-profile';

/**
 * Maps an active NutritionalProfile to the string-based form targets
 * used by MealPlanForm. Returns null if essential data is missing.
 */
export function mapProfileToFormTargets(
  profile: NutritionalProfile
): {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sodium: string;
} | null {
  if (profile.calculated_calories == null) return null;

  return {
    calories: Math.round(profile.calculated_calories).toString(),
    protein:
      profile.calculated_protein_g != null
        ? Math.round(profile.calculated_protein_g).toString()
        : '',
    carbs:
      profile.calculated_carbs_g != null
        ? Math.round(profile.calculated_carbs_g).toString()
        : '',
    fat:
      profile.calculated_fat_g != null
        ? Math.round(profile.calculated_fat_g).toString()
        : '',
    fiber:
      profile.micro_targets?.fiber_g != null
        ? profile.micro_targets.fiber_g.toString()
        : '',
    sodium:
      profile.micro_targets?.sodium_mg != null
        ? profile.micro_targets.sodium_mg.toString()
        : '',
  };
}
