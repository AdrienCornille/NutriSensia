/**
 * Système de déploiement progressif (Gradual Rollout)
 * 
 * Ce système permet de déployer progressivement les nouvelles variantes
 * gagnantes des tests A/B en contrôlant le pourcentage d'utilisateurs exposés.
 */

import { createClient } from '@/lib/supabase/client';
import { abTestAnalytics, type ABTestResults } from './analytics';

/**
 * Configuration pour le déploiement progressif
 */
export interface GradualRolloutConfig {
  flagKey: string;
  targetVariant: string;
  
  // Paramètres de déploiement
  initialPercentage: number; // Pourcentage initial (ex: 5%)
  targetPercentage: number;  // Pourcentage cible (ex: 100%)
  incrementPercentage: number; // Incrément par étape (ex: 10%)
  incrementIntervalHours: number; // Intervalle entre les incréments (ex: 24h)
  
  // Critères de validation
  minSampleSize: number; // Taille d'échantillon minimum avant incrément
  maxErrorRate: number;  // Taux d'erreur maximum toléré
  minConversionRate: number; // Taux de conversion minimum requis
  
  // Critères d'arrêt d'urgence
  emergencyStopConditions: {
    maxErrorRateSpike: number; // Pic d'erreur qui déclenche l'arrêt
    minConversionRateDrop: number; // Chute de conversion qui déclenche l'arrêt
    maxUserComplaints: number; // Nombre maximum de plaintes utilisateurs
  };
  
  // Métadonnées
  startDate: Date;
  endDate?: Date;
  createdBy: string;
  reason: string;
}

/**
 * État actuel du déploiement progressif
 */
export interface RolloutStatus {
  id: string;
  flagKey: string;
  targetVariant: string;
  currentPercentage: number;
  targetPercentage: number;
  status: 'active' | 'paused' | 'completed' | 'rolled_back' | 'failed';
  
  // Statistiques actuelles
  currentStats: {
    totalUsers: number;
    errorRate: number;
    conversionRate: number;
    userFeedbackScore: number;
  };
  
  // Historique des incréments
  incrementHistory: Array<{
    timestamp: Date;
    fromPercentage: number;
    toPercentage: number;
    reason: string;
    metrics: {
      users: number;
      errors: number;
      conversions: number;
    };
  }>;
  
  // Prochaine action programmée
  nextScheduledIncrement?: {
    scheduledAt: Date;
    toPercentage: number;
  };
  
  lastUpdated: Date;
}

/**
 * Classe principale pour gérer les déploiements progressifs
 */
export class GradualRolloutManager {
  private supabase = createClient();
  private rolloutConfigs = new Map<string, GradualRolloutConfig>();
  private rolloutStatuses = new Map<string, RolloutStatus>();
  
  constructor() {
    // Démarrage du processus de monitoring en arrière-plan
    this.startMonitoring();
  }

  /**
   * Démarre un nouveau déploiement progressif
   */
  async startGradualRollout(config: GradualRolloutConfig): Promise<string> {
    try {
      // Validation de la configuration
      this.validateRolloutConfig(config);
      
      // Création de l'ID unique pour ce déploiement
      const rolloutId = `rollout_${config.flagKey}_${Date.now()}`;
      
      // Sauvegarde de la configuration
      await this.saveRolloutConfig(rolloutId, config);
      
      // Initialisation du statut
      const initialStatus: RolloutStatus = {
        id: rolloutId,
        flagKey: config.flagKey,
        targetVariant: config.targetVariant,
        currentPercentage: config.initialPercentage,
        targetPercentage: config.targetPercentage,
        status: 'active',
        currentStats: {
          totalUsers: 0,
          errorRate: 0,
          conversionRate: 0,
          userFeedbackScore: 0,
        },
        incrementHistory: [{
          timestamp: new Date(),
          fromPercentage: 0,
          toPercentage: config.initialPercentage,
          reason: 'Initial rollout start',
          metrics: { users: 0, errors: 0, conversions: 0 },
        }],
        nextScheduledIncrement: this.calculateNextIncrement(config),
        lastUpdated: new Date(),
      };
      
      // Sauvegarde du statut initial
      await this.saveRolloutStatus(rolloutId, initialStatus);
      
      // Mise à jour du cache local
      this.rolloutConfigs.set(rolloutId, config);
      this.rolloutStatuses.set(rolloutId, initialStatus);
      
      // Mise à jour de la configuration des feature flags
      await this.updateFeatureFlagDistribution(config.flagKey, config.targetVariant, config.initialPercentage);
      
      console.log(`Déploiement progressif démarré: ${rolloutId}`);
      return rolloutId;
      
    } catch (error) {
      console.error('Erreur lors du démarrage du déploiement progressif:', error);
      throw error;
    }
  }

