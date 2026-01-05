'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { X, Cookie, Shield, BarChart3 } from 'lucide-react';

/**
 * Composant de consentement cookies conforme RGPD
 *
 * Fonctionnalités :
 * - Bannière de consentement non-intrusive
 * - Gestion granulaire des types de cookies
 * - Stockage local des préférences
 * - Interface accessible et responsive
 */

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookieConsentProps {
  /** Callback appelé quand les préférences changent */
  onPreferencesChange?: (preferences: CookiePreferences) => void;
}

const COOKIE_CONSENT_KEY = 'nutrisensia_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'nutrisensia_cookie_preferences';

export function CookieConsent({ onPreferencesChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Toujours activés
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (!hasConsented) {
      // Délai pour éviter l'affichage immédiat
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    } else if (savedPreferences) {
      // Charger les préférences sauvegardées
      const parsedPreferences = JSON.parse(savedPreferences);
      setPreferences(parsedPreferences);
      onPreferencesChange?.(parsedPreferences);
    }
  }, [onPreferencesChange]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };

    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };

    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowDetails(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    onPreferencesChange?.(prefs);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés

    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay pour les détails */}
      {showDetails && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <Card className='max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
                  <Shield className='h-5 w-5 text-blue-600' />
                  Paramètres de confidentialité
                </h2>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowDetails(false)}
                  className='p-1'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <div className='space-y-6'>
                <p className='text-gray-600'>
                  Nous utilisons des cookies pour améliorer votre expérience sur
                  notre site. Vous pouvez choisir quels types de cookies
                  accepter.
                </p>

                {/* Cookies nécessaires */}
                <div className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-medium text-gray-900'>
                      Cookies nécessaires
                    </h3>
                    <div className='bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium'>
                      Toujours activés
                    </div>
                  </div>
                  <p className='text-sm text-gray-600'>
                    Ces cookies sont essentiels au fonctionnement du site et ne
                    peuvent pas être désactivés.
                  </p>
                </div>

                {/* Cookies d'analyse */}
                <div className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-medium text-gray-900 flex items-center gap-2'>
                      <BarChart3 className='h-4 w-4' />
                      Cookies d'analyse
                    </h3>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={preferences.analytics}
                        onChange={e =>
                          updatePreference('analytics', e.target.checked)
                        }
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className='text-sm text-gray-600'>
                    Nous aident à comprendre comment vous utilisez notre site
                    pour l'améliorer.
                  </p>
                </div>

                {/* Cookies fonctionnels */}
                <div className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-medium text-gray-900'>
                      Cookies fonctionnels
                    </h3>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={preferences.functional}
                        onChange={e =>
                          updatePreference('functional', e.target.checked)
                        }
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className='text-sm text-gray-600'>
                    Permettent des fonctionnalités avancées comme la sauvegarde
                    de vos préférences.
                  </p>
                </div>

                {/* Cookies marketing */}
                <div className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-medium text-gray-900'>
                      Cookies marketing
                    </h3>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={preferences.marketing}
                        onChange={e =>
                          updatePreference('marketing', e.target.checked)
                        }
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className='text-sm text-gray-600'>
                    Utilisés pour vous proposer des publicités pertinentes sur
                    d'autres sites.
                  </p>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-3 mt-6'>
                <Button onClick={handleSavePreferences} className='flex-1'>
                  Sauvegarder mes préférences
                </Button>
                <Button
                  variant='outline'
                  onClick={handleAcceptAll}
                  className='flex-1'
                >
                  Tout accepter
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bannière de consentement */}
      <div className='fixed bottom-0 left-0 right-0 z-40 p-4'>
        <Card className='max-w-4xl mx-auto shadow-lg'>
          <div className='p-4 sm:p-6'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0'>
                <Cookie className='h-6 w-6 text-blue-600' />
              </div>

              <div className='flex-1 min-w-0'>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Nous respectons votre vie privée
                </h3>
                <p className='text-sm text-gray-600 mb-4'>
                  Nous utilisons des cookies pour améliorer votre expérience,
                  analyser le trafic et personnaliser le contenu. Vous pouvez
                  choisir vos préférences ou accepter tous les cookies.
                </p>

                <div className='flex flex-col sm:flex-row gap-3'>
                  <Button onClick={handleAcceptAll} size='sm'>
                    Accepter tous les cookies
                  </Button>
                  <Button variant='outline' onClick={handleRejectAll} size='sm'>
                    Cookies essentiels uniquement
                  </Button>
                  <Button
                    variant='ghost'
                    onClick={() => setShowDetails(true)}
                    size='sm'
                  >
                    Personnaliser
                  </Button>
                </div>
              </div>

              <Button
                variant='ghost'
                size='sm'
                onClick={handleRejectAll}
                className='flex-shrink-0 p-1'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
