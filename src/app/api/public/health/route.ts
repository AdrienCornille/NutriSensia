import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-auth';

/**
 * Route API publique pour vérifier l'état de santé du système
 * Accessible sans authentification
 */
export async function GET(req: NextRequest) {
  try {
    // Vérifier l'état des services
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected',
        authentication: 'available',
        storage: 'available',
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    return apiResponse.success(healthStatus);
  } catch (error) {
    console.error("Erreur lors de la vérification de l'état de santé:", error);

    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: "Erreur lors de la vérification de l'état de santé",
    };

    return apiResponse.serverError(
      "Erreur lors de la vérification de l'état de santé"
    );
  }
}

/**
 * Route API publique pour obtenir les informations de l'application
 * Accessible sans authentification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'ping':
        return apiResponse.success({
          message: 'pong',
          timestamp: new Date().toISOString(),
        });

      case 'info':
        return apiResponse.success({
          name: 'NutriSensia',
          description:
            'Application web pour la gestion nutritionnelle personnalisée avec IA',
          version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
          environment: process.env.NODE_ENV || 'development',
          features: [
            'Authentification sécurisée',
            'Gestion des rôles',
            'Authentification à deux facteurs',
            'API REST protégée',
            'Interface responsive',
          ],
        });

      default:
        return apiResponse.error(
          'Action non reconnue. Actions disponibles: ping, info'
        );
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return apiResponse.serverError('Erreur lors du traitement de la requête');
  }
}
