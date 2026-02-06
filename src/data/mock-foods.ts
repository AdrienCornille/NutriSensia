/**
 * Mock food database for meal logging
 * Based on common Swiss/French foods with realistic nutritional values
 */

import type {
  FoodItem,
  MealTypeConfig,
  MealContextConfig,
  StandardPortion,
  PreviousMeal,
  NutritionTarget,
} from '@/types/meals';

// ==================== MEAL TYPE CONFIGS ====================

export const mealTypeConfigs: MealTypeConfig[] = [
  {
    id: 'breakfast',
    label: 'Petit-déjeuner',
    icon: '🌅',
    timeRange: '7:00 - 9:00',
  },
  {
    id: 'lunch',
    label: 'Déjeuner',
    icon: '☀️',
    timeRange: '12:00 - 14:00',
  },
  {
    id: 'dinner',
    label: 'Dîner',
    icon: '🌙',
    timeRange: '19:00 - 21:00',
  },
  {
    id: 'snack',
    label: 'Collation',
    icon: '⭐',
    timeRange: 'À tout moment',
  },
];

// ==================== CONTEXT CONFIGS ====================

export const mealContextConfigs: MealContextConfig[] = [
  { id: 'home', label: 'À la maison', icon: '🏠' },
  { id: 'work', label: 'Au travail', icon: '🏢' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'family', label: 'En famille', icon: '👨‍👩‍👧' },
  { id: 'friends', label: 'Entre amis', icon: '👥' },
  { id: 'alone', label: 'Seul(e)', icon: '🧘' },
];

// ==================== STANDARD PORTIONS ====================

export const standardPortions: StandardPortion[] = [
  { label: '1 portion', grams: 150 },
  { label: '1/2 portion', grams: 75 },
  { label: '1 poignée', grams: 30 },
  { label: '1 c. à soupe', grams: 15 },
];

// ==================== DEFAULT NUTRITION TARGETS ====================

export const defaultNutritionTargets: Record<string, NutritionTarget> = {
  breakfast: { calories: 450, protein: 20, carbs: 55, fat: 15 },
  lunch: { calories: 650, protein: 40, carbs: 70, fat: 20 },
  dinner: { calories: 550, protein: 35, carbs: 50, fat: 18 },
  snack: { calories: 200, protein: 10, carbs: 25, fat: 8 },
};

// ==================== MOCK PREVIOUS MEALS ====================

export const mockPreviousMeals: PreviousMeal[] = [
  {
    id: 'prev-1',
    type: 'lunch',
    label: "Déjeuner d'hier",
    description: 'Poulet grillé, riz, salade',
    calories: 542,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  },
  {
    id: 'prev-2',
    type: 'breakfast',
    label: "Petit-déjeuner d'aujourd'hui",
    description: 'Œufs, pain complet, avocat',
    calories: 385,
    date: new Date(), // Today
  },
];

// ==================== FOOD DATABASE ====================

