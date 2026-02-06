/**
 * Hooks React Query pour la messagerie
 *
 * Provides hooks for:
 * - Listing conversations
 * - Fetching messages (with polling + Realtime)
 * - Sending text messages (with optimistic updates)
 * - Uploading attachments
 * - Quick replies
 * - Unread count
 * - Supabase Realtime subscription for instant delivery
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Message,
  Conversation,
  QuickReply,
} from '@/types/messaging';
import type { CreateMessageData } from '@/lib/api-schemas';
import {
  transformMessageFromDB,
  transformConversationFromDB,
  transformQuickReplyFromDB,
} from '@/lib/conversations-transformers';
import type {
  MessageFromDB,
  ConversationFromDB,
  QuickReplyFromDB,
} from '@/lib/conversations-transformers';
import { createClient as createBrowserSupabase } from '@/lib/supabase/client';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (limit?: number, offset?: number) =>
    [...conversationKeys.lists(), limit, offset] as const,
  messages: (id: string) =>
    [...conversationKeys.all, 'messages', id] as const,
  unreadCount: () => [...conversationKeys.all, 'unread-count'] as const,
  quickReplies: () => [...conversationKeys.all, 'quick-replies'] as const,
};

// ============================================================================
// TYPES
// ============================================================================

export interface ConversationsResponse {
  conversations: Omit<Conversation, 'messages'>[];
  total: number;
  limit: number;
  offset: number;
}

export interface MessagesResponse {
  messages: Message[];
  conversation_id: string;
  has_more: boolean;
  marked_as_read: number;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to get total unread message count (for dashboard badge)
 */
export function useUnreadCount() {
  return useQuery<{ unread_count: number }, Error>({
    queryKey: conversationKeys.unreadCount(),
    queryFn: async () => {
      const response = await fetch(
        '/api/protected/conversations/unread-count',
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error ||
            'Erreur lors de la récupération des messages non lus'
        );
      }

      return response.json();
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Hook to get list of conversations
 */
export function useConversations(limit = 20, offset = 0) {
  return useQuery<ConversationsResponse, Error>({
    queryKey: conversationKeys.list(limit, offset),
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `/api/protected/conversations?${params.toString()}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error ||
            'Erreur lors de la récupération des conversations'
        );
      }

      const data = await response.json();

      // Get current user ID for transformation
      const currentUserId = await getCurrentUserId();

      // Transform conversations from DB format to UI format
      const transformedConversations = (data.conversations || []).map(
        (conv: ConversationFromDB) =>
          transformConversationFromDB(conv, currentUserId)
      );

      return {
        conversations: transformedConversations,
        total: data.total,
        limit: data.limit,
        offset: data.offset,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get messages for a conversation
 * Automatically marks messages as read when fetched
 * Polling every 5s as fallback (Realtime provides instant updates)
 */
export function useMessages(conversationId: string, limit = 50) {
  return useQuery<MessagesResponse, Error>({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      const response = await fetch(
        `/api/protected/conversations/${conversationId}/messages?${params.toString()}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error ||
            'Erreur lors de la récupération des messages'
        );
      }

      const data = await response.json();

      // Get current user ID for transformation
      const currentUserId = await getCurrentUserId();

      // Transform messages from DB format to UI format
      const transformedMessages = (data.messages || []).map(
        (msg: MessageFromDB) => transformMessageFromDB(msg, currentUserId)
      );

      return {
        messages: transformedMessages,
        conversation_id: data.conversation_id,
        has_more: data.has_more,
        marked_as_read: data.marked_as_read,
      };
    },
    enabled: !!conversationId,
    staleTime: 5 * 1000,
    refetchInterval: 5 * 1000,
  });
}

/**
 * Hook to get quick reply suggestions
 */
export function useQuickReplies() {
  return useQuery<QuickReply[], Error>({
    queryKey: conversationKeys.quickReplies(),
    queryFn: async () => {
      const response = await fetch(
        '/api/protected/conversations/quick-replies',
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error ||
            'Erreur lors de la récupération des réponses rapides'
        );
      }

      const data = await response.json();
      return (data.quick_replies || []).map((qr: QuickReplyFromDB) =>
        transformQuickReplyFromDB(qr)
      );
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to send a text message with optimistic update
 * The message appears instantly in the UI before server confirmation
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<MessageFromDB, Error, CreateMessageData>({
    mutationFn: async (data: CreateMessageData) => {
      const response = await fetch(
        `/api/protected/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'envoi du message");
      }

      return response.json();
    },
    // Optimistic update: show the message instantly
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: conversationKeys.messages(conversationId),
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<MessagesResponse>(
        conversationKeys.messages(conversationId)
      );

      // Build optimistic message
      const currentUserId = await getCurrentUserId();
      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}`,
        content: newMessage.content,
        type: 'text',
        timestamp: new Date(),
        isFromUser: true,
        status: 'sending',
      };

      // Optimistically update the cache
      if (previousMessages && currentUserId) {
        queryClient.setQueryData<MessagesResponse>(
          conversationKeys.messages(conversationId),
          {
            ...previousMessages,
            messages: [...previousMessages.messages, optimisticMessage],
          }
        );
      }

      return { previousMessages };
    },
    // On error, roll back to the previous value
    onError: (_error, _variables, context) => {
      const ctx = context as { previousMessages?: MessagesResponse } | undefined;
      if (ctx?.previousMessages) {
        queryClient.setQueryData(
          conversationKeys.messages(conversationId),
          ctx.previousMessages
        );
      }
    },
    // On success or error, refetch to get the real server data
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.unreadCount(),
      });
    },
  });
}

/**
 * Hook to upload an image or document
 */
export function useUploadAttachment(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { message: MessageFromDB; attachment: unknown },
    Error,
    { file: File; file_type: 'image' | 'document' }
  >({
    mutationFn: async ({ file, file_type }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', file_type);

      const response = await fetch(
        `/api/protected/conversations/${conversationId}/messages/upload`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'upload du fichier");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(),
      });
    },
  });
}

// ============================================================================
// REALTIME
// ============================================================================

/**
 * Hook to subscribe to Supabase Realtime for instant message delivery
 *
 * Listens for INSERT and UPDATE events on the messages table for the given conversation.
 * When a new message arrives or status changes, it invalidates the React Query cache
 * so the UI updates immediately without waiting for the next poll.
 *
 * Usage: call this in the messaging page component
 */
export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const supabase = createBrowserSupabase();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          // New message arrived — refetch immediately
          queryClient.invalidateQueries({
            queryKey: conversationKeys.messages(conversationId),
          });
          queryClient.invalidateQueries({
            queryKey: conversationKeys.lists(),
          });
          queryClient.invalidateQueries({
            queryKey: conversationKeys.unreadCount(),
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          // Message status changed (e.g. read) — refetch to update status indicators
          queryClient.invalidateQueries({
            queryKey: conversationKeys.messages(conversationId),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get the current user ID from the Supabase browser client session
 * Uses a cached value to avoid redundant auth calls
 */
let cachedUserId = '';

async function getCurrentUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;

  try {
    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    cachedUserId = user?.id || '';
    return cachedUserId;
  } catch {
    // Ignore errors
  }
  return '';
}

/**
 * Reset the cached user ID (e.g., on logout)
 */
export function resetConversationsCache() {
  cachedUserId = '';
}
