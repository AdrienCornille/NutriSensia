import { NextRequest } from 'next/server';
import { withAdminAuth, apiResponse } from '@/lib/api-auth';

/**
 * Route API admin pour récupérer les statistiques
 * Nécessite le rôle admin
 */
export const GET = withAdminAuth(async (req: NextRequest, auth) => {
  try {
    const { user } = auth;

    // Vérifier que l'utilisateur est bien admin
    if (user.user_metadata?.role !== 'admin') {
      return apiResponse.forbidden('Accès réservé aux administrateurs');
    }

    // Simuler des statistiques (dans un vrai projet, vous récupéreriez ces données depuis la base)
    const stats = {
      totalUsers: 1250,
      activeUsers: 890,
      nutritionists: 45,
      patients: 1205,
      totalAppointments: 3450,
      pendingAppointments: 23,
      revenue: {
        monthly: 45000,
        yearly: 540000,
        currency: 'CHF',
      },
      systemHealth: {
        uptime: 99.9,
        lastBackup: new Date().toISOString(),
        activeSessions: 156,
      },
    };

    return apiResponse.success({
      stats,
      requestedBy: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return apiResponse.serverError(
      'Erreur lors de la récupération des statistiques'
    );
  }
});

/**
 * Route API admin pour mettre à jour les paramètres système
 * Nécessite le rôle admin
 */
export const POST = withAdminAuth(async (req: NextRequest, auth) => {
  try {
    const { user } = auth;
    const body = await req.json();

    // Validation des données
    const { setting, value } = body;

    if (!setting || typeof setting !== 'string') {
      return apiResponse.error(
        'Le paramètre "setting" est requis et doit être une chaîne de caractères'
      );
    }

    if (value === undefined) {
      return apiResponse.error('La valeur "value" est requise');
    }

    // Simuler la mise à jour d'un paramètre système
    const updatedSetting = {
      setting,
      value,
      updatedBy: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
      },
      updatedAt: new Date().toISOString(),
    };

    return apiResponse.success({
      message: 'Paramètre mis à jour avec succès',
      setting: updatedSetting,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paramètre:', error);
    return apiResponse.serverError(
      'Erreur lors de la mise à jour du paramètre'
    );
  }
});
