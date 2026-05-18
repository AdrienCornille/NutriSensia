/**
 * API Route: /api/protected/conversations/[id]/typing
 * Typing indicator management
 *
 * POST - Update typing status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateTypingSchema } from '@/lib/api-schemas';
import { z } from 'zod';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['patient', 'nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const body = await req.json();
    let validatedData;
    try {
      validatedData = updateTypingSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error('Données invalides', 400);
      }
      throw error;
    }

    const supabase = await createClient();

    // Verify participation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversation, error: convError } = await (supabase as any)
      .from('conversations')
      .select('id, patient_id, nutritionist_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return apiResponse.notFound('Conversation introuvable');
    }

    if (
      conversation.patient_id !== auth.user.id &&
      conversation.nutritionist_id !== auth.user.id
    ) {
      return apiResponse.forbidden(
        "Vous n'avez pas accès à cette conversation"
      );
    }

    // Upsert typing indicator
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: upsertError } = await (supabase as any)
      .from('typing_indicators')
      .upsert(
        {
          conversation_id: conversationId,
          user_id: auth.user.id,
          is_typing: validatedData.is_typing,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'conversation_id,user_id' }
      );

    if (upsertError) {
      console.error('Error updating typing indicator:', upsertError);
      return apiResponse.serverError('Erreur lors de la mise à jour');
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in POST /typing:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
