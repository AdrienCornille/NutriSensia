/**
 * Hook pour gérer la progression de l'onboarding
 * Gère la persistance, la validation et la synchronisation des données
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  OnboardingProgress,
  OnboardingStep,
  OnboardingData,
  OnboardingStepInfo,
  StepStatus,
  UseOnboardingOptions,
  OnboardingActions,
  OnboardingWizardState,
  ESTIMATED_STEP_DURATIONS,
} from '@/types/onboarding';
import { UserRole } from '@/lib/database-types';
import { supabase } from '@/lib/supabase';

interface UseOnboardingProgressOptions {
  userId: string;
  role: UserRole;
  steps: Array<{
    id: OnboardingStep;
    title: string;
    description: string;
    estimatedTime: number;
    isRequired: boolean;
    canSkip: boolean;
  }>;
  autoSave?: boolean;
  saveInterval?: number;
  persistToLocalStorage?: boolean;
  trackAnalytics?: boolean;
}

interface UseOnboardingProgressReturn {
  progress: OnboardingProgress | null;
  updateProgress: (
    step: OnboardingStep,
    data: Partial<OnboardingData>
  ) => Promise<void>;
  completeStep: (
    step: OnboardingStep,
    data: Partial<OnboardingData>
  ) => Promise<void>;
  skipStep: (step: OnboardingStep, reason?: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook principal pour gérer la progression de l'onboarding
 */
