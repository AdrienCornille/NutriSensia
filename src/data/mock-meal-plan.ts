/**
 * Données mock pour le Plan Alimentaire
 */

import type {
  DailyPlanData,
  WeeklyPlanData,
  PlanInfo,
  DailyTargets,
  PlanMeal,
  Micronutrient,
  WeekDay,
  WeeklyDayData,
  PlanMealType,
  ModificationRequestData,
  ShoppingList,
  ShoppingItem,
  ShoppingCategory,
} from '@/types/meal-plan';
import { generateWeekDays, mealTypeConfig, shoppingCategoryConfig } from '@/types/meal-plan';

// ==================== CONSTANTES ====================

const DEFAULT_TARGETS: DailyTargets = {
  calories: 2100,
  protein: 120,
  carbs: 250,
  fat: 70,
  fiber: 30,
  sodium: 2300,
};

// ==================== DONNÉES MOCK ====================

const mockMeals: Record<PlanMealType, PlanMeal> = {
  'petit-dejeuner': {
    id: 'meal-pdj-1',
    type: 'petit-dejeuner',
    label: mealTypeConfig['petit-dejeuner'].label,
    icon: mealTypeConfig['petit-dejeuner'].icon,
    time: mealTypeConfig['petit-dejeuner'].defaultTime,
    targetCalories: 450,
    foods: [
      {
        id: 'food-1',
        name: "Flocons d'avoine",
        quantity: '60g',
        calories: 230,
        protein: 8,
        carbs: 40,
        fat: 4,
        category: 'feculents-cereales',
        alternatives: [
          { id: 'alt-1a', name: 'Muesli sans sucre', quantity: '60g', calories: 220, protein: 7, carbs: 38, fat: 5 },
          { id: 'alt-1b', name: 'Granola maison', quantity: '50g', calories: 235, protein: 6, carbs: 35, fat: 8 },
        ],
      },
      {
        id: 'food-2',
        name: 'Lait demi-écrémé',
        quantity: '200ml',
        calories: 92,
        protein: 6.4,
        carbs: 9.6,
        fat: 3.2,
        category: 'produits-laitiers',
        alternatives: [
          { id: 'alt-2a', name: 'Lait d\'amande', quantity: '200ml', calories: 48, protein: 1, carbs: 6, fat: 2.5 },
          { id: 'alt-2b', name: 'Lait d\'avoine', quantity: '200ml', calories: 80, protein: 2, carbs: 14, fat: 1.5 },
        ],
      },
      {
        id: 'food-3',
        name: 'Banane',
        quantity: '1 moyenne',
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
        category: 'fruits',
        alternatives: [
          { id: 'alt-3a', name: 'Pomme', quantity: '1 moyenne', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
          { id: 'alt-3b', name: 'Poire', quantity: '1 moyenne', calories: 100, protein: 0.6, carbs: 26, fat: 0.2 },
        ],
      },
      {
        id: 'food-4',
        name: 'Miel',
        quantity: '1 c. à soupe',
        calories: 64,
        protein: 0,
        carbs: 17,
        fat: 0,
        category: 'autres',
        alternatives: [
          { id: 'alt-4a', name: 'Sirop d\'érable', quantity: '1 c. à soupe', calories: 52, protein: 0, carbs: 13, fat: 0 },
          { id: 'alt-4b', name: 'Sirop d\'agave', quantity: '1 c. à soupe', calories: 60, protein: 0, carbs: 16, fat: 0 },
        ],
      },
    ],
    alternatives: 'Vous pouvez remplacer les flocons d\'avoine par du muesli sans sucre ajouté.',
  },
  'dejeuner': {
    id: 'meal-dej-1',
    type: 'dejeuner',
    label: mealTypeConfig['dejeuner'].label,
    icon: mealTypeConfig['dejeuner'].icon,
    time: mealTypeConfig['dejeuner'].defaultTime,
    targetCalories: 650,
    foods: [
      {
        id: 'food-5',
        name: 'Blanc de poulet grillé',
        quantity: '150g',
        calories: 248,
        protein: 46.5,
        carbs: 0,
        fat: 5.4,
        category: 'viandes-poissons',
        alternatives: [
          { id: 'alt-5a', name: 'Filet de dinde', quantity: '150g', calories: 235, protein: 45, carbs: 0, fat: 4 },
          { id: 'alt-5b', name: 'Tofu ferme', quantity: '200g', calories: 180, protein: 20, carbs: 2, fat: 11 },
          { id: 'alt-5c', name: 'Thon en conserve', quantity: '150g', calories: 165, protein: 36, carbs: 0, fat: 1.5 },
        ],
      },
      {
        id: 'food-6',
        name: 'Riz basmati complet',
        quantity: '180g cuit',
        calories: 234,
        protein: 4.3,
        carbs: 51.5,
        fat: 0.5,
        category: 'feculents-cereales',
        alternatives: [
          { id: 'alt-6a', name: 'Pâtes complètes', quantity: '180g cuites', calories: 248, protein: 9, carbs: 48, fat: 1.5 },
          { id: 'alt-6b', name: 'Boulgour', quantity: '180g cuit', calories: 216, protein: 6, carbs: 45, fat: 0.8 },
          { id: 'alt-6c', name: 'Patate douce', quantity: '200g', calories: 180, protein: 4, carbs: 41, fat: 0.2 },
        ],
      },
      {
        id: 'food-7',
        name: 'Brocoli vapeur',
        quantity: '150g',
        calories: 52,
        protein: 4.2,
        carbs: 7.2,
        fat: 0.6,
        category: 'legumes',
        alternatives: [
          { id: 'alt-7a', name: 'Chou-fleur vapeur', quantity: '150g', calories: 38, protein: 3, carbs: 7, fat: 0.4 },
          { id: 'alt-7b', name: 'Épinards', quantity: '150g', calories: 35, protein: 4.3, carbs: 5.4, fat: 0.6 },
        ],
      },
      {
        id: 'food-8',
        name: "Huile d'olive",
        quantity: '1 c. à soupe',
        calories: 119,
        protein: 0,
        carbs: 0,
        fat: 13.5,
        category: 'huiles-condiments',
        alternatives: [
          { id: 'alt-8a', name: 'Huile de colza', quantity: '1 c. à soupe', calories: 119, protein: 0, carbs: 0, fat: 13.5 },
          { id: 'alt-8b', name: 'Huile de noix', quantity: '1 c. à soupe', calories: 119, protein: 0, carbs: 0, fat: 13.5 },
        ],
      },
    ],
    alternatives: 'Vous pouvez remplacer le riz par des pâtes complètes ou du boulgour pour varier.',
  },
  'collation': {
    id: 'meal-col-1',
    type: 'collation',
    label: mealTypeConfig['collation'].label,
    icon: mealTypeConfig['collation'].icon,
    time: mealTypeConfig['collation'].defaultTime,
    targetCalories: 200,
    foods: [
      {
        id: 'food-9',
        name: 'Yaourt grec nature',
        quantity: '150g',
        calories: 90,
        protein: 15,
        carbs: 4.5,
        fat: 0.8,
        category: 'produits-laitiers',
        alternatives: [
          { id: 'alt-9a', name: 'Fromage blanc 0%', quantity: '150g', calories: 68, protein: 12, carbs: 6, fat: 0.2 },
          { id: 'alt-9b', name: 'Skyr', quantity: '150g', calories: 95, protein: 16, carbs: 6, fat: 0.3 },
        ],
      },
      {
        id: 'food-10',
        name: 'Amandes',
        quantity: '20g',
        calories: 116,
        protein: 4.2,
        carbs: 2.2,
        fat: 10,
        category: 'oleagineux',
        alternatives: [
          { id: 'alt-10a', name: 'Noix de cajou', quantity: '20g', calories: 110, protein: 3.6, carbs: 6, fat: 8.8 },
          { id: 'alt-10b', name: 'Noisettes', quantity: '20g', calories: 126, protein: 3, carbs: 3.4, fat: 12 },
          { id: 'alt-10c', name: 'Noix', quantity: '20g', calories: 130, protein: 3, carbs: 2.7, fat: 13 },
        ],
      },
    ],
    alternatives: 'Les noix de cajou ou les noisettes sont d\'excellentes alternatives aux amandes.',
  },
  'diner': {
    id: 'meal-din-1',
    type: 'diner',
    label: mealTypeConfig['diner'].label,
    icon: mealTypeConfig['diner'].icon,
    time: mealTypeConfig['diner'].defaultTime,
    targetCalories: 600,
    foods: [
      {
        id: 'food-11',
        name: 'Filet de saumon',
        quantity: '150g',
        calories: 280,
        protein: 30,
        carbs: 0,
        fat: 18,
        category: 'viandes-poissons',
        alternatives: [
          { id: 'alt-11a', name: 'Cabillaud', quantity: '150g', calories: 120, protein: 26, carbs: 0, fat: 1 },
          { id: 'alt-11b', name: 'Truite', quantity: '150g', calories: 190, protein: 28, carbs: 0, fat: 8 },
          { id: 'alt-11c', name: 'Maquereau', quantity: '150g', calories: 305, protein: 27, carbs: 0, fat: 22 },
        ],
      },
      {
        id: 'food-12',
        name: 'Quinoa',
        quantity: '150g cuit',
        calories: 180,
        protein: 6,
        carbs: 32,
        fat: 2.7,
        category: 'feculents-cereales',
        alternatives: [
          { id: 'alt-12a', name: 'Lentilles corail', quantity: '150g cuites', calories: 165, protein: 12, carbs: 28, fat: 0.5 },
          { id: 'alt-12b', name: 'Semoule complète', quantity: '150g cuite', calories: 175, protein: 5, carbs: 36, fat: 0.3 },
        ],
      },
      {
        id: 'food-13',
        name: 'Haricots verts',
        quantity: '150g',
        calories: 47,
        protein: 2.7,
        carbs: 7.5,
        fat: 0.3,
        category: 'legumes',
        alternatives: [
          { id: 'alt-13a', name: 'Courgettes', quantity: '150g', calories: 25, protein: 1.8, carbs: 4.5, fat: 0.4 },
          { id: 'alt-13b', name: 'Asperges', quantity: '150g', calories: 30, protein: 3.3, carbs: 5.7, fat: 0.2 },
        ],
      },
      {
        id: 'food-14',
        name: 'Citron (jus)',
        quantity: '1/2',
        calories: 6,
        protein: 0.1,
        carbs: 1.5,
        fat: 0,
        category: 'fruits',
        alternatives: [
          { id: 'alt-14a', name: 'Vinaigre balsamique', quantity: '1 c. à soupe', calories: 14, protein: 0, carbs: 2.7, fat: 0 },
          { id: 'alt-14b', name: 'Citron vert (jus)', quantity: '1/2', calories: 5, protein: 0.1, carbs: 1.3, fat: 0 },
        ],
      },
    ],
    alternatives: 'Le cabillaud ou la truite sont de bonnes alternatives au saumon.',
  },
};

const mockMicronutrients: Micronutrient[] = [
  { id: 'micro-1', name: 'Fibres', value: 32, target: 30, unit: 'g', status: 'good' },
  { id: 'micro-2', name: 'Sodium', value: 1850, target: 2300, unit: 'mg', status: 'good' },
  { id: 'micro-3', name: 'Vitamine C', value: 95, target: 90, unit: 'mg', status: 'good' },
  { id: 'micro-4', name: 'Calcium', value: 780, target: 1000, unit: 'mg', status: 'warning' },
  { id: 'micro-5', name: 'Fer', value: 14, target: 18, unit: 'mg', status: 'warning' },
  { id: 'micro-6', name: 'Vitamine D', value: 8, target: 15, unit: 'µg', status: 'low' },
];

// ==================== FONCTIONS ====================

/**
 * Retourne les données du plan pour un jour donné
 */
export function getDailyPlanData(date: Date): DailyPlanData {
  return {
    date,
    targets: DEFAULT_TARGETS,
    meals: mockMeals,
    micronutrients: mockMicronutrients,
  };
}

/**
 * Retourne les données du plan pour une semaine
 */
export function getWeeklyPlanData(weekStart: Date): WeeklyPlanData {
  const weekDays = generateWeekDays(weekStart);

  const days: WeeklyDayData[] = weekDays.map((day, index) => {
    // Variation légère des calories pour chaque jour
    const calorieVariation = Math.floor(Math.random() * 150) - 75;
    const baseCalories = 1863;

    return {
      day,
      meals: {
        'petit-dejeuner': { summary: "Flocons d'avoine, banane", calories: 491 },
        'dejeuner': { summary: 'Poulet, riz, légumes', calories: 653 },
        'collation': { summary: 'Yaourt, amandes', calories: 206 },
        'diner': { summary: 'Saumon, quinoa', calories: 513 },
      },
      totalCalories: baseCalories + calorieVariation,
    };
  });

  return {
    weekStart,
    weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
    days,
    targets: DEFAULT_TARGETS,
  };
}

/**
 * Retourne les informations sur le plan actuel
 */
export function getPlanInfo(): PlanInfo {
  const today = new Date();
  // Calculer le lundi de la semaine actuelle
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(today.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    id: 'plan-1',
    creator: {
      name: 'Lucie Martin',
      initials: 'LM',
      role: 'nutritionist',
    },
    lastUpdated: new Date('2026-01-10'),
    objective:
      'Rééquilibrage alimentaire avec maintien de la masse musculaire. Focus sur les protéines et les fibres.',
    isActive: true,
    weekStart,
    weekEnd,
  };
}

/**
 * Génère les jours de la semaine actuelle
 */
export function getCurrentWeekDays(): WeekDay[] {
  const today = new Date();
  // Calculer le lundi de la semaine actuelle
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(today);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  return generateWeekDays(weekStart);
}

/**
 * Formate une plage de dates pour l'affichage
 */
export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const month = weekStart.toLocaleDateString('fr-FR', { month: 'long' });
  const year = weekStart.getFullYear();

  return `Semaine du ${startDay} au ${endDay} ${month} ${year}`;
}

