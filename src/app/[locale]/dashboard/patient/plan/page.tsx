'use client';

import React, { useReducer, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  MealPlanHeader,
  DaySelector,
  DailyObjectivesDropdown,
  MealCard,
  WeeklyOverview,
  WeeklyMealGrid,
  PlanInfoCard,
  ShoppingListCTA,
  ModificationRequest,
  ShoppingListModal,
  PatientAdherenceCard,
} from '@/components/meal-plan';
import {
  mealPlanReducer,
  initialMealPlanState,
  findTodayIndex,
  calculateDailyPlanTotal,
  mealTypeConfig,
} from '@/types/meal-plan';
import type {
  PlanMealType,
  ModificationRequestFormData,
} from '@/types/meal-plan';
import {
  usePatientActivePlan,
  usePatientPlanDays,
  usePatientModificationRequests,
  useCreateModificationRequest,
  usePatientShoppingList,
} from '@/hooks/usePatientMealPlan';
import {
  buildWeekDaysFromPlan,
  mapDayToDaily,
  mapDaysToWeekly,
  mapPlanToInfo,
  mapModRequestToUI,
  mapShoppingListToUI,
  formatWeekRangeFromPlan,
} from '@/lib/meal-plan-adapters';

/**
 * Page Plan Alimentaire
 *
 * PLAN-001: Vue d'ensemble du plan alimentaire
 * - Affichage des objectifs journaliers (macros + micros) en dropdown compact
 * - Vue jour avec détails des repas (3/4) + adhérence (1/4)
 * - Vue semaine avec grille récapitulative
 */

