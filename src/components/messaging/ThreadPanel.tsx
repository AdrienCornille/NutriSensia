'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, ChevronLeft, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { useThreadMessages } from '@/hooks/useThreadMessages';
import type { Message, MessageAttachment } from '@/types/messaging';

interface ThreadPanelProps {
  anchorMessageId: string;
  messages: Message[];
  onClose: () => void;
  onSendInThread: (content: string, replyToId: string) => void;
  onImageClick?: (attachment: MessageAttachment) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  isSending?: boolean;
  userBubbleVariant?: 'teal' | 'white';
}

export function ThreadPanel({
  anchorMessageId,
  messages,
  onClose,
  onSendInThread,
  onImageClick,
  onReaction,
  onEdit,
  onDelete,
  isSending = false,
  userBubbleVariant = 'teal',
}: ThreadPanelProps) {
  const { threadMessages, rootMessage, replyCount } = useThreadMessages(
    messages,
    anchorMessageId
  );

  const [threadInput, setThreadInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when thread messages change
  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, [threadMessages.length]);

  // Auto-focus textarea when panel opens
  useEffect(() => {
    // Small delay to let the animation start before focusing
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [anchorMessageId]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [threadInput]);

  const handleSend = useCallback(() => {
    if (!threadInput.trim() || isSending || !rootMessage) return;
    onSendInThread(threadInput.trim(), rootMessage.id);
    setThreadInput('');
  }, [threadInput, isSending, rootMessage, onSendInThread]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!rootMessage) return null;

  return (
    <AnimatePresence>
      {/* Desktop: side panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className='
          fixed inset-0 z-50 bg-white flex flex-col
          md:relative md:inset-auto md:z-auto
          md:w-[400px] md:min-w-[400px] md:border-l md:border-gray-200
        '
      >
        {/* Header */}
        <div className='flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200'>
          {/* Mobile back button */}
          <button
            onClick={onClose}
            className='md:hidden p-1.5 hover:bg-gray-200 rounded-lg transition-colors'
            aria-label='Fermer le fil'
          >
            <ChevronLeft className='w-5 h-5 text-gray-600' />
          </button>

          <MessageSquare className='w-5 h-5 text-[#1B998B] flex-shrink-0' />

          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-gray-800'>
              Fil de discussion
            </p>
            <p className='text-xs text-gray-500'>
              {replyCount} {replyCount <= 1 ? 'réponse' : 'réponses'}
            </p>
          </div>

          {/* Desktop close button */}
          <button
            onClick={onClose}
            className='hidden md:block p-1.5 hover:bg-gray-200 rounded-lg transition-colors'
            aria-label='Fermer le fil'
          >
            <X className='w-4 h-4 text-gray-500' />
          </button>
        </div>

        {/* Thread messages */}
        <div className='flex-1 overflow-y-auto px-4 py-4'>
          {threadMessages.map((msg, index) => (
            <div key={msg.id} id={`thread-msg-${msg.id}`}>
              {/* Show "root message" label for first message */}
              {index === 0 && (
                <div className='flex items-center gap-2 mb-2'>
                  <div className='h-px flex-1 bg-gray-200' />
                  <span className='text-[10px] uppercase tracking-wider text-gray-400 font-medium'>
                    Message original
                  </span>
                  <div className='h-px flex-1 bg-gray-200' />
                </div>
              )}

              {/* Show "replies" separator after root */}
              {index === 1 && (
                <div className='flex items-center gap-2 mb-2 mt-1'>
                  <div className='h-px flex-1 bg-[#1B998B]/20' />
                  <span className='text-[10px] uppercase tracking-wider text-[#1B998B] font-medium'>
                    {replyCount} {replyCount <= 1 ? 'réponse' : 'réponses'}
                  </span>
                  <div className='h-px flex-1 bg-[#1B998B]/20' />
                </div>
              )}

              <MessageBubble
                message={msg}
                onImageClick={onImageClick}
                onReaction={onReaction}
                onEdit={onEdit}
                onDelete={onDelete}
                userBubbleVariant={userBubbleVariant}
              />
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Thread input */}
        <div className='flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3'>
          <div className='flex items-end gap-2'>
            <div className='flex-1'>
              <textarea
                ref={textareaRef}
                value={threadInput}
                onChange={e => setThreadInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Répondre dans le fil...'
                rows={1}
                className='w-full px-4 py-2.5 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 text-sm placeholder-gray-400'
                disabled={isSending}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!threadInput.trim() || isSending}
              className={`p-2.5 rounded-full transition-colors ${
                threadInput.trim() && !isSending
                  ? 'bg-[#1B998B] text-white hover:bg-[#158578]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label='Envoyer dans le fil'
            >
              <Send className='w-5 h-5' />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ThreadPanel;
