'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  MessagingHeader,
  MessagesList,
  MessageInput,
  QuickReplies,
  ImagePreviewModal,
  SearchMessages,
  ExportConversationButton,
  AttachmentPreview,
  ThreadPanel,
} from '@/components/messaging';
import { Search } from 'lucide-react';
import type { MessageAttachment } from '@/types/messaging';
import type { MessagesListHandle } from '@/components/messaging/MessagesList';
import { useAuth } from '@/contexts/AuthContext';
import {
  useConversations,
  useMessages,
  useQuickReplies,
  useSendMessage,
  useUploadAttachment,
  useRealtimeMessages,
  useHeartbeat,
  useUpdateTyping,
  useRealtimeTyping,
  useToggleReaction,
  useEditMessage,
  useDeleteMessage,
} from '@/hooks/useConversations';

export default function MessagingPage() {
  const { user } = useAuth();
  const currentUserId = user?.id || '';

  // ==================== DATA HOOKS ====================

  const {
    data: conversationsData,
    isLoading: loadingConversations,
    error: conversationsError,
  } = useConversations();

  // Patient has typically one conversation
  const conversation = conversationsData?.conversations?.[0] || null;
  const conversationId = conversation?.id || '';

  const { data: messagesData, isLoading: loadingMessages } =
    useMessages(conversationId);

  const { data: quickRepliesFromAPI } = useQuickReplies();

  const sendMutation = useSendMessage(conversationId);
  const uploadMutation = useUploadAttachment(conversationId);
  const reactionMutation = useToggleReaction(conversationId);
  const editMutation = useEditMessage(conversationId);
  const deleteMutation = useDeleteMessage(conversationId);

  // Typing indicator hooks
  const { onTypingChange } = useUpdateTyping(conversationId);
  const { isOtherTyping, typingUserName } = useRealtimeTyping(
    conversationId,
    currentUserId
  );

  // Auto-dismiss error toasts after 5 seconds
  useEffect(() => {
    if (sendMutation.isError) {
      const t = setTimeout(() => sendMutation.reset(), 5000);
      return () => clearTimeout(t);
    }
  }, [sendMutation.isError]);

  useEffect(() => {
    if (uploadMutation.isError) {
      const t = setTimeout(() => uploadMutation.reset(), 5000);
      return () => clearTimeout(t);
    }
  }, [uploadMutation.isError]);

  // Subscribe to Supabase Realtime for instant message delivery
  useRealtimeMessages(conversationId);

  // Send heartbeat to track online status
  useHeartbeat();

  // ==================== LOCAL UI STATE ====================

  const messagesListRef = useRef<MessagesListHandle>(null);
  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<MessageAttachment | null>(
    null
  );
  const [selectedQuickReply, setSelectedQuickReply] = useState<string | null>(
    null
  );
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    file: File;
    type: 'image' | 'document';
  } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [threadAnchorId, setThreadAnchorId] = useState<string | null>(null);

  // ==================== HANDLERS ====================

  // Handle sending a text message (MSG-001) or attachment with caption
  const handleSendMessage = useCallback(() => {
    const hasText = inputText.trim().length > 0;
    const hasAttachment = pendingAttachment !== null;

    if (!hasText && !hasAttachment) return;
    if (sendMutation.isPending || uploadMutation.isPending) return;

    // Edit mode: update existing message
    if (editingMessage && hasText) {
      editMutation.mutate(
        { messageId: editingMessage.id, content: inputText.trim() },
        {
          onSuccess: () => {
            setInputText('');
            setEditingMessage(null);
          },
        }
      );
      return;
    }

    setSelectedQuickReply(null);

    if (hasAttachment) {
      uploadMutation.mutate(
        {
          file: pendingAttachment.file,
          file_type: pendingAttachment.type,
          caption: hasText ? inputText.trim() : undefined,
        },
        {
          onSuccess: () => {
            setInputText('');
            setPendingAttachment(null);
          },
          onError: error => {
            console.error('Error uploading attachment:', error);
          },
        }
      );
    } else {
      sendMutation.mutate(
        { content: inputText.trim() },
        {
          onSuccess: () => {
            setInputText('');
          },
          onError: error => {
            console.error('Error sending message:', error);
          },
        }
      );
    }
  }, [
    inputText,
    pendingAttachment,
    sendMutation,
    uploadMutation,
    editingMessage,
    editMutation,
  ]);

  // Handle attachment selection
  const handleAttachmentSelect = useCallback(
    (file: File, type: 'image' | 'document') => {
      setShowAttachmentMenu(false);
      setPendingAttachment({ file, type });
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

  const handleReaction = useCallback(
    (messageId: string, emoji: string) => {
      reactionMutation.mutate({ messageId, emoji });
    },
    [reactionMutation]
  );

  const handleReply = useCallback((messageId: string) => {
    setThreadAnchorId(messageId);
    setEditingMessage(null);
  }, []);

  const handleEdit = useCallback((messageId: string, content: string) => {
    setEditingMessage({ id: messageId, content });
    setThreadAnchorId(null);
    setInputText(content);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setInputText('');
  }, []);

  const handleDelete = useCallback(
    (messageId: string) => {
      deleteMutation.mutate({ messageId });
    },
    [deleteMutation]
  );

  const handleOpenThread = useCallback((messageId: string) => {
    setThreadAnchorId(messageId);
  }, []);

  const handleCloseThread = useCallback(() => {
    setThreadAnchorId(null);
  }, []);

  const handleSendInThread = useCallback(
    (content: string, replyToId: string) => {
      sendMutation.mutate(
        {
          content,
          reply_to_id: replyToId,
          _replyTo: {
            id: replyToId,
            content: '',
            senderName: '',
            isFromUser: false,
          },
        },
        {
          onError: error => {
            console.error('Error sending thread message:', error);
          },
        }
      );
    },
    [sendMutation]
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
          <p className='text-gray-700 font-medium'>Erreur de chargement</p>
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
          <p className='text-gray-700 font-medium'>Aucune conversation</p>
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
      <div className='flex-shrink-0'>
        <DashboardHeader />
      </div>

      <div className='flex-shrink-0'>
        <MessagingHeader
          nutritionist={conversation.nutritionist}
          actions={
            <>
              <button
                onClick={() => setShowMessageSearch(true)}
                className='p-2 text-gray-400 hover:text-[#1B998B] hover:bg-[#1B998B]/5 rounded-lg transition-colors'
                title='Rechercher dans les messages'
              >
                <Search className='w-4 h-4' />
              </button>
              <ExportConversationButton conversationId={conversationId} />
            </>
          }
        />
      </div>

      <div className='flex-1 flex overflow-hidden'>
        <div className='flex-1 overflow-y-auto'>
          <MessagesList
            ref={messagesListRef}
            messages={messages}
            onImageClick={handleImageClick}
            onReaction={handleReaction}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenThread={handleOpenThread}
            isOtherTyping={isOtherTyping}
            typingUserName={typingUserName || conversation.nutritionist.name}
          />
        </div>

        {threadAnchorId && (
          <ThreadPanel
            anchorMessageId={threadAnchorId}
            messages={messages}
            onClose={handleCloseThread}
            onSendInThread={handleSendInThread}
            onImageClick={handleImageClick}
            onReaction={handleReaction}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isSending={sendMutation.isPending}
          />
        )}
      </div>

      <div className='flex-shrink-0 bg-white border-t border-gray-100 shadow-[0_-2px_4px_-2px_rgba(0,0,0,0.05)]'>
        {!editingMessage && (
          <QuickReplies
            replies={quickReplies}
            onSelect={handleQuickReplySelect}
            selectedReply={selectedQuickReply}
          />
        )}

        {pendingAttachment && (
          <AttachmentPreview
            file={pendingAttachment.file}
            fileType={pendingAttachment.type}
            onRemove={() => setPendingAttachment(null)}
          />
        )}

        <MessageInput
          value={inputText}
          onChange={handleInputChange}
          onSend={handleSendMessage}
          onAttachmentSelect={handleAttachmentSelect}
          showAttachmentMenu={showAttachmentMenu}
          onToggleAttachmentMenu={() => setShowAttachmentMenu(prev => !prev)}
          onCloseAttachmentMenu={() => setShowAttachmentMenu(false)}
          isSending={isSending}
          hasAttachment={!!pendingAttachment}
          onTypingChange={onTypingChange}
          editingMessage={editingMessage}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <ImagePreviewModal
        isOpen={showImagePreview}
        image={previewImage}
        onClose={() => {
          setShowImagePreview(false);
          setPreviewImage(null);
        }}
      />

      {showMessageSearch && (
        <div className='fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-16'>
          <div className='w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[70vh] flex flex-col overflow-hidden mx-4'>
            <SearchMessages
              onSelectResult={(result, searchTerm) => {
                setShowMessageSearch(false);
                requestAnimationFrame(() => {
                  messagesListRef.current?.scrollToMessage(
                    result.message_id,
                    searchTerm
                  );
                });
              }}
              onClose={() => setShowMessageSearch(false)}
              conversationId={conversationId || undefined}
            />
          </div>
        </div>
      )}

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
