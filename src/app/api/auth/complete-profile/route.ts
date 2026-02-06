/**
 * Route API pour compléter un profil utilisateur OAuth
 * POST /api/auth/complete-profile
 *
 * AUTH-001: Complétion du profil patient OAuth
 * - Met à jour le profil dans la table profiles
 * - Crée le patient_profiles avec assignation au nutritionniste par défaut
 * - Crée les user_settings avec valeurs par défaut
 *
 * Accepte l'authentification via:
 * - Cookies (session normale)
 * - Header Authorization: Bearer <token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/types/database';

// Schéma de validation pour la complétion du profil
const completeProfileSchema = z.object({
  consultationReason: z.enum([
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
  ]),
  consultationReasonDetails: z.string().optional(),
  marketingConsent: z.boolean().optional().default(false),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
});

type CompleteProfileInput = z.infer<typeof completeProfileSchema>;

/**
 * Récupère l'ID du nutritionniste par défaut (NutriSensia)
 * Utilise la variable d'environnement ou cherche le premier nutritionniste actif
 */
async function getDefaultNutritionistId(
  supabaseAdmin: ReturnType<typeof createSupabaseClient<Database>>
): Promise<string | null> {
  // 1. Vérifier la variable d'environnement
  const defaultId = process.env.DEFAULT_NUTRITIONIST_ID;
  if (defaultId) {
    return defaultId;
  }

  // 2. Sinon, chercher le premier nutritionniste actif et vérifié
  const { data: nutritionist } = await supabaseAdmin
    .from('nutritionist_profiles')
    .select('id')
    .eq('is_active', true)
    .not('verified_at', 'is', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  return nutritionist?.id || null;
}

export async function POST(request: NextRequest) {
  try {
    let user;

    // Configuration Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration du serveur incomplète' },
        { status: 500 }
      );
    }

    // Créer le client admin pour les opérations de base de données (bypass RLS)
    const supabaseAdmin = createSupabaseClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Vérifier si un Bearer token est fourni
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (bearerToken) {
      // Utiliser le token directement pour authentifier
      const supabaseWithToken = createSupabaseClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          global: {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          },
        }
      );

      const { data: userData, error: userError } =
        await supabaseWithToken.auth.getUser(bearerToken);

      if (userError || !userData.user) {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      }

      user = userData.user;
    } else {
      // Utiliser les cookies (session normale)
      const supabase = await createClient();
      const {
        data: { user: cookieUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !cookieUser) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      }

      user = cookieUser;
    }

    // Parser et valider les données
    const body = await request.json();
    const validationResult = completeProfileSchema.safeParse(body);

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

    const data: CompleteProfileInput = validationResult.data;

    // Vérifier si un profil existe (utiliser admin pour bypass RLS)
    const { data: existingProfile, error: profileCheckError } =
      await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, phone, consultation_reason')
        .eq('id', user.id)
        .single();

    if (profileCheckError || !existingProfile) {
      return NextResponse.json(
        { error: 'Profil non trouvé. Veuillez vous reconnecter.' },
        { status: 404 }
      );
    }

    // Vérifier si patient_profiles existe déjà
    const { data: existingPatientProfile } = await supabaseAdmin
      .from('patient_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Récupérer le nutritionniste par défaut
    const defaultNutritionistId = await getDefaultNutritionistId(supabaseAdmin);

    // Mettre à jour le profil avec les informations manquantes
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: 'patient', // S'assurer que le rôle est défini
        consultation_reason: data.consultationReason,
        marketing_consent: data.marketingConsent,
        accepted_terms_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur mise à jour profil:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil' },
        { status: 500 }
      );
    }

    // AUTH-001: Créer patient_profiles si n'existe pas encore
    if (!existingPatientProfile) {
      const { error: patientProfileError } = await supabaseAdmin
        .from('patient_profiles')
        .insert({
          user_id: user.id,
          first_name: existingProfile.first_name || '',
          last_name: existingProfile.last_name || '',
          phone: existingProfile.phone || null,
          nutritionist_id: defaultNutritionistId,
          assigned_at: defaultNutritionistId ? new Date().toISOString() : null,
          consultation_reason: data.consultationReason,
          consultation_reason_details: data.consultationReasonDetails || null,
          consent_data_processing: true,
          consent_data_processing_at: new Date().toISOString(),
          consent_marketing: data.marketingConsent || false,
          consent_marketing_at: data.marketingConsent
            ? new Date().toISOString()
            : null,
          consent_sharing_nutritionist: true,
          consent_sharing_nutritionist_at: new Date().toISOString(),
          status: 'pending',
          onboarding_step: 0,
        });

      if (patientProfileError) {
        console.error('Erreur création patient_profiles:', patientProfileError);
        // On continue malgré l'erreur - le patient_profiles peut être créé plus tard
      }
    }

    // AUTH-001: Créer user_settings si n'existe pas encore
    const { data: existingSettings } = await supabaseAdmin
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existingSettings) {
      const { error: settingsError } = await supabaseAdmin
        .from('user_settings')
        .insert({
          user_id: user.id,
          language: 'fr',
          timezone: 'Europe/Zurich',
          email_newsletter: data.marketingConsent || false,
        });

      if (settingsError) {
        console.error('Erreur création user_settings:', settingsError);
        // Ne pas bloquer pour cette erreur mineure
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profil complété avec succès',
      profile: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        firstName: updatedProfile.first_name,
        lastName: updatedProfile.last_name,
        consultationReason: updatedProfile.consultation_reason,
        accountStatus: updatedProfile.account_status,
        role: 'patient',
      },
      patientProfile: {
        nutritionistAssigned: !!defaultNutritionistId,
      },
    });
  } catch (error) {
    console.error('Erreur inattendue complete-profile:', error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    );
  }
}
