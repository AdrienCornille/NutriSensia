/**
 * Hook React pour gérer les analytics d'onboarding
 * Fournit une interface simple pour tracker les événements d'onboarding
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { simpleOnboardingAnalytics as onboardingAnalytics } from '@/lib/analytics-simple';
import { OnboardingRole, OnboardingErrorType, HelpType } from '@/types/analytics';

interface UseOnboardingAnalyticsOptions {
  role: OnboardingRole;
  totalSteps: number;
  autoTrackPageViews?: boolean;
}

interface UseOnboardingAnalyticsReturn {
  // Méthodes de tracking
  trackOnboardingStarted: () => void;
  trackStepStarted: (step: string, stepNumber: number) => void;
  trackStepCompleted: (step: string, stepNumber: number, completionPercentage: number) => void;
  trackStepSkipped: (step: string, stepNumber: number, reason?: string) => void;
  trackStepError: (step: string, stepNumber: number, errorType: OnboardingErrorType, errorMessage?: string) => void;
  trackHelpRequested: (step: string, stepNumber: number, helpType: HelpType) => void;
  trackOnboardingCompleted: () => void;
  trackOnboardingAbandoned: (step: string, stepNumber: number, reason?: string) => void;
  trackPageView: (pageName: string) => void;
  
  // Utilitaires
  getSessionId: () => string;
  getElapsedTime: () => number;
}

/**
 * Hook pour les analytics d'onboarding
 */
export function useOnboardingAnalytics({
  role,
  totalSteps,
  autoTrackPageViews = true,
}: UseOnboardingAnalyticsOptions): UseOnboardingAnalyticsReturn {
  const { user } = useAuth();
  const startTimeRef = useRef<number>(Date.now());
  const stepStartTimesRef = useRef<Map<string, number>>(new Map());

  // Identifier l'utilisateur si connecté
  useEffect(() => {
    if (user) {
      onboardingAnalytics.identify(user.id, {
        role,
        email: user.email,
        createdAt: user.created_at,
      });
    }
  }, [user, role]);

  // Tracking automatique des pages vues
  useEffect(() => {
    if (autoTrackPageViews) {
      const pageName = window.location.pathname;
      onboardingAnalytics.trackPageView(pageName);
    }
  }, [autoTrackPageViews]);

  // Tracking du début de l'onboarding
  const trackOnboardingStarted = useCallback(() => {
    startTimeRef.current = Date.now();
    onboardingAnalytics.trackOnboardingStarted(role, user?.id);
  }, [role, user?.id]);

  // Tracking du début d'une étape
  const trackStepStarted = useCallback((step: string, stepNumber: number) => {
    stepStartTimesRef.current.set(step, Date.now());
    onboardingAnalytics.trackStepStarted(step, stepNumber, totalSteps, role, user?.id);
  }, [role, totalSteps, user?.id]);

  // Tracking de la completion d'une étape
  const trackStepCompleted = useCallback((
    step: string, 
    stepNumber: number, 
    completionPercentage: number
  ) => {
    onboardingAnalytics.trackStepCompleted(
      step, 
      stepNumber, 
      totalSteps, 
      role, 
      completionPercentage, 
      user?.id
    );
  }, [role, totalSteps, user?.id]);

  // Tracking du passage d'une étape
  const trackStepSkipped = useCallback((
    step: string, 
    stepNumber: number, 
    reason?: string
  ) => {
    onboardingAnalytics.trackStepSkipped(
      step, 
      stepNumber, 
      totalSteps, 
      role, 
      reason, 
      user?.id
    );
  }, [role, totalSteps, user?.id]);

  // Tracking d'une erreur dans une étape
  const trackStepError = useCallback((
    step: string, 
    stepNumber: number, 
    errorType: OnboardingErrorType, 
    errorMessage?: string
  ) => {
    onboardingAnalytics.trackStepError(
      step, 
      stepNumber, 
      role, 
      errorType, 
      errorMessage, 
      user?.id
    );
  }, [role, user?.id]);

  // Tracking d'une demande d'aide
  const trackHelpRequested = useCallback((
    step: string, 
    stepNumber: number, 
    helpType: HelpType
  ) => {
    onboardingAnalytics.trackHelpRequested(
      step, 
      stepNumber, 
      role, 
      helpType, 
      user?.id
    );
  }, [role, user?.id]);

  // Tracking de la completion de l'onboarding
  const trackOnboardingCompleted = useCallback(() => {
    const totalTimeSpent = Date.now() - startTimeRef.current;
    onboardingAnalytics.trackOnboardingCompleted(
      role, 
      totalSteps, 
      totalTimeSpent, 
      user?.id
    );
  }, [role, totalSteps, user?.id]);

  // Tracking de l'abandon de l'onboarding
  const trackOnboardingAbandoned = useCallback((
    step: string, 
    stepNumber: number, 
    reason?: string
  ) => {
    onboardingAnalytics.trackOnboardingAbandoned(
      step, 
      stepNumber, 
      role, 
      reason, 
      user?.id
    );
  }, [role, user?.id]);

  // Tracking d'une page vue
  const trackPageView = useCallback((pageName: string) => {
    onboardingAnalytics.trackPageView(pageName, user?.id);
  }, [user?.id]);

  // Utilitaires
  const getSessionId = useCallback(() => {
    return onboardingAnalytics.getSessionId();
  }, []);

  const getElapsedTime = useCallback(() => {
    return Date.now() - startTimeRef.current;
  }, []);

  return {
    trackOnboardingStarted,
    trackStepStarted,
    trackStepCompleted,
    trackStepSkipped,
    trackStepError,
    trackHelpRequested,
    trackOnboardingCompleted,
    trackOnboardingAbandoned,
    trackPageView,
    getSessionId,
    getElapsedTime,
  };
}

/**
 * Hook simplifié pour tracker les erreurs d'onboarding
 */
export function useOnboardingErrorTracking(role: OnboardingRole) {
  const { user } = useAuth();

  const trackError = useCallback((
    step: string,
    stepNumber: number,
    errorType: OnboardingErrorType,
    errorMessage?: string
  ) => {
    onboardingAnalytics.trackStepError(
      step,
      stepNumber,
      role,
      errorType,
      errorMessage,
      user?.id
    );
  }, [role, user?.id]);

  return { trackError };
}

/**
 * Hook pour tracker les demandes d'aide
 */
export function useOnboardingHelpTracking(role: OnboardingRole) {
  const { user } = useAuth();

  const trackHelpRequest = useCallback((
    step: string,
    stepNumber: number,
    helpType: HelpType
  ) => {
    onboardingAnalytics.trackHelpRequested(
      step,
      stepNumber,
      role,
      helpType,
      user?.id
    );
  }, [role, user?.id]);

  return { trackHelpRequest };
}

export default useOnboardingAnalytics;
