import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SecurityManager, getSecurityManager } from '@/lib/security';
// import { abTestingProtectionMiddleware } from './middleware-ab-protection'; // Supprimé - anciennes URLs /testing/ supprimées
import crypto from 'node:crypto';

/**
 * Middleware pour gérer l'authentification et la protection des routes
 * Basé sur la documentation Context7 pour Next.js et Supabase
 * Amélioré avec des mesures de sécurité renforcées
 *
 * TEMPORAIRE: Désactivation des vérifications d'authentification pour debug
 */
export async function middleware(req: NextRequest) {
  // Vérifier la protection A/B Testing en premier - SUPPRIMÉ car anciennes URLs /testing/ supprimées
  // const abProtectionResult = await abTestingProtectionMiddleware(req);
  // if (abProtectionResult) {
  //   return abProtectionResult; // Redirection vers access-denied si nécessaire
  // }

  // Initialiser le gestionnaire de sécurité
  const securityManager = getSecurityManager();
  const ip = SecurityManager.extractClientIP(req);
  const userAgent = req.headers.get('user-agent') || '';
  const { pathname } = req.nextUrl;

  // Générer un nonce pour CSP
  const nonce = SecurityManager.generateNonce();

  // Détecter les activités suspectes
  const suspiciousCheck = SecurityManager.detectSuspiciousActivity(
    req,
    userAgent
  );
  if (suspiciousCheck.isSuspicious) {
    await securityManager.logSecurityEvent({
      event_type: 'suspicious_activity',
      ip_address: ip,
      user_agent: userAgent,
      severity: suspiciousCheck.severity,
      metadata: {
        reasons: suspiciousCheck.reasons,
        pathname,
        method: req.method,
      },
    });

    // Bloquer les activités critiques
    if (suspiciousCheck.severity === 'critical') {
      return new NextResponse('Accès refusé', { status: 403 });
    }
  }
  // Créer une réponse de base
  let res = NextResponse.next({
    request: req,
  });

  // Créer le client Supabase avec gestion des cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Mettre à jour la requête
          req.cookies.set({
            name,
            value,
            ...options,
          });
          // Mettre à jour la réponse
          res = NextResponse.next({
            request: req,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          // Mettre à jour la requête
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          // Mettre à jour la réponse
          res = NextResponse.next({
            request: req,
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // IMPORTANT: Récupérer l'utilisateur et la session pour rafraîchir si nécessaire
  const [userResponse, sessionResponse] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  const {
    data: { user },
  } = userResponse;
  const {
    data: { session },
  } = sessionResponse;

  // Améliorer la détection de session en vérifiant les cookies d'authentification
  const hasAuthCookies =
    req.cookies.has('sb-access-token') ||
    req.cookies.has('sb-refresh-token') ||
    req.cookies.has('supabase-auth-token');

  // Configuration des routes
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/reset-password',
    '/auth/callback',
    '/auth/verify-mfa',
    '/auth/enroll-mfa', // Page d'enrôlement 2FA
    '/mfa-test', // Page de test 2FA
    '/profile-debug', // Page de debug profil
    '/debug-auth', // Page de debug authentification
    '/session-debug', // Page de debug session
    '/middleware-debug', // Page de debug middleware
    '/profile-diagnostic', // Page de diagnostic du profil
    '/debug-auth-status', // Page de diagnostic d'authentification
    '/onboarding', // Pages d'onboarding (gérées côté client)
    '/api/public', // Routes API publiques
  ];

  // Routes protégées qui nécessitent une authentification complète (AAL2)
  const protectedRoutes = [
    '/dashboard',
    '/nutritionist',
    '/admin',
    '/settings',
    '/api/protected', // Routes API protégées
  ];

  // Routes qui nécessitent une authentification de base (AAL1) - 2FA optionnel
  const authenticatedRoutes = [
    '/profile', // Page de profil accessible sans 2FA obligatoire
    '/profile-test',
    '/api/authenticated', // Routes API authentifiées
  ];

  // Vérifier le type de route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );
  const isAuthenticatedRoute = authenticatedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Logs de debug pour le développement
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [Middleware Debug]', {
      pathname,
      user: !!user,
      session: !!session,
      hasAuthCookies,
      isProtectedRoute,
      isAuthenticatedRoute,
      userRole: user?.user_metadata?.role,
    });
  }

  // Gestion des redirections pour les utilisateurs non authentifiés
  // IMPORTANT: Ne bloquer que les routes protégées, pas les routes authentifiées
  if (!user && isProtectedRoute) {
    // SOLUTION TEMPORAIRE: En mode développement, permettre l'accès aux routes admin
    // Le composant AdminGuard gérera la vérification côté client
    if (process.env.NODE_ENV === 'development' && pathname.startsWith('/admin')) {
      console.log('🔧 [Middleware] Mode développement: permettre l\'accès admin');
      // Continuer sans redirection - le composant AdminGuard gérera la vérification
    } else if (hasAuthCookies && pathname.startsWith('/admin')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 [Middleware] Permettre l\'accès admin avec cookies d\'auth');
      }
      // Continuer sans redirection - le composant AdminGuard gérera la vérification
    } else {
      // Logger la tentative d'accès non autorisée
      await securityManager.logSecurityEvent({
        event_type: 'login_attempt',
        ip_address: ip,
        user_agent: userAgent,
        severity: 'low',
        metadata: {
          attempted_path: pathname,
          reason: 'Unauthenticated access attempt to protected route',
          hasAuthCookies,
          sessionExists: !!session,
        },
      });

      const redirectUrl = new URL('/auth/signin', req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // SOLUTION: Pour les routes authentifiées comme /profile, permettre l'accès même si le middleware ne détecte pas la session
  // La page côté client vérifiera l'authentification et redirigera si nécessaire
  if (isAuthenticatedRoute && !user) {
    // Si on a des cookies d'authentification mais pas d'utilisateur, c'est probablement un problème de session
    if (hasAuthCookies) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `ℹ️ Middleware: Cookies d'auth détectés mais session invalide pour ${pathname}, rafraîchissement côté client`
        );
      }
    } else {
      // Pas de cookies d'auth, l'utilisateur n'est probablement pas connecté
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `ℹ️ Middleware: Aucune session détectée pour ${pathname}, vérification côté client`
        );
      }
    }
    // On laisse passer pour permettre à la page de gérer l'authentification côté client
    // Cela évite les boucles de redirection quand le middleware ne détecte pas la session
  }

  // Gestion des utilisateurs authentifiés
  if (user && session) {
    // Vérifier le niveau d'assurance d'authentification (AAL)
    const aal = session.access_token
      ? JSON.parse(atob(session.access_token.split('.')[1])).aal
      : 'aal1';

    // Récupérer le rôle utilisateur depuis les métadonnées
    const userRole = user.user_metadata?.role || 'patient';

    // Pour les routes protégées, vérifier si l'utilisateur a besoin de 2FA
    if (isProtectedRoute) {
      // Les nutritionnistes et admins doivent avoir AAL2 (2FA vérifié)
      if (
        (userRole === 'nutritionist' || userRole === 'admin') &&
        aal !== 'aal2'
      ) {
        // Rediriger vers la page de vérification 2FA
        const redirectUrl = new URL('/auth/verify-mfa', req.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Pour les routes authentifiées (comme /profile), permettre l'accès sans 2FA obligatoire
    // mais recommander la configuration 2FA pour les nutritionnistes
    if (isAuthenticatedRoute && userRole === 'nutritionist' && aal !== 'aal2') {
      // Pour les nutritionnistes, rediriger vers la configuration 2FA mais permettre l'accès temporaire
      console.log('Nutritionniste accédant à une route authentifiée sans 2FA');
      // On peut choisir de rediriger ou de permettre l'accès avec un avertissement
      // Pour l'instant, on permet l'accès mais on pourrait ajouter un avertissement
    }

    // Redirection des utilisateurs authentifiés depuis les pages d'auth
    if (
      pathname.startsWith('/auth/signin') ||
      pathname.startsWith('/auth/signup')
    ) {
      const redirectTo =
        req.nextUrl.searchParams.get('redirectTo') || '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    // Protection basée sur les rôles pour les routes admin
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Protection basée sur les rôles pour les routes nutritionniste
    if (pathname.startsWith('/nutritionist') && userRole !== 'nutritionist') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Ajouter des en-têtes de sécurité renforcés
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('X-DNS-Prefetch-Control', 'off');
  res.headers.set('X-Download-Options', 'noopen');
  res.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // En-têtes HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    res.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // En-têtes CSP simplifiés pour le développement
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    // CSP plus permissif en développement
    res.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https:;"
    );
  } else {
    // CSP strict en production
    const cspHeader = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com`,
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      'upgrade-insecure-requests',
    ].join('; ');

    res.headers.set(
      'Content-Security-Policy',
      cspHeader.replace(/\s{2,}/g, ' ').trim()
    );
  }

  // En-têtes pour la protection CSRF
  const csrfToken = SecurityManager.generateCSRFToken();
  res.headers.set('X-CSRF-Token', csrfToken);
  res.headers.set('X-Nonce', nonce);

  // En-têtes de permissions
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Logger les événements d'authentification réussis
  if (user && session) {
    await securityManager.logSecurityEvent({
      event_type: 'login_success',
      user_id: user.id,
      ip_address: ip,
      user_agent: userAgent,
      severity: 'low',
      metadata: {
        path: pathname,
        aal: session.access_token
          ? JSON.parse(atob(session.access_token.split('.')[1])).aal
          : 'aal1',
        role: user.user_metadata?.role || 'patient',
      },
    });
  }

  return res;
}

/**
 * Configuration du middleware
 * Spécifie sur quelles routes le middleware doit s'exécuter
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.well-known).*)',
  ],
};
