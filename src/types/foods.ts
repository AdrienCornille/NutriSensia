// ==================== ENUMS & TYPES ====================

export type FoodCategory =
  | 'all'
  | 'fruits'
  | 'legumes'
  | 'viandes'
  | 'poissons'
  | 'feculents'
  | 'produits-laitiers'
  | 'oeufs'
  | 'legumineuses'
  | 'noix-graines'
  | 'huiles'
  | 'boissons'
  | 'snacks'
  | 'plats-prepares';

export type ViewMode = 'grid' | 'list';

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'calories-asc'
  | 'calories-desc'
  | 'protein-desc';

// ==================== INTERFACES ====================

export interface FoodPortion {
  label: string;
  grams: number;
}

export interface FoodMicronutrients {
  sodium?: number;
  potassium?: number;
  vitaminB6?: number;
  vitaminB12?: number;
  vitaminC?: number;
  vitaminD?: number;
  iron?: number;
  zinc?: number;
  calcium?: number;
  magnesium?: number;
}

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  per: string;
  brand: string | null;
  portions: FoodPortion[];
  micronutrients?: FoodMicronutrients;
}

export interface CategoryConfig {
  id: FoodCategory;
  label: string;
  emoji: string;
  count: number;
}

// ==================== STATE ====================

export interface FoodsState {
  searchQuery: string;
  activeCategory: FoodCategory;
  viewMode: ViewMode;
  sortOption: SortOption;
  showFoodModal: boolean;
  showScannerModal: boolean;
  selectedFood: Food | null;
  favorites: string[];
  recentSearches: string[];
}

// ==================== ACTIONS ====================

export type FoodsAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_ACTIVE_CATEGORY'; payload: FoodCategory }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SORT_OPTION'; payload: SortOption }
  | { type: 'OPEN_FOOD_MODAL'; payload: Food }
  | { type: 'CLOSE_FOOD_MODAL' }
  | { type: 'OPEN_SCANNER_MODAL' }
  | { type: 'CLOSE_SCANNER_MODAL' }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'CLEAR_SEARCH' };

// ==================== REDUCER ====================

export const foodsInitialState: FoodsState = {
  searchQuery: '',
  activeCategory: 'all',
  viewMode: 'grid',
  sortOption: 'name-asc',
  showFoodModal: false,
  showScannerModal: false,
  selectedFood: null,
  favorites: [],
  recentSearches: [],
};

export function foodsReducer(
  state: FoodsState,
  action: FoodsAction
): FoodsState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategory: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_SORT_OPTION':
      return { ...state, sortOption: action.payload };
    case 'OPEN_FOOD_MODAL':
      return { ...state, showFoodModal: true, selectedFood: action.payload };
    case 'CLOSE_FOOD_MODAL':
      return { ...state, showFoodModal: false, selectedFood: null };
    case 'OPEN_SCANNER_MODAL':
      return { ...state, showScannerModal: true };
    case 'CLOSE_SCANNER_MODAL':
      return { ...state, showScannerModal: false };
    case 'TOGGLE_FAVORITE': {
      const isFavorite = state.favorites.includes(action.payload);
      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter(id => id !== action.payload)
          : [...state.favorites, action.payload],
      };
    }
    case 'ADD_RECENT_SEARCH': {
      const filtered = state.recentSearches.filter(s => s !== action.payload);
      return {
        ...state,
        recentSearches: [action.payload, ...filtered].slice(0, 5),
      };
    }
    case 'CLEAR_SEARCH':
      return { ...state, searchQuery: '' };
    default:
      return state;
  }
}

// ==================== CONFIGURATIONS ====================

export const categoryConfig: CategoryConfig[] = [
  { id: 'all', label: 'Tout', emoji: '🍽', count: 2847 },
  { id: 'fruits', label: 'Fruits', emoji: '🍎', count: 156 },
  { id: 'legumes', label: 'Légumes', emoji: '🥬', count: 203 },
  { id: 'viandes', label: 'Viandes', emoji: '🥩', count: 124 },
  { id: 'poissons', label: 'Poissons', emoji: '🐟', count: 89 },
  { id: 'feculents', label: 'Féculents', emoji: '🍚', count: 167 },
  {
    id: 'produits-laitiers',
    label: 'Produits laitiers',
    emoji: '🥛',
    count: 134,
  },
  { id: 'oeufs', label: 'Œufs', emoji: '🥚', count: 23 },
  { id: 'legumineuses', label: 'Légumineuses', emoji: '🫘', count: 45 },
  { id: 'noix-graines', label: 'Noix & Graines', emoji: '🥜', count: 67 },
  { id: 'huiles', label: 'Huiles & Graisses', emoji: '🫒', count: 42 },
  { id: 'boissons', label: 'Boissons', emoji: '🥤', count: 98 },
  { id: 'snacks', label: 'Snacks', emoji: '🍿', count: 156 },
  { id: 'plats-prepares', label: 'Plats préparés', emoji: '🍱', count: 234 },
];

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Trier par nom (A-Z)' },
  { value: 'name-desc', label: 'Trier par nom (Z-A)' },
  { value: 'calories-asc', label: 'Trier par calories (↑)' },
  { value: 'calories-desc', label: 'Trier par calories (↓)' },
  { value: 'protein-desc', label: 'Trier par protéines (↓)' },
];

// ==================== HELPERS ====================

export function filterFoods(
  foods: Food[],
  category: FoodCategory,
  searchQuery: string
): Food[] {
  return foods.filter(food => {
    const matchesCategory = category === 'all' || food.category === category;
    const matchesSearch =
      !searchQuery ||
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.brand &&
        food.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
}

export function sortFoods(foods: Food[], sortOption: SortOption): Food[] {
  const sorted = [...foods];
  switch (sortOption) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'fr'));
    case 'calories-asc':
      return sorted.sort((a, b) => a.calories - b.calories);
    case 'calories-desc':
      return sorted.sort((a, b) => b.calories - a.calories);
    case 'protein-desc':
      return sorted.sort((a, b) => b.protein - a.protein);
    default:
      return sorted;
  }
}

export function calculateNutrition(
  food: Food,
  grams: number
): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
} {
  const multiplier = grams / 100;
  return {
    calories: Math.round(food.calories * multiplier),
    protein: parseFloat((food.protein * multiplier).toFixed(1)),
    carbs: parseFloat((food.carbs * multiplier).toFixed(1)),
    fat: parseFloat((food.fat * multiplier).toFixed(1)),
    fiber: parseFloat((food.fiber * multiplier).toFixed(1)),
  };
}

export function getCategoryLabel(categoryId: FoodCategory): string {
  const category = categoryConfig.find(c => c.id === categoryId);
  return category ? category.label : 'Tous les aliments';
}

export function getCategoryEmoji(categoryId: FoodCategory): string {
  const category = categoryConfig.find(c => c.id === categoryId);
  return category ? category.emoji : '🍽';
}
