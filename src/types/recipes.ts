/**
 * Types pour la page Recettes
 */

// ==================== ENUMS ====================

export type RecipeCategory = 'petit-dejeuner' | 'dejeuner' | 'diner' | 'collation' | 'dessert' | 'boisson';
export type RecipeDifficulty = 'Facile' | 'Moyen' | 'Difficile';
export type RecipeTime = '< 15 min' | '15-30 min' | '30-60 min' | '> 1h';
export type RecipeDiet = 'Sans gluten' | 'Sans lactose' | 'Végétarien' | 'Végan' | 'Pauvre en sel' | 'Riche en protéines';
export type RecipesTab = 'discover' | 'favorites' | 'recommended' | 'shopping';

// ==================== INTERFACES ====================

export interface RecipeIngredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  category: RecipeCategory;
  time: string;
  difficulty: RecipeDifficulty;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  rating: number;
  reviews: number;
  isFavorite: boolean;
  isRecommended: boolean;
  tags: string[];
  ingredients?: RecipeIngredient[];
  steps?: string[];
  tips?: string;
}

export interface RecipeFilters {
  category: RecipeCategory[];
  difficulty: RecipeDifficulty[];
  time: RecipeTime[];
  diet: RecipeDiet[];
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  category: string;
}

export interface ShoppingListCategory {
  category: string;
  items: ShoppingListItem[];
}

export interface ShoppingList {
  categories: ShoppingListCategory[];
  weekRange: string;
}

// ==================== STATE ====================

export interface RecipesState {
  activeTab: RecipesTab;
  searchQuery: string;
  showFilters: boolean;
  filters: RecipeFilters;
  selectedRecipe: Recipe | null;
  showRecipeModal: boolean;
  favorites: string[]; // Recipe IDs
  shoppingList: ShoppingList;
}

export const initialRecipesState: RecipesState = {
  activeTab: 'discover',
  searchQuery: '',
  showFilters: false,
  filters: {
    category: [],
    difficulty: [],
    time: [],
    diet: [],
  },
  selectedRecipe: null,
  showRecipeModal: false,
  favorites: [],
  shoppingList: {
    categories: [],
    weekRange: '',
  },
};

// ==================== ACTIONS ====================

export type RecipesAction =
  | { type: 'SET_TAB'; tab: RecipesTab }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'TOGGLE_FILTERS' }
  | { type: 'SET_FILTER'; filterType: keyof RecipeFilters; values: string[] }
  | { type: 'RESET_FILTERS' }
  | { type: 'OPEN_RECIPE_MODAL'; recipe: Recipe }
  | { type: 'CLOSE_RECIPE_MODAL' }
  | { type: 'TOGGLE_FAVORITE'; recipeId: string }
  | { type: 'SET_FAVORITES'; favorites: string[] }
  | { type: 'SET_SHOPPING_LIST'; shoppingList: ShoppingList }
  | { type: 'TOGGLE_SHOPPING_ITEM'; categoryIndex: number; itemId: string }
  | { type: 'ADD_SHOPPING_ITEM'; category: string; item: Omit<ShoppingListItem, 'id'> }
  | { type: 'ADD_RECIPE_TO_SHOPPING_LIST'; ingredients: RecipeIngredient[] };

// ==================== REDUCER ====================

