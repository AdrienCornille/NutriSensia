/**
 * Service pour l'enregistrement des événements d'onboarding dans Supabase
 * Gère l'enregistrement des événements et sessions d'onboarding
 */

import { createClient } from '@supabase/supabase-js';
import { OnboardingRole } from '@/types/analytics';

// Client Supabase avec service role key pour les opérations d'administration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types pour les événements d'onboarding
export interface OnboardingEventData {
  session_id: string;
  event_type: string;
  role: OnboardingRole;
  step?: string;
  step_number?: number;
  total_steps?: number;
  completion_percentage?: number;
  time_spent?: number;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  error_type?: string;
  error_message?: string;
  help_type?: string;
  help_requested?: boolean;
  skipped?: boolean;
  reason?: string;
  properties?: Record<string, any>;
}

export interface OnboardingSessionData {
  session_id: string;
  role: OnboardingRole;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  started_at?: string;
  completed_at?: string;
  abandoned_at?: string;
  last_step?: string;
  total_steps?: number;
  completion_percentage?: number;
  total_time_spent?: number;
  status?: 'active' | 'completed' | 'abandoned';
  properties?: Record<string, any>;
}

/**
 * Service pour l'enregistrement des analytics d'onboarding
 */
export class OnboardingAnalyticsDB {
  /**
   * Enregistre un événement d'onboarding
   */
  static async recordEvent(
    userId: string,
    eventData: OnboardingEventData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📊 [Analytics DB] Enregistrement événement:', eventData);

      // Préparer les données d'insertion (user_id optionnel pour éviter les erreurs de permissions)
      const insertData: any = {
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Vérifier si userId est un UUID valide avant de l'ajouter
      const isValidUUID = (uuid: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
      };

      // Ajouter user_id seulement si fourni et valide
      if (userId && userId !== '' && isValidUUID(userId)) {
        insertData.user_id = userId;
      }

      const { error } = await supabase
        .from('onboarding_events')
        .insert(insertData);

      if (error) {
        console.error('❌ [Analytics DB] Erreur enregistrement événement:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ [Analytics DB] Événement enregistré avec succès');
      return { success: true };
    } catch (error) {
      console.error('💥 [Analytics DB] Erreur critique:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  /**
   * Crée ou met à jour une session d'onboarding
   */
  static async upsertSession(
    userId: string,
    sessionData: OnboardingSessionData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📊 [Analytics DB] Création/mise à jour session:', sessionData);

      // Vérifier si la session existe déjà
      const { data: existingSession } = await supabase
        .from('onboarding_sessions')
        .select('id')
        .eq('session_id', sessionData.session_id)
        .single();

      if (existingSession) {
        // Mettre à jour la session existante
        const { error } = await supabase
          .from('onboarding_sessions')
          .update({
            ...sessionData,
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', sessionData.session_id);

        if (error) {
          console.error('❌ [Analytics DB] Erreur mise à jour session:', error);
          return { success: false, error: error.message };
        }
      } else {
        // Créer une nouvelle session
        const insertData: any = {
          ...sessionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Vérifier si userId est un UUID valide avant de l'ajouter
        const isValidUUID = (uuid: string) => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return uuidRegex.test(uuid);
        };

        // Ajouter user_id seulement si fourni et valide
        if (userId && userId !== '' && isValidUUID(userId)) {
          insertData.user_id = userId;
        }

        const { error } = await supabase
          .from('onboarding_sessions')
          .insert(insertData);

        if (error) {
          console.error('❌ [Analytics DB] Erreur création session:', error);
          return { success: false, error: error.message };
        }
      }

      console.log('✅ [Analytics DB] Session enregistrée avec succès');
      return { success: true };
    } catch (error) {
      console.error('💥 [Analytics DB] Erreur critique session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  /**
   * Enregistre le début d'une session d'onboarding
   */
  static async startOnboardingSession(
    userId: string,
    role: OnboardingRole,
    sessionId: string,
    deviceType?: 'mobile' | 'tablet' | 'desktop',
    browser?: string
  ): Promise<{ success: boolean; error?: string }> {
    const sessionData: OnboardingSessionData = {
      session_id: sessionId,
      role,
      device_type: deviceType,
      browser,
      started_at: new Date().toISOString(),
      status: 'active',
    };

    return this.upsertSession(userId, sessionData);
  }

  /**
   * Enregistre la completion d'une session d'onboarding
   */
  static async completeOnboardingSession(
    sessionId: string,
    totalSteps: number,
    totalTimeSpent: number
  ): Promise<{ success: boolean; error?: string }> {
    const sessionData: OnboardingSessionData = {
      session_id: sessionId,
      completed_at: new Date().toISOString(),
      total_steps: totalSteps,
      total_time_spent: totalTimeSpent,
      completion_percentage: 100,
      status: 'completed',
    };

    return this.upsertSession('', sessionData); // userId pas nécessaire pour la mise à jour
  }

  /**
   * Enregistre l'abandon d'une session d'onboarding
   */
  static async abandonOnboardingSession(
    sessionId: string,
    lastStep: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const sessionData: OnboardingSessionData = {
      session_id: sessionId,
      abandoned_at: new Date().toISOString(),
      last_step: lastStep,
      status: 'abandoned',
      properties: reason ? { reason } : undefined,
    };

    return this.upsertSession('', sessionData); // userId pas nécessaire pour la mise à jour
  }

  /**
   * Enregistre un événement de début d'onboarding
   */
  static async trackOnboardingStarted(
    userId: string,
    role: OnboardingRole,
    sessionId: string,
    deviceType?: 'mobile' | 'tablet' | 'desktop',
    browser?: string
  ): Promise<{ success: boolean; error?: string }> {
    // Créer la session
    await this.startOnboardingSession(userId, role, sessionId, deviceType, browser);

    // Enregistrer l'événement
    const eventData: OnboardingEventData = {
      session_id: sessionId,
      event_type: 'onboarding_started',
      role,
      step: 'welcome',
      step_number: 1,
      device_type: deviceType,
      browser,
    };

    return this.recordEvent(userId, eventData);
  }

  /**
   * Enregistre le début d'une étape
   */
  static async trackStepStarted(
    userId: string,
    role: OnboardingRole,
    sessionId: string,
    step: string,
    stepNumber: number,
    totalSteps: number,
    deviceType?: 'mobile' | 'tablet' | 'desktop',
    browser?: string
  ): Promise<{ success: boolean; error?: string }> {
    const eventData: OnboardingEventData = {
      session_id: sessionId,
      event_type: 'step_started',
      role,
      step,
      step_number: stepNumber,
      total_steps: totalSteps,
      device_type: deviceType,
      browser,
    };

    return this.recordEvent(userId, eventData);
  }

  /**
   * Enregistre la completion d'une étape
   */
  static async trackStepCompleted(
    userId: string,
    role: OnboardingRole,
    sessionId: string,
    step: string,
    stepNumber: number,
    totalSteps: number,
    completionPercentage: number,
    timeSpent: number,
    deviceType?: 'mobile' | 'tablet' | 'desktop',
    browser?: string
  ): Promise<{ success: boolean; error?: string }> {
    const eventData: OnboardingEventData = {
      session_id: sessionId,
      event_type: 'step_completed',
      role,
      step,
      step_number: stepNumber,
      total_steps: totalSteps,
      completion_percentage: completionPercentage,
      time_spent: timeSpent,
      device_type: deviceType,
      browser,
    };

    return this.recordEvent(userId, eventData);
  }

  /**
   * Enregistre le passage d'une étape
   */
  static async trackStepSkipped(
    userId: string,
    role: OnboardingRole,
    sessionId: string,
    step: string,
    stepNumber: number,
    totalSteps: number,
    reason?: string,
    deviceType?: 'mobile' | 'tablet' | 'desktop',
    browser?: string
  ): Promise<{ success: boolean; error?: string }> {
    const eventData: OnboardingEventData = {
      session_id: sessionId,
      event_type: 'step_skipped',
      role,
      step,
      step_number: stepNumber,
      total_steps: totalSteps,
      skipped: true,
      reason,
      device_type: deviceType,
      browser,
    };

    return this.recordEvent(userId, eventData);
  }

  /**
   * Enregistre une erreur dans une étape
   */
  static async trackStepError(
    userId: string,
    role: OnboardingRole,
    sessionId: string,
    step: string,
    stepNumber: number,
    errorType: string,
    errorMessage?: string,
    deviceType?: 'mobile' | 'tablet' | 'desktop',
    browser?: string
  ): Promise<{ success: boolean; error?: string }> {
    const eventData: OnboardingEventData = {
      session_id: sessionId,
      event_type: 'step_error',
      role,
      step,
      step_number: stepNumber,
      error_type: errorType,
      error_message: errorMessage,
      device_type: deviceType,
      browser,
    };

    return this.recordEvent(userId, eventData);
  }

  /**
   * Enregistre une demande d'aide
   */
  static async trackHelpRequested(
    userId: string,
    role: OnboardingRole,
    sessionId: string,
    step: string,
    stepNumber: number,
    helpType: string,
    deviceType?: 'mobile' | 'tablet' | 'desktop',
    browser?: string
  ): Promise<{ success: boolean; error?: string }> {
    const eventData: OnboardingEventData = {
      session_id: sessionId,
      event_type: 'help_requested',
      role,
      step,
      step_number: stepNumber,
      help_type: helpType,
      help_requested: true,
      device_type: deviceType,
      browser,
    };

    return this.recordEvent(userId, eventData);
  }

  /**
   * Enregistre la completion de l'onboarding
   */
  static async trackOnboardingCompleted(
    userId: string,
    role: OnboardingRole,
    sessionId: string,
    totalSteps: number,
    totalTimeSpent: number,
    deviceType?: 'mobile' | 'tablet' | 'desktop',
    browser?: string
  ): Promise<{ success: boolean; error?: string }> {
    // Mettre à jour la session
    await this.completeOnboardingSession(sessionId, totalSteps, totalTimeSpent);

    // Enregistrer l'événement
    const eventData: OnboardingEventData = {
      session_id: sessionId,
      event_type: 'onboarding_completed',
      role,
      total_steps: totalSteps,
      completion_percentage: 100,
      time_spent: totalTimeSpent,
      device_type: deviceType,
      browser,
    };

    return this.recordEvent(userId, eventData);
  }

  /**
   * Enregistre l'abandon de l'onboarding
   */
  static async trackOnboardingAbandoned(
    userId: string,
    role: OnboardingRole,
    sessionId: string,
    step: string,
    stepNumber: number,
    reason?: string,
    deviceType?: 'mobile' | 'tablet' | 'desktop',
    browser?: string
  ): Promise<{ success: boolean; error?: string }> {
    // Mettre à jour la session
    await this.abandonOnboardingSession(sessionId, step, reason);

    // Enregistrer l'événement
    const eventData: OnboardingEventData = {
      session_id: sessionId,
      event_type: 'onboarding_abandoned',
      role,
      step,
      step_number: stepNumber,
      reason,
      device_type: deviceType,
      browser,
    };

    return this.recordEvent(userId, eventData);
  }
}

export default OnboardingAnalyticsDB;
