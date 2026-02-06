import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Créer le middleware d'internationalisation
const handleI18nRouting = createIntlMiddleware(routing);

// Routes qui nécessitent une vérification d'auth (protégées)
const PROTECTED_ROUTES = ['/profile', '/settings', '/admin', '/dashboard'];

// Routes spécifiques par rôle
const PATIENT_ROUTES = ['/dashboard/patient'];
const NUTRITIONIST_ROUTES = ['/dashboard/nutritionist'];
const ADMIN_ROUTES = ['/admin'];

// Routes de redirection pour nutritionnistes en attente
const NUTRITIONIST_PENDING_ROUTES = ['/inscription/nutritionniste/en-attente'];
const NUTRITIONIST_REJECTED_ROUTES = ['/inscription/nutritionniste/rejete'];
const NUTRITIONIST_INFO_REQUIRED_ROUTES = [
  '/inscription/nutritionniste/info-requise',
];

// Types
type UserRole = 'patient' | 'nutritionist' | 'admin' | null;
type NutritionistStatus =
  | 'pending'
  | 'active'
  | 'rejected'
  | 'info_required'
  | 'suspended'
  | null;

interface RoleCheckResult {
  isAuthenticated: boolean;
  role: UserRole;
  nutritionistStatus: NutritionistStatus;
}

/**
 * Vérifie le rôle de l'utilisateur
 */
async function checkUserRole(
  request: NextRequest,
  response: NextResponse
): Promise<{ response: NextResponse; roleData: RoleCheckResult }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const defaultResult: RoleCheckResult = {
    isAuthenticated: false,
    role: null,
    nutritionistStatus: null,
  };

  // Vérifier si Supabase est configuré
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === 'your_supabase_project_url' ||
    supabaseAnonKey === 'your_supabase_anon_key'
  ) {
    return { response, roleData: defaultResult };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
    cookieOptions: {
      name: 'nutrisensia-auth',
      domain:
        process.env.NODE_ENV === 'production' ? '.nutrisensia.ch' : undefined,
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    },
  });

  // Récupérer l'utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { response, roleData: defaultResult };
  }

  // Récupérer le rôle depuis profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = (profile?.role as UserRole) || 'patient';
  let nutritionistStatus: NutritionistStatus = null;

  // Si nutritionniste, récupérer le statut
  if (role === 'nutritionist') {
    const { data: nutritionistProfile } = await supabase
      .from('nutritionist_profiles')
      .select('status')
      .eq('user_id', user.id)
      .single();

    nutritionistStatus =
      (nutritionistProfile?.status as NutritionistStatus) || 'pending';
  }

  return {
    response,
    roleData: {
      isAuthenticated: true,
      role,
      nutritionistStatus,
    },
  };
}

/**
 * Vérifie si le chemin correspond à une des routes
 */
function matchesRoutes(pathname: string, routes: string[]): boolean {
  return routes.some(route => pathname.startsWith(route));
}

/**
 * Extrait le préfixe de locale du chemin
 */
function getLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})\//);
  if (match && ['fr', 'en'].includes(match[1])) {
    return `/${match[1]}`;
  }
  return '';
}

/**
 * Retire le préfixe de locale du chemin
 */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/[a-z]{2}(?=\/)/, '');
}

/**
 * Gère les redirections basées sur le rôle
 */