export function recipesReducer(
  state: RecipesState,
  action: RecipesAction
): RecipesState {
  switch (action.type) {
    case 'SET_TAB':
      return {
        ...state,
        activeTab: action.tab,
        showFilters: false,
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.query,
      };

    case 'TOGGLE_FILTERS':
      return {
        ...state,
        showFilters: !state.showFilters,
      };

    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.filterType]: action.values,
        },
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {
          category: [],
          difficulty: [],
          time: [],
          diet: [],
        },
      };

    case 'OPEN_RECIPE_MODAL':
      return {
        ...state,
        selectedRecipe: action.recipe,
        showRecipeModal: true,
      };

    case 'CLOSE_RECIPE_MODAL':
      return {
        ...state,
        showRecipeModal: false,
        selectedRecipe: null,
      };

    case 'TOGGLE_FAVORITE': {
      const isFavorite = state.favorites.includes(action.recipeId);
      const newFavorites = isFavorite
        ? state.favorites.filter((id) => id !== action.recipeId)
        : [...state.favorites, action.recipeId];
      return {
        ...state,
        favorites: newFavorites,
      };
    }

    case 'SET_FAVORITES':
      return {
        ...state,
        favorites: action.favorites,
      };

    case 'SET_SHOPPING_LIST':
      return {
        ...state,
        shoppingList: action.shoppingList,
      };

    case 'TOGGLE_SHOPPING_ITEM': {
      const newCategories = state.shoppingList.categories.map((cat, index) => {
        if (index !== action.categoryIndex) return cat;
        return {
          ...cat,
          items: cat.items.map((item) =>
            item.id === action.itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      });
      return {
        ...state,
        shoppingList: {
          ...state.shoppingList,
          categories: newCategories,
        },
      };
    }

    case 'ADD_SHOPPING_ITEM': {
      const categoryIndex = state.shoppingList.categories.findIndex(
        (cat) => cat.category === action.category
      );
      const newItem: ShoppingListItem = {
        ...action.item,
        id: `item-${Date.now()}`,
      };

      if (categoryIndex === -1) {
        // Create new category
        return {
          ...state,
          shoppingList: {
            ...state.shoppingList,
            categories: [
              ...state.shoppingList.categories,
              { category: action.category, items: [newItem] },
            ],
          },
        };
      }

      // Add to existing category
      const newCategories = state.shoppingList.categories.map((cat, index) => {
        if (index !== categoryIndex) return cat;
        return {
          ...cat,
          items: [...cat.items, newItem],
        };
      });

      return {
        ...state,
        shoppingList: {
          ...state.shoppingList,
          categories: newCategories,
        },
      };
    }

    case 'ADD_RECIPE_TO_SHOPPING_LIST': {
      // Add ingredients to shopping list, merging with existing items
      const newCategories = [...state.shoppingList.categories];
      const othersCategoryIndex = newCategories.findIndex(
        (cat) => cat.category === 'Autres'
      );

      action.ingredients.forEach((ing) => {
        const newItem: ShoppingListItem = {
          id: `item-${Date.now()}-${Math.random()}`,
          name: ing.name,
          quantity: ing.quantity,
          checked: false,
          category: 'Autres',
        };

        if (othersCategoryIndex === -1) {
          newCategories.push({ category: 'Autres', items: [newItem] });
        } else {
          // Check if item already exists
          const existingItem = newCategories[othersCategoryIndex].items.find(
            (item) => item.name.toLowerCase() === ing.name.toLowerCase()
          );
          if (!existingItem) {
            newCategories[othersCategoryIndex].items.push(newItem);
          }
        }
      });

      return {
        ...state,
        shoppingList: {
          ...state.shoppingList,
          categories: newCategories,
        },
      };
    }

    default:
      return state;
  }
}

// ==================== CONFIGURATIONS ====================

export const categoryConfig: Record<
  RecipeCategory,
  { label: string; emoji: string }
> = {
  'petit-dejeuner': { label: 'Petit-déjeuner', emoji: '🌅' },
  dejeuner: { label: 'Déjeuner', emoji: '☀️' },
  diner: { label: 'Dîner', emoji: '🌙' },
  collation: { label: 'Collation', emoji: '🍎' },
  dessert: { label: 'Dessert', emoji: '🍰' },
  boisson: { label: 'Boisson', emoji: '🥤' },
};

