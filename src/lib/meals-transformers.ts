/**
 * Couche de transformation pour les données de repas
 * Convertit entre les types API et les types UI
 */

import type { UseQueryResult } from '@tanstack/react-query';
import type {
  MealListItem,
  Meal,
  CreateMealData,
  MealsResponse,
} from '@/hooks/useMeals';
import type {
  LoggedMeal,
  DailyMealsData,
  DailyMeals,
  WeeklyMealsData,
  WeekDayData,
  WeekDayMeals,
  MealsListData,
  MealsListGroup,
} from '@/types/meals-history';
import type {
  MealType,
  SelectedFood,
  MealContext,
  NutritionValues,
} from '@/types/meals';

// ============================================================================
// HELPERS DE DATE
// ============================================================================

/**
 * Formate une date pour l'API (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Convertit location (string) en contextTags (array)
 */
export const mapLocationToContextTags = (location?: string): MealContext[] => {
  if (!location) return [];

  // Mapping des valeurs possibles de location vers MealContext
  const validContexts: MealContext[] = ['home', 'work', 'restaurant'];

  if (validContexts.includes(location as MealContext)) {
    return [location as MealContext];
  }

  return [];
};

/**
 * Convertit contextTags (array) en location (string)
 */
export const mapContextTagsToLocation = (
  tags: MealContext[]
): string | undefined => {
  if (tags.length === 0) return undefined;

  // Prend le premier tag qui correspond à une location valide
  const validLocations = ['home', 'work', 'restaurant', 'other'];
  const location = tags.find(tag => validLocations.includes(tag));

  return location;
};

/**
 * Formate une date en label lisible (Aujourd'hui, Hier, etc.)
 */
export const formatDateLabel = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) return "Aujourd'hui";
  if (isSameDay(date, yesterday)) return 'Hier';
  if (isSameDay(date, dayBeforeYesterday)) return 'Avant-hier';

  // Format: "lundi 15 janvier"
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
};

/**
 * Obtient le nom du jour de la semaine (format court)
 */
export const getDayName = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date);
};

/**
 * Obtient les dates de la semaine pour une date donnée
 */
export const getWeekDates = (selectedDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDay = selectedDate.getDay();

  // Lundi = 1, Dimanche = 0 -> ajuster pour commencer le lundi
  const offset = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() + offset);

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }

  return dates;
};

// ============================================================================
// TRANSFORMATIONS MEAL -> LOGGEDMEAL
// ============================================================================

/**
 * Transforme MealListItem (API liste) en LoggedMeal (UI)
 * ⚠️ IMPORTANT: foods sera un tableau VIDE (non récupérés pour performance)
 * Utilise foodCount pour afficher le nombre d'aliments
 */
export const transformMealListItemToLoggedMeal = (
  item: MealListItem
): LoggedMeal => {
  return {
    id: item.id,
    userId: '', // Non disponible dans MealListItem
    type: item.type,
    loggedAt: new Date(item.consumed_at),
    foods: [], // ⚠️ Vide pour les items de liste
    foodCount: item.food_count, // Nombre d'aliments pour l'affichage
    totalNutrition: {
      calories: item.total_calories,
      protein: item.total_protein,
      carbs: item.total_carbs,
      fat: item.total_fat,
    },
    photoUrl: item.has_photo ? undefined : null, // On ne connaît pas l'URL exacte
    notes: undefined,
    contextTags: mapLocationToContextTags(item.location),
    createdAt: new Date(item.consumed_at), // Approximation
    updatedAt: new Date(item.consumed_at), // Approximation
  };
};

/**
 * Transforme Meal (API détail) en LoggedMeal (UI)
 * Utilisé quand on a besoin des détails complets (édition)
 */
