/**
 * Types pour les Recettes NutriSensia
 * DB types + transformers + client types
 */

import { AUTO_TAG_LABELS, TAG_GROUP_MAP } from '@/lib/recipe-auto-tags';

// ==================== DB ENUMS ====================

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeStatus = 'draft' | 'published';

// ==================== DB TYPES ====================

export interface RecipeCategoryDB {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string | null;
  emoji: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeTagDB {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string | null;
  tag_type: string;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RecipeAutoTagDB {
  recipe_id: string;
  tag_group: string;
  tag_value: string;
}

export interface RecipeDB {
  id: string;
  category_id: string | null; // DEPRECATED — use recipe_tag_assignments
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  difficulty: RecipeDifficulty;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  servings: number;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  average_rating: number;
  rating_count: number;
  tips: string | null;
  source: string | null;
  created_by: string | null;
  is_official: boolean;
  is_recommended: boolean;
  recommended_for: string[] | null;
  status: RecipeStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Joined fields
  recipe_categories?: RecipeCategoryDB | null;
  recipe_tag_assignments?: { tag_id: string; recipe_tags?: RecipeTagDB }[];
  recipe_auto_tags?: RecipeAutoTagDB[];
  recipe_ingredients?: RecipeIngredientDB[];
  recipe_steps?: RecipeStepDB[];
}

export interface RecipeIngredientDB {
  id: string;
  recipe_id: string;
  food_id: string | null;
  name: string;
  quantity: string;
  quantity_value: number | null;
  quantity_unit: string | null;
  is_optional: boolean;
  substitution_notes: string | null;
  group_name: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  foods?: {
    calories: number;
    proteins: number;
    carbohydrates: number;
    fat: number;
    fiber: number | null;
  } | null;
}

export interface RecipeStepDB {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  image_url: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  tips: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== CLIENT TYPES ====================

export interface RecipeCategoryClient {
  id: string;
  slug: string;
  label: string;
  emoji: string | null;
}

export interface RecipeTagClient {
  id: string;
  slug: string;
  label: string;
  tagType: string;
  color: string | null;
}

export interface RecipeAutoTag {
  group: string;
  value: string;
  label: string;
  color: string;
}

export interface NutriRecipe {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  category: RecipeCategoryClient | null;
  difficulty: RecipeDifficulty;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  averageRating: number;
  ratingCount: number;
  tips: string | null;
  status: RecipeStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: RecipeTagClient[];
  autoTags: RecipeAutoTag[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface RecipeIngredient {
  id: string;
  foodId: string | null;
  name: string;
  quantity: string;
  quantityValue: number | null;
  quantityUnit: string | null;
  isOptional: boolean;
  substitutionNotes: string | null;
  groupName: string | null;
  displayOrder: number;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number | null;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  imageUrl: string | null;
  durationMinutes: number | null;
  tips: string | null;
}

// ==================== TRANSFORMERS ====================

export function transformCategoryFromDB(
  c: RecipeCategoryDB
): RecipeCategoryClient {
  return {
    id: c.id,
    slug: c.slug,
    label: c.name_fr,
    emoji: c.emoji,
  };
}

export function transformTagFromDB(t: RecipeTagDB): RecipeTagClient {
  return {
    id: t.id,
    slug: t.slug,
    label: t.name_fr,
    tagType: t.tag_type,
    color: t.color,
  };
}

export function transformIngredientFromDB(
  i: RecipeIngredientDB
): RecipeIngredient {
  return {
    id: i.id,
    foodId: i.food_id,
    name: i.name,
    quantity: i.quantity,
    quantityValue: i.quantity_value,
    quantityUnit: i.quantity_unit,
    isOptional: i.is_optional,
    substitutionNotes: i.substitution_notes,
    groupName: i.group_name,
    displayOrder: i.display_order,
    ...(i.foods
      ? {
          caloriesPer100g: i.foods.calories,
          proteinPer100g: i.foods.proteins,
          carbsPer100g: i.foods.carbohydrates,
          fatPer100g: i.foods.fat,
          fiberPer100g: i.foods.fiber,
        }
      : {}),
  };
}

export function transformStepFromDB(s: RecipeStepDB): RecipeStep {
  return {
    id: s.id,
    stepNumber: s.step_number,
    instruction: s.instruction,
    imageUrl: s.image_url,
    durationMinutes: s.duration_minutes,
    tips: s.tips,
  };
}

export function transformAutoTagFromDB(at: RecipeAutoTagDB): RecipeAutoTag {
  const groupConfig = TAG_GROUP_MAP[at.tag_group as keyof typeof TAG_GROUP_MAP];
  return {
    group: at.tag_group,
    value: at.tag_value,
    label: AUTO_TAG_LABELS[at.tag_value] || at.tag_value,
    color: groupConfig?.color || '#6B7280',
  };
}

export function transformRecipeFromDB(r: RecipeDB): NutriRecipe {
  const category = r.recipe_categories
    ? transformCategoryFromDB(r.recipe_categories)
    : null;

  const tags = (r.recipe_tag_assignments || [])
    .filter(rta => rta.recipe_tags)
    .map(rta => transformTagFromDB(rta.recipe_tags!));

  const autoTags = (r.recipe_auto_tags || []).map(transformAutoTagFromDB);

  const ingredients = (r.recipe_ingredients || [])
    .sort((a, b) => a.display_order - b.display_order)
    .map(transformIngredientFromDB);

  const steps = (r.recipe_steps || [])
    .sort((a, b) => a.step_number - b.step_number)
    .map(transformStepFromDB);

  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    description: r.description,
    imageUrl: r.image_url,
    category,
    difficulty: r.difficulty,
    prepTimeMinutes: r.prep_time_minutes,
    cookTimeMinutes: r.cook_time_minutes,
    totalTimeMinutes: r.total_time_minutes,
    servings: r.servings,
    calories: r.calories,
    proteinG: r.protein_g,
    carbsG: r.carbs_g,
    fatG: r.fat_g,
    fiberG: r.fiber_g,
    averageRating: r.average_rating,
    ratingCount: r.rating_count,
    tips: r.tips,
    status: r.status,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    tags,
    autoTags,
    ingredients,
    steps,
  };
}

// ==================== UI CONFIGS ====================

export const DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
};

export const DIFFICULTY_COLORS: Record<RecipeDifficulty, string> = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-orange-600 bg-orange-50',
  hard: 'text-red-600 bg-red-50',
};

export const STATUS_LABELS: Record<RecipeStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
};

export const STATUS_COLORS: Record<RecipeStatus, string> = {
  draft: 'text-gray-600 bg-gray-100',
  published: 'text-green-700 bg-green-100',
};

// ==================== PATIENT-SIDE LEGACY TYPES ====================
// Used by existing patient recipe components (mock data)
// TODO: Refactor patient components to use Recipe type in Phase 2

export type LegacyRecipeCategory =
  | 'petit-dejeuner'
  | 'dejeuner'
  | 'diner'
  | 'collation'
  | 'dessert'
  | 'boisson';
export type LegacyRecipeDifficulty = 'Facile' | 'Moyen' | 'Difficile';
export type LegacyRecipeTime = '< 15 min' | '15-30 min' | '30-60 min' | '> 1h';
export type LegacyRecipeDiet =
  | 'Sans gluten'
  | 'Sans lactose'
  | 'Végétarien'
  | 'Végan'
  | 'Pauvre en sel'
  | 'Riche en protéines';
export type RecipesTab =
  | 'discover'
  | 'favorites'
  | 'recommended'
  | 'cooked'
  | 'shopping';

export interface LegacyRecipeIngredient {
  name: string;
  quantity: string;
}

export interface LegacyRecipe {
  id: string;
  title: string;
  image: string;
  category: LegacyRecipeCategory;
  time: string;
  difficulty: LegacyRecipeDifficulty;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  rating: number;
  reviews: number;
  isFavorite: boolean;
  isRecommended: boolean;
  tags: string[];
  ingredients?: LegacyRecipeIngredient[];
  steps?: string[];
  tips?: string;
}

export interface RecipeFilters {
  category: LegacyRecipeCategory[];
  difficulty: LegacyRecipeDifficulty[];
  time: LegacyRecipeTime[];
  diet: LegacyRecipeDiet[];
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

export interface RecipesState {
  activeTab: RecipesTab;
  searchQuery: string;
  showFilters: boolean;
  filters: RecipeFilters;
  selectedRecipe: LegacyRecipe | null;
  showRecipeModal: boolean;
  favorites: string[];
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

export type RecipesAction =
  | { type: 'SET_TAB'; tab: RecipesTab }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'TOGGLE_FILTERS' }
  | { type: 'SET_FILTER'; filterType: keyof RecipeFilters; values: string[] }
  | { type: 'RESET_FILTERS' }
  | { type: 'OPEN_RECIPE_MODAL'; recipe: LegacyRecipe }
  | { type: 'CLOSE_RECIPE_MODAL' }
  | { type: 'TOGGLE_FAVORITE'; recipeId: string }
  | { type: 'SET_FAVORITES'; favorites: string[] }
  | { type: 'SET_SHOPPING_LIST'; shoppingList: ShoppingList }
  | { type: 'TOGGLE_SHOPPING_ITEM'; categoryIndex: number; itemId: string }
  | {
      type: 'ADD_SHOPPING_ITEM';
      category: string;
      item: Omit<ShoppingListItem, 'id'>;
    }
  | {
      type: 'ADD_RECIPE_TO_SHOPPING_LIST';
      ingredients: LegacyRecipeIngredient[];
    };

export function recipesReducer(
  state: RecipesState,
  action: RecipesAction
): RecipesState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab, showFilters: false };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };
    case 'TOGGLE_FILTERS':
      return { ...state, showFilters: !state.showFilters };
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.filterType]: action.values },
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: { category: [], difficulty: [], time: [], diet: [] },
      };
    case 'OPEN_RECIPE_MODAL':
      return { ...state, selectedRecipe: action.recipe, showRecipeModal: true };
    case 'CLOSE_RECIPE_MODAL':
      return { ...state, showRecipeModal: false, selectedRecipe: null };
    case 'TOGGLE_FAVORITE': {
      const isFav = state.favorites.includes(action.recipeId);
      return {
        ...state,
        favorites: isFav
          ? state.favorites.filter(id => id !== action.recipeId)
          : [...state.favorites, action.recipeId],
      };
    }
    case 'SET_FAVORITES':
      return { ...state, favorites: action.favorites };
    case 'SET_SHOPPING_LIST':
      return { ...state, shoppingList: action.shoppingList };
    case 'TOGGLE_SHOPPING_ITEM': {
      const cats = state.shoppingList.categories.map((cat, i) =>
        i !== action.categoryIndex
          ? cat
          : {
              ...cat,
              items: cat.items.map(item =>
                item.id === action.itemId
                  ? { ...item, checked: !item.checked }
                  : item
              ),
            }
      );
      return {
        ...state,
        shoppingList: { ...state.shoppingList, categories: cats },
      };
    }
    case 'ADD_SHOPPING_ITEM': {
      const idx = state.shoppingList.categories.findIndex(
        c => c.category === action.category
      );
      const newItem: ShoppingListItem = {
        ...action.item,
        id: `item-${Date.now()}`,
      };
      if (idx === -1) {
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
      const cats = state.shoppingList.categories.map((cat, i) =>
        i !== idx ? cat : { ...cat, items: [...cat.items, newItem] }
      );
      return {
        ...state,
        shoppingList: { ...state.shoppingList, categories: cats },
      };
    }
    case 'ADD_RECIPE_TO_SHOPPING_LIST': {
      const newCats = [...state.shoppingList.categories];
      let othersIdx = newCats.findIndex(c => c.category === 'Autres');
      action.ingredients.forEach(ing => {
        const newItem: ShoppingListItem = {
          id: `item-${Date.now()}-${Math.random()}`,
          name: ing.name,
          quantity: ing.quantity,
          checked: false,
          category: 'Autres',
        };
        if (othersIdx === -1) {
          newCats.push({ category: 'Autres', items: [newItem] });
          othersIdx = newCats.length - 1;
        } else {
          const exists = newCats[othersIdx].items.find(
            it => it.name.toLowerCase() === ing.name.toLowerCase()
          );
          if (!exists) newCats[othersIdx].items.push(newItem);
        }
      });
      return {
        ...state,
        shoppingList: { ...state.shoppingList, categories: newCats },
      };
    }
    default:
      return state;
  }
}

