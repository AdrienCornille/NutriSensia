/**
 * Routes API pour la gestion du profil utilisateur
 * GET /api/protected/profile - Récupérer le profil de l'utilisateur connecté
 * PATCH /api/protected/profile - Mettre à jour le profil
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { Database } from '@/types/database';

// Type pour le profil
type Profile = Database['public']['Tables']['profiles']['Row'];

// Schéma de validation pour la mise à jour du profil
const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50)
    .optional(),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50)
    .optional(),
  phone: z.string().optional().nullable(),
  consultationReason: z
    .enum([
      'menopause_perimenopause',
      'perte_poids_durable',
      'troubles_digestifs',
      'glycemie_diabete',
      'sante_cardiovasculaire',
      'fatigue_energie',
      'longevite_vieillissement',
      'sante_hormonale',
      'alimentation_saine',
      'autre',
    ])
    .optional(),
  marketingConsent: z.boolean().optional(),
});

/**
 * GET /api/protected/profile
 * Récupère le profil de l'utilisateur connecté
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer le profil
    const result = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const profile = result.data as Profile | null;
    const profileError = result.error;

    if (profileError) {
      // Si le profil n'existe pas, on peut le créer depuis les métadonnées auth
      if (profileError.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: 'Profil non trouvé',
            code: 'PROFILE_NOT_FOUND',
            authUser: {
              id: user.id,
              email: user.email,
              metadata: user.user_metadata,
            },
          },
          { status: 404 }
        );
      }

      console.error('Erreur récupération profil:', profileError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Formater la réponse
    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        fullName: `${profile.first_name} ${profile.last_name}`,
        phone: profile.phone,
        consultationReason: profile.consultation_reason,
        marketingConsent: profile.marketing_consent,
        accountStatus: profile.account_status,
        authProvider: profile.auth_provider,
        acceptedTermsAt: profile.accepted_terms_at,
        trialStartedAt: profile.trial_started_at,
        trialEndsAt: profile.trial_ends_at,
        accessUntil: profile.access_until,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
    });
  } catch (error) {
    console.error('Erreur inattendue GET profile:', error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/protected/profile
 * Met à jour le profil de l'utilisateur connecté
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Parser et valider les données
    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json(
        { error: 'Données invalides', details: errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Construire l'objet de mise à jour
    type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
    const updateData: Partial<ProfileUpdate> = {};

    if (data.firstName !== undefined) {
      updateData.first_name = data.firstName;
    }
    if (data.lastName !== undefined) {
      updateData.last_name = data.lastName;
    }
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }
    if (data.consultationReason !== undefined) {
      updateData.consultation_reason = data.consultationReason;
    }
    if (data.marketingConsent !== undefined) {
      updateData.marketing_consent = data.marketingConsent;
    }

    // Vérifier qu'il y a des données à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    // Mettre à jour le profil
    // Note: Cast nécessaire pour contourner les types Supabase restrictifs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateResult = await (supabase as any)
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    const updatedProfile = updateResult.data as Profile | null;
    const updateError = updateResult.error;

    if (updateError) {
      console.error('Erreur mise à jour profil:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil' },
        { status: 500 }
      );
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil' },
        { status: 500 }
      );
    }

    // Mettre à jour également les métadonnées auth si nom/prénom changés
    if (data.firstName !== undefined || data.lastName !== undefined) {
      const newMetadata: Record<string, string> = {};
      if (data.firstName) newMetadata.first_name = data.firstName;
      if (data.lastName) newMetadata.last_name = data.lastName;
      if (data.firstName && data.lastName) {
        newMetadata.full_name = `${data.firstName} ${data.lastName}`;
      }

      await supabase.auth.updateUser({
        data: newMetadata,
      });
    }

    // Formater la réponse
    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      profile: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        firstName: updatedProfile.first_name,
        lastName: updatedProfile.last_name,
        fullName: `${updatedProfile.first_name} ${updatedProfile.last_name}`,
        phone: updatedProfile.phone,
        consultationReason: updatedProfile.consultation_reason,
        marketingConsent: updatedProfile.marketing_consent,
        accountStatus: updatedProfile.account_status,
        updatedAt: updatedProfile.updated_at,
      },
    });
  } catch (error) {
    console.error('Erreur inattendue PATCH profile:', error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    );
  }
}
