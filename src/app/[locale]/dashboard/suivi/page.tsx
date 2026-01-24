'use client';

import React, { useReducer, useMemo, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SuiviHeader } from '@/components/suivi/SuiviHeader';
import { SuiviTabs } from '@/components/suivi/SuiviTabs';
import { WeightSummaryCards } from '@/components/suivi/weight/WeightSummaryCards';
import { WeightChart } from '@/components/suivi/weight/WeightChart';
import { WeightHistory } from '@/components/suivi/weight/WeightHistory';
import { AddWeightForm } from '@/components/suivi/weight/AddWeightForm';
import { MeasurementsSummary } from '@/components/suivi/measurements/MeasurementsSummary';
import { MeasurementsGrid } from '@/components/suivi/measurements/MeasurementsGrid';
import { MeasurementsHistory } from '@/components/suivi/measurements/MeasurementsHistory';
import { WellbeingForm } from '@/components/suivi/wellbeing/WellbeingForm';
import { WellbeingHistory } from '@/components/suivi/wellbeing/WellbeingHistory';
import { WellbeingInsight } from '@/components/suivi/wellbeing/WellbeingInsight';
import { ActivitySummaryCards } from '@/components/suivi/activity/ActivitySummaryCards';
import { ActivitySelector } from '@/components/suivi/activity/ActivitySelector';
import { ActivityHistory } from '@/components/suivi/activity/ActivityHistory';
import { HydrationToday } from '@/components/suivi/hydration/HydrationToday';
import { HydrationChart } from '@/components/suivi/hydration/HydrationChart';
import { HydrationStats } from '@/components/suivi/hydration/HydrationStats';
import { AddModal } from '@/components/suivi/shared/AddModal';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';

import {
  suiviReducer,
  initialSuiviState,
  type SuiviTab,
  type TimeRange,
  type ActivityType,
  type MeasurementType,
  type Intensity,
  type WeightEntry,
  type WeightData,
  type ActivityEntry,
  type ActivityData,
  type HydrationData,
  calculateWeightProgress,
  activityTypeConfig,
} from '@/types/suivi';

import {
  getWeightData,
  getMeasurementsData,
  getWellbeingData,
  getActivityData,
  getHydrationData,
} from '@/data/mock-suivi';

/**
 * Page Suivi Biométrique
 *
 * SUIVI-001: Page de suivi avec 5 onglets
 * BIO-001: Enregistrement du poids avec validation et feedback
 */

interface ToastState {
  isVisible: boolean;
  type: ToastType;
  title: string;
  message?: string;
}

