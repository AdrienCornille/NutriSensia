/**
 * Store singleton pour la progression d'onboarding
 * Persiste même si les composants se remontent
 */

import { OnboardingProgress, OnboardingStep, StepStatus } from '@/types/onboarding';

// Type pour les listeners
type ProgressListener = (progress: OnboardingProgress | null) => void;

class ProgressStore {
  private progress: OnboardingProgress | null = null;
  private listeners: Set<ProgressListener> = new Set();
  private isInitialized = false;

  // Ajouter un listener
  subscribe(listener: ProgressListener) {
    this.listeners.add(listener);
    // Envoyer immédiatement l'état actuel
    listener(this.progress);
    
    // Retourner la fonction de désabonnement
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notifier tous les listeners
  private notify() {
    this.listeners.forEach(listener => listener(this.progress));
  }

  // Initialiser la progression
  initProgress(userId: string, role: string, steps: any[]): OnboardingProgress {
    // Vérifier si on a déjà une progression pour ce même utilisateur/rôle
    if (this.isInitialized && this.progress && 
        this.progress.userId === userId && this.progress.userRole === role) {
      console.log('📦 Store - Progression déjà initialisée pour ce user/rôle, retour de l\'existante');
      return this.progress;
    }

    // Charger depuis localStorage
    const storageKey = `onboarding_progress_${userId}_${role}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.userId === userId && parsed.userRole === role) {
          this.progress = parsed;
          this.isInitialized = true;
          console.log('📦 Store - Progression chargée depuis localStorage');
          this.notify();
          return this.progress;
        }
      }
    } catch (error) {
      console.warn('Store - Erreur lors du chargement:', error);
    }

    // Créer une nouvelle progression
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

    this.progress = {
      userId,
      userRole: role,
      currentStep: steps[0]?.id as OnboardingStep,
      steps: stepMap,
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      isCompleted: false,
      completionPercentage: 0,
    };

    this.isInitialized = true;
    console.log('🆕 Store - Nouvelle progression créée');
    
    // Sauvegarder immédiatement
    this.saveToLocalStorage(userId, role);
    this.notify();
    
    return this.progress;
  }

  // Mettre à jour la progression
  updateProgress(step: OnboardingStep, status: StepStatus) {
    if (!this.progress) return;

    const updatedProgress = {
      ...this.progress,
      currentStep: step,
      lastUpdatedAt: new Date().toISOString(),
      steps: {
        ...this.progress.steps,
        [step]: {
          ...this.progress.steps[step],
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined,
        },
      },
    };

    // Recalculer le pourcentage
    const totalSteps = Object.keys(updatedProgress.steps).length;
    const completedSteps = Object.values(updatedProgress.steps).filter(
      step => step.status === 'completed'
    ).length;
    
    updatedProgress.completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    console.log(`📈 Store - Progression mise à jour: ${step} -> ${status} (${updatedProgress.completionPercentage}%)`);

    this.progress = updatedProgress;
    this.saveToLocalStorage(updatedProgress.userId, updatedProgress.userRole);
    this.notify();
  }

  // Sauvegarder dans localStorage
  private saveToLocalStorage(userId: string, role: string) {
    if (!this.progress) return;
    
    try {
      const storageKey = `onboarding_progress_${userId}_${role}`;
      localStorage.setItem(storageKey, JSON.stringify(this.progress));
    } catch (error) {
      console.warn('Store - Erreur sauvegarde localStorage:', error);
    }
  }

  // Obtenir la progression actuelle
  getProgress(): OnboardingProgress | null {
    return this.progress;
  }

  // Réinitialiser le store (pour les tests)
  reset() {
    this.progress = null;
    this.isInitialized = false;
    this.listeners.clear();
  }
}

// Instance singleton
const progressStore = new ProgressStore();

export default progressStore;
