/**
 * Route API pour renvoyer l'email de confirmation
 * POST /api/auth/resend-confirmation
 *
 * Permet à un utilisateur de demander un nouvel email de confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schéma de validation
const resendSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
});

// Rate limiting simple en mémoire (en production, utiliser Redis)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // Max 3 tentatives par minute

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const key = email.toLowerCase();
  const record = rateLimitMap.get(key);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier la configuration Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration du serveur incomplète' },
        { status: 500 }
      );
    }

    // Parser et valider les données
    const body = await request.json();
    const validationResult = resendSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Adresse e-mail invalide' },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Vérifier le rate limiting
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        {
          error: 'Trop de tentatives. Veuillez attendre une minute avant de réessayer.',
          code: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }

    // Créer le client Supabase admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Vérifier si l'utilisateur existe
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Erreur lors de la recherche utilisateur:', listError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification du compte' },
        { status: 500 }
      );
    }

    const user = users.users.find(
      u => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return NextResponse.json({
        success: true,
        message:
          'Si un compte existe avec cette adresse, un email de confirmation a été envoyé.',
      });
    }

    // Vérifier si l'email est déjà confirmé
    if (user.email_confirmed_at) {
      return NextResponse.json(
        {
          error: 'Votre email est déjà confirmé. Vous pouvez vous connecter.',
          code: 'ALREADY_CONFIRMED',
        },
        { status: 400 }
      );
    }

    // Générer un nouveau lien de confirmation avec magiclink
    // On utilise resend qui envoie un OTP par email
    const { error: resendError } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (resendError) {
      console.error('Erreur lors du renvoi de l\'email:', resendError);

      // Gérer les erreurs spécifiques
      if (resendError.message?.includes('rate limit')) {
        return NextResponse.json(
          {
            error:
              'Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.',
            code: 'RATE_LIMITED',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email de confirmation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Un nouvel email de confirmation a été envoyé. Vérifiez votre boîte de réception et vos spams.',
    });
  } catch (error) {
    console.error('Erreur inattendue resend-confirmation:', error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    );
  }
}
