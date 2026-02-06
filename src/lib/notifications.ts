/**
 * Notification Service
 * Utilitaires pour créer des notifications in-app
 *
 * Utilise la fonction PostgreSQL create_notification() définie dans database/14_notifications.sql
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientAny = any;

// Types de notifications disponibles (définis dans notification_types)
export type NotificationTypeCode =
  // Rendez-vous
  | 'appointment_reminder_24h'
  | 'appointment_reminder_1h'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  // Messages
  | 'new_message'
  | 'unread_messages'
  // Plan alimentaire
  | 'new_meal_plan'
  | 'plan_modification_approved'
  | 'plan_modification_rejected'
  // Biométrique
  | 'weight_goal_reached'
  | 'weight_reminder'
  | 'hydration_reminder'
  | 'meal_reminder'
  // Contenu
  | 'new_content'
  | 'new_recipe'
  // Système
  | 'welcome'
  | 'questionnaire_due'
  | 'streak_milestone'
  | 'badge_earned';

export interface NotificationData {
  [key: string]: string | number | boolean;
}

/**
 * Crée une notification pour un utilisateur via la fonction SQL create_notification
 *
 * @param supabase - Client Supabase avec droits appropriés
 * @param userId - ID du profil utilisateur (profiles.id, pas auth.users.id)
 * @param typeCode - Code du type de notification
 * @param data - Données pour les templates (ex: { nutritionist: 'Dr. Martin', date: '5 février' })
 * @param scheduledFor - Date de programmation (optionnel, si null envoi immédiat)
 */
export async function createNotification(
  supabase: SupabaseClientAny,
  userId: string,
  typeCode: NotificationTypeCode,
  data: NotificationData = {},
  scheduledFor?: Date
): Promise<{ notificationId: string | null; error: Error | null }> {
  try {
    const { data: result, error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_type_code: typeCode,
      p_data: data,
      p_scheduled_for: scheduledFor?.toISOString() || null,
    });

    if (error) {
      console.error('Error creating notification:', error);
      return { notificationId: null, error: new Error(error.message) };
    }

    return { notificationId: result, error: null };
  } catch (error) {
    console.error('Unexpected error creating notification:', error);
    return {
      notificationId: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Crée une notification de confirmation de RDV pour le patient
 */
export async function notifyAppointmentConfirmed(
  supabase: SupabaseClientAny,
  patientUserId: string,
  appointmentData: {
    date: string;
    time: string;
    nutritionist: string;
  }
): Promise<void> {
  await createNotification(supabase, patientUserId, 'appointment_confirmed', {
    date: appointmentData.date,
    time: appointmentData.time,
    nutritionist: appointmentData.nutritionist,
  });
}

/**
 * Crée une notification d'annulation de RDV pour le patient et le nutritionniste
 */
export async function notifyAppointmentCancelled(
  supabase: SupabaseClientAny,
  recipientUserId: string,
  appointmentData: {
    date: string;
    reason?: string;
  }
): Promise<void> {
  await createNotification(supabase, recipientUserId, 'appointment_cancelled', {
    date: appointmentData.date,
    reason: appointmentData.reason || 'Non spécifiée',
  });
}

/**
 * Crée une notification de report de RDV
 */
export async function notifyAppointmentRescheduled(
  supabase: SupabaseClientAny,
  recipientUserId: string,
  appointmentData: {
    old_date: string;
    new_date: string;
    new_time: string;
  }
): Promise<void> {
  await createNotification(
    supabase,
    recipientUserId,
    'appointment_rescheduled',
    {
      old_date: appointmentData.old_date,
      new_date: appointmentData.new_date,
      new_time: appointmentData.new_time,
    }
  );
}

/**
 * Crée une notification de nouveau message
 */
export async function notifyNewMessage(
  supabase: SupabaseClientAny,
  recipientUserId: string,
  messageData: {
    sender: string;
    conversationId: string;
  }
): Promise<void> {
  await createNotification(supabase, recipientUserId, 'new_message', {
    sender: messageData.sender,
    conversation_id: messageData.conversationId,
  });
}

/**
 * Formate une date pour l'affichage dans les notifications
 */
export function formatDateForNotification(
  date: Date,
  locale = 'fr-FR'
): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Formate une heure pour l'affichage dans les notifications
 */
export function formatTimeForNotification(
  date: Date,
  locale = 'fr-FR'
): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
