/**
 * Mock data for the Meals History feature
 * Provides sample meal history data for development
 */

import type { MealType, SelectedFood, NutritionValues, MealContext } from '@/types/meals';
import type {
  LoggedMeal,
  DailyMealsData,
  WeekDayData,
  WeeklyMealsData,
  MealsListGroup,
  MealsListData,
  DailySummaryData,
  PlanComparisonData,
} from '@/types/meals-history';

// ==================== HELPER FUNCTIONS ====================

function createDate(daysOffset: number, hours: number = 0, minutes: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function createFood(
  id: string,
  name: string,
  quantity: number,
  nutrition: NutritionValues
): SelectedFood {
  return {
    id,
    name,
    caloriesPer100g: Math.round((nutrition.calories / quantity) * 100),
    proteinPer100g: Math.round((nutrition.protein / quantity) * 100 * 10) / 10,
    carbsPer100g: Math.round((nutrition.carbs / quantity) * 100 * 10) / 10,
    fatPer100g: Math.round((nutrition.fat / quantity) * 100 * 10) / 10,
    quantity,
    unit: 'g',
    calculatedNutrition: nutrition,
  };
}

function sumNutrition(foods: SelectedFood[]): NutritionValues {
  return foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calculatedNutrition.calories,
      protein: acc.protein + food.calculatedNutrition.protein,
      carbs: acc.carbs + food.calculatedNutrition.carbs,
      fat: acc.fat + food.calculatedNutrition.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function createMeal(
  id: string,
  type: MealType,
  loggedAt: Date,
  foods: SelectedFood[],
  photoUrl?: string | null,
  notes?: string,
  contextTags: MealContext[] = ['home']
): LoggedMeal {
  return {
    id,
    userId: 'user-1',
    type,
    loggedAt,
    foods,
    totalNutrition: sumNutrition(foods),
    photoUrl: photoUrl ?? null,
    notes,
    contextTags,
    createdAt: loggedAt,
    updatedAt: loggedAt,
  };
}

// ==================== MOCK FOODS ====================

const breakfastFoods1: SelectedFood[] = [
  createFood('food-1', "Flocons d'avoine", 60, { calories: 228, protein: 8, carbs: 40, fat: 4 }),
  createFood('food-2', "Lait d'amande", 200, { calories: 26, protein: 1, carbs: 0, fat: 2 }),
  createFood('food-3', 'Banane', 120, { calories: 105, protein: 1, carbs: 27, fat: 0 }),
  createFood('food-4', 'Beurre de cacahuete', 15, { calories: 94, protein: 4, carbs: 3, fat: 8 }),
];

const lunchFoods1: SelectedFood[] = [
  createFood('food-5', 'Blanc de poulet grille', 150, { calories: 248, protein: 46, carbs: 0, fat: 5 }),
  createFood('food-6', 'Riz basmati', 180, { calories: 234, protein: 5, carbs: 52, fat: 0 }),
  createFood('food-7', 'Brocoli vapeur', 150, { calories: 52, protein: 4, carbs: 10, fat: 1 }),
  createFood('food-8', "Huile d'olive", 10, { calories: 88, protein: 0, carbs: 0, fat: 10 }),
];

const dinnerFoods1: SelectedFood[] = [
  createFood('food-9', 'Saumon grille', 150, { calories: 280, protein: 35, carbs: 0, fat: 15 }),
  createFood('food-10', 'Quinoa', 150, { calories: 180, protein: 6, carbs: 32, fat: 3 }),
  createFood('food-11', 'Asperges', 100, { calories: 20, protein: 2, carbs: 4, fat: 0 }),
];

const snackFoods1: SelectedFood[] = [
  createFood('food-12', 'Yaourt grec 0%', 170, { calories: 100, protein: 17, carbs: 6, fat: 0 }),
  createFood('food-13', 'Myrtilles', 80, { calories: 46, protein: 1, carbs: 12, fat: 0 }),
];

const breakfastFoods2: SelectedFood[] = [
  createFood('food-14', 'Oeufs brouilles', 150, { calories: 220, protein: 15, carbs: 2, fat: 17 }),
  createFood('food-15', 'Toast complet', 60, { calories: 150, protein: 5, carbs: 28, fat: 2 }),
  createFood('food-16', 'Avocat', 50, { calories: 80, protein: 1, carbs: 4, fat: 7 }),
];

const lunchFoods2: SelectedFood[] = [
  createFood('food-17', 'Salade Cesar', 250, { calories: 380, protein: 18, carbs: 12, fat: 28 }),
  createFood('food-18', 'Pain complet', 50, { calories: 120, protein: 4, carbs: 22, fat: 2 }),
];

const dinnerFoods2: SelectedFood[] = [
  createFood('food-19', 'Pates completes', 180, { calories: 320, protein: 12, carbs: 62, fat: 3 }),
  createFood('food-20', 'Sauce tomate maison', 100, { calories: 45, protein: 2, carbs: 10, fat: 0 }),
  createFood('food-21', 'Parmesan', 20, { calories: 80, protein: 7, carbs: 0, fat: 6 }),
];

const snackFoods2: SelectedFood[] = [
  createFood('food-22', 'Amandes', 30, { calories: 175, protein: 6, carbs: 6, fat: 15 }),
  createFood('food-23', 'Pomme', 150, { calories: 78, protein: 0, carbs: 21, fat: 0 }),
];

// ==================== MOCK LOGGED MEALS ====================

// Today's meals
const todayBreakfast = createMeal(
  'meal-today-breakfast',
  'breakfast',
  createDate(0, 7, 30),
  breakfastFoods1,
  '/images/meals/breakfast-1.jpg',
  'Delicieux petit-dejeuner energetique',
  ['home']
);

const todayLunch = createMeal(
  'meal-today-lunch',
  'lunch',
  createDate(0, 12, 30),
  lunchFoods1,
  '/images/meals/lunch-1.jpg',
  'Repas equilibre au bureau',
  ['work']
);

const todaySnack = createMeal(
  'meal-today-snack',
  'snack',
  createDate(0, 16, 0),
  snackFoods1,
  null,
  '',
  ['work']
);

// Yesterday's meals
const yesterdayBreakfast = createMeal(
  'meal-yesterday-breakfast',
  'breakfast',
  createDate(-1, 8, 0),
  breakfastFoods2,
  null,
  '',
  ['home']
);

const yesterdayLunch = createMeal(
  'meal-yesterday-lunch',
  'lunch',
  createDate(-1, 12, 15),
  lunchFoods2,
  '/images/meals/lunch-2.jpg',
  '',
  ['restaurant']
);

const yesterdaySnack = createMeal(
  'meal-yesterday-snack',
  'snack',
  createDate(-1, 16, 0),
  snackFoods2,
  null,
  '',
  ['work']
);

const yesterdayDinner = createMeal(
  'meal-yesterday-dinner',
  'dinner',
  createDate(-1, 19, 30),
  dinnerFoods1,
  '/images/meals/dinner-1.jpg',
  'Diner en famille',
  ['home', 'family']
);

// Day before yesterday's meals
const dayBeforeDinner = createMeal(
  'meal-daybefore-dinner',
  'dinner',
  createDate(-2, 20, 0),
  dinnerFoods2,
  '/images/meals/dinner-2.jpg',
  '',
  ['home']
);

const dayBeforeLunch = createMeal(
  'meal-daybefore-lunch',
  'lunch',
  createDate(-2, 12, 0),
  lunchFoods1,
  null,
  '',
  ['work']
);

const dayBeforeBreakfast = createMeal(
  'meal-daybefore-breakfast',
  'breakfast',
  createDate(-2, 7, 0),
  breakfastFoods1,
  null,
  '',
  ['home']
);

// 3 days ago
const threeDaysAgoBreakfast = createMeal(
  'meal-3daysago-breakfast',
  'breakfast',
  createDate(-3, 7, 30),
  breakfastFoods2,
  null,
  '',
  ['home']
);

const threeDaysAgoLunch = createMeal(
  'meal-3daysago-lunch',
  'lunch',
  createDate(-3, 12, 30),
  lunchFoods2,
  null,
  '',
  ['restaurant', 'friends']
);

const threeDaysAgoDinner = createMeal(
  'meal-3daysago-dinner',
  'dinner',
  createDate(-3, 19, 0),
  dinnerFoods1,
  null,
  '',
  ['home']
);

const threeDaysAgoSnack = createMeal(
  'meal-3daysago-snack',
  'snack',
  createDate(-3, 16, 0),
  snackFoods1,
  null,
  '',
  ['home']
);

// ==================== ALL MEALS ARRAY ====================

export const allMockMeals: LoggedMeal[] = [
  todayBreakfast,
  todayLunch,
  todaySnack,
  yesterdayBreakfast,
  yesterdayLunch,
  yesterdaySnack,
  yesterdayDinner,
  dayBeforeBreakfast,
  dayBeforeLunch,
  dayBeforeDinner,
  threeDaysAgoBreakfast,
  threeDaysAgoLunch,
  threeDaysAgoDinner,
  threeDaysAgoSnack,
];

// ==================== DATA GETTERS ====================

const dailyTargets: NutritionValues = {
  calories: 2100,
  protein: 140,
  carbs: 230,
  fat: 70,
};

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getMealsForDate(date: Date): LoggedMeal[] {
  return allMockMeals.filter((meal) => isSameDay(meal.loggedAt, date));
}

export function getDailyMealsData(date: Date): DailyMealsData {
  const meals = getMealsForDate(date);

  const dailyMeals = {
    breakfast: meals.find((m) => m.type === 'breakfast') ?? null,
    lunch: meals.find((m) => m.type === 'lunch') ?? null,
    dinner: meals.find((m) => m.type === 'dinner') ?? null,
    snack: meals.find((m) => m.type === 'snack') ?? null,
  };

  const totalNutrition = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.totalNutrition.calories,
      protein: acc.protein + meal.totalNutrition.protein,
      carbs: acc.carbs + meal.totalNutrition.carbs,
      fat: acc.fat + meal.totalNutrition.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const adherencePercentage = Math.round(
    (totalNutrition.calories / dailyTargets.calories) * 100
  );

  return {
    date,
    meals: dailyMeals,
    totalNutrition,
    targets: dailyTargets,
    adherencePercentage,
  };
}

export function getWeeklyMealsData(selectedDate: Date): WeeklyMealsData {
  // Get start of week (Monday)
  const weekStart = new Date(selectedDate);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const days: WeekDayData[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);

    const isToday = isSameDay(date, today);
    const isFuture = date > today;

    const dailyData = getDailyMealsData(date);

    days.push({
      date,
      dayName: weekDays[i],
      dayNumber: date.getDate(),
      isToday,
      isFuture,
      meals: {
        breakfast: dailyData.meals.breakfast !== null,
        lunch: dailyData.meals.lunch !== null,
        dinner: dailyData.meals.dinner !== null,
        snack: dailyData.meals.snack !== null,
      },
      totalCalories: dailyData.totalNutrition.calories,
      targetCalories: dailyTargets.calories,
      caloriePercentage: dailyData.adherencePercentage,
    });
  }

  return {
    weekStart,
    weekEnd,
    days,
  };
}

export function getMealsListData(filter: 'all' | MealType = 'all'): MealsListData {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(dayBefore.getDate() - 2);

  let filteredMeals = [...allMockMeals];
  if (filter !== 'all') {
    filteredMeals = filteredMeals.filter((meal) => meal.type === filter);
  }

  // Sort by date descending
  filteredMeals.sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());

  // Group by date
  const groups: MealsListGroup[] = [];
  const dateGroups = new Map<string, LoggedMeal[]>();

  filteredMeals.forEach((meal) => {
    const dateKey = meal.loggedAt.toDateString();
    if (!dateGroups.has(dateKey)) {
      dateGroups.set(dateKey, []);
    }
    dateGroups.get(dateKey)!.push(meal);
  });

  dateGroups.forEach((meals, dateKey) => {
    const date = new Date(dateKey);
    let label: string;

    if (isSameDay(date, today)) {
      label = "Aujourd'hui";
    } else if (isSameDay(date, yesterday)) {
      label = 'Hier';
    } else if (isSameDay(date, dayBefore)) {
      label = 'Avant-hier';
    } else {
      label = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }

    groups.push({
      label,
      date,
      meals: meals.sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime()),
    });
  });

  // Sort groups by date descending
  groups.sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    groups,
    hasMore: false,
    totalCount: filteredMeals.length,
  };
}

