'use client';

import React, { useState, useCallback } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import {
  MessagesList,
  MessageInput,
  QuickReplies,
  ImagePreviewModal,
} from '@/components/messaging';
import type { MessageAttachment } from '@/types/messaging';
import {
  useConversationByPatient,
  useMessages,
  useQuickReplies,
  useSendMessage,
  useUploadAttachment,
  useRealtimeMessages,
} from '@/hooks/useConversations';

interface PatientMessagesTabProps {
  /** patient_profiles.user_id (auth.users.id) - needed for conversation lookup */
  patientUserId: string;
  patientName: string;
}

export function PatientMessagesTab({
  patientUserId,
  patientName,
}: PatientMessagesTabProps) {
  // 1. Get/create conversation for this patient
  const {
    data: convData,
    isLoading: loadingConv,
    error: convError,
  } = useConversationByPatient(patientUserId);

  const conversationId = convData?.conversation_id || '';

  // 2. Messages & quick replies
  const { data: messagesData, isLoading: loadingMessages } =
    useMessages(conversationId);
  const { data: quickRepliesData } = useQuickReplies();

  // 3. Mutations
  const sendMutation = useSendMessage(conversationId);
  const uploadMutation = useUploadAttachment(conversationId);

  // 4. Realtime
  useRealtimeMessages(conversationId);

  // 5. Local UI state
  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<MessageAttachment | null>(
    null
  );
  const [selectedQuickReply, setSelectedQuickReply] = useState<string | null>(
    null
  );

  // Handlers
  const handleSendMessage = useCallback(() => {
    if (!inputText.trim() || sendMutation.isPending) return;
    setSelectedQuickReply(null);
    sendMutation.mutate(
      { content: inputText.trim() },
      { onSuccess: () => setInputText('') }
    );
  }, [inputText, sendMutation]);

  const handleAttachmentSelect = useCallback(
    (file: File, type: 'image' | 'document') => {
      setShowAttachmentMenu(false);
      uploadMutation.mutate({ file, file_type: type });
    },
    [uploadMutation]
  );

  const handleQuickReplySelect = useCallback((text: string) => {
    setInputText(text);
    setSelectedQuickReply(text);
  }, []);

  const handleImageClick = useCallback((attachment: MessageAttachment) => {
    setPreviewImage(attachment);
    setShowImagePreview(true);
  }, []);

  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text);
      if (selectedQuickReply && text !== selectedQuickReply) {
        setSelectedQuickReply(null);
      }
    },
    [selectedQuickReply]
  );

  // Loading
  if (loadingConv) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 flex items-center justify-center py-20'>
        <div className='text-center'>
          <Loader2 className='w-6 h-6 animate-spin text-[#1B998B] mx-auto mb-2' />
          <p className='text-sm text-gray-500'>
            Chargement de la conversation...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (convError) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
        <div className='w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
          <MessageCircle className='w-8 h-8 text-red-400' />
        </div>
        <p className='text-gray-800 font-medium mb-1'>Erreur de chargement</p>
        <p className='text-sm text-gray-500'>{convError.message}</p>
      </div>
    );
  }

  const messages = messagesData?.messages || [];
  const quickReplies = quickRepliesData || [];
  const isSending = sendMutation.isPending || uploadMutation.isPending;

  return (
    <div className='bg-white rounded-xl border border-gray-200 flex flex-col h-[calc(100vh-280px)] min-h-[400px]'>
      {/* Header */}
      <div className='px-4 py-3 border-b border-gray-100 flex items-center gap-3'>
        <div className='w-8 h-8 bg-[#1B998B]/10 rounded-full flex items-center justify-center'>
          <MessageCircle className='w-4 h-4 text-[#1B998B]' />
        </div>
        <div>
          <h3 className='text-sm font-semibold text-gray-800'>
            Conversation avec {patientName}
          </h3>
          <p className='text-xs text-gray-500'>
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto'>
        {loadingMessages ? (
          <div className='flex items-center justify-center h-full'>
            <div className='w-5 h-5 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
          </div>
        ) : messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-gray-400'>
            <MessageCircle className='w-10 h-10 mb-2' />
            <p className='text-sm'>Aucun message</p>
            <p className='text-xs mt-1'>Envoyez un message à {patientName}</p>
          </div>
        ) : (
          <MessagesList messages={messages} onImageClick={handleImageClick} />
        )}
      </div>

      {/* Input area */}
      <div className='flex-shrink-0 border-t border-gray-100'>
        <QuickReplies
          replies={quickReplies}
          onSelect={handleQuickReplySelect}
          selectedReply={selectedQuickReply}
        />
        <MessageInput
          value={inputText}
          onChange={handleInputChange}
          onSend={handleSendMessage}
          onAttachmentSelect={handleAttachmentSelect}
          showAttachmentMenu={showAttachmentMenu}
          onToggleAttachmentMenu={() => setShowAttachmentMenu(prev => !prev)}
          onCloseAttachmentMenu={() => setShowAttachmentMenu(false)}
          isSending={isSending}
        />
      </div>

      {/* Image preview */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        image={previewImage}
        onClose={() => {
          setShowImagePreview(false);
          setPreviewImage(null);
        }}
      />
    </div>
  );
}

export default PatientMessagesTab;