export const mockFoodDatabase: FoodItem[] = [
  // Proteins
  {
    id: 'food-1',
    name: 'Blanc de poulet grillé',
    emoji: '🍗',
    barcode: '7610200012345',
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
    source: 'database',
  },
  {
    id: 'food-2',
    name: 'Saumon fumé',
    emoji: '🐟',
    caloriesPer100g: 117,
    proteinPer100g: 18,
    carbsPer100g: 0,
    fatPer100g: 4.5,
    source: 'database',
  },
  {
    id: 'food-3',
    name: 'Œufs brouillés',
    emoji: '🥚',
    caloriesPer100g: 148,
    proteinPer100g: 10,
    carbsPer100g: 1.6,
    fatPer100g: 11,
    source: 'database',
  },
  {
    id: 'food-4',
    name: 'Thon en conserve',
    emoji: '🐟',
    caloriesPer100g: 132,
    proteinPer100g: 29,
    carbsPer100g: 0,
    fatPer100g: 1,
    source: 'database',
  },
  {
    id: 'food-5',
    name: 'Tofu nature',
    emoji: '🧊',
    caloriesPer100g: 76,
    proteinPer100g: 8,
    carbsPer100g: 1.9,
    fatPer100g: 4.8,
    source: 'database',
  },

  // Carbs
  {
    id: 'food-10',
    name: 'Riz basmati cuit',
    emoji: '🍚',
    caloriesPer100g: 130,
    proteinPer100g: 2.4,
    carbsPer100g: 28.6,
    fatPer100g: 0.3,
    source: 'database',
  },
  {
    id: 'food-11',
    name: 'Pâtes complètes cuites',
    emoji: '🍝',
    caloriesPer100g: 124,
    proteinPer100g: 5,
    carbsPer100g: 25,
    fatPer100g: 0.5,
    source: 'database',
  },
  {
    id: 'food-12',
    name: 'Pain complet',
    emoji: '🍞',
    caloriesPer100g: 247,
    proteinPer100g: 13,
    carbsPer100g: 41,
    fatPer100g: 3.4,
    source: 'database',
  },
  {
    id: 'food-13',
    name: 'Quinoa cuit',
    emoji: '🌾',
    caloriesPer100g: 120,
    proteinPer100g: 4.4,
    carbsPer100g: 21,
    fatPer100g: 1.9,
    source: 'database',
  },
  {
    id: 'food-14',
    name: 'Pommes de terre cuites',
    emoji: '🥔',
    caloriesPer100g: 87,
    proteinPer100g: 1.9,
    carbsPer100g: 20,
    fatPer100g: 0.1,
    source: 'database',
  },

  // Vegetables
  {
    id: 'food-20',
    name: 'Brocoli cuit à la vapeur',
    emoji: '🥦',
    caloriesPer100g: 35,
    proteinPer100g: 2.8,
    carbsPer100g: 4.8,
    fatPer100g: 0.4,
    source: 'database',
  },
  {
    id: 'food-21',
    name: 'Salade verte',
    emoji: '🥗',
    caloriesPer100g: 15,
    proteinPer100g: 1.4,
    carbsPer100g: 2.9,
    fatPer100g: 0.2,
    source: 'database',
  },
  {
    id: 'food-22',
    name: 'Tomates fraîches',
    emoji: '🍅',
    caloriesPer100g: 18,
    proteinPer100g: 0.9,
    carbsPer100g: 3.9,
    fatPer100g: 0.2,
    source: 'database',
  },
  {
    id: 'food-23',
    name: 'Carottes cuites',
    emoji: '🥕',
    caloriesPer100g: 35,
    proteinPer100g: 0.8,
    carbsPer100g: 8.2,
    fatPer100g: 0.2,
    source: 'database',
  },
  {
    id: 'food-24',
    name: 'Courgettes grillées',
    emoji: '🥒',
    caloriesPer100g: 24,
    proteinPer100g: 1.6,
    carbsPer100g: 3.3,
    fatPer100g: 0.6,
    source: 'database',
  },
  {
    id: 'food-25',
    name: 'Épinards cuits',
    emoji: '🥬',
    caloriesPer100g: 23,
    proteinPer100g: 2.9,
    carbsPer100g: 3.6,
    fatPer100g: 0.3,
    source: 'database',
  },
  {
    id: 'food-26',
    name: 'Haricots verts',
    emoji: '🫛',
    caloriesPer100g: 31,
    proteinPer100g: 1.8,
    carbsPer100g: 7,
    fatPer100g: 0.1,
    source: 'database',
  },
  {
    id: 'food-27',
    name: 'Avocat',
    emoji: '🥑',
    caloriesPer100g: 160,
    proteinPer100g: 2,
    carbsPer100g: 8.5,
    fatPer100g: 14.7,
    source: 'database',
  },

  // Dairy
  {
    id: 'food-30',
    name: 'Yaourt nature',
    emoji: '🥛',
    barcode: '7610200054321',
    caloriesPer100g: 61,
    proteinPer100g: 3.5,
    carbsPer100g: 4.7,
    fatPer100g: 3.3,
    source: 'database',
  },
  {
    id: 'food-31',
    name: 'Fromage blanc 0%',
    emoji: '🥛',
    caloriesPer100g: 49,
    proteinPer100g: 8,
    carbsPer100g: 4,
    fatPer100g: 0.2,
    source: 'database',
  },
  {
    id: 'food-32',
    name: 'Gruyère suisse',
    emoji: '🧀',
    caloriesPer100g: 413,
    proteinPer100g: 27,
    carbsPer100g: 0,
    fatPer100g: 33,
    source: 'database',
  },
  {
    id: 'food-33',
    name: 'Mozzarella',
    emoji: '🧀',
    caloriesPer100g: 280,
    proteinPer100g: 22,
    carbsPer100g: 2.2,
    fatPer100g: 22,
    source: 'database',
  },

  // Fruits
  {
    id: 'food-40',
    name: 'Pomme',
    emoji: '🍎',
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 14,
    fatPer100g: 0.2,
    source: 'database',
  },
  {
    id: 'food-41',
    name: 'Banane',
    emoji: '🍌',
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 23,
    fatPer100g: 0.3,
    source: 'database',
  },
  {
    id: 'food-42',
    name: 'Orange',
    emoji: '🍊',
    caloriesPer100g: 47,
    proteinPer100g: 0.9,
    carbsPer100g: 12,
    fatPer100g: 0.1,
    source: 'database',
  },
  {
    id: 'food-43',
    name: 'Fraises',
    emoji: '🍓',
    caloriesPer100g: 32,
    proteinPer100g: 0.7,
    carbsPer100g: 7.7,
    fatPer100g: 0.3,
    source: 'database',
  },
  {
    id: 'food-44',
    name: 'Myrtilles',
    emoji: '🫐',
    caloriesPer100g: 57,
    proteinPer100g: 0.7,
    carbsPer100g: 14.5,
    fatPer100g: 0.3,
    source: 'database',
  },

  // Nuts & Seeds
  {
    id: 'food-50',
    name: 'Amandes',
    emoji: '🥜',
    caloriesPer100g: 579,
    proteinPer100g: 21,
    carbsPer100g: 22,
    fatPer100g: 49,
    source: 'database',
  },
  {
    id: 'food-51',
    name: 'Noix',
    emoji: '🥜',
    caloriesPer100g: 654,
    proteinPer100g: 15,
    carbsPer100g: 14,
    fatPer100g: 65,
    source: 'database',
  },
  {
    id: 'food-52',
    name: 'Graines de chia',
    emoji: '🌱',
    caloriesPer100g: 486,
    proteinPer100g: 17,
    carbsPer100g: 42,
    fatPer100g: 31,
    source: 'database',
  },

  // Swiss specific
  {
    id: 'food-60',
    name: 'Rösti',
    brand: 'Migros',
    emoji: '🥔',
    barcode: '7617027123456',
    caloriesPer100g: 150,
    proteinPer100g: 2,
    carbsPer100g: 18,
    fatPer100g: 8,
    source: 'database',
  },
  {
    id: 'food-61',
    name: 'Birchermüesli',
    brand: 'Coop',
    emoji: '🥣',
    barcode: '7613356789012',
    caloriesPer100g: 145,
    proteinPer100g: 4.5,
    carbsPer100g: 24,
    fatPer100g: 3.5,
    source: 'database',
  },
  {
    id: 'food-62',
    name: 'Cervelas',
    emoji: '🌭',
    barcode: '7610200098765',
    caloriesPer100g: 295,
    proteinPer100g: 12,
    carbsPer100g: 1,
    fatPer100g: 27,
    source: 'database',
  },

  // Beverages
  {
    id: 'food-70',
    name: 'Café noir (sans sucre)',
    emoji: '☕',
    caloriesPer100g: 2,
    proteinPer100g: 0.1,
    carbsPer100g: 0,
    fatPer100g: 0,
    source: 'database',
  },
  {
    id: 'food-71',
    name: 'Thé vert (sans sucre)',
    emoji: '🍵',
    caloriesPer100g: 1,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 0,
    source: 'database',
  },
  {
    id: 'food-72',
    name: "Jus d'orange frais",
    emoji: '🧃',
    caloriesPer100g: 45,
    proteinPer100g: 0.7,
    carbsPer100g: 10.4,
    fatPer100g: 0.2,
    source: 'database',
  },

  // Oils & Fats
  {
    id: 'food-80',
    name: "Huile d'olive",
    emoji: '🫒',
    caloriesPer100g: 884,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 100,
    source: 'database',
  },
  {
    id: 'food-81',
    name: 'Beurre',
    emoji: '🧈',
    caloriesPer100g: 717,
    proteinPer100g: 0.9,
    carbsPer100g: 0.1,
    fatPer100g: 81,
    source: 'database',
  },
];

