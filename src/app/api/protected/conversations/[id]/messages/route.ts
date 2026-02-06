/**
 * API Route: /api/protected/conversations/[id]/messages
 * Gestion des messages dans une conversation
 *
 * GET  - Récupérer l'historique des messages (avec pagination cursor-based)
 * POST - Envoyer un message texte
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createMessageSchema } from '@/lib/api-schemas';
import { z } from 'zod';

/**
 * Create a Supabase admin client (service role) to bypass RLS
 * Required for marking messages as read (UPDATE on messages sent by the other participant)
 */
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ============================================================================
// GET - Historique des messages
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['patient', 'nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser query params
    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '50', 10), 1),
      100
    );
    const beforeId = searchParams.get('before_id') || undefined;

    // 3. Client Supabase
    const supabase = await createClient();

    // 4. Vérifier que l'utilisateur est participant
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

    // 5. Si before_id fourni, récupérer le created_at du message de référence
    let beforeCreatedAt: string | undefined;
    if (beforeId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: refMessage } = await (supabase as any)
        .from('messages')
        .select('created_at')
        .eq('id', beforeId)
        .single();

      if (refMessage) {
        beforeCreatedAt = refMessage.created_at;
      }
    }

    // 6. Récupérer les messages
    // On demande limit + 1 pour savoir s'il y a plus de messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messagesQuery = (supabase as any)
      .from('messages')
      .select(
        `
        *,
        message_attachments (
          id,
          file_type,
          file_name,
          file_url,
          file_size,
          mime_type,
          thumbnail_url
        )
      `
      )
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (beforeCreatedAt) {
      messagesQuery = messagesQuery.lt('created_at', beforeCreatedAt);
    }

    const { data: messages, error: messagesError } = await messagesQuery;

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des messages'
      );
    }

    // 7. Déterminer has_more et tronquer
    const hasMore = (messages || []).length > limit;
    const truncated = hasMore
      ? (messages || []).slice(0, limit)
      : messages || [];

    // 8. Inverser pour l'ordre chronologique (ASC)
    const chronological = truncated.reverse();

    // 9. Marquer les messages comme lus
    // Uses admin client to bypass RLS (messages UPDATE policy only allows sender_id = auth.uid(),
    // but we need to update messages sent by the OTHER participant)
    const markedAsRead = await markMessagesAsRead(
      conversationId,
      auth.user.id,
      conversation.patient_id
    );

    return NextResponse.json(
      {
        messages: chronological,
        conversation_id: conversationId,
        has_more: hasMore,
        marked_as_read: markedAsRead,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/conversations/[id]/messages:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// POST - Envoyer un message texte
// ============================================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['patient', 'nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Valider le body
    const body = await req.json();
    let validatedData;
    try {
      validatedData = createMessageSchema.parse(body);
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

    // 3. Client Supabase
    const supabase = await createClient();

    // 4. Vérifier la participation
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

    // 5. Envoyer le message via RPC
    let messageId: string;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rpcResult, error: rpcError } = await (supabase as any).rpc(
        'send_message',
        {
          p_conversation_id: conversationId,
          p_sender_id: auth.user.id,
          p_content: validatedData.content,
          p_message_type: 'text',
        }
      );

      if (rpcError) throw rpcError;
      messageId = rpcResult;
    } catch (rpcError) {
      // Fallback: INSERT direct si la fonction RPC n'existe pas
      console.warn('send_message RPC failed, using fallback:', rpcError);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: inserted, error: insertError } = await (supabase as any)
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: auth.user.id,
          content: validatedData.content,
          message_type: 'text',
          status: 'sent',
        })
        .select('id')
        .single();

      if (insertError || !inserted) {
        console.error('Error inserting message:', insertError);
        return apiResponse.serverError("Erreur lors de l'envoi du message");
      }
      messageId = inserted.id;
    }

    // 6. Récupérer le message créé avec ses attachments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: createdMessage, error: fetchError } = await (
      supabase as any
    )
      .from('messages')
      .select(
        `
        *,
        message_attachments (
          id,
          file_type,
          file_name,
          file_url,
          file_size,
          mime_type,
          thumbnail_url
        )
      `
      )
      .eq('id', messageId)
      .single();

    if (fetchError || !createdMessage) {
      console.error('Error fetching created message:', fetchError);
      // Message was created, return minimal data
      return NextResponse.json(
        { id: messageId, status: 'sent' },
        { status: 201 }
      );
    }

    return NextResponse.json(createdMessage, { status: 201 });
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/protected/conversations/[id]/messages:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Mark messages as read using admin client (bypasses RLS)
 *
 * The messages UPDATE RLS policy only allows `sender_id = auth.uid()`,
 * but marking messages as read requires updating messages sent by the OTHER participant.
 * We use the service role client after verifying the user is a participant.
 */
async function markMessagesAsRead(
  conversationId: string,
  userId: string,
  patientId: string
): Promise<number> {
  const adminClient = createAdminClient();
  if (!adminClient) return 0;

  try {
    // Update messages sent by the other participant that haven't been read yet
    const { data: updated } = await adminClient
      .from('messages')
      .update({
        read_at: new Date().toISOString(),
        status: 'read',
        updated_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('read_at', null)
      .select('id');

    const count = updated?.length || 0;

    const markedCount = count;

    // Reset unread count for this user
    if (markedCount > 0) {
      const isPatient = patientId === userId;
      const updateField = isPatient
        ? 'patient_unread_count'
        : 'nutritionist_unread_count';

      await adminClient
        .from('conversations')
        .update({ [updateField]: 0, updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    return markedCount;
  } catch (error) {
    console.warn('markMessagesAsRead failed:', error);
    return 0;
  }
}
