'use client';

import React, { useState, useDeferredValue, useCallback } from 'react';
import { Search, X, MessageCircle, ArrowRight } from 'lucide-react';
import { useSearchMessages } from '@/hooks/useConversations';
import type { MessageSearchResult } from '@/hooks/useConversations';
import { formatMessageDate } from '@/types/messaging';

interface SearchMessagesProps {
  onSelectResult: (result: MessageSearchResult, searchTerm: string) => void;
  onClose: () => void;
  conversationId?: string;
}

export function SearchMessages({
  onSelectResult,
  onClose,
  conversationId,
}: SearchMessagesProps) {
  const [inputValue, setInputValue] = useState('');
  const deferredQuery = useDeferredValue(inputValue);

  const { data, isLoading } = useSearchMessages(deferredQuery, conversationId);

  const results = data?.results || [];
  const total = data?.total || 0;

  const handleResultClick = useCallback(
    (result: MessageSearchResult) => {
      onSelectResult(result, deferredQuery);
      onClose();
    },
    [onSelectResult, onClose, deferredQuery]
  );

  return (
    <div className='flex flex-col h-full bg-white'>
      {/* Search header */}
      <div className='flex items-center gap-2 p-3 border-b border-gray-100'>
        <Search className='w-4 h-4 text-gray-400 flex-shrink-0' />
        <input
          type='text'
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder='Rechercher un mot ou début de mot...'
          className='flex-1 text-sm border-none outline-none bg-transparent placeholder-gray-400'
          autoFocus
        />
        {inputValue && (
          <button
            onClick={() => setInputValue('')}
            className='p-1 hover:bg-gray-100 rounded'
          >
            <X className='w-4 h-4 text-gray-400' />
          </button>
        )}
        <button
          onClick={onClose}
          className='text-xs text-gray-500 hover:text-gray-700 px-2 py-1'
        >
          Fermer
        </button>
      </div>

      {/* Results */}
      <div className='flex-1 overflow-y-auto'>
        {!deferredQuery || deferredQuery.length < 2 ? (
          <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
            <Search className='w-8 h-8 mb-2' />
            <p className='text-sm'>Tapez au moins 2 caractères</p>
          </div>
        ) : isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='w-5 h-5 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
          </div>
        ) : results.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
            <MessageCircle className='w-8 h-8 mb-2' />
            <p className='text-sm'>
              Aucun résultat pour &quot;{deferredQuery}&quot;
            </p>
          </div>
        ) : (
          <>
            <div className='px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100'>
              {total} résultat{total > 1 ? 's' : ''}
            </div>
            {results.map(result => (
              <button
                key={result.message_id}
                onClick={() => handleResultClick(result)}
                className='w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors'
              >
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs font-medium text-gray-700'>
                    {result.sender_name || 'Utilisateur'}
                  </span>
                  <span className='text-xs text-gray-400'>
                    {formatMessageDate(new Date(result.created_at))}
                  </span>
                </div>
                <p
                  className='text-sm text-gray-600 line-clamp-2 [&>mark]:bg-yellow-200 [&>mark]:text-gray-900 [&>mark]:rounded-sm [&>mark]:px-0.5'
                  dangerouslySetInnerHTML={{
                    __html: result.highlighted_content || result.content,
                  }}
                />
                {result.other_user_name && (
                  <div className='flex items-center gap-1 mt-1 text-xs text-gray-400'>
                    <ArrowRight className='w-3 h-3' />
                    Conversation avec {result.other_user_name}
                  </div>
                )}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchMessages;
