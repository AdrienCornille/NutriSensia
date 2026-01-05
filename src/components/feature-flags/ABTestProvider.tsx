/**
 * Provider pour les tests A/B et feature flags
 *
 * Ce composant fournit le contexte des feature flags aux composants enfants
 * et gère l'initialisation du tracking des événements A/B.
 */

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { analytics as abTestAnalytics } from '@/lib/feature-flags/analytics-simple';

/**
 * Interface pour le contexte des feature flags
 */
interface ABTestContextType {
  // Flags actuels
  flags: Record<string, any>;

  // Méthodes pour récupérer les flags
  getFlag: <T>(flagKey: string, defaultValue: T) => T;

  // Méthodes de tracking
  trackEvent: (eventType: string, data?: Record<string, any>) => Promise<void>;
  trackConversion: (
    flagKey: string,
    data?: Record<string, any>
  ) => Promise<void>;

  // État du provider
  isLoading: boolean;
  error: string | null;

  // Informations utilisateur
  userId?: string;
  userRole?: 'nutritionist' | 'patient' | 'admin';
  sessionId?: string;
}

/**
 * Contexte par défaut
 */
const defaultContext: ABTestContextType = {
  flags: {},
  getFlag: (_, defaultValue) => defaultValue,
  trackEvent: async () => {},
  trackConversion: async () => {},
  isLoading: true,
  error: null,
};

/**
 * Contexte React pour les tests A/B
 */
const ABTestContext = createContext<ABTestContextType>(defaultContext);

/**
 * Interface pour les props du provider
 */
interface ABTestProviderProps {
  children: ReactNode;
  userId?: string;
  userRole?: 'nutritionist' | 'patient' | 'admin';
  initialFlags?: Record<string, any>;
}

/**
 * Provider principal pour les tests A/B
 */
