import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SecurityManager, getSecurityManager } from '@/lib/security';
import crypto from 'node:crypto';

/**
 * Middleware pour gérer l'authentification et la protection des routes
 * Basé sur la documentation Context7 pour Next.js et Supabase
 * Amélioré avec des mesures de sécurité renforcées
 */
export async function middleware(req: NextRequest) {
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

  // IMPORTANT: Récupérer l'utilisateur pour rafraîchir la session si nécessaire
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Récupérer la session actuelle
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Configuration des routes
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/reset-password',
    '/auth/callback',
    '/auth/verify-mfa',
    '/mfa-test', // Page de test 2FA (temporaire)
    '/api/public', // Routes API publiques
  ];

  // Routes protégées qui nécessitent une authentification complète (AAL2)
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/nutritionist',
    '/admin',
    '/settings',
    '/api/protected', // Routes API protégées
  ];

  // Routes qui nécessitent une authentification de base (AAL1)
  const authenticatedRoutes = [
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

  // Gestion des redirections pour les utilisateurs non authentifiés
  if (!user && (isProtectedRoute || isAuthenticatedRoute)) {
    // Logger la tentative d'accès non autorisée
    await securityManager.logSecurityEvent({
      event_type: 'login_attempt',
      ip_address: ip,
      user_agent: userAgent,
      severity: 'low',
      metadata: {
        attempted_path: pathname,
        reason: 'Unauthenticated access attempt',
      },
    });

    const redirectUrl = new URL('/auth/signin', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
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

  // En-têtes CSP dynamiques avec nonce
  const isDev = process.env.NODE_ENV === 'development';
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ''} https://www.googletagmanager.com`,
    `style-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-inline'" : ''} https://fonts.googleapis.com`,
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
