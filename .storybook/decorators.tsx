import React from 'react';
import type { Decorator } from '@storybook/react';

/**
 * Décorateur global pour appliquer les styles et thèmes NutriSensia
 */
export const withNutriSensiaTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'light';

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}
      data-theme={theme}
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: theme === 'dark' ? '#1F2937' : '#FAFBFC',
        color: theme === 'dark' ? '#F8F9FA' : '#374151',
      }}
    >
      <Story />
    </div>
  );
};

/**
 * Décorateur pour les composants avec padding
 */
export const withPadding: Decorator = Story => (
  <div className='p-32dp'>
    <Story />
  </div>
);

/**
 * Décorateur pour les composants centrés
 */
export const withCentered: Decorator = Story => (
  <div className='flex items-center justify-center min-h-screen p-32dp'>
    <Story />
  </div>
);

/**
 * Décorateur pour les composants de navigation
 */
export const withNavigationContext: Decorator = Story => (
  <div className='flex min-h-screen'>
    <div className='w-240dp bg-background-primary border-r border-neutral-border'>
      {/* Sidebar placeholder */}
      <div className='p-16dp'>
        <h3 className='text-h3 text-neutral-dark'>Navigation</h3>
      </div>
    </div>
    <div className='flex-1'>
      <Story />
    </div>
  </div>
);

/**
 * Décorateur pour les formulaires
 */
export const withFormContext: Decorator = Story => (
  <div className='max-w-2xl mx-auto p-32dp'>
    <form className='space-y-24dp'>
      <Story />
    </form>
  </div>
);

/**
 * Décorateur pour les cartes
 */
export const withCardContext: Decorator = Story => (
  <div className='p-32dp bg-background-secondary min-h-screen'>
    <div className='max-w-4xl mx-auto'>
      <Story />
    </div>
  </div>
);
