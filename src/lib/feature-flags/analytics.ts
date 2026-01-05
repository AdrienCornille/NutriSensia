/**
 * Analytics et métriques pour les tests A/B
 *
 * Ce fichier gère l'enregistrement et l'analyse des événements
 * liés aux feature flags et aux tests A/B de l'onboarding.
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Types d'événements A/B testing
 */
export type ABTestEvent =
  | 'flag_assignment' // Attribution d'un flag à un utilisateur
  | 'onboarding_start' // Début de l'onboarding
  | 'onboarding_step' // Progression dans une étape
  | 'onboarding_complete' // Finalisation de l'onboarding
  | 'onboarding_abandon' // Abandon de l'onboarding
  | 'form_validation_error' // Erreur de validation
  | 'help_requested' // Demande d'aide
  | 'skip_step' // Étape sautée
  | 'conversion' // Conversion (objectif atteint)
  | 'engagement' // Interaction avec l'interface
  | 'error' // Erreur technique
  | 'performance'; // Métriques de performance

/**
 * Interface pour les données d'événement A/B
 */
export interface ABTestEventData {
  eventType: ABTestEvent;
  userId: string;
  sessionId: string;
  flagKey: string;
  flagValue: string;
  variant: string;
  timestamp: number;

  // Informations contextuelles
  userRole?: 'nutritionist' | 'patient' | 'admin';
  onboardingStep?: string;
  stepIndex?: number;
  totalSteps?: number;

  // Métriques spécifiques
  duration?: number; // Durée en millisecondes
  errorMessage?: string; // Message d'erreur si applicable
  formField?: string; // Champ de formulaire concerné
  interactionType?: string; // Type d'interaction (click, focus, etc.)

  // Informations techniques
  userAgent?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  country?: string;

  // Données personnalisées
  customData?: Record<string, any>;
}

/**
 * Interface pour les métriques de conversion
 */
export interface ConversionMetrics {
  flagKey: string;
  variant: string;
  totalUsers: number;
  conversions: number;
  conversionRate: number;
  averageTimeToConversion: number;
  dropOffPoints: Array<{
    step: string;
    dropOffRate: number;
  }>;
}

/**
 * Interface pour les résultats de test A/B
 */
export interface ABTestResults {
  flagKey: string;
  startDate: string;
  endDate: string;
  variants: Array<{
    name: string;
    users: number;
    conversions: number;
    conversionRate: number;
    confidence: number;
    isWinner?: boolean;
  }>;
  statisticalSignificance: boolean;
  recommendedAction: 'continue' | 'stop' | 'declare_winner' | 'extend';
}

/**
 * Classe principale pour gérer les analytics A/B testing
 */
