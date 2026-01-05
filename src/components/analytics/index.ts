/**
 * Export des composants et utilitaires d'analytics
 */

// Composants principaux
export { CookieConsent } from './CookieConsent';
export { ConversionTracking } from './ConversionTracking';
export { StructuredData } from './StructuredData';

// Fonctions de suivi maintenant intégrées dans ConversionTracking

// Hook de suivi des conversions
export { useConversionTracking } from './ConversionTracking';

// Hook pour les données structurées
export { useTestimonialsStructuredData } from './StructuredData';
