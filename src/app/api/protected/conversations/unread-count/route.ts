/**
 * API Route: /api/protected/conversations/unread-count
 * Retourne le nombre total de messages non lus pour l'utilisateur connecté
 *
 * GET - Nombre de messages non lus
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

export async function GET() {
  try {
    // 1. Authentification (patient ou nutritionniste)
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['patient', 'nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Créer client Supabase
    const supabase = await createClient();

    // 3. Lire le rôle (depuis user_metadata, déjà vérifié par verifyAuth)
    const userRole = auth.user.user_metadata?.role || 'patient';

    // 4. Calculer le total non lu selon le rôle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('conversations')
      .select('patient_unread_count, nutritionist_unread_count')
      .eq('is_active', true);

    if (userRole === 'patient') {
      query = query.eq('patient_id', auth.user.id);
    } else {
      query = query.eq('nutritionist_id', auth.user.id);
    }

    const { data: conversations, error } = await query;

    if (error) {
      console.error('Error fetching unread count:', error);
      return apiResponse.serverError(
        'Erreur lors de la récupération des messages non lus'
      );
    }

    const unreadCount = (conversations || []).reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: number, conv: any) => {
        return (
          sum +
          (userRole === 'patient'
            ? conv.patient_unread_count
            : conv.nutritionist_unread_count)
        );
      },
      0
    );

    return NextResponse.json({ unread_count: unreadCount }, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/conversations/unread-count:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
