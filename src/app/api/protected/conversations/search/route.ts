/**
 * API Route: /api/protected/conversations/search
 * Full-text search across all user's conversations (MSG-N-006)
 *
 * GET ?q=keyword&limit=20&offset=0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

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
    const query = searchParams.get('q')?.trim();
    const conversationId = searchParams.get('conversation_id')?.trim() || null;
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '20', 10), 1),
      50
    );
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    if (!query || query.length < 2) {
      return apiResponse.error(
        'La recherche doit contenir au moins 2 caractères',
        400
      );
    }

    const supabase = await createClient();
    const userId = auth.user.id;

    // If conversation_id provided, verify user is a participant
    if (conversationId) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .or(`patient_id.eq.${userId},nutritionist_id.eq.${userId}`)
        .single();

      if (!conv) {
        return apiResponse.error('Conversation non trouvée', 404);
      }
    }

    // Use raw SQL via RPC for full-text search with proper joins
    // We search messages in conversations where the user is a participant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rpcParams: Record<string, unknown> = {
      p_user_id: userId,
      p_query: query,
      p_limit: limit,
      p_offset: offset,
    };
    if (conversationId) {
      rpcParams.p_conversation_id = conversationId;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: results, error } = await (supabase as any).rpc(
      'search_messages',
      rpcParams
    );

    if (error) {
      // Fallback: use ILIKE if the RPC doesn't exist yet
      console.warn('search_messages RPC failed, using fallback:', error);
      return await fallbackSearch(
        supabase,
        userId,
        query,
        limit,
        offset,
        conversationId
      );
    }

    // Get total count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countParams: Record<string, unknown> = {
      p_user_id: userId,
      p_query: query,
    };
    if (conversationId) {
      countParams.p_conversation_id = conversationId;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: countResult } = await (supabase as any).rpc(
      'search_messages_count',
      countParams
    );

    return NextResponse.json({
      results: results || [],
      total: countResult || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Unexpected error in GET /search:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fallbackSearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  query: string,
  limit: number,
  offset: number,
  conversationId?: string | null
) {
  let conversationIds: string[];

  if (conversationId) {
    conversationIds = [conversationId];
  } else {
    // Simple ILIKE search as fallback
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`patient_id.eq.${userId},nutritionist_id.eq.${userId}`)
      .eq('is_active', true);

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ results: [], total: 0, limit, offset });
    }

    conversationIds = conversations.map((c: { id: string }) => c.id);
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select(
      `
      id,
      conversation_id,
      content,
      sender_id,
      created_at
    `
    )
    .in('conversation_id', conversationIds)
    .ilike('content', `%${query}%`)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ results: [], total: 0, limit, offset });
  }

  const results = (messages || []).map(
    (msg: {
      id: string;
      conversation_id: string;
      content: string;
      sender_id: string;
      created_at: string;
    }) => ({
      message_id: msg.id,
      conversation_id: msg.conversation_id,
      content: msg.content,
      highlighted_content: msg.content,
      created_at: msg.created_at,
      sender_name: '',
      other_user_name: '',
    })
  );

  return NextResponse.json({
    results,
    total: results.length,
    limit,
    offset,
  });
}
