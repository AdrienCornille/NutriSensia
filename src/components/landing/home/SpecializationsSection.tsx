'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Section "J'Accompagne Particulièrement..." - VERSION MODERNISÉE 2025
 *
 * Présente les 4 domaines d'expertise principaux avec un design premium :
 * - Cartes glassmorphism avec effets 3D avancés
 * - Icônes SVG professionnelles animées
 * - Badges de mots-clés pour chaque spécialisation
 * - Barre de progression visuelle
 * - Hover effects sophistiqués
 * - Layout en grille 2x2 responsive
 */
export function SpecializationsSection() {
  const specializations = [
    {
      iconType: 'hormonal',
      title: 'Les Femmes aux Prises avec des Troubles Hormonaux',
      description:
        "SOPK, endométriose, SPM intenses, irrégularités menstruelles. La nutrition peut vraiment changer la donne. On travaille ensemble sur l'inflammation, l'équilibre hormonal et la réduction des symptômes.",
      keywords: ['SOPK', 'Endométriose', 'SPM', 'Hormones'],
      gradientFrom: 'from-primary',
      gradientTo: 'to-secondary',
      iconBg: 'from-primary/20 to-secondary/20',
      accentColor: 'primary',
    },
    {
      iconType: 'weight',
      title: "Les Personnes en Quête d'Équilibre de Poids",
      description:
        'Sans régime restrictif. Sans calculs obsessionnels. On cherche ce qui fonctionne pour VOTRE corps, vos habitudes, votre métabolisme. Une transformation durable, pas un effet yo-yo de plus.',
      keywords: ['Perte de poids', 'Sans régime', 'Durable', 'Métabolisme'],
      gradientFrom: 'from-accent-teal',
      gradientTo: 'to-accent-mint',
      iconBg: 'from-accent-teal/20 to-accent-mint/20',
      accentColor: 'accent-teal',
    },
    {
      iconType: 'professional',
      title: 'Les Actifs Professionnels Fatigués',
      description:
        'Vous êtes performant au travail, mais votre corps tire la langue ? Fatigue chronique, troubles digestifs, concentration en berne. On optimise votre alimentation pour retrouver énergie et clarté mentale.',
      keywords: ['Fatigue', 'Énergie', 'Performance', 'Concentration'],
      gradientFrom: 'from-secondary',
      gradientTo: 'to-secondary-sage',
      iconBg: 'from-secondary/20 to-secondary-sage/20',
      accentColor: 'secondary',
    },
    {
      iconType: 'diabetes',
      title: 'Les Diabétiques et Prédiabétiques',
      description:
        "Contrôler votre glycémie sans vous sentir privé. Comprendre l'impact de chaque aliment, stabiliser votre énergie et prévenir les complications. Un accompagnement sur mesure et scientifiquement solide.",
      keywords: ['Diabète', 'Glycémie', 'Prévention', 'Énergie stable'],
      gradientFrom: 'from-accent-orange',
      gradientTo: 'to-functional-warning',
      iconBg: 'from-accent-orange/20 to-functional-warning/20',
      accentColor: 'accent-orange',
    },
  ];

  // Fonction pour rendre les icônes SVG selon le type
  const renderIcon = (type: string, className: string) => {
    switch (type) {
      case 'hormonal':
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
              strokeWidth={1.5}
              d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
            />
          </svg>
        );
      case 'weight':
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
              strokeWidth={1.5}
              d='M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3'
            />
          </svg>
        );
      case 'professional':
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
              strokeWidth={1.5}
              d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
            />
          </svg>
        );
      case 'diabetes':
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
              strokeWidth={1.5}
              d='M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section className='relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background-primary via-background-secondary to-background-primary'>
      {/* Blobs animés en arrière-plan */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div
          className='absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDuration: '8s' }}
        />
        <div
          className='absolute bottom-40 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-accent-teal/10 to-accent-mint/10 rounded-full blur-3xl animate-pulse'
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
              <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z' />
            </svg>
            <span className='text-sm font-medium text-neutral-dark'>
              Mes Domaines d'Expertise
            </span>
          </div>

          {/* Titre XXL moderne */}
          <h2 className='text-4xl md:text-5xl lg:text-6xl leading-[1.1] font-bold tracking-tight mb-6'>
            <span className='block text-neutral-dark mb-2'>J'Accompagne</span>
            <span className='block bg-gradient-to-r from-primary via-accent-teal to-accent-orange bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]'>
              Particulièrement...
            </span>
          </h2>

          {/* Sous-titre */}
          <p className='text-lg md:text-xl text-neutral-medium leading-relaxed max-w-[922px] mx-auto'>
            Quatre domaines d'expertise où je peux{' '}
            <span className='text-neutral-dark font-semibold'>
              vraiment faire la différence dans votre vie
            </span>
          </p>
        </div>

        {/* Grille 2x2 de spécialisations */}
        <div className='grid md:grid-cols-2 gap-8 max-w-6xl mx-auto'>
          {specializations.map((spec, index) => (
            <div
              key={index}
              className='relative group animate-fadeIn'
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Effet de glow au hover */}
              <div
                className={cn(
                  'absolute -inset-3 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500',
                  `bg-gradient-to-br ${spec.gradientFrom} ${spec.gradientTo}`
                )}
              ></div>

              {/* Carte principale avec glassmorphism */}
              <div className='relative h-full backdrop-blur-xl bg-white/70 rounded-3xl border border-white/60 shadow-glass-lg overflow-hidden transform transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2'>
                {/* Barre colorée en haut */}
                <div
                  className={cn(
                    'absolute top-0 left-0 right-0 h-2 bg-gradient-to-r',
                    `${spec.gradientFrom} ${spec.gradientTo}`
                  )}
                ></div>

                {/* Contenu de la carte */}
                <div className='p-8'>
                  {/* Icône avec glassmorphism */}
                  <div
                    className={cn(
                      'relative w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br backdrop-blur-sm border border-white/40 shadow-glass transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6',
                      spec.iconBg
                    )}
                  >
                    {/* Effet de brillance au hover */}
                    <div className='absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                    {renderIcon(
                      spec.iconType,
                      cn(
                        'relative z-10 w-8 h-8 transition-transform duration-500 group-hover:scale-110',
                        spec.accentColor === 'primary' && 'text-primary',
                        spec.accentColor === 'accent-teal' &&
                          'text-accent-teal',
                        spec.accentColor === 'secondary' && 'text-secondary',
                        spec.accentColor === 'accent-orange' &&
                          'text-accent-orange'
                      )
                    )}
                  </div>

                  {/* Titre */}
                  <h3 className='text-xl md:text-2xl text-neutral-dark font-bold mb-4 leading-tight'>
                    {spec.title}
                  </h3>

                  {/* Description */}
                  <p className='text-base text-neutral-medium leading-relaxed mb-6'>
                    {spec.description}
                  </p>

                  {/* Séparateur décoratif */}
                  <div
                    className={cn(
                      'h-1 w-16 mb-6 rounded-full bg-gradient-to-r',
                      `${spec.gradientFrom} ${spec.gradientTo}`
                    )}
                  ></div>

                  {/* Badges de mots-clés */}
                  <div className='flex flex-wrap gap-2'>
                    {spec.keywords.map((keyword, kIndex) => (
                      <span
                        key={kIndex}
                        className={cn(
                          'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border shadow-sm transition-all duration-300 hover:scale-105',
                          spec.accentColor === 'primary' &&
                            'bg-primary/10 border-primary/20 text-primary',
                          spec.accentColor === 'accent-teal' &&
                            'bg-accent-teal/10 border-accent-teal/20 text-accent-teal',
                          spec.accentColor === 'secondary' &&
                            'bg-secondary/10 border-secondary/20 text-secondary',
                          spec.accentColor === 'accent-orange' &&
                            'bg-accent-orange/10 border-accent-orange/20 text-accent-orange'
                        )}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  {/* Indicateur de progression visuelle */}
                  <div className='mt-6 pt-6 border-t border-neutral-border/30'>
                    <div className='flex items-center justify-between text-sm text-neutral-medium mb-2'>
                      <span>Taux de succès</span>
                      <span className='font-semibold text-neutral-dark'>
                        90%+
                      </span>
                    </div>
                    <div className='h-2 bg-neutral-border/30 rounded-full overflow-hidden'>
                      <div
                        className={cn(
                          'h-full rounded-full bg-gradient-to-r transition-all duration-1000',
                          `${spec.gradientFrom} ${spec.gradientTo}`
                        )}
                        style={{ width: '90%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Badge de numéro flottant */}
                <div className='absolute top-6 right-6 w-10 h-10 rounded-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm flex items-center justify-center text-neutral-dark font-bold text-lg shadow-lg border border-white/60'>
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA en bas de section */}
        <div
          className='mt-16 md:mt-20 text-center animate-fadeIn'
          style={{ animationDelay: '0.6s' }}
        >
          <div className='inline-block backdrop-blur-xl bg-white/60 rounded-3xl border border-white/80 shadow-glass-lg p-6 md:p-8 max-w-[806px]'>
            <p className='text-lg md:text-xl text-neutral-dark mb-6'>
              <span className='font-semibold'>
                Vous ne vous reconnaissez pas exactement
              </span>{' '}
              dans ces profils ? Parlons-en ! Chaque accompagnement est unique.
            </p>
            <button
              className='group relative overflow-hidden px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-accent-teal hover:from-accent-teal hover:to-primary transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-[1.02] transform text-white'
              onClick={() => {
                window.location.href = '/contact?type=consultation';
              }}
            >
              <span className='relative z-10 flex items-center justify-center gap-2'>
                Discutons de Votre Situation
                <svg
                  className='w-5 h-5 group-hover:translate-x-1 transition-transform'
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
              <div className='absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left'></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
