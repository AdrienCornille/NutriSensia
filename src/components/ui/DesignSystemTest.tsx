'use client';

import React from 'react';

/**
 * Composant de test pour vérifier la configuration du design system NutriSensia
 */
export default function DesignSystemTest() {
  return (
    <div className='min-h-screen bg-background-secondary p-32dp'>
      <div className='max-w-6xl mx-auto space-y-64dp'>
        {/* Titre */}
        <div className='text-center'>
          <h1 className='text-h1 text-neutral-dark mb-16dp'>
            Design System NutriSensia
          </h1>
          <p className='text-body-large text-neutral-medium'>
            Test de la configuration Tailwind CSS
          </p>
        </div>

        {/* Couleurs primaires */}
        <section className='space-y-32dp'>
          <h2 className='text-h2 text-neutral-dark'>Couleurs primaires</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-16dp'>
            <div className='bg-primary text-white p-24dp rounded-12dp'>
              <p className='text-button font-medium'>Primary Green</p>
              <p className='text-caption'>#2E7D5E</p>
            </div>
            <div className='bg-primary-white text-neutral-dark p-24dp rounded-12dp border border-neutral-border'>
              <p className='text-button font-medium'>Primary White</p>
              <p className='text-caption'>#FAFBFC</p>
            </div>
            <div className='bg-primary-dark text-primary-white p-24dp rounded-12dp'>
              <p className='text-button font-medium'>Primary Dark</p>
              <p className='text-caption'>#1B4F3F</p>
            </div>
          </div>
        </section>

        {/* Typographie */}
        <section className='space-y-32dp'>
          <h2 className='text-h2 text-neutral-dark'>Typographie</h2>
          <div className='space-y-16dp'>
            <h1 className='text-h1 text-neutral-dark'>En-tête H1</h1>
            <h2 className='text-h2 text-neutral-dark'>En-tête H2</h2>
            <h3 className='text-h3 text-neutral-dark'>En-tête H3</h3>
            <h4 className='text-h4 text-neutral-dark'>En-tête H4</h4>
            <p className='text-body-large text-neutral-dark'>
              Texte du corps large
            </p>
            <p className='text-body text-neutral-dark'>
              Texte du corps standard
            </p>
            <p className='text-body-small text-neutral-dark'>
              Texte du corps petit
            </p>
          </div>
        </section>

        {/* Boutons */}
        <section className='space-y-32dp'>
          <h2 className='text-h2 text-neutral-dark'>Boutons</h2>
          <div className='flex flex-wrap gap-16dp'>
            <button className='h-48dp bg-primary text-white rounded-8dp px-24dp text-button font-medium'>
              Bouton Primaire
            </button>
            <button className='h-48dp border-2 border-primary text-primary rounded-8dp px-24dp text-button font-medium'>
              Bouton Secondaire
            </button>
            <button className='h-44dp text-primary px-24dp text-button font-medium'>
              Bouton Fantôme
            </button>
            <button className='h-48dp bg-functional-error text-white rounded-8dp px-24dp text-button font-medium'>
              Bouton Destructif
            </button>
          </div>
        </section>

        {/* Espacement */}
        <section className='space-y-32dp'>
          <h2 className='text-h2 text-neutral-dark'>Espacement</h2>
          <div className='space-y-8dp'>
            <div className='bg-primary p-2dp rounded-4dp'>
              <p className='text-caption text-white'>2dp</p>
            </div>
            <div className='bg-secondary p-8dp rounded-4dp'>
              <p className='text-caption text-white'>8dp</p>
            </div>
            <div className='bg-accent-teal p-16dp rounded-4dp'>
              <p className='text-caption text-white'>16dp</p>
            </div>
            <div className='bg-functional-warning p-32dp rounded-4dp'>
              <p className='text-caption text-white'>32dp</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
