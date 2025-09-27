import { NextRequest } from 'next/server';
import { withAuth, apiResponse } from '@/lib/api-auth';

/**
 * Route API protégée pour récupérer les informations utilisateur
 * Nécessite une authentification
 */
export const GET = withAuth({ requireAuth: true })(async (
  req: NextRequest,
  auth
) => {
  try {
    // L'utilisateur est déjà authentifié grâce au wrapper
    const { user, session } = auth;

    // Récupérer des informations supplémentaires depuis la base de données
    // (exemple avec Supabase)

    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name,
      role: user.user_metadata?.role || 'patient',
      emailVerified: user.email_confirmed_at ? true : false,
      twoFactorEnabled: user.user_metadata?.two_factor_enabled || false,
      twoFactorVerified: user.user_metadata?.two_factor_verified || false,
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
    };

    return apiResponse.success(userData);
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des données utilisateur:',
      error
    );
    return apiResponse.serverError(
      'Erreur lors de la récupération des données utilisateur'
    );
  }
});

/**
 * Route API pour mettre à jour les informations utilisateur
 * Nécessite une authentification
 */
export const PUT = withAuth({ requireAuth: true })(async (
  req: NextRequest,
  auth
) => {
  try {
    const { user } = auth;
    const body = await req.json();

    // Validation des données
    const { fullName, phone } = body;

    if (!fullName || typeof fullName !== 'string') {
      return apiResponse.error(
        'Le nom complet est requis et doit être une chaîne de caractères'
      );
    }

    // Mettre à jour les métadonnées utilisateur
    // (exemple avec Supabase)

    const updatedUserData = {
      full_name: fullName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    };

    // Ici, vous mettriez à jour la base de données
    // const { data, error } = await supabase
    //   .from('profiles')
    //   .update(updatedUserData)
    //   .eq('id', user.id)
    //   .select()
    //   .single();

    // Pour l'exemple, on retourne les données mises à jour
    const responseData = {
      id: user.id,
      email: user.email,
      fullName: updatedUserData.full_name,
      phone: updatedUserData.phone,
      role: user.user_metadata?.role || 'patient',
      updatedAt: updatedUserData.updated_at,
    };

    return apiResponse.success(responseData);
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour des données utilisateur:',
      error
    );
    return apiResponse.serverError(
      'Erreur lors de la mise à jour des données utilisateur'
    );
  }
});
