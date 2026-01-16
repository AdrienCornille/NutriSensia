/**
 * Route API pour créer automatiquement un profil utilisateur après OAuth
 * POST /api/auth/create-oauth-profile
 *
 * Appelé après une connexion OAuth (Google, etc.) pour créer le profil
 * avec les métadonnées récupérées du provider
 *
 * Accepte l'authentification via:
 * - Cookies (session normale)
 * - Header Authorization: Bearer <token> (pour le callback OAuth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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

    // Vérifier si un Bearer token est fourni (cas du callback OAuth)
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
        console.error('Erreur auth avec token:', userError);
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

    // Vérifier si un profil existe déjà (utiliser admin pour bypass RLS)
    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from('profiles')
      .select('id, consultation_reason')
      .eq('id', user.id)
      .single();

    if (existingProfile && !existingProfileError) {
      // Profil existe déjà - vérifier s'il est complet
      // Un profil est considéré "complet" si consultation_reason existe ET n'est pas 'autre' (placeholder)
      const profile = existingProfile as { id: string; consultation_reason: string | null };
      const isComplete = !!profile.consultation_reason && profile.consultation_reason !== 'autre';
      return NextResponse.json({
        success: true,
        profileExists: true,
        isComplete,
        message: 'Profil existant',
      });
    }

    // Extraire les informations des métadonnées OAuth
    const firstName =
      user.user_metadata?.first_name ||
      user.user_metadata?.given_name ||
      user.user_metadata?.name?.split(' ')[0] ||
      '';
    const lastName =
      user.user_metadata?.last_name ||
      user.user_metadata?.family_name ||
      user.user_metadata?.name?.split(' ').slice(1).join(' ') ||
      '';

    // Déterminer le provider auth
    const authProvider =
      user.app_metadata?.provider ||
      user.app_metadata?.providers?.[0] ||
      'oauth';

    // Créer le profil avec une valeur placeholder pour consultation_reason
    // (la vraie valeur sera mise à jour lors de la complétion du profil)
    // Note: avatar_url n'existe pas dans le schéma profiles, donc on ne l'inclut pas
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        first_name: firstName,
        last_name: lastName,
        auth_provider: authProvider,
        account_status: 'trial',
        trial_started_at: new Date().toISOString(),
        // Valeur placeholder - sera mise à jour dans complete-profile
        consultation_reason: 'autre',
        // accepted_terms_at sera ajouté lors de la complétion du profil
      })
      .select()
      .single();

    if (profileError) {
      // Si c'est une erreur de duplication (profil existe déjà), traiter comme un succès
      if (profileError.code === '23505') {
        // Récupérer le profil existant
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, consultation_reason')
          .eq('id', user.id)
          .single();

        const isComplete = existingProfile?.consultation_reason && existingProfile.consultation_reason !== 'autre';
        return NextResponse.json({
          success: true,
          profileExists: true,
          isComplete,
          message: 'Profil existant',
        });
      }

      console.error('Erreur création profil OAuth:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code,
      });
      return NextResponse.json(
        {
          error: 'Erreur lors de la création du profil',
          debug: {
            message: profileError.message,
            code: profileError.code,
            hint: profileError.hint,
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profileExists: false,
        isComplete: false,
        message: 'Profil créé avec succès',
        profile: {
          id: profileData.id,
          email: profileData.email,
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          authProvider: profileData.auth_provider,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur inattendue create-oauth-profile:', error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    );
  }
}
