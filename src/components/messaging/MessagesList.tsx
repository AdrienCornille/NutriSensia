'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
} from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Message, MessageAttachment } from '@/types/messaging';
import { groupMessagesByDate, formatMessageDate } from '@/types/messaging';

export interface MessagesListHandle {
  scrollToMessage: (messageId: string, searchTerm?: string) => void;
}

interface MessagesListProps {
  messages: Message[];
  onImageClick?: (attachment: MessageAttachment) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onOpenThread?: (messageId: string) => void;
  isOtherTyping?: boolean;
  typingUserName?: string | null;
  userBubbleVariant?: 'teal' | 'white';
}

export const MessagesList = React.forwardRef<
  MessagesListHandle,
  MessagesListProps
>(function MessagesList(
  {
    messages,
    onImageClick,
    onReaction,
    onReply,
    onEdit,
    onDelete,
    onOpenThread,
    isOtherTyping,
    typingUserName,
    userBubbleVariant,
  },
  ref
) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [highlightTerm, setHighlightTerm] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive or typing indicator appears
  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, [messages.length, isOtherTyping]);

  const scrollToMessage = useCallback(
    (messageId: string, searchTerm?: string) => {
      const el = document.getElementById(`msg-${messageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedId(messageId);
        setHighlightTerm(searchTerm || null);
        setTimeout(() => {
          setHighlightedId(null);
          setHighlightTerm(null);
        }, 3000);
      }
    },
    []
  );

  useImperativeHandle(ref, () => ({ scrollToMessage }), [scrollToMessage]);

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className='flex items-center justify-center p-8 h-full'>
        <div className='text-center text-gray-500'>
          <p className='text-lg font-medium'>Aucun message</p>
          <p className='text-sm mt-1'>
            Commencez la conversation avec votre nutritionniste
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='px-4 py-4'>
      {Array.from(groupedMessages.entries()).map(([dateKey, dayMessages]) => (
        <div key={dateKey}>
          {/* Date separator */}
          <div className='flex items-center justify-center my-4'>
            <div className='bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full'>
              {formatMessageDate(dayMessages[0].timestamp)}
            </div>
          </div>

          {/* Messages for this day */}
          {dayMessages.map(message => (
            <div key={message.id} id={`msg-${message.id}`}>
              <MessageBubble
                message={message}
                onImageClick={onImageClick}
                highlightTerm={
                  highlightedId === message.id ? highlightTerm : null
                }
                onReaction={onReaction}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onOpenThread={onOpenThread}
                userBubbleVariant={userBubbleVariant}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Typing indicator */}
      <TypingIndicator isTyping={!!isOtherTyping} userName={typingUserName} />

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
});

export default MessagesList;
