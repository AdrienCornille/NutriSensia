/**
 * Contexte et utilitaires pour les feature flags
 * 
 * Ce fichier fournit les outils pour créer le contexte nécessaire
 * aux feature flags, incluant les informations utilisateur et de session.
 */

import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { dedupe } from 'flags/next';

/**
 * Interface pour le contexte des feature flags
 */
export interface FeatureFlagContext {
  userId?: string;
  userRole?: 'nutritionist' | 'patient' | 'admin';
  sessionId?: string;
  userAgent?: string;
  country?: string;
  timestamp: number;
  isNewUser?: boolean;
  onboardingStep?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Génère ou récupère un ID de visiteur persistant
 * Utilise dedupe pour éviter la régénération multiple dans la même requête
 */
export const getOrGenerateVisitorId = dedupe(
  async (): Promise<{ value: string; fresh: boolean }> => {
    const cookieStore = await cookies();
    const visitorIdCookie = cookieStore.get('visitor-id')?.value;

    if (visitorIdCookie) {
      return { value: visitorIdCookie, fresh: false };
    }

    // Génération d'un nouvel ID visiteur
    const newVisitorId = generateVisitorId();
    return { value: newVisitorId, fresh: true };
  }
);

/**
 * Récupère les informations utilisateur authentifié
 * Utilise dedupe pour optimiser les appels multiples
 */
export const getAuthenticatedUser = dedupe(async () => {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Récupération du rôle utilisateur depuis les métadonnées
    const userRole = user.user_metadata?.role || 
                    user.app_metadata?.role || 
                    'patient'; // Rôle par défaut

    return {
      id: user.id,
      email: user.email,
      role: userRole as 'nutritionist' | 'patient' | 'admin',
      isNewUser: isNewUser(user.created_at),
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
});

/**
 * Crée le contexte complet pour les feature flags
 */
export async function createFeatureFlagContext(): Promise<FeatureFlagContext> {
  // Récupération des informations utilisateur
  const user = await getAuthenticatedUser();
  const visitor = await getOrGenerateVisitorId();
  
  // Récupération des headers de requête
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const country = headersList.get('cf-ipcountry') || 
                 headersList.get('x-vercel-ip-country') || 
                 'unknown';

  // Détection du type d'appareil basé sur le user-agent
  const deviceType = detectDeviceType(userAgent);

  // Récupération de l'étape d'onboarding actuelle si disponible
  const cookieStore = await cookies();
  const onboardingStep = cookieStore.get('current-onboarding-step')?.value;

  return {
    userId: user?.id || visitor.value,
    userRole: user?.role,
    sessionId: generateSessionId(),
    userAgent,
    country,
    timestamp: Date.now(),
    isNewUser: user?.isNewUser,
    onboardingStep,
    deviceType,
  };
}

/**
 * Génère un ID de visiteur unique
 */
function generateVisitorId(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Génère un ID de session unique
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Détermine si un utilisateur est nouveau (créé dans les 24 dernières heures)
 */
function isNewUser(createdAt: string): boolean {
  const creationDate = new Date(createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff < 24;
}

/**
 * Détecte le type d'appareil basé sur le user-agent
 */
function detectDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') && !ua.includes('tablet')) {
    return 'mobile';
  }
  
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  
  return 'desktop';
}

/**
 * Crée un contexte Map pour les feature flags
 */
export async function createFlagContext(): Promise<Map<string, any>> {
  const context = await createFeatureFlagContext();
  
  const flagContext = new Map();
  flagContext.set('userId', context.userId);
  flagContext.set('userRole', context.userRole);
  flagContext.set('sessionId', context.sessionId);
  flagContext.set('userAgent', context.userAgent);
  flagContext.set('country', context.country);
  flagContext.set('timestamp', context.timestamp);
  flagContext.set('isNewUser', context.isNewUser);
  flagContext.set('onboardingStep', context.onboardingStep);
  flagContext.set('deviceType', context.deviceType);
  
  return flagContext;
}

/**
 * Hook pour obtenir le contexte des feature flags côté client
 */
export function useFeatureFlagContext() {
  // Cette fonction sera utilisée côté client pour obtenir le contexte
  // Elle pourra être enrichie avec des informations spécifiques au client
  return {
    timestamp: Date.now(),
    deviceType: detectDeviceType(navigator.userAgent),
    // Autres informations disponibles côté client
  };
}