export const transformMealToLoggedMeal = (meal: Meal): LoggedMeal => {
  const foods: SelectedFood[] = meal.foods.map(food => {
    // Recalculer les valeurs per100g à partir des valeurs calculées
    // Pour 'portion', on assume 1 portion = 100g
    const gramsConsumed =
      food.unit === 'portion' ? food.quantity * 100 : food.quantity;
    const multiplier = gramsConsumed / 100;

    return {
      id: food.food_id,
      name: food.food_name,
      brand: food.brand,
      // Calculer les valeurs per100g en inversant le calcul
      caloriesPer100g:
        multiplier > 0 ? Math.round(food.calories / multiplier) : 0,
      proteinPer100g:
        multiplier > 0 ? Math.round((food.protein / multiplier) * 10) / 10 : 0,
      carbsPer100g:
        multiplier > 0 ? Math.round((food.carbs / multiplier) * 10) / 10 : 0,
      fatPer100g:
        multiplier > 0 ? Math.round((food.fat / multiplier) * 10) / 10 : 0,
      quantity: food.quantity,
      unit: food.unit as 'g' | 'ml' | 'portion',
      calculatedNutrition: {
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      },
    };
  });

  return {
    id: meal.id,
    userId: meal.user_id,
    type: meal.type,
    loggedAt: new Date(meal.consumed_at),
    foods,
    totalNutrition: {
      calories: meal.total_calories,
      protein: meal.total_protein,
      carbs: meal.total_carbs,
      fat: meal.total_fat,
    },
    photoUrl: meal.photo_url || null,
    notes: meal.notes,
    contextTags: mapLocationToContextTags(meal.location),
    createdAt: new Date(meal.created_at),
    updatedAt: new Date(meal.created_at), // TODO: ajouter updated_at dans l'API
  };
};

/**
 * Transforme LoggedMeal (UI) en CreateMealData (API)
 * Pour les requêtes POST/PATCH
 */
export const transformLoggedMealToCreateData = (
  meal: LoggedMeal
): CreateMealData => {
  return {
    type: meal.type,
    consumed_at: meal.loggedAt.toISOString(),
    notes: meal.notes,
    location: mapContextTagsToLocation(meal.contextTags) as
      | 'home'
      | 'work'
      | 'restaurant'
      | 'other'
      | undefined,
    photo_url: meal.photoUrl || undefined,
    foods: meal.foods.map(food => ({
      food_id: food.id,
      quantity: food.quantity,
      unit: food.unit,
    })),
  };
};

// ============================================================================
// TRANSFORMATIONS POUR LES VUES
// ============================================================================

/**
 * Transforme une liste de MealListItem en DailyMealsData
 * Groupe les repas par type et calcule les totaux
 */
export const transformToDailyMealsData = (
  meals: MealListItem[],
  date: Date,
  targets: NutritionValues = {
    calories: 2100,
    protein: 140,
    carbs: 230,
    fat: 70,
  }
): DailyMealsData => {
  // Grouper les repas par type
  const dailyMeals: DailyMeals = {
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  };

  meals.forEach(meal => {
    const loggedMeal = transformMealListItemToLoggedMeal(meal);

    // Prendre le premier repas de chaque type (le plus récent normalement)
    if (!dailyMeals[meal.type]) {
      dailyMeals[meal.type] = loggedMeal;
    }
  });

  // Calculer les totaux nutritionnels
  const totalNutrition: NutritionValues = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.total_calories,
      protein: acc.protein + meal.total_protein,
      carbs: acc.carbs + meal.total_carbs,
      fat: acc.fat + meal.total_fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Calculer le pourcentage d'adhérence
  const adherencePercentage =
    targets.calories > 0
      ? Math.round((totalNutrition.calories / targets.calories) * 100)
      : 0;

  return {
    date,
    meals: dailyMeals,
    totalNutrition,
    targets,
    adherencePercentage,
  };
};

/**
 * Transforme plusieurs requêtes (7 jours) en WeeklyMealsData
 * Combine les résultats de useQueries pour la vue semaine
 */
