/**
 * Adapter module: converts DB types (nutritionist-dossier.ts) to UI types (meal-plan.ts)
 * Used by the patient-side meal plan page to display real data from the API.
 */

import type {
  MealPlanDay,
  MealPlanMeal,
  MealPlanFood,
  MealPlanAlternative,
  NutritionalTargets,
  MealType,
} from '@/types/nutritionist-dossier';
import type {
  PlanMealType,
  PlanFood,
  PlanMeal,
  DailyPlanData,
  DailyTargets,
  Micronutrient,
  WeekDay,
  WeeklyPlanData,
  WeeklyDayData,
  MealSummary,
  FoodAlternative,
  PlanInfo,
  PlanCreator,
  ModificationRequestData,
  ModificationRequestStatus,
  ShoppingList,
  ShoppingItem,
  ShoppingCategory,
} from '@/types/meal-plan';
import { mealTypeConfig } from '@/types/meal-plan';

// ============================================================================
// Meal type mapping (DB English → UI French)
// ============================================================================

const MEAL_TYPE_MAP: Record<MealType, PlanMealType> = {
  breakfast: 'petit-dejeuner',
  morning_snack: 'collation',
  lunch: 'dejeuner',
  afternoon_snack: 'collation',
  dinner: 'diner',
  evening_snack: 'collation',
};

export function mapMealTypeToUI(dbType: MealType): PlanMealType {
  return MEAL_TYPE_MAP[dbType] || 'collation';
}

// ============================================================================
// Food mapping
// ============================================================================

export function mapFoodToUI(
  food: MealPlanFood,
  alternatives?: MealPlanAlternative[]
): PlanFood {
  return {
    id: food.id,
    name: food.custom_name || 'Aliment',
    quantity: `${food.quantity} ${food.unit}`,
    calories: food.calories || 0,
    protein: food.protein_g || 0,
    carbs: food.carbs_g || 0,
    fat: food.fat_g || 0,
    fiber: food.fiber_g ?? undefined,
    alternatives: alternatives?.map(mapAlternativeToUI),
  };
}

function mapAlternativeToUI(alt: MealPlanAlternative): FoodAlternative {
  return {
    id: alt.id,
    name: alt.alternative_name,
    quantity: '',
    calories: alt.calories,
    protein: alt.protein_g,
    carbs: alt.carbs_g,
    fat: alt.fat_g,
  };
}

// ============================================================================
// Meal mapping
// ============================================================================

function mapMealToUI(meal: MealPlanMeal, altsByFoodId?: Record<string, MealPlanAlternative[]>): PlanMeal {
  const uiType = mapMealTypeToUI(meal.meal_type);
  const config = mealTypeConfig[uiType];

  return {
    id: meal.id,
    type: uiType,
    label: config.label,
    icon: config.icon,
    time: meal.suggested_time || config.defaultTime,
    targetCalories: 0,
    foods: (meal.foods || []).map(f =>
      mapFoodToUI(f, altsByFoodId?.[f.id])
    ),
    alternatives: meal.notes || undefined,
  };
}

function createEmptyMeal(type: PlanMealType): PlanMeal {
  const config = mealTypeConfig[type];
  return {
    id: `empty-${type}`,
    type,
    label: config.label,
    icon: config.icon,
    time: config.defaultTime,
    targetCalories: 0,
    foods: [],
  };
}

// ============================================================================
// Day → DailyPlanData
// ============================================================================

