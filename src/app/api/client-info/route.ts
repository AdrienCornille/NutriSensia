import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route pour obtenir les informations du client
 *
 * Cette route fournit des informations sur le client comme l'adresse IP
 * pour les besoins de sécurité et d'analyse des formulaires de contact.
 */
export async function GET(request: NextRequest) {
  try {
    // Obtenir l'adresse IP du client
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIP || request.ip || 'unknown';

    // Obtenir d'autres informations utiles
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || null;

    // Informations de géolocalisation (optionnel - nécessite un service externe)
    let country = null;
    let city = null;

    // Si vous utilisez Vercel, vous pouvez obtenir des informations géographiques
    if (process.env.VERCEL) {
      country = request.geo?.country || null;
      city = request.geo?.city || null;
    }

    const clientInfo = {
      ip,
      userAgent,
      referer,
      country,
      city,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(clientInfo);
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des informations client:',
      error
    );

    return NextResponse.json(
      {
        error: 'Impossible de récupérer les informations client',
        ip: 'unknown',
        userAgent: 'unknown',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Méthodes HTTP autorisées
 */
export const runtime = 'edge'; // Utiliser Edge Runtime pour de meilleures performances
