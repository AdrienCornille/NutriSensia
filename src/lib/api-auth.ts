import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@/lib/supabase/server';

// Types pour les permissions API
export interface APIPermissions {
  requireAuth?: boolean;
  requiredRole?: 'nutritionist' | 'patient' | 'admin';
  requiredRoles?: ('nutritionist' | 'patient' | 'admin')[];
  require2FA?: boolean;
}

// Types pour la réponse d'authentification
export interface AuthResult {
  user: any;
  session: any;
  error?: string;
}

/**
 * Créer un client Supabase côté serveur pour les routes API
 * Utilise la même configuration que server.ts pour la cohérence des cookies
 *
 * IMPORTANT: Ce client utilise l'anon key avec les cookies de session.
 * Pour que auth.uid() fonctionne dans les politiques RLS, la session
 * doit être valide et le JWT doit être correctement passé à la base de données.
 */
export async function createServerSupabaseClient() {
  return createSupabaseClient();
}

/**
 * Vérifier l'authentification pour les routes API
 */
export async function verifyAuth(
  permissions: APIPermissions = {}
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  try {
    // Récupérer la session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return { user: null, session: null, error: 'Erreur de session' };
    }

    if (!session) {
      if (permissions.requireAuth) {
        return { user: null, session: null, error: 'Authentification requise' };
      }
      return { user: null, session: null };
    }

    // Récupérer l'utilisateur
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { user: null, session: null, error: 'Utilisateur invalide' };
    }

    // Récupérer le profil si des vérifications de rôle sont nécessaires
    let userRole = user.user_metadata?.role || 'patient';

    if (
      permissions.requiredRole ||
      permissions.requiredRoles ||
      permissions.require2FA
    ) {
      // Récupérer le rôle depuis la table profiles (source de vérité)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      userRole = profile?.role || user.user_metadata?.role || 'patient';
    }

    // Vérifier les rôles requis
    if (permissions.requiredRole || permissions.requiredRoles) {
      if (permissions.requiredRole && userRole !== permissions.requiredRole) {
        return {
          user: null,
          session: null,
          error: `Rôle requis: ${permissions.requiredRole}`,
        };
      }

      if (
        permissions.requiredRoles &&
        !permissions.requiredRoles.includes(userRole)
      ) {
        return {
          user: null,
          session: null,
          error: `Rôles requis: ${permissions.requiredRoles.join(', ')}`,
        };
      }
    }

    // Vérifier 2FA si requis
    if (permissions.require2FA) {
      const requires2FA = userRole === 'nutritionist' || userRole === 'admin';

      if (requires2FA && !user.user_metadata?.two_factor_verified) {
        return {
          user: null,
          session: null,
          error: 'Authentification à deux facteurs requise',
        };
      }
    }

    return { user, session };
  } catch (error) {
    console.error("Erreur lors de la vérification d'authentification:", error);
    return { user: null, session: null, error: 'Erreur interne du serveur' };
  }
}

/**
 * Wrapper pour protéger les routes API
 */
export function withAuth(permissions: APIPermissions = {}) {
  return function (
    handler: (req: NextRequest, auth: AuthResult) => Promise<NextResponse>
  ) {
    return async function (req: NextRequest): Promise<NextResponse> {
      try {
        // Vérifier l'authentification
        const auth = await verifyAuth(permissions);

        if (auth.error) {
          return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        // Appeler le handler avec l'authentification
        return await handler(req, auth);
      } catch (error) {
        console.error("Erreur dans le wrapper d'authentification:", error);
        return NextResponse.json(
          { error: 'Erreur interne du serveur' },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Wrapper spécifique pour les routes admin
 */
export function withAdminAuth(
  handler: (req: NextRequest, auth: AuthResult) => Promise<NextResponse>
) {
  return withAuth({ requireAuth: true, requiredRole: 'admin' })(handler);
}

/**
 * Wrapper spécifique pour les routes nutritionniste
 */
export function withNutritionistAuth(
  handler: (req: NextRequest, auth: AuthResult) => Promise<NextResponse>
) {
  return withAuth({ requireAuth: true, requiredRole: 'nutritionist' })(handler);
}

/**
 * Wrapper spécifique pour les routes patient
 */
export function withPatientAuth(
  handler: (req: NextRequest, auth: AuthResult) => Promise<NextResponse>
) {
  return withAuth({ requireAuth: true, requiredRole: 'patient' })(handler);
}

/**
 * Wrapper pour les routes nécessitant 2FA
 */
export function with2FAAuth(
  handler: (req: NextRequest, auth: AuthResult) => Promise<NextResponse>
) {
  return withAuth({ requireAuth: true, require2FA: true })(handler);
}

/**
 * Middleware pour les routes API
 */
export async function apiAuthMiddleware(
  req: NextRequest
): Promise<NextResponse | null> {
  // Vérifier si c'est une route API
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return null;
  }

  // Routes API publiques
  const publicApiRoutes = ['/api/public', '/api/health', '/api/webhooks'];

  const isPublicRoute = publicApiRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return null;
  }

  // Routes API protégées
  const protectedApiRoutes = [
    '/api/protected',
    '/api/admin',
    '/api/nutritionist',
  ];

  const isProtectedRoute = protectedApiRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // Vérifier les rôles spécifiques
    if (req.nextUrl.pathname.startsWith('/api/admin')) {
      const adminAuth = await verifyAuth({
        requireAuth: true,
        requiredRole: 'admin',
      });
      if (adminAuth.error) {
        return NextResponse.json({ error: adminAuth.error }, { status: 403 });
      }
    }

    if (req.nextUrl.pathname.startsWith('/api/nutritionist')) {
      const nutritionistAuth = await verifyAuth({
        requireAuth: true,
        requiredRole: 'nutritionist',
      });
      if (nutritionistAuth.error) {
        return NextResponse.json(
          { error: nutritionistAuth.error },
          { status: 403 }
        );
      }
    }
  }

  return null;
}

/**
 * Utilitaires pour les réponses API
 */
export const apiResponse = {
  success: (data: any, status = 200) => {
    return NextResponse.json({ success: true, data }, { status });
  },

  error: (message: string, status = 400) => {
    return NextResponse.json({ success: false, error: message }, { status });
  },

  unauthorized: (message = 'Non autorisé') => {
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 }
    );
  },

  forbidden: (message = 'Accès interdit') => {
    return NextResponse.json(
      { success: false, error: message },
      { status: 403 }
    );
  },

  notFound: (message = 'Ressource non trouvée') => {
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 }
    );
  },

  serverError: (message = 'Erreur interne du serveur') => {
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  },
};