export function mapDayToDaily(
  day: MealPlanDay,
  targets: NutritionalTargets | null,
  altsByFoodId?: Record<string, MealPlanAlternative[]>
): DailyPlanData {
  const meals: Record<PlanMealType, PlanMeal> = {} as Record<PlanMealType, PlanMeal>;

  // Only include slots that have actual meals from the nutritionist
  for (const dbMeal of day.meals || []) {
    const uiType = mapMealTypeToUI(dbMeal.meal_type);
    const mapped = mapMealToUI(dbMeal, altsByFoodId);

    if (!meals[uiType]) {
      // First meal for this slot
      meals[uiType] = mapped;
    } else {
      // Merge foods into existing slot (multiple snacks)
      meals[uiType] = {
        ...meals[uiType],
        foods: [...meals[uiType].foods, ...mapped.foods],
      };
    }
  }

  return {
    date: day.date ? new Date(day.date + 'T00:00:00') : new Date(),
    targets: mapTargetsToUI(targets),
    meals,
    micronutrients: buildMicronutrientsFromDay(day),
  };
}

// ============================================================================
// Nutritional targets
// ============================================================================

export function mapTargetsToUI(targets: NutritionalTargets | null): DailyTargets {
  return {
    calories: targets?.calories || 2000,
    protein: targets?.protein || 100,
    carbs: targets?.carbs || 250,
    fat: targets?.fat || 70,
    fiber: targets?.fiber || 30,
    sodium: targets?.sodium || 2300,
  };
}

// ============================================================================
// Micronutrients
// ============================================================================

interface MicroRDI {
  name: string;
  key: string;
  target: number;
  unit: string;
}

const MICRO_RDIS: MicroRDI[] = [
  // Vitamines
  { name: 'Vitamine A', key: 'vitamin_a', target: 800, unit: 'µg' },
  { name: 'Vitamine C', key: 'vitamin_c', target: 90, unit: 'mg' },
  { name: 'Vitamine D', key: 'vitamin_d', target: 15, unit: 'µg' },
  { name: 'Vitamine E', key: 'vitamin_e', target: 15, unit: 'mg' },
  { name: 'Vitamine K', key: 'vitamin_k', target: 90, unit: 'µg' },
  { name: 'Vit. B1 (Thiamine)', key: 'vitamin_b1', target: 1.2, unit: 'mg' },
  { name: 'Vit. B2 (Riboflavine)', key: 'vitamin_b2', target: 1.3, unit: 'mg' },
  { name: 'Vit. B3 (Niacine)', key: 'vitamin_b3', target: 16, unit: 'mg' },
  { name: 'Vitamine B6', key: 'vitamin_b6', target: 1.3, unit: 'mg' },
  { name: 'Vit. B9 (Folate)', key: 'vitamin_b9', target: 330, unit: 'µg' },
  { name: 'Vitamine B12', key: 'vitamin_b12', target: 2.4, unit: 'µg' },
  // Minéraux
  { name: 'Calcium', key: 'calcium', target: 1000, unit: 'mg' },
  { name: 'Fer', key: 'iron', target: 14, unit: 'mg' },
  { name: 'Magnésium', key: 'magnesium', target: 400, unit: 'mg' },
  { name: 'Phosphore', key: 'phosphorus', target: 700, unit: 'mg' },
  { name: 'Zinc', key: 'zinc', target: 11, unit: 'mg' },
  { name: 'Potassium', key: 'potassium', target: 3500, unit: 'mg' },
  { name: 'Sodium', key: 'sodium', target: 2300, unit: 'mg' },
];

export function buildMicronutrientsFromDay(day: MealPlanDay): Micronutrient[] {
  // Aggregate micronutrients from all foods across all meals
  const totals: Record<string, number> = {};

  for (const meal of day.meals || []) {
    for (const food of meal.foods || []) {
      const micro = food.micronutrients;
      if (!micro) continue;
      for (const rdi of MICRO_RDIS) {
        const val = (micro as unknown as Record<string, number | null>)[rdi.key];
        if (val != null) {
          totals[rdi.key] = (totals[rdi.key] || 0) + val;
        }
      }
    }
  }

  return MICRO_RDIS.map(rdi => {
    const value = Math.round((totals[rdi.key] || 0) * 10) / 10;
    const ratio = rdi.target > 0 ? value / rdi.target : 0;
    return {
      id: rdi.key,
      name: rdi.name,
      value,
      target: rdi.target,
      unit: rdi.unit,
      status: ratio >= 0.8 ? 'good' : ratio >= 0.5 ? 'warning' : 'low',
    };
  });
}

