/**
 * API Route: /api/protected/conversations/presence
 * Presence tracking (online status + heartbeat) for both nutritionists and patients
 *
 * POST - Heartbeat: update last_seen_at (any authenticated user)
 * GET  - Get presence info for a user (by user_id + role)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// ============================================================================
// POST - Heartbeat (any authenticated user updates their presence)
// ============================================================================

export async function POST() {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['patient', 'nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    const userRole = auth.user.user_metadata?.role || 'patient';

    if (userRole === 'nutritionist') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('nutritionist_profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('user_id', auth.user.id);

      if (updateError) {
        console.error('Error updating nutritionist presence:', updateError);
        return apiResponse.serverError(
          'Erreur lors de la mise à jour du statut'
        );
      }

      // Compute avg response time in background (~every 10th heartbeat)
      if (Math.random() < 0.1) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: avgResult } = await (supabase as any).rpc(
            'compute_avg_response_time',
            { p_nutritionist_user_id: auth.user.id }
          );

          if (avgResult !== null && avgResult !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('nutritionist_profiles')
              .update({ avg_response_time_minutes: avgResult })
              .eq('user_id', auth.user.id);
          }
        } catch {
          // Non-blocking
        }
      }
    } else {
      // Patient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('patient_profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('user_id', auth.user.id);

      if (updateError) {
        console.error('Error updating patient presence:', updateError);
        return apiResponse.serverError(
          'Erreur lors de la mise à jour du statut'
        );
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in POST /presence:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// GET - Get presence for any user (nutritionist or patient)
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['patient', 'nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const role = searchParams.get('role') || 'nutritionist';

    // Backward compat: support old param name
    const targetUserId = userId || searchParams.get('nutritionist_user_id');

    if (!targetUserId) {
      return apiResponse.error('user_id requis', 400);
    }

    const supabase = await createClient();

    if (role === 'patient') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile, error } = await (supabase as any)
        .from('patient_profiles')
        .select('last_seen_at')
        .eq('user_id', targetUserId)
        .single();

      if (error || !profile) {
        return apiResponse.notFound('Patient introuvable');
      }

      let status: 'online' | 'offline' = 'offline';
      if (profile.last_seen_at) {
        const lastSeen = new Date(profile.last_seen_at);
        const diffMs = Date.now() - lastSeen.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        status = diffMinutes <= 2 ? 'online' : 'offline';
      }

      return NextResponse.json({
        status,
        last_seen_at: profile.last_seen_at,
        avg_response_time_minutes: null,
      });
    } else {
      // Nutritionist (default)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile, error } = await (supabase as any)
        .from('nutritionist_profiles')
        .select('last_seen_at, avg_response_time_minutes')
        .eq('user_id', targetUserId)
        .single();

      if (error || !profile) {
        return apiResponse.notFound('Nutritionniste introuvable');
      }

      let status: 'online' | 'offline' = 'offline';
      if (profile.last_seen_at) {
        const lastSeen = new Date(profile.last_seen_at);
        const diffMs = Date.now() - lastSeen.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        status = diffMinutes <= 2 ? 'online' : 'offline';
      }

      return NextResponse.json({
        status,
        last_seen_at: profile.last_seen_at,
        avg_response_time_minutes: profile.avg_response_time_minutes,
      });
    }
  } catch (error) {
    console.error('Unexpected error in GET /presence:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