  /**
   * Met en pause un déploiement progressif
   */
  async pauseRollout(rolloutId: string, reason: string): Promise<void> {
    const status = this.rolloutStatuses.get(rolloutId);
    if (!status) {
      throw new Error(`Déploiement non trouvé: ${rolloutId}`);
    }
    
    status.status = 'paused';
    status.lastUpdated = new Date();
    status.incrementHistory.push({
      timestamp: new Date(),
      fromPercentage: status.currentPercentage,
      toPercentage: status.currentPercentage,
      reason: `Paused: ${reason}`,
      metrics: status.currentStats,
    });
    
    await this.saveRolloutStatus(rolloutId, status);
    console.log(`Déploiement mis en pause: ${rolloutId} - ${reason}`);
  }

  /**
   * Reprend un déploiement progressif en pause
   */
  async resumeRollout(rolloutId: string, reason: string): Promise<void> {
    const status = this.rolloutStatuses.get(rolloutId);
    const config = this.rolloutConfigs.get(rolloutId);
    
    if (!status || !config) {
      throw new Error(`Déploiement non trouvé: ${rolloutId}`);
    }
    
    if (status.status !== 'paused') {
      throw new Error(`Le déploiement n'est pas en pause: ${rolloutId}`);
    }
    
    status.status = 'active';
    status.lastUpdated = new Date();
    status.nextScheduledIncrement = this.calculateNextIncrement(config, status.currentPercentage);
    status.incrementHistory.push({
      timestamp: new Date(),
      fromPercentage: status.currentPercentage,
      toPercentage: status.currentPercentage,
      reason: `Resumed: ${reason}`,
      metrics: status.currentStats,
    });
    
    await this.saveRolloutStatus(rolloutId, status);
    console.log(`Déploiement repris: ${rolloutId} - ${reason}`);
  }

  /**
   * Effectue un rollback complet
   */
  async rollbackDeployment(rolloutId: string, reason: string): Promise<void> {
    const status = this.rolloutStatuses.get(rolloutId);
    const config = this.rolloutConfigs.get(rolloutId);
    
    if (!status || !config) {
      throw new Error(`Déploiement non trouvé: ${rolloutId}`);
    }
    
    // Remise à 0% de la nouvelle variante
    await this.updateFeatureFlagDistribution(config.flagKey, config.targetVariant, 0);
    
    status.status = 'rolled_back';
    status.currentPercentage = 0;
    status.lastUpdated = new Date();
    status.incrementHistory.push({
      timestamp: new Date(),
      fromPercentage: status.currentPercentage,
      toPercentage: 0,
      reason: `Rollback: ${reason}`,
      metrics: status.currentStats,
    });
    
    await this.saveRolloutStatus(rolloutId, status);
    
    // Notification d'alerte
    await this.sendRollbackAlert(rolloutId, reason);
    
    console.log(`Rollback effectué: ${rolloutId} - ${reason}`);
  }

