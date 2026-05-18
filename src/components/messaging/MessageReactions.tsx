'use client';

import React from 'react';
import type { MessageReaction } from '@/types/messaging';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onToggle?: (emoji: string) => void;
  isFromUser: boolean;
}

export function MessageReactions({
  reactions,
  onToggle,
  isFromUser,
}: MessageReactionsProps) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap gap-1 mt-1 ${isFromUser ? 'justify-end' : 'justify-start'}`}
    >
      {reactions.map(reaction => (
        <button
          key={reaction.emoji}
          onClick={() => onToggle?.(reaction.emoji)}
          disabled={!onToggle}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border ${
            reaction.hasReacted
              ? 'bg-[#1B998B]/10 border-[#1B998B]/30 text-[#1B998B]'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          } ${!onToggle ? 'cursor-default' : ''}`}
        >
          <span>{reaction.emoji}</span>
          <span className='font-medium'>{reaction.count}</span>
        </button>
      ))}
    </div>
  );
}

export default MessageReactions;
