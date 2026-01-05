'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Section "Ma Propre Transformation" - VERSION MODERNISÉE 2025
 *
 * Témoignage personnel de Lucie avec design premium :
 * - Timeline visuelle du parcours
 * - Citation mise en avant avec glassmorphism
 * - Badges d'étapes du parcours
 * - Animations d'entrée progressives
 * - Effet de révélation du texte
 */
export function PersonalStorySection() {
  const journeySteps = [
    {
      phase: 'Avant',
      title: 'La Lutte',
      description: 'Régimes draconiens, privations, culpabilité',
      icon: 'struggle',
      color: 'from-neutral-dark to-neutral-medium',
      bgColor: 'from-neutral-dark/10 to-neutral-medium/10',
    },
    {
      phase: 'Pendant',
      title: 'La Formation',
      description: 'Science de la nutrition, diplômes, certifications',
      icon: 'education',
      color: 'from-primary to-secondary',
      bgColor: 'from-primary/10 to-secondary/10',
    },
    {
      phase: 'Maintenant',
      title: 'La Révélation',
      description: "Comprendre son corps, l'écouter, le respecter",
      icon: 'lightbulb',
      color: 'from-accent-teal to-accent-mint',
      bgColor: 'from-accent-teal/10 to-accent-mint/10',
    },
  ];

  // Fonction pour rendre les icônes SVG
  const renderIcon = (type: string, className: string) => {
    switch (type) {
      case 'struggle':
        return (
          <svg
            className={className}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        );
      case 'education':
        return (
          <svg
            className={className}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 14l9-5-9-5-9 5 9 5z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
            />
          </svg>
        );
      case 'lightbulb':
        return (
          <svg
            className={className}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section className='relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background-primary to-background-secondary'>
      {/* Blobs animés en arrière-plan */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div
          className='absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDuration: '8s' }}
        />
        <div
          className='absolute bottom-20 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-accent-teal/10 to-accent-mint/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDuration: '7s', animationDelay: '2s' }}
        />
      </div>

      <div className='container mx-auto px-6 md:px-8 lg:px-12 relative z-10'>
        {/* En-tête de section */}
        <div className='text-center mb-16 md:mb-20 animate-fadeIn'>
          {/* Badge avec glassmorphism */}
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass mb-6'>
            <svg
              className='w-4 h-4 text-primary'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-sm font-medium text-neutral-dark'>
              Mon Parcours
            </span>
          </div>

          {/* Titre XXL moderne */}
          <h2 className='text-3xl md:text-4xl lg:text-5xl leading-[1.1] font-bold tracking-tight mb-6'>
            <span className='block text-neutral-dark mb-2'>
              Ma Propre Transformation :
            </span>
            <span className='block bg-gradient-to-r from-primary via-accent-teal to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]'>
              Pourquoi J'ai Créé NutriSensia
            </span>
          </h2>
        </div>

        {/* Timeline du parcours */}
        <div
          className='max-w-[1370px] mx-auto mb-16 animate-fadeIn'
          style={{ animationDelay: '0.2s' }}
        >
          <div className='grid md:grid-cols-3 gap-6'>
            {journeySteps.map((step, index) => (
              <div
                key={index}
                className='relative group animate-fadeIn'
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                {/* Glow effect */}
                <div
                  className={cn(
                    'absolute -inset-2 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500',
                    `bg-gradient-to-br ${step.color}`
                  )}
                ></div>

                {/* Card */}
                <div className='relative backdrop-blur-xl bg-white/70 rounded-3xl border border-white/60 shadow-glass-lg p-6 text-center transform transition-all duration-500 hover:scale-[1.03]'>
                  {/* Phase badge */}
                  <div
                    className={cn(
                      'inline-block px-3 py-1 rounded-full text-xs font-bold mb-4',
                      `bg-gradient-to-r ${step.color} text-white`
                    )}
                  >
                    {step.phase}
                  </div>

                  {/* Icône */}
                  <div
                    className={cn(
                      'w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br backdrop-blur-sm border border-white/40 shadow-glass transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6',
                      step.color
                    )}
                  >
                    {renderIcon(step.icon, 'w-8 h-8 text-white')}
                  </div>

                  {/* Contenu */}
                  <h3 className='text-lg font-bold text-neutral-dark mb-2'>
                    {step.title}
                  </h3>
                  <p className='text-sm text-neutral-medium leading-relaxed'>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div
          className='max-w-[1370px] mx-auto animate-fadeIn'
          style={{ animationDelay: '0.6s' }}
        >
          <div className='space-y-8'>
            {/* Paragraphe 1 */}
            <div className='backdrop-blur-xl bg-white/60 rounded-2xl border border-white/60 shadow-glass p-8'>
              <p className='text-lg text-neutral-dark leading-relaxed'>
                Pendant des années, j'ai cru que manger sainement signifiait se
                priver. Que perdre du poids passait par des régimes draconiens.
                Que mon corps était un ennemi à contrôler.
              </p>
            </div>

            {/* Paragraphe 2 - Résultat */}
            <div className='backdrop-blur-xl bg-gradient-to-r from-accent-orange/10 to-functional-warning/10 border border-accent-orange/30 rounded-2xl shadow-glass p-8'>
              <p className='text-lg text-neutral-dark leading-relaxed font-semibold'>
                Résultat ? Des années de yo-yo, de culpabilité, et de
                frustration.
              </p>
            </div>

            {/* Paragraphe 3 - Révélation */}
            <div className='backdrop-blur-xl bg-white/60 rounded-2xl border border-white/60 shadow-glass p-8'>
              <p className='text-base text-neutral-medium leading-relaxed'>
                Ma formation en nutrition m'a d'abord appris la science. Mais
                c'est mon propre parcours qui m'a appris l'essentiel : qu'on ne
                change pas durablement en se battant contre soi-même. On change
                en comprenant son corps, en l'écoutant, et en lui donnant ce
                dont il a vraiment besoin.
              </p>
            </div>

            {/* Citation mise en avant avec glassmorphism */}
            <div
              className='relative my-12 animate-fadeIn'
              style={{ animationDelay: '0.8s' }}
            >
              <div className='backdrop-blur-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent-teal/10 border border-white/60 rounded-3xl shadow-glass-lg p-8 md:p-12'>
                {/* Icône de citation */}
                <div className='flex justify-center mb-6'>
                  <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent-teal flex items-center justify-center shadow-glass'>
                    <svg
                      className='w-8 h-8 text-white'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z' />
                    </svg>
                  </div>
                </div>

                <p className='text-xl md:text-2xl text-neutral-dark font-semibold leading-relaxed text-center'>
                  NutriSensia est né de cette conviction : vous méritez un
                  accompagnement qui vous traite comme{' '}
                  <span className='bg-gradient-to-r from-primary to-accent-teal bg-clip-text text-transparent'>
                    une personne entière
                  </span>
                  , pas comme un problème à résoudre.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
