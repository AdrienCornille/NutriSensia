'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Paperclip, Send, Smile, X, Check, Reply } from 'lucide-react';
import dynamic from 'next/dynamic';
import data from '@emoji-mart/data';
import i18nFr from '@emoji-mart/data/i18n/fr.json';
import { AttachmentMenu } from './AttachmentMenu';

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false });

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttachmentSelect: (file: File, type: 'image' | 'document') => void;
  showAttachmentMenu: boolean;
  onToggleAttachmentMenu: () => void;
  onCloseAttachmentMenu: () => void;
  isSending: boolean;
  hasAttachment?: boolean;
  placeholder?: string;
  onTypingChange?: () => void;
  editingMessage?: { id: string; content: string } | null;
  onCancelEdit?: () => void;
  replyingTo?: { id: string; senderName: string; content: string } | null;
  onCancelReply?: () => void;
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
  hasAttachment = false,
  placeholder = 'Écrivez votre message...',
  onTypingChange,
  editingMessage,
  onCancelEdit,
  replyingTo,
  onCancelReply,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  // Focus textarea when entering edit or reply mode
  useEffect(() => {
    if ((editingMessage || replyingTo) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingMessage, replyingTo]);

  // Close emoji picker on click outside
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || hasAttachment) && !isSending) {
        onSend();
      }
    }
    if (e.key === 'Escape') {
      if (showEmojiPicker) {
        setShowEmojiPicker(false);
      } else if (editingMessage) {
        onCancelEdit?.();
      } else if (replyingTo) {
        onCancelReply?.();
      }
    }
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    onTypingChange?.();
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        value.substring(0, start) + emoji.native + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        const newPos = start + emoji.native.length;
        textarea.selectionStart = newPos;
        textarea.selectionEnd = newPos;
        textarea.focus();
      });
    } else {
      onChange(value + emoji.native);
    }
  };

  const canSend = (value.trim().length > 0 || hasAttachment) && !isSending;
  const isEditing = !!editingMessage;

  return (
    <div className='bg-white px-4 py-3'>
      {/* Reply banner */}
      {replyingTo && !isEditing && (
        <div className='flex items-center justify-between bg-gray-50 border-l-2 border-gray-400 px-3 py-2 mb-2 rounded-r-lg'>
          <div className='flex items-center gap-2 min-w-0'>
            <Reply className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />
            <div className='min-w-0'>
              <p className='text-xs font-medium text-[#1B998B]'>
                {replyingTo.senderName}
              </p>
              <p className='text-xs text-gray-500 truncate'>
                {replyingTo.content}
              </p>
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className='p-1 text-gray-400 hover:text-gray-600 rounded transition-colors flex-shrink-0'
            aria-label='Annuler la réponse'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        </div>
      )}

      {/* Editing banner */}
      {isEditing && (
        <div className='flex items-center justify-between bg-[#1B998B]/5 border-l-2 border-[#1B998B] px-3 py-2 mb-2 rounded-r-lg'>
          <div className='text-xs text-[#1B998B] font-medium'>
            Modification en cours
          </div>
          <button
            onClick={onCancelEdit}
            className='p-1 text-gray-400 hover:text-gray-600 rounded transition-colors'
            aria-label='Annuler la modification'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        </div>
      )}

      <div className='flex items-end gap-2'>
        {/* Attachment button (hidden during edit) */}
        {!isEditing && (
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
        )}

        {/* Text input */}
        <div className='flex-1 relative'>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isEditing ? 'Modifier le message...' : placeholder}
            rows={1}
            className='w-full px-4 py-2.5 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 text-sm placeholder-gray-400'
            disabled={isSending}
          />
        </div>

        {/* Emoji button + picker (hidden during edit) */}
        {!isEditing && (
          <div className='relative' ref={emojiPickerRef}>
            <button
              onClick={() => setShowEmojiPicker(prev => !prev)}
              className={`p-2 rounded-full transition-colors ${
                showEmojiPicker
                  ? 'bg-[#1B998B] text-white'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              aria-label='Ajouter un emoji'
              aria-expanded={showEmojiPicker}
            >
              <Smile className='w-5 h-5' />
            </button>

            {showEmojiPicker && (
              <div className='absolute bottom-12 right-0 z-50'>
                <Picker
                  data={data}
                  i18n={i18nFr}
                  onEmojiSelect={handleEmojiSelect}
                  locale='fr'
                  previewPosition='none'
                  searchPosition='none'
                  theme='light'
                  set='native'
                />
              </div>
            )}
          </div>
        )}

        {/* Send / Confirm button */}
        <button
          onClick={onSend}
          disabled={!canSend}
          className={`p-2.5 rounded-full transition-colors ${
            canSend
              ? 'bg-[#1B998B] text-white hover:bg-[#158578]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label={isEditing ? 'Confirmer la modification' : 'Envoyer'}
        >
          {isEditing ? (
            <Check className='w-5 h-5' />
          ) : (
            <Send className='w-5 h-5' />
          )}
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
