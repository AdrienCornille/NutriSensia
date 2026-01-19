'use client';

import React, { useReducer, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  MealsHistoryHeader,
  DateSelectorStrip,
  DayView,
  WeekView,
  ListView,
  DailySidebar,
  AddMealDrawer,
  ConfirmDeleteModal,
} from '@/components/meals-history';
import { getMealTypeConfig } from '@/types/meals-history';
import {
  mealsHistoryReducer,
  initialMealsHistoryState,
} from '@/types/meals-history';
import type { MealType, SelectedFood } from '@/types/meals';
import type { LoggedMeal } from '@/types/meals-history';
import {
  getDailyMealsData,
  getWeeklyMealsData,
  getMealsListData,
  getDailySummaryData,
  getPlanComparisonData,
} from '@/data/mock-meals-history';

export default function MealsHistoryPage() {
  const [state, dispatch] = useReducer(
    mealsHistoryReducer,
    initialMealsHistoryState
  );

  // State for meal duplication
  const [duplicateFoods, setDuplicateFoods] = useState<SelectedFood[] | undefined>(undefined);

  // State for meal editing
  const [editingMeal, setEditingMeal] = useState<LoggedMeal | null>(null);

  // State for meal deletion
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  // Fetch data based on current state
  const dailyData = useMemo(
    () => getDailyMealsData(state.selectedDate),
    [state.selectedDate]
  );

  const weeklyData = useMemo(
    () => getWeeklyMealsData(state.selectedDate),
    [state.selectedDate]
  );

  const listData = useMemo(
    () => getMealsListData(state.listFilter),
    [state.listFilter]
  );

  const summaryData = useMemo(
    () => getDailySummaryData(state.selectedDate),
    [state.selectedDate]
  );

  const planComparison = useMemo(
    () => getPlanComparisonData(state.selectedDate),
    [state.selectedDate]
  );

  // Handlers
  const handleAddMeal = (mealType?: MealType) => {
    dispatch({ type: 'OPEN_ADD_DRAWER', mealType });
  };

  const handleCloseDrawer = () => {
    dispatch({ type: 'CLOSE_DRAWER' });
    setDuplicateFoods(undefined);
    setEditingMeal(null);
  };

  const handleMealSubmit = (mealId?: string) => {
    // TODO: Implement meal submission/update
    if (mealId) {
      console.log('Meal updated:', mealId);
    } else {
      console.log('Meal created');
    }
  };

  const handleToggleExpand = (mealId: string) => {
    dispatch({ type: 'TOGGLE_MEAL_EXPANDED', mealId });
  };

  const handleEditMeal = (mealId: string) => {
    // Find the meal to edit from daily data
    const mealTypes: (keyof typeof dailyData.meals)[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    for (const type of mealTypes) {
      const meal = dailyData.meals[type];
      if (meal && meal.id === mealId) {
        setEditingMeal(meal);
        dispatch({ type: 'OPEN_ADD_DRAWER', mealType: meal.type });
        break;
      }
    }
  };

  const handleDeleteMeal = (mealId: string) => {
    // Open confirmation modal
    setDeletingMealId(mealId);
  };

  const handleConfirmDelete = () => {
    if (deletingMealId) {
      // TODO: Call API to delete meal
      console.log('Meal deleted:', deletingMealId);
      // Collapse expanded meal if it was the one being deleted
      if (state.expandedMealId === deletingMealId) {
        dispatch({ type: 'COLLAPSE_MEAL' });
      }
    }
    setDeletingMealId(null);
  };

  const handleCancelDelete = () => {
    setDeletingMealId(null);
  };

  // Get meal info for delete modal
  const deletingMeal = useMemo(() => {
    if (!deletingMealId) return null;
    const mealTypes: (keyof typeof dailyData.meals)[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    for (const type of mealTypes) {
      const meal = dailyData.meals[type];
      if (meal && meal.id === deletingMealId) {
        return meal;
      }
    }
    return null;
  }, [deletingMealId, dailyData.meals]);

  const handleDuplicateMeal = (meal: LoggedMeal) => {
    // Set the foods to duplicate
    setDuplicateFoods(meal.foods);
    // Open the drawer with the meal type pre-selected
    dispatch({ type: 'OPEN_ADD_DRAWER', mealType: meal.type });
  };

  const handleWeekCellClick = (date: Date, mealType: MealType) => {
    dispatch({ type: 'SET_SELECTED_DATE', date });
    dispatch({ type: 'SET_VIEW_MODE', mode: 'day' });
    dispatch({ type: 'OPEN_ADD_DRAWER', mealType });
  };

  const handleDayClick = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', date });
    dispatch({ type: 'SET_VIEW_MODE', mode: 'day' });
  };

  const handleListMealClick = (mealId: string) => {
    // Find the meal and navigate to its date
    const allGroups = listData.groups;
    for (const group of allGroups) {
      const meal = group.meals.find((m) => m.id === mealId);
      if (meal) {
        dispatch({ type: 'SET_SELECTED_DATE', date: meal.loggedAt });
        dispatch({ type: 'SET_VIEW_MODE', mode: 'day' });
        dispatch({ type: 'TOGGLE_MEAL_EXPANDED', mealId });
        break;
      }
    }
  };

  const handleLoadMore = () => {
    // TODO: Implement pagination
    console.log('Load more meals');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header - Greeting + Notifications */}
      <DashboardHeader />

      {/* Page Header - Title + View Toggle + Add button */}
      <MealsHistoryHeader
        activeView={state.viewMode}
        onViewChange={(mode) => dispatch({ type: 'SET_VIEW_MODE', mode })}
        onAddMeal={() => handleAddMeal()}
        onGoToToday={() => dispatch({ type: 'GO_TO_TODAY' })}
        showTodayButton={state.viewMode !== 'list'}
      />

      {/* Date selector (day and week views only) */}
      {state.viewMode !== 'list' && (
        <DateSelectorStrip
          selectedDate={state.selectedDate}
          onDateSelect={(date) => dispatch({ type: 'SET_SELECTED_DATE', date })}
          onNavigate={(direction) =>
            dispatch({ type: 'NAVIGATE_DATE', direction })
          }
        />
      )}

      {/* Main content */}
      <main className="px-8 py-6">
        <div className="flex gap-6">
          {/* Content area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {state.viewMode === 'day' && (
                <DayView
                  key="day-view"
                  data={dailyData}
                  expandedMealId={state.expandedMealId}
                  onToggleExpand={handleToggleExpand}
                  onAddMeal={handleAddMeal}
                  onEditMeal={handleEditMeal}
                  onDeleteMeal={handleDeleteMeal}
                  onDuplicateMeal={handleDuplicateMeal}
                />
              )}

              {state.viewMode === 'week' && (
                <WeekView
                  key="week-view"
                  data={weeklyData}
                  onCellClick={handleWeekCellClick}
                  onDayClick={handleDayClick}
                />
              )}

              {state.viewMode === 'list' && (
                <ListView
                  key="list-view"
                  data={listData}
                  filter={state.listFilter}
                  onFilterChange={(filter) =>
                    dispatch({ type: 'SET_LIST_FILTER', filter })
                  }
                  onLoadMore={handleLoadMore}
                  onMealClick={handleListMealClick}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar (desktop only) */}
          <DailySidebar
            summaryData={summaryData}
            planComparison={planComparison}
            onViewPlan={() => console.log('View plan')}
            onViewStats={() => console.log('View stats')}
          />
        </div>
      </main>

      {/* Add/Edit meal drawer */}
      <AddMealDrawer
        isOpen={state.isDrawerOpen}
        selectedDate={state.selectedDate}
        preselectedMealType={state.drawerMealType}
        initialFoods={duplicateFoods}
        editingMeal={editingMeal}
        onClose={handleCloseDrawer}
        onSubmit={handleMealSubmit}
      />

      {/* Confirm delete modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingMealId}
        mealName={deletingMeal ? getMealTypeConfig(deletingMeal.type).label : ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
