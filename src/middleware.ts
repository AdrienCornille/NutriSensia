import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Créer le middleware d'internationalisation
const handleI18nRouting = createIntlMiddleware(routing);

// Routes qui nécessitent une vérification d'auth (protégées)
const PROTECTED_ROUTES = ['/profile', '/settings', '/admin', '/dashboard'];

/**
 * Met à jour la session Supabase UNIQUEMENT pour les routes protégées
 * Évite les appels réseau inutiles sur les pages publiques
 */
async function updateSession(request: NextRequest, response: NextResponse) {
  const pathname = request.nextUrl.pathname;

  // Skip l'appel Supabase pour les pages publiques (performance)
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (!isProtectedRoute) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Vérifier si Supabase est configuré
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === 'your_supabase_project_url' ||
    supabaseAnonKey === 'your_supabase_anon_key'
  ) {
    return response;
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
  });

  // Vérifier l'utilisateur uniquement sur les routes protégées
  await supabase.auth.getUser();

  return response;
}

/**
 * Middleware principal pour Next.js
 *
 * Gère :
 * 1. Internationalisation (next-intl)
 * 2. Rafraîchissement des sessions Supabase
 * 3. En-têtes de sécurité
 */
export async function middleware(request: NextRequest) {
  // 1. D'abord, gérer l'internationalisation
  const intlResponse = handleI18nRouting(request);

  // Si next-intl retourne une réponse (redirection), on l'utilise comme base
  let response = intlResponse || NextResponse.next({ request });

  // 2. Rafraîchir la session Supabase (met à jour les cookies si nécessaire)
  response = await updateSession(request, response);

  // 3. Ajouter des en-têtes de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // En-têtes CSP (plus permissifs en développement)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://app.cal.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss:; frame-src 'self' https://app.cal.com;"
    );
  }

  // Logs de debug pour le développement
  if (isDev) {
    console.log('🔍 [Middleware Debug]', {
      pathname: request.nextUrl.pathname,
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
