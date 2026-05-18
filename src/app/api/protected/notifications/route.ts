/**
 * API Route: /api/protected/notifications
 * Gestion des notifications utilisateur
 *
 * GET   - Liste des notifications (paginées, filtrables)
 * PATCH - Marquer comme lues
 * DELETE - Supprimer des notifications
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// ============================================================================
// GET - Liste des notifications
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    const userId = auth.user.id;
    const { searchParams } = new URL(req.url);

    const limit = Math.min(
      parseInt(searchParams.get('limit') || '30', 10),
      100
    );
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const filter = searchParams.get('filter'); // 'unread', 'message', 'appointment', 'plan', etc.
    const countOnly = searchParams.get('count_only') === 'true';

    // Count-only mode for badge
    if (countOnly) {
      const { data: count, error } = await (supabase as any).rpc(
        'get_unread_notification_count',
        { p_user_id: userId }
      );

      if (error) {
        console.error('Error getting unread count:', error);
        return apiResponse.serverError('Erreur lors du comptage');
      }

      return apiResponse.success({ unread_count: count || 0 });
    }

    // Build query
    let query = (supabase as any)
      .from('notifications')
      .select(
        'id, title, body, icon, data, priority, is_read, read_at, notification_code, action_url, action_label, created_at',
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .eq('is_dismissed', false)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filter
    if (filter === 'unread') {
      query = query.eq('is_read', false);
    } else if (filter && filter !== 'all') {
      // Filter by notification category via notification_code prefix
      const categoryMap: Record<string, string[]> = {
        message: ['new_message', 'unread_messages'],
        appointment: [
          'appointment_reminder_24h',
          'appointment_reminder_1h',
          'appointment_confirmed',
          'appointment_cancelled',
          'appointment_rescheduled',
          'appointment_no_show',
        ],
        plan: [
          'new_meal_plan',
          'plan_modification_approved',
          'plan_modification_rejected',
        ],
        achievement: [
          'streak_milestone',
          'badge_earned',
          'weight_goal_reached',
        ],
        reminder: [
          'weight_reminder',
          'hydration_reminder',
          'meal_reminder',
          'questionnaire_due',
        ],
        system: ['welcome', 'new_content', 'new_recipe'],
      };
      const codes = categoryMap[filter];
      if (codes) {
        query = query.in('notification_code', codes);
      }
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return apiResponse.serverError(
        'Erreur lors de la récupération des notifications'
      );
    }

    // Get unread count separately
    const { data: unreadCount } = await (supabase as any).rpc(
      'get_unread_notification_count',
      { p_user_id: userId }
    );

    return apiResponse.success({
      notifications: notifications || [],
      total: count || 0,
      unread_count: unreadCount || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Unexpected error in notifications GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// PATCH - Marquer comme lues
// ============================================================================

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    const userId = auth.user.id;
    const body = await req.json();

    // notification_ids: string[] | null (null = mark all as read)
    const notificationIds: string[] | null = body.notification_ids || null;

    const { data: count, error } = await (supabase as any).rpc(
      'mark_notifications_read',
      {
        p_user_id: userId,
        p_notification_ids: notificationIds,
      }
    );

    if (error) {
      console.error('Error marking notifications as read:', error);
      return apiResponse.serverError('Erreur lors de la mise à jour');
    }

    return apiResponse.success({ marked_count: count || 0 });
  } catch (error) {
    console.error('Unexpected error in notifications PATCH:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Supprimer (dismiss) des notifications
// ============================================================================

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    const userId = auth.user.id;
    const { searchParams } = new URL(req.url);

    const notificationId = searchParams.get('id');
    const clearAll = searchParams.get('clear_all') === 'true';

    if (clearAll) {
      // Dismiss all notifications
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_dismissed', false);

      if (error) {
        console.error('Error clearing notifications:', error);
        return apiResponse.serverError('Erreur lors de la suppression');
      }

      return apiResponse.success({
        message: 'Toutes les notifications ont été supprimées',
      });
    }

    if (!notificationId) {
      return apiResponse.error('ID de notification requis', 400);
    }

    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error dismissing notification:', error);
      return apiResponse.serverError('Erreur lors de la suppression');
    }

    return apiResponse.success({ message: 'Notification supprimée' });
  } catch (error) {
    console.error('Unexpected error in notifications DELETE:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
