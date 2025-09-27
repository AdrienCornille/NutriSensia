/**
 * API Route pour la découverte des feature flags
 * 
 * Cette route expose les feature flags configurés pour l'interface Vercel Flags
 * et permet la gestion des tests A/B depuis le dashboard.
 */

import { NextResponse, type NextRequest } from 'next/server';

/**
 * Handler GET pour l'endpoint de découverte des flags
 * Version simplifiée pour les tests de démonstration
 */
export async function GET(request: NextRequest) {
  try {
    // Données de démonstration pour les feature flags
    const demoFlags = {
      flags: {
        'onboarding-variant': {
          value: 'control',
          metadata: {
            description: 'Variante d\'onboarding à afficher',
            type: 'string',
            options: ['control', 'simplified', 'gamified', 'guided'],
            default: 'control'
          }
        },
        'show-progress-indicator': {
          value: true,
          metadata: {
            description: 'Afficher l\'indicateur de progression',
            type: 'boolean',
            default: true
          }
        },
        'enable-gamification': {
          value: false,
          metadata: {
            description: 'Activer les éléments de gamification',
            type: 'boolean',
            default: false
          }
        },
        'show-help-tooltips': {
          value: true,
          metadata: {
            description: 'Afficher les tooltips d\'aide',
            type: 'boolean',
            default: true
          }
        }
      },
      metadata: {
        environment: process.env.NODE_ENV || 'development',
        timestamp: Date.now(),
        version: '1.0.0',
        contextInfo: {
          userId: 'demo-user',
          userRole: 'demo',
          deviceType: 'desktop',
          country: 'FR',
        },
      },
    };

    return NextResponse.json(demoFlags, {
      headers: { 
        'x-flags-sdk-version': '1.0.0',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0',
      },
    });
  } catch (error) {
    console.error('Erreur dans l\'endpoint de découverte des flags:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'Failed to retrieve feature flags data' 
      }, 
      { status: 500 }
    );
  }
}

/**
 * Handler OPTIONS pour CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