export const transformToWeeklyData = (
  queries: UseQueryResult<MealsResponse, Error>[],
  dates: Date[],
  targetCalories: number = 2100
): WeeklyMealsData => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: WeekDayData[] = dates.map((date, index) => {
    const query = queries[index];
    const meals = query.data?.meals || [];

    // Déterminer quels types de repas sont loggés
    const mealTypes = new Set(meals.map(m => m.type));
    const weekDayMeals: WeekDayMeals = {
      breakfast: mealTypes.has('breakfast'),
      lunch: mealTypes.has('lunch'),
      dinner: mealTypes.has('dinner'),
      snack: mealTypes.has('snack'),
    };

    // Calculer les calories totales
    const totalCalories = meals.reduce(
      (sum, meal) => sum + meal.total_calories,
      0
    );

    // Calculer le pourcentage
    const caloriePercentage =
      targetCalories > 0
        ? Math.round((totalCalories / targetCalories) * 100)
        : 0;

    // Déterminer si c'est aujourd'hui ou dans le futur
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const isToday = dateOnly.getTime() === today.getTime();
    const isFuture = dateOnly.getTime() > today.getTime();

    return {
      date,
      dayName: getDayName(date),
      dayNumber: date.getDate(),
      isToday,
      isFuture,
      meals: weekDayMeals,
      totalCalories,
      targetCalories,
      caloriePercentage,
    };
  });

  return {
    weekStart: dates[0],
    weekEnd: dates[6],
    days,
  };
};

/**
 * Transforme MealsResponse (API) en MealsListData (UI)
 * Groupe les repas par date avec labels
 */
export const transformToListData = (
  response: MealsResponse | undefined
): MealsListData => {
  if (!response || !response.meals.length) {
    return {
      groups: [],
      hasMore: false,
      totalCount: 0,
    };
  }

  // Grouper les repas par date
  const groupedByDate = new Map<string, MealListItem[]>();

  response.meals.forEach(meal => {
    const dateKey = formatDateForAPI(new Date(meal.consumed_at));

    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, []);
    }

    groupedByDate.get(dateKey)!.push(meal);
  });

  // Créer les groupes avec labels
  const groups: MealsListGroup[] = Array.from(groupedByDate.entries()).map(
    ([dateKey, meals]) => {
      const date = new Date(dateKey);

      return {
        label: formatDateLabel(date),
        date,
        meals: meals.map(transformMealListItemToLoggedMeal),
      };
    }
  );

  // Trier par date décroissante
  groups.sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    groups,
    hasMore: response.total > response.meals.length,
    totalCount: response.total,
  };
};

// ============================================================================
// TRANSFORMATIONS POUR LA SIDEBAR
// ============================================================================

/**
 * Calcule le résumé quotidien à partir des repas
 */
export const calculateDailySummary = (
  mealsResponse: MealsResponse | undefined,
  targets: NutritionValues
) => {
  const meals = mealsResponse?.meals || [];

  const consumed = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.total_calories,
      protein: acc.protein + meal.total_protein,
      carbs: acc.carbs + meal.total_carbs,
      fat: acc.fat + meal.total_fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    calories: {
      consumed: consumed.calories,
      target: targets.calories,
      remaining: targets.calories - consumed.calories,
    },
    macros: {
      protein: {
        current: consumed.protein,
        target: targets.protein,
      },
      carbs: {
        current: consumed.carbs,
        target: targets.carbs,
      },
      fat: {
        current: consumed.fat,
        target: targets.fat,
      },
    },
  };
};

/**
 * Calcule la comparaison avec le plan alimentaire
 */
