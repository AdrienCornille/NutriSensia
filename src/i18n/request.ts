import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Récupérer la locale demandée depuis l'URL ou les en-têtes
  const requested = await requestLocale;

  // Vérifier si la locale demandée est supportée
  // Si elle n'est pas supportée, utiliser la locale par défaut (français)
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // Charger les messages de traduction pour la locale active
    messages: (await import(`../../messages/${locale}.json`)).default,

    // Configuration du fuseau horaire pour la Suisse
    timeZone: 'Europe/Zurich',

    // Configuration de la date/heure actuelle pour un rendu statique cohérent
    now: new Date(),

    // Formats par défaut pour les dates, nombres et devises
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
        medium: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
        long: {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
      },
      number: {
        currency: {
          style: 'currency',
          currency: 'CHF',
        },
        percent: {
          style: 'percent',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        },
      },
    },
  };
});
