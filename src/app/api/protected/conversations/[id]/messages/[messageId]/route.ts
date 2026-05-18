/**
 * API Route: /api/protected/conversations/[id]/messages/[messageId]
 * Edit and delete individual messages
 *
 * PATCH  - Edit message content (sender only, within 15 minutes)
 * DELETE - Soft delete a message (sender only, within 15 minutes)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { editMessageSchema } from '@/lib/api-schemas';
import { z } from 'zod';

const EDIT_WINDOW_MINUTES = 15;

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) return null;

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ============================================================================
// PATCH - Edit message
// ============================================================================

export async function PATCH(
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
      validatedData = editMessageSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Données invalides: ' +
            error.issues.map((e: z.ZodIssue) => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return apiResponse.serverError('Configuration serveur manquante');
    }

    // Fetch the message
    const { data: message, error: msgError } = await adminClient
      .from('messages')
      .select('id, sender_id, conversation_id, created_at, deleted_at')
      .eq('id', messageId)
      .eq('conversation_id', conversationId)
      .single();

    if (msgError || !message) {
      return apiResponse.notFound('Message introuvable');
    }

    // Only sender can edit
    if (message.sender_id !== auth.user.id) {
      return apiResponse.forbidden(
        'Vous ne pouvez modifier que vos propres messages'
      );
    }

    // Cannot edit deleted messages
    if (message.deleted_at) {
      return apiResponse.error('Ce message a été supprimé', 400);
    }

    // Check 15-minute window
    const createdAt = new Date(message.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / 60000;

    if (diffMinutes > EDIT_WINDOW_MINUTES) {
      return apiResponse.error(
        `La modification n'est possible que dans les ${EDIT_WINDOW_MINUTES} premières minutes`,
        400
      );
    }

    // Update the message
    const { data: updated, error: updateError } = await adminClient
      .from('messages')
      .update({
        content: validatedData.content,
        edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating message:', updateError);
      return apiResponse.serverError('Erreur lors de la modification');
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in PATCH /messages/[messageId]:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// DELETE - Soft delete message
// ============================================================================

export async function DELETE(
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

    const adminClient = createAdminClient();
    if (!adminClient) {
      return apiResponse.serverError('Configuration serveur manquante');
    }

    // Fetch the message
    const { data: message, error: msgError } = await adminClient
      .from('messages')
      .select('id, sender_id, conversation_id, created_at, deleted_at')
      .eq('id', messageId)
      .eq('conversation_id', conversationId)
      .single();

    if (msgError || !message) {
      return apiResponse.notFound('Message introuvable');
    }

    // Only sender can delete
    if (message.sender_id !== auth.user.id) {
      return apiResponse.forbidden(
        'Vous ne pouvez supprimer que vos propres messages'
      );
    }

    // Already deleted
    if (message.deleted_at) {
      return apiResponse.error('Ce message est déjà supprimé', 400);
    }

    // Check 15-minute window
    const createdAt = new Date(message.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / 60000;

    if (diffMinutes > EDIT_WINDOW_MINUTES) {
      return apiResponse.error(
        `La suppression n'est possible que dans les ${EDIT_WINDOW_MINUTES} premières minutes`,
        400
      );
    }

    // Soft delete
    const { error: deleteError } = await adminClient
      .from('messages')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (deleteError) {
      console.error('Error soft-deleting message:', deleteError);
      return apiResponse.serverError('Erreur lors de la suppression');
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /messages/[messageId]:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
