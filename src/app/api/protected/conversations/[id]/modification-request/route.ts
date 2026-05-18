/**
 * API Route: /api/protected/conversations/[id]/modification-request
 * Create a plan modification request via messaging (MSG-009)
 *
 * POST - Patient creates a modification request and sends a special message
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { z } from 'zod';

const modificationRequestSchema = z.object({
  meal_plan_id: z.string().uuid(),
  request_type: z.enum([
    'substitute',
    'remove',
    'add',
    'modify_quantity',
    'general',
  ]),
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(2000),
  suggested_alternative: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'patient',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const body = await req.json();
    let validated;
    try {
      validated = modificationRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.error(
          'Données invalides: ' + error.issues.map(e => e.message).join(', '),
          400
        );
      }
      throw error;
    }

    const supabase = await createClient();

    // 1. Verify conversation participation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversation, error: convError } = await (supabase as any)
      .from('conversations')
      .select('id, patient_id, nutritionist_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return apiResponse.notFound('Conversation introuvable');
    }

    if (conversation.patient_id !== auth.user.id) {
      return apiResponse.forbidden(
        'Seul le patient peut créer une demande de modification'
      );
    }

    // 2. Verify the meal plan belongs to this patient
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: mealPlan, error: planError } = await (supabase as any)
      .from('meal_plans')
      .select('id, patient_id, nutritionist_id')
      .eq('id', validated.meal_plan_id)
      .single();

    if (planError || !mealPlan) {
      return apiResponse.notFound('Plan alimentaire introuvable');
    }

    // 3. Create the modification request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: request, error: requestError } = await (supabase as any)
      .from('plan_modification_requests')
      .insert({
        meal_plan_id: validated.meal_plan_id,
        patient_id: auth.user.id,
        nutritionist_id: conversation.nutritionist_id,
        request_type: validated.request_type,
        title: validated.title,
        description: validated.description,
        suggested_alternative: validated.suggested_alternative || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (requestError || !request) {
      console.error('Error creating modification request:', requestError);
      return apiResponse.serverError(
        'Erreur lors de la création de la demande'
      );
    }

    // 4. Send a message of type 'modification_request' in the conversation
    const requestTypeLabels: Record<string, string> = {
      substitute: 'Substitution',
      remove: 'Suppression',
      add: 'Ajout',
      modify_quantity: 'Modification de quantité',
      general: 'Modification générale',
    };

    const messageContent = `📝 Demande de modification : ${validated.title}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: message, error: msgError } = await (supabase as any)
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: auth.user.id,
        content: messageContent,
        message_type: 'modification_request',
        plan_modification: {
          request_id: request.id,
          request_type: validated.request_type,
          request_type_label: requestTypeLabels[validated.request_type],
          title: validated.title,
          description: validated.description,
          suggested_alternative: validated.suggested_alternative,
          status: 'pending',
        },
        status: 'sent',
      })
      .select('*')
      .single();

    if (msgError) {
      console.error('Error creating modification request message:', msgError);
    }

    return NextResponse.json(
      {
        request_id: request.id,
        message: message || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /modification-request:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
