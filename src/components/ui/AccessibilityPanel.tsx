'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './Card';
import { Button } from './Button';
import { useAccessibilityPreferences } from '@/hooks/useAccessibility';

/**
 * Composant panneau de préférences d'accessibilité
 */
export default function AccessibilityPanel() {
  const { preferences, updatePreference } = useAccessibilityPreferences();
  const [isOpen, setIsOpen] = useState(false);

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    updatePreference('fontSize', size);

    // Appliquer les changements au document
    const root = document.documentElement;
    root.style.fontSize =
      size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
  };

  const handleLineHeightChange = (height: 'tight' | 'normal' | 'loose') => {
    updatePreference('lineHeight', height);

    // Appliquer les changements au document
    const root = document.documentElement;
    root.style.lineHeight =
      height === 'tight' ? '1.2' : height === 'loose' ? '1.8' : '1.5';
  };

  const handleColorSchemeChange = (scheme: 'light' | 'dark' | 'auto') => {
    updatePreference('colorScheme', scheme);

    // Appliquer les changements au document
    const root = document.documentElement;
    if (scheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (scheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // Auto - utiliser les préférences système
      root.classList.remove('light', 'dark');
    }
  };

  const handleAnimationsToggle = () => {
    const newValue = !preferences.animations;
    updatePreference('animations', newValue);

    // Appliquer les changements au document
    const root = document.documentElement;
    if (newValue) {
      root.classList.remove('no-animations');
    } else {
      root.classList.add('no-animations');
    }
  };

  const handleFocusIndicatorToggle = () => {
    const newValue = !preferences.focusIndicator;
    updatePreference('focusIndicator', newValue);

    // Appliquer les changements au document
    const root = document.documentElement;
    if (newValue) {
      root.classList.remove('no-focus-indicator');
    } else {
      root.classList.add('no-focus-indicator');
    }
  };

  return (
    <div className='fixed bottom-24dp right-24dp z-50'>
      {/* Bouton d'ouverture */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir les préférences d'accessibilité"
        className='rounded-full w-56dp h-56dp shadow-lg'
      >
        <AccessibilityIcon />
      </Button>

      {/* Panneau de préférences */}
      {isOpen && (
        <Card className='absolute bottom-72dp right-0 w-320dp shadow-xl'>
          <CardHeader>
            <h3 className='text-h3 text-neutral-dark'>
              Préférences d&apos;accessibilité
            </h3>
          </CardHeader>
          <CardContent className='space-y-24dp'>
            {/* Taille de police */}
            <div>
              <label className='block text-label font-medium text-neutral-dark mb-8dp'>
                Taille de police
              </label>
              <div className='flex gap-8dp'>
                {(['small', 'medium', 'large'] as const).map(size => (
                  <Button
                    key={size}
                    variant={
                      preferences.fontSize === size ? 'primary' : 'ghost'
                    }
                    size='sm'
                    onClick={() => handleFontSizeChange(size)}
                    aria-pressed={preferences.fontSize === size}
                  >
                    {size === 'small' ? 'A' : size === 'large' ? 'A' : 'A'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Hauteur de ligne */}
            <div>
              <label className='block text-label font-medium text-neutral-dark mb-8dp'>
                Espacement des lignes
              </label>
              <div className='flex gap-8dp'>
                {(['tight', 'normal', 'loose'] as const).map(height => (
                  <Button
                    key={height}
                    variant={
                      preferences.lineHeight === height ? 'primary' : 'ghost'
                    }
                    size='sm'
                    onClick={() => handleLineHeightChange(height)}
                    aria-pressed={preferences.lineHeight === height}
                  >
                    {height === 'tight'
                      ? 'Serré'
                      : height === 'loose'
                        ? 'Lâche'
                        : 'Normal'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Schéma de couleurs */}
            <div>
              <label className='block text-label font-medium text-neutral-dark mb-8dp'>
                Thème
              </label>
              <div className='flex gap-8dp'>
                {(['light', 'dark', 'auto'] as const).map(scheme => (
                  <Button
                    key={scheme}
                    variant={
                      preferences.colorScheme === scheme ? 'primary' : 'ghost'
                    }
                    size='sm'
                    onClick={() => handleColorSchemeChange(scheme)}
                    aria-pressed={preferences.colorScheme === scheme}
                  >
                    {scheme === 'light'
                      ? 'Clair'
                      : scheme === 'dark'
                        ? 'Sombre'
                        : 'Auto'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Animations */}
            <div className='flex items-center justify-between'>
              <label className='text-label font-medium text-neutral-dark'>
                Animations
              </label>
              <button
                onClick={handleAnimationsToggle}
                className={`relative inline-flex h-24dp w-48dp items-center rounded-full transition-colors ${
                  preferences.animations ? 'bg-primary' : 'bg-neutral-light'
                }`}
                role='switch'
                aria-checked={preferences.animations}
                aria-label='Activer les animations'
              >
                <span
                  className={`inline-block h-20dp w-20dp transform rounded-full bg-white transition-transform ${
                    preferences.animations
                      ? 'translate-x-24dp'
                      : 'translate-x-4dp'
                  }`}
                />
              </button>
            </div>

            {/* Indicateur de focus */}
            <div className='flex items-center justify-between'>
              <label className='text-label font-medium text-neutral-dark'>
                Indicateur de focus
              </label>
              <button
                onClick={handleFocusIndicatorToggle}
                className={`relative inline-flex h-24dp w-48dp items-center rounded-full transition-colors ${
                  preferences.focusIndicator ? 'bg-primary' : 'bg-neutral-light'
                }`}
                role='switch'
                aria-checked={preferences.focusIndicator}
                aria-label="Afficher l'indicateur de focus"
              >
                <span
                  className={`inline-block h-20dp w-20dp transform rounded-full bg-white transition-transform ${
                    preferences.focusIndicator
                      ? 'translate-x-24dp'
                      : 'translate-x-4dp'
                  }`}
                />
              </button>
            </div>

            {/* Raccourcis clavier */}
            <div className='pt-16dp border-t border-neutral-border'>
              <h4 className='text-h4 text-neutral-dark mb-8dp'>
                Raccourcis clavier
              </h4>
              <div className='space-y-8dp text-caption text-neutral-medium'>
                <div className='flex justify-between'>
                  <span>Navigation par tabulation</span>
                  <kbd className='px-8dp py-4dp bg-neutral-light rounded-4dp'>
                    Tab
                  </kbd>
                </div>
                <div className='flex justify-between'>
                  <span>Activer un élément</span>
                  <kbd className='px-8dp py-4dp bg-neutral-light rounded-4dp'>
                    Entrée
                  </kbd>
                </div>
                <div className='flex justify-between'>
                  <span>Fermer ce panneau</span>
                  <kbd className='px-8dp py-4dp bg-neutral-light rounded-4dp'>
                    Échap
                  </kbd>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Icône d'accessibilité
const AccessibilityIcon = () => (
  <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z' />
  </svg>
);