export class ABTestAnalytics {
  private supabase = createClient();
  private eventQueue: ABTestEventData[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 secondes

  constructor() {
    // Démarrage du flush automatique des événements
    this.startAutoFlush();
  }

  /**
   * Enregistre un événement A/B testing
   */
  async trackEvent(
    eventData: Partial<ABTestEventData> & {
      eventType: ABTestEvent;
      userId: string;
      flagKey: string;
      flagValue: string;
    }
  ): Promise<void> {
    const completeEventData: ABTestEventData = {
      ...eventData,
      sessionId: eventData.sessionId || this.generateSessionId(),
      variant: eventData.variant || eventData.flagValue,
      timestamp: eventData.timestamp || Date.now(),
    };

    // Ajout à la queue pour traitement par batch
    this.eventQueue.push(completeEventData);

    // Flush immédiat si la queue est pleine
    if (this.eventQueue.length >= this.batchSize) {
      await this.flushEvents();
    }
  }

  /**
   * Enregistre l'attribution d'un feature flag
   */
  async trackFlagAssignment(
    userId: string,
    flagKey: string,
    flagValue: string,
    context: Record<string, any> = {}
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'flag_assignment',
      userId,
      flagKey,
      flagValue,
      userRole: context.userRole,
      deviceType: context.deviceType,
      country: context.country,
      customData: context,
    });
  }

  /**
   * Enregistre le début de l'onboarding
   */
  async trackOnboardingStart(
    userId: string,
    userRole: 'nutritionist' | 'patient' | 'admin',
    flags: Record<string, string>
  ): Promise<void> {
    for (const [flagKey, flagValue] of Object.entries(flags)) {
      await this.trackEvent({
        eventType: 'onboarding_start',
        userId,
        flagKey,
        flagValue,
        userRole,
        onboardingStep: 'welcome',
        stepIndex: 0,
      });
    }
  }

  /**
   * Enregistre la progression dans une étape d'onboarding
   */
  async trackOnboardingStep(
    userId: string,
    stepName: string,
    stepIndex: number,
    totalSteps: number,
    flags: Record<string, string>,
    duration?: number
  ): Promise<void> {
    for (const [flagKey, flagValue] of Object.entries(flags)) {
      await this.trackEvent({
        eventType: 'onboarding_step',
        userId,
        flagKey,
        flagValue,
        onboardingStep: stepName,
        stepIndex,
        totalSteps,
        duration,
      });
    }
  }

  /**
   * Enregistre la finalisation de l'onboarding (conversion)
   */
  async trackOnboardingComplete(
    userId: string,
    userRole: 'nutritionist' | 'patient' | 'admin',
    flags: Record<string, string>,
    totalDuration: number
  ): Promise<void> {
    for (const [flagKey, flagValue] of Object.entries(flags)) {
      await this.trackEvent({
        eventType: 'onboarding_complete',
        userId,
        flagKey,
        flagValue,
        userRole,
        duration: totalDuration,
      });

      // Enregistrement également comme conversion
      await this.trackEvent({
        eventType: 'conversion',
        userId,
        flagKey,
        flagValue,
        userRole,
        duration: totalDuration,
      });
    }
  }

  /**
   * Enregistre l'abandon de l'onboarding
   */
  async trackOnboardingAbandon(
    userId: string,
    currentStep: string,
    stepIndex: number,
    flags: Record<string, string>,
    reason?: string
  ): Promise<void> {
    for (const [flagKey, flagValue] of Object.entries(flags)) {
      await this.trackEvent({
        eventType: 'onboarding_abandon',
        userId,
        flagKey,
        flagValue,
        onboardingStep: currentStep,
        stepIndex,
        customData: { reason },
      });
    }
  }

  /**
   * Enregistre une erreur de validation de formulaire
   */
  async trackFormValidationError(
    userId: string,
    formField: string,
    errorMessage: string,
    flags: Record<string, string>
  ): Promise<void> {
    for (const [flagKey, flagValue] of Object.entries(flags)) {
      await this.trackEvent({
        eventType: 'form_validation_error',
        userId,
        flagKey,
        flagValue,
        formField,
        errorMessage,
      });
    }
  }

  /**
   * Récupère les métriques de conversion pour un flag
   */
  async getConversionMetrics(
    flagKey: string,
    dateRange?: {
      start: Date;
      end: Date;
    }
  ): Promise<ConversionMetrics[]> {
    const { data, error } = await this.supabase
      .from('ab_test_events')
      .select('*')
      .eq('flag_key', flagKey)
      .gte('timestamp', dateRange?.start?.getTime() || 0)
      .lte('timestamp', dateRange?.end?.getTime() || Date.now());

    if (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      return [];
    }

    return this.calculateConversionMetrics(data || []);
  }

  /**
   * Analyse les résultats d'un test A/B
   */
  async analyzeABTestResults(
    flagKey: string,
    dateRange?: {
      start: Date;
      end: Date;
    }
  ): Promise<ABTestResults | null> {
    const metrics = await this.getConversionMetrics(flagKey, dateRange);

    if (metrics.length === 0) {
      return null;
    }

    // Calcul de la significativité statistique
    const statisticalSignificance =
      this.calculateStatisticalSignificance(metrics);

    // Détermination du gagnant
    const winner = metrics.reduce((prev, current) =>
      current.conversionRate > prev.conversionRate ? current : prev
    );

    const variants = metrics.map(metric => ({
      name: metric.variant,
      users: metric.totalUsers,
      conversions: metric.conversions,
      conversionRate: metric.conversionRate,
      confidence: this.calculateConfidence(metric),
      isWinner: metric.variant === winner.variant,
    }));

    return {
      flagKey,
      startDate: dateRange?.start?.toISOString() || '',
      endDate: dateRange?.end?.toISOString() || '',
      variants,
      statisticalSignificance,
      recommendedAction: this.getRecommendedAction(
        variants,
        statisticalSignificance
      ),
    };
  }

  /**
   * Flush les événements en attente vers la base de données
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await this.supabase.from('ab_test_events').insert(
        events.map(event => ({
          event_type: event.eventType,
          user_id: event.userId,
          session_id: event.sessionId,
          flag_key: event.flagKey,
          flag_value: event.flagValue,
          variant: event.variant,
          user_role: event.userRole,
          onboarding_step: event.onboardingStep,
          step_index: event.stepIndex,
          total_steps: event.totalSteps,
          duration_ms: event.duration,
          error_message: event.errorMessage,
          form_field: event.formField,
          interaction_type: event.interactionType,
          user_agent: event.userAgent,
          device_type: event.deviceType,
          country: event.country,
          custom_data: event.customData,
          created_at: new Date(event.timestamp).toISOString(),
        }))
      );

      if (error) {
        console.error("Erreur lors de l'enregistrement des événements:", error);
        // Remettre les événements dans la queue en cas d'erreur
        this.eventQueue.unshift(...events);
      }
    } catch (error) {
      console.error('Erreur lors du flush des événements:', error);
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Démarre le flush automatique des événements
   */
  private startAutoFlush(): void {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * Génère un ID de session
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calcule les métriques de conversion à partir des données brutes
   */
  private calculateConversionMetrics(events: any[]): ConversionMetrics[] {
    const variants = new Map<
      string,
      {
        users: Set<string>;
        conversions: Set<string>;
        durations: number[];
        dropOffs: Map<string, number>;
      }
    >();

    // Traitement des événements
    events.forEach(event => {
      if (!variants.has(event.variant)) {
        variants.set(event.variant, {
          users: new Set(),
          conversions: new Set(),
          durations: [],
          dropOffs: new Map(),
        });
      }

      const variant = variants.get(event.variant)!;
      variant.users.add(event.user_id);

      if (event.event_type === 'conversion') {
        variant.conversions.add(event.user_id);
        if (event.duration_ms) {
          variant.durations.push(event.duration_ms);
        }
      }

      if (event.event_type === 'onboarding_abandon') {
        const step = event.onboarding_step || 'unknown';
        variant.dropOffs.set(step, (variant.dropOffs.get(step) || 0) + 1);
      }
    });

    // Calcul des métriques finales
    return Array.from(variants.entries()).map(([variantName, data]) => ({
      flagKey: events[0]?.flag_key || '',
      variant: variantName,
      totalUsers: data.users.size,
      conversions: data.conversions.size,
      conversionRate:
        data.users.size > 0 ? data.conversions.size / data.users.size : 0,
      averageTimeToConversion:
        data.durations.length > 0
          ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length
          : 0,
      dropOffPoints: Array.from(data.dropOffs.entries()).map(
        ([step, count]) => ({
          step,
          dropOffRate: data.users.size > 0 ? count / data.users.size : 0,
        })
      ),
    }));
  }

  /**
   * Calcule la significativité statistique
   */
  private calculateStatisticalSignificance(
    metrics: ConversionMetrics[]
  ): boolean {
    // Implémentation simplifiée - dans un vrai projet, utiliser des tests statistiques appropriés
    if (metrics.length < 2) return false;

    const totalUsers = metrics.reduce((sum, m) => sum + m.totalUsers, 0);
    return totalUsers >= 100; // Seuil minimum arbitraire
  }

  /**
   * Calcule le niveau de confiance pour une métrique
   */
  private calculateConfidence(metric: ConversionMetrics): number {
    // Calcul simplifié - dans un vrai projet, utiliser des formules statistiques appropriées
    if (metric.totalUsers < 30) return 0;
    if (metric.totalUsers < 100) return 0.8;
    if (metric.totalUsers < 500) return 0.9;
    return 0.95;
  }

  /**
   * Détermine l'action recommandée basée sur les résultats
   */
  private getRecommendedAction(
    variants: Array<{
      name: string;
      users: number;
      conversionRate: number;
      confidence: number;
    }>,
    statisticalSignificance: boolean
  ): 'continue' | 'stop' | 'declare_winner' | 'extend' {
    if (!statisticalSignificance) {
      return variants.every(v => v.users < 50) ? 'continue' : 'extend';
    }

    const winner = variants.find(v => v.confidence >= 0.95);
    if (winner) {
      return 'declare_winner';
    }

    return 'continue';
  }
}

// Instance globale pour l'analytics
export const abTestAnalytics = new ABTestAnalytics();