  /**
   * Vérifie et traite les déploiements actifs
   */
  async processActiveRollouts(): Promise<void> {
    const activeRollouts = Array.from(this.rolloutStatuses.values())
      .filter(status => status.status === 'active');
    
    for (const status of activeRollouts) {
      try {
        await this.processRollout(status);
      } catch (error) {
        console.error(`Erreur lors du traitement du déploiement ${status.id}:`, error);
      }
    }
  }

  /**
   * Traite un déploiement spécifique
   */
  private async processRollout(status: RolloutStatus): Promise<void> {
    const config = this.rolloutConfigs.get(status.id);
    if (!config) return;
    
    // Mise à jour des statistiques actuelles
    await this.updateCurrentStats(status);
    
    // Vérification des conditions d'arrêt d'urgence
    if (this.shouldEmergencyStop(status, config)) {
      await this.rollbackDeployment(status.id, 'Emergency stop triggered');
      return;
    }
    
    // Vérification si c'est le moment d'incrémenter
    if (this.shouldIncrement(status, config)) {
      await this.incrementRollout(status, config);
    }
    
    // Vérification si le déploiement est terminé
    if (status.currentPercentage >= status.targetPercentage) {
      await this.completeRollout(status);
    }
  }

  /**
   * Incrémente le pourcentage de déploiement
   */
  private async incrementRollout(status: RolloutStatus, config: GradualRolloutConfig): Promise<void> {
    const newPercentage = Math.min(
      status.currentPercentage + config.incrementPercentage,
      status.targetPercentage
    );
    
    const previousPercentage = status.currentPercentage;
    
    // Mise à jour de la distribution des feature flags
    await this.updateFeatureFlagDistribution(config.flagKey, config.targetVariant, newPercentage);
    
    // Mise à jour du statut
    status.currentPercentage = newPercentage;
    status.lastUpdated = new Date();
    status.nextScheduledIncrement = newPercentage < status.targetPercentage 
      ? this.calculateNextIncrement(config, newPercentage)
      : undefined;
    
    status.incrementHistory.push({
      timestamp: new Date(),
      fromPercentage: previousPercentage,
      toPercentage: newPercentage,
      reason: 'Scheduled increment',
      metrics: { ...status.currentStats },
    });
    
    await this.saveRolloutStatus(status.id, status);
    
    // Tracking de l'événement
    await abTestAnalytics.trackEvent({
      eventType: 'performance',
      userId: 'system',
      sessionId: `rollout_${status.id}`,
      flagKey: config.flagKey,
      flagValue: config.targetVariant,
      customData: {
        rolloutId: status.id,
        action: 'increment',
        fromPercentage: previousPercentage,
        toPercentage: newPercentage,
      },
    });
    
    console.log(`Incrément du déploiement ${status.id}: ${previousPercentage}% → ${newPercentage}%`);
  }

  /**
   * Finalise un déploiement terminé
   */
  private async completeRollout(status: RolloutStatus): Promise<void> {
    status.status = 'completed';
    status.lastUpdated = new Date();
    status.incrementHistory.push({
      timestamp: new Date(),
      fromPercentage: status.currentPercentage,
      toPercentage: status.currentPercentage,
      reason: 'Rollout completed successfully',
      metrics: { ...status.currentStats },
    });
    
    await this.saveRolloutStatus(status.id, status);
    
    // Notification de succès
    await this.sendCompletionNotification(status.id);
    
    console.log(`Déploiement terminé avec succès: ${status.id}`);
  }

  /**
   * Met à jour les statistiques actuelles d'un déploiement
   */
  private async updateCurrentStats(status: RolloutStatus): Promise<void> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Dernières 24h
      
      // Récupération des métriques depuis l'analytics
      const metrics = await abTestAnalytics.getConversionMetrics(status.flagKey, {
        start: startDate,
        end: endDate,
      });
      
      const variantMetrics = metrics.find(m => m.variant === status.targetVariant);
      
