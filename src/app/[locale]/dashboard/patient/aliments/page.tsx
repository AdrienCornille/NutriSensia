'use client';

import React, { useReducer, useEffect, useState } from 'react';
import {
  foodsReducer,
  foodsInitialState,
  filterFoods,
  sortFoods,
  type FoodCategory,
  type ViewMode,
  type SortOption,
  type Food,
} from '@/types/foods';
import {
  mockFoodsDatabase,
  defaultRecentSearches,
  defaultFavorites,
  getFavoriteFoods,
} from '@/data/mock-foods-database';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  FoodsHeader,
  FoodsTabs,
  FoodsCategoryFilter,
  FoodsGrid,
  FoodsList,
  FoodModal,
  ScannerModal,
  type FoodsTab,
} from '@/components/foods';

const STORAGE_KEY = 'nutrisensia-foods-favorites';
const VIEW_MODE_KEY = 'nutrisensia-foods-view-mode';

export default function AlimentsPage() {
  const [state, dispatch] = useReducer(foodsReducer, {
    ...foodsInitialState,
    recentSearches: defaultRecentSearches,
    favorites: defaultFavorites,
  });

  const [activeTab, setActiveTab] = useState<FoodsTab>('all');

  // Load favorites and view mode from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem(STORAGE_KEY);
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      favorites.forEach((id: string) => {
        if (!state.favorites.includes(id)) {
          dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
        }
      });
    }

    const savedViewMode = localStorage.getItem(
      VIEW_MODE_KEY
    ) as ViewMode | null;
    if (
      savedViewMode &&
      (savedViewMode === 'grid' || savedViewMode === 'list')
    ) {
      dispatch({ type: 'SET_VIEW_MODE', payload: savedViewMode });
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.favorites));
  }, [state.favorites]);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, state.viewMode);
  }, [state.viewMode]);

  // Filter and sort foods
  const filteredFoods = filterFoods(
    mockFoodsDatabase,
    state.activeCategory,
    state.searchQuery
  );

  // Apply tab filter (all vs favorites)
  const tabFilteredFoods =
    activeTab === 'favorites'
      ? filteredFoods.filter(food => state.favorites.includes(food.id))
      : filteredFoods;

  const sortedFoods = sortFoods(tabFilteredFoods, state.sortOption);

  // Get favorite foods for count
  const favoriteFoods = getFavoriteFoods(state.favorites);

  // Handlers
  const handleSearchChange = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const handleCategoryChange = (category: FoodCategory) => {
    dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: category });
    dispatch({ type: 'CLEAR_SEARCH' });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const handleSortChange = (option: SortOption) => {
    dispatch({ type: 'SET_SORT_OPTION', payload: option });
  };

  const handleOpenScanner = () => {
    dispatch({ type: 'OPEN_SCANNER_MODAL' });
  };

  const handleCloseScanner = () => {
    dispatch({ type: 'CLOSE_SCANNER_MODAL' });
  };

  const handleRecentSearchClick = (term: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: term });
  };

  const handleFoodClick = (food: Food) => {
    dispatch({ type: 'OPEN_FOOD_MODAL', payload: food });
    if (state.searchQuery) {
      dispatch({ type: 'ADD_RECENT_SEARCH', payload: state.searchQuery });
    }
  };

  const handleCloseFoodModal = () => {
    dispatch({ type: 'CLOSE_FOOD_MODAL' });
  };

  const handleToggleFavorite = (foodId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: foodId });
  };

  const handleTabChange = (tab: FoodsTab) => {
    setActiveTab(tab);
  };

  const isFoodFavorite = state.selectedFood
    ? state.favorites.includes(state.selectedFood.id)
    : false;

  return (
    <div className='min-h-screen'>
      <DashboardHeader />

      <FoodsHeader
        searchQuery={state.searchQuery}
        viewMode={state.viewMode}
        sortOption={state.sortOption}
        recentSearches={state.recentSearches}
        totalFoods={mockFoodsDatabase.length}
        onSearchChange={handleSearchChange}
        onViewModeChange={handleViewModeChange}
        onSortChange={handleSortChange}
        onOpenScanner={handleOpenScanner}
        onRecentSearchClick={handleRecentSearchClick}
      />

      <FoodsTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        favoritesCount={favoriteFoods.length}
      />

      <FoodsCategoryFilter
        activeCategory={state.activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {state.viewMode === 'grid' ? (
        <FoodsGrid
          foods={sortedFoods}
          favorites={state.favorites}
          emptyMessage={
            activeTab === 'favorites'
              ? 'Aucun aliment favori'
              : 'Aucun aliment trouvé'
          }
          emptyIcon={activeTab === 'favorites' ? '❤️' : '🔍'}
          onToggleFavorite={handleToggleFavorite}
          onFoodClick={handleFoodClick}
        />
      ) : (
        <FoodsList
          foods={sortedFoods}
          favorites={state.favorites}
          emptyMessage={
            activeTab === 'favorites'
              ? 'Aucun aliment favori'
              : 'Aucun aliment trouvé'
          }
          emptyIcon={activeTab === 'favorites' ? '❤️' : '🔍'}
          onToggleFavorite={handleToggleFavorite}
          onFoodClick={handleFoodClick}
        />
      )}

      <FoodModal
        isOpen={state.showFoodModal}
        food={state.selectedFood}
        isFavorite={isFoodFavorite}
        onClose={handleCloseFoodModal}
        onToggleFavorite={handleToggleFavorite}
      />

      <ScannerModal
        isOpen={state.showScannerModal}
        onClose={handleCloseScanner}
      />
    </div>
  );
}
