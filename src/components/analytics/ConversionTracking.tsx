'use client';

import { useEffect } from 'react';
// useErrorTracking sera implémenté directement ici

/**
 * Composant pour le suivi automatique des conversions
 *
 * Ce composant configure les écouteurs d'événements pour :
 * - Clics sur les boutons CTA
 * - Soumissions de formulaires
 * - Navigation entre sections
 * - Interactions avec les éléments de conversion
 */

interface ConversionTrackingProps {
  /** Activer le suivi des erreurs automatique */
  enableErrorTracking?: boolean;
  /** Activer le suivi des clics CTA */
  enableCTATracking?: boolean;
  /** Activer le suivi de navigation */
  enableNavigationTracking?: boolean;
}

export function ConversionTracking({
  enableErrorTracking = true,
  enableCTATracking = true,
  enableNavigationTracking = true,
}: ConversionTrackingProps) {
  // Suivi des erreurs JavaScript
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleError = (event: ErrorEvent) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: event.message,
          fatal: false,
          error_type: 'javascript_error',
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description:
            event.reason?.toString() || 'Unhandled promise rejection',
          fatal: false,
          error_type: 'promise_rejection',
        });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const trackingHandlers: Array<() => void> = [];

    // Suivi des clics sur les CTA
    if (enableCTATracking) {
      const handleCTAClick = (event: Event) => {
        const target = event.target as HTMLElement;

        // Identifier les boutons CTA par leurs attributs ou classes
        if (
          target.matches('[data-cta]') ||
          target.matches('.cta-button') ||
          target.closest('[data-cta]') ||
          target.closest('.cta-button')
        ) {
          const ctaElement =
            target.matches('[data-cta]') || target.matches('.cta-button')
              ? target
              : target.closest('[data-cta], .cta-button');

          if (ctaElement) {
            const ctaName =
              ctaElement.getAttribute('data-cta') ||
              ctaElement.textContent?.trim() ||
              'Unknown CTA';
            const ctaLocation = getElementLocation(ctaElement);

            // Utiliser gtag global
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'cta_click', {
                cta_name: ctaName,
                cta_location: ctaLocation,
                value: 1,
              });
            }
          }
        }

        // Suivi spécifique pour les boutons de réservation de consultation
        if (
          target.textContent?.includes('Réserver') ||
          target.textContent?.includes('Planifier') ||
          target.textContent?.includes('Commencer')
        ) {
          const packageInfo = getConsultationPackageInfo(target);
          if (packageInfo) {
            // Utiliser gtag global au lieu de la fonction importée
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'consultation_booking', {
                package_type: packageInfo.type,
                price: packageInfo.price,
                value: parseInt(packageInfo.price.replace(/[^\d]/g, '')) || 0,
              });
            }
          }
        }
      };

      document.addEventListener('click', handleCTAClick);
      trackingHandlers.push(() =>
        document.removeEventListener('click', handleCTAClick)
      );
    }

    // Suivi de la navigation entre sections
    if (enableNavigationTracking) {
      const handleSectionNavigation = (event: Event) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a[href^="#"]') as HTMLAnchorElement;

        if (link) {
          const sectionName =
            link.getAttribute('href')?.substring(1) || 'unknown';
          // Utiliser gtag global
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'section_navigation', {
              section_name: sectionName,
              navigation_method: 'click',
              value: 1,
            });
          }
        }
      };

      document.addEventListener('click', handleSectionNavigation);
      trackingHandlers.push(() =>
        document.removeEventListener('click', handleSectionNavigation)
      );

      // Suivi du scroll vers les sections
      const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: 0,
      };

      const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionId) {
              // Utiliser gtag global
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'section_navigation', {
                  section_name: sectionId,
                  navigation_method: 'scroll',
                  value: 1,
                });
              }
            }
          }
        });
      }, observerOptions);

      // Observer les sections principales
      const sections = document.querySelectorAll(
        '[id^="hero"], [id^="patients"], [id^="nutritionnistes"], [id^="testimonials"]'
      );
      sections.forEach(section => sectionObserver.observe(section));

      trackingHandlers.push(() => {
        sections.forEach(section => sectionObserver.unobserve(section));
        sectionObserver.disconnect();
      });
    }

    // Suivi des soumissions de formulaires
    const handleFormSubmission = (event: Event) => {
      const form = event.target as HTMLFormElement;

      if (form.tagName === 'FORM') {
        const formType = getFormType(form);
        const formData = getFormData(form);

        // Utiliser gtag global
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'form_submission', {
            form_type: formType,
            form_data: formData,
            value: 1,
          });
        }
      }
    };

    document.addEventListener('submit', handleFormSubmission);
    trackingHandlers.push(() =>
      document.removeEventListener('submit', handleFormSubmission)
    );

    // Nettoyage lors du démontage
    return () => {
      trackingHandlers.forEach(cleanup => cleanup());
    };
  }, [enableErrorTracking, enableCTATracking, enableNavigationTracking]);

  return null; // Ce composant ne rend rien visuellement
}

