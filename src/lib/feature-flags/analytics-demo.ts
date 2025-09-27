/**
 * Système d'analytics A/B Testing - Version Démonstration
 * 
 * Cette version ne dépend pas de Supabase et est conçue pour les tests de démonstration.
 * Elle simule l'enregistrement des événements sans créer de boucles infinies.
 */

export interface ABTestEventData {
  eventType: string;
  userId: string;
  sessionId: string;
  flagKey: string;
  flagValue: string;
  variant: string;
  userRole?: string;
  onboardingStep?: string;
  stepIndex?: number;
  totalSteps?: number;
  duration?: number;
  errorMessage?: string;
  formField?: string;
  interactionType?: string;
  userAgent?: string;
  deviceType?: string;
  country?: string;
  customData?: Record<string, any>;
  timestamp: number;
}

export interface ABTestMetrics {
  totalUsers: number;
  conversions: number;
  conversionRate: number;
  averageDuration: number;
  variantPerformance: Record<string, {
    users: number;
    conversions: number;
    conversionRate: number;
    averageDuration: number;
  }>;
}

/**
 * Classe d'analytics A/B Testing pour la démonstration
 * Version simplifiée qui ne dépend pas de Supabase
 */
export class ABTestAnalytics {
  private eventQueue: ABTestEventData[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 secondes
  private isFlushing = false;

  constructor() {
    this.startAutoFlush();
  }

  /**
   * Enregistre un événement d'attribution de flag
   */
  trackFlagAssignment(
    userId: string,
    sessionId: string,
    flagKey: string,
    flagValue: string,
    variant: string,
    userRole?: string
  ): void {
    const event: ABTestEventData = {
      eventType: 'flag_assignment',
      userId,
      sessionId,
      flagKey,
      flagValue,
      variant,
      userRole,
      timestamp: Date.now(),
    };

    this.addEvent(event);
  }

  /**
   * Enregistre un événement de progression d'onboarding
   */
  trackOnboardingProgress(
    userId: string,
    sessionId: string,
    step: string,
    stepIndex: number,
    totalSteps: number,
    duration: number,
    variant: string
  ): void {
    const event: ABTestEventData = {
      eventType: 'onboarding_progress',
      userId,
      sessionId,
      flagKey: 'onboarding-variant',
      flagValue: variant,
      variant,
      onboardingStep: step,
      stepIndex,
      totalSteps,
      duration,
      timestamp: Date.now(),
    };

    this.addEvent(event);
  }

  /**
   * Enregistre un événement de conversion
   */
  trackConversion(
    userId: string,
    sessionId: string,
    variant: string,
    conversionType: string = 'onboarding_complete'
  ): void {
    const event: ABTestEventData = {
      eventType: 'conversion',
      userId,
      sessionId,
      flagKey: 'onboarding-variant',
      flagValue: variant,
      variant,
      customData: { conversionType },
      timestamp: Date.now(),
    };

    this.addEvent(event);
  }

  /**
   * Enregistre un événement d'erreur
   */
  trackError(
    userId: string,
    sessionId: string,
    errorMessage: string,
    variant: string,
    step?: string
  ): void {
    const event: ABTestEventData = {
      eventType: 'error',
      userId,
      sessionId,
      flagKey: 'onboarding-variant',
      flagValue: variant,
      variant,
      errorMessage,
      onboardingStep: step,
      timestamp: Date.now(),
    };

    this.addEvent(event);
  }

  /**
   * Enregistre un événement d'interaction
   */
  trackInteraction(
    userId: string,
    sessionId: string,
    interactionType: string,
    formField?: string,
    variant?: string
  ): void {
    const event: ABTestEventData = {
      eventType: 'interaction',
      userId,
      sessionId,
      flagKey: 'onboarding-variant',
      flagValue: variant || 'control',
      variant: variant || 'control',
      interactionType,
      formField,
      timestamp: Date.now(),
    };

    this.addEvent(event);
  }

  /**
   * Ajoute un événement à la queue
   * Version simplifiée pour éviter les boucles infinies
   */
  private addEvent(event: ABTestEventData): void {
    // En mode démonstration, on limite la queue à 10 événements
    if (this.eventQueue.length < 10) {
      this.eventQueue.push(event);
    }
    
    // Flush automatique désactivé pour éviter les boucles infinies
    // if (this.eventQueue.length >= this.batchSize) {
    //   this.flushEvents();
    // }
  }

  /**
   * Enregistre les événements (version démonstration)
   * Simule l'enregistrement sans dépendre de Supabase
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0 || this.isFlushing) return;

    this.isFlushing = true;
    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Version démonstration : affichage des événements dans la console
      console.log('📊 Événements A/B Test (mode démonstration):', {
        count: events.length,
        events: events.map(event => ({
          type: event.eventType,
          user: event.userId,
          variant: event.variant,
          step: event.onboardingStep,
          timestamp: new Date(event.timestamp).toISOString()
        }))
      });

      // Simulation d'un enregistrement réussi
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Erreur lors du flush des événements:', error);
      // En mode démonstration, on ne remet pas les événements dans la queue
      // pour éviter les boucles infinies
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Démarre le flush automatique des événements
   * Version désactivée pour éviter les boucles infinies
   */
  private startAutoFlush(): void {
    // Désactivé pour éviter les boucles infinies en mode démonstration
    // setInterval(() => {
    //   this.flushEvents();
    // }, this.flushInterval);
  }

  /**
   * Force le flush des événements en attente
   */
  async forceFlush(): Promise<void> {
    await this.flushEvents();
  }

  /**
   * Obtient les métriques simulées pour la démonstration
   */
  getDemoMetrics(): ABTestMetrics {
    // Métriques simulées pour la démonstration
    return {
      totalUsers: 1234,
      conversions: 456,
      conversionRate: 37.0,
      averageDuration: 180,
      variantPerformance: {
        control: {
          users: 308,
          conversions: 108,
          conversionRate: 35.1,
          averageDuration: 195
        },
        simplified: {
          users: 310,
          conversions: 131,
          conversionRate: 42.3,
          averageDuration: 165
        },
        gamified: {
          users: 308,
          conversions: 119,
          conversionRate: 38.6,
          averageDuration: 185
        },
        guided: {
          users: 308,
          conversions: 127,
          conversionRate: 41.2,
          averageDuration: 175
        }
      }
    };
  }

  /**
   * Génère des données de test simulées
   */
  generateTestData(): ABTestEventData[] {
    const variants = ['control', 'simplified', 'gamified', 'guided'];
    const events: ABTestEventData[] = [];

    for (let i = 0; i < 50; i++) {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const userId = `user-${i + 1}`;
      const sessionId = `session-${i + 1}`;

      // Événement d'attribution
      events.push({
        eventType: 'flag_assignment',
        userId,
        sessionId,
        flagKey: 'onboarding-variant',
        flagValue: variant,
        variant,
        timestamp: Date.now() - Math.random() * 86400000 // Dernières 24h
      });

      // Événement de progression
      events.push({
        eventType: 'onboarding_progress',
        userId,
        sessionId,
        flagKey: 'onboarding-variant',
        flagValue: variant,
        variant,
        onboardingStep: 'step-1',
        stepIndex: 1,
        totalSteps: 5,
        duration: Math.random() * 30000,
        timestamp: Date.now() - Math.random() * 86400000
      });

      // Événement de conversion (si applicable)
      if (Math.random() > 0.3) {
        events.push({
          eventType: 'conversion',
          userId,
          sessionId,
          flagKey: 'onboarding-variant',
          flagValue: variant,
          variant,
          customData: { conversionType: 'onboarding_complete' },
          timestamp: Date.now() - Math.random() * 86400000
        });
      }
    }

    return events;
  }
}

// Instance globale pour la démonstration
export const analytics = new ABTestAnalytics();