// ============================================================================
// Week days from plan dates
// ============================================================================

const DAY_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAY_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export function buildWeekDaysFromPlan(startDate: string, numDays: number): WeekDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: WeekDay[] = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();

    days.push({
      short: DAY_SHORT[dow],
      full: DAY_FULL[dow],
      date: d.getDate().toString(),
      dayNumber: d.getDate(),
      isToday: d.getTime() === today.getTime(),
      dateObj: d,
    });
  }

  return days;
}

// ============================================================================
// Weekly data
// ============================================================================

export function mapDaysToWeekly(
  days: MealPlanDay[],
  weekDays: WeekDay[],
  targets: NutritionalTargets | null
): WeeklyPlanData {
  const uiTargets = mapTargetsToUI(targets);

  const weeklyDays: WeeklyDayData[] = days.map((day, i) => {
    const mealSummaries: Record<PlanMealType, MealSummary> = {
      'petit-dejeuner': { summary: '', calories: 0 },
      dejeuner: { summary: '', calories: 0 },
      collation: { summary: '', calories: 0 },
      diner: { summary: '', calories: 0 },
    };

    for (const meal of day.meals || []) {
      const slot = mapMealTypeToUI(meal.meal_type);
      const foodNames = (meal.foods || [])
        .slice(0, 2)
        .map(f => f.custom_name || 'Aliment')
        .join(', ');
      const cals = (meal.foods || []).reduce((sum, f) => sum + (f.calories || 0), 0);

      if (mealSummaries[slot].summary) {
        mealSummaries[slot].summary += `, ${foodNames}`;
        mealSummaries[slot].calories += cals;
      } else {
        mealSummaries[slot] = { summary: foodNames, calories: cals };
      }
    }

    const totalCalories = Object.values(mealSummaries).reduce((s, m) => s + m.calories, 0);

    return {
      day: weekDays[i] || {
        short: day.day_name?.slice(0, 3) || `J${i + 1}`,
        full: day.day_name || `Jour ${i + 1}`,
        date: day.date?.split('-')[2] || '',
        dayNumber: day.day_number,
        isToday: false,
        dateObj: day.date ? new Date(day.date + 'T00:00:00') : new Date(),
      },
      meals: mealSummaries,
      totalCalories,
    };
  });

  const start = weekDays[0]?.dateObj || new Date();
  const end = weekDays[weekDays.length - 1]?.dateObj || new Date();

  return {
    weekStart: start,
    weekEnd: end,
    days: weeklyDays,
    targets: uiTargets,
  };
}

// ============================================================================
// Plan info
// ============================================================================

export interface PatientPlanResponse {
  id: string;
  name: string;
  objective: string | null;
  description: string | null;
  status: string;
  start_date: string;
  end_date: string;
  nutritional_targets: NutritionalTargets | null;
  meal_types: MealType[] | null;
  updated_at: string;
  days_count: number;
  nutritionist_name: string | null;
}

export function mapPlanToInfo(plan: PatientPlanResponse): PlanInfo {
  const nutName = plan.nutritionist_name || 'Nutritionniste';
  const initials = nutName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const creator: PlanCreator = {
    name: nutName,
    initials,
    role: 'nutritionist',
  };

  return {
    id: plan.id,
    creator,
    lastUpdated: new Date(plan.updated_at),
    objective: plan.objective || 'Plan alimentaire personnalisé',
    isActive: plan.status === 'active',
    weekStart: new Date(plan.start_date + 'T00:00:00'),
    weekEnd: new Date(plan.end_date + 'T00:00:00'),
  };
}

// ============================================================================
// Modification requests
// ============================================================================

export interface DBModificationRequest {
  id: string;
  title: string;
  description: string;
  request_type: string;
  suggested_alternative: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  response: string | null;
  responded_at: string | null;
  created_at: string;
}

