/**
 * Hook simplifié utilisant le store singleton
 * Résout définitivement les problèmes de remontage
 */

import { useState, useEffect, useCallback } from 'react';
import {
  OnboardingProgress,
  OnboardingStep,
  StepStatus,
} from '@/types/onboarding';
import { UserRole } from '@/lib/database-types';
import progressStore from './useProgressStore';

interface UseSimpleOnboardingProgressOptions {
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
}

interface UseSimpleOnboardingProgressReturn {
  progress: OnboardingProgress | null;
  completeStep: (step: OnboardingStep) => void;
  updateProgress: (step: OnboardingStep) => void;
  skipStep: (step: OnboardingStep) => void;
  isLoading: boolean;
  error: string | null;
}

export const useSimpleOnboardingProgress = ({
  userId,
  role,
  steps,
}: UseSimpleOnboardingProgressOptions): UseSimpleOnboardingProgressReturn => {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // S'abonner au store au montage
  useEffect(() => {
    console.log(`🔗 Hook Simple - Abonnement au store pour userId: ${userId}`);

    // S'abonner aux changements
    const unsubscribe = progressStore.subscribe(newProgress => {
      console.log(
        `📡 Hook Simple - Progression reçue du store: ${newProgress?.completionPercentage || 0}%`
      );
      setProgress(newProgress);
      setIsLoading(false);
    });

    // Initialiser la progression seulement si nécessaire
    try {
      progressStore.initProgress(userId, role, steps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'initialisation");
      setIsLoading(false);
    }

    // Nettoyer l'abonnement au démontage
    return unsubscribe;
  }, [userId, role]); // Supprimer 'steps' des dépendances pour éviter les re-créations

  // Marquer une étape comme terminée
  const completeStep = useCallback((step: OnboardingStep) => {
    console.log(`✅ Hook Simple - Complétion de l'étape: ${step}`);
    progressStore.updateProgress(step, 'completed');
  }, []);

  // Mettre à jour l'étape (en cours)
  const updateProgress = useCallback((step: OnboardingStep) => {
    console.log(`🔄 Hook Simple - Mise à jour de l'étape: ${step}`);
    progressStore.updateProgress(step, 'in-progress');
  }, []);

  // Passer une étape
  const skipStep = useCallback((step: OnboardingStep) => {
    console.log(`⏭️ Hook Simple - Passage de l'étape: ${step}`);
    progressStore.updateProgress(step, 'skipped');
  }, []);

  return {
    progress,
    completeStep,
    updateProgress,
    skipStep,
    isLoading,
    error,
  };
};

export default useSimpleOnboardingProgress;
