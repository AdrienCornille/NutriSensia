'use client';

import React, { useReducer, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  RecipesHeader,
  RecipesTabs,
  RecipeFilters,
  RecipesGrid,
  RecipeModal,
  ShoppingListView,
} from '@/components/recipes';
import {
  recipesReducer,
  initialRecipesState,
  filterRecipes,
  getActiveFiltersCount,
  saveFavorites,
  loadFavorites,
  saveShoppingList,
  loadShoppingList,
} from '@/types/recipes';
import type {
  Recipe,
  RecipesTab,
  RecipeFilters as RecipeFiltersType,
} from '@/types/recipes';
import { getRecipes, getShoppingList } from '@/data/mock-recipes';

export default function RecipesPage() {
  const [state, dispatch] = useReducer(recipesReducer, initialRecipesState);
  const recipes = getRecipes();

  // Load favorites and shopping list from localStorage on mount
  useEffect(() => {
    const savedFavorites = loadFavorites();
    if (savedFavorites.length > 0) {
      dispatch({ type: 'SET_FAVORITES', favorites: savedFavorites });
    }

    const savedShoppingList = loadShoppingList();
    if (savedShoppingList) {
      dispatch({ type: 'SET_SHOPPING_LIST', shoppingList: savedShoppingList });
    } else {
      // Load mock shopping list if no saved list
      const mockList = getShoppingList();
      dispatch({ type: 'SET_SHOPPING_LIST', shoppingList: mockList });
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    saveFavorites(state.favorites);
  }, [state.favorites]);

  // Save shopping list to localStorage when it changes
  useEffect(() => {
    saveShoppingList(state.shoppingList);
  }, [state.shoppingList]);

  // Filter recipes based on current state
  const filteredRecipes = filterRecipes(
    recipes,
    state.filters,
    state.searchQuery,
    state.favorites,
    state.activeTab
  );

  // Handlers
  const handleTabChange = useCallback((tab: RecipesTab) => {
    dispatch({ type: 'SET_TAB', tab });
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', query });
  }, []);

  const handleToggleFilters = useCallback(() => {
    dispatch({ type: 'TOGGLE_FILTERS' });
  }, []);

  const handleFilterChange = useCallback(
    (filterType: keyof RecipeFiltersType, values: string[]) => {
      dispatch({ type: 'SET_FILTER', filterType, values });
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const handleRecipeClick = useCallback((recipe: Recipe) => {
    dispatch({ type: 'OPEN_RECIPE_MODAL', recipe });
  }, []);

  const handleCloseModal = useCallback(() => {
    dispatch({ type: 'CLOSE_RECIPE_MODAL' });
  }, []);

  const handleToggleFavorite = useCallback((recipeId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', recipeId });
  }, []);

  const handleAddToShoppingList = useCallback((recipe: Recipe) => {
    if (recipe.ingredients) {
      dispatch({
        type: 'ADD_RECIPE_TO_SHOPPING_LIST',
        ingredients: recipe.ingredients,
      });
    }
    dispatch({ type: 'CLOSE_RECIPE_MODAL' });
  }, []);

  const handleToggleShoppingItem = useCallback(
    (categoryIndex: number, itemId: string) => {
      dispatch({ type: 'TOGGLE_SHOPPING_ITEM', categoryIndex, itemId });
    },
    []
  );

  const activeFiltersCount = getActiveFiltersCount(state.filters);

  // Get empty message based on tab
  const getEmptyMessage = () => {
    switch (state.activeTab) {
      case 'favorites':
        return "Vous n'avez pas encore de recettes favorites";
      case 'recommended':
        return 'Aucune recette recommandée pour le moment';
      default:
        return 'Aucune recette ne correspond à vos critères';
    }
  };

  const getEmptyIcon = () => {
    switch (state.activeTab) {
      case 'favorites':
        return '❤️';
      case 'recommended':
        return '✨';
      default:
        return '🍽️';
    }
  };

  return (
    <div className='min-h-screen'>
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Recipes Header with Search */}
      <RecipesHeader
        searchQuery={state.searchQuery}
        onSearchChange={handleSearchChange}
        onToggleFilters={handleToggleFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Tabs */}
      <RecipesTabs
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
        favoritesCount={state.favorites.length}
      />

      {/* Filters Panel */}
      <RecipeFilters
        isOpen={state.showFilters}
        filters={state.filters}
        onClose={handleToggleFilters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Content based on active tab */}
      {state.activeTab === 'shopping' ? (
        <ShoppingListView
          shoppingList={state.shoppingList}
          onToggleItem={handleToggleShoppingItem}
        />
      ) : (
        <RecipesGrid
          recipes={filteredRecipes}
          favorites={state.favorites}
          onToggleFavorite={handleToggleFavorite}
          onRecipeClick={handleRecipeClick}
          emptyMessage={getEmptyMessage()}
          emptyIcon={getEmptyIcon()}
        />
      )}

      {/* Recipe Detail Modal */}
      <RecipeModal
        isOpen={state.showRecipeModal}
        recipe={state.selectedRecipe}
        isFavorite={
          state.selectedRecipe
            ? state.favorites.includes(state.selectedRecipe.id)
            : false
        }
        onClose={handleCloseModal}
        onToggleFavorite={handleToggleFavorite}
        onAddToShoppingList={handleAddToShoppingList}
      />
    </div>
  );
}
