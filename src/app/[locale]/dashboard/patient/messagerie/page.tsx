'use client';

import React, { useState, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  MessagingHeader,
  MessagesList,
  MessageInput,
  QuickReplies,
  ImagePreviewModal,
} from '@/components/messaging';
import type { MessageAttachment } from '@/types/messaging';
import {
  useConversations,
  useMessages,
  useQuickReplies,
  useSendMessage,
  useUploadAttachment,
  useRealtimeMessages,
} from '@/hooks/useConversations';

export default function MessagingPage() {
  // ==================== DATA HOOKS ====================

  const {
    data: conversationsData,
    isLoading: loadingConversations,
    error: conversationsError,
  } = useConversations();

  // Patient has typically one conversation
  const conversation = conversationsData?.conversations?.[0] || null;
  const conversationId = conversation?.id || '';

  const {
    data: messagesData,
    isLoading: loadingMessages,
  } = useMessages(conversationId);

  const { data: quickRepliesFromAPI } = useQuickReplies();

  const sendMutation = useSendMessage(conversationId);
  const uploadMutation = useUploadAttachment(conversationId);

  // Subscribe to Supabase Realtime for instant message delivery
  useRealtimeMessages(conversationId);

  // ==================== LOCAL UI STATE ====================

  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<MessageAttachment | null>(
    null
  );
  const [selectedQuickReply, setSelectedQuickReply] = useState<string | null>(
    null
  );

  // ==================== HANDLERS ====================

  // Handle sending a text message (MSG-001)
  const handleSendMessage = useCallback(() => {
    if (!inputText.trim() || sendMutation.isPending) return;

    setSelectedQuickReply(null);

    sendMutation.mutate(
      { content: inputText.trim() },
      {
        onSuccess: () => {
          setInputText('');
        },
        onError: (error) => {
          console.error('Error sending message:', error);
        },
      }
    );
  }, [inputText, sendMutation]);

  // Handle attachment selection (MSG-002, MSG-003)
  const handleAttachmentSelect = useCallback(
    (file: File, type: 'image' | 'document') => {
      setShowAttachmentMenu(false);

      uploadMutation.mutate(
        { file, file_type: type },
        {
          onError: (error) => {
            console.error('Error uploading attachment:', error);
          },
        }
      );
    },
    [uploadMutation]
  );

  // Handle quick reply selection (MSG-005)
  const handleQuickReplySelect = useCallback((text: string) => {
    setInputText(text);
    setSelectedQuickReply(text);
  }, []);

  // Handle image click for preview
  const handleImageClick = useCallback((attachment: MessageAttachment) => {
    setPreviewImage(attachment);
    setShowImagePreview(true);
  }, []);

  // Handle input text change
  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text);
      // Clear quick reply selection if user modifies the text
      if (selectedQuickReply && text !== selectedQuickReply) {
        setSelectedQuickReply(null);
      }
    },
    [selectedQuickReply]
  );

  // ==================== LOADING & ERROR STATES ====================

  if (loadingConversations || (conversationId && loadingMessages)) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-500'>Chargement des messages...</p>
        </div>
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center max-w-md'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>!</span>
          </div>
          <p className='text-gray-700 font-medium'>
            Erreur de chargement
          </p>
          <p className='text-sm text-gray-500 mt-2'>
            {conversationsError.message}
          </p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center max-w-md'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>💬</span>
          </div>
          <p className='text-gray-700 font-medium'>
            Aucune conversation
          </p>
          <p className='text-sm text-gray-500 mt-2'>
            Votre conversation apparaîtra ici une fois qu&apos;un nutritionniste
            vous sera attribué.
          </p>
        </div>
      </div>
    );
  }

  const messages = messagesData?.messages || [];
  const quickReplies = quickRepliesFromAPI || [];
  const isSending = sendMutation.isPending || uploadMutation.isPending;

  // ==================== RENDER ====================

  return (
    <div className='h-screen bg-gray-50 flex flex-col overflow-hidden'>
      {/* Dashboard Header - Bonjour + Notifications */}
      <div className='flex-shrink-0'>
        <DashboardHeader />
      </div>

      {/* Header with nutritionist info (MSG-008) */}
      <div className='flex-shrink-0'>
        <MessagingHeader nutritionist={conversation.nutritionist} />
      </div>

      {/* Messages list (MSG-004 read indicators displayed) - scrollable area */}
      <div className='flex-1 overflow-y-auto'>
        <MessagesList messages={messages} onImageClick={handleImageClick} />
      </div>

      {/* Fixed bottom section */}
      <div className='flex-shrink-0 bg-white border-t border-gray-100 shadow-[0_-2px_4px_-2px_rgba(0,0,0,0.05)]'>
        {/* Quick replies (MSG-005) */}
        <QuickReplies
          replies={quickReplies}
          onSelect={handleQuickReplySelect}
          selectedReply={selectedQuickReply}
        />

        {/* Message input */}
        <MessageInput
          value={inputText}
          onChange={handleInputChange}
          onSend={handleSendMessage}
          onAttachmentSelect={handleAttachmentSelect}
          showAttachmentMenu={showAttachmentMenu}
          onToggleAttachmentMenu={() =>
            setShowAttachmentMenu(prev => !prev)
          }
          onCloseAttachmentMenu={() => setShowAttachmentMenu(false)}
          isSending={isSending}
        />
      </div>

      {/* Image preview modal */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        image={previewImage}
        onClose={() => {
          setShowImagePreview(false);
          setPreviewImage(null);
        }}
      />

      {/* Error toast for send failures */}
      {sendMutation.isError && (
        <div className='fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50'>
          {sendMutation.error.message}
        </div>
      )}
      {uploadMutation.isError && (
        <div className='fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50'>
          {uploadMutation.error.message}
        </div>
      )}
    </div>
  );
}