export function getDailySummaryData(date: Date): DailySummaryData {
  const dailyData = getDailyMealsData(date);
  const { totalNutrition, targets } = dailyData;

  return {
    calories: {
      consumed: totalNutrition.calories,
      target: targets.calories,
      remaining: Math.max(0, targets.calories - totalNutrition.calories),
    },
    macros: {
      protein: { current: totalNutrition.protein, target: targets.protein },
      carbs: { current: totalNutrition.carbs, target: targets.carbs },
      fat: { current: totalNutrition.fat, target: targets.fat },
    },
  };
}

export function getPlanComparisonData(date: Date): PlanComparisonData {
  const dailyData = getDailyMealsData(date);
  const { totalNutrition, targets } = dailyData;
  const percentage = dailyData.adherencePercentage;

  // Calculate deviations for each macro
  type MacroConfig = {
    macro: 'protein' | 'carbs' | 'fat' | 'calories';
    label: string;
    current: number;
    target: number;
  };

  const macroConfigs: MacroConfig[] = [
    { macro: 'calories', label: 'Calories', current: totalNutrition.calories, target: targets.calories },
    { macro: 'protein', label: 'Protéines', current: totalNutrition.protein, target: targets.protein },
    { macro: 'carbs', label: 'Glucides', current: totalNutrition.carbs, target: targets.carbs },
    { macro: 'fat', label: 'Lipides', current: totalNutrition.fat, target: targets.fat },
  ];

  const deviations = macroConfigs.map((config) => {
    const macroPercentage = config.target > 0 ? Math.round((config.current / config.target) * 100) : 0;
    const deviation = macroPercentage - 100;
    const absDeviation = Math.abs(deviation);

    let status: 'ok' | 'slight' | 'significant';
    if (absDeviation <= 10) {
      status = 'ok';
    } else if (absDeviation <= 25) {
      status = 'slight';
    } else {
      status = 'significant';
    }

    return {
      macro: config.macro,
      label: config.label,
      current: Math.round(config.current),
      target: config.target,
      percentage: macroPercentage,
      deviation,
      status,
    };
  });

  // Find the biggest deviation (excluding calories since we show it separately)
  const macroDeviations = deviations.filter((d) => d.macro !== 'calories');
  const biggestDeviation = macroDeviations.reduce((max, current) =>
    Math.abs(current.deviation) > Math.abs(max.deviation) ? current : max
  , macroDeviations[0]);

  // Determine overall status based on calories and biggest macro deviation
  let status: 'excellent' | 'good' | 'warning' | 'poor';
  let statusLabel: string;
  let message: string;

  const calorieDeviation = deviations.find((d) => d.macro === 'calories')!;

  if (percentage >= 90 && percentage <= 110 && biggestDeviation.status === 'ok') {
    status = 'excellent';
    statusLabel = 'Excellent';
    message = 'Parfaitement dans les objectifs !';
  } else if (percentage >= 80 && percentage <= 120) {
    status = 'good';
    statusLabel = 'Bonne adhérence';
    // Generate dynamic message based on biggest deviation
    if (biggestDeviation.status !== 'ok') {
      const direction = biggestDeviation.deviation > 0 ? '+' : '';
      message = `Léger écart sur les ${biggestDeviation.label.toLowerCase()} (${direction}${biggestDeviation.deviation}%)`;
    } else {
      message = 'Bien dans les objectifs';
    }
  } else if (percentage >= 50 || percentage <= 150) {
    status = 'warning';
    statusLabel = 'Attention';
    if (calorieDeviation.deviation > 0) {
      message = `Dépassement calorique (+${calorieDeviation.deviation}%)`;
    } else {
      message = `Sous les objectifs (${calorieDeviation.deviation}%)`;
    }
  } else {
    status = 'poor';
    statusLabel = 'À améliorer';
    message = 'Objectifs non atteints';
  }

  return {
    adherencePercentage: percentage,
    status,
    statusLabel,
    message,
    deviations,
    biggestDeviation: biggestDeviation.status !== 'ok' ? biggestDeviation : null,
  };
}

