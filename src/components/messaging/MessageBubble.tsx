'use client';

import React, { useState, useMemo } from 'react';
import {
  Check,
  CheckCheck,
  AlertCircle,
  Clock,
  FileText,
  FileEdit,
  ArrowRight,
  Reply,
} from 'lucide-react';
import type { Message, MessageAttachment } from '@/types/messaging';
import { formatMessageTime } from '@/types/messaging';
import { MessageReactions } from './MessageReactions';
import { MessageActionMenu } from './MessageActionMenu';

const EDIT_WINDOW_MINUTES = 15;

function highlightText(
  text: string,
  term: string,
  isFromUser: boolean
): React.ReactNode {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className={`rounded-sm px-0.5 ${
          isFromUser ? 'bg-white/30 text-white' : 'bg-yellow-200 text-gray-900'
        }`}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

interface MessageBubbleProps {
  message: Message;
  onImageClick?: (attachment: MessageAttachment) => void;
  highlightTerm?: string | null;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onOpenThread?: (messageId: string) => void;
  /** Style variant for the current user's bubbles. 'teal' (default, patient view) or 'white' (nutritionist view) */
  userBubbleVariant?: 'teal' | 'white';
}

export function MessageBubble({
  message,
  onImageClick,
  highlightTerm,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  onOpenThread,
  userBubbleVariant = 'teal',
}: MessageBubbleProps) {
  const {
    id,
    content,
    type,
    timestamp,
    isFromUser,
    status,
    attachment,
    planModification,
    reactions,
    editedAt,
    isDeleted,
    replyTo,
  } = message;

  const [showActionMenu, setShowActionMenu] = useState(false);

  // Check if message is within the 15-minute edit/delete window
  const canModify = useMemo(() => {
    if (!isFromUser) return false;
    const diffMinutes = (Date.now() - timestamp.getTime()) / 60000;
    return diffMinutes <= EDIT_WINDOW_MINUTES;
  }, [isFromUser, timestamp]);

  // Deleted message placeholder
  if (isDeleted) {
    return (
      <div
        className={`flex flex-col ${isFromUser ? 'items-end' : 'items-start'} mb-3`}
      >
        <div className='bg-gray-100 text-gray-400 rounded-2xl px-4 py-2.5 max-w-[85%] italic'>
          <p className='text-sm'>Ce message a été supprimé</p>
          <div
            className={`flex items-center mt-1 ${isFromUser ? 'justify-end' : 'justify-start'}`}
          >
            <span className='text-[11px] text-gray-300'>
              {formatMessageTime(timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // System message style
  if (type === 'system') {
    return (
      <div className='flex justify-center my-4'>
        <div className='bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full max-w-[85%] text-center'>
          {content}
        </div>
      </div>
    );
  }

  // Plan modification message (MSG-009)
  if (type === 'plan-modification') {
    const modData = planModification as Record<string, string> | undefined;
    const modStatus = modData?.status || 'pending';
    const statusBadge: Record<string, { label: string; color: string }> = {
      pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
      approved: { label: 'Approuvée', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
    };
    const badge = statusBadge[modStatus] || statusBadge.pending;

    return (
      <div
        className={`flex ${isFromUser ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div className='bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 max-w-[85%]'>
          <div className='flex items-center justify-between gap-2 mb-2'>
            <div className='flex items-center gap-2 text-amber-700 font-medium text-sm'>
              <FileEdit className='w-4 h-4' />
              {modData?.request_type_label || 'Demande de modification'}
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}
            >
              {badge.label}
            </span>
          </div>
          <p className='text-sm font-medium text-gray-800'>
            {modData?.title || content}
          </p>
          {modData?.description && (
            <p className='text-sm text-gray-600 mt-1'>{modData.description}</p>
          )}
          {modData?.suggested_alternative && (
            <div className='flex items-center gap-2 mt-2 text-sm'>
              <ArrowRight className='w-3 h-3 text-gray-400' />
              <span className='text-amber-700'>
                {modData.suggested_alternative}
              </span>
            </div>
          )}
          <div className='text-xs text-gray-400 mt-2'>
            {formatMessageTime(timestamp)}
          </div>
        </div>
      </div>
    );
  }

  // Regular message bubble
  const isWhiteVariant = isFromUser && userBubbleVariant === 'white';
  const bubbleClasses = isFromUser
    ? isWhiteVariant
      ? 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-br-sm'
      : 'bg-[#1B998B] text-white rounded-2xl rounded-br-sm'
    : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm';

  // Status indicator for sent messages (WhatsApp-style)
  const renderStatus = () => {
    if (!isFromUser) return null;

    switch (status) {
      case 'sending':
        return (
          <span className='flex items-center gap-1 text-gray-400'>
            <Clock className='w-3 h-3' />
            <span>Envoi...</span>
          </span>
        );
      case 'sent':
        return (
          <span className='flex items-center gap-1 text-gray-400'>
            <Check className='w-3 h-3' />
            <span>Envoyé</span>
          </span>
        );
      case 'delivered':
        return (
          <span className='flex items-center gap-1 text-gray-400'>
            <CheckCheck className='w-3 h-3' />
            <span>Distribué</span>
          </span>
        );
      case 'read':
        return (
          <span className='flex items-center gap-1 text-[#1B998B]'>
            <CheckCheck className='w-3 h-3' />
            <span>Lu</span>
          </span>
        );
      case 'error':
        return (
          <span className='flex items-center gap-1 text-red-500'>
            <AlertCircle className='w-3 h-3' />
            <span>Erreur</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex flex-col ${isFromUser ? 'items-end' : 'items-start'} mb-3`}
    >
      {/* Bubble with action menu trigger */}
      <div className='relative group max-w-[85%]'>
        <div
          className={`${bubbleClasses} px-4 py-2.5 w-fit cursor-pointer`}
          onContextMenu={e => {
            e.preventDefault();
            setShowActionMenu(true);
          }}
          onClick={() => {
            // On mobile, single tap opens menu (long press alternative)
            if ('ontouchstart' in window) {
              setShowActionMenu(true);
            }
          }}
          onDoubleClick={() => {
            if (!('ontouchstart' in window)) {
              setShowActionMenu(true);
            }
          }}
        >
          {/* Reply indicator — subtle link to open thread */}
          {replyTo && (
            <button
              onClick={e => {
                e.stopPropagation();
                if (onOpenThread) {
                  onOpenThread(id);
                } else {
                  const el = document.getElementById(`msg-${replyTo.id}`);
                  if (el)
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className={`inline-flex items-center gap-1 mb-1.5 text-[11px] whitespace-nowrap max-w-full ${
                isFromUser
                  ? isWhiteVariant
                    ? 'text-gray-400 hover:text-[#1B998B]'
                    : 'text-white/60 hover:text-white/80'
                  : 'text-gray-400 hover:text-[#1B998B]'
              } transition-colors`}
            >
              <Reply className='w-3 h-3 flex-shrink-0' />
              <span className='truncate'>
                En réponse à {replyTo.isFromUser ? 'vous' : replyTo.senderName}
              </span>
            </button>
          )}

          {/* Image attachment */}
          {type === 'image' && attachment && (
            <button
              onClick={e => {
                e.stopPropagation();
                onImageClick?.(attachment);
              }}
              className='block mb-2 -mx-2 -mt-1 rounded-xl overflow-hidden hover:opacity-90 transition-opacity'
            >
              <img
                src={attachment.thumbnailUrl || attachment.url}
                alt={attachment.name}
                className='w-full max-w-[240px] h-auto object-cover'
              />
            </button>
          )}

          {/* Document attachment */}
          {type === 'document' && attachment && (
            <a
              href={attachment.url}
              target='_blank'
              rel='noopener noreferrer'
              onClick={e => e.stopPropagation()}
              className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${
                isFromUser
                  ? isWhiteVariant
                    ? 'bg-gray-100 hover:bg-gray-200'
                    : 'bg-white/10 hover:bg-white/20'
                  : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
            >
              <FileText
                className={`w-5 h-5 ${isFromUser && !isWhiteVariant ? 'text-white' : 'text-gray-600'}`}
              />
              <span className='text-sm truncate'>{attachment.name}</span>
            </a>
          )}

          {/* Text content */}
          {content && (
            <p className='text-sm leading-relaxed whitespace-pre-wrap'>
              {highlightTerm
                ? highlightText(content, highlightTerm, isFromUser)
                : content}
            </p>
          )}

          {/* Timestamp + edited indicator inside bubble */}
          <div
            className={`flex items-center gap-1.5 mt-1 ${isFromUser ? 'justify-end' : 'justify-start'}`}
          >
            {editedAt && (
              <span
                className={`text-[11px] italic ${isFromUser && !isWhiteVariant ? 'text-white/50' : 'text-gray-400'}`}
              >
                (modifié)
              </span>
            )}
            <span
              className={`text-[11px] ${isFromUser && !isWhiteVariant ? 'text-white/60' : 'text-gray-400'}`}
            >
              {formatMessageTime(timestamp)}
            </span>
          </div>
        </div>

        {/* Action menu (reactions + edit/delete) */}
        <MessageActionMenu
          isOpen={showActionMenu}
          onClose={() => setShowActionMenu(false)}
          onReaction={
            !isFromUser ? emoji => onReaction?.(id, emoji) : undefined
          }
          onReply={onReply && !isDeleted ? () => onReply(id) : undefined}
          onEdit={onEdit ? () => onEdit(id, content) : undefined}
          onDelete={onDelete ? () => onDelete(id) : undefined}
          canEdit={canModify && type === 'text'}
          canDelete={canModify}
          isFromUser={isFromUser}
        />
      </div>

      {/* Reactions below bubble */}
      {reactions && reactions.length > 0 && (
        <MessageReactions
          reactions={reactions}
          onToggle={!isFromUser ? emoji => onReaction?.(id, emoji) : undefined}
          isFromUser={isFromUser}
        />
      )}

      {/* Status below bubble (sent messages only) */}
      {isFromUser && (
        <div className='text-[11px] mt-0.5 mr-1'>{renderStatus()}</div>
      )}
    </div>
  );
}

export default MessageBubble;
