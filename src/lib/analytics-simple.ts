/**
 * Configuration simplifiée des analytics pour éviter les erreurs de chargement
 * Version de fallback sans plugins externes
 */

// Types pour les événements d'onboarding
export interface OnboardingEvent {
  event: string;
  properties: {
    userId?: string;
    role?: 'nutritionist' | 'patient' | 'admin';
    step?: string;
    stepNumber?: number;
    totalSteps?: number;
    completionPercentage?: number;
    timeSpent?: number;
    errorType?: string;
    helpRequested?: boolean;
    skipped?: boolean;
    timestamp?: string;
    sessionId?: string;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    browser?: string;
    [key: string]: any;
  };
}

/**
 * Service d'analytics simplifié pour l'onboarding
 * Version sans dépendances externes pour éviter les erreurs de chargement
 */
export class SimpleOnboardingAnalytics {
  private sessionId: string;
  private startTime: number;
  private stepStartTimes: Map<string, number> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  /**
   * Génère un ID de session unique
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Méthode utilitaire pour tracker un événement de manière sécurisée
   */
  private safeTrack(eventName: string, properties: Record<string, any> = {}) {
    try {
      // Envoi vers l'API interne au lieu des services externes
      this.sendToInternalAPI(eventName, properties);
      console.log(`📊 [Analytics] ${eventName}:`, properties);
    } catch (error) {
      console.warn(`⚠️ Erreur lors du tracking de l'événement ${eventName}:`, error);
    }
  }

  /**
   * Envoie les événements vers l'API interne
   */
  private async sendToInternalAPI(eventName: string, properties: Record<string, any>) {
    try {
      const response = await fetch('/api/analytics/onboarding/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventName,
          properties: {
            ...properties,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de l\'envoi vers l\'API interne:', error);
    }
  }

  /**
   * Identifie un utilisateur
   */
  identify(userId: string, traits: Record<string, any> = {}) {
    console.log('📊 [Analytics] User identified:', userId, traits);
  }

  /**
   * Track le début de l'onboarding
   */
  trackOnboardingStarted(role: 'nutritionist' | 'patient' | 'admin', userId?: string) {
    const event: OnboardingEvent = {
      event: 'Onboarding Started',
      properties: {
        userId,
        role,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        timestamp: new Date().toISOString(),
      },
    };

    this.safeTrack(event.event, event.properties);
  }

  /**
   * Track le début d'une étape
   */
  trackStepStarted(step: string, stepNumber: number, totalSteps: number, role: 'nutritionist' | 'patient' | 'admin', userId?: string) {
    this.stepStartTimes.set(step, Date.now());
    
    const event: OnboardingEvent = {
      event: 'Onboarding Step Started',
      properties: {
        userId,
        role,
        step,
        stepNumber,
        totalSteps,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        timestamp: new Date().toISOString(),
      },
    };

    this.safeTrack(event.event, event.properties);
  }

  /**
   * Track la completion d'une étape
   */
  trackStepCompleted(step: string, stepNumber: number, totalSteps: number, role: 'nutritionist' | 'patient' | 'admin', completionPercentage: number, userId?: string) {
    const stepStartTime = this.stepStartTimes.get(step);
    const timeSpent = stepStartTime ? Date.now() - stepStartTime : 0;
    
    const event: OnboardingEvent = {
      event: 'Onboarding Step Completed',
      properties: {
        userId,
        role,
        step,
        stepNumber,
        totalSteps,
        completionPercentage,
        timeSpent,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        timestamp: new Date().toISOString(),
      },
    };

    this.safeTrack(event.event, event.properties);
  }

  /**
   * Track le passage d'une étape
   */
  trackStepSkipped(step: string, stepNumber: number, totalSteps: number, role: 'nutritionist' | 'patient' | 'admin', reason?: string, userId?: string) {
    const event: OnboardingEvent = {
      event: 'Onboarding Step Skipped',
      properties: {
        userId,
        role,
        step,
        stepNumber,
        totalSteps,
        skipped: true,
        reason,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        timestamp: new Date().toISOString(),
      },
    };

    this.safeTrack(event.event, event.properties);
  }

  /**
   * Track une erreur dans une étape
   */
  trackStepError(step: string, stepNumber: number, role: 'nutritionist' | 'patient' | 'admin', errorType: string, errorMessage?: string, userId?: string) {
    const event: OnboardingEvent = {
      event: 'Onboarding Step Error',
      properties: {
        userId,
        role,
        step,
        stepNumber,
        errorType,
        errorMessage,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        timestamp: new Date().toISOString(),
      },
    };

    this.safeTrack(event.event, event.properties);
  }

  /**
   * Track une demande d'aide
   */
  trackHelpRequested(step: string, stepNumber: number, role: 'nutritionist' | 'patient' | 'admin', helpType: string, userId?: string) {
    const event: OnboardingEvent = {
      event: 'Onboarding Help Requested',
      properties: {
        userId,
        role,
        step,
        stepNumber,
        helpRequested: true,
        helpType,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        timestamp: new Date().toISOString(),
      },
    };

    this.safeTrack(event.event, event.properties);
  }

  /**
   * Track la completion de l'onboarding
   */
  trackOnboardingCompleted(role: 'nutritionist' | 'patient' | 'admin', totalSteps: number, totalTimeSpent: number, userId?: string) {
    const event: OnboardingEvent = {
      event: 'Onboarding Completed',
      properties: {
        userId,
        role,
        totalSteps,
        completionPercentage: 100,
        timeSpent: totalTimeSpent,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        timestamp: new Date().toISOString(),
      },
    };

    this.safeTrack(event.event, event.properties);
  }

  /**
   * Track l'abandon de l'onboarding
   */
  trackOnboardingAbandoned(step: string, stepNumber: number, role: 'nutritionist' | 'patient' | 'admin', reason?: string, userId?: string) {
    const event: OnboardingEvent = {
      event: 'Onboarding Abandoned',
      properties: {
        userId,
        role,
        step,
        stepNumber,
        reason,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        timestamp: new Date().toISOString(),
      },
    };

    this.safeTrack(event.event, event.properties);
  }

  /**
   * Track une page vue
   */
  trackPageView(pageName: string, userId?: string) {
    const event: OnboardingEvent = {
      event: 'Page View',
      properties: {
        userId,
        pageName,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        timestamp: new Date().toISOString(),
      },
    };

    this.safeTrack(event.event, event.properties);
  }

  /**
   * Obtient l'ID de session
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Obtient le temps écoulé depuis le début
   */
  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Détecte le type d'appareil
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Détecte le navigateur
   */
  private getBrowser(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    return 'unknown';
  }
}

// Instance simplifiée des analytics
export const simpleOnboardingAnalytics = new SimpleOnboardingAnalytics();

