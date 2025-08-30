/**
 * API pour la gestion des événements de sécurité
 * Route protégée pour les administrateurs uniquement
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSecurityManager, SecurityManager } from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Utilise la clé service pour accès admin
);

/**
 * GET /api/security/events
 * Récupère les événements de sécurité (admin seulement)
 */
export async function GET(req: NextRequest) {
  try {
    const securityManager = getSecurityManager();
    const ip = SecurityManager.extractClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';

    // Vérifier l'authentification via le header Authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Token d'authentification requis" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Vérifier le token avec Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier les permissions admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      await securityManager.logSecurityEvent({
        event_type: 'suspicious_activity',
        user_id: user.id,
        ip_address: ip,
        user_agent: userAgent,
        severity: 'medium',
        metadata: {
          reason: "Tentative d'accès non autorisé aux événements de sécurité",
          endpoint: '/api/security/events',
        },
      });

      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les paramètres de requête
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '50'),
      100
    );
    const severity = url.searchParams.get('severity');
    const eventType = url.searchParams.get('event_type');
    const userId = url.searchParams.get('user_id');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    // Construire la requête
    let query = supabase
      .from('security_events')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (severity) {
      query = query.eq('severity', severity);
    }
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (from) {
      query = query.gte('timestamp', from);
    }
    if (to) {
      query = query.lte('timestamp', to);
    }

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Logger l'accès aux événements de sécurité
    await securityManager.logSecurityEvent({
      event_type: 'suspicious_activity',
      user_id: user.id,
      ip_address: ip,
      user_agent: userAgent,
      severity: 'low',
      metadata: {
        action: 'Consultation des événements de sécurité',
        filters: { severity, eventType, userId, from, to },
      },
    });

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Erreur dans GET /api/security/events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST /api/security/events
 * Crée un nouvel événement de sécurité (pour les tests et intégrations)
 */
export async function POST(req: NextRequest) {
  try {
    const securityManager = getSecurityManager();
    const ip = SecurityManager.extractClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';

    // Vérifier l'authentification
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Token d'authentification requis" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier les permissions admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();

    // Valider les données
    const requiredFields = [
      'event_type',
      'ip_address',
      'user_agent',
      'severity',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            error: `Le champ ${field} est requis`,
          },
          { status: 400 }
        );
      }
    }

    // Créer l'événement
    await securityManager.logSecurityEvent({
      event_type: body.event_type,
      user_id: body.user_id,
      ip_address: body.ip_address,
      user_agent: body.user_agent,
      severity: body.severity,
      metadata: body.metadata || {},
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Erreur dans POST /api/security/events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
