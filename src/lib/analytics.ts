/**
 * Configuration et service d'analytics pour NutriSensia
 * Utilise la bibliothèque Analytics.js pour un tracking unifié
 */

import Analytics from 'analytics';
import simpleAnalyticsPlugin from '@analytics/simple-analytics';
import googleAnalyticsPlugin from '@analytics/google-analytics';

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

// Types pour les métriques d'onboarding
export interface OnboardingMetrics {
  totalUsers: number;
  completionRate: number;
  averageTimeToComplete: number;
  dropOffPoints: Array<{
    step: string;
    dropOffRate: number;
    usersDropped: number;
  }>;
  errorRates: Array<{
    step: string;
    errorType: string;
    errorRate: number;
  }>;
  helpRequests: Array<{
    step: string;
    requestCount: number;
  }>;
}

// Configuration des analytics
const analyticsConfig = {
  app: 'nutrisensia',
  version: '1.0.0',
  plugins: [
    // Plugin Simple Analytics (seulement si configuré)
    ...(process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS_DOMAIN ? [
      simpleAnalyticsPlugin({
        // Configuration Simple Analytics
        customDomain: process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS_DOMAIN,
      })
    ] : []),
    
    // Plugin Google Analytics (si configuré)
    ...(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? [
      googleAnalyticsPlugin({
        measurementIds: [process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID],
      })
    ] : []),
  ],
};

// Instance principale des analytics
export const analytics = Analytics(analyticsConfig);

// Vérifier que l'instance analytics est valide
if (!analytics) {
  console.warn('⚠️ Analytics non initialisé - aucun plugin configuré');
}

/**
 * Service d'analytics pour l'onboarding
 */
export class OnboardingAnalytics {
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
      if (analytics && analytics.track) {
        analytics.track(eventName, {
          ...properties,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.warn(`⚠️ Erreur lors du tracking de l'événement ${eventName}:`, error);
    }
  }

  /**
   * Identifie un utilisateur
   */
  identify(userId: string, traits: Record<string, any> = {}) {
    try {
      if (analytics && analytics.identify) {
        analytics.identify(userId, {
          ...traits,
          sessionId: this.sessionId,
          platform: 'web',
          appVersion: '1.0.0',
        });
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de l\'identification analytics:', error);
    }
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
    console.log('📊 [Analytics] Onboarding Started:', event);
  }

  /**
   * Track le début d'une étape
   */
  trackStepStarted(
    step: string, 
    stepNumber: number, 
    totalSteps: number, 
    role: 'nutritionist' | 'patient' | 'admin',
    userId?: string
  ) {
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

    analytics.track(event.event, event.properties);
    console.log('📊 [Analytics] Step Started:', event);
  }

  /**
   * Track la completion d'une étape
   */
  trackStepCompleted(
    step: string,
    stepNumber: number,
    totalSteps: number,
    role: 'nutritionist' | 'patient' | 'admin',
    completionPercentage: number,
    userId?: string
  ) {
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

    analytics.track(event.event, event.properties);
    console.log('📊 [Analytics] Step Completed:', event);
  }

  /**
   * Track le passage d'une étape
   */
  trackStepSkipped(
    step: string,
    stepNumber: number,
    totalSteps: number,
    role: 'nutritionist' | 'patient' | 'admin',
    reason?: string,
    userId?: string
  ) {
    const stepStartTime = this.stepStartTimes.get(step);
    const timeSpent = stepStartTime ? Date.now() - stepStartTime : 0;
    
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
        timeSpent,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        timestamp: new Date().toISOString(),
      },
    };

    analytics.track(event.event, event.properties);
    console.log('📊 [Analytics] Step Skipped:', event);
  }

  /**
   * Track une erreur dans une étape
   */
  trackStepError(
    step: string,
    stepNumber: number,
    role: 'nutritionist' | 'patient' | 'admin',
    errorType: string,
    errorMessage?: string,
    userId?: string
  ) {
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

    analytics.track(event.event, event.properties);
    console.log('📊 [Analytics] Step Error:', event);
  }

  /**
   * Track une demande d'aide
   */
  trackHelpRequested(
    step: string,
    stepNumber: number,
    role: 'nutritionist' | 'patient' | 'admin',
    helpType: string,
    userId?: string
  ) {
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

    analytics.track(event.event, event.properties);
    console.log('📊 [Analytics] Help Requested:', event);
  }

  /**
   * Track la completion de l'onboarding
   */
  trackOnboardingCompleted(
    role: 'nutritionist' | 'patient' | 'admin',
    totalSteps: number,
    totalTimeSpent: number,
    userId?: string
  ) {
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

    analytics.track(event.event, event.properties);
    console.log('📊 [Analytics] Onboarding Completed:', event);
  }

  /**
   * Track l'abandon de l'onboarding
   */
  trackOnboardingAbandoned(
    step: string,
    stepNumber: number,
    role: 'nutritionist' | 'patient' | 'admin',
    reason?: string,
    userId?: string
  ) {
    const totalTimeSpent = Date.now() - this.startTime;
    
    const event: OnboardingEvent = {
      event: 'Onboarding Abandoned',
      properties: {
        userId,
        role,
        step,
        stepNumber,
        timeSpent: totalTimeSpent,
        reason,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        timestamp: new Date().toISOString(),
      },
    };

    analytics.track(event.event, event.properties);
    console.log('📊 [Analytics] Onboarding Abandoned:', event);
  }

  /**
   * Track une page vue
   */
  trackPageView(pageName: string, userId?: string) {
    analytics.page(pageName, {
      userId,
      sessionId: this.sessionId,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
    });
  }

  /**
   * Détermine le type d'appareil
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Détermine le navigateur
   */
  private getBrowser(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
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
}

// Instance globale des analytics d'onboarding
export const onboardingAnalytics = new OnboardingAnalytics();

// Export par défaut
export default analytics;