export default function MealPlanPage() {
  const [state, dispatch] = useReducer(mealPlanReducer, initialMealPlanState);

  // Fetch real data
  const { data: planData, isLoading: planLoading } = usePatientActivePlan();
  const plan = planData?.plan ?? null;

  const { data: daysData, isLoading: daysLoading } = usePatientPlanDays(!!plan);
  const { data: modRequestsData } = usePatientModificationRequests(!!plan);
  const createRequest = useCreateModificationRequest();

  // Shopping list (on-demand)
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [fetchShoppingList, setFetchShoppingList] = useState(false);
  const { data: shoppingListData } = usePatientShoppingList(fetchShoppingList);

  const isLoading = planLoading || (!!plan && daysLoading);

  // Derive UI data from API responses
  const weekDays = useMemo(() => {
    if (!plan) return [];
    return buildWeekDaysFromPlan(plan.start_date, plan.days_count || 7);
  }, [plan]);

  const planInfo = useMemo(() => {
    if (!plan) return null;
    return mapPlanToInfo(plan);
  }, [plan]);

  const weekRange = useMemo(() => {
    if (!plan) return '';
    return formatWeekRangeFromPlan(plan.start_date, plan.end_date);
  }, [plan]);

  // Données du jour sélectionné
  const selectedDay = weekDays[state.selectedDayIndex];
  const dailyData = useMemo(() => {
    if (!daysData || !plan || !selectedDay) return null;
    const dayIndex = state.selectedDayIndex;
    const dbDay = daysData[dayIndex];
    if (!dbDay) return null;
    return mapDayToDaily(dbDay, plan.nutritional_targets);
  }, [daysData, plan, state.selectedDayIndex, selectedDay]);

  // Calcul des totaux du plan pour le jour sélectionné
  const dailyTotals = useMemo(
    () => (dailyData ? calculateDailyPlanTotal(dailyData.meals) : null),
    [dailyData]
  );

  // Données de la semaine
  const weeklyData = useMemo(() => {
    if (!daysData || !plan || weekDays.length === 0) return null;
    return mapDaysToWeekly(daysData, weekDays, plan.nutritional_targets);
  }, [daysData, plan, weekDays]);

  // Modification requests
  const modificationRequests = useMemo(
    () => (modRequestsData || []).map(mapModRequestToUI),
    [modRequestsData]
  );

  // Shopping list mapped to UI
  const shoppingList = useMemo(() => {
    if (!shoppingListData || !planInfo) return null;
    return mapShoppingListToUI(
      shoppingListData.items,
      planInfo.weekStart,
      planInfo.weekEnd
    );
  }, [shoppingListData, planInfo]);

  // Trouver l'index d'aujourd'hui
  const todayIndex = useMemo(() => findTodayIndex(weekDays), [weekDays]);

  // Handlers
  const handleViewModeChange = (mode: 'day' | 'week') => {
    dispatch({ type: 'SET_VIEW_MODE', mode });
  };

  const handleDaySelect = (index: number) => {
    dispatch({ type: 'SET_SELECTED_DAY', index });
  };

  const handleToggleMeal = (mealId: PlanMealType) => {
    dispatch({ type: 'TOGGLE_MEAL_EXPANDED', mealId });
  };

  const handleToggleNutrients = () => {
    dispatch({ type: 'TOGGLE_NUTRIENT_DETAIL' });
  };

  const handleCellClick = (dayIndex: number, mealId: PlanMealType) => {
    dispatch({ type: 'SET_SELECTED_DAY', index: dayIndex });
    dispatch({ type: 'SET_VIEW_MODE', mode: 'day' });
    dispatch({ type: 'TOGGLE_MEAL_EXPANDED', mealId });
  };

  const handleOverviewDayClick = (dayIndex: number) => {
    dispatch({ type: 'SET_SELECTED_DAY', index: dayIndex });
    dispatch({ type: 'SET_VIEW_MODE', mode: 'day' });
  };

  const handleGenerateShoppingList = useCallback(() => {
    setFetchShoppingList(true);
    setIsShoppingListOpen(true);
  }, []);

  const handleSubmitModificationRequest = useCallback(
    (data: ModificationRequestFormData) => {
      createRequest.mutate({
        request_type: data.meal ? 'substitution' : 'other',
        title: data.meal ? mealTypeConfig[data.meal].label : 'Demande de modification',
        description: data.reason,
        suggested_alternative: data.food || undefined,
      });
    },
    [createRequest]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-100'>
        <DashboardHeader />
        <div className='px-8 py-12'>
          <div className='max-w-2xl mx-auto text-center'>
            <div className='animate-pulse space-y-4'>
              <div className='h-8 bg-gray-200 rounded w-64 mx-auto' />
              <div className='h-4 bg-gray-200 rounded w-48 mx-auto' />
              <div className='grid grid-cols-7 gap-2 mt-8'>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className='h-16 bg-gray-200 rounded' />
                ))}
              </div>
              <div className='space-y-3 mt-8'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='h-24 bg-gray-200 rounded' />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state: no active plan
  if (!plan) {
    return (
      <div className='min-h-screen bg-gray-100'>
        <DashboardHeader />
        <div className='px-8 py-16'>
          <div className='max-w-md mx-auto text-center'>
            <div className='w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6'>
              <svg className='w-10 h-10 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-gray-800 mb-2'>
              Aucun plan alimentaire actif
            </h2>
            <p className='text-gray-500'>
              Votre nutritionniste n&apos;a pas encore publié de plan alimentaire.
              Contactez-le pour en savoir plus.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // List of meals for day view
  const mealsList = dailyData ? Object.values(dailyData.meals) : [];

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Dashboard Header - Bonjour + Notifications */}
      <DashboardHeader />

      {/* Plan Header - Titre + Toggle vue jour/semaine */}
      <MealPlanHeader
        weekRange={weekRange}
        viewMode={state.viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {/* Sélecteur de jours (vue jour uniquement) */}
      {state.viewMode === 'day' && weekDays.length > 0 && (
        <DaySelector
          weekDays={weekDays}
          selectedDayIndex={state.selectedDayIndex}
          onDaySelect={handleDaySelect}
        />
      )}

      {/* Contenu principal */}
      <main className='px-8 py-6'>
        <AnimatePresence mode='wait'>
          {/* Vue Jour */}
          {state.viewMode === 'day' && dailyData && dailyTotals && selectedDay && (
            <motion.div
              key='day-view'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              {/* Objectifs du jour — dropdown compact */}
              <DailyObjectivesDropdown
                day={selectedDay}
                targets={dailyData.targets}
                totals={dailyTotals}
                micronutrients={dailyData.micronutrients}
              />

              {/* Layout 3/4 + 1/4 : Repas + Adhérence */}
              <div className='grid grid-cols-4 gap-6'>
                {/* Colonne principale — repas */}
                <div className='col-span-3 space-y-4'>
                  {mealsList.map(meal => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      isExpanded={state.expandedMealId === meal.type}
                      onToggleExpand={handleToggleMeal}
                    />
                  ))}
                </div>

                {/* Sidebar — adhérence */}
                <div className='col-span-1'>
                  <div className='sticky top-6'>
                    <PatientAdherenceCard enabled={!!plan} />
                  </div>
                </div>
              </div>

              {/* Demande de modification — full width */}
              <ModificationRequest
                requests={modificationRequests}
                onSubmitRequest={handleSubmitModificationRequest}
              />
            </motion.div>
          )}

          {/* Vue Semaine */}
          {state.viewMode === 'week' && weeklyData && (
            <motion.div
              key='week-view'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              {/* Vue d'ensemble */}
              <WeeklyOverview
                days={weeklyData.days}
                targets={weeklyData.targets}
                onDayClick={handleOverviewDayClick}
              />

              {/* Grille des repas */}
              <WeeklyMealGrid
                days={weeklyData.days}
                targets={weeklyData.targets}
                onCellClick={handleCellClick}
              />

              {/* CTA Liste de courses */}
              <ShoppingListCTA onGenerateList={handleGenerateShoppingList} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Informations sur le plan */}
        {planInfo && (
          <div className='mt-6'>
            <PlanInfoCard planInfo={planInfo} />
          </div>
        )}
      </main>

      {/* Modal Liste de courses */}
      <ShoppingListModal
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        shoppingList={shoppingList}
      />
    </div>
  );
}
