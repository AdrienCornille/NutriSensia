'use client';

import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';
import { sendGAEvent } from '@next/third-parties/google';
import { useReportWebVitals } from 'next/web-vitals';

/**
 * Configuration Google Analytics pour NutriSensia
 *
 * Ce composant configure Google Analytics 4 avec :
 * - Suivi des métriques Web Vitals
 * - Événements personnalisés pour les conversions
 * - Respect de la vie privée (RGPD)
 */

interface GoogleAnalyticsProps {
  /** ID de mesure Google Analytics (format: G-XXXXXXXXXX) */
  gaId: string;
}

/**
 * Composant principal Google Analytics
 * Intègre GA4 avec le suivi des Web Vitals
 */
export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  // Suivi des métriques de performance Web Vitals
  useReportWebVitals(metric => {
    // Envoyer les métriques à Google Analytics
    // Les valeurs doivent être des entiers
    const value = Math.round(
      metric.name === 'CLS' ? metric.value * 1000 : metric.value
    );

    sendGAEvent('event', metric.name, {
      value,
      event_label: metric.id, // ID unique pour le chargement de page
      non_interaction: true, // N'affecte pas le taux de rebond
    });
  });

  return <NextGoogleAnalytics gaId={gaId} />;
}

/**
 * Fonctions utilitaires pour le suivi des événements personnalisés
 */

/**
 * Suivi des conversions de formulaires
 */
export const trackFormSubmission = (
  formType: string,
  formData?: Record<string, any>
) => {
  sendGAEvent('event', 'form_submission', {
    form_type: formType,
    value: 1,
    ...formData,
  });
};

/**
 * Suivi des clics sur les CTA (Call-to-Action)
 */
export const trackCTAClick = (ctaName: string, ctaLocation: string) => {
  sendGAEvent('event', 'cta_click', {
    cta_name: ctaName,
    cta_location: ctaLocation,
    value: 1,
  });
};

/**
 * Suivi des conversions de consultation
 */
export const trackConsultationBooking = (
  packageType: string,
  price: string
) => {
  sendGAEvent('event', 'consultation_booking', {
    package_type: packageType,
    price: price,
    value: parseInt(price.replace(/[^\d]/g, '')) || 0, // Extraire le prix numérique
  });
};

/**
 * Suivi des téléchargements de ressources
 */
export const trackResourceDownload = (
  resourceName: string,
  resourceType: string
) => {
  sendGAEvent('event', 'resource_download', {
    resource_name: resourceName,
    resource_type: resourceType,
    value: 1,
  });
};

/**
 * Suivi de l'engagement avec les témoignages
 */
export const trackTestimonialEngagement = (
  action: 'view' | 'click' | 'share',
  testimonialId?: string
) => {
  sendGAEvent('event', 'testimonial_engagement', {
    action,
    testimonial_id: testimonialId,
    value: 1,
  });
};

/**
 * Suivi de la navigation dans les sections
 */
export const trackSectionNavigation = (
  sectionName: string,
  method: 'click' | 'scroll'
) => {
  sendGAEvent('event', 'section_navigation', {
    section_name: sectionName,
    navigation_method: method,
    value: 1,
  });
};

/**
 * Suivi des interactions avec le carrousel
 */
export const trackCarouselInteraction = (
  action: 'next' | 'prev' | 'dot_click',
  slideIndex: number
) => {
  sendGAEvent('event', 'carousel_interaction', {
    action,
    slide_index: slideIndex,
    value: 1,
  });
};

/**
 * Suivi des erreurs JavaScript
 */
export const trackError = (errorMessage: string, errorSource?: string) => {
  sendGAEvent('event', 'javascript_error', {
    error_message: errorMessage,
    error_source: errorSource,
    value: 1,
  });
};

/**
 * Hook personnalisé pour le suivi automatique des erreurs
 */
export const useErrorTracking = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', event => {
      trackError(event.message, event.filename);
    });

    window.addEventListener('unhandledrejection', event => {
      trackError(`Unhandled Promise Rejection: ${event.reason}`, 'promise');
    });
  }
};
