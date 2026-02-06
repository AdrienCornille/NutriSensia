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
import { HydrationHistory } from '@/components/suivi/hydration/HydrationHistory';
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
  measurementTypeConfig,
} from '@/types/suivi';

// Hydration API hooks and transformers
import {
  useTodayHydration,
  useHydrationGoal,
  useAddWaterLog,
} from '@/hooks/useHydration';
import { transformLogsToHydrationData } from '@/lib/hydration-transformers';
import { useQueryClient } from '@tanstack/react-query';

// Weight API hooks and transformers
import {
  useAllWeightEntries,
  useWeightGoal,
  useAddWeightEntry,
} from '@/hooks/useWeight';
import { transformWeightData } from '@/lib/weight-transformers';

// Measurements API hooks and transformers
import { useAllMeasurements, useAddMeasurement } from '@/hooks/useMeasurements';
import { transformMeasurementsToData } from '@/lib/measurements-transformers';

// Wellbeing API hooks and transformers
import { useAllWellbeingLogs, useAddWellbeingLog } from '@/hooks/useWellbeing';
import {
  transformWellbeingData,
  moodUItoAPI,
  energyUItoAPI,
  digestionSymptomToQuality,
} from '@/lib/wellbeing-transformers';
import type { WellbeingEntry } from '@/types/suivi';

