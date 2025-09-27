/**
 * API pour les métriques de sécurité et le monitoring
 * Route protégée pour les administrateurs uniquement
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSecurityManager, SecurityManager } from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/security/metrics
 * Récupère les métriques de sécurité agrégées
 */
export async function GET(req: NextRequest) {
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

    const url = new URL(req.url);
    const timeframe = url.searchParams.get('timeframe') || '24h'; // 1h, 24h, 7d, 30d

    // Calculer la date de début selon le timeframe
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '24h':
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }

    // Requêtes parallèles pour les métriques
    const [
      totalEventsResult,
      eventsByTypeResult,
      eventsBySeverityResult,
      topIPsResult,
      failedLoginsResult,
      suspiciousActivitiesResult,
      mfaEventsResult,
    ] = await Promise.all([
      // Total des événements
      supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', startDate.toISOString()),

      // Événements par type
      supabase.rpc('get_events_by_type', {
        start_date: startDate.toISOString(),
        end_date: now.toISOString(),
      }),

      // Événements par sévérité
      supabase.rpc('get_events_by_severity', {
        start_date: startDate.toISOString(),
        end_date: now.toISOString(),
      }),

      // Top IPs suspectes
      supabase
        .from('security_events')
        .select('ip_address')
        .gte('timestamp', startDate.toISOString())
        .in('severity', ['high', 'critical'])
        .limit(10),

      // Tentatives de connexion échouées
      supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'login_failure')
        .gte('timestamp', startDate.toISOString()),

      // Activités suspectes
      supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'suspicious_activity')
        .gte('timestamp', startDate.toISOString()),

      // Événements MFA
      supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .in('event_type', ['mfa_attempt', 'mfa_success', 'mfa_failure'])
        .gte('timestamp', startDate.toISOString()),
    ]);

    // Traiter les données des top IPs
    const ipCounts = new Map<string, number>();
    topIPsResult.data?.forEach((event: any) => {
      const count = ipCounts.get(event.ip_address) || 0;
      ipCounts.set(event.ip_address, count + 1);
    });

    const topIPs = Array.from(ipCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip_address: ip, count }));

    // Calculer les tendances (comparaison avec la période précédente)
    const previousStartDate = new Date(
      startDate.getTime() - (now.getTime() - startDate.getTime())
    );

    const [previousTotalResult, previousFailedLoginsResult] = await Promise.all(
      [
        supabase
          .from('security_events')
          .select('*', { count: 'exact', head: true })
          .gte('timestamp', previousStartDate.toISOString())
          .lt('timestamp', startDate.toISOString()),

        supabase
          .from('security_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'login_failure')
          .gte('timestamp', previousStartDate.toISOString())
          .lt('timestamp', startDate.toISOString()),
      ]
    );

    // Calculer les pourcentages de changement
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const metrics = {
      timeframe,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      overview: {
        total_events: totalEventsResult.count || 0,
        total_events_trend: calculateTrend(
          totalEventsResult.count || 0,
          previousTotalResult.count || 0
        ),
        failed_logins: failedLoginsResult.count || 0,
        failed_logins_trend: calculateTrend(
          failedLoginsResult.count || 0,
          previousFailedLoginsResult.count || 0
        ),
        suspicious_activities: suspiciousActivitiesResult.count || 0,
        mfa_events: mfaEventsResult.count || 0,
      },
      breakdown: {
        by_type: eventsByTypeResult.data || [],
        by_severity: eventsBySeverityResult.data || [],
        top_ips: topIPs,
      },
      alerts: {
        high_severity_events:
          eventsBySeverityResult.data?.find((s: any) => s.severity === 'high')
            ?.count || 0,
        critical_events:
          eventsBySeverityResult.data?.find(
            (s: any) => s.severity === 'critical'
          )?.count || 0,
        rate_limit_exceeded:
          eventsByTypeResult.data?.find(
            (t: any) => t.event_type === 'rate_limit_exceeded'
          )?.count || 0,
      },
    };

    // Logger l'accès aux métriques
    await securityManager.logSecurityEvent({
      event_type: 'suspicious_activity',
      user_id: user.id,
      ip_address: ip,
      user_agent: userAgent,
      severity: 'low',
      metadata: {
        action: 'Consultation des métriques de sécurité',
        timeframe,
      },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Erreur dans GET /api/security/metrics:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST /api/security/metrics/alert
 * Déclenche une alerte de sécurité manuelle
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
    const { message, severity = 'high', metadata = {} } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Le message est requis' },
        { status: 400 }
      );
    }

    // Créer l'alerte
    await securityManager.logSecurityEvent({
      event_type: 'suspicious_activity',
      user_id: user.id,
      ip_address: ip,
      user_agent: userAgent,
      severity: severity as 'low' | 'medium' | 'high' | 'critical',
      metadata: {
        type: 'manual_alert',
        message,
        triggered_by: user.id,
        ...metadata,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans POST /api/security/metrics/alert:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
