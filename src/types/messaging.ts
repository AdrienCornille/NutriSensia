/**
 * Types pour la page Messagerie
 */

// ==================== ENUMS ====================

export type MessageType =
  | 'text'
  | 'image'
  | 'document'
  | 'system'
  | 'plan-modification';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';
export type NutritionistStatus = 'online' | 'offline' | 'busy';
export type AttachmentType = 'photo' | 'document' | 'camera';

// ==================== INTERFACES ====================

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
  thumbnailUrl?: string;
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  isFromUser: boolean;
  status: MessageStatus;
  attachment?: MessageAttachment;
  // For plan-modification type
  planModification?: {
    oldValue: string;
    newValue: string;
    field: string;
  };
}

export interface Nutritionist {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  status: NutritionistStatus;
  lastSeen?: Date;
  responseTime?: string;
}

export interface QuickReply {
  id: string;
  text: string;
  category?: 'greeting' | 'question' | 'confirmation' | 'general';
}

export interface Conversation {
  id: string;
  nutritionist: Nutritionist;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

// ==================== STATE ====================

export interface MessagingState {
  conversation: Conversation | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  inputText: string;
  showAttachmentMenu: boolean;
  showImagePreview: boolean;
  previewImage: MessageAttachment | null;
  selectedQuickReply: string | null;
}

export const initialMessagingState: MessagingState = {
  conversation: null,
  isLoading: false,
  isSending: false,
  error: null,
  inputText: '',
  showAttachmentMenu: false,
  showImagePreview: false,
  previewImage: null,
  selectedQuickReply: null,
};

// ==================== ACTIONS ====================

export type MessagingAction =
  | { type: 'SET_CONVERSATION'; conversation: Conversation }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_SENDING'; isSending: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_INPUT_TEXT'; text: string }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'UPDATE_MESSAGE_STATUS'; messageId: string; status: MessageStatus }
  | { type: 'TOGGLE_ATTACHMENT_MENU' }
  | { type: 'CLOSE_ATTACHMENT_MENU' }
  | { type: 'OPEN_IMAGE_PREVIEW'; image: MessageAttachment }
  | { type: 'CLOSE_IMAGE_PREVIEW' }
  | { type: 'SELECT_QUICK_REPLY'; text: string }
  | { type: 'CLEAR_QUICK_REPLY' };

// ==================== REDUCER ====================

export function messagingReducer(
  state: MessagingState,
  action: MessagingAction
): MessagingState {
  switch (action.type) {
    case 'SET_CONVERSATION':
      return {
        ...state,
        conversation: action.conversation,
        isLoading: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };

    case 'SET_SENDING':
      return {
        ...state,
        isSending: action.isSending,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false,
        isSending: false,
      };

    case 'SET_INPUT_TEXT':
      return {
        ...state,
        inputText: action.text,
      };

    case 'ADD_MESSAGE':
      if (!state.conversation) return state;
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: [...state.conversation.messages, action.message],
          lastMessage: action.message,
        },
        inputText: '',
        isSending: false,
      };

    case 'UPDATE_MESSAGE_STATUS':
      if (!state.conversation) return state;
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: state.conversation.messages.map(msg =>
            msg.id === action.messageId
              ? { ...msg, status: action.status }
              : msg
          ),
        },
      };

    case 'TOGGLE_ATTACHMENT_MENU':
      return {
        ...state,
        showAttachmentMenu: !state.showAttachmentMenu,
      };

    case 'CLOSE_ATTACHMENT_MENU':
      return {
        ...state,
        showAttachmentMenu: false,
      };

    case 'OPEN_IMAGE_PREVIEW':
      return {
        ...state,
        showImagePreview: true,
        previewImage: action.image,
      };

    case 'CLOSE_IMAGE_PREVIEW':
      return {
        ...state,
        showImagePreview: false,
        previewImage: null,
      };

    case 'SELECT_QUICK_REPLY':
      return {
        ...state,
        inputText: action.text,
        selectedQuickReply: action.text,
      };

    case 'CLEAR_QUICK_REPLY':
      return {
        ...state,
        selectedQuickReply: null,
      };

    default:
      return state;
  }
}

// ==================== CONFIGURATIONS ====================

export const messageStatusConfig: Record<
  MessageStatus,
  { icon: string; label: string }
> = {
  sending: { icon: '○', label: 'Envoi en cours' },
  sent: { icon: '✓', label: 'Envoyé' },
  delivered: { icon: '✓✓', label: 'Délivré' },
  read: { icon: '✓✓', label: 'Lu' },
  error: { icon: '!', label: 'Erreur' },
};

export const nutritionistStatusConfig: Record<
  NutritionistStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  online: {
    label: 'En ligne',
    dotColor: 'bg-green-500',
    textColor: 'text-green-600',
  },
  offline: {
    label: 'Hors ligne',
    dotColor: 'bg-gray-400',
    textColor: 'text-gray-500',
  },
  busy: {
    label: 'Occupé',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-600',
  },
};

export const attachmentTypeConfig: Record<
  AttachmentType,
  { icon: string; label: string; accept: string }
> = {
  photo: {
    icon: '📷',
    label: 'Photo',
    accept: 'image/*',
  },
  document: {
    icon: '📄',
    label: 'Document',
    accept: '.pdf,.doc,.docx,.txt',
  },
  camera: {
    icon: '📸',
    label: 'Appareil photo',
    accept: 'image/*',
  },
};

// ==================== HELPERS ====================

export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('fr-CH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMessageDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Hier';
  }

  return date.toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatLastSeen(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  return `Il y a ${diffDays} jours`;
}

export function groupMessagesByDate(
  messages: Message[]
): Map<string, Message[]> {
  const groups = new Map<string, Message[]>();

  messages.forEach(message => {
    const dateKey = message.timestamp.toDateString();
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, message]);
  });

  return groups;
}

// MSG-005: Default quick replies
export const defaultQuickReplies: QuickReply[] = [
  { id: 'qr-1', text: 'Bonjour !', category: 'greeting' },
  { id: 'qr-2', text: 'Merci beaucoup', category: 'confirmation' },
  { id: 'qr-3', text: "J'ai une question", category: 'question' },
  { id: 'qr-4', text: "D'accord, je comprends", category: 'confirmation' },
  { id: 'qr-5', text: "Pouvez-vous m'expliquer ?", category: 'question' },
  { id: 'qr-6', text: 'À bientôt !', category: 'greeting' },
];
