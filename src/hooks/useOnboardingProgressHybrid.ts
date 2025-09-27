/**
 * Hook de progression d'onboarding hybride
 * Combine localStorage (performance) + base de données (persistance)
 * Gère la progression figée à 100% une fois terminée
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OnboardingProgress, OnboardingStep, StepStatus, OnboardingData } from '@/types/onboarding';

interface UseOnboardingProgressHybridOptions {
  userId: string;
  role: string;
  steps: Array<{
    id: OnboardingStep;
    title: string;
    description: string;
    isRequired: boolean;
    estimatedTime: number;
  }>;
}

interface UseOnboardingProgressHybridReturn {
  progress: OnboardingProgress | null;
  isLoading: boolean;
  error: string | null;
  updateProgress: (step: OnboardingStep, data?: Partial<OnboardingData>) => Promise<void>;
  completeStep: (step: OnboardingStep, data?: Partial<OnboardingData>) => Promise<void>;
  skipStep: (step: OnboardingStep) => Promise<void>;
  isProgressLocked: boolean; // true si onboarding terminé (100%)
  completionPercentage: number; // Pourcentage de completion (0-100)
  isCompleted: boolean; // true si onboarding terminé (100%)
}

export const useOnboardingProgressHybrid = ({
  userId,
  role,
  steps,
}: UseOnboardingProgressHybridOptions): UseOnboardingProgressHybridReturn => {
  
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProgressLocked, setIsProgressLocked] = useState(false);
  
  const router = useRouter();
  const hookInstanceId = useRef(Math.random().toString(36).substr(2, 9)).current;

  /**
   * Clé pour le localStorage
   */
  const getStorageKey = useCallback(() => {
    return `onboarding_progress_${userId}_${role}`;
  }, [userId, role]);

  /**
   * Charger la progression depuis la base de données
   */
  const loadProgressFromDatabase = useCallback(async (): Promise<{
    completionPercentage: number;
    isCompleted: boolean;
    isLocked: boolean;
  }> => {
    try {
      console.log(`🔍 [${hookInstanceId}] Chargement progression DB pour userId: ${userId}`);
      
      const { data, error: dbError } = await supabase
        .from('nutritionists')
        .select('onboarding_completed, onboarding_completed_at')
        .eq('id', userId)
        .single();

      console.log(`📊 [${hookInstanceId}] Résultat DB:`, { data, dbError });
      console.log(`📊 [${hookInstanceId}] Données détaillées:`, data);
      console.log(`📊 [${hookInstanceId}] Erreur détaillée:`, dbError);

      if (dbError) {
        console.log(`❌ [${hookInstanceId}] Erreur DB:`, dbError);
        // Si l'utilisateur n'existe pas dans la table, c'est normal au début
        if (dbError.code === 'PGRST116') {
          console.log(`ℹ️ [${hookInstanceId}] Utilisateur non trouvé dans nutritionists (normal pour nouveau)`);
        }
        return { completionPercentage: 0, isCompleted: false, isLocked: false };
      }

      // Gérer différents types de données pour onboarding_completed
      let dbProgress = 0;
      const rawProgress = data?.onboarding_completed;
      
      console.log(`🔍 [${hookInstanceId}] Valeur brute onboarding_completed:`, rawProgress, typeof rawProgress);
      
      if (typeof rawProgress === 'number') {
        dbProgress = rawProgress;
      } else if (typeof rawProgress === 'boolean') {
        dbProgress = rawProgress ? 100 : 0;
      } else if (typeof rawProgress === 'string') {
        dbProgress = parseFloat(rawProgress) || 0;
      } else {
        dbProgress = 0;
      }
      
      const isCompleted = dbProgress === 100;
      const isLocked = isCompleted;

      console.log(`✅ [${hookInstanceId}] Progression DB chargée: ${dbProgress}% (completed: ${isCompleted})`);

      return {
        completionPercentage: dbProgress,
        isCompleted,
        isLocked,
      };
    } catch (error) {
      console.error(`💥 [${hookInstanceId}] Erreur lors du chargement DB:`, error);
      return { completionPercentage: 0, isCompleted: false, isLocked: false };
    }
  }, [userId, hookInstanceId]);

  /**
   * Charger la progression depuis le localStorage
   */
  const loadProgressFromLocalStorage = useCallback((): OnboardingProgress | null => {
    try {
      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.userId === userId && parsed.userRole === role) {
          return parsed;
        }
      }
    } catch (error) {
      // Erreur localStorage ignorée
    }
    return null;
  }, [getStorageKey, userId, role, hookInstanceId]);

  /**
   * Sauvegarder la progression en base de données
   */
  const saveProgressToDatabase = useCallback(async (completionPercentage: number) => {
    try {
      
      const updateData: any = {
        onboarding_completed: completionPercentage,
        updated_at: new Date().toISOString(),
      };

      // IMPORTANT: Ne PAS mettre à jour onboarding_completed_at ici
      // Ce champ est réservé pour le clic "Finaliser mon profil" uniquement
      // Il sera mis à jour dans handleOnboardingComplete

      const { error: dbError } = await supabase
        .from('nutritionists')
        .update(updateData)
        .eq('id', userId);

      if (dbError) {
        throw dbError;
      }
    } catch (error) {
      throw error;
    }
  }, [userId, hookInstanceId]);

  /**
   * Sauvegarder la progression en localStorage
   */
  const saveProgressToLocalStorage = useCallback((progress: OnboardingProgress) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch (error) {
      // Erreur localStorage ignorée
    }
  }, [getStorageKey, hookInstanceId]);

  /**
   * Initialiser la progression
   */
  const initializeProgress = useCallback((): OnboardingProgress => {
    const stepMap: Record<string, any> = {};
    
    steps.forEach((step) => {
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
   * Calculer le pourcentage de completion
   * LOGIQUE SPÉCIALE: L'étape 'completion' = 100% automatiquement
   */
  const calculateCompletionPercentage = useCallback((steps: Record<string, any>): number => {
    const stepEntries = Object.entries(steps);
    
    // Si l'utilisateur est arrivé à l'étape 'completion', c'est 100%
    const completionStep = stepEntries.find(([stepId]) => stepId === 'completion');
    if (completionStep && (completionStep[1].status === 'completed' || completionStep[1].status === 'in-progress')) {
      return 100;
    }
    
    // Sinon, calculer basé sur les étapes précédentes (sans compter 'completion')
    const contentSteps = stepEntries.filter(([stepId]) => stepId !== 'completion');
    const totalContentSteps = contentSteps.length;
    const completedContentSteps = contentSteps.filter(
      ([, step]) => step.status === 'completed'
    ).length;
    
    // Progression de 0% à 87.5% pour les 7 étapes de contenu
    return Math.round((completedContentSteps / totalContentSteps) * 87.5);
  }, []);

  /**
   * Calculer le pourcentage de completion en préservant la progression maximale
   * GARANTIE: La progression ne recule jamais
   */
  const calculateCompletionPercentageWithMax = useCallback((steps: Record<string, any>, currentMax: number): number => {
    const calculatedPercentage = calculateCompletionPercentage(steps);
    const finalPercentage = Math.max(calculatedPercentage, currentMax);
    
    return finalPercentage;
  }, [calculateCompletionPercentage]);

  /**
   * Charger la progression (hybride)
   */
  const loadProgress = useCallback(async () => {
    try {
      console.log(`🚀 [${hookInstanceId}] Début chargement progression hybride`);
      setIsLoading(true);
      setError(null);

      // 1. Charger depuis la base de données
      const dbData = await loadProgressFromDatabase();
      console.log(`📊 [${hookInstanceId}] Données DB récupérées:`, dbData);
      
      // 2. Si onboarding terminé (100%), utiliser les données DB
      if (dbData.isLocked) {
        console.log(`🔒 [${hookInstanceId}] Onboarding verrouillé à 100% - utilisation données DB`);
        
        const lockedProgress = initializeProgress();
        lockedProgress.completionPercentage = 100;
        lockedProgress.isCompleted = true;
        lockedProgress.lastUpdatedAt = new Date().toISOString();
        
        // Marquer toutes les étapes comme terminées
        Object.keys(lockedProgress.steps).forEach(stepId => {
          lockedProgress.steps[stepId].status = 'completed';
        });
        
        setProgress(lockedProgress);
        setIsProgressLocked(true);
        setIsLoading(false);
        console.log(`✅ [${hookInstanceId}] Progression verrouillée configurée`);
        return;
      }

      // 3. Si onboarding en cours, PRIORITÉ À LA BASE DE DONNÉES
      const localProgress = loadProgressFromLocalStorage();
      console.log(`💾 [${hookInstanceId}] localStorage trouvé:`, localProgress ? `${localProgress.completionPercentage}%` : 'null');
      
      if (localProgress) {
        // IMPORTANT: La DB fait foi ! Ne jamais diminuer la progression
        const finalProgress = Math.max(localProgress.completionPercentage, dbData.completionPercentage);
        console.log(`🔄 [${hookInstanceId}] Progression finale: localStorage=${localProgress.completionPercentage}%, DB=${dbData.completionPercentage}%, final=${finalProgress}%`);
        localProgress.completionPercentage = finalProgress;
        
        // Mettre à jour les étapes selon la progression DB
        const totalSteps = Object.keys(localProgress.steps).length;
        const completedSteps = Math.round((finalProgress / 100) * totalSteps);
        
        // Marquer les étapes comme terminées selon la progression
        const stepIds = Object.keys(localProgress.steps);
        stepIds.forEach((stepId, index) => {
          if (index < completedSteps) {
            localProgress.steps[stepId].status = 'completed';
          } else if (index === completedSteps) {
            localProgress.steps[stepId].status = 'in-progress';
          } else {
            localProgress.steps[stepId].status = 'not-started';
          }
        });
        
        setProgress(localProgress);
        setIsProgressLocked(false);
        console.log(`✅ [${hookInstanceId}] Progression localStorage mise à jour: ${localProgress.completionPercentage}%`);
      } else {
        // Créer une nouvelle progression basée sur la DB
        console.log(`🆕 [${hookInstanceId}] Création nouvelle progression avec DB: ${dbData.completionPercentage}%`);
        const newProgress = initializeProgress();
        newProgress.completionPercentage = dbData.completionPercentage;
        
        // Mettre à jour les étapes selon la progression DB
        const totalSteps = Object.keys(newProgress.steps).length;
        const completedSteps = Math.round((dbData.completionPercentage / 100) * totalSteps);
        
        const stepIds = Object.keys(newProgress.steps);
        stepIds.forEach((stepId, index) => {
          if (index < completedSteps) {
            newProgress.steps[stepId].status = 'completed';
          } else if (index === completedSteps) {
            newProgress.steps[stepId].status = 'in-progress';
          } else {
            newProgress.steps[stepId].status = 'not-started';
          }
        });
        
        setProgress(newProgress);
        setIsProgressLocked(false);
        console.log(`✅ [${hookInstanceId}] Nouvelle progression créée: ${newProgress.completionPercentage}%`);
      }

      setIsLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de chargement');
      setIsLoading(false);
    }
  }, [loadProgressFromDatabase, loadProgressFromLocalStorage, initializeProgress, hookInstanceId]);

  /**
   * Mettre à jour la progression (NE PEUT PAS DIMINUER)
   */
  const updateProgress = useCallback(async (step: OnboardingStep, data?: Partial<OnboardingData>) => {
    if (!progress || isProgressLocked) {
      return;
    }

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

    // Utiliser la nouvelle logique qui préserve la progression maximale
    updatedProgress.completionPercentage = calculateCompletionPercentageWithMax(updatedProgress.steps, progress.completionPercentage);
    
    // Sauvegarder en localStorage immédiatement
    saveProgressToLocalStorage(updatedProgress);
    
    // Sauvegarder en base de données (asynchrone)
    try {
      await saveProgressToDatabase(updatedProgress.completionPercentage);
    } catch (error) {
      // Erreur sauvegarde DB non bloquante
    }

    setProgress(updatedProgress);
  }, [progress, isProgressLocked, calculateCompletionPercentage, saveProgressToLocalStorage, saveProgressToDatabase, hookInstanceId]);

  /**
   * Marquer une étape comme terminée (NE PEUT PAS DIMINUER)
   */
  const completeStep = useCallback(async (step: OnboardingStep, data?: Partial<OnboardingData>) => {
    if (!progress || isProgressLocked) {
      return;
    }

    const updatedProgress = {
      ...progress,
      lastUpdatedAt: new Date().toISOString(),
      steps: {
        ...progress.steps,
        [step]: {
          ...progress.steps[step],
          status: 'completed' as StepStatus,
        },
      },
    };

    // Utiliser la nouvelle logique qui préserve la progression maximale
    updatedProgress.completionPercentage = calculateCompletionPercentageWithMax(updatedProgress.steps, progress.completionPercentage);
    
    // Vérifier si l'onboarding est terminé
    if (updatedProgress.completionPercentage === 100) {
      updatedProgress.isCompleted = true;
      setIsProgressLocked(true);
    }
    
    // Sauvegarder en localStorage immédiatement
    saveProgressToLocalStorage(updatedProgress);
    
    // Sauvegarder en base de données (asynchrone)
    try {
      await saveProgressToDatabase(updatedProgress.completionPercentage);
    } catch (error) {
      // Erreur sauvegarde DB non bloquante
    }

    setProgress(updatedProgress);
  }, [progress, isProgressLocked, calculateCompletionPercentage, saveProgressToLocalStorage, saveProgressToDatabase, hookInstanceId]);

  /**
   * Passer une étape
   */
  const skipStep = useCallback(async (step: OnboardingStep) => {
    if (!progress || isProgressLocked) {
      return;
    }

    const updatedProgress = {
      ...progress,
      lastUpdatedAt: new Date().toISOString(),
      steps: {
        ...progress.steps,
        [step]: {
          ...progress.steps[step],
          status: 'skipped' as StepStatus,
        },
      },
    };

    updatedProgress.completionPercentage = calculateCompletionPercentage(updatedProgress.steps);
    
    // Sauvegarder en localStorage immédiatement
    saveProgressToLocalStorage(updatedProgress);
    
    // Sauvegarder en base de données (asynchrone)
    try {
      await saveProgressToDatabase(updatedProgress.completionPercentage);
    } catch (error) {
      // Erreur sauvegarde DB non bloquante
    }

    setProgress(updatedProgress);
  }, [progress, isProgressLocked, calculateCompletionPercentage, saveProgressToLocalStorage, saveProgressToDatabase, hookInstanceId]);

  // Charger la progression au montage
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    isLoading,
    error,
    updateProgress,
    completeStep,
    skipStep,
    isProgressLocked,
    completionPercentage: progress?.completionPercentage || 0,
    isCompleted: progress?.isCompleted || false,
  };
};

export default useOnboardingProgressHybrid;
