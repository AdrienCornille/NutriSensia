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

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Message, Conversation, QuickReply } from '@/types/messaging';
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
  messages: (id: string) => [...conversationKeys.all, 'messages', id] as const,
  unreadCount: () => [...conversationKeys.all, 'unread-count'] as const,
  quickReplies: () => [...conversationKeys.all, 'quick-replies'] as const,
  presence: (nutritionistUserId: string) =>
    [...conversationKeys.all, 'presence', nutritionistUserId] as const,
  search: (query: string, conversationId?: string) =>
    [...conversationKeys.all, 'search', query, conversationId] as const,
  byPatient: (patientUserId: string) =>
    [...conversationKeys.all, 'by-patient', patientUserId] as const,
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
          error.error || 'Erreur lors de la récupération des messages non lus'
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
          error.error || 'Erreur lors de la récupération des conversations'
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
  const queryClient = useQueryClient();

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
          error.error || 'Erreur lors de la récupération des messages'
        );
      }

      const data = await response.json();

      // Get current user ID for transformation
      const currentUserId = await getCurrentUserId();

      // Transform messages from DB format to UI format
      const transformedMessages = (data.messages || []).map(
        (msg: MessageFromDB) => transformMessageFromDB(msg, currentUserId)
      );

      // If messages were marked as read, refresh conversation list & unread count
      if (data.marked_as_read > 0) {
        queryClient.invalidateQueries({
          queryKey: conversationKeys.lists(),
        });
        queryClient.invalidateQueries({
          queryKey: conversationKeys.unreadCount(),
        });
      }

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
          error.error || 'Erreur lors de la récupération des réponses rapides'
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

  type SendMessageData = CreateMessageData & {
    _replyTo?: import('@/types/messaging').MessageReplyTo;
  };

  return useMutation<MessageFromDB, Error, SendMessageData>({
    mutationFn: async (data: SendMessageData) => {
      // Strip the client-only _replyTo field before sending to the API
      const { _replyTo, ...apiData } = data;
      void _replyTo;
      const response = await fetch(
        `/api/protected/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(apiData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'envoi du message");
      }

      return response.json();
    },
    // Optimistic update: show the message instantly
    onMutate: async newMessage => {
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
        senderId: currentUserId,
        status: 'sending',
        ...(newMessage._replyTo ? { replyTo: newMessage._replyTo } : {}),
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
      const ctx = context as
        | { previousMessages?: MessagesResponse }
        | undefined;
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
    { file: File; file_type: 'image' | 'document'; caption?: string }
  >({
    mutationFn: async ({ file, file_type, caption }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', file_type);
      if (caption) formData.append('caption', caption);

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
          // Message status changed (e.g. read, edited, deleted) — refetch
          queryClient.invalidateQueries({
            queryKey: conversationKeys.messages(conversationId),
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          // Reaction added/removed — refetch messages to update reaction counts
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
// PRESENCE (MSG-008)
// ============================================================================

export interface PresenceData {
  status: 'online' | 'offline';
  last_seen_at: string | null;
  avg_response_time_minutes: number | null;
}

/**
 * Hook to get nutritionist online status
 */
export function useNutritionistPresence(nutritionistUserId: string) {
  return useQuery<PresenceData, Error>({
    queryKey: conversationKeys.presence(nutritionistUserId),
    queryFn: async () => {
      const response = await fetch(
        `/api/protected/conversations/presence?user_id=${nutritionistUserId}&role=nutritionist`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du statut');
      }

      return response.json();
    },
    enabled: !!nutritionistUserId,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Hook to get any user's online status (patient or nutritionist)
 */
export function useUserPresence(
  userId: string,
  role: 'patient' | 'nutritionist'
) {
  return useQuery<PresenceData, Error>({
    queryKey: conversationKeys.presence(userId),
    queryFn: async () => {
      const response = await fetch(
        `/api/protected/conversations/presence?user_id=${userId}&role=${role}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du statut');
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Hook for heartbeat - sends presence ping every 60s (works for both roles)
 */
export function useHeartbeat() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/protected/conversations/presence', {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.warn('[Heartbeat] Error:', res.status, body);
        }
      } catch {
        // Silent fail — network error
      }
    };

    // Send immediately on mount
    sendHeartbeat();

    // Then every 60 seconds
    intervalRef.current = setInterval(sendHeartbeat, 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}

// ============================================================================
// SEARCH (MSG-N-006)
// ============================================================================

export interface MessageSearchResult {
  message_id: string;
  conversation_id: string;
  content: string;
  highlighted_content: string;
  created_at: string;
  sender_name: string;
  other_user_name: string;
}

/**
 * Hook to search messages across all conversations
 */
export function useSearchMessages(query: string, conversationId?: string) {
  return useQuery<{ results: MessageSearchResult[]; total: number }, Error>({
    queryKey: conversationKeys.search(query, conversationId),
    queryFn: async () => {
      const params = new URLSearchParams({ q: query, limit: '20' });
      if (conversationId) {
        params.set('conversation_id', conversationId);
      }
      const response = await fetch(
        `/api/protected/conversations/search?${params.toString()}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la recherche');
      }

      return response.json();
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// CONVERSATION BY PATIENT (PAT-004)
// ============================================================================

/**
 * Hook to get/create a conversation with a specific patient
 */
export function useConversationByPatient(patientUserId: string) {
  return useQuery<{ conversation_id: string }, Error>({
    queryKey: conversationKeys.byPatient(patientUserId),
    queryFn: async () => {
      const response = await fetch(
        `/api/protected/conversations/by-patient?patient_user_id=${patientUserId}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || 'Erreur lors de la récupération de la conversation'
        );
      }

      return response.json();
    },
    enabled: !!patientUserId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// EXPORT (MSG-010)
// ============================================================================

/**
 * Hook to export conversation as PDF
 */
export function useExportConversation(conversationId: string) {
  return useMutation<Blob, Error, void>({
    mutationFn: async () => {
      const response = await fetch(
        `/api/protected/conversations/${conversationId}/export`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'export");
      }

      return response.blob();
    },
    onSuccess: blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversation-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });
}

// ============================================================================
// TYPING INDICATOR
// ============================================================================

/**
 * Hook to send typing status (debounced)
 * Call onTypingChange(true) when user starts typing, automatically sends false after 3s
 */
export function useUpdateTyping(conversationId: string) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      if (!conversationId) return;
      try {
        await fetch(`/api/protected/conversations/${conversationId}/typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ is_typing: isTyping }),
        });
      } catch {
        // Silent fail
      }
    },
    [conversationId]
  );

  const onTypingChange = useCallback(() => {
    // Send typing = true
    sendTyping(true);

    // Clear previous timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Auto-stop after 10 seconds of no input
    timeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 10000);
  }, [sendTyping]);

  // Cleanup on unmount — send stop typing
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (conversationId) {
        // Fire-and-forget stop typing on unmount
        fetch(`/api/protected/conversations/${conversationId}/typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ is_typing: false }),
        }).catch(() => {});
      }
    };
  }, [conversationId]);

  return { onTypingChange };
}