// ==================== DEMANDES DE MODIFICATION ====================

const mockModificationRequests: ModificationRequestData[] = [
  {
    id: 'req-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
    meal: 'dejeuner',
    mealLabel: 'Déjeuner',
    food: 'Riz basmati complet',
    reason: "Je n'aime pas le riz, serait-il possible de le remplacer par des pâtes complètes ?",
    status: 'pending',
  },
  {
    id: 'req-2',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
    meal: 'diner',
    mealLabel: 'Dîner',
    food: 'Filet de saumon',
    reason: "Je suis allergique au saumon, pouvez-vous proposer une alternative ?",
    status: 'approved',
    nutritionistResponse: "J'ai remplacé le saumon par de la truite qui a un profil nutritionnel similaire. Le plan a été mis à jour.",
    respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'req-3',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Il y a 10 jours
    meal: 'petit-dejeuner',
    mealLabel: 'Petit-déjeuner',
    reason: "Je voudrais réduire les glucides au petit-déjeuner car j'ai tendance à avoir un coup de fatigue vers 10h.",
    status: 'reviewed',
    nutritionistResponse: "Je vais étudier votre demande et vous proposer des ajustements cette semaine.",
    respondedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
];

/**
 * Retourne les demandes de modification du patient
 */
export function getModificationRequests(): ModificationRequestData[] {
  return mockModificationRequests;
}

/**
 * Ajoute une nouvelle demande de modification (mock)
 */
export function addModificationRequest(
  data: Omit<ModificationRequestData, 'id' | 'createdAt' | 'status'>
): ModificationRequestData {
  const newRequest: ModificationRequestData = {
    ...data,
    id: `req-${Date.now()}`,
    createdAt: new Date(),
    status: 'pending',
  };
  mockModificationRequests.unshift(newRequest);
  return newRequest;
}

// ==================== LISTE DE COURSES (PLAN-006) ====================

/**
 * Parse une quantité pour extraire le nombre et l'unité
 */
function parseQuantity(quantity: string): { value: number; unit: string } {
  // Patterns: "60g", "200ml", "1 moyenne", "1/2", "1 c. à soupe"
  const numericMatch = quantity.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (numericMatch) {
    return { value: parseFloat(numericMatch[1]), unit: numericMatch[2] || 'unité' };
  }

  // Handle fractions like "1/2"
  const fractionMatch = quantity.match(/^(\d+)\/(\d+)\s*(.*)$/);
  if (fractionMatch) {
    const value = parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
    return { value, unit: fractionMatch[3] || 'unité' };
  }

  return { value: 1, unit: quantity };
}

/**
 * Formate une quantité cumulée pour la semaine
 */
function formatWeeklyQuantity(quantity: string, days: number): string {
  const parsed = parseQuantity(quantity);
  const weeklyValue = parsed.value * days;

  // Format nicely
  if (Number.isInteger(weeklyValue)) {
    return `${weeklyValue}${parsed.unit ? ' ' + parsed.unit : ''}`.trim();
  }
  return `${weeklyValue.toFixed(1)}${parsed.unit ? ' ' + parsed.unit : ''}`.trim();
}

/**
 * Génère une liste de courses à partir du plan alimentaire
 */
export function generateShoppingList(weekStart: Date, weekEnd: Date): ShoppingList {
  const DAYS_IN_WEEK = 7;

  // Map pour regrouper les items par nom
  const itemsMap = new Map<string, {
    name: string;
    category: ShoppingCategory;
    quantity: string;
    occurrences: number;
  }>();

  // Parcourir tous les repas
  const mealTypes: PlanMealType[] = ['petit-dejeuner', 'dejeuner', 'collation', 'diner'];

  for (const mealType of mealTypes) {
    const meal = mockMeals[mealType];
    for (const food of meal.foods) {
      const category = food.category || 'autres';
      const existing = itemsMap.get(food.name);

      if (existing) {
        existing.occurrences += DAYS_IN_WEEK;
      } else {
        itemsMap.set(food.name, {
          name: food.name,
          category,
          quantity: food.quantity,
          occurrences: DAYS_IN_WEEK,
        });
      }
    }
  }

  // Convertir en ShoppingItems et grouper par catégorie
  const categoriesMap = new Map<ShoppingCategory, ShoppingItem[]>();

  let itemIndex = 0;
  for (const [name, data] of itemsMap) {
    const item: ShoppingItem = {
      id: `shopping-${itemIndex++}`,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      weeklyQuantity: formatWeeklyQuantity(data.quantity, data.occurrences / DAYS_IN_WEEK * DAYS_IN_WEEK),
      occurrences: data.occurrences,
      checked: false,
    };

    const categoryItems = categoriesMap.get(data.category) || [];
    categoryItems.push(item);
    categoriesMap.set(data.category, categoryItems);
  }

  // Trier les catégories par ordre défini
  const sortedCategories = Array.from(categoriesMap.entries())
    .sort((a, b) => shoppingCategoryConfig[a[0]].order - shoppingCategoryConfig[b[0]].order)
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    }));

  return {
    weekStart,
    weekEnd,
    categories: sortedCategories,
    totalItems: itemsMap.size,
  };
}
