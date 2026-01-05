/**
 * API Route pour les analytics des tests A/B
 *
 * Cette route permet de récupérer les données analytiques
 * des tests A/B pour le dashboard de monitoring.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  abTestAnalytics,
  type ABTestResults,
} from '@/lib/feature-flags/analytics';

/**
 * Handler GET pour récupérer les analytics des tests A/B
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flagKey = searchParams.get('flagKey');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const action = searchParams.get('action') || 'summary';

    // Vérification de l'authentification
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Vérification des permissions (admin ou nutritionniste)
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    if (!['admin', 'nutritionist'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const dateRange =
      startDate && endDate
        ? {
            start: new Date(startDate),
            end: new Date(endDate),
          }
        : undefined;

    switch (action) {
      case 'summary':
        return await handleSummaryRequest(flagKey, dateRange);

      case 'results':
        return await handleResultsRequest(flagKey, dateRange);

      case 'metrics':
        return await handleMetricsRequest(flagKey, dateRange);

      case 'events':
        return await handleEventsRequest(flagKey, dateRange, searchParams);

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erreur dans l'API analytics A/B:", error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve analytics data',
      },
      { status: 500 }
    );
  }
}

/**
 * Handler POST pour enregistrer des événements A/B
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, userId, flagKey, flagValue, ...eventData } = body;

    // Validation des données requises
    if (!eventType || !userId || !flagKey || !flagValue) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: eventType, userId, flagKey, flagValue',
        },
        { status: 400 }
      );
    }

    // Enregistrement de l'événement
    await abTestAnalytics.trackEvent({
      eventType,
      userId,
      flagKey,
      flagValue,
      ...eventData,
    });

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement d'événement A/B:", error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to track event',
      },
      { status: 500 }
    );
  }
}

/**
 * Gère les demandes de résumé des tests A/B
 */
async function handleSummaryRequest(
  flagKey: string | null,
  dateRange?: { start: Date; end: Date }
) {
  const supabase = await createClient();

  // Requête pour obtenir un résumé des tests actifs
  let query = supabase
    .from('ab_test_events')
    .select('flag_key, variant, event_type, user_id, created_at')
    .order('created_at', { ascending: false });

  if (flagKey) {
    query = query.eq('flag_key', flagKey);
  }

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());
  }

  const { data, error } = await query.limit(1000);

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  // Agrégation des données pour le résumé
  const summary = aggregateTestSummary(data || []);

  return NextResponse.json({
    success: true,
    data: summary,
    metadata: {
      totalEvents: data?.length || 0,
      dateRange: dateRange
        ? {
            start: dateRange.start.toISOString(),
            end: dateRange.end.toISOString(),
          }
        : null,
      generatedAt: new Date().toISOString(),
    },
  });
}

/**
 * Gère les demandes de résultats détaillés des tests A/B
 */
async function handleResultsRequest(
  flagKey: string | null,
  dateRange?: { start: Date; end: Date }
) {
  if (!flagKey) {
    return NextResponse.json(
      { error: 'flagKey parameter is required for results' },
      { status: 400 }
    );
  }

  const results = await abTestAnalytics.analyzeABTestResults(
    flagKey,
    dateRange
  );

  if (!results) {
    return NextResponse.json(
      { error: 'No test results found for the specified flag' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: results,
    metadata: {
      flagKey,
      generatedAt: new Date().toISOString(),
    },
  });
}

/**
 * Gère les demandes de métriques de conversion
 */
async function handleMetricsRequest(
  flagKey: string | null,
  dateRange?: { start: Date; end: Date }
) {
  if (!flagKey) {
    return NextResponse.json(
      { error: 'flagKey parameter is required for metrics' },
      { status: 400 }
    );
  }

  const metrics = await abTestAnalytics.getConversionMetrics(
    flagKey,
    dateRange
  );

  return NextResponse.json({
    success: true,
    data: metrics,
    metadata: {
      flagKey,
      metricsCount: metrics.length,
      generatedAt: new Date().toISOString(),
    },
  });
}

/**
 * Gère les demandes d'événements bruts
 */
async function handleEventsRequest(
  flagKey: string | null,
  dateRange?: { start: Date; end: Date },
  searchParams: URLSearchParams
) {
  const supabase = await createClient();
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');
  const eventType = searchParams.get('eventType');

  let query = supabase
    .from('ab_test_events')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (flagKey) {
    query = query.eq('flag_key', flagKey);
  }

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    metadata: {
      totalCount: count,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
      generatedAt: new Date().toISOString(),
    },
  });
}

/**
 * Agrège les données pour créer un résumé des tests
 */
function aggregateTestSummary(events: any[]) {
  const flagSummaries = new Map();

  events.forEach(event => {
    if (!flagSummaries.has(event.flag_key)) {
      flagSummaries.set(event.flag_key, {
        flagKey: event.flag_key,
        variants: new Map(),
        totalEvents: 0,
        uniqueUsers: new Set(),
        conversions: 0,
        startDate: event.created_at,
        lastActivity: event.created_at,
      });
    }

    const summary = flagSummaries.get(event.flag_key);
    summary.totalEvents++;
    summary.uniqueUsers.add(event.user_id);
    summary.lastActivity = event.created_at;

    if (event.event_type === 'conversion') {
      summary.conversions++;
    }

    if (!summary.variants.has(event.variant)) {
      summary.variants.set(event.variant, {
        name: event.variant,
        users: new Set(),
        events: 0,
        conversions: 0,
      });
    }

    const variant = summary.variants.get(event.variant);
    variant.users.add(event.user_id);
    variant.events++;

    if (event.event_type === 'conversion') {
      variant.conversions++;
    }
  });

  // Conversion en format final
  return Array.from(flagSummaries.values()).map(summary => ({
    flagKey: summary.flagKey,
    totalEvents: summary.totalEvents,
    uniqueUsers: summary.uniqueUsers.size,
    conversions: summary.conversions,
    conversionRate:
      summary.uniqueUsers.size > 0
        ? summary.conversions / summary.uniqueUsers.size
        : 0,
    variants: Array.from(summary.variants.values()).map(variant => ({
      name: variant.name,
      users: variant.users.size,
      events: variant.events,
      conversions: variant.conversions,
      conversionRate:
        variant.users.size > 0 ? variant.conversions / variant.users.size : 0,
    })),
    startDate: summary.startDate,
    lastActivity: summary.lastActivity,
  }));
}
