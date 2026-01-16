/**
 * Route API pour compléter un profil utilisateur OAuth
 * POST /api/auth/complete-profile
 *
 * Appelé après la création du profil OAuth pour ajouter
 * la raison de consultation et l'acceptation des conditions
 *
 * Accepte l'authentification via:
 * - Cookies (session normale)
 * - Header Authorization: Bearer <token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

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
  marketingConsent: z.boolean().optional().default(false),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
});

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

    // Créer le client admin pour les opérations de base de données
    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Vérifier si un Bearer token est fourni
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (bearerToken) {
      // Utiliser le token directement pour authentifier
      const supabaseWithToken = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      });

      const { data: userData, error: userError } = await supabaseWithToken.auth.getUser(bearerToken);

      if (userError || !userData.user) {
        return NextResponse.json(
          { error: 'Token invalide' },
          { status: 401 }
        );
      }

      user = userData.user;
    } else {
      // Utiliser les cookies (session normale)
      const supabase = await createClient();
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !cookieUser) {
        return NextResponse.json(
          { error: 'Non authentifié' },
          { status: 401 }
        );
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

    const data = validationResult.data;

    // Vérifier si un profil existe (utiliser admin pour bypass RLS)
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id, consultation_reason')
      .eq('id', user.id)
      .single();

    if (profileCheckError || !existingProfile) {
      return NextResponse.json(
        { error: 'Profil non trouvé. Veuillez vous reconnecter.' },
        { status: 404 }
      );
    }

    // Mettre à jour le profil avec les informations manquantes
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
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
