/**
 * Mock data pour la page Messagerie
 */

import type {
  Message,
  Nutritionist,
  Conversation,
  QuickReply,
  MessageStatus,
} from '@/types/messaging';
import { defaultQuickReplies } from '@/types/messaging';

// ==================== NUTRITIONIST ====================

const mockNutritionist: Nutritionist = {
  id: 'nutri-1',
  name: 'Lucie Martin',
  initials: 'LM',
  status: 'online',
  lastSeen: new Date(),
  responseTime: 'Répond généralement en 2h',
};

// ==================== MESSAGES ====================

const mockMessages: Message[] = [
  // Day 1 - Initial conversation
  {
    id: 'msg-1',
    content: 'Bienvenue dans votre espace de messagerie NutriSensia ! Je suis Lucie Martin, votre nutritionniste. N\'hésitez pas à me poser vos questions.',
    type: 'system',
    timestamp: new Date('2026-01-15T09:00:00'),
    isFromUser: false,
    status: 'read',
  },
  {
    id: 'msg-2',
    content: 'Bonjour Lucie ! Merci pour la première consultation. J\'ai une question sur le petit-déjeuner recommandé.',
    type: 'text',
    timestamp: new Date('2026-01-15T10:30:00'),
    isFromUser: true,
    status: 'read',
  },
  {
    id: 'msg-3',
    content: 'Bonjour ! Bien sûr, je vous écoute. Quelle est votre question concernant le petit-déjeuner ?',
    type: 'text',
    timestamp: new Date('2026-01-15T11:15:00'),
    isFromUser: false,
    status: 'read',
  },
  {
    id: 'msg-4',
    content: 'Est-ce que je peux remplacer le yaourt grec par du fromage blanc ? Je n\'aime pas trop le yaourt.',
    type: 'text',
    timestamp: new Date('2026-01-15T11:20:00'),
    isFromUser: true,
    status: 'read',
  },
  {
    id: 'msg-5',
    content: 'Tout à fait ! Le fromage blanc est une excellente alternative. Optez pour du fromage blanc à 3% de matières grasses. Les apports en protéines sont similaires.',
    type: 'text',
    timestamp: new Date('2026-01-15T11:45:00'),
    isFromUser: false,
    status: 'read',
  },

  // Day 2 - Photo exchange
  {
    id: 'msg-6',
    content: 'Voici ma préparation du déjeuner aujourd\'hui !',
    type: 'text',
    timestamp: new Date('2026-01-16T12:30:00'),
    isFromUser: true,
    status: 'read',
  },
  {
    id: 'msg-7',
    content: '',
    type: 'image',
    timestamp: new Date('2026-01-16T12:31:00'),
    isFromUser: true,
    status: 'read',
    attachment: {
      id: 'att-1',
      type: 'image',
      url: '/images/mock/meal-example.jpg',
      name: 'dejeuner.jpg',
      thumbnailUrl: '/images/mock/meal-example-thumb.jpg',
    },
  },
  {
    id: 'msg-8',
    content: 'Superbe ! C\'est exactement ce type de repas équilibré que je recommande. Belles proportions de légumes et la protéine est bien présente. 👏',
    type: 'text',
    timestamp: new Date('2026-01-16T14:00:00'),
    isFromUser: false,
    status: 'read',
  },

  // Day 3 - Plan modification
  {
    id: 'msg-9',
    content: 'Suite à notre échange, j\'ai ajusté votre plan alimentaire.',
    type: 'text',
    timestamp: new Date('2026-01-20T09:00:00'),
    isFromUser: false,
    status: 'read',
  },
  {
    id: 'msg-10',
    content: 'Modification du plan alimentaire',
    type: 'plan-modification',
    timestamp: new Date('2026-01-20T09:01:00'),
    isFromUser: false,
    status: 'read',
    planModification: {
      field: 'Petit-déjeuner',
      oldValue: 'Yaourt grec 150g + fruits',
      newValue: 'Fromage blanc 3% 150g + fruits',
    },
  },
  {
    id: 'msg-11',
    content: 'Parfait, merci beaucoup pour cet ajustement !',
    type: 'text',
    timestamp: new Date('2026-01-20T09:30:00'),
    isFromUser: true,
    status: 'read',
  },

  // Today - Recent messages
  {
    id: 'msg-12',
    content: 'Bonjour ! Comment allez-vous cette semaine ? Avez-vous pu suivre le plan ?',
    type: 'text',
    timestamp: new Date('2026-01-22T08:00:00'),
    isFromUser: false,
    status: 'read',
  },
  {
    id: 'msg-13',
    content: 'Bonjour Lucie ! Oui, tout se passe bien. J\'ai perdu 0.5kg cette semaine.',
    type: 'text',
    timestamp: new Date('2026-01-22T10:15:00'),
    isFromUser: true,
    status: 'delivered',
  },
];

