'use client';

import { useEffect } from 'react';

/**
 * Composant Google Analytics pour le développement
 *
 * Ce composant simule Google Analytics en mode développement
 * pour éviter les erreurs CSP et permettre le test des fonctionnalités
 */

interface GoogleAnalyticsDevProps {
  gaId: string;
}

export const GoogleAnalyticsDev: React.FC<GoogleAnalyticsDevProps> = ({
  gaId,
}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Créer une fonction gtag simulée pour le développement
    window.gtag = function (...args: any[]) {
      // console.log('🔍 [GA Dev] Événement simulé:', args);

      // Simuler l'envoi d'événements
      if (args[0] === 'event') {
        const [command, eventName, parameters] = args;
        // console.log(`📊 [GA Dev] Événement: ${eventName}`, parameters);
      } else if (args[0] === 'config') {
        const [command, configId, config] = args;
        // console.log(`⚙️ [GA Dev] Configuration: ${configId}`, config);
      }
    };

    // Simuler l'initialisation
    // console.log(`🚀 [GA Dev] Google Analytics initialisé (ID: ${gaId})`);
    // console.log('📝 [GA Dev] Mode développement - Les événements sont simulés');

    // Simuler la configuration
    window.gtag('config', gaId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Simuler un événement de page view
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [gaId]);

  return null;
};
