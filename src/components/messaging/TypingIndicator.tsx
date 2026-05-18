'use client';

import React from 'react';

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string | null;
}

export function TypingIndicator({ isTyping, userName }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className='flex items-center gap-2 px-4 py-2'>
      <div className='flex items-center gap-1'>
        <span className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]' />
        <span className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]' />
        <span className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]' />
      </div>
      <span className='text-xs text-gray-500 italic'>
        {userName || "L'interlocuteur"} est en train d&apos;écrire...
      </span>
    </div>
  );
}

export default TypingIndicator;
