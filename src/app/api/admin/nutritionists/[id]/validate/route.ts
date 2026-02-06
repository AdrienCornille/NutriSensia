/**
 * Route API admin pour valider/rejeter un nutritionniste
 * POST /api/admin/nutritionists/[id]/validate
 *
 * @see AUTH-010 dans USER_STORIES.md
 */

import { NextRequest } from 'next/server';
import { withAdminAuth, apiResponse } from '@/lib/api-auth';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { NutritionistStatus } from '@/types/nutritionist-registration';

interface ValidateRequestBody {
  action: 'approve' | 'reject' | 'request_info';
  reason?: string;
}

/**
 * POST /api/admin/nutritionists/[id]/validate
 * Valide, rejette ou demande des informations complémentaires
 */
export const POST = withAdminAuth(
  async (
    req: NextRequest,
    auth,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: nutritionistId } = await params;
      const body: ValidateRequestBody = await req.json();
      const { action, reason } = body;

      // Validation des données
      if (!action || !['approve', 'reject', 'request_info'].includes(action)) {
        return apiResponse.error(
          'Action invalide. Valeurs acceptées: approve, reject, request_info'
        );
      }

      if ((action === 'reject' || action === 'request_info') && !reason) {
        return apiResponse.error('La raison est obligatoire pour cette action');
      }

      // Créer le client Supabase admin
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return apiResponse.serverError('Configuration du serveur incomplète');
      }

      const supabaseAdmin = createSupabaseClient(
        supabaseUrl,
        supabaseServiceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      // Vérifier que le nutritionniste existe
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('nutritionist_profiles')
        .select('id, user_id, status')
        .eq('id', nutritionistId)
        .single();

      if (existingError || !existing) {
        return apiResponse.notFound('Nutritionniste non trouvé');
      }

      // Déterminer le nouveau statut et les données à mettre à jour
      let newStatus: NutritionistStatus;
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      switch (action) {
        case 'approve':
          newStatus = 'active';
          updateData.status = newStatus;
          updateData.validated_at = new Date().toISOString();
          updateData.validated_by = auth.user.id;
          updateData.rejection_reason = null;
          updateData.info_request_message = null;
          break;

        case 'reject':
          newStatus = 'rejected';
          updateData.status = newStatus;
          updateData.rejection_reason = reason;
          updateData.validated_at = null;
          updateData.validated_by = null;
          break;

        case 'request_info':
          newStatus = 'info_required';
          updateData.status = newStatus;
          updateData.info_request_message = reason;
          updateData.info_response = null;
          updateData.info_responded_at = null;
          break;

        default:
          return apiResponse.error('Action non supportée');
      }

      // Mettre à jour le profil nutritionniste
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('nutritionist_profiles')
        .update(updateData)
        .eq('id', nutritionistId)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la mise à jour:', updateError);
        return apiResponse.serverError(
          'Erreur lors de la mise à jour du statut'
        );
      }

      // Si validé, mettre à jour le rôle dans profiles
      if (action === 'approve') {
        const { error: roleError } = await supabaseAdmin
          .from('profiles')
          .update({ role: 'nutritionist' })
          .eq('id', existing.user_id);

        if (roleError) {
          console.error('Erreur lors de la mise à jour du rôle:', roleError);
          // On ne retourne pas d'erreur car le statut a été mis à jour
        }
      }

      // TODO: Envoyer un email de notification au nutritionniste
      // Ceci peut être implémenté avec Resend ou un autre service d'email

      const actionLabels: Record<string, string> = {
        approve: 'validée',
        reject: 'rejetée',
        request_info: "mise en attente d'informations complémentaires",
      };

      return apiResponse.success({
        message: `Demande ${actionLabels[action]} avec succès`,
        nutritionist: {
          id: updated.id,
          status: updated.status,
          validatedAt: updated.validated_at,
          rejectionReason: updated.rejection_reason,
          infoRequestMessage: updated.info_request_message,
        },
      });
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return apiResponse.serverError('Une erreur inattendue est survenue');
    }
  }
);
