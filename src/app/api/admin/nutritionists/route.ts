/**
 * Route API admin pour gérer les nutritionnistes
 * GET /api/admin/nutritionists - Liste des nutritionnistes
 *
 * @see AUTH-010 dans USER_STORIES.md
 */

import { NextRequest } from 'next/server';
import { withAdminAuth, apiResponse } from '@/lib/api-auth';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { NutritionistStatus } from '@/types/nutritionist-registration';

/**
 * GET /api/admin/nutritionists
 * Liste tous les nutritionnistes avec leurs profils et documents
 */
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    // Récupérer les paramètres de query
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as
      | NutritionistStatus
      | 'all'
      | null;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

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

    // Construire la requête
    let query = supabaseAdmin.from('nutritionist_profiles').select(
      `
        id,
        user_id,
        asca_number,
        rme_number,
        specializations,
        years_of_experience,
        languages,
        bio,
        cabinet_address,
        status,
        rejection_reason,
        info_request_message,
        info_response,
        info_responded_at,
        validated_at,
        validated_by,
        created_at,
        updated_at,
        profiles!nutritionist_profiles_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        nutritionist_documents (
          id,
          type,
          file_name,
          file_url,
          file_size,
          mime_type,
          verified,
          verified_at,
          created_at
        )
      `,
      { count: 'exact' }
    );

    // Filtrer par statut
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Pagination
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    // Trier par date de création (les plus récents en premier)
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error(
        'Erreur lors de la récupération des nutritionnistes:',
        error
      );
      return apiResponse.serverError(
        'Erreur lors de la récupération des nutritionnistes'
      );
    }

    // Transformer les données pour le frontend
    const nutritionists = (data || []).map((np: any) => ({
      id: np.id,
      userId: np.user_id,
      firstName: np.profiles?.first_name || '',
      lastName: np.profiles?.last_name || '',
      email: np.profiles?.email || '',
      phone: np.profiles?.phone,
      ascaNumber: np.asca_number,
      rmeNumber: np.rme_number,
      specializations: np.specializations || [],
      yearsOfExperience: np.years_of_experience,
      languages: np.languages || [],
      bio: np.bio,
      cabinetAddress: np.cabinet_address,
      status: np.status,
      rejectionReason: np.rejection_reason,
      infoRequestMessage: np.info_request_message,
      infoResponse: np.info_response,
      infoRespondedAt: np.info_responded_at,
      validatedAt: np.validated_at,
      validatedBy: np.validated_by,
      documents: (np.nutritionist_documents || []).map((doc: any) => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.file_name,
        fileUrl: doc.file_url,
        fileSize: doc.file_size,
        mimeType: doc.mime_type,
        verified: doc.verified,
        verifiedAt: doc.verified_at,
        uploadedAt: doc.created_at,
      })),
      createdAt: np.created_at,
      updatedAt: np.updated_at,
    }));

    // Filtrer par recherche côté serveur (après transformation)
    let filteredNutritionists = nutritionists;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredNutritionists = nutritionists.filter((n: any) => {
        const fullName = `${n.firstName} ${n.lastName}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          n.email.toLowerCase().includes(searchLower)
        );
      });
    }

    return apiResponse.success({
      nutritionists: filteredNutritionists,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return apiResponse.serverError('Une erreur inattendue est survenue');
  }
});
