/**
 * API endpoint pour les événements d'analytics d'onboarding
 * POST /api/analytics/onboarding/events - Enregistrer un événement d'onboarding
 * GET /api/analytics/onboarding/events - Récupérer les événements d'onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { OnboardingEvent } from '@/types/analytics';
import { createClient } from '@supabase/supabase-js';
import OnboardingAnalyticsDB from '@/lib/onboarding-analytics-db';

/**
 * POST /api/analytics/onboarding/events
 * Enregistrer un événement d'onboarding
 */
export async function POST(req: NextRequest) {
  try {
    console.log('🔧 POST /api/analytics/onboarding/events appelé');

    const body = await req.json();

    // Valider les données requises
    const { event, properties } = body as OnboardingEvent;
    if (!event || !properties) {
      return NextResponse.json(
        { error: 'Événement et propriétés requis' },
        { status: 400 }
      );
    }

    console.log('✅ Événement reçu:', event, properties);

    // Extraire les informations nécessaires
    const userId = properties.userId;
    const role = properties.role;
    const sessionId = properties.sessionId;
    const step = properties.step;
    const stepNumber = properties.stepNumber;
    const totalSteps = properties.totalSteps;
    const completionPercentage = properties.completionPercentage;
    const timeSpent = properties.timeSpent;
    const deviceType = properties.deviceType;
    const browser = properties.browser;
    const errorType = properties.errorType;
    const errorMessage = properties.errorMessage;
    const helpType = properties.helpType;
    const reason = properties.reason;

    if (!role || !sessionId) {
      return NextResponse.json(
        { error: 'role et sessionId requis' },
        { status: 400 }
      );
    }

    // Enregistrer l'événement selon son type
    let result;
    switch (event) {
      case 'Onboarding Started':
        result = await OnboardingAnalyticsDB.trackOnboardingStarted(
          userId,
          role,
          sessionId,
          deviceType,
          browser
        );
        break;

      case 'Onboarding Step Started':
        if (!step || !stepNumber || !totalSteps) {
          return NextResponse.json(
            {
              error: 'step, stepNumber et totalSteps requis pour step started',
            },
            { status: 400 }
          );
        }
        result = await OnboardingAnalyticsDB.trackStepStarted(
          userId,
          role,
          sessionId,
          step,
          stepNumber,
          totalSteps,
          deviceType,
          browser
        );
        break;

      case 'Onboarding Step Completed':
        if (
          !step ||
          !stepNumber ||
          !totalSteps ||
          completionPercentage === undefined
        ) {
          return NextResponse.json(
            {
              error:
                'step, stepNumber, totalSteps et completionPercentage requis pour step completed',
            },
            { status: 400 }
          );
        }
        result = await OnboardingAnalyticsDB.trackStepCompleted(
          userId,
          role,
          sessionId,
          step,
          stepNumber,
          totalSteps,
          completionPercentage,
          timeSpent || 0,
          deviceType,
          browser
        );
        break;

      case 'Onboarding Step Skipped':
        if (!step || !stepNumber || !totalSteps) {
          return NextResponse.json(
            {
              error: 'step, stepNumber et totalSteps requis pour step skipped',
            },
            { status: 400 }
          );
        }
        result = await OnboardingAnalyticsDB.trackStepSkipped(
          userId,
          role,
          sessionId,
          step,
          stepNumber,
          totalSteps,
          reason,
          deviceType,
          browser
        );
        break;

      case 'Onboarding Step Error':
        if (!step || !stepNumber || !errorType) {
          return NextResponse.json(
            { error: 'step, stepNumber et errorType requis pour step error' },
            { status: 400 }
          );
        }
        result = await OnboardingAnalyticsDB.trackStepError(
          userId,
          role,
          sessionId,
          step,
          stepNumber,
          errorType,
          errorMessage,
          deviceType,
          browser
        );
        break;

      case 'Onboarding Help Requested':
        if (!step || !stepNumber || !helpType) {
          return NextResponse.json(
            {
              error: 'step, stepNumber et helpType requis pour help requested',
            },
            { status: 400 }
          );
        }
        result = await OnboardingAnalyticsDB.trackHelpRequested(
          userId,
          role,
          sessionId,
          step,
          stepNumber,
          helpType,
          deviceType,
          browser
        );
        break;

      case 'Onboarding Completed':
        if (!totalSteps || timeSpent === undefined) {
          return NextResponse.json(
            {
              error: 'totalSteps et timeSpent requis pour onboarding completed',
            },
            { status: 400 }
          );
        }
        result = await OnboardingAnalyticsDB.trackOnboardingCompleted(
          userId,
          role,
          sessionId,
          totalSteps,
          timeSpent,
          deviceType,
          browser
        );
        break;

      case 'Onboarding Abandoned':
        if (!step || !stepNumber) {
          return NextResponse.json(
            { error: 'step et stepNumber requis pour onboarding abandoned' },
            { status: 400 }
          );
        }
        result = await OnboardingAnalyticsDB.trackOnboardingAbandoned(
          userId,
          role,
          sessionId,
          step,
          stepNumber,
          reason,
          deviceType,
          browser
        );
        break;

      default:
        return NextResponse.json(
          { error: `Type d'événement non supporté: ${event}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      console.error('❌ Erreur enregistrement événement:', result.error);
      return NextResponse.json(
        { error: 'Erreur enregistrement', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        event: {
          id: 'db-' + Date.now(),
          event,
          properties,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      '❌ Erreur dans POST /api/analytics/onboarding/events:',
      error
    );
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/onboarding/events
 * Récupérer les événements d'onboarding avec filtres
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔧 GET /api/analytics/onboarding/events appelé');

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const role = searchParams.get('role');
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(
      `🔧 Paramètres: startDate=${startDate}, endDate=${endDate}, role=${role}, eventType=${eventType}`
    );

    // Initialiser Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Construire la requête
    let query = supabase
      .from('onboarding_events')
      .select('*')
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (role) {
      query = query.eq('role', role);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Appliquer la pagination
    query = query.range(offset, offset + limit - 1);

    // Exécuter la requête
    const { data: events, error } = await query;

    if (error) {
      console.error('❌ Erreur requête Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur base de données', details: error.message },
        { status: 500 }
      );
    }

    // Compter le total pour la pagination
    let countQuery = supabase
      .from('onboarding_events')
      .select('*', { count: 'exact', head: true });

    if (role) {
      countQuery = countQuery.eq('role', role);
    }

    if (eventType) {
      countQuery = countQuery.eq('event_type', eventType);
    }

    if (startDate) {
      countQuery = countQuery.gte('created_at', startDate);
    }

    if (endDate) {
      countQuery = countQuery.lte('created_at', endDate);
    }

    const { count } = await countQuery;

    console.log(
      `✅ ${events?.length || 0} événements retournés sur ${count || 0} total`
    );

    return NextResponse.json({
      success: true,
      data: events || [],
      total: count || 0,
      limit,
      offset,
      hasMore: offset + limit < (count || 0),
    });
  } catch (error) {
    console.error(
      '❌ Erreur dans GET /api/analytics/onboarding/events:',
      error
    );
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
