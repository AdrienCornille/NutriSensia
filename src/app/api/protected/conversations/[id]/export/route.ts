/**
 * API Route: /api/protected/conversations/[id]/export
 * Export conversation as a formatted PDF (MSG-010)
 *
 * POST - Generate and return a PDF blob
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import PDFDocument from 'pdfkit';

// ============================================================================
// Helpers
// ============================================================================

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(date: Date): string {
  return `${formatDate(date)} à ${formatTime(date)}`;
}

// NutriSensia brand colors
const BRAND_GREEN: [number, number, number] = [27, 153, 139]; // #1B998B
const DARK_TEXT: [number, number, number] = [31, 41, 55]; // gray-800
const GRAY_TEXT: [number, number, number] = [107, 114, 128]; // gray-500
const LIGHT_BG: [number, number, number] = [243, 244, 246]; // gray-100

// ============================================================================
// POST - Export conversation as PDF
// ============================================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    // 1. Auth
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['patient', 'nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    const userId = auth.user.id;

    // 2. Verify conversation access
    const { data: conversation, error: convError } = await (supabase as any)
      .from('conversations')
      .select('id, patient_id, nutritionist_id, created_at')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return apiResponse.notFound('Conversation introuvable');
    }

    // Check user is a participant
    if (
      conversation.patient_id !== userId &&
      conversation.nutritionist_id !== userId
    ) {
      return apiResponse.forbidden('Accès non autorisé à cette conversation');
    }

    // 3. Fetch all messages
    const { data: messages, error: msgError } = await (supabase as any)
      .from('messages')
      .select(
        'id, sender_id, content, message_type, created_at, message_attachments(file_name, file_type)'
      )
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Error fetching messages for export:', msgError);
      return apiResponse.serverError(
        'Erreur lors de la récupération des messages'
      );
    }

    // 4. Fetch participant names
    const participantIds = [
      conversation.patient_id,
      conversation.nutritionist_id,
    ];
    const { data: profiles } = await (supabase as any)
      .from('profiles')
      .select('id, first_name, last_name, role')
      .in('id', participantIds);

    const nameMap = new Map<string, { name: string; role: string }>();
    for (const p of profiles || []) {
      const name =
        [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Utilisateur';
      nameMap.set(p.id, { name, role: p.role || 'patient' });
    }

    const patientInfo = nameMap.get(conversation.patient_id);
    const nutriInfo = nameMap.get(conversation.nutritionist_id);

    // 5. Generate PDF
    const pdfBuffer = await generateConversationPDF({
      messages: messages || [],
      patientName: patientInfo?.name || 'Patient',
      nutritionistName: nutriInfo?.name || 'Nutritionniste',
      conversationCreatedAt: new Date(conversation.created_at),
      nameMap,
      currentUserId: userId,
    });

    // 6. Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="conversation-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Unexpected error in conversation export:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// PDF Generation
// ============================================================================

interface PDFGenerationParams {
  messages: Array<{
    id: string;
    sender_id: string;
    content: string | null;
    message_type: string;
    created_at: string;
    message_attachments: Array<{ file_name: string; file_type: string }> | null;
  }>;
  patientName: string;
  nutritionistName: string;
  conversationCreatedAt: Date;
  nameMap: Map<string, { name: string; role: string }>;
  currentUserId: string;
}

async function generateConversationPDF(
  params: PDFGenerationParams
): Promise<Buffer> {
  const {
    messages,
    patientName,
    nutritionistName,
    conversationCreatedAt,
    nameMap,
  } = params;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Conversation - ${patientName} & ${nutritionistName}`,
        Author: 'NutriSensia',
        Subject: 'Export de conversation',
        Creator: 'NutriSensia',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ---- Header ----
    drawHeader(doc, patientName, nutritionistName, conversationCreatedAt);

    // ---- Messages ----
    let lastDateStr = '';

    for (const msg of messages) {
      const msgDate = new Date(msg.created_at);
      const dateStr = formatDate(msgDate);

      // Date separator
      if (dateStr !== lastDateStr) {
        lastDateStr = dateStr;
        drawDateSeparator(doc, dateStr);
      }

      // Draw message
      const sender = nameMap.get(msg.sender_id);
      const attachment = msg.message_attachments?.[0] || null;
      drawMessage(doc, {
        senderName: sender?.name || 'Inconnu',
        senderRole: sender?.role || 'patient',
        content: msg.content || '',
        messageType: msg.message_type,
        time: formatTime(msgDate),
        attachmentName: attachment?.file_name || null,
      });
    }

    // ---- Footer on last page ----
    drawFooter(doc, messages.length);

    doc.end();
  });
}

function drawHeader(
  doc: PDFKit.PDFDocument,
  patientName: string,
  nutritionistName: string,
  createdAt: Date
) {
  // Brand bar
  doc.rect(0, 0, doc.page.width, 4).fill(rgbToHex(BRAND_GREEN));

  // Title
  doc.fontSize(18).fillColor(rgbToHex(BRAND_GREEN)).text('NutriSensia', 50, 30);

  doc
    .fontSize(14)
    .fillColor(rgbToHex(DARK_TEXT))
    .text('Export de conversation', 50, 55);

  // Participants info
  doc
    .fontSize(10)
    .fillColor(rgbToHex(GRAY_TEXT))
    .text(`Patient : ${patientName}`, 50, 80)
    .text(`Nutritionniste : ${nutritionistName}`, 50, 95)
    .text(`Conversation débutée le ${formatDate(createdAt)}`, 50, 110)
    .text(`Exporté le ${formatDateTime(new Date())}`, 50, 125);

  // Separator line
  doc
    .moveTo(50, 145)
    .lineTo(doc.page.width - 50, 145)
    .strokeColor(rgbToHex(LIGHT_BG))
    .lineWidth(1)
    .stroke();

  doc.y = 160;
}

function drawDateSeparator(doc: PDFKit.PDFDocument, dateStr: string) {
  checkPageBreak(doc, 30);

  const y = doc.y + 10;
  const textWidth = doc.fontSize(9).widthOfString(dateStr);
  const centerX = doc.page.width / 2;

  // Line — text — line
  doc
    .moveTo(50, y + 5)
    .lineTo(centerX - textWidth / 2 - 10, y + 5)
    .strokeColor(rgbToHex(LIGHT_BG))
    .lineWidth(0.5)
    .stroke();

  doc
    .fontSize(9)
    .fillColor(rgbToHex(GRAY_TEXT))
    .text(dateStr, centerX - textWidth / 2, y, { width: textWidth });

  doc
    .moveTo(centerX + textWidth / 2 + 10, y + 5)
    .lineTo(doc.page.width - 50, y + 5)
    .strokeColor(rgbToHex(LIGHT_BG))
    .lineWidth(0.5)
    .stroke();

  doc.y = y + 20;
}

function drawMessage(
  doc: PDFKit.PDFDocument,
  opts: {
    senderName: string;
    senderRole: string;
    content: string;
    messageType: string;
    time: string;
    attachmentName: string | null;
  }
) {
  const { senderName, senderRole, content, messageType, time, attachmentName } =
    opts;
  const maxWidth = doc.page.width - 130;

  // System messages
  if (messageType === 'system') {
    checkPageBreak(doc, 20);
    doc
      .fontSize(8)
      .fillColor(rgbToHex(GRAY_TEXT))
      .text(`[${time}] ${content}`, 80, doc.y, {
        width: maxWidth,
        align: 'center',
      });
    doc.y += 5;
    return;
  }

  // Estimate height needed
  const contentHeight = content
    ? doc.fontSize(10).heightOfString(content, { width: maxWidth - 20 })
    : 0;
  const totalHeight = 20 + contentHeight + (attachmentName ? 15 : 0) + 10;

  checkPageBreak(doc, totalHeight);

  const isNutritionist = senderRole === 'nutritionist';
  const nameColor = isNutritionist ? BRAND_GREEN : DARK_TEXT;
  const y = doc.y;

  // Sender name + time
  doc
    .fontSize(9)
    .fillColor(rgbToHex(nameColor))
    .text(senderName, 55, y, { continued: true })
    .fillColor(rgbToHex(GRAY_TEXT))
    .text(`  ${time}`, { continued: false });

  doc.y = y + 14;

  // Attachment indicator
  if (attachmentName) {
    doc
      .fontSize(9)
      .fillColor(rgbToHex(GRAY_TEXT))
      .text(`📎 ${attachmentName}`, 55, doc.y, { width: maxWidth });
    doc.y += 2;
  }

  // Plan modification special rendering
  if (
    messageType === 'modification_request' ||
    messageType === 'plan-modification'
  ) {
    doc
      .fontSize(9)
      .fillColor(rgbToHex([180, 120, 20]))
      .text(`✏️ Demande de modification`, 55, doc.y, { width: maxWidth });
    doc.y += 2;
  }

  // Content
  if (content) {
    doc
      .fontSize(10)
      .fillColor(rgbToHex(DARK_TEXT))
      .text(content, 55, doc.y, { width: maxWidth });
  }

  doc.y += 8;
}

function drawFooter(doc: PDFKit.PDFDocument, messageCount: number) {
  const y = doc.y + 20;

  if (y > doc.page.height - 80) {
    doc.addPage();
  }

  doc
    .moveTo(50, doc.y + 10)
    .lineTo(doc.page.width - 50, doc.y + 10)
    .strokeColor(rgbToHex(LIGHT_BG))
    .lineWidth(0.5)
    .stroke();

  doc
    .fontSize(8)
    .fillColor(rgbToHex(GRAY_TEXT))
    .text(
      `${messageCount} message${messageCount !== 1 ? 's' : ''} exporté${messageCount !== 1 ? 's' : ''} — NutriSensia © ${new Date().getFullYear()}`,
      50,
      doc.y + 18,
      { align: 'center', width: doc.page.width - 100 }
    );
}

function checkPageBreak(doc: PDFKit.PDFDocument, neededHeight: number) {
  if (doc.y + neededHeight > doc.page.height - 60) {
    doc.addPage();
    doc.y = 50;
  }
}

function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
}
