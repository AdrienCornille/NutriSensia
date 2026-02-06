/**
 * Route API pour l'inscription d'un patient
 * POST /api/auth/register
 *
 * AUTH-001: Création de compte patient
 * - Crée l'utilisateur dans Supabase Auth
 * - Crée le profil dans la table profiles avec role='patient'
 * - Crée le patient_profiles avec assignation au nutritionniste par défaut
 * - Crée les user_settings avec valeurs par défaut
 * - Envoie l'email de confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/types/database';

// Schéma de validation pour l'inscription
const registerSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50),
  phone: z.string().optional(),
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

type RegisterInput = z.infer<typeof registerSchema>;

// Messages d'erreur en français
const errorMessages: Record<string, string> = {
  'User already registered': 'Un compte existe déjà avec cet email',
  'Invalid email': 'Adresse email invalide',
  'Password should be at least 6 characters':
    'Le mot de passe doit contenir au moins 6 caractères',
  'Email rate limit exceeded':
    'Trop de tentatives. Veuillez réessayer plus tard',
};

function translateError(message: string): string {
  return errorMessages[message] || message;
}

/**
 * Récupère l'ID du nutritionniste par défaut (NutriSensia)
 * Utilise la variable d'environnement ou cherche le premier nutritionniste actif
 */
async function getDefaultNutritionistId(
  supabaseAdmin: ReturnType<typeof createClient<Database>>
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
    // Vérifier la configuration Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration du serveur incomplète' },
        { status: 500 }
      );
    }

    // Créer le client Supabase avec la clé de service (pour bypass RLS)
    const supabaseAdmin = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parser et valider les données
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

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

    const data: RegisterInput = validationResult.data;

    // Récupérer le nutritionniste par défaut
    const defaultNutritionistId = await getDefaultNutritionistId(supabaseAdmin);

    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: false, // L'utilisateur devra confirmer son email
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`,
          role: 'patient', // Rôle stocké dans les métadonnées
        },
      });

    if (authError) {
      console.error('Erreur création utilisateur auth:', authError);
      return NextResponse.json(
        { error: translateError(authError.message) },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Fonction de nettoyage en cas d'erreur
    const cleanupOnError = async () => {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    };

    // 2. Créer le profil dans la table profiles avec role='patient'
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        role: 'patient', // AUTH-001: Rôle explicitement défini
        phone: data.phone || null,
        consultation_reason: data.consultationReason,
        marketing_consent: data.marketingConsent,
        accepted_terms_at: new Date().toISOString(),
        account_status: 'trial',
        auth_provider: 'email',
        trial_started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error('Erreur création profil:', profileError);
      await cleanupOnError();
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil' },
        { status: 500 }
      );
    }

    // 3. Créer le patient_profiles avec assignation au nutritionniste par défaut
    const { data: patientProfileData, error: patientProfileError } =
      await supabaseAdmin
        .from('patient_profiles')
        .insert({
          user_id: userId,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone || null,
          nutritionist_id: defaultNutritionistId,
          assigned_at: defaultNutritionistId ? new Date().toISOString() : null,
          consultation_reason: data.consultationReason,
          consultation_reason_details: data.consultationReasonDetails || null,
          consent_data_processing: true, // Accepté via les conditions
          consent_data_processing_at: new Date().toISOString(),
          consent_marketing: data.marketingConsent || false,
          consent_marketing_at: data.marketingConsent
            ? new Date().toISOString()
            : null,
          consent_sharing_nutritionist: true,
          consent_sharing_nutritionist_at: new Date().toISOString(),
          status: 'pending',
          onboarding_step: 0,
        })
        .select()
        .single();

    if (patientProfileError) {
      console.error('Erreur création patient_profiles:', patientProfileError);
      // Supprimer le profil créé
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await cleanupOnError();
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil patient' },
        { status: 500 }
      );
    }

    // 4. Créer les user_settings avec valeurs par défaut
    const { error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .insert({
        user_id: userId,
        // Valeurs par défaut - le reste sera défini par la BDD
        language: 'fr',
        timezone: 'Europe/Zurich',
        email_newsletter: data.marketingConsent || false,
      });

    if (settingsError) {
      console.error('Erreur création user_settings:', settingsError);
      // Ne pas bloquer l'inscription pour cette erreur mineure
      // Les paramètres peuvent être créés plus tard
    }

    // 5. Envoyer l'email de confirmation
    const { error: emailError } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: data.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (emailError) {
      console.error('Erreur envoi email confirmation:', emailError);
      // On ne supprime pas le compte car l'utilisateur pourra renvoyer l'email
    }

    // Réponse succès
    return NextResponse.json(
      {
        success: true,
        message:
          'Compte créé avec succès. Veuillez vérifier votre email pour confirmer votre inscription.',
        user: {
          id: userId,
          email: authData.user.email,
        },
        profile: {
          id: profileData.id,
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          role: 'patient',
          accountStatus: profileData.account_status,
        },
        patientProfile: {
          id: patientProfileData.id,
          nutritionistAssigned: !!defaultNutritionistId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur inattendue lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    );
  }
}