// ==================== RECENT & FAVORITE FOODS ====================

export const mockRecentFoods: FoodItem[] = [
  mockFoodDatabase.find(f => f.id === 'food-21')!, // Salade verte
  mockFoodDatabase.find(f => f.id === 'food-3')!, // Œufs brouillés
  mockFoodDatabase.find(f => f.id === 'food-12')!, // Pain complet
  mockFoodDatabase.find(f => f.id === 'food-30')!, // Yaourt nature
];

export const mockFavoriteFoods: FoodItem[] = [
  mockFoodDatabase.find(f => f.id === 'food-1')!, // Blanc de poulet
  mockFoodDatabase.find(f => f.id === 'food-10')!, // Riz basmati
  mockFoodDatabase.find(f => f.id === 'food-20')!, // Brocoli
  mockFoodDatabase.find(f => f.id === 'food-40')!, // Pomme
];

// ==================== SEARCH FUNCTION ====================

/**
 * Calculate Levenshtein distance between two strings
 * Used for typo-tolerant search
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Check if a word fuzzy-matches the query
 * Allows typos based on word length
 */
function fuzzyMatch(text: string, query: string): boolean {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  // Exact match or contains
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }

  // Split into words and check each
  const words = normalizedText.split(/\s+/);
  for (const word of words) {
    // Allow more typos for longer queries
    const maxDistance = query.length <= 4 ? 1 : query.length <= 7 ? 2 : 3;
    if (
      levenshteinDistance(word.slice(0, query.length + 2), normalizedQuery) <=
      maxDistance
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Search foods in the mock database with typo tolerance
 * Returns foods matching the query (name or brand)
 * Requires minimum 3 characters
 */
export function searchFoods(query: string): FoodItem[] {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  return mockFoodDatabase
    .filter(
      food =>
        fuzzyMatch(food.name, normalizedQuery) ||
        (food.brand && fuzzyMatch(food.brand, normalizedQuery))
    )
    .sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.name.toLowerCase().includes(normalizedQuery) ? 0 : 1;
      const bExact = b.name.toLowerCase().includes(normalizedQuery) ? 0 : 1;
      return aExact - bExact;
    });
}

/**
 * Get food by ID
 */
export function getFoodById(id: string): FoodItem | undefined {
  return mockFoodDatabase.find(food => food.id === id);
}

/**
 * Get food by barcode (mock - returns undefined for now)
 */
export function getFoodByBarcode(barcode: string): FoodItem | undefined {
  return mockFoodDatabase.find(food => food.barcode === barcode);
}
