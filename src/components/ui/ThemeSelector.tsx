'use client';

import React from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';

/**
 * Composant de sélection de thème avec support du mode sombre
 * Permet de basculer entre les thèmes clair, sombre et automatique
 */
export default function ThemeSelector() {
  const { theme, changeTheme, themeConfig, isDark, isLight, isAuto } =
    useThemeContext();

  return (
    <div className='flex flex-col space-y-16dp p-24dp bg-background-primary rounded-12dp shadow-card-primary border border-neutral-border accessibility-test-card'>
      <h3 className='text-h3 text-neutral-dark accessibility-test-text'>
        Sélection du Thème
      </h3>

      <p className='text-body text-neutral-medium accessibility-test-subtitle'>
        Choisissez le thème qui vous convient le mieux. Le mode automatique suit
        les préférences de votre système.
      </p>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-16dp'>
        {/* Thème Clair */}
        <button
          onClick={() => changeTheme('light')}
          className={`p-24dp rounded-12dp border-2 transition-all duration-standard ${
            isLight
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-neutral-border bg-background-primary text-neutral-dark hover:border-primary/50 hover:bg-primary/2'
          } accessibility-test-card`}
          aria-pressed={isLight}
          aria-label='Activer le thème clair'
        >
          <div className='flex flex-col items-center space-y-12dp'>
            <span className='text-2xl'>{themeConfig.light.icon}</span>
            <div className='text-center'>
              <h4 className='text-h4 font-semibold accessibility-test-text'>
                {themeConfig.light.name}
              </h4>
              <p className='text-caption text-neutral-medium accessibility-test-subtitle'>
                {themeConfig.light.description}
              </p>
            </div>
          </div>
        </button>

        {/* Thème Sombre */}
        <button
          onClick={() => changeTheme('dark')}
          className={`p-24dp rounded-12dp border-2 transition-all duration-standard ${
            isDark
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-neutral-border bg-background-primary text-neutral-dark hover:border-primary/50 hover:bg-primary/2'
          } accessibility-test-card`}
          aria-pressed={isDark}
          aria-label='Activer le thème sombre'
        >
          <div className='flex flex-col items-center space-y-12dp'>
            <span className='text-2xl'>{themeConfig.dark.icon}</span>
            <div className='text-center'>
              <h4 className='text-h4 font-semibold accessibility-test-text'>
                {themeConfig.dark.name}
              </h4>
              <p className='text-caption text-neutral-medium accessibility-test-subtitle'>
                {themeConfig.dark.description}
              </p>
            </div>
          </div>
        </button>

        {/* Thème Automatique */}
        <button
          onClick={() => changeTheme('auto')}
          className={`p-24dp rounded-12dp border-2 transition-all duration-standard ${
            isAuto
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-neutral-border bg-background-primary text-neutral-dark hover:border-primary/50 hover:bg-primary/2'
          } accessibility-test-card`}
          aria-pressed={isAuto}
          aria-label='Activer le thème automatique'
        >
          <div className='flex flex-col items-center space-y-12dp'>
            <span className='text-2xl'>{themeConfig.auto.icon}</span>
            <div className='text-center'>
              <h4 className='text-h4 font-semibold accessibility-test-text'>
                {themeConfig.auto.name}
              </h4>
              <p className='text-caption text-neutral-medium accessibility-test-subtitle'>
                {themeConfig.auto.description}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Indicateur de statut */}
      <div className='flex items-center justify-center space-x-8dp p-16dp bg-background-accent rounded-8dp accessibility-test-accent'>
        <span className='text-caption text-neutral-medium accessibility-test-subtitle'>
          Thème actuel :
        </span>
        <span className='text-caption font-medium text-neutral-dark accessibility-test-text'>
          {isLight && themeConfig.light.name}
          {isDark && themeConfig.dark.name}
          {isAuto &&
            `${themeConfig.auto.name} (${isDark ? 'Sombre' : 'Clair'})`}
        </span>
      </div>
    </div>
  );
}
