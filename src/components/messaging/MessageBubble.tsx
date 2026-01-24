'use client';

import React from 'react';
import { Check, CheckCheck, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import type { Message, MessageAttachment } from '@/types/messaging';
import { formatMessageTime, messageStatusConfig } from '@/types/messaging';

interface MessageBubbleProps {
  message: Message;
  onImageClick?: (attachment: MessageAttachment) => void;
}

export function MessageBubble({ message, onImageClick }: MessageBubbleProps) {
  const { content, type, timestamp, isFromUser, status, attachment, planModification } = message;

  // System message style
  if (type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full max-w-[85%] text-center">
          {content}
        </div>
      </div>
    );
  }

  // Plan modification message
  if (type === 'plan-modification' && planModification) {
    return (
      <div className="flex justify-start mb-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 max-w-[85%]">
          <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm mb-2">
            <FileText className="w-4 h-4" />
            Modification du plan alimentaire
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{planModification.field}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-gray-500 line-through">{planModification.oldValue}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="text-emerald-700 font-medium">{planModification.newValue}</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {formatMessageTime(timestamp)}
          </div>
        </div>
      </div>
    );
  }

  // Regular message bubble
  const bubbleClasses = isFromUser
    ? 'bg-[#1B998B] text-white rounded-2xl rounded-br-md'
    : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md';

  const containerClasses = isFromUser ? 'justify-end' : 'justify-start';

  // Status icon for user messages - MSG-004
  const renderStatusIcon = () => {
    if (!isFromUser) return null;

    const statusInfo = messageStatusConfig[status];

    switch (status) {
      case 'sending':
        return (
          <span className="text-white/60 text-xs" title={statusInfo.label}>
            ○
          </span>
        );
      case 'sent':
        return (
          <span title={statusInfo.label}>
            <Check className="w-3.5 h-3.5 text-white/60" />
          </span>
        );
      case 'delivered':
        return (
          <span title={statusInfo.label}>
            <CheckCheck className="w-3.5 h-3.5 text-white/60" />
          </span>
        );
      case 'read':
        return (
          <span title={statusInfo.label}>
            <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
          </span>
        );
      case 'error':
        return (
          <span title={statusInfo.label}>
            <AlertCircle className="w-3.5 h-3.5 text-red-300" />
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${containerClasses} mb-3`}>
      <div className={`${bubbleClasses} px-4 py-2.5 max-w-[85%]`}>
        {/* Image attachment */}
        {type === 'image' && attachment && (
          <button
            onClick={() => onImageClick?.(attachment)}
            className="block mb-2 -mx-2 -mt-1 rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
          >
            <img
              src={attachment.thumbnailUrl || attachment.url}
              alt={attachment.name}
              className="w-full max-w-[240px] h-auto object-cover"
            />
          </button>
        )}

        {/* Document attachment */}
        {type === 'document' && attachment && (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${
              isFromUser ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'
            } transition-colors`}
          >
            <FileText className={`w-5 h-5 ${isFromUser ? 'text-white' : 'text-gray-600'}`} />
            <span className="text-sm truncate">{attachment.name}</span>
          </a>
        )}

        {/* Text content */}
        {content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>}

        {/* Timestamp and status */}
        <div className={`flex items-center gap-1 mt-1 ${isFromUser ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isFromUser ? 'text-white/60' : 'text-gray-400'}`}>
            {formatMessageTime(timestamp)}
          </span>
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