/**
 * Hook to subscribe to typing indicators from other users via Supabase Realtime
 */
export function useRealtimeTyping(
  conversationId: string,
  currentUserId: string
) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState<string | null>(null);
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const supabase = createBrowserSupabase();

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          const record = (payload.new || payload.old) as
            | {
                user_id: string;
                is_typing: boolean;
              }
            | undefined;

          if (!record || record.user_id === currentUserId) return;

          if (record.is_typing) {
            setIsOtherTyping(true);
            // Auto-clear after 15s (safety net if stop event is missed)
            if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
            clearTimeoutRef.current = setTimeout(() => {
              setIsOtherTyping(false);
              setTypingUserName(null);
            }, 15000);
          } else {
            setIsOtherTyping(false);
            setTypingUserName(null);
            if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    };
  }, [conversationId, currentUserId]);

  return { isOtherTyping, typingUserName };
}

// ============================================================================
// REACTIONS
// ============================================================================

/**
 * Hook to toggle an emoji reaction on a message (optimistic update)
 */
export function useToggleReaction(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { action: 'added' | 'removed'; emoji: string },
    Error,
    { messageId: string; emoji: string }
  >({
    mutationFn: async ({ messageId, emoji }) => {
      const response = await fetch(
        `/api/protected/conversations/${conversationId}/messages/${messageId}/reactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ emoji }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'ajout de la réaction");
      }

      return response.json();
    },
    onMutate: async ({ messageId, emoji }) => {
      await queryClient.cancelQueries({
        queryKey: conversationKeys.messages(conversationId),
      });

      const previousMessages = queryClient.getQueryData<MessagesResponse>(
        conversationKeys.messages(conversationId)
      );

      if (previousMessages) {
        queryClient.setQueryData<MessagesResponse>(
          conversationKeys.messages(conversationId),
          {
            ...previousMessages,
            messages: previousMessages.messages.map(msg => {
              if (msg.id !== messageId) return msg;

              const reactions = [...(msg.reactions || [])];
              const existingIdx = reactions.findIndex(r => r.emoji === emoji);

              if (existingIdx >= 0 && reactions[existingIdx].hasReacted) {
                // Remove reaction
                if (reactions[existingIdx].count <= 1) {
                  reactions.splice(existingIdx, 1);
                } else {
                  reactions[existingIdx] = {
                    ...reactions[existingIdx],
                    count: reactions[existingIdx].count - 1,
                    hasReacted: false,
                  };
                }
              } else if (existingIdx >= 0) {
                // Add to existing emoji
                reactions[existingIdx] = {
                  ...reactions[existingIdx],
                  count: reactions[existingIdx].count + 1,
                  hasReacted: true,
                };
              } else {
                // New emoji
                reactions.push({ emoji, count: 1, hasReacted: true });
              }

              return { ...msg, reactions };
            }),
          }
        );
      }

      return { previousMessages };
    },
    onError: (_error, _variables, context) => {
      const ctx = context as
        | { previousMessages?: MessagesResponse }
        | undefined;
      if (ctx?.previousMessages) {
        queryClient.setQueryData(
          conversationKeys.messages(conversationId),
          ctx.previousMessages
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messages(conversationId),
      });
    },
  });
}

// ============================================================================
// EDIT / DELETE MESSAGES
// ============================================================================

/**
 * Hook to edit a message's content
 */
export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { messageId: string; content: string }>({
    mutationFn: async ({ messageId, content }) => {
      const response = await fetch(
        `/api/protected/conversations/${conversationId}/messages/${messageId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la modification');
      }

      return response.json();
    },
    onMutate: async ({ messageId, content }) => {
      await queryClient.cancelQueries({
        queryKey: conversationKeys.messages(conversationId),
      });

      const previousMessages = queryClient.getQueryData<MessagesResponse>(
        conversationKeys.messages(conversationId)
      );

      if (previousMessages) {
        queryClient.setQueryData<MessagesResponse>(
          conversationKeys.messages(conversationId),
          {
            ...previousMessages,
            messages: previousMessages.messages.map(msg =>
              msg.id === messageId
                ? { ...msg, content, editedAt: new Date() }
                : msg
            ),
          }
        );
      }

      return { previousMessages };
    },
    onError: (_error, _variables, context) => {
      const ctx = context as
        | { previousMessages?: MessagesResponse }
        | undefined;
      if (ctx?.previousMessages) {
        queryClient.setQueryData(
          conversationKeys.messages(conversationId),
          ctx.previousMessages
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messages(conversationId),
      });
    },
  });
}

/**
 * Hook to soft-delete a message
 */
export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { messageId: string }>({
    mutationFn: async ({ messageId }) => {
      const response = await fetch(
        `/api/protected/conversations/${conversationId}/messages/${messageId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      return response.json();
    },
    onMutate: async ({ messageId }) => {
      await queryClient.cancelQueries({
        queryKey: conversationKeys.messages(conversationId),
      });

      const previousMessages = queryClient.getQueryData<MessagesResponse>(
        conversationKeys.messages(conversationId)
      );

      if (previousMessages) {
        queryClient.setQueryData<MessagesResponse>(
          conversationKeys.messages(conversationId),
          {
            ...previousMessages,
            messages: previousMessages.messages.map(msg =>
              msg.id === messageId
                ? {
                    ...msg,
                    isDeleted: true,
                    content: '',
                    reactions: undefined,
                    attachment: undefined,
                  }
                : msg
            ),
          }
        );
      }

      return { previousMessages };
    },
    onError: (_error, _variables, context) => {
      const ctx = context as
        | { previousMessages?: MessagesResponse }
        | undefined;
      if (ctx?.previousMessages) {
        queryClient.setQueryData(
          conversationKeys.messages(conversationId),
          ctx.previousMessages
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messages(conversationId),
      });
    },
  });
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