const MOD_STATUS_MAP: Record<string, ModificationRequestStatus> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  implemented: 'approved',
};

export function mapModRequestToUI(req: DBModificationRequest): ModificationRequestData {
  return {
    id: req.id,
    createdAt: new Date(req.created_at),
    mealLabel: req.title,
    food: req.suggested_alternative || undefined,
    reason: req.description,
    status: MOD_STATUS_MAP[req.status] || 'pending',
    nutritionistResponse: req.response || undefined,
    respondedAt: req.responded_at ? new Date(req.responded_at) : undefined,
  };
}

// ============================================================================
// Shopping list
// ============================================================================

interface DBShoppingItem {
  food_id: string | null;
  name: string;
  total_quantity: number;
  unit: string;
  category: string | null;
}

const CATEGORY_KEYWORDS: Record<ShoppingCategory, string[]> = {
  legumes: ['légume', 'legume', 'salade', 'tomate', 'carotte', 'courgette', 'poivron', 'oignon', 'épinard', 'brocoli', 'haricot vert', 'chou'],
  fruits: ['fruit', 'pomme', 'banane', 'orange', 'fraise', 'raisin', 'poire', 'kiwi', 'mangue', 'citron'],
  'viandes-poissons': ['viande', 'poisson', 'poulet', 'boeuf', 'bœuf', 'porc', 'saumon', 'thon', 'dinde', 'jambon', 'oeuf', 'œuf', 'agneau'],
  'produits-laitiers': ['lait', 'fromage', 'yaourt', 'yogourt', 'beurre', 'crème', 'laitier'],
  'feculents-cereales': ['riz', 'pâte', 'pain', 'céréale', 'cereale', 'semoule', 'quinoa', 'avoine', 'blé', 'farine', 'pomme de terre', 'patate'],
  oleagineux: ['noix', 'amande', 'noisette', 'graine', 'cacahuète', 'pistache', 'cajou'],
  'huiles-condiments': ['huile', 'vinaigre', 'sauce', 'sel', 'poivre', 'épice', 'moutarde', 'mayonnaise', 'ketchup', 'miel', 'sucre'],
  autres: [],
};

function classifyCategory(name: string, dbCategory: string | null): ShoppingCategory {
  const lower = (name + ' ' + (dbCategory || '')).toLowerCase();

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ShoppingCategory, string[]][]) {
    if (cat === 'autres') continue;
    for (const kw of keywords) {
      if (lower.includes(kw)) return cat;
    }
  }

  return 'autres';
}

export function mapShoppingListToUI(
  dbItems: DBShoppingItem[],
  weekStart: Date,
  weekEnd: Date
): ShoppingList {
  const itemsByCategory: Record<ShoppingCategory, ShoppingItem[]> = {
    legumes: [],
    fruits: [],
    'viandes-poissons': [],
    'produits-laitiers': [],
    'feculents-cereales': [],
    oleagineux: [],
    'huiles-condiments': [],
    autres: [],
  };

  dbItems.forEach((item, i) => {
    const cat = classifyCategory(item.name, item.category);
    itemsByCategory[cat].push({
      id: item.food_id || `item-${i}`,
      name: item.name,
      category: cat,
      quantity: `${item.total_quantity} ${item.unit}`,
      weeklyQuantity: `${item.total_quantity} ${item.unit}`,
      occurrences: 1,
      checked: false,
    });
  });

  const categories = (Object.entries(itemsByCategory) as [ShoppingCategory, ShoppingItem[]][])
    .filter(([, items]) => items.length > 0)
    .map(([category, items]) => ({ category, items }));

  const totalItems = dbItems.length;

  return { weekStart, weekEnd, categories, totalItems };
}

// ============================================================================
// Week range formatter
// ============================================================================

export function formatWeekRangeFromPlan(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  return `${start.toLocaleDateString('fr-FR', opts)} - ${end.toLocaleDateString('fr-FR', opts)} ${end.getFullYear()}`;
}