      if (variantMetrics) {
        status.currentStats = {
          totalUsers: variantMetrics.totalUsers,
          errorRate: this.calculateErrorRate(status.flagKey, status.targetVariant),
          conversionRate: variantMetrics.conversionRate,
          userFeedbackScore: await this.getUserFeedbackScore(status.flagKey, status.targetVariant),
        };
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
    }
  }

  /**
   * Vérifie si les conditions d'arrêt d'urgence sont remplies
   */
  private shouldEmergencyStop(status: RolloutStatus, config: GradualRolloutConfig): boolean {
    const { emergencyStopConditions } = config;
    const { currentStats } = status;
    
    // Vérification du pic d'erreur
    if (currentStats.errorRate > emergencyStopConditions.maxErrorRateSpike) {
      console.warn(`Pic d'erreur détecté: ${currentStats.errorRate} > ${emergencyStopConditions.maxErrorRateSpike}`);
      return true;
    }
    
    // Vérification de la chute de conversion
    if (currentStats.conversionRate < emergencyStopConditions.minConversionRateDrop) {
      console.warn(`Chute de conversion détectée: ${currentStats.conversionRate} < ${emergencyStopConditions.minConversionRateDrop}`);
      return true;
    }
    
    // Vérification du score de feedback utilisateur
    if (currentStats.userFeedbackScore < 2.0) { // Score sur 5
      console.warn(`Score de feedback trop faible: ${currentStats.userFeedbackScore}`);
      return true;
    }
    
    return false;
  }

  /**
   * Vérifie s'il faut incrémenter le déploiement
   */
  private shouldIncrement(status: RolloutStatus, config: GradualRolloutConfig): boolean {
    // Vérifier si c'est le bon moment
    if (!status.nextScheduledIncrement) return false;
    if (new Date() < status.nextScheduledIncrement.scheduledAt) return false;
    
    // Vérifier la taille d'échantillon minimum
    if (status.currentStats.totalUsers < config.minSampleSize) {
      console.log(`Échantillon insuffisant: ${status.currentStats.totalUsers} < ${config.minSampleSize}`);
      return false;
    }
    
    // Vérifier les seuils de qualité
    if (status.currentStats.errorRate > config.maxErrorRate) {
      console.log(`Taux d'erreur trop élevé: ${status.currentStats.errorRate} > ${config.maxErrorRate}`);
      return false;
    }
    
    if (status.currentStats.conversionRate < config.minConversionRate) {
      console.log(`Taux de conversion insuffisant: ${status.currentStats.conversionRate} < ${config.minConversionRate}`);
      return false;
    }
    
    return true;
  }

  /**
   * Calcule le prochain incrément programmé
   */
  private calculateNextIncrement(config: GradualRolloutConfig, currentPercentage?: number): { scheduledAt: Date; toPercentage: number } | undefined {
    const current = currentPercentage || config.initialPercentage;
    
    if (current >= config.targetPercentage) return undefined;
    
    const nextPercentage = Math.min(current + config.incrementPercentage, config.targetPercentage);
    const scheduledAt = new Date(Date.now() + config.incrementIntervalHours * 60 * 60 * 1000);
    
    return { scheduledAt, toPercentage: nextPercentage };
  }

  /**
   * Met à jour la distribution des feature flags
   */
  private async updateFeatureFlagDistribution(flagKey: string, variant: string, percentage: number): Promise<void> {
    // Ici, nous mettrions à jour la configuration des feature flags
    // Pour l'exemple, nous loggons l'action
    console.log(`Mise à jour de la distribution: ${flagKey} - ${variant} à ${percentage}%`);
    
    // Dans une vraie implémentation, cela pourrait être:
    // - Mise à jour d'une base de données de configuration
    // - Appel à une API de gestion des feature flags
    // - Mise à jour d'un cache Redis
  }

  /**
   * Calcule le taux d'erreur pour une variante
   */
  private async calculateErrorRate(flagKey: string, variant: string): Promise<number> {
    // Implémentation simplifiée - dans un vrai projet, interroger la base de données
    return Math.random() * 0.05; // Taux d'erreur aléatoire entre 0 et 5%
  }

  /**
   * Récupère le score de feedback utilisateur
   */
  private async getUserFeedbackScore(flagKey: string, variant: string): Promise<number> {
    // Implémentation simplifiée - dans un vrai projet, interroger la base de données des feedbacks
    return 3.5 + Math.random() * 1.5; // Score aléatoire entre 3.5 et 5
  }

  /**
   * Sauvegarde la configuration d'un déploiement
   */
  private async saveRolloutConfig(rolloutId: string, config: GradualRolloutConfig): Promise<void> {
    const { error } = await this.supabase
      .from('gradual_rollout_configs')
      .insert({
        id: rolloutId,
        flag_key: config.flagKey,
        target_variant: config.targetVariant,
        config_data: config,
        created_at: new Date().toISOString(),
      });
    
    if (error) {
      throw new Error(`Erreur lors de la sauvegarde de la configuration: ${error.message}`);
    }
  }

  /**
   * Sauvegarde le statut d'un déploiement
   */
  private async saveRolloutStatus(rolloutId: string, status: RolloutStatus): Promise<void> {
    const { error } = await this.supabase
      .from('gradual_rollout_status')
      .upsert({
        id: rolloutId,
        flag_key: status.flagKey,
        target_variant: status.targetVariant,
        current_percentage: status.currentPercentage,
        target_percentage: status.targetPercentage,
        status: status.status,
        current_stats: status.currentStats,
        increment_history: status.incrementHistory,
        next_scheduled_increment: status.nextScheduledIncrement,
        last_updated: status.lastUpdated.toISOString(),
      });
    
    if (error) {
      throw new Error(`Erreur lors de la sauvegarde du statut: ${error.message}`);
    }
  }

  /**
   * Valide la configuration d'un déploiement
   */
  private validateRolloutConfig(config: GradualRolloutConfig): void {
    if (config.initialPercentage < 0 || config.initialPercentage > 100) {
      throw new Error('Le pourcentage initial doit être entre 0 et 100');
    }
    
    if (config.targetPercentage < config.initialPercentage || config.targetPercentage > 100) {
      throw new Error('Le pourcentage cible doit être supérieur au pourcentage initial et inférieur à 100');
    }
    
    if (config.incrementPercentage <= 0 || config.incrementPercentage > 50) {
      throw new Error('L\'incrément doit être entre 1 et 50');
    }
    
    if (config.incrementIntervalHours < 1) {
      throw new Error('L\'intervalle d\'incrément doit être d\'au moins 1 heure');
    }
  }

  /**
   * Envoie une alerte de rollback
   */
  private async sendRollbackAlert(rolloutId: string, reason: string): Promise<void> {
    // Implémentation de notification (email, Slack, etc.)
    console.log(`🚨 ALERTE ROLLBACK: ${rolloutId} - ${reason}`);
  }

  /**
   * Envoie une notification de completion
   */
  private async sendCompletionNotification(rolloutId: string): Promise<void> {
    // Implémentation de notification (email, Slack, etc.)
    console.log(`✅ DÉPLOIEMENT TERMINÉ: ${rolloutId}`);
  }

  /**
   * Démarre le monitoring en arrière-plan
   */
  private startMonitoring(): void {
    // Vérification toutes les heures
    setInterval(async () => {
      try {
        await this.processActiveRollouts();
      } catch (error) {
        console.error('Erreur lors du monitoring des déploiements:', error);
      }
    }, 60 * 60 * 1000); // 1 heure
  }
}

// Instance globale du gestionnaire de déploiements progressifs
export const gradualRolloutManager = new GradualRolloutManager();
