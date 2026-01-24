'use client';

import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message, MessageAttachment } from '@/types/messaging';
import { groupMessagesByDate, formatMessageDate } from '@/types/messaging';

interface MessagesListProps {
  messages: Message[];
  onImageClick?: (attachment: MessageAttachment) => void;
}

export function MessagesList({ messages, onImageClick }: MessagesListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, [messages.length]);

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Aucun message</p>
          <p className="text-sm mt-1">Commencez la conversation avec votre nutritionniste</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {Array.from(groupedMessages.entries()).map(([dateKey, dayMessages]) => (
        <div key={dateKey}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              {formatMessageDate(dayMessages[0].timestamp)}
            </div>
          </div>

          {/* Messages for this day */}
          {dayMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onImageClick={onImageClick}
            />
          ))}
        </div>
      ))}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessagesList;
