/**
 * Route API pour la connexion avec rate limiting
 * POST /api/auth/login
 *
 * AUTH-002: Connexion au compte
 * - Vérifie le nombre de tentatives échouées récentes
 * - Bloque temporairement après 5 échecs (15 minutes)
 * - Enregistre chaque tentative dans login_attempts
 * - Retourne les informations de session en cas de succès
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/types/database';

// Configuration du rate limiting
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// Schéma de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Messages d'erreur en français
const errorMessages: Record<string, string> = {
  'Invalid login credentials': 'Email ou mot de passe incorrect',
  'Email not confirmed':
    'Veuillez confirmer votre email avant de vous connecter',
  'Too many requests': 'Trop de tentatives. Veuillez réessayer plus tard',
  invalid_credentials: 'Email ou mot de passe incorrect',
  email_not_confirmed: 'Veuillez confirmer votre email avant de vous connecter',
};

function translateError(message: string): string {
  return errorMessages[message] || message;
}

/**
 * Extrait l'adresse IP du client
 */
function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return null;
}

/**
 * Récupère les informations sur les tentatives échouées récentes
 * Retourne le nombre de tentatives et le temps restant avant déblocage
 */
async function getFailedAttemptsInfo(
  supabase: ReturnType<typeof createClient<Database>>,
  email: string,
  windowMinutes: number
): Promise<{ count: number; remainingSeconds: number | null }> {
  const cutoffTime = new Date(
    Date.now() - windowMinutes * 60 * 1000
  ).toISOString();

  // Récupérer les tentatives échouées avec la date de la première
  const { data, count, error } = await supabase
    .from('login_attempts')
    .select('attempted_at', { count: 'exact' })
    .eq('email', email.toLowerCase())
    .eq('success', false)
    .gte('attempted_at', cutoffTime)
    .order('attempted_at', { ascending: true })
    .limit(1);

  if (error) {
    console.error('Error counting failed attempts:', error);
    return { count: 0, remainingSeconds: null };
  }

  const attemptCount = count ?? 0;

  // Calculer le temps restant si le compte est bloqué
  let remainingSeconds: number | null = null;
  if (attemptCount >= MAX_ATTEMPTS && data && data.length > 0) {
    const firstAttemptTime = new Date(data[0].attempted_at).getTime();
    const unlockTime = firstAttemptTime + windowMinutes * 60 * 1000;
    const now = Date.now();
    remainingSeconds = Math.max(0, Math.ceil((unlockTime - now) / 1000));
  }

  return { count: attemptCount, remainingSeconds };
}

/**
 * Enregistre une tentative de connexion
 */
async function recordAttempt(
  supabase: ReturnType<typeof createClient<Database>>,
  email: string,
  success: boolean,
  ipAddress: string | null,
  userAgent: string | null,
  failureReason: string | null
): Promise<void> {
  const { error } = await supabase.from('login_attempts').insert({
    email: email.toLowerCase(),
    success,
    ip_address: ipAddress,
    user_agent: userAgent,
    failure_reason: failureReason,
    attempted_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error recording login attempt:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier la configuration Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase not configured');
      return NextResponse.json(
        { error: "Service d'authentification non configuré" },
        { status: 500 }
      );
    }

    // Créer le client admin Supabase (bypass RLS)
    const supabaseAdmin = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parser et valider le body
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;
    const normalizedEmail = email.toLowerCase();
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || null;

    // 1. Vérifier le nombre de tentatives échouées récentes
    const { count: failedAttempts, remainingSeconds } =
      await getFailedAttemptsInfo(
        supabaseAdmin,
        normalizedEmail,
        LOCKOUT_MINUTES
      );

    console.log(
      `[Login] Email: ${normalizedEmail}, Failed attempts: ${failedAttempts}, Remaining seconds: ${remainingSeconds}`
    );

    // 2. Si trop de tentatives, bloquer
    if (failedAttempts >= MAX_ATTEMPTS) {
      const remainingMinutes = remainingSeconds
        ? Math.ceil(remainingSeconds / 60)
        : LOCKOUT_MINUTES;
      console.log(
        `[Login] Account locked for ${normalizedEmail}, ${remainingMinutes} min remaining`
      );
      return NextResponse.json(
        {
          error: `Compte temporairement bloqué.`,
          code: 'ACCOUNT_LOCKED',
          lockoutMinutes: LOCKOUT_MINUTES,
          remainingSeconds: remainingSeconds ?? LOCKOUT_MINUTES * 60,
          attemptsCount: failedAttempts,
        },
        { status: 429 }
      );
    }

    // 3. Tenter la connexion
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    // 4. En cas d'échec, enregistrer la tentative
    if (authError) {
      let failureReason = 'invalid_credentials';

      if (authError.message.includes('Email not confirmed')) {
        failureReason = 'email_not_confirmed';
      }

      // Enregistrer la tentative échouée
      await recordAttempt(
        supabaseAdmin,
        normalizedEmail,
        false,
        clientIP,
        userAgent,
        failureReason
      );

      const remainingAttempts = MAX_ATTEMPTS - failedAttempts - 1;
      console.log(
        `[Login] Failed for ${normalizedEmail}, remaining: ${remainingAttempts}`
      );

      return NextResponse.json(
        {
          error: translateError(authError.message),
          code: failureReason.toUpperCase(),
          remainingAttempts: Math.max(0, remainingAttempts),
        },
        { status: 401 }
      );
    }

    // 5. Connexion réussie - enregistrer le succès
    await recordAttempt(
      supabaseAdmin,
      normalizedEmail,
      true,
      clientIP,
      userAgent,
      null
    );

    console.log(`[Login] Success for ${normalizedEmail}`);

    // 6. Retourner les informations de session
    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: "Une erreur s'est produite lors de la connexion" },
      { status: 500 }
    );
  }
}
