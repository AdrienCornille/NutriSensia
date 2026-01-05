import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Créer le middleware d'internationalisation
const handleI18nRouting = createIntlMiddleware(routing);

/**
 * Middleware simplifié pour gérer l'internationalisation
 * Version allégée pour éviter les erreurs de compilation
 */
export async function middleware(req: NextRequest) {
  // 1. D'abord, gérer l'internationalisation
  const intlResponse = handleI18nRouting(req);

  // Si next-intl retourne une réponse (redirection), on l'utilise comme base
  let res = intlResponse || NextResponse.next({ request: req });

  const { pathname } = req.nextUrl;

  // Logs de debug pour le développement
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [Middleware Debug]', {
      pathname,
    });
  }

  // Ajouter des en-têtes de sécurité de base
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // En-têtes CSP simplifiés pour le développement
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    // CSP plus permissif en développement
    res.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss:;"
    );
  }

  return res;
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
     * - fichiers avec extension (images, css, js, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.well-known|test-colors|.*\\..*).*)',
  ],
};