export function ABTestProvider({
  children,
  userId,
  userRole,
  initialFlags = {},
}: ABTestProviderProps) {
  const [flags, setFlags] = useState<Record<string, any>>(initialFlags);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  /**
   * Initialisation des feature flags
   */
  useEffect(() => {
    async function initializeFlags() {
      // Éviter les appels répétés
      if (isLoading || Object.keys(flags).length > 0) return;

      try {
        setIsLoading(true);
        setError(null);

        // Si des flags initiaux sont fournis (côté serveur), les utiliser
        if (Object.keys(initialFlags).length > 0) {
          setFlags(initialFlags);
          setIsLoading(false);
          return;
        }

        // Sinon, récupérer les flags côté client
        const response = await fetch('/api/flags');

        if (!response.ok) {
          throw new Error(`Failed to fetch flags: ${response.status}`);
        }

        const flagsData = await response.json();
        setFlags(flagsData.flags || {});

        // Tracking de l'attribution des flags (une seule fois)
        if (userId) {
          for (const [flagKey, flagValue] of Object.entries(
            flagsData.flags || {}
          )) {
            abTestAnalytics.trackFlagAssignment(
              userId,
              flagKey,
              String(flagValue),
              { userRole, sessionId }
            );
          }
        }
      } catch (err) {
        console.error("Erreur lors de l'initialisation des flags:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    initializeFlags();
  }, []); // Dépendances vides pour éviter la boucle infinie

  /**
   * Récupère la valeur d'un feature flag
   */
  const getFlag = <T,>(flagKey: string, defaultValue: T): T => {
    return flags[flagKey] !== undefined ? flags[flagKey] : defaultValue;
  };

  /**
   * Enregistre un événement A/B
   */
  const trackEvent = async (
    eventType: string,
    data: Record<string, any> = {}
  ) => {
    if (!userId) return;

    try {
      // Déterminer quels flags sont concernés par cet événement
      const relevantFlags = Object.entries(flags).filter(
        ([flagKey]) => data.flagKey === flagKey || !data.flagKey
      );

      for (const [flagKey, flagValue] of relevantFlags) {
        await abTestAnalytics.trackEvent({
          eventType: eventType as any,
          userId,
          sessionId,
          flagKey,
          flagValue: String(flagValue),
          userRole,
          ...data,
        });
      }
    } catch (error) {
      console.error("Erreur lors du tracking d'événement:", error);
    }
  };

  /**
   * Enregistre une conversion
   */
  const trackConversion = async (
    flagKey: string,
    data: Record<string, any> = {}
  ) => {
    if (!userId || !flags[flagKey]) return;

    try {
      await abTestAnalytics.trackEvent({
        eventType: 'conversion',
        userId,
        sessionId,
        flagKey,
        flagValue: String(flags[flagKey]),
        userRole,
        ...data,
      });
    } catch (error) {
      console.error('Erreur lors du tracking de conversion:', error);
    }
  };

  /**
   * Valeur du contexte
   */
  const contextValue: ABTestContextType = {
    flags,
    getFlag,
    trackEvent,
    trackConversion,
    isLoading,
    error,
    userId,
    userRole,
    sessionId,
  };

  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte des tests A/B
 */
export function useABTest() {
  const context = useContext(ABTestContext);

  if (!context) {
    throw new Error('useABTest doit être utilisé dans un ABTestProvider');
  }

  return context;
}

/**
 * Hook pour utiliser un feature flag spécifique
 */
export function useFeatureFlag<T>(flagKey: string, defaultValue: T) {
  const { getFlag, trackEvent } = useABTest();
  const flagValue = getFlag(flagKey, defaultValue);

  // Tracking automatique de l'exposition au flag
  useEffect(() => {
    trackEvent('flag_exposure', { flagKey, flagValue });
  }, [flagKey, flagValue, trackEvent]);

  return flagValue;
}

/**
 * Hook pour tracker les événements d'onboarding
 */
export function useOnboardingTracking() {
  const { trackEvent, trackConversion, flags, userId, userRole } = useABTest();

  const trackOnboardingStart = async () => {
    await trackEvent('onboarding_start', {
      userRole,
      timestamp: Date.now(),
    });
  };

  const trackOnboardingStep = async (
    stepName: string,
    stepIndex: number,
    totalSteps: number,
    duration?: number
  ) => {
    await trackEvent('onboarding_step', {
      onboardingStep: stepName,
      stepIndex,
      totalSteps,
      duration,
      userRole,
    });
  };

  const trackOnboardingComplete = async (totalDuration: number) => {
    // Tracking de la completion pour chaque flag actif
    for (const [flagKey, flagValue] of Object.entries(flags)) {
      await trackConversion(flagKey, {
        totalDuration,
        userRole,
        completedAt: Date.now(),
      });
    }
  };

  const trackOnboardingAbandon = async (
    currentStep: string,
    stepIndex: number,
    reason?: string
  ) => {
    await trackEvent('onboarding_abandon', {
      onboardingStep: currentStep,
      stepIndex,
      reason,
      userRole,
    });
  };

  const trackFormValidationError = async (
    formField: string,
    errorMessage: string
  ) => {
    await trackEvent('form_validation_error', {
      formField,
      errorMessage,
      userRole,
    });
  };

  return {
    trackOnboardingStart,
    trackOnboardingStep,
    trackOnboardingComplete,
    trackOnboardingAbandon,
    trackFormValidationError,
  };
}

/**
 * Composant HOC pour wrapper des composants avec les tests A/B
 */
export function withABTest<P extends object>(
  Component: React.ComponentType<P>,
  flagKey: string,
  variants: Record<string, React.ComponentType<P>>
) {
  return function ABTestComponent(props: P) {
    const variant = useFeatureFlag(flagKey, 'control');
    const VariantComponent = variants[variant] || variants.control || Component;

    return <VariantComponent {...props} />;
  };
}

/**
 * Composant pour le rendu conditionnel basé sur les feature flags
 */
interface FeatureFlagProps {
  flag: string;
  value?: any;
  fallback?: ReactNode;
  children: ReactNode;
}

export function FeatureFlag({
  flag,
  value,
  fallback = null,
  children,
}: FeatureFlagProps) {
  const { getFlag } = useABTest();
  const flagValue = getFlag(flag, false);

  // Si une valeur spécifique est requise, la vérifier
  if (value !== undefined) {
    return flagValue === value ? <>{children}</> : <>{fallback}</>;
  }

  // Sinon, traiter comme un boolean
  return flagValue ? <>{children}</> : <>{fallback}</>;
}