export const calculatePlanComparison = (
  mealsResponse: MealsResponse | undefined,
  targets: NutritionValues
) => {
  const summary = calculateDailySummary(mealsResponse, targets);

  // Calculer le pourcentage d'adhérence global
  const adherencePercentage =
    targets.calories > 0
      ? Math.round((summary.calories.consumed / summary.calories.target) * 100)
      : 0;

  // Déterminer le statut
  let status: 'excellent' | 'good' | 'warning' | 'poor';
  let statusLabel: string;
  let message: string;

  if (adherencePercentage >= 90 && adherencePercentage <= 110) {
    status = 'excellent';
    statusLabel = 'Excellent';
    message = 'Vous suivez parfaitement votre plan !';
  } else if (adherencePercentage >= 80 && adherencePercentage <= 120) {
    status = 'good';
    statusLabel = 'Bon';
    message = 'Vous suivez bien votre plan.';
  } else if (adherencePercentage >= 70 && adherencePercentage <= 130) {
    status = 'warning';
    statusLabel = 'Attention';
    message = 'Léger écart par rapport au plan.';
  } else {
    status = 'poor';
    statusLabel = 'À améliorer';
    message = 'Écart important par rapport au plan.';
  }

  // Calculer les déviations pour chaque macro
  const deviations = [
    {
      macro: 'calories' as const,
      label: 'Calories',
      current: summary.calories.consumed,
      target: summary.calories.target,
      percentage: adherencePercentage,
      deviation: summary.calories.consumed - summary.calories.target,
      status: (Math.abs(adherencePercentage - 100) <= 10
        ? 'ok'
        : Math.abs(adherencePercentage - 100) <= 20
          ? 'slight'
          : 'significant') as 'ok' | 'slight' | 'significant',
    },
    {
      macro: 'protein' as const,
      label: 'Protéines',
      current: summary.macros.protein.current,
      target: summary.macros.protein.target,
      percentage: Math.round(
        (summary.macros.protein.current / summary.macros.protein.target) * 100
      ),
      deviation: summary.macros.protein.current - summary.macros.protein.target,
      status: (Math.abs(
        (summary.macros.protein.current / summary.macros.protein.target) * 100 -
          100
      ) <= 10
        ? 'ok'
        : Math.abs(
              (summary.macros.protein.current / summary.macros.protein.target) *
                100 -
                100
            ) <= 20
          ? 'slight'
          : 'significant') as 'ok' | 'slight' | 'significant',
    },
    {
      macro: 'carbs' as const,
      label: 'Glucides',
      current: summary.macros.carbs.current,
      target: summary.macros.carbs.target,
      percentage: Math.round(
        (summary.macros.carbs.current / summary.macros.carbs.target) * 100
      ),
      deviation: summary.macros.carbs.current - summary.macros.carbs.target,
      status: (Math.abs(
        (summary.macros.carbs.current / summary.macros.carbs.target) * 100 - 100
      ) <= 10
        ? 'ok'
        : Math.abs(
              (summary.macros.carbs.current / summary.macros.carbs.target) *
                100 -
                100
            ) <= 20
          ? 'slight'
          : 'significant') as 'ok' | 'slight' | 'significant',
    },
    {
      macro: 'fat' as const,
      label: 'Lipides',
      current: summary.macros.fat.current,
      target: summary.macros.fat.target,
      percentage: Math.round(
        (summary.macros.fat.current / summary.macros.fat.target) * 100
      ),
      deviation: summary.macros.fat.current - summary.macros.fat.target,
      status: (Math.abs(
        (summary.macros.fat.current / summary.macros.fat.target) * 100 - 100
      ) <= 10
        ? 'ok'
        : Math.abs(
              (summary.macros.fat.current / summary.macros.fat.target) * 100 -
                100
            ) <= 20
          ? 'slight'
          : 'significant') as 'ok' | 'slight' | 'significant',
    },
  ];

  // Trouver la plus grande déviation
  const biggestDeviation = deviations.reduce((max, current) => {
    const currentAbs = Math.abs(current.deviation);
    const maxAbs = Math.abs(max.deviation);
    return currentAbs > maxAbs ? current : max;
  });

  return {
    adherencePercentage,
    status,
    statusLabel,
    message,
    deviations,
    biggestDeviation,
  };
};
