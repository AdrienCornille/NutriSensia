'use client';

import React, { useReducer, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  MealPlanHeader,
  DaySelector,
  DailyObjectives,
  MealCard,
  WeeklyOverview,
  WeeklyMealGrid,
  PlanInfoCard,
  ShoppingListCTA,
  ModificationRequest,
  ShoppingListModal,
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
  ModificationRequestData,
  ModificationRequestFormData,
  ShoppingList,
} from '@/types/meal-plan';
import {
  getDailyPlanData,
  getWeeklyPlanData,
  getPlanInfo,
  getCurrentWeekDays,
  formatWeekRange,
  getModificationRequests,
  addModificationRequest,
  generateShoppingList,
} from '@/data/mock-meal-plan';

/**
 * Page Plan Alimentaire
 *
 * PLAN-001: Vue d'ensemble du plan alimentaire
 * - Affichage des objectifs journaliers (macros + micros)
 * - Vue jour avec détails des repas
 * - Vue semaine avec grille récapitulative
 */

export default function MealPlanPage() {
  const [state, dispatch] = useReducer(mealPlanReducer, initialMealPlanState);

  // State pour les demandes de modification
  const [modificationRequests, setModificationRequests] = useState<
    ModificationRequestData[]
  >(() => getModificationRequests());

  // State pour la liste de courses
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);

  // Récupérer les données
  const weekDays = useMemo(() => getCurrentWeekDays(), []);
  const planInfo = useMemo(() => getPlanInfo(), []);
  const weekRange = useMemo(
    () => formatWeekRange(planInfo.weekStart, planInfo.weekEnd),
    [planInfo]
  );

  // Données du jour sélectionné
  const selectedDay = weekDays[state.selectedDayIndex];
  const dailyData = useMemo(
    () => getDailyPlanData(selectedDay?.dateObj || new Date()),
    [selectedDay]
  );

  // Calcul des totaux du plan pour le jour sélectionné
  const dailyTotals = useMemo(
    () => calculateDailyPlanTotal(dailyData.meals),
    [dailyData.meals]
  );

  // Données de la semaine
  const weeklyData = useMemo(
    () => getWeeklyPlanData(planInfo.weekStart),
    [planInfo.weekStart]
  );

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
    const list = generateShoppingList(planInfo.weekStart, planInfo.weekEnd);
    setShoppingList(list);
    setIsShoppingListOpen(true);
  }, [planInfo.weekStart, planInfo.weekEnd]);

  const handleSubmitModificationRequest = useCallback(
    (data: ModificationRequestFormData) => {
      const newRequest = addModificationRequest({
        ...data,
        mealLabel: data.meal ? mealTypeConfig[data.meal].label : undefined,
      });
      setModificationRequests(prev => [newRequest, ...prev]);
      // TODO: Envoyer notification au nutritionniste (API call)
      console.log('Nouvelle demande de modification:', newRequest);
    },
    []
  );

  // Liste des repas pour la vue jour
  const mealsList = Object.values(dailyData.meals);

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
      {state.viewMode === 'day' && (
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
          {state.viewMode === 'day' && (
            <motion.div
              key='day-view'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              {/* Objectifs du jour */}
              <DailyObjectives
                day={selectedDay}
                targets={dailyData.targets}
                totals={dailyTotals}
                micronutrients={dailyData.micronutrients}
                showMicronutrients={state.showNutrientDetail}
                onToggleMicronutrients={handleToggleNutrients}
              />

              {/* Liste des repas */}
              <div className='space-y-4'>
                {mealsList.map(meal => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    isExpanded={state.expandedMealId === meal.type}
                    onToggleExpand={handleToggleMeal}
                  />
                ))}
              </div>

              {/* Demande de modification */}
              <ModificationRequest
                requests={modificationRequests}
                onSubmitRequest={handleSubmitModificationRequest}
              />
            </motion.div>
          )}

          {/* Vue Semaine */}
          {state.viewMode === 'week' && (
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
        <div className='mt-6'>
          <PlanInfoCard planInfo={planInfo} />
        </div>
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
