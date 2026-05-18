'use client';

import React, { useRef, useEffect } from 'react';
import { Pencil, Trash2, Reply } from 'lucide-react';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface MessageActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onReaction?: (emoji: string) => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit: boolean;
  canDelete: boolean;
  isFromUser: boolean;
}

export function MessageActionMenu({
  isOpen,
  onClose,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  isFromUser,
}: MessageActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const hasAnyAction =
    !!onReaction || !!onReply || (canEdit && onEdit) || (canDelete && onDelete);
  if (!isOpen || !hasAnyAction) return null;

  return (
    <div
      ref={menuRef}
      className={`absolute z-40 bg-white rounded-xl shadow-lg border border-gray-200 py-2 px-2 ${
        isFromUser ? 'right-0' : 'left-0'
      } bottom-full mb-1`}
    >
      {/* Emoji row (only for messages from contact, not own messages) */}
      {onReaction && (
        <div className='flex items-center gap-1 px-1 pb-2'>
          {REACTION_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => {
                onReaction(emoji);
                onClose();
              }}
              className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-lg'
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      {(onReply || (canEdit && onEdit) || (canDelete && onDelete)) && (
        <div className={`${onReaction ? 'border-t border-gray-100' : ''} pt-1`}>
          {onReply && (
            <button
              onClick={() => {
                onReply();
                onClose();
              }}
              className='flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
            >
              <Reply className='w-3.5 h-3.5' />
              Répondre
            </button>
          )}
          {canEdit && onEdit && (
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className='flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
            >
              <Pencil className='w-3.5 h-3.5' />
              Modifier
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className='flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors'
            >
              <Trash2 className='w-3.5 h-3.5' />
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MessageActionMenu;
