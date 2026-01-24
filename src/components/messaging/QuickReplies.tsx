'use client';

import React from 'react';
import type { QuickReply } from '@/types/messaging';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (text: string) => void;
  selectedReply?: string | null;
}

/**
 * MSG-005: Quick Replies Component
 * Displays suggestion chips that users can tap to quickly insert common messages
 */
export function QuickReplies({ replies, onSelect, selectedReply }: QuickRepliesProps) {
  if (replies.length === 0) return null;

  return (
    <div className="px-4 py-2 bg-gray-50">
      <p className="text-xs text-gray-500 mb-2">Réponses rapides</p>
      <div className="flex flex-wrap gap-2">
        {replies.map((reply) => {
          const isSelected = selectedReply === reply.text;
          return (
            <button
              key={reply.id}
              onClick={() => onSelect(reply.text)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                isSelected
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              {reply.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickReplies;