// ==================== DATE HELPERS ====================

export function generateDateRange(centerDate: Date, range: number = 7): Date[] {
  const dates: Date[] = [];
  for (let i = -range; i <= range; i++) {
    const date = new Date(centerDate);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }
  return dates;
}

export function formatDateLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Aujourd'hui";
  }
  if (isSameDay(date, yesterday)) {
    return 'Hier';
  }

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ==================== FREQUENT MEALS ====================

export interface FrequentMeal {
  id: string;
  type: MealType;
  name: string;
  foods: SelectedFood[];
  totalNutrition: NutritionValues;
  frequency: number;
  lastUsed: Date;
}

/**
 * Get most frequent meals based on meal history
 * Groups similar meals and counts their frequency
 */
export function getFrequentMeals(limit: number = 5): FrequentMeal[] {
  // Mock frequent meals based on existing meal patterns
  const frequentMeals: FrequentMeal[] = [
    {
      id: 'frequent-1',
      type: 'breakfast',
      name: 'Porridge complet',
      foods: breakfastFoods1,
      totalNutrition: sumNutrition(breakfastFoods1),
      frequency: 8,
      lastUsed: createDate(-1, 7, 30),
    },
    {
      id: 'frequent-2',
      type: 'lunch',
      name: 'Poulet riz brocoli',
      foods: lunchFoods1,
      totalNutrition: sumNutrition(lunchFoods1),
      frequency: 6,
      lastUsed: createDate(0, 12, 30),
    },
    {
      id: 'frequent-3',
      type: 'snack',
      name: 'Yaourt myrtilles',
      foods: snackFoods1,
      totalNutrition: sumNutrition(snackFoods1),
      frequency: 5,
      lastUsed: createDate(0, 16, 0),
    },
    {
      id: 'frequent-4',
      type: 'breakfast',
      name: 'Oeufs avocat toast',
      foods: breakfastFoods2,
      totalNutrition: sumNutrition(breakfastFoods2),
      frequency: 4,
      lastUsed: createDate(-1, 8, 0),
    },
    {
      id: 'frequent-5',
      type: 'dinner',
      name: 'Saumon quinoa',
      foods: dinnerFoods1,
      totalNutrition: sumNutrition(dinnerFoods1),
      frequency: 4,
      lastUsed: createDate(-1, 19, 30),
    },
    {
      id: 'frequent-6',
      type: 'lunch',
      name: 'Salade César',
      foods: lunchFoods2,
      totalNutrition: sumNutrition(lunchFoods2),
      frequency: 3,
      lastUsed: createDate(-1, 12, 15),
    },
    {
      id: 'frequent-7',
      type: 'snack',
      name: 'Amandes pomme',
      foods: snackFoods2,
      totalNutrition: sumNutrition(snackFoods2),
      frequency: 3,
      lastUsed: createDate(-1, 16, 0),
    },
    {
      id: 'frequent-8',
      type: 'dinner',
      name: 'Pâtes sauce tomate',
      foods: dinnerFoods2,
      totalNutrition: sumNutrition(dinnerFoods2),
      frequency: 2,
      lastUsed: createDate(-2, 20, 0),
    },
  ];

  // Sort by frequency (descending) and return top N
  return frequentMeals
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
}
