'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Section "Essai Gratuit 7 Jours" - VERSION MODERNISÉE 2025
 *
 * Présente l'offre d'essai gratuit de la plateforme avec design premium :
 * - Badge "7 JOURS" XXL pulsant avec effet 3D
 * - Titre avec dégradé animé
 * - Cartes features glassmorphism avec icônes SVG
 * - Note importante avec icône info
 * - CTA premium avec gradient animé
 * - Badges de réassurance modernes
 */
export function FreeTrialSection() {
  const trialFeatures = [
    {
      iconType: 'dashboard',
      title: 'Votre tableau de bord personnel',
      description: 'Suivez votre parcours nutritionnel en temps réel',
      color: 'from-primary to-secondary',
    },
    {
      iconType: 'journal',
      title: 'Le journal alimentaire',
      description: 'Photographiez vos repas et suivez vos habitudes',
      color: 'from-accent-teal to-accent-mint',
    },
    {
      iconType: 'progress',
      title: 'Le suivi de vos progrès',
      description: 'Visualisez votre évolution jour après jour',
      color: 'from-secondary to-accent-teal',
    },
    {
      iconType: 'resources',
      title: 'Une sélection de ressources éducatives',
      description: 'Guides, recettes et conseils nutrition',
      color: 'from-accent-orange to-functional-warning',
    },
  ];

  const reassurancePoints = [
    { icon: 'lock', text: 'Sans engagement' },
    { icon: 'card', text: 'Aucune carte bancaire requise' },
    { icon: 'cancel', text: 'Annulation à tout moment' },
  ];

  // Fonction pour rendre les icônes SVG
  const renderIcon = (type: string, className: string) => {
    switch (type) {
      case 'dashboard':
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
              d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            />
          </svg>
        );
      case 'journal':
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
              d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
            />
          </svg>
        );
      case 'progress':
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
              d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
            />
          </svg>
        );
      case 'resources':
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
              d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
            />
          </svg>
        );
      case 'lock':
        return (
          <svg className={className} fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'card':
        return (
          <svg className={className} fill='currentColor' viewBox='0 0 20 20'>
            <path d='M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z' />
            <path
              fillRule='evenodd'
              d='M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'cancel':
        return (
          <svg className={className} fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section className='relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-accent-teal/10 via-background-primary to-accent-mint/10'>
      {/* Blobs animés en arrière-plan */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div
          className='absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-accent-teal/15 to-accent-mint/15 rounded-full blur-3xl animate-pulse'
          style={{ animationDuration: '8s' }}
        />
        <div
          className='absolute bottom-20 right-10 w-[450px] h-[450px] bg-gradient-to-tr from-accent-orange/15 to-functional-warning/15 rounded-full blur-3xl animate-pulse'
          style={{ animationDuration: '7s', animationDelay: '2s' }}
        />
      </div>

      <div className='container mx-auto px-6 md:px-8 lg:px-12 relative z-10'>
        <div className='max-w-[1370px] mx-auto'>
          {/* Card principale avec gradient vert sage (même couleur que CTA principal) */}
          <div className='relative bg-gradient-to-br from-[#7C9885] to-[#6A8773] rounded-3xl shadow-[0_10px_40px_rgba(124,152,133,0.25)] p-8 md:p-12 lg:p-16 text-center overflow-hidden animate-fadeIn'>
            {/* Blobs décoratifs internes avec opacité ajustée pour fond vert */}
            <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl' />
            <div className='absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl' />

            {/* Contenu */}
            <div className='relative z-10'>
              {/* Badge "7 JOURS" XXL pulsant */}
              <div className='inline-flex items-center justify-center mb-8 animate-scaleIn'>
                <div className='relative'>
                  {/* Halo pulsant */}
                  <div
                    className='absolute inset-0 bg-gradient-to-br from-accent-orange to-functional-warning rounded-full blur-2xl opacity-40 animate-pulse'
                    style={{ animationDuration: '2s' }}
                  ></div>

                  {/* Badge principal */}
                  <div className='relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-accent-orange to-functional-warning flex items-center justify-center shadow-2xl transform transition-transform duration-300 hover:scale-110'>
                    <div className='text-center text-white'>
                      <div className='text-5xl md:text-6xl font-bold leading-none'>
                        7
                      </div>
                      <div className='text-sm md:text-base font-semibold tracking-wider'>
                        JOURS
                      </div>
                    </div>

                    {/* Badge "GRATUIT" flottant */}
                    <div
                      className='absolute -top-2 -right-2 px-3 py-1 rounded-full bg-functional-success text-white text-xs font-bold shadow-lg animate-pulse'
                      style={{ animationDuration: '1.5s' }}
                    >
                      GRATUIT
                    </div>
                  </div>
                </div>
              </div>

              {/* Titre XXL moderne */}
              <h2
                className='text-3xl md:text-4xl lg:text-5xl leading-[1.1] font-bold tracking-tight mb-6 animate-fadeIn'
                style={{
                  animationDelay: '0.2s',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <span className='block text-white mb-2'>
                  Testez la Plateforme
                </span>
                <span className='block text-white'>
                  Gratuitement Pendant 7 Jours
                </span>
              </h2>

              {/* Description */}
              <p
                className='text-lg md:text-xl text-white/95 leading-relaxed max-w-[806px] mx-auto mb-12 animate-fadeIn'
                style={{ animationDelay: '0.3s' }}
              >
                Avant de vous engager,{' '}
                <span className='text-white font-semibold'>
                  découvrez par vous-même
                </span>{' '}
                comment NutriSensia peut transformer votre quotidien.
              </p>

              {/* Grille des fonctionnalités */}
              <div
                className='mb-12 animate-fadeIn'
                style={{ animationDelay: '0.4s' }}
              >
                <p className='text-lg font-bold text-white mb-8'>
                  L'essai gratuit vous donne accès à :
                </p>
                <div className='grid md:grid-cols-2 gap-4 max-w-[922px] mx-auto'>
                  {trialFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className='relative group'
                      style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                    >
                      <div className='backdrop-blur-xl bg-white/60 rounded-2xl border border-white/60 shadow-glass p-4 text-left transform transition-all duration-300 hover:scale-[1.03] hover:bg-white/80'>
                        <div className='flex items-start gap-3'>
                          <div
                            className={cn(
                              'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br backdrop-blur-sm border border-white/40 shadow-glass',
                              feature.color
                            )}
                          >
                            {renderIcon(feature.iconType, 'w-5 h-5 text-white')}
                          </div>
                          <div className='flex-1'>
                            <h4 className='text-sm font-bold text-neutral-dark mb-1 leading-tight'>
                              {feature.title}
                            </h4>
                            <p className='text-xs text-neutral-medium leading-relaxed'>
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note importante avec icône */}
              <div
                className='backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-6 mb-10 max-w-[806px] mx-auto animate-fadeIn'
                style={{ animationDelay: '0.9s' }}
              >
                <div className='flex items-start gap-3'>
                  <svg
                    className='w-6 h-6 text-white flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <p className='text-sm text-white text-left'>
                    <span className='font-semibold'>Important :</span> L'essai
                    gratuit ne comprend pas de consultation avec moi, uniquement
                    l'accès à la plateforme.
                  </p>
                </div>
              </div>

              {/* CTA Premium - Style cohérent avec FinalCTASection */}
              <button
                className='group relative overflow-hidden px-10 py-5 text-xl font-bold rounded-2xl bg-white text-[#2C3E3C] transition-all duration-300 shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:scale-[1.05] transform mb-6 animate-fadeIn w-full md:w-auto max-w-[720px] mx-auto'
                style={{ animationDelay: '1s' }}
                onClick={() => {
                  window.location.href = '/essai-gratuit';
                }}
              >
                <span className='relative z-10 flex items-center justify-center gap-3'>
                  Démarrer Mon Essai Gratuit
                  <svg
                    className='w-6 h-6 group-hover:translate-x-1 transition-transform'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 7l5 5m0 0l-5 5m5-5H6'
                    />
                  </svg>
                </span>
              </button>

              {/* Badges de réassurance */}
              <div
                className='flex flex-wrap items-center justify-center gap-4 animate-fadeIn'
                style={{ animationDelay: '1.1s' }}
              >
                {reassurancePoints.map((point, index) => (
                  <div
                    key={index}
                    className='inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/20 border border-white/40'
                  >
                    {renderIcon(point.icon, 'w-4 h-4 text-white')}
                    <span className='text-sm font-medium text-white'>
                      {point.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
