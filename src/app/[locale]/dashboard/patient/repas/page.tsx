'use client';

import React, { useReducer, useMemo, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQueries } from '@tanstack/react-query';
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
import type { MealType, SelectedFood, NutritionValues } from '@/types/meals';
import type {
  LoggedMeal,
  CaloriesData,
  MacroData,
  MacrosData,
  DailySummaryData,
  PlanComparisonData,
  PlanStatus,
  MacroDeviation,
} from '@/types/meals-history';
import {
  useMeals,
  useMeal,
  useDeleteMeal,
  type MealsResponse,
} from '@/hooks/useMeals';
import {
  transformToDailyMealsData,
  transformToWeeklyData,
  transformToListData,
  transformMealToLoggedMeal,
  formatDateForAPI,
  getWeekDates,
  calculateDailySummary,
  calculatePlanComparison,
} from '@/lib/meals-transformers';
import {
  DAILY_NUTRITION_TARGETS,
  ITEMS_PER_PAGE,
  LOAD_INCREMENT,
  MAX_MEALS_PER_DAY,
  MEALS_STALE_TIME,
} from '@/lib/meals-constants';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';

export default function MealsHistoryPage() {
  const [state, dispatch] = useReducer(
    mealsHistoryReducer,
    initialMealsHistoryState
  );

  // State for meal duplication
  const [duplicateFoods, setDuplicateFoods] = useState<
    SelectedFood[] | undefined
  >(undefined);

  // State for meal editing (store ID, load details with useMeal)
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  // State for meal deletion
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  // State for list pagination
  const [loadedCount, setLoadedCount] = useState(ITEMS_PER_PAGE);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastTitle, setToastTitle] = useState('');

  const showToast = (type: ToastType, title: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastVisible(true);
  };

  // Reset pagination when filter changes
  useEffect(() => {
    setLoadedCount(ITEMS_PER_PAGE);
  }, [state.listFilter]);

  // ============================================================================
  // DATA FETCHING - Meal Details (for editing and expanded view)
  // ============================================================================

  const { data: editingMealDetails } = useMeal(editingMealId || undefined);

  const editingMeal = useMemo(() => {
    if (!editingMealDetails) return null;
    return transformMealToLoggedMeal(editingMealDetails);
  }, [editingMealDetails]);

  // Load full meal details when a meal is expanded (to show foods list)
  const expandedMealIdValid =
    state.expandedMealId && !state.expandedMealId.startsWith('empty-')
      ? state.expandedMealId
      : undefined;

  const { data: expandedMealDetailsRaw } = useMeal(expandedMealIdValid);

  const expandedMealDetails = useMemo(() => {
    if (!expandedMealDetailsRaw) return null;
    return transformMealToLoggedMeal(expandedMealDetailsRaw);
  }, [expandedMealDetailsRaw]);

  // ============================================================================
  // DATA FETCHING - Vue Jour (Day View)
  // ============================================================================

  const selectedDateKey = formatDateForAPI(state.selectedDate);

  const {
    data: dayMealsResponse,
    isLoading: isDayLoading,
    error: dayError,
    refetch: refetchDay,
  } = useMeals(selectedDateKey, undefined, MAX_MEALS_PER_DAY, 0);

  const dailyData = useMemo(() => {
    const allMeals = dayMealsResponse?.meals || [];

    return transformToDailyMealsData(
      allMeals,
      state.selectedDate,
      DAILY_NUTRITION_TARGETS
    );
  }, [dayMealsResponse, state.selectedDate]);

  // ============================================================================
  // DATA FETCHING - Vue Semaine (Week View)
  // ============================================================================

  const weekDates = useMemo(
    () => getWeekDates(state.selectedDate),
    [state.selectedDate]
  );

  const weekQueries = useQueries({
    queries: weekDates.map(date => ({
      queryKey: ['meals', formatDateForAPI(date)],
      queryFn: async () => {
        const response = await fetch(
          `/api/protected/meals?date=${formatDateForAPI(date)}`,
          { credentials: 'include' }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch meals');
        }
        return response.json() as Promise<MealsResponse>;
      },
      staleTime: MEALS_STALE_TIME,
    })),
  });

  const isWeekLoading = weekQueries.some(q => q.isLoading);
  const weekError = weekQueries.find(q => q.error)?.error;

  const weeklyData = useMemo(
    () =>
      transformToWeeklyData(
        weekQueries,
        weekDates,
        DAILY_NUTRITION_TARGETS.calories
      ),
    [weekQueries, weekDates]
  );

  // ============================================================================
  // DATA FETCHING - Vue Liste (List View)
  // ============================================================================

  const {
    data: listMealsResponse,
    isLoading: isListLoading,
    error: listError,
  } = useMeals(
    undefined,
    state.listFilter === 'all' ? undefined : state.listFilter,
    loadedCount,
    0
  );

  const listData = useMemo(
    () => transformToListData(listMealsResponse),
    [listMealsResponse]
  );

  // ============================================================================
  // SIDEBAR DATA
  // ============================================================================

  const summaryData = useMemo(
    () => calculateDailySummary(dayMealsResponse, DAILY_NUTRITION_TARGETS),
    [dayMealsResponse]
  );

  const planComparison = useMemo(
    () => calculatePlanComparison(dayMealsResponse, DAILY_NUTRITION_TARGETS),
    [dayMealsResponse]
  );

  // Handlers
  const handleAddMeal = (mealType?: MealType) => {
    dispatch({ type: 'OPEN_ADD_DRAWER', mealType });
  };

  const handleCloseDrawer = () => {
    dispatch({ type: 'CLOSE_DRAWER' });
    setDuplicateFoods(undefined);
    setEditingMealId(null);
  };

  const handleMealSubmit = () => {
    // Le drawer gère maintenant toute la logique de soumission
    // Callback vide - le drawer invalide déjà les queries React Query
  };

  const handleToggleExpand = (mealId: string) => {
    dispatch({ type: 'TOGGLE_MEAL_EXPANDED', mealId });
  };

  const handleEditMeal = (mealId: string) => {
    // Find the meal type from daily data to pre-select it in the drawer
    const mealTypes: (keyof typeof dailyData.meals)[] = [
      'breakfast',
      'lunch',
      'dinner',
      'snack',
    ];
    for (const type of mealTypes) {
      const meal = dailyData.meals[type];
      if (meal && meal.id === mealId) {
        // Store the ID to trigger useMeal hook
        setEditingMealId(mealId);
        dispatch({ type: 'OPEN_ADD_DRAWER', mealType: meal.type });
        break;
      }
    }
  };

  const handleDeleteMeal = (mealId: string) => {
    // Open confirmation modal
    setDeletingMealId(mealId);
  };

  // Delete meal mutation
  const deleteMeal = useDeleteMeal();

  const handleConfirmDelete = async () => {
    if (!deletingMealId) return;

    try {
      await deleteMeal.mutateAsync(deletingMealId);

      // Collapse expanded meal if it was the one being deleted
      if (state.expandedMealId === deletingMealId) {
        dispatch({ type: 'COLLAPSE_MEAL' });
      }

      showToast('success', 'Repas supprimé avec succès');
      setDeletingMealId(null);
    } catch (error) {
      console.error('Error deleting meal:', error);
      showToast('error', 'Erreur lors de la suppression du repas');
      setDeletingMealId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingMealId(null);
  };

  // Get meal info for delete modal
  const deletingMeal = useMemo(() => {
    if (!deletingMealId) return null;
    const mealTypes: (keyof typeof dailyData.meals)[] = [
      'breakfast',
      'lunch',
      'dinner',
      'snack',
    ];
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
      const meal = group.meals.find(m => m.id === mealId);
      if (meal) {
        dispatch({ type: 'SET_SELECTED_DATE', date: meal.loggedAt });
        dispatch({ type: 'SET_VIEW_MODE', mode: 'day' });
        dispatch({ type: 'TOGGLE_MEAL_EXPANDED', mealId });
        break;
      }
    }
  };

  const handleLoadMore = () => {
    setLoadedCount(prev => prev + LOAD_INCREMENT);
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Dashboard Header - Greeting + Notifications */}
      <DashboardHeader />

      {/* Page Header - Title + View Toggle + Add button */}
      <MealsHistoryHeader
        activeView={state.viewMode}
        onViewChange={mode => dispatch({ type: 'SET_VIEW_MODE', mode })}
        onAddMeal={() => handleAddMeal()}
        onGoToToday={() => dispatch({ type: 'GO_TO_TODAY' })}
        showTodayButton={state.viewMode !== 'list'}
      />

      {/* Date selector (day and week views only) */}
      {state.viewMode !== 'list' && (
        <DateSelectorStrip
          selectedDate={state.selectedDate}
          onDateSelect={date => dispatch({ type: 'SET_SELECTED_DATE', date })}
          onNavigate={direction =>
            dispatch({ type: 'NAVIGATE_DATE', direction })
          }
        />
      )}

      {/* Main content */}
      <main className='px-8 py-6'>
        <div className='flex gap-6'>
          {/* Content area */}
          <div className='flex-1'>
            {/* Loading state */}
            {state.viewMode === 'day' && isDayLoading && (
              <div className='flex justify-center items-center py-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              </div>
            )}

            {/* Error state */}
            {state.viewMode === 'day' && dayError && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
                <p className='text-red-800'>Impossible de charger les repas</p>
                <button
                  onClick={() => refetchDay()}
                  className='mt-2 text-primary underline'
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Loading state for Week view */}
            {state.viewMode === 'week' && isWeekLoading && (
              <div className='flex justify-center items-center py-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              </div>
            )}

            {/* Error state for Week view */}
            {state.viewMode === 'week' && weekError && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
                <p className='text-red-800'>
                  Impossible de charger les repas de la semaine
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className='mt-2 text-primary underline'
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Loading state for List view */}
            {state.viewMode === 'list' &&
              isListLoading &&
              loadedCount === ITEMS_PER_PAGE && (
                <div className='flex justify-center items-center py-12'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                </div>
              )}

            {/* Error state for List view */}
            {state.viewMode === 'list' && listError && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
                <p className='text-red-800'>
                  Impossible de charger l'historique des repas
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className='mt-2 text-primary underline'
                >
                  Réessayer
                </button>
              </div>
            )}

            <AnimatePresence mode='wait'>
              {state.viewMode === 'day' && !isDayLoading && !dayError && (
                <DayView
                  key='day-view'
                  data={dailyData}
                  expandedMealId={state.expandedMealId}
                  expandedMealDetails={expandedMealDetails}
                  onToggleExpand={handleToggleExpand}
                  onAddMeal={handleAddMeal}
                  onEditMeal={handleEditMeal}
                  onDeleteMeal={handleDeleteMeal}
                  onDuplicateMeal={handleDuplicateMeal}
                />
              )}

              {state.viewMode === 'week' && !isWeekLoading && !weekError && (
                <WeekView
                  key='week-view'
                  data={weeklyData}
                  onCellClick={handleWeekCellClick}
                  onDayClick={handleDayClick}
                />
              )}

              {state.viewMode === 'list' && !isListLoading && !listError && (
                <ListView
                  key='list-view'
                  data={listData}
                  filter={state.listFilter}
                  onFilterChange={filter =>
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
            onViewPlan={() => {
              // TODO: Naviguer vers la page du plan alimentaire
            }}
            onViewStats={() => {
              // TODO: Ouvrir le modal des statistiques détaillées
            }}
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
        mealName={
          deletingMeal ? getMealTypeConfig(deletingMeal.type).label : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Toast Notifications */}
      <Toast
        isVisible={toastVisible}
        type={toastType}
        title={toastTitle}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