/**
 * Utilitaires pour extraire les informations de suivi
 */

function getElementLocation(element: Element): string {
  // Déterminer la section ou la zone de la page
  const section = element.closest('[id]');
  if (section?.id) {
    return section.id;
  }

  // Fallback sur la classe ou position
  const classList = Array.from(element.classList);
  const locationClass = classList.find(
    cls =>
      cls.includes('hero') ||
      cls.includes('patient') ||
      cls.includes('nutritionist') ||
      cls.includes('testimonial') ||
      cls.includes('footer')
  );

  return locationClass || 'unknown';
}

function getConsultationPackageInfo(
  element: Element
): { type: string; price: string } | null {
  // Chercher les informations du package dans les éléments parents
  const packageCard =
    element.closest('[data-package]') ||
    element.closest('.package-card') ||
    element.closest('.consultation-package');

  if (packageCard) {
    const packageType =
      packageCard.getAttribute('data-package') ||
      packageCard.querySelector('h3, h4, .package-name')?.textContent?.trim() ||
      'Unknown Package';

    const priceElement = packageCard.querySelector(
      '[data-price], .price, .package-price'
    );
    const price = priceElement?.textContent?.trim() || '0 CHF';

    return { type: packageType, price };
  }

  return null;
}

function getFormType(form: HTMLFormElement): string {
  // Identifier le type de formulaire
  const formId = form.id;
  const formClass = form.className;
  const formAction = form.action;

  if (formId.includes('contact') || formClass.includes('contact')) {
    return 'contact_form';
  }

  if (formId.includes('demo') || formClass.includes('demo')) {
    return 'demo_request';
  }

  if (
    formId.includes('signup') ||
    formClass.includes('signup') ||
    formAction.includes('signup')
  ) {
    return 'signup_form';
  }

  if (formId.includes('newsletter') || formClass.includes('newsletter')) {
    return 'newsletter_signup';
  }

  return 'generic_form';
}

function getFormData(form: HTMLFormElement): Record<string, any> {
  const formData = new FormData(form);
  const data: Record<string, any> = {};

  // Extraire les données non-sensibles pour l'analytics
  for (const [key, value] of formData.entries()) {
    // Ne pas inclure les données sensibles
    if (
      !key.includes('password') &&
      !key.includes('email') &&
      !key.includes('phone')
    ) {
      if (typeof value === 'string' && value.length < 100) {
        data[key] = value;
      }
    }
  }

  // Ajouter des métadonnées utiles
  data.form_fields_count = formData.entries().length;
  data.timestamp = new Date().toISOString();

  return data;
}

/**
 * Hook pour le suivi manuel des conversions
 */
export function useConversionTracking() {
  return {
    // Fonctions de tracking maintenant intégrées directement avec gtag
  };
}
