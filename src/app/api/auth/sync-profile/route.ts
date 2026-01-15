/**
 * Route API pour synchroniser/créer un profil utilisateur
 * POST /api/auth/sync-profile
 *
 * Utilisé pour créer un profil dans la table profiles si l'utilisateur
 * existe dans auth.users mais n'a pas de profil (ex: inscription Google OAuth
 * ou si le trigger n'a pas fonctionné)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schéma de validation pour la synchronisation du profil
const syncProfileSchema = z.object({
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
  marketingConsent: z.boolean().optional().default(false),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
});

export async function POST(request: NextRequest) {
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

    // Vérifier si un profil existe déjà
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        {
          error: 'Un profil existe déjà pour cet utilisateur',
          code: 'PROFILE_EXISTS',
        },
        { status: 409 }
      );
    }

    // Parser et valider les données
    const body = await request.json();
    const validationResult = syncProfileSchema.safeParse(body);

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

    // Extraire les informations des métadonnées auth si non fournies
    const firstName =
      data.firstName ||
      user.user_metadata?.first_name ||
      user.user_metadata?.given_name ||
      '';
    const lastName =
      data.lastName ||
      user.user_metadata?.last_name ||
      user.user_metadata?.family_name ||
      '';

    if (!firstName || !lastName) {
      return NextResponse.json(
        {
          error: 'Le prénom et le nom sont requis',
          code: 'MISSING_NAME',
        },
        { status: 400 }
      );
    }

    // Déterminer le provider auth
    const authProvider =
      user.app_metadata?.provider || user.app_metadata?.providers?.[0] || 'email';

    // Créer le profil via le client Supabase admin
    // Note: On utilise le service role key pour bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration du serveur incomplète' },
        { status: 500 }
      );
    }

    // Importer dynamiquement createClient de @supabase/supabase-js
    const { createClient: createAdminClient } = await import(
      '@supabase/supabase-js'
    );
    const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Créer le profil
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        first_name: firstName,
        last_name: lastName,
        phone: data.phone || null,
        consultation_reason: data.consultationReason,
        marketing_consent: data.marketingConsent,
        accepted_terms_at: new Date().toISOString(),
        account_status: 'trial',
        auth_provider: authProvider,
        trial_started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error('Erreur création profil sync:', profileError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil' },
        { status: 500 }
      );
    }

    // Mettre à jour les métadonnées auth si nécessaire
    if (firstName || lastName) {
      await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Profil créé avec succès',
        profile: {
          id: profileData.id,
          email: profileData.email,
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          fullName: `${profileData.first_name} ${profileData.last_name}`,
          consultationReason: profileData.consultation_reason,
          accountStatus: profileData.account_status,
          authProvider: profileData.auth_provider,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur inattendue sync-profile:', error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    );
  }
}