// ==================== CONVERSATION ====================

const mockConversation: Conversation = {
  id: 'conv-1',
  nutritionist: mockNutritionist,
  messages: mockMessages,
  lastMessage: mockMessages[mockMessages.length - 1],
  unreadCount: 0,
};

// ==================== API MOCK FUNCTIONS ====================

export function getConversation(): Conversation {
  return { ...mockConversation };
}

export function getNutritionist(): Nutritionist {
  return { ...mockNutritionist };
}

export function getMessages(): Message[] {
  return [...mockMessages];
}

export function getQuickReplies(): QuickReply[] {
  return [...defaultQuickReplies];
}

// MSG-001: Send a text message (mock)
export function sendMessage(content: string): Message {
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    content,
    type: 'text',
    timestamp: new Date(),
    isFromUser: true,
    status: 'sending',
  };

  mockMessages.push(newMessage);
  mockConversation.lastMessage = newMessage;

  return newMessage;
}

// MSG-002: Send an image message (mock)
export function sendImageMessage(file: File): Message {
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    content: '',
    type: 'image',
    timestamp: new Date(),
    isFromUser: true,
    status: 'sending',
    attachment: {
      id: `att-${Date.now()}`,
      type: 'image',
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      mimeType: file.type,
    },
  };

  mockMessages.push(newMessage);
  mockConversation.lastMessage = newMessage;

  return newMessage;
}

// MSG-003: Send a document message (mock)
export function sendDocumentMessage(file: File): Message {
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    content: file.name,
    type: 'document',
    timestamp: new Date(),
    isFromUser: true,
    status: 'sending',
    attachment: {
      id: `att-${Date.now()}`,
      type: 'document',
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      mimeType: file.type,
    },
  };

  mockMessages.push(newMessage);
  mockConversation.lastMessage = newMessage;

  return newMessage;
}

// MSG-004: Update message status (mock)
export function updateMessageStatus(
  messageId: string,
  status: MessageStatus
): boolean {
  const message = mockMessages.find((m) => m.id === messageId);
  if (message) {
    message.status = status;
    return true;
  }
  return false;
}

// MSG-008: Update nutritionist status (mock)
export function updateNutritionistStatus(
  status: Nutritionist['status']
): Nutritionist {
  mockNutritionist.status = status;
  if (status === 'offline') {
    mockNutritionist.lastSeen = new Date();
  }
  return { ...mockNutritionist };
}

// Simulate receiving a response (for demo purposes)
export function simulateNutritionistResponse(): Message {
  const responses = [
    'Merci pour votre message, je vous réponds dès que possible.',
    'C\'est noté ! N\'hésitez pas si vous avez d\'autres questions.',
    'Excellent progrès ! Continuez comme ça.',
    'Je comprends, nous en parlerons lors de notre prochaine consultation.',
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    content: randomResponse,
    type: 'text',
    timestamp: new Date(),
    isFromUser: false,
    status: 'delivered',
  };

  mockMessages.push(newMessage);
  mockConversation.lastMessage = newMessage;

  return newMessage;
}

// ==================== CONSTANTS ====================

export const NUTRITIONIST_NAME = mockNutritionist.name;
export const NUTRITIONIST_INITIALS = mockNutritionist.initials;