// Legacy configs
export const categoryConfig: Record<
  LegacyRecipeCategory,
  { label: string; emoji: string }
> = {
  'petit-dejeuner': { label: 'Petit-déjeuner', emoji: '🌅' },
  dejeuner: { label: 'Déjeuner', emoji: '☀️' },
  diner: { label: 'Dîner', emoji: '🌙' },
  collation: { label: 'Collation', emoji: '🍎' },
  dessert: { label: 'Dessert', emoji: '🍰' },
  boisson: { label: 'Boisson', emoji: '🥤' },
};

export const difficultyOptions: LegacyRecipeDifficulty[] = [
  'Facile',
  'Moyen',
  'Difficile',
];
export const timeOptions: LegacyRecipeTime[] = [
  '< 15 min',
  '15-30 min',
  '30-60 min',
  '> 1h',
];
export const dietOptions: LegacyRecipeDiet[] = [
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

export function filterRecipes(
  recipes: LegacyRecipe[],
  filters: RecipeFilters,
  searchQuery: string,
  favorites: string[],
  activeTab: RecipesTab
): LegacyRecipe[] {
  return recipes.filter(recipe => {
    if (activeTab === 'favorites' && !favorites.includes(recipe.id))
      return false;
    if (activeTab === 'recommended' && !recipe.isRecommended) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = recipe.title.toLowerCase().includes(q);
      const matchesTags = recipe.tags.some(tag =>
        tag.toLowerCase().includes(q)
      );
      const matchesIngredients = recipe.ingredients?.some(ing =>
        ing.name.toLowerCase().includes(q)
      );
      if (!matchesTitle && !matchesTags && !matchesIngredients) return false;
    }
    if (
      filters.category.length > 0 &&
      !filters.category.includes(recipe.category)
    )
      return false;
    if (
      filters.difficulty.length > 0 &&
      !filters.difficulty.includes(recipe.difficulty)
    )
      return false;
    if (filters.time.length > 0) {
      const matchesTime = filters.time.some(tf => {
        if (tf === '< 15 min')
          return (
            recipe.time.includes('5 min') || recipe.time.includes('10 min')
          );
        if (tf === '15-30 min')
          return (
            recipe.time.includes('15') ||
            recipe.time.includes('20') ||
            recipe.time.includes('25') ||
            recipe.time.includes('30')
          );
        if (tf === '30-60 min')
          return (
            recipe.time.includes('35') ||
            recipe.time.includes('40') ||
            recipe.time.includes('45')
          );
        if (tf === '> 1h') return recipe.time.includes('h');
        return false;
      });
      if (!matchesTime) return false;
    }
    if (filters.diet.length > 0) {
      const matchesDiet = filters.diet.some(diet =>
        recipe.tags.some(tag => tag.toLowerCase().includes(diet.toLowerCase()))
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
  shoppingList.categories.forEach(cat => {
    cat.items.forEach(item => {
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

const FAVORITES_KEY = 'nutrisensia-recipe-favorites';
const SHOPPING_LIST_KEY = 'nutrisensia-shopping-list';

export function saveFavorites(favorites: string[]): void {
  if (typeof window !== 'undefined')
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
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
  if (typeof window !== 'undefined')
    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(shoppingList));
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

// ==================== BACKWARD-COMPAT ALIASES ====================
// Patient components import these names — keep until Phase 2 refactor

// Re-export legacy types under their old names for patient-side components
export { type LegacyRecipe as Recipe };
export { type LegacyRecipeCategory as RecipeCategory };
export { type LegacyRecipeDifficulty as RecipeDifficultyLegacy };
export { type LegacyRecipeTime as RecipeTime };
export { type LegacyRecipeDiet as RecipeDiet };
