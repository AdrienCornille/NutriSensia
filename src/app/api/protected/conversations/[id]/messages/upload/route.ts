/**
 * API Route: /api/protected/conversations/[id]/messages/upload
 * Upload d'images et documents dans une conversation
 *
 * POST - Upload un fichier (image ou document) et créer un message
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// Types MIME autorisés
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['patient', 'nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser le FormData
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return apiResponse.error('FormData invalide', 400);
    }

    const file = formData.get('file') as File | null;
    const fileType = formData.get('file_type') as string | null;
    const caption = formData.get('caption') as string | null;

    if (!file) {
      return apiResponse.error('Fichier requis', 400);
    }

    if (!fileType || !['image', 'document'].includes(fileType)) {
      return apiResponse.error(
        "Type de fichier invalide (doit être 'image' ou 'document')",
        400
      );
    }

    // 3. Valider le fichier
    if (fileType === 'image') {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return apiResponse.error(
          'Type d\'image non supporté (JPEG, PNG, WebP, GIF uniquement)',
          400
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return apiResponse.error(
          'Image trop volumineuse (max 5 MB)',
          413
        );
      }
    } else {
      if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
        return apiResponse.error(
          'Type de document non supporté (PDF uniquement)',
          400
        );
      }
      if (file.size > MAX_DOCUMENT_SIZE) {
        return apiResponse.error(
          'Document trop volumineux (max 10 MB)',
          413
        );
      }
    }

    // 4. Client Supabase
    const supabase = await createClient();

    // 5. Vérifier la participation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversation, error: convError } = await (supabase as any)
      .from('conversations')
      .select('id, patient_id, nutritionist_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return apiResponse.notFound('Conversation introuvable');
    }

    if (
      conversation.patient_id !== auth.user.id &&
      conversation.nutritionist_id !== auth.user.id
    ) {
      return apiResponse.forbidden(
        "Vous n'avez pas accès à cette conversation"
      );
    }

    // 6. Upload vers Supabase Storage
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${conversationId}/${timestamp}_${safeFileName}`;

    const fileBuffer = await file.arrayBuffer();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: uploadError } = await (supabase as any).storage
      .from('message-attachments')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return apiResponse.serverError("Erreur lors de l'upload du fichier");
    }

    // 7. Obtenir l'URL publique
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: urlData } = (supabase as any).storage
      .from('message-attachments')
      .getPublicUrl(storagePath);

    const fileUrl = urlData?.publicUrl || '';

    // 8. Créer le message
    const messageContent = caption || '';
    const messageType = fileType === 'image' ? 'image' : 'document';

    let messageId: string;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rpcResult, error: rpcError } = await (supabase as any).rpc(
        'send_message',
        {
          p_conversation_id: conversationId,
          p_sender_id: auth.user.id,
          p_content: messageContent,
          p_message_type: messageType,
        }
      );

      if (rpcError) throw rpcError;
      messageId = rpcResult;
    } catch {
      // Fallback: INSERT direct
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: inserted, error: insertError } = await (supabase as any)
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: auth.user.id,
          content: messageContent,
          message_type: messageType,
          status: 'sent',
        })
        .select('id')
        .single();

      if (insertError || !inserted) {
        console.error('Error inserting message:', insertError);
        return apiResponse.serverError("Erreur lors de l'envoi du message");
      }
      messageId = inserted.id;
    }

    // 9. Créer l'enregistrement d'attachment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: attachment, error: attachError } = await (supabase as any)
      .from('message_attachments')
      .insert({
        message_id: messageId,
        file_type: fileType,
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size,
        mime_type: file.type,
      })
      .select('*')
      .single();

    if (attachError) {
      console.error('Error creating attachment record:', attachError);
      // Le message a été créé, on retourne quand même
    }

    // 10. Récupérer le message complet avec attachments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: createdMessage } = await (supabase as any)
      .from('messages')
      .select(
        `
        *,
        message_attachments (
          id,
          file_type,
          file_name,
          file_url,
          file_size,
          mime_type,
          thumbnail_url
        )
      `
      )
      .eq('id', messageId)
      .single();

    return NextResponse.json(
      {
        message: createdMessage || { id: messageId },
        attachment: attachment || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/protected/conversations/[id]/messages/upload:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}