export const difficultyOptions: RecipeDifficulty[] = ['Facile', 'Moyen', 'Difficile'];
export const timeOptions: RecipeTime[] = ['< 15 min', '15-30 min', '30-60 min', '> 1h'];
export const dietOptions: RecipeDiet[] = [
  'Sans gluten',
  'Sans lactose',
  'Végétarien',
  'Végan',
  'Pauvre en sel',
  'Riche en protéines',
];

export const tabsConfig: { id: RecipesTab; label: string; icon: string }[] = [
  { id: 'discover', label: 'Découvrir', icon: '🔍' },
  { id: 'favorites', label: 'Favoris', icon: '❤️' },
  { id: 'recommended', label: 'Pour vous', icon: '✨' },
  { id: 'shopping', label: 'Liste de courses', icon: '🛒' },
];

// ==================== HELPERS ====================

export function filterRecipes(
  recipes: Recipe[],
  filters: RecipeFilters,
  searchQuery: string,
  favorites: string[],
  activeTab: RecipesTab
): Recipe[] {
  return recipes.filter((recipe) => {
    // Tab filter
    if (activeTab === 'favorites' && !favorites.includes(recipe.id)) {
      return false;
    }
    if (activeTab === 'recommended' && !recipe.isRecommended) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = recipe.title.toLowerCase().includes(query);
      const matchesTags = recipe.tags.some((tag) =>
        tag.toLowerCase().includes(query)
      );
      const matchesIngredients = recipe.ingredients?.some((ing) =>
        ing.name.toLowerCase().includes(query)
      );
      if (!matchesTitle && !matchesTags && !matchesIngredients) {
        return false;
      }
    }

    // Category filter
    if (filters.category.length > 0 && !filters.category.includes(recipe.category)) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty.length > 0 && !filters.difficulty.includes(recipe.difficulty)) {
      return false;
    }

    // Time filter (simplified matching)
    if (filters.time.length > 0) {
      // This is a simplified check - in production, you'd parse the time properly
      const matchesTime = filters.time.some((timeFilter) => {
        if (timeFilter === '< 15 min') return recipe.time.includes('5 min') || recipe.time.includes('10 min');
        if (timeFilter === '15-30 min') return recipe.time.includes('15') || recipe.time.includes('20') || recipe.time.includes('25') || recipe.time.includes('30');
        if (timeFilter === '30-60 min') return recipe.time.includes('35') || recipe.time.includes('40') || recipe.time.includes('45');
        if (timeFilter === '> 1h') return recipe.time.includes('h');
        return false;
      });
      if (!matchesTime) return false;
    }

    // Diet filter
    if (filters.diet.length > 0) {
      const matchesDiet = filters.diet.some((diet) =>
        recipe.tags.some((tag) => tag.toLowerCase().includes(diet.toLowerCase()))
      );
      if (!matchesDiet) return false;
    }

    return true;
  });
}

export function getActiveFiltersCount(filters: RecipeFilters): number {
  return (
    filters.category.length +
    filters.difficulty.length +
    filters.time.length +
    filters.diet.length
  );
}

export function getShoppingListProgress(shoppingList: ShoppingList): {
  checked: number;
  total: number;
  percentage: number;
} {
  let checked = 0;
  let total = 0;

  shoppingList.categories.forEach((cat) => {
    cat.items.forEach((item) => {
      total++;
      if (item.checked) checked++;
    });
  });

  return {
    checked,
    total,
    percentage: total > 0 ? Math.round((checked / total) * 100) : 0,
  };
}

// ==================== LOCAL STORAGE ====================

const FAVORITES_KEY = 'nutrisensia-recipe-favorites';
const SHOPPING_LIST_KEY = 'nutrisensia-shopping-list';

export function saveFavorites(favorites: string[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function loadFavorites(): string[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
  }
  return [];
}

export function saveShoppingList(shoppingList: ShoppingList): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(shoppingList));
  }
}

export function loadShoppingList(): ShoppingList | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(SHOPPING_LIST_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
  }
  return null;
}