function handleRoleBasedRedirect(
  request: NextRequest,
  roleData: RoleCheckResult
): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  const localePrefix = getLocalePrefix(pathname);
  const cleanPath = stripLocale(pathname);

  const { isAuthenticated, role, nutritionistStatus } = roleData;

  // Routes protégées : rediriger vers connexion si non authentifié
  if (!isAuthenticated && matchesRoutes(cleanPath, PROTECTED_ROUTES)) {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/auth/signin`;
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Si non authentifié, pas de redirection supplémentaire
  if (!isAuthenticated) {
    return null;
  }

  // Gestion des nutritionnistes avec statut spécial
  if (role === 'nutritionist') {
    // Nutritionniste en attente de validation
    if (nutritionistStatus === 'pending') {
      // Autoriser l'accès à la page d'attente
      if (matchesRoutes(cleanPath, NUTRITIONIST_PENDING_ROUTES)) {
        return null;
      }
      // Rediriger toute autre page dashboard vers la page d'attente
      if (matchesRoutes(cleanPath, ['/dashboard'])) {
        const url = request.nextUrl.clone();
        url.pathname = `${localePrefix}/inscription/nutritionniste/en-attente`;
        return NextResponse.redirect(url);
      }
    }

    // Nutritionniste rejeté
    if (nutritionistStatus === 'rejected') {
      if (matchesRoutes(cleanPath, NUTRITIONIST_REJECTED_ROUTES)) {
        return null;
      }
      if (matchesRoutes(cleanPath, ['/dashboard'])) {
        const url = request.nextUrl.clone();
        url.pathname = `${localePrefix}/inscription/nutritionniste/rejete`;
        return NextResponse.redirect(url);
      }
    }

    // Nutritionniste avec demande d'info
    if (nutritionistStatus === 'info_required') {
      if (matchesRoutes(cleanPath, NUTRITIONIST_INFO_REQUIRED_ROUTES)) {
        return null;
      }
      if (matchesRoutes(cleanPath, ['/dashboard'])) {
        const url = request.nextUrl.clone();
        url.pathname = `${localePrefix}/inscription/nutritionniste/info-requise`;
        return NextResponse.redirect(url);
      }
    }

    // Nutritionniste suspendu - traiter comme rejeté pour l'instant
    if (nutritionistStatus === 'suspended') {
      if (matchesRoutes(cleanPath, ['/dashboard'])) {
        const url = request.nextUrl.clone();
        url.pathname = `${localePrefix}/inscription/nutritionniste/rejete`;
        return NextResponse.redirect(url);
      }
    }
  }

  // Redirection /dashboard vers le bon dashboard selon le rôle
  if (cleanPath === '/dashboard' || cleanPath === '/dashboard/') {
    const url = request.nextUrl.clone();

    if (role === 'patient') {
      url.pathname = `${localePrefix}/dashboard/patient`;
      return NextResponse.redirect(url);
    } else if (role === 'nutritionist' && nutritionistStatus === 'active') {
      url.pathname = `${localePrefix}/dashboard/nutritionist`;
      return NextResponse.redirect(url);
    } else if (role === 'admin') {
      url.pathname = `${localePrefix}/admin`;
      return NextResponse.redirect(url);
    }
  }

  // Protection des routes patient
  if (matchesRoutes(cleanPath, PATIENT_ROUTES) && role !== 'patient') {
    const url = request.nextUrl.clone();
    if (role === 'nutritionist' && nutritionistStatus === 'active') {
      url.pathname = `${localePrefix}/dashboard/nutritionist`;
    } else if (role === 'admin') {
      url.pathname = `${localePrefix}/admin`;
    } else {
      url.pathname = `${localePrefix}/dashboard`;
    }
    return NextResponse.redirect(url);
  }

  // Protection des routes nutritionniste
  if (matchesRoutes(cleanPath, NUTRITIONIST_ROUTES)) {
    if (role !== 'nutritionist' || nutritionistStatus !== 'active') {
      const url = request.nextUrl.clone();
      if (role === 'patient') {
        url.pathname = `${localePrefix}/dashboard/patient`;
      } else if (role === 'admin') {
        url.pathname = `${localePrefix}/admin`;
      } else {
        url.pathname = `${localePrefix}/dashboard`;
      }
      return NextResponse.redirect(url);
    }
  }

  // Protection des routes admin
  if (matchesRoutes(cleanPath, ADMIN_ROUTES) && role !== 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/403`;
    return NextResponse.redirect(url);
  }

  return null;
}

/**
 * Middleware principal pour Next.js
 *
 * Gère :
 * 1. Internationalisation (next-intl)
 * 2. Rafraîchissement des sessions Supabase
 * 3. Routage basé sur le rôle (AUTH-012)
 * 4. En-têtes de sécurité
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const cleanPath = stripLocale(pathname);

  // 1. D'abord, gérer l'internationalisation
  const intlResponse = handleI18nRouting(request);

  // Si next-intl retourne une réponse (redirection), on l'utilise comme base
  let response = intlResponse || NextResponse.next({ request });

  // 2. Vérifier le rôle uniquement pour les routes protégées (performance)
  const isProtectedRoute = matchesRoutes(cleanPath, PROTECTED_ROUTES);

  if (isProtectedRoute) {
    const { response: updatedResponse, roleData } = await checkUserRole(
      request,
      response
    );
    response = updatedResponse;

    // 3. Gérer les redirections basées sur le rôle
    const roleRedirect = handleRoleBasedRedirect(request, roleData);
    if (roleRedirect) {
      // Copier les en-têtes de sécurité vers la redirection
      roleRedirect.headers.set('X-Frame-Options', 'DENY');
      roleRedirect.headers.set('X-Content-Type-Options', 'nosniff');
      roleRedirect.headers.set(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
      );
      return roleRedirect;
    }
  }

  // 4. Ajouter des en-têtes de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // En-têtes CSP (plus permissifs en développement)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://meet.jit.si; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss:; frame-src 'self' https://meet.jit.si;"
    );
  }

  // Logs de debug pour le développement
  if (isDev && isProtectedRoute) {
    console.log('🔍 [Middleware Debug]', {
      pathname: request.nextUrl.pathname,
      isProtectedRoute,
    });
  }

  return response;
}

/**
 * Configuration du middleware
 * Spécifie sur quelles routes le middleware doit s'exécuter
 * Inclut la gestion des locales pour next-intl
 */
export const config = {
  matcher: [
    /*
     * Correspond à toutes les routes sauf :
     * - api (routes API - gérées séparément)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (icône du site)
     * - public (fichiers publics)
     * - .well-known (fichiers de configuration)
     * - test-colors (pages de test de palettes - pas de locale nécessaire)
     * - auth (pages d'authentification - pas de locale nécessaire)
     * - fichiers avec extension (images, css, js, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.well-known|test-colors|.*\\..*).*)',
  ],
};
