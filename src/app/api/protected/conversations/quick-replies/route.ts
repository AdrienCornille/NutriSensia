/**
 * API Route: /api/protected/conversations/quick-replies
 * Réponses rapides prédéfinies pour la messagerie
 *
 * GET - Récupérer les quick replies (système + personnalisées)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

export async function GET() {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['patient', 'nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Client Supabase
    const supabase = await createClient();

    // 3. Récupérer les quick replies (système + propres à l'utilisateur)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: quickReplies, error } = await (supabase as any)
      .from('quick_replies')
      .select('id, text, category, display_order')
      .or(`user_id.is.null,user_id.eq.${auth.user.id}`)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching quick replies:', error);
      return apiResponse.serverError(
        'Erreur lors de la récupération des réponses rapides'
      );
    }

    return NextResponse.json(
      { quick_replies: quickReplies || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/conversations/quick-replies:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