// Activity API hooks and transformers
import {
  useAllActivityLogs,
  useAddActivityLog,
  useUpdateActivityLog,
  useDeleteActivityLog,
} from '@/hooks/useActivity';
import {
  transformActivityData,
  intensityUItoAPI,
  activityTypeUItoAPI,
} from '@/lib/activity-transformers';

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
  const queryClient = useQueryClient();

  // BIO-008: Local state for hydration (optimistic updates)
  const [localHydrationAdded, setLocalHydrationAdded] = useState<number>(0);

  // Toast state
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    type: 'success',
    title: '',
  });

  // Activity pre-selection state (when user clicks on activity selector)
  const [preselectedActivityType, setPreselectedActivityType] =
    useState<ActivityType | null>(null);

  // Activity editing state (when user clicks edit on an activity)
  const [editingActivity, setEditingActivity] = useState<ActivityEntry | null>(
    null
  );

  // Fetch weight data from API
  const { data: weightEntriesData, isLoading: isLoadingWeight } =
    useAllWeightEntries();
  const { data: weightGoalData } = useWeightGoal();
  const addWeightMutation = useAddWeightEntry();

  // Transform API data to UI format
  const weightData: WeightData = useMemo(() => {
    // Return empty data while loading
    if (!weightEntriesData) {
      return {
        current: 0,
        initial: 0,
        goal: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable' as const,
        weeklyChange: 0,
        history: [],
      };
    }

    return transformWeightData(weightEntriesData, state.timeRange);
  }, [weightEntriesData, state.timeRange]);

  // Get last weight for form
  const lastWeight = useMemo(() => {
    return weightData.history[0]?.value || weightData.current;
  }, [weightData]);

  // Measurements API
  const { data: measurementsResponse, isLoading: isLoadingMeasurements } =
    useAllMeasurements();
  const addMeasurementMutation = useAddMeasurement();

  const measurementsData = useMemo(() => {
    if (!measurementsResponse) {
      return {
        totalChange: 0,
        measurements: [],
        history: [],
      };
    }
    return transformMeasurementsToData(measurementsResponse.measurements);
  }, [measurementsResponse]);

  // Wellbeing API
  const { data: wellbeingLogsResponse, isLoading: isLoadingWellbeing } =
    useAllWellbeingLogs();
  const addWellbeingMutation = useAddWellbeingLog();

  const wellbeingData = useMemo(() => {
    if (!wellbeingLogsResponse || !wellbeingLogsResponse.logs) {
      return {
        today: null,
        history: [],
        insights: [],
      };
    }

    return transformWellbeingData(wellbeingLogsResponse.logs);
  }, [wellbeingLogsResponse]);

  // Activity API
  const { data: activityLogsResponse, isLoading: isLoadingActivity } =
    useAllActivityLogs();
  const addActivityMutation = useAddActivityLog();
  const updateActivityMutation = useUpdateActivityLog();
  const deleteActivityMutation = useDeleteActivityLog();

  const activityData = useMemo(() => {
    if (!activityLogsResponse || !activityLogsResponse.logs) {
      return {
        activities: [],
        thisWeek: {
          sessions: 0,
          totalMinutes: 0,
          calories: 0,
          goalSessions: 3,
        },
      };
    }

    return transformActivityData(activityLogsResponse.logs);
  }, [activityLogsResponse]);

  // BIO-008: Fetch hydration data from API
  const { data: hydrationGoalData, isLoading: isLoadingGoal } =
    useHydrationGoal();
  const { data: hydrationLogsData, isLoading: isLoadingLogs } =
    useTodayHydration();
  const addWaterMutation = useAddWaterLog();

  const baseHydrationData = useMemo(() => {
    // Return empty state during loading or if no data
    if (!hydrationGoalData || !hydrationLogsData) {
      return {
        today: 0,
        goal: 2,
        weekAverage: 0,
        daysWithGoalReached: 0,
        totalDays: 0,
        history: [],
      };
    }

    return transformLogsToHydrationData(
      hydrationLogsData.logs,
      hydrationGoalData
    );
  }, [hydrationLogsData, hydrationGoalData, isLoadingGoal, isLoadingLogs]);

  // BIO-008: Merge local hydration with base data
  const hydrationData: HydrationData = useMemo(() => {
    if (localHydrationAdded === 0) return baseHydrationData;

    const newToday = baseHydrationData.today + localHydrationAdded;

    // Get today's date string to find the correct day in history (using local timezone)
    const today = new Date();
    const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Update today's value in history
    const updatedHistory = baseHydrationData.history.map(day => {
      // Find today's entry by matching the date
      if (day.date === todayDateStr) {
        return { ...day, value: newToday };
      }
      return day;
    });

    // Recalculate stats
    const daysWithData = updatedHistory.filter(h => h.value !== null);
    const weekAverage =
      daysWithData.length > 0
        ? daysWithData.reduce((acc, h) => acc + (h.value || 0), 0) /
          daysWithData.length
        : 0;

    const daysWithGoalReached = daysWithData.filter(
      h => h.value !== null && h.value >= h.goal
    ).length;

    return {
      ...baseHydrationData,
      today: newToday,
      weekAverage: Math.round(weekAverage * 100) / 100,
      daysWithGoalReached,
      history: updatedHistory,
    };
  }, [baseHydrationData, localHydrationAdded]);

  // Show toast helper
  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      setToast({ isVisible: true, type, title, message });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
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

  // BIO-001: Handle weight submission with real API
  const handleAddWeight = useCallback(
    async (weight: number, date: Date) => {
      try {
        // Calculate variation for toast message
        const previousWeight = weightData.history[0]?.value;
        let variationMessage = '';
        if (previousWeight) {
          const diff = weight - previousWeight;
          if (Math.abs(diff) >= 0.05) {
            variationMessage =
              diff > 0
                ? `+${diff.toFixed(1)} kg par rapport à la dernière pesée`
                : `${diff.toFixed(1)} kg par rapport à la dernière pesée`;
          }
        }

        // API call
        await addWeightMutation.mutateAsync({
          weight_kg: weight,
          measured_at: date.toISOString(),
        });

        // Refetch to update UI
        await queryClient.refetchQueries({ queryKey: ['weight', 'entries'] });

        // Show success toast
        showToast(
          'success',
          'Pesée enregistrée',
          variationMessage ||
            `${weight} kg le ${date.toLocaleDateString('fr-FR')}`
        );
      } catch (error) {
        // Show error toast with the actual error message
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Impossible d'enregistrer la pesée";

        showToast('error', 'Erreur', errorMessage);
        console.error('Error adding weight:', error);
      }
    },
    [weightData.history, showToast, addWeightMutation, queryClient]
  );

  // BIO-001: Handle weight update/delete - refetch data
  const handleWeightUpdate = useCallback(async () => {
    try {
      await queryClient.refetchQueries({ queryKey: ['weight', 'entries'] });
    } catch (error) {
      console.error('Error refreshing weight data:', error);
    }
  }, [queryClient]);

  const handleAddMeasurement = useCallback(() => {
    dispatch({ type: 'OPEN_ADD_MODAL', modalType: 'measurement' });
  }, []);

  const handleSubmitMeasurement = useCallback(
    async (type: MeasurementType, value: number) => {
      try {
        await addMeasurementMutation.mutateAsync({
          measurement_type: type,
          value_cm: value,
        });

        dispatch({ type: 'CLOSE_ADD_MODAL' });

        showToast(
          'success',
          'Mesure enregistrée',
          `${measurementTypeConfig[type].label}: ${value.toFixed(1)} cm`
        );
      } catch (error: any) {
        // Gérer l'erreur 409 (mesure déjà existante pour ce type/date)
        const errorMessage = error.message || '';
        const isDuplicateError =
          errorMessage.includes('existe déjà') || errorMessage.includes('409');

        if (isDuplicateError) {
          showToast(
            'error',
            `${measurementTypeConfig[type].label} déjà enregistré`,
            `Vous avez déjà une mesure de ${measurementTypeConfig[type].label.toLowerCase()} pour aujourd'hui (${value.toFixed(1)} cm). Pour la modifier, cliquez sur le bouton ✏️ dans l'historique ci-dessous.`
          );
        } else {
          showToast(
            'error',
            "Erreur d'enregistrement",
            `Impossible d'enregistrer la mesure. ${errorMessage}`
          );
        }
        console.error('Error adding measurement:', error);
      }
    },
    [addMeasurementMutation, showToast]
  );

  // Handle measurement update/delete - refetch data
  const handleMeasurementUpdate = useCallback(async () => {
    try {
      await queryClient.refetchQueries({ queryKey: ['measurements'] });
    } catch (error) {
      console.error('Error refreshing measurements data:', error);
    }
  }, [queryClient]);

  const handleSelectActivity = useCallback((type: ActivityType) => {
    setPreselectedActivityType(type);
    dispatch({ type: 'OPEN_ADD_MODAL', modalType: 'activity' });
  }, []);

  // BIO-007: Handle activity submission with API call
  const handleSubmitActivity = useCallback(
    async (
      type: ActivityType,
      duration: number,
      intensity: Intensity,
      calories: number
    ) => {
      try {
        // Préparer les données pour l'API
        const apiData = {
          activity_type: activityTypeUItoAPI(type),
          duration_minutes: duration,
          intensity: intensityUItoAPI[intensity],
          calories_burned: calories,
        };

        // Appeler l'API via la mutation
        await addActivityMutation.mutateAsync(apiData);

        // Afficher le toast de succès
        showToast(
          'success',
          'Activité enregistrée',
          `${activityTypeConfig[type].label} • ${duration} min • ${calories} kcal`
        );
      } catch (error: any) {
        console.error('Error adding activity:', error);
        showToast('error', 'Erreur', "Impossible d'enregistrer l'activité");
      }
    },
    [addActivityMutation, showToast]
  );

  // BIO-007: Handle edit activity (open modal with data)
  const handleEditActivity = useCallback((activity: ActivityEntry) => {
    setEditingActivity(activity);
    setPreselectedActivityType(activity.type);
    dispatch({ type: 'OPEN_ADD_MODAL', modalType: 'activity' });
  }, []);

  // BIO-007: Handle update activity
  const handleUpdateActivity = useCallback(
    async (
      id: string,
      type: ActivityType,
      duration: number,
      intensity: Intensity,
      calories: number
    ) => {
      try {
        const apiData = {
          activity_type: activityTypeUItoAPI(type),
          duration_minutes: duration,
          intensity: intensityUItoAPI[intensity],
          calories_burned: calories,
        };

        await updateActivityMutation.mutateAsync({ id, data: apiData });

        setEditingActivity(null);
        dispatch({ type: 'CLOSE_ADD_MODAL' });

        showToast(
          'success',
          'Activité modifiée',
          `${activityTypeConfig[type].label} • ${duration} min • ${calories} kcal`
        );
      } catch (error: any) {
        console.error('Error updating activity:', error);
        showToast('error', 'Erreur', "Impossible de modifier l'activité");
      }
    },
    [updateActivityMutation, showToast]
  );

  // BIO-007: Handle delete activity
  const handleDeleteActivity = useCallback(
    async (activityId: string) => {
      try {
        await deleteActivityMutation.mutateAsync(activityId);

        showToast(
          'success',
          'Activité supprimée',
          "L'activité a été supprimée avec succès"
        );
      } catch (error: any) {
        console.error('Error deleting activity:', error);
        showToast('error', 'Erreur', "Impossible de supprimer l'activité");
      }
    },
    [deleteActivityMutation, showToast]
  );

  // BIO-008: Handle water addition with optimistic update and API call
  const handleAddWater = useCallback(
    async (amount: number) => {
      try {
        // Convert ml to liters for the state
        const litersToAdd = amount / 1000;

        // Optimistic update - immediately update local state
        setLocalHydrationAdded(prev => {
          const newTotal = prev + litersToAdd;
          return Math.round(newTotal * 100) / 100; // Round to 2 decimals
        });

        // API call to persist
        await addWaterMutation.mutateAsync({
          amount_ml: amount,
          beverage_type: 'water',
        });

        // Wait for queries to refetch before resetting
        await queryClient.refetchQueries({ queryKey: ['hydration', 'logs'] });
        await queryClient.refetchQueries({ queryKey: ['hydration', 'today'] });

        // Reset local state after refetch is complete
        // (data is now in baseHydrationData from refetch)
        setLocalHydrationAdded(0);

        // Calculate new total for toast
        const newTotal = hydrationData.today + litersToAdd;
        const percentage = Math.round((newTotal / hydrationData.goal) * 100);

        // Show success toast
        showToast(
          'success',
          `+${amount} ml ajoutés`,
          percentage >= 100
            ? `Objectif atteint ! ${newTotal.toFixed(2)}L / ${hydrationData.goal.toFixed(2)}L`
            : `${newTotal.toFixed(2)}L / ${hydrationData.goal.toFixed(2)}L (${percentage}%)`
        );
      } catch (error) {
        // Rollback optimistic update on error
        setLocalHydrationAdded(prev => prev - amount / 1000);
        showToast('error', 'Erreur', "Impossible d'ajouter l'eau");
        console.error('Error adding water:', error);
      }
    },
    [
      addWaterMutation,
      hydrationData.today,
      hydrationData.goal,
      showToast,
      queryClient,
    ]
  );

  const handleSubmitWellbeing = useCallback(
    async (data: Omit<WellbeingEntry, 'id' | 'date'>) => {
      try {
        // Convertir format UI → API
        const apiData = {
          energy_level: energyUItoAPI(data.energy),
          sleep_hours: data.sleep,
          mood: moodUItoAPI[data.mood],
          digestion: digestionSymptomToQuality(data.digestion),
          symptoms: data.digestion !== 'normal' ? [data.digestion] : [],
        };

        await addWellbeingMutation.mutateAsync(apiData);

        showToast(
          'success',
          'Bien-être enregistré',
          'Vos données ont été enregistrées avec succès.'
        );
      } catch (error: any) {
        const isDuplicateError =
          error.message.includes('existe déjà') ||
          error.message.includes('409');

        if (isDuplicateError) {
          showToast(
            'error',
            'Bien-être déjà enregistré',
            "Vous avez déjà enregistré votre bien-être pour aujourd'hui. Pour le modifier, utilisez l'historique ci-dessous."
          );
        } else {
          showToast('error', 'Erreur', "Impossible d'enregistrer les données.");
        }

        console.error('Error submitting wellbeing:', error);
      }
    },
    [addWellbeingMutation, showToast]
  );

  const handleCloseModal = useCallback(() => {
    dispatch({ type: 'CLOSE_ADD_MODAL' });
    setPreselectedActivityType(null);
    setEditingActivity(null);
  }, []);

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Dashboard Header - Bonjour + Notifications */}
      <DashboardHeader />

      {/* Suivi Header - Title + Connect device button */}
      <SuiviHeader onConnectDevice={handleConnectDevice} />

      {/* Tabs */}
      <SuiviTabs activeTab={state.activeTab} onTabChange={handleTabChange} />

      {/* Main content */}
      <main className='px-8 py-6'>
        <AnimatePresence mode='wait'>
          {/* Poids Tab */}
          {state.activeTab === 'poids' && (
            <motion.div
              key='poids-tab'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              {isLoadingWeight ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
                    <p className='text-gray-500'>Chargement des données...</p>
                  </div>
                </div>
              ) : (
                <>
                  <WeightSummaryCards data={weightData} />
                  <WeightChart
                    data={weightData}
                    timeRange={state.timeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                  />
                  <div className='grid grid-cols-3 gap-6'>
                    <div className='col-span-2'>
                      <WeightHistory
                        history={weightData.history}
                        onUpdate={handleWeightUpdate}
                      />
                    </div>
                    <AddWeightForm
                      lastWeight={lastWeight}
                      isLoading={addWeightMutation.isPending}
                      onSubmit={handleAddWeight}
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Mensurations Tab */}
          {state.activeTab === 'mensurations' && (
            <motion.div
              key='mensurations-tab'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              {isLoadingMeasurements ? (
                <div className='flex justify-center items-center h-64'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
                </div>
              ) : (
                <>
                  <MeasurementsSummary data={measurementsData} />
                  <MeasurementsGrid
                    data={measurementsData}
                    onAddMeasurement={handleAddMeasurement}
                  />
                  <MeasurementsHistory
                    history={measurementsData.history}
                    onUpdate={handleMeasurementUpdate}
                  />
                </>
              )}
            </motion.div>
          )}

          {/* Bien-être Tab */}
          {state.activeTab === 'bien-etre' && (
            <motion.div
              key='bien-etre-tab'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              <div className='grid grid-cols-2 gap-6'>
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
              key='activite-tab'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              <ActivitySummaryCards summary={activityData.thisWeek} />
              <ActivitySelector onSelectActivity={handleSelectActivity} />
              <ActivityHistory
                activities={activityData.activities}
                onEdit={handleEditActivity}
                onDelete={handleDeleteActivity}
              />
            </motion.div>
          )}

          {/* Hydratation Tab */}
          {state.activeTab === 'hydratation' && (
            <motion.div
              key='hydratation-tab'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              {isLoadingGoal || isLoadingLogs ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='text-center'>
                    <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B998B] mb-4'></div>
                    <p className='text-gray-600'>
                      Chargement des données d'hydratation...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <HydrationToday
                    data={hydrationData}
                    onAddWater={handleAddWater}
                  />
                  <HydrationChart data={hydrationData} />
                  <HydrationStats data={hydrationData} />

                  {/* Historique des logs du jour */}
                  {hydrationLogsData && hydrationLogsData.logs.length > 0 && (
                    <div className='mt-6'>
                      <HydrationHistory
                        logs={hydrationLogsData.logs}
                        onUpdate={() => {
                          // Refetch sera automatiquement déclenché par l'invalidation du cache
                        }}
                      />
                    </div>
                  )}
                </>
              )}
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
        onUpdateActivity={handleUpdateActivity}
        preselectedActivityType={preselectedActivityType}
        editingActivity={editingActivity}
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
