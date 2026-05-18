'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MessageCircle, Search, ChevronLeft } from 'lucide-react';
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
import type { MessageAttachment, Conversation } from '@/types/messaging';
import type { MessagesListHandle } from '@/components/messaging/MessagesList';
import type { MessageSearchResult } from '@/hooks/useConversations';
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

// ==================== CONVERSATION LIST ITEM ====================

function ConversationListItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: Omit<Conversation, 'messages'>;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { nutritionist, lastMessage, unreadCount } = conversation;
  const lastMessageTime = lastMessage?.timestamp
    ? formatRelativeTime(lastMessage.timestamp)
    : '';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 ${
        isSelected
          ? 'bg-[#1B998B]/5 border-l-2 border-l-[#1B998B]'
          : 'hover:bg-gray-50'
      }`}
    >
      {/* Avatar */}
      <div className='w-12 h-12 rounded-full bg-[#1B998B]/10 flex items-center justify-center flex-shrink-0'>
        {nutritionist.avatarUrl ? (
          <img
            src={nutritionist.avatarUrl}
            alt={nutritionist.name}
            className='w-12 h-12 rounded-full object-cover'
          />
        ) : (
          <span className='text-sm font-semibold text-[#1B998B]'>
            {nutritionist.initials}
          </span>
        )}
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between'>
          <p
            className={`text-sm truncate ${
              unreadCount > 0
                ? 'font-semibold text-gray-900'
                : 'font-medium text-gray-800'
            }`}
          >
            {nutritionist.name}
          </p>
          {lastMessageTime && (
            <span className='text-xs text-gray-400 flex-shrink-0 ml-2'>
              {lastMessageTime}
            </span>
          )}
        </div>
        {lastMessage && (
          <div className='flex items-center justify-between mt-0.5'>
            <p
              className={`text-xs truncate ${
                unreadCount > 0 ? 'text-gray-700' : 'text-gray-500'
              }`}
            >
              {lastMessage.content}
            </p>
            {unreadCount > 0 && (
              <span className='ml-2 flex-shrink-0 w-5 h-5 bg-[#1B998B] text-white text-xs font-bold rounded-full flex items-center justify-center'>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== HELPERS ====================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ==================== MAIN PAGE ====================

export default function NutritionistMessagingPage() {
  const { user } = useAuth();
  const currentUserId = user?.id || '';

  // ==================== DATA HOOKS ====================

  // Send heartbeat to track online status (MSG-008)
  useHeartbeat();

  const {
    data: conversationsData,
    isLoading: loadingConversations,
    error: conversationsError,
  } = useConversations();

  const conversations = conversationsData?.conversations || [];

  // ==================== LOCAL STATE ====================

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  // ==================== SELECTED CONVERSATION HOOKS ====================

  const selectedConversation = conversations.find(
    c => c.id === selectedConversationId
  );

  const { data: messagesData, isLoading: loadingMessages } = useMessages(
    selectedConversationId || ''
  );

  const { data: quickRepliesFromAPI } = useQuickReplies();

  const sendMutation = useSendMessage(selectedConversationId || '');
  const uploadMutation = useUploadAttachment(selectedConversationId || '');
  const reactionMutation = useToggleReaction(selectedConversationId || '');
  const editMutation = useEditMessage(selectedConversationId || '');
  const deleteMutation = useDeleteMessage(selectedConversationId || '');

  // Typing indicator hooks
  const { onTypingChange } = useUpdateTyping(selectedConversationId || '');
  const { isOtherTyping, typingUserName } = useRealtimeTyping(
    selectedConversationId || '',
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
  useRealtimeMessages(selectedConversationId || '');

  // ==================== FILTERED CONVERSATIONS ====================

  const filteredConversations = searchQuery
    ? conversations.filter(c =>
        c.nutritionist.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  // ==================== HANDLERS ====================

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
    setInputText('');
    setSelectedQuickReply(null);
    setShowAttachmentMenu(false);
    setPendingAttachment(null);
    setShowMessageSearch(false);
    setEditingMessage(null);
    setThreadAnchorId(null);
  }, []);

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

  const handleAttachmentSelect = useCallback(
    (file: File, type: 'image' | 'document') => {
      setShowAttachmentMenu(false);
      setPendingAttachment({ file, type });
    },
    []
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

  const handleBack = useCallback(() => {
    setSelectedConversationId(null);
  }, []);

  const handleSearchResult = useCallback(
    (result: MessageSearchResult, searchTerm: string) => {
      setShowMessageSearch(false);
      requestAnimationFrame(() => {
        setTimeout(() => {
          messagesListRef.current?.scrollToMessage(
            result.message_id,
            searchTerm
          );
        }, 100);
      });
    },
    []
  );

  // ==================== LOADING STATE ====================

  if (loadingConversations) {
    return (
      <div className='h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-500'>Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className='h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100'>
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

  const messages = messagesData?.messages || [];
  const quickReplies = quickRepliesFromAPI || [];
  const isSending = sendMutation.isPending || uploadMutation.isPending;

  // ==================== RENDER ====================

  return (
    <div className='h-screen flex bg-gray-100'>
      {/* Left sidebar: Conversation list */}
      <div
        className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col ${
          selectedConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className='p-4 border-b border-gray-100'>
          <div className='flex items-center justify-between mb-3'>
            <h1 className='text-lg font-semibold text-gray-800'>Messagerie</h1>
          </div>
          {/* Patient search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Rechercher un patient...'
              className='w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent'
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className='flex-1 overflow-y-auto'>
          {filteredConversations.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 px-4'>
              <MessageCircle className='w-12 h-12 text-gray-300 mb-3' />
              <p className='text-gray-500 text-sm text-center'>
                {searchQuery ? 'Aucun patient trouvé' : 'Aucune conversation'}
              </p>
              {!searchQuery && (
                <p className='text-gray-400 text-xs text-center mt-1'>
                  Les conversations avec vos patients apparaîtront ici
                </p>
              )}
            </div>
          ) : (
            filteredConversations.map(conv => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === selectedConversationId}
                onClick={() => handleSelectConversation(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right panel: Selected conversation */}
      <div
        className={`flex-1 flex flex-col bg-white ${
          selectedConversationId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Mobile back button + Header */}
            <div className='flex-shrink-0'>
              <div className='md:hidden flex items-center p-2 bg-white border-b border-gray-100'>
                <button
                  onClick={handleBack}
                  className='p-2 hover:bg-gray-100 rounded-lg'
                >
                  <ChevronLeft className='w-5 h-5 text-gray-600' />
                </button>
              </div>
              <MessagingHeader
                nutritionist={selectedConversation.nutritionist}
                participantRole='patient'
                actions={
                  <div className='flex items-center gap-1'>
                    <button
                      onClick={() => setShowMessageSearch(true)}
                      className='p-2 text-gray-400 hover:text-[#1B998B] hover:bg-[#1B998B]/5 rounded-lg transition-colors'
                      title='Rechercher dans la conversation'
                    >
                      <Search className='w-4 h-4' />
                    </button>
                    <ExportConversationButton
                      conversationId={selectedConversationId || ''}
                    />
                  </div>
                }
              />
            </div>

            {/* Messages + Thread panel */}
            <div className='flex-1 flex overflow-hidden'>
              <div className='flex-1 overflow-y-auto'>
                {loadingMessages ? (
                  <div className='flex items-center justify-center h-full'>
                    <div className='w-6 h-6 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
                  </div>
                ) : (
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
                    typingUserName={
                      typingUserName || selectedConversation.nutritionist.name
                    }
                  />
                )}
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

            {/* Input area */}
            <div className='flex-shrink-0 bg-white border-t border-gray-100'>
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
                onToggleAttachmentMenu={() =>
                  setShowAttachmentMenu(prev => !prev)
                }
                onCloseAttachmentMenu={() => setShowAttachmentMenu(false)}
                isSending={isSending}
                hasAttachment={!!pendingAttachment}
                onTypingChange={onTypingChange}
                editingMessage={editingMessage}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          </>
        ) : (
          /* Empty state */
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <MessageCircle className='w-16 h-16 text-gray-200 mx-auto mb-4' />
              <p className='text-gray-500 font-medium'>
                Sélectionnez une conversation
              </p>
              <p className='text-sm text-gray-400 mt-1'>
                Choisissez un patient pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message search overlay (MSG-N-006) */}
      {showMessageSearch && (
        <div className='fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-16'>
          <div className='w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[70vh] flex flex-col overflow-hidden'>
            <SearchMessages
              onSelectResult={handleSearchResult}
              onClose={() => setShowMessageSearch(false)}
              conversationId={selectedConversationId || undefined}
            />
          </div>
        </div>
      )}

      {/* Image preview modal */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        image={previewImage}
        onClose={() => {
          setShowImagePreview(false);
          setPreviewImage(null);
        }}
      />

      {/* Error toasts */}
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
