'use client';

import React, { useReducer, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  MessagingHeader,
  MessagesList,
  MessageInput,
  QuickReplies,
  ImagePreviewModal,
} from '@/components/messaging';
import {
  messagingReducer,
  initialMessagingState,
} from '@/types/messaging';
import type { MessageAttachment } from '@/types/messaging';
import {
  getConversation,
  getQuickReplies,
  sendMessage,
  sendImageMessage,
  sendDocumentMessage,
  updateMessageStatus,
  simulateNutritionistResponse,
} from '@/data/mock-messaging';

export default function MessagingPage() {
  const [state, dispatch] = useReducer(messagingReducer, initialMessagingState);
  const quickReplies = getQuickReplies();

  // Load conversation on mount
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    // Simulate API call
    setTimeout(() => {
      const conversation = getConversation();
      dispatch({ type: 'SET_CONVERSATION', conversation });
    }, 500);
  }, []);

  // Handle sending a text message (MSG-001)
  const handleSendMessage = useCallback(() => {
    if (!state.inputText.trim() || state.isSending) return;

    dispatch({ type: 'SET_SENDING', isSending: true });
    dispatch({ type: 'CLEAR_QUICK_REPLY' });

    // Create and add message
    const message = sendMessage(state.inputText.trim());
    dispatch({ type: 'ADD_MESSAGE', message });

    // Simulate message being sent -> delivered -> read
    setTimeout(() => {
      updateMessageStatus(message.id, 'sent');
      dispatch({ type: 'UPDATE_MESSAGE_STATUS', messageId: message.id, status: 'sent' });
    }, 500);

    setTimeout(() => {
      updateMessageStatus(message.id, 'delivered');
      dispatch({ type: 'UPDATE_MESSAGE_STATUS', messageId: message.id, status: 'delivered' });
    }, 1500);

    setTimeout(() => {
      updateMessageStatus(message.id, 'read');
      dispatch({ type: 'UPDATE_MESSAGE_STATUS', messageId: message.id, status: 'read' });
    }, 3000);

    // Simulate nutritionist response (for demo)
    setTimeout(() => {
      const response = simulateNutritionistResponse();
      dispatch({ type: 'ADD_MESSAGE', message: response });
    }, 5000);
  }, [state.inputText, state.isSending]);

  // Handle attachment selection (MSG-002, MSG-003)
  const handleAttachmentSelect = useCallback((file: File, type: 'image' | 'document') => {
    dispatch({ type: 'SET_SENDING', isSending: true });
    dispatch({ type: 'CLOSE_ATTACHMENT_MENU' });

    let message;
    if (type === 'image') {
      message = sendImageMessage(file);
    } else {
      message = sendDocumentMessage(file);
    }

    dispatch({ type: 'ADD_MESSAGE', message });

    // Simulate upload progress
    setTimeout(() => {
      updateMessageStatus(message.id, 'sent');
      dispatch({ type: 'UPDATE_MESSAGE_STATUS', messageId: message.id, status: 'sent' });
    }, 1000);

    setTimeout(() => {
      updateMessageStatus(message.id, 'delivered');
      dispatch({ type: 'UPDATE_MESSAGE_STATUS', messageId: message.id, status: 'delivered' });
    }, 2000);
  }, []);

  // Handle quick reply selection (MSG-005)
  const handleQuickReplySelect = useCallback((text: string) => {
    dispatch({ type: 'SELECT_QUICK_REPLY', text });
  }, []);

  // Handle image click for preview
  const handleImageClick = useCallback((attachment: MessageAttachment) => {
    dispatch({ type: 'OPEN_IMAGE_PREVIEW', image: attachment });
  }, []);

  // Handle input text change
  const handleInputChange = useCallback((text: string) => {
    dispatch({ type: 'SET_INPUT_TEXT', text });
    // Clear quick reply selection if user modifies the text
    if (state.selectedQuickReply && text !== state.selectedQuickReply) {
      dispatch({ type: 'CLEAR_QUICK_REPLY' });
    }
  }, [state.selectedQuickReply]);

  // Loading state
  if (state.isLoading || !state.conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Dashboard Header - Bonjour + Notifications */}
      <div className="flex-shrink-0">
        <DashboardHeader />
      </div>

      {/* Header with nutritionist info (MSG-008) */}
      <div className="flex-shrink-0">
        <MessagingHeader nutritionist={state.conversation.nutritionist} />
      </div>

      {/* Messages list (MSG-004 read indicators displayed) - scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <MessagesList
          messages={state.conversation.messages}
          onImageClick={handleImageClick}
        />
      </div>

      {/* Fixed bottom section */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 shadow-[0_-2px_4px_-2px_rgba(0,0,0,0.05)]">
        {/* Quick replies (MSG-005) */}
        <QuickReplies
          replies={quickReplies}
          onSelect={handleQuickReplySelect}
          selectedReply={state.selectedQuickReply}
        />

        {/* Message input */}
        <MessageInput
          value={state.inputText}
          onChange={handleInputChange}
          onSend={handleSendMessage}
          onAttachmentSelect={handleAttachmentSelect}
          showAttachmentMenu={state.showAttachmentMenu}
          onToggleAttachmentMenu={() => dispatch({ type: 'TOGGLE_ATTACHMENT_MENU' })}
          onCloseAttachmentMenu={() => dispatch({ type: 'CLOSE_ATTACHMENT_MENU' })}
          isSending={state.isSending}
        />
      </div>

      {/* Image preview modal */}
      <ImagePreviewModal
        isOpen={state.showImagePreview}
        image={state.previewImage}
        onClose={() => dispatch({ type: 'CLOSE_IMAGE_PREVIEW' })}
      />
    </div>
  );
}
