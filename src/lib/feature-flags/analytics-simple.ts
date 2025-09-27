/**
 * Système d'analytics A/B Testing - Version Ultra-Simplifiée
 * 
 * Cette version ne fait aucun tracking automatique pour éviter les boucles infinies.
 * Elle est conçue uniquement pour les tests de démonstration.
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
 * Classe d'analytics A/B Testing ultra-simplifiée
 * Version qui ne fait aucun tracking automatique
 */
export class ABTestAnalytics {
  private eventCount = 0;

  constructor() {
    console.log('🎯 A/B Testing Analytics initialisé (mode démonstration)');
  }

  /**
   * Enregistre un événement d'attribution de flag
   * Version simplifiée qui ne fait que compter
   */
  trackFlagAssignment(
    userId: string,
    sessionId: string,
    flagKey: string,
    flagValue: string,
    variant: string,
    userRole?: string
  ): void {
    this.eventCount++;
    console.log(`🎯 Flag Assignment: ${variant} pour ${userId} (${this.eventCount})`);
  }

  /**
   * Enregistre un événement de progression d'onboarding
   * Version simplifiée qui ne fait que compter
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
    this.eventCount++;
    console.log(`📈 Onboarding Progress: ${step} (${stepIndex}/${totalSteps}) pour ${userId} (${this.eventCount})`);
  }

  /**
   * Enregistre un événement de conversion
   * Version simplifiée qui ne fait que compter
   */
  trackConversion(
    userId: string,
    sessionId: string,
    variant: string,
    conversionType: string = 'onboarding_complete'
  ): void {
    this.eventCount++;
    console.log(`🎉 Conversion: ${conversionType} pour ${userId} (${this.eventCount})`);
  }

  /**
   * Enregistre un événement d'erreur
   * Version simplifiée qui ne fait que compter
   */
  trackError(
    userId: string,
    sessionId: string,
    errorMessage: string,
    variant: string,
    step?: string
  ): void {
    this.eventCount++;
    console.log(`❌ Error: ${errorMessage} pour ${userId} (${this.eventCount})`);
  }

  /**
   * Enregistre un événement d'interaction
   * Version simplifiée qui ne fait que compter
   */
  trackInteraction(
    userId: string,
    sessionId: string,
    interactionType: string,
    formField?: string,
    variant?: string
  ): void {
    this.eventCount++;
    console.log(`🖱️ Interaction: ${interactionType} pour ${userId} (${this.eventCount})`);
  }

  /**
   * Force le flush des événements en attente
   * Version simplifiée qui ne fait rien
   */
  async forceFlush(): Promise<void> {
    console.log(`📊 Flush demandé - ${this.eventCount} événements traités`);
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

    for (let i = 0; i < 10; i++) {
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
