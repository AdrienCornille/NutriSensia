/**
 * Transformers pour la messagerie
 * Convertit les données brutes Supabase vers les types UI (src/types/messaging.ts)
 */

import type {
  Message,
  MessageAttachment,
  MessageReaction,
  MessageReplyTo,
  MessageType,
  MessageStatus,
  Nutritionist,
  NutritionistStatus,
  Conversation,
  QuickReply,
} from '@/types/messaging';

// ============================================================================
// TYPES DB (bruts depuis Supabase)
// ============================================================================

export interface MessageAttachmentFromDB {
  id: string;
  file_type: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  thumbnail_url: string | null;
}

export interface MessageReactionFromDB {
  emoji: string;
  user_id: string;
}

export interface MessageFromDB {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  message_type: string;
  plan_modification: {
    field: string;
    oldValue: string;
    newValue: string;
  } | null;
  status: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  reply_to_id: string | null;
  message_attachments?: MessageAttachmentFromDB[];
  message_reactions?: MessageReactionFromDB[];
  // Joined reply parent (from Supabase nested select)
  reply_to?: {
    id: string;
    content: string | null;
    sender_id: string;
    deleted_at: string | null;
    sender?: { first_name: string | null; last_name: string | null };
  } | null;
}

export interface ConversationFromDB {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  is_active: boolean;
  last_message_at: string | null;
  last_message_preview: string | null;
  patient_unread_count: number;
  nutritionist_unread_count: number;
  created_at: string;
  // Joined profile of the other participant
  other_user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface QuickReplyFromDB {
  id: string;
  user_id: string | null;
  text: string;
  category: string;
  display_order: number;
  is_active: boolean;
}

// ============================================================================
// TRANSFORMERS
// ============================================================================

/**
 * Transform a DB message to the UI Message type
 */
export function transformMessageFromDB(
  msg: MessageFromDB,
  currentUserId: string
): Message {
  const isFromUser = msg.sender_id === currentUserId;

  // Map DB status to UI status
  let status: MessageStatus;
  switch (msg.status) {
    case 'read':
      status = 'read';
      break;
    case 'delivered':
      status = 'delivered';
      break;
    case 'failed':
      status = 'error';
      break;
    default:
      status = 'sent';
  }

  // Map DB message_type to UI MessageType
  const typeMap: Record<string, MessageType> = {
    text: 'text',
    image: 'image',
    document: 'document',
    system: 'system',
    plan_modification: 'plan-modification',
  };
  const type: MessageType = typeMap[msg.message_type] || 'text';

  // Handle soft-deleted messages
  const isDeleted = !!msg.deleted_at;

  const message: Message = {
    id: msg.id,
    content: isDeleted ? '' : msg.content || '',
    type,
    timestamp: new Date(msg.created_at),
    isFromUser,
    senderId: msg.sender_id,
    status,
    isDeleted,
    editedAt: msg.edited_at ? new Date(msg.edited_at) : undefined,
  };

  // Don't include attachment/reactions/modifications for deleted messages
  if (isDeleted) {
    return message;
  }

  // Add attachment if present
  if (msg.message_attachments && msg.message_attachments.length > 0) {
    const att = msg.message_attachments[0];
    message.attachment = transformAttachmentFromDB(att);
  }

  // Add plan modification if present
  if (msg.plan_modification) {
    message.planModification = {
      field: msg.plan_modification.field,
      oldValue: msg.plan_modification.oldValue,
      newValue: msg.plan_modification.newValue,
    };
  }

  // Aggregate reactions
  if (msg.message_reactions && msg.message_reactions.length > 0) {
    message.reactions = aggregateReactions(
      msg.message_reactions,
      currentUserId
    );
  }

  // Reply/quote (Supabase returns {} instead of null for empty joins, so check for id)
  if (msg.reply_to && msg.reply_to.id) {
    const reply = msg.reply_to;
    const isReplyDeleted = !!reply.deleted_at;
    const senderFirst = reply.sender?.first_name || '';
    const senderLast = reply.sender?.last_name || '';
    const senderName = `${senderFirst} ${senderLast}`.trim() || 'Utilisateur';

    message.replyTo = {
      id: reply.id,
      content: isReplyDeleted ? 'Message supprimé' : reply.content || '',
      senderName,
      isFromUser: reply.sender_id === currentUserId,
    } as MessageReplyTo;
  }

  return message;
}

/**
 * Transform a DB attachment to the UI MessageAttachment type
 */
export function transformAttachmentFromDB(
  att: MessageAttachmentFromDB
): MessageAttachment {
  return {
    id: att.id,
    type: att.file_type === 'image' ? 'image' : 'document',
    url: att.file_url,
    name: att.file_name,
    size: att.file_size || undefined,
    mimeType: att.mime_type || undefined,
    thumbnailUrl: att.thumbnail_url || undefined,
  };
}

/**
 * Transform a DB conversation to the UI Conversation type (without messages)
 */
export function transformConversationFromDB(
  conv: ConversationFromDB,
  currentUserId: string
): Omit<Conversation, 'messages'> {
  const isPatient = conv.patient_id === currentUserId;
  const other = conv.other_user;

  const firstName = other?.first_name || '';
  const lastName = other?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur';

  const nutritionist: Nutritionist = {
    id: other?.id || (isPatient ? conv.nutritionist_id : conv.patient_id),
    name: fullName,
    initials: getInitials(firstName, lastName),
    avatarUrl: other?.avatar_url || undefined,
    status: 'offline' as NutritionistStatus,
  };

  const unreadCount = isPatient
    ? conv.patient_unread_count
    : conv.nutritionist_unread_count;

  return {
    id: conv.id,
    nutritionist,
    unreadCount,
    lastMessage: conv.last_message_preview
      ? {
          id: 'preview',
          content: conv.last_message_preview,
          type: 'text',
          timestamp: conv.last_message_at
            ? new Date(conv.last_message_at)
            : new Date(conv.created_at),
          isFromUser: false,
          status: 'sent',
        }
      : undefined,
  };
}

/**
 * Transform a DB quick reply to the UI QuickReply type
 */
export function transformQuickReplyFromDB(qr: QuickReplyFromDB): QuickReply {
  return {
    id: qr.id,
    text: qr.text,
    category: qr.category as QuickReply['category'],
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Aggregate raw reaction rows into MessageReaction[] grouped by emoji
 */
function aggregateReactions(
  reactions: MessageReactionFromDB[],
  currentUserId: string
): MessageReaction[] {
  const map = new Map<string, { count: number; hasReacted: boolean }>();
  for (const r of reactions) {
    const entry = map.get(r.emoji) || { count: 0, hasReacted: false };
    entry.count++;
    if (r.user_id === currentUserId) entry.hasReacted = true;
    map.set(r.emoji, entry);
  }
  return Array.from(map.entries()).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    hasReacted: data.hasReacted,
  }));
}

/**
 * Get initials from first and last name
 */
export function getInitials(
  firstName: string | null,
  lastName: string | null
): string {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();

  if (first && last) {
    return (first[0] + last[0]).toUpperCase();
  }
  if (first) {
    return first.substring(0, 2).toUpperCase();
  }
  if (last) {
    return last.substring(0, 2).toUpperCase();
  }
  return '??';
}
