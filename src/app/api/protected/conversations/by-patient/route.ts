/**
 * API Route: /api/protected/conversations/by-patient
 * Get or create a conversation with a specific patient (PAT-004)
 *
 * GET ?patient_user_id=xxx - Returns the conversation_id between current nutritionist and patient
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { searchParams } = new URL(req.url);
    const patientUserId = searchParams.get('patient_user_id');

    if (!patientUserId) {
      return apiResponse.error('patient_user_id requis', 400);
    }

    const supabase = await createClient();

    // Get or create the conversation using the existing RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversationId, error } = await (supabase as any).rpc(
      'get_or_create_conversation',
      {
        p_patient_id: patientUserId,
        p_nutritionist_id: auth.user.id,
      }
    );

    if (error) {
      // Fallback: try to find existing conversation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingConv, error: findError } = await (supabase as any)
        .from('conversations')
        .select('id')
        .eq('patient_id', patientUserId)
        .eq('nutritionist_id', auth.user.id)
        .single();

      if (findError || !existingConv) {
        // Create a new conversation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newConv, error: createError } = await (supabase as any)
          .from('conversations')
          .insert({
            patient_id: patientUserId,
            nutritionist_id: auth.user.id,
            is_active: true,
          })
          .select('id')
          .single();

        if (createError || !newConv) {
          console.error('Error creating conversation:', createError);
          return apiResponse.serverError(
            'Erreur lors de la création de la conversation'
          );
        }

        return NextResponse.json({ conversation_id: newConv.id });
      }

      return NextResponse.json({ conversation_id: existingConv.id });
    }

    return NextResponse.json({ conversation_id: conversationId });
  } catch (error) {
    console.error('Unexpected error in GET /by-patient:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
