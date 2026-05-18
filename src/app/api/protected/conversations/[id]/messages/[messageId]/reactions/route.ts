/**
 * API Route: /api/protected/conversations/[id]/messages/[messageId]/reactions
 * Toggle emoji reaction on a message
 *
 * POST - Toggle (add/remove) a reaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { toggleReactionSchema } from '@/lib/api-schemas';
import { z } from 'zod';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id: conversationId, messageId } = await params;

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
      validatedData = toggleReactionSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error('Emoji invalide', 400);
      }
      throw error;
    }

    const supabase = await createClient();

    // Verify conversation participation
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

    // Verify message belongs to this conversation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: message, error: msgError } = await (supabase as any)
      .from('messages')
      .select('id')
      .eq('id', messageId)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .single();

    if (msgError || !message) {
      return apiResponse.notFound('Message introuvable');
    }

    // Check if reaction already exists (toggle logic)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', auth.user.id)
      .eq('emoji', validatedData.emoji)
      .maybeSingle();

    if (existing) {
      // Remove reaction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('message_reactions')
        .delete()
        .eq('id', existing.id);

      return NextResponse.json(
        { action: 'removed', emoji: validatedData.emoji },
        { status: 200 }
      );
    } else {
      // Add reaction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: auth.user.id,
          emoji: validatedData.emoji,
        });

      if (insertError) {
        console.error('Error inserting reaction:', insertError);
        return apiResponse.serverError("Erreur lors de l'ajout de la réaction");
      }

      return NextResponse.json(
        { action: 'added', emoji: validatedData.emoji },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in POST /reactions:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
