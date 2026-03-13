/**
 * API Route: /api/protected/dossier/meal-plan/modification-requests
 * Patient-side: list and create modification requests
 *
 * GET  - Liste les demandes du patient pour le plan actif
 * POST - Créer une nouvelle demande de modification
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createPatientModificationRequestSchema } from '@/lib/api-schemas';

export async function GET() {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;
    const userId = auth.user.id;

    // Find active plan
    const { data: plan } = await s
      .from('meal_plans')
      .select('id, nutritionist_id')
      .eq('patient_id', userId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!plan) {
      return apiResponse.success([]);
    }

    const { data: requests, error } = await s
      .from('plan_modification_requests')
      .select('id, title, description, request_type, suggested_alternative, status, response, responded_at, created_at')
      .eq('meal_plan_id', plan.id)
      .eq('patient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patient modification requests:', error);
      return apiResponse.serverError('Erreur lors de la récupération des demandes');
    }

    return apiResponse.success(requests || []);
  } catch (error) {
    console.error('Unexpected error in patient modification-requests GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;
    const userId = auth.user.id;

    // Find active plan
    const { data: plan } = await s
      .from('meal_plans')
      .select('id, nutritionist_id')
      .eq('patient_id', userId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!plan) {
      return apiResponse.error('Aucun plan alimentaire actif', 404);
    }

    const body = await req.json();
    const parsed = createPatientModificationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const { data: created, error: insertError } = await s
      .from('plan_modification_requests')
      .insert({
        meal_plan_id: plan.id,
        patient_id: userId,
        nutritionist_id: plan.nutritionist_id,
        request_type: parsed.data.request_type,
        title: parsed.data.title,
        description: parsed.data.description,
        suggested_alternative: parsed.data.suggested_alternative || null,
        status: 'pending',
      })
      .select('id, title, description, request_type, suggested_alternative, status, created_at')
      .single();

    if (insertError) {
      console.error('Error creating modification request:', insertError);
      return apiResponse.serverError('Erreur lors de la création de la demande');
    }

    // Notify nutritionist
    try {
      await s.rpc('create_notification', {
        p_user_id: plan.nutritionist_id,
        p_type_code: 'plan_modification_request',
        p_data: {
          request_id: created.id,
          plan_id: plan.id,
          request_title: created.title,
          patient_id: userId,
        },
      });
    } catch (notifErr) {
      console.error('Failed to send modification request notification:', notifErr);
    }

    return apiResponse.success(created, 201);
  } catch (error) {
    console.error('Unexpected error in patient modification-requests POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
