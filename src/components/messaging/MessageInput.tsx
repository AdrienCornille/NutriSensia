'use client';

import React, { useRef, useEffect } from 'react';
import { Paperclip, Send, Smile } from 'lucide-react';
import { AttachmentMenu } from './AttachmentMenu';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttachmentSelect: (file: File, type: 'image' | 'document') => void;
  showAttachmentMenu: boolean;
  onToggleAttachmentMenu: () => void;
  onCloseAttachmentMenu: () => void;
  isSending: boolean;
  placeholder?: string;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  onAttachmentSelect,
  showAttachmentMenu,
  onToggleAttachmentMenu,
  onCloseAttachmentMenu,
  isSending,
  placeholder = 'Écrivez votre message...',
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isSending) {
        onSend();
      }
    }
  };

  const canSend = value.trim().length > 0 && !isSending;

  return (
    <div className='bg-white px-4 py-3'>
      <div className='flex items-end gap-2'>
        {/* Attachment button */}
        <div className='relative'>
          <button
            onClick={onToggleAttachmentMenu}
            className={`p-2 rounded-full transition-colors ${
              showAttachmentMenu
                ? 'bg-[#1B998B] text-white'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
            aria-label='Ajouter une pièce jointe'
            aria-expanded={showAttachmentMenu}
          >
            <Paperclip className='w-5 h-5' />
          </button>

          <AttachmentMenu
            isOpen={showAttachmentMenu}
            onClose={onCloseAttachmentMenu}
            onSelectFile={onAttachmentSelect}
          />
        </div>

        {/* Text input */}
        <div className='flex-1 relative'>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className='w-full px-4 py-2.5 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 text-sm placeholder-gray-400'
            disabled={isSending}
          />
        </div>

        {/* Emoji button (placeholder) */}
        <button
          className='p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors'
          aria-label='Ajouter un emoji'
        >
          <Smile className='w-5 h-5' />
        </button>

        {/* Send button */}
        <button
          onClick={onSend}
          disabled={!canSend}
          className={`p-2.5 rounded-full transition-colors ${
            canSend
              ? 'bg-[#1B998B] text-white hover:bg-[#158578]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label='Envoyer'
        >
          <Send className='w-5 h-5' />
        </button>
      </div>

      {/* Sending indicator */}
      {isSending && (
        <div className='text-xs text-gray-500 mt-2 text-center'>
          Envoi en cours...
        </div>
      )}
    </div>
  );
}

export default MessageInput;