export default function SuiviPage() {
  const [state, dispatch] = useReducer(suiviReducer, initialSuiviState);

  // Local state for weight entries (optimistic updates)
  const [localWeightEntries, setLocalWeightEntries] = useState<WeightEntry[]>([]);
  const [isWeightLoading, setIsWeightLoading] = useState(false);

  // BIO-007: Local state for activity entries (optimistic updates)
  const [localActivityEntries, setLocalActivityEntries] = useState<ActivityEntry[]>([]);

  // BIO-008: Local state for hydration (optimistic updates)
  const [localHydrationAdded, setLocalHydrationAdded] = useState<number>(0);

  // Toast state
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    type: 'success',
    title: '',
  });

  // Fetch base data
  const baseWeightData = useMemo(
    () => getWeightData(state.timeRange),
    [state.timeRange]
  );

  // Merge local weight entries with base data
  const weightData: WeightData = useMemo(() => {
    if (localWeightEntries.length === 0) return baseWeightData;

    // Combine and sort all entries by date (most recent first)
    const allEntries = [...localWeightEntries, ...baseWeightData.history].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // Remove duplicates (same date)
    const uniqueEntries = allEntries.filter(
      (entry, index, self) =>
        index === self.findIndex(
          (e) => e.date.toDateString() === entry.date.toDateString()
        )
    );

    const current = uniqueEntries[0]?.value || baseWeightData.current;
    const change = current - baseWeightData.initial;

    // Calculate weekly change
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoEntry = uniqueEntries.find((e) => e.date <= weekAgo);
    const weeklyChange = weekAgoEntry ? current - weekAgoEntry.value : baseWeightData.weeklyChange;

    return {
      ...baseWeightData,
      current,
      change,
      changePercent: (change / baseWeightData.initial) * 100,
      weeklyChange,
      history: uniqueEntries,
      trend: change < -0.1 ? 'down' : change > 0.1 ? 'up' : 'stable',
    };
  }, [baseWeightData, localWeightEntries]);

  // Get last weight for form
  const lastWeight = useMemo(() => {
    return weightData.history[0]?.value || weightData.current;
  }, [weightData]);

  const measurementsData = useMemo(() => getMeasurementsData(), []);
  const wellbeingData = useMemo(() => getWellbeingData(), []);
  const baseActivityData = useMemo(() => getActivityData(), []);
  const baseHydrationData = useMemo(() => getHydrationData(), []);

  // BIO-008: Merge local hydration with base data
  const hydrationData: HydrationData = useMemo(() => {
    if (localHydrationAdded === 0) return baseHydrationData;

    const newToday = baseHydrationData.today + localHydrationAdded;

    // Update today's value in history
    const updatedHistory = baseHydrationData.history.map((day) => {
      // Find today's entry (using dayLabel 'Ven' as current mock)
      if (day.dayLabel === 'Ven') {
        return { ...day, value: newToday };
      }
      return day;
    });

    // Recalculate stats
    const daysWithData = updatedHistory.filter((h) => h.value !== null);
    const weekAverage =
      daysWithData.length > 0
        ? daysWithData.reduce((acc, h) => acc + (h.value || 0), 0) / daysWithData.length
        : 0;

    const daysWithGoalReached = daysWithData.filter(
      (h) => h.value !== null && h.value >= h.goal
    ).length;

    return {
      ...baseHydrationData,
      today: newToday,
      weekAverage: Math.round(weekAverage * 10) / 10,
      daysWithGoalReached,
      history: updatedHistory,
    };
  }, [baseHydrationData, localHydrationAdded]);

  // BIO-007: Merge local activity entries with base data
  const activityData: ActivityData = useMemo(() => {
    if (localActivityEntries.length === 0) return baseActivityData;

    // Combine and sort all activities by date (most recent first)
    const allActivities = [...localActivityEntries, ...baseActivityData.activities].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // Recalculate weekly summary
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekActivities = allActivities.filter(
      (activity) => activity.date >= weekStart
    );

    const totalMinutes = thisWeekActivities.reduce((acc, a) => acc + a.duration, 0);
    const totalCalories = thisWeekActivities.reduce((acc, a) => acc + a.calories, 0);

    return {
      thisWeek: {
        sessions: thisWeekActivities.length,
        totalMinutes,
        calories: totalCalories,
        goalSessions: baseActivityData.thisWeek.goalSessions,
      },
      activities: allActivities,
    };
  }, [baseActivityData, localActivityEntries]);

  // Show toast helper
  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    setToast({ isVisible: true, type, title, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  // Handlers
  const handleTabChange = useCallback((tab: SuiviTab) => {
    dispatch({ type: 'SET_TAB', tab });
  }, []);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    dispatch({ type: 'SET_TIME_RANGE', range });
  }, []);

  const handleConnectDevice = useCallback(() => {
    console.log('Connect device clicked');
    // TODO: Implement device connection
  }, []);

  // BIO-001: Handle weight submission with optimistic update
  const handleAddWeight = useCallback(
    async (weight: number, date: Date) => {
      setIsWeightLoading(true);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Create new entry
        const newEntry: WeightEntry = {
          id: `local-${Date.now()}`,
          date,
          value: weight,
        };

        // Optimistic update - add to local state
        setLocalWeightEntries((prev) => {
          // Remove any existing entry for the same date
          const filtered = prev.filter(
            (e) => e.date.toDateString() !== date.toDateString()
          );
          return [newEntry, ...filtered];
        });

        // Calculate variation for toast message
        const previousWeight = weightData.history[0]?.value;
        let variationMessage = '';
        if (previousWeight) {
          const diff = weight - previousWeight;
          if (Math.abs(diff) >= 0.05) {
            variationMessage = diff > 0
              ? `+${diff.toFixed(1)} kg par rapport à la dernière pesée`
              : `${diff.toFixed(1)} kg par rapport à la dernière pesée`;
          }
        }

        // Show success toast
        showToast(
          'success',
          'Pesée enregistrée',
          variationMessage || `${weight} kg le ${date.toLocaleDateString('fr-FR')}`
        );

        // TODO: Call actual API to persist
        console.log('Weight saved:', { weight, date });
      } catch {
        // Show error toast
        showToast('error', 'Erreur', "Impossible d'enregistrer la pesée");
      } finally {
        setIsWeightLoading(false);
      }
    },
    [weightData.history, showToast]
  );

  const handleAddMeasurement = useCallback(() => {
    dispatch({ type: 'OPEN_ADD_MODAL', modalType: 'measurement' });
  }, []);

  const handleSubmitMeasurement = useCallback(
    (type: MeasurementType, value: number) => {
      console.log('Submit measurement:', type, value);
      // TODO: Implement measurement submission
    },
    []
  );

  const handleSelectActivity = useCallback((type: ActivityType) => {
    dispatch({ type: 'OPEN_ADD_MODAL', modalType: 'activity' });
    console.log('Selected activity type:', type);
  }, []);

  // BIO-007: Handle activity submission with optimistic update
  const handleSubmitActivity = useCallback(
    async (type: ActivityType, duration: number, intensity: Intensity, calories: number) => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Create new entry
        const newEntry: ActivityEntry = {
          id: `local-activity-${Date.now()}`,
          date: new Date(),
          type,
          typeName: activityTypeConfig[type].label,
          duration,
          intensity,
          calories,
        };

        // Optimistic update - add to local state
        setLocalActivityEntries((prev) => [newEntry, ...prev]);

        // Show success toast
        showToast(
          'success',
          'Activité enregistrée',
          `${activityTypeConfig[type].label} • ${duration} min • ${calories} kcal`
        );

        // TODO: Call actual API to persist
        console.log('Activity saved:', newEntry);
      } catch {
        showToast('error', 'Erreur', "Impossible d'enregistrer l'activité");
      }
    },
    [showToast]
  );

  // BIO-008: Handle water addition with optimistic update
  const handleAddWater = useCallback(
    async (amount: number) => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Convert ml to liters for the state
        const litersToAdd = amount / 1000;

        // Optimistic update
        setLocalHydrationAdded((prev) => {
          const newTotal = prev + litersToAdd;
          return Math.round(newTotal * 100) / 100; // Round to 2 decimals
        });

        // Calculate new total for toast
        const newTotal = hydrationData.today + litersToAdd;
        const percentage = Math.round((newTotal / hydrationData.goal) * 100);

        // Show success toast
        showToast(
          'success',
          `+${amount} ml ajoutés`,
          percentage >= 100
            ? `Objectif atteint ! ${newTotal.toFixed(1)}L / ${hydrationData.goal}L`
            : `${newTotal.toFixed(1)}L / ${hydrationData.goal}L (${percentage}%)`
        );

        // TODO: Call actual API to persist
        console.log('Water added:', amount, 'ml');
      } catch {
        showToast('error', 'Erreur', "Impossible d'ajouter l'eau");
      }
    },
    [hydrationData.today, hydrationData.goal, showToast]
  );

  const handleSubmitWellbeing = useCallback(
    (data: { energy: number; sleep: number; mood: string; digestion: string }) => {
      console.log('Submit wellbeing:', data);
      // TODO: Implement wellbeing submission
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    dispatch({ type: 'CLOSE_ADD_MODAL' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header - Bonjour + Notifications */}
      <DashboardHeader />

      {/* Suivi Header - Title + Connect device button */}
      <SuiviHeader onConnectDevice={handleConnectDevice} />

      {/* Tabs */}
      <SuiviTabs activeTab={state.activeTab} onTabChange={handleTabChange} />

      {/* Main content */}
      <main className="px-8 py-6">
        <AnimatePresence mode="wait">
          {/* Poids Tab */}
          {state.activeTab === 'poids' && (
            <motion.div
              key="poids-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <WeightSummaryCards data={weightData} />
              <WeightChart
                data={weightData}
                timeRange={state.timeRange}
                onTimeRangeChange={handleTimeRangeChange}
              />
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <WeightHistory history={weightData.history} />
                </div>
                <AddWeightForm
                  lastWeight={lastWeight}
                  isLoading={isWeightLoading}
                  onSubmit={handleAddWeight}
                />
              </div>
            </motion.div>
          )}

          {/* Mensurations Tab */}
          {state.activeTab === 'mensurations' && (
            <motion.div
              key="mensurations-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <MeasurementsSummary data={measurementsData} />
              <MeasurementsGrid
                data={measurementsData}
                onAddMeasurement={handleAddMeasurement}
              />
              <MeasurementsHistory history={measurementsData.history} />
            </motion.div>
          )}

          {/* Bien-être Tab */}
          {state.activeTab === 'bien-etre' && (
            <motion.div
              key="bien-etre-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <WellbeingForm
                  initialData={wellbeingData.today}
                  onSubmit={handleSubmitWellbeing}
                />
                <WellbeingHistory history={wellbeingData.history} />
              </div>
              <WellbeingInsight insights={wellbeingData.insights} />
            </motion.div>
          )}

          {/* Activité Tab */}
          {state.activeTab === 'activite' && (
            <motion.div
              key="activite-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <ActivitySummaryCards summary={activityData.thisWeek} />
              <ActivitySelector onSelectActivity={handleSelectActivity} />
              <ActivityHistory activities={activityData.activities} />
            </motion.div>
          )}

          {/* Hydratation Tab */}
          {state.activeTab === 'hydratation' && (
            <motion.div
              key="hydratation-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <HydrationToday data={hydrationData} onAddWater={handleAddWater} />
              <HydrationChart data={hydrationData} />
              <HydrationStats data={hydrationData} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Modal */}
      <AddModal
        isOpen={state.showAddModal}
        type={state.modalType}
        onClose={handleCloseModal}
        onSubmitMeasurement={handleSubmitMeasurement}
        onSubmitActivity={handleSubmitActivity}
      />

      {/* Toast notifications */}
      <Toast
        isVisible={toast.isVisible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
}
