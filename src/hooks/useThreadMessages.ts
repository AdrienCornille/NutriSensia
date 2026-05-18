'use client';

import { useMemo } from 'react';
import type { Message } from '@/types/messaging';
import {
  getThreadRootId,
  buildThreadMessages,
  getReplyCountMap,
} from '@/types/messaging';

/**
 * Hook to compute thread data from a flat message list.
 * Pure computation — no API calls.
 */
export function useThreadMessages(
  messages: Message[],
  anchorMessageId: string | null
) {
  const { threadMessages, rootMessage } = useMemo(() => {
    if (!anchorMessageId) {
      return { threadMessages: [], rootMessage: null };
    }

    const rootId = getThreadRootId(messages, anchorMessageId);
    const thread = buildThreadMessages(messages, rootId);
    const root = messages.find(m => m.id === rootId) || null;

    return { threadMessages: thread, rootMessage: root };
  }, [messages, anchorMessageId]);

  const replyCount = threadMessages.length > 0 ? threadMessages.length - 1 : 0;

  return { threadMessages, rootMessage, replyCount };
}

/**
 * Hook to compute reply counts for all messages.
 */
export function useReplyCountMap(messages: Message[]) {
  return useMemo(() => getReplyCountMap(messages), [messages]);
}