export const useOnboardingProgress = ({
  userId,
  role,
  steps,
  autoSave = true,
  saveInterval = 5000,
  persistToLocalStorage = true,
  trackAnalytics = true,
}: UseOnboardingProgressOptions): UseOnboardingProgressReturn => {
  // Identifiant unique pour tracer les instances
  const hookInstanceId = React.useRef(
    Math.random().toString(36).substr(2, 9)
  ).current;
  console.log(
    `🔧 Hook Instance ${hookInstanceId} - Création pour userId: ${userId}`
  );

  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Commencer à false
  const [error, setError] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false); // Flag pour éviter les réinitialisations

  const router = useRouter();

  /**
   * Clé pour le localStorage
   */
  const getStorageKey = useCallback(() => {
    return `onboarding_progress_${userId}_${role}`;
  }, [userId, role]);

  /**
   * Initialiser la progression à partir des étapes configurées
   */
  const initializeProgress = useCallback((): OnboardingProgress => {
    const stepMap: Record<string, OnboardingStepInfo> = {};

    steps.forEach(step => {
      stepMap[step.id] = {
        id: step.id,
        title: step.title,
        description: step.description,
        isRequired: step.isRequired,
        estimatedTime: step.estimatedTime,
        status: 'not-started' as StepStatus,
      };
    });

    return {
      userId,
      userRole: role,
      currentStep: steps[0]?.id as OnboardingStep,
      steps: stepMap,
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      isCompleted: false,
      completionPercentage: 0,
    };
  }, [userId, role, steps]);

  /**
   * Charger la progression depuis le localStorage
   */
  const loadFromLocalStorage = useCallback((): OnboardingProgress | null => {
    if (!persistToLocalStorage) return null;

    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        // Valider que la structure est correcte
        if (parsed.userId === userId && parsed.userRole === role) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement depuis localStorage:', error);
    }

    return null;
  }, [persistToLocalStorage, getStorageKey, userId, role]);

  /**
   * Sauvegarder la progression dans le localStorage
   */
  const saveToLocalStorage = useCallback(
    (progressData: OnboardingProgress) => {
      if (!persistToLocalStorage) return;

      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(progressData));
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde dans localStorage:', error);
      }
    },
    [persistToLocalStorage, getStorageKey]
  );

  /**
   * Charger la progression depuis Supabase
   * DÉSACTIVÉ : Nous utilisons uniquement localStorage pour la progression
   */
  const loadFromDatabase =
    useCallback(async (): Promise<OnboardingProgress | null> => {
      // Désactivé - pas de chargement depuis la base pour la progression
      console.log(
        '📥 Chargement progression désactivé (localStorage uniquement)'
      );
      return null;
    }, [userId, role]);

  /**
   * Sauvegarder la progression dans Supabase
   * DÉSACTIVÉ : Nous utilisons uniquement localStorage pour la progression
   * Les données réelles sont sauvegardées directement dans nutritionists/patients
   */
  const saveToDatabase = useCallback(
    async (progressData: OnboardingProgress) => {
      // Désactivé - pas de sauvegarde en base pour la progression
      console.log(
        '💾 Sauvegarde progression désactivée (localStorage uniquement)'
      );
      return;
    },
    []
  );

  /**
   * Calculer le pourcentage de completion
   */
  const calculateCompletionPercentage = useCallback(
    (steps: Record<string, OnboardingStepInfo>): number => {
      const totalSteps = Object.keys(steps).length;
      const completedSteps = Object.values(steps).filter(
        step => step.status === 'completed'
      ).length;

      return totalSteps > 0
        ? Math.round((completedSteps / totalSteps) * 100)
        : 0;
    },
    []
  );

  /**
   * Envoyer des événements d'analytics
   */
  const trackEvent = useCallback(
    async (eventType: string, data: any) => {
      if (!trackAnalytics) return;

      try {
        // Ici, vous pouvez intégrer votre service d'analytics préféré
        // Par exemple : Google Analytics, Mixpanel, Amplitude, etc.
        console.log('Analytics Event:', {
          eventType,
          data,
          timestamp: new Date().toISOString(),
        });

        // Exemple d'intégration avec une API d'analytics
        /*
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventType,
          properties: data,
          userId,
          timestamp: new Date().toISOString(),
        }),
      });
      */
      } catch (error) {
        console.warn("Erreur lors de l'envoi d'analytics:", error);
      }
    },
    [trackAnalytics, userId]
  );

  /**
   * Initialiser la progression - DÉSACTIVÉ
   * La progression sera initialisée manuellement depuis le wizard
   */
  const initProgressManually = useCallback(async () => {
    console.log(
      '🔄 Initialisation manuelle de la progression - userId:',
      userId,
      'role:',
      role
    );

    setIsLoading(true);
    setError(null);

    try {
      // Essayer de charger depuis localStorage seulement
      let loadedProgress: OnboardingProgress | null = null;

      if (persistToLocalStorage) {
        try {
          const stored = localStorage.getItem(
            `onboarding_progress_${userId}_${role}`
          );
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.userId === userId && parsed.userRole === role) {
              loadedProgress = parsed;
            }
          }
        } catch (error) {
          console.warn('Erreur lors du chargement depuis localStorage:', error);
        }
      }

      // Si toujours rien, initialiser
      if (!loadedProgress) {
        const stepMap: Record<string, OnboardingStepInfo> = {};

        steps.forEach(step => {
          stepMap[step.id] = {
            id: step.id,
            title: step.title,
            description: step.description,
            isRequired: step.isRequired,
            estimatedTime: step.estimatedTime,
            status: 'not-started' as StepStatus,
          };
        });

        loadedProgress = {
          userId,
          userRole: role,
          currentStep: steps[0]?.id as OnboardingStep,
          steps: stepMap,
          startedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          isCompleted: false,
          completionPercentage: 0,
        };

        console.log('🆕 Nouvelle progression initialisée');

        if (trackAnalytics) {
          try {
            console.log('Analytics Event:', {
              eventType: 'ONBOARDING_STARTED',
              data: { userId, role, timestamp: loadedProgress.startedAt },
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.warn("Erreur lors de l'envoi d'analytics:", error);
          }
        }
      } else {
        console.log('📦 Progression chargée depuis localStorage');
      }

      console.log(
        '🔄 Progression initialisée:',
        loadedProgress.completionPercentage + '%'
      );
      setProgress(loadedProgress);
      setIsInitialized(true); // Marquer comme initialisé
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [userId, role]); // Simplifier les dépendances

  /**
   * Initialisation automatique au montage du hook
   */
  useEffect(() => {
    if (userId && !progress && !isInitialized) {
      console.log(
        `🚀 Hook Instance ${hookInstanceId} - Auto-initialisation de la progression`
      );
      initProgressManually();
    }
  }, [userId, progress, isInitialized]); // Ajouter isInitialized pour éviter les réinitialisations

  /**
   * Sauvegarde automatique
   */
  useEffect(() => {
    if (!progress || !autoSave) return;

    const now = Date.now();
    if (now - lastSaveTime < saveInterval) return;

    const saveProgress = async () => {
      try {
        await saveToDatabase(progress);
        saveToLocalStorage(progress);
        setLastSaveTime(now);
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde automatique:', error);
      }
    };

    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [
    progress,
    autoSave,
    saveInterval,
    lastSaveTime,
    saveToDatabase,
    saveToLocalStorage,
  ]);

  /**
   * Mettre à jour la progression
   */
  const updateProgress = useCallback(
    async (step: OnboardingStep, data: Partial<OnboardingData>) => {
      if (!progress) return;

      const updatedProgress = {
        ...progress,
        currentStep: step,
        lastUpdatedAt: new Date().toISOString(),
        steps: {
          ...progress.steps,
          [step]: {
            ...progress.steps[step],
            status: 'in-progress' as StepStatus,
          },
        },
      };

      updatedProgress.completionPercentage = calculateCompletionPercentage(
        updatedProgress.steps
      );

      // Sauvegarder seulement si autoSave est activé
      if (autoSave) {
        try {
          await saveToDatabase(updatedProgress);
          saveToLocalStorage(updatedProgress);

          await trackEvent('STEP_STARTED', {
            userId,
            step,
            timestamp: updatedProgress.lastUpdatedAt,
          });
        } catch (error) {
          console.warn('Erreur lors de la sauvegarde:', error);
        }
      } else {
        // Sauvegarder seulement en localStorage (local uniquement)
        saveToLocalStorage(updatedProgress);
      }

      // Forcer une nouvelle référence pour déclencher le re-render React
      setProgress(updatedProgress);
    },
    [
      progress,
      calculateCompletionPercentage,
      saveToDatabase,
      saveToLocalStorage,
      trackEvent,
      userId,
      autoSave,
    ]
  );

  /**
   * Marquer une étape comme terminée
   */
  const completeStep = useCallback(
    async (step: OnboardingStep, data: Partial<OnboardingData>) => {
      if (!progress) return;

      const stepStartTime = progress.steps[step]?.completedAt
        ? new Date(progress.steps[step].completedAt!).getTime()
        : Date.now();
      const duration = Date.now() - stepStartTime;

      const updatedProgress = {
        ...progress,
        lastUpdatedAt: new Date().toISOString(),
        steps: {
          ...progress.steps,
          [step]: {
            ...progress.steps[step],
            status: 'completed' as StepStatus,
            completedAt: new Date().toISOString(),
          },
        },
      };

      updatedProgress.completionPercentage = calculateCompletionPercentage(
        updatedProgress.steps
      );

      // Debug: Log de la mise à jour de progression
      console.log('📈 completeStep - Mise à jour progression:', {
        step,
        oldPercentage: progress.completionPercentage,
        newPercentage: updatedProgress.completionPercentage,
        totalSteps: Object.keys(updatedProgress.steps).length,
        completedSteps: Object.values(updatedProgress.steps).filter(
          s => s.status === 'completed'
        ).length,
      });

      // Vérifier si l'onboarding est terminé
      const allRequiredStepsCompleted = Object.values(updatedProgress.steps)
        .filter(s => s.isRequired)
        .every(s => s.status === 'completed');

      if (allRequiredStepsCompleted) {
        updatedProgress.isCompleted = true;
        updatedProgress.completedAt = new Date().toISOString();
      }

      // Sauvegarder AVANT de mettre à jour le state React
      try {
        await saveToDatabase(updatedProgress);
        saveToLocalStorage(updatedProgress);

        await trackEvent('STEP_COMPLETED', {
          userId,
          step,
          duration,
          timestamp: updatedProgress.lastUpdatedAt,
        });

        if (updatedProgress.isCompleted) {
          await trackEvent('ONBOARDING_COMPLETED', {
            userId,
            totalDuration:
              Date.now() - new Date(updatedProgress.startedAt).getTime(),
            timestamp: updatedProgress.completedAt,
          });
        }
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde:', error);
      }

      // Forcer une nouvelle référence pour déclencher le re-render React
      console.log(
        `🔄 Hook Instance ${hookInstanceId} - Mise à jour de l'état React avec: ${updatedProgress.completionPercentage}%`
      );
      setProgress(updatedProgress);
    },
    [
      progress,
      calculateCompletionPercentage,
      saveToDatabase,
      saveToLocalStorage,
      trackEvent,
      userId,
    ]
  );

  /**
   * Passer une étape
   */
  const skipStep = useCallback(
    async (step: OnboardingStep, reason?: string) => {
      if (!progress) return;

      const updatedProgress = {
        ...progress,
        lastUpdatedAt: new Date().toISOString(),
        steps: {
          ...progress.steps,
          [step]: {
            ...progress.steps[step],
            status: 'skipped' as StepStatus,
            completedAt: new Date().toISOString(),
          },
        },
      };

      updatedProgress.completionPercentage = calculateCompletionPercentage(
        updatedProgress.steps
      );

      // Sauvegarder
      try {
        await saveToDatabase(updatedProgress);
        saveToLocalStorage(updatedProgress);

        await trackEvent('STEP_SKIPPED', {
          userId,
          step,
          reason,
          timestamp: updatedProgress.lastUpdatedAt,
        });
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde:', error);
      }

      // Forcer une nouvelle référence pour déclencher le re-render React
      setProgress(updatedProgress);
    },
    [
      progress,
      calculateCompletionPercentage,
      saveToDatabase,
      saveToLocalStorage,
      trackEvent,
      userId,
    ]
  );

  /**
   * Réinitialiser la progression
   */
  const resetProgress = useCallback(async () => {
    const newProgress = initializeProgress();
    setProgress(newProgress);

    try {
      await saveToDatabase(newProgress);
      saveToLocalStorage(newProgress);

      if (persistToLocalStorage) {
        localStorage.removeItem(getStorageKey());
      }
    } catch (error) {
      console.warn('Erreur lors de la réinitialisation:', error);
    }
  }, [
    initializeProgress,
    saveToDatabase,
    saveToLocalStorage,
    persistToLocalStorage,
    getStorageKey,
  ]);

  return {
    progress,
    updateProgress,
    completeStep,
    skipStep,
    resetProgress,
    initProgressManually,
    isLoading,
    error,
  };
};

export default useOnboardingProgress;
