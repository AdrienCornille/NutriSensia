/**
 * React Query Hooks for Reminder Preferences
 * AGENDA-009 - Appointment Reminders
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateReminderPreferencesData } from '@/lib/api-schemas';

// ============================================================================
// TYPES
// ============================================================================

export interface ReminderPreferencesAPI {
  id?: string;
  user_id?: string;
  email_enabled: boolean;
  email_hours_before: number;
  push_enabled: boolean;
  push_hours_before: number;
  sms_enabled: boolean;
  sms_hours_before: number;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentReminderAPI {
  id: string;
  reminder_type: 'email' | 'push' | 'sms';
  remind_before_hours: number;
  scheduled_for: string;
  enabled: boolean;
  sent: boolean;
  sent_at: string | null;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

const reminderKeys = {
  all: ['reminders'] as const,
  preferences: () => [...reminderKeys.all, 'preferences'] as const,
  appointment: (appointmentId: string) =>
    [...reminderKeys.all, 'appointment', appointmentId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetch user's reminder preferences (defaults if none set)
 */
export function useReminderPreferences() {
  return useQuery<ReminderPreferencesAPI, Error>({
    queryKey: reminderKeys.preferences(),
    queryFn: async () => {
      const response = await fetch('/api/protected/reminder-preferences', {
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des préférences');
      }
      const result = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch reminders for a specific appointment
 */
export function useAppointmentReminders(appointmentId: string | null) {
  return useQuery<AppointmentReminderAPI[], Error>({
    queryKey: reminderKeys.appointment(appointmentId || ''),
    queryFn: async () => {
      const response = await fetch(
        `/api/protected/appointments/${appointmentId}/reminders`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des rappels');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!appointmentId,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update user's reminder preferences
 */
export function useUpdateReminderPreferences() {
  const queryClient = useQueryClient();

  return useMutation<ReminderPreferencesAPI, Error, UpdateReminderPreferencesData>({
    mutationFn: async (data) => {
      const response = await fetch('/api/protected/reminder-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour');
      }
      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.preferences() });
    },
  });
}

/**
 * Toggle reminders for a specific appointment
 */
export function useUpdateAppointmentReminders(appointmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    AppointmentReminderAPI[],
    Error,
    { reminders: { id: string; enabled: boolean }[] }
  >({
    mutationFn: async (data) => {
      const response = await fetch(
        `/api/protected/appointments/${appointmentId}/reminders`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour des rappels');
      }
      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reminderKeys.appointment(appointmentId),
      });
    },
  });
}
