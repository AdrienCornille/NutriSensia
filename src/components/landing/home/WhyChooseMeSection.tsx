'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Section "Pourquoi Me Choisir"
 *
 * Présente la nutritionniste avec photo professionnelle
 * et 5 points de différenciation clés
 */
export function WhyChooseMeSection() {
  const differentiators = [
    {
      icon: '🎓',
      title: 'Diplôme Bachelor HES-SO',
      description:
        'Formation universitaire en Nutrition et Diététique, garantissant une expertise scientifique et reconnue.',
      color: 'bg-primary',
    },
    {
      icon: '🌿',
      title: 'Approche Intégrative et Personnalisée',
      description:
        'Prise en compte globale de votre santé : nutrition, micronutrition, mode de vie et objectifs personnels.',
      color: 'bg-secondary',
    },
    {
      icon: '💻',
      title: 'Plateforme Digitale Incluse',
      description:
        'Accès 24/7 à votre espace personnel avec plans de repas, suivi et communication sécurisée.',
      color: 'bg-accent-teal',
    },
    {
      icon: '🎯',
      title: 'Spécialisations Ciblées',
      description:
        'Expertise en gestion du poids, troubles digestifs, nutrition sportive et alimentation équilibrée.',
      color: 'bg-accent-orange',
    },
    {
      icon: '✨',
      title: 'Membre ASDD • ASCA • RME',
      description:
        'Accréditations professionnelles garantissant qualité et remboursement par les assurances.',
      color: 'bg-functional-success',
    },
  ];

  return (
    <section className='py-64dp md:py-96dp bg-background-primary'>
      <div className='container mx-auto px-16dp md:px-24dp lg:px-32dp'>
        {/* En-tête de section */}
        <div className='text-center mb-64dp'>
          <div className='inline-block px-16dp py-8dp bg-primary/10 rounded-full mb-16dp'>
            <span className='text-caption text-primary font-semibold'>
              À PROPOS DE VOTRE NUTRITIONNISTE
            </span>
          </div>
          <h2 className='text-h2 md:text-[36px] text-neutral-dark font-bold mb-16dp'>
            Pourquoi Me Choisir ?
          </h2>
          <p className='text-body-large text-neutral-medium max-w-[922px] mx-auto'>
            Une expertise reconnue au service de votre bien-être nutritionnel
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-48dp md:gap-64dp items-center max-w-6xl mx-auto'>
          {/* Colonne Gauche - Photo et présentation */}
          <div className='order-2 lg:order-1'>
            <div className='relative'>
              {/* Photo professionnelle - Placeholder */}
              <div className='relative rounded-24dp overflow-hidden shadow-card-primary'>
                <div className='aspect-[3/4] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent-teal/20 flex items-center justify-center'>
                  {/* Placeholder - À remplacer par vraie photo */}
                  <div className='text-center p-32dp'>
                    <div className='w-96dp h-96dp bg-primary rounded-full mx-auto mb-24dp flex items-center justify-center'>
                      <svg
                        className='w-48dp h-48dp text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
                    </div>
                    <div className='space-y-8dp'>
                      <h3 className='text-h3 text-neutral-dark font-bold'>
                        Lucie Cornille
                      </h3>
                      <p className='text-body text-neutral-medium'>
                        Thérapeute en Nutrition
                        <br />& Micronutrition
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges flottants */}
              <div className='absolute -bottom-16dp -right-16dp bg-white rounded-16dp shadow-lg p-24dp border-2 border-primary/20'>
                <div className='text-center'>
                  <div className='text-h3 text-primary font-bold'>5+</div>
                  <div className='text-caption text-neutral-medium'>
                    Années
                    <br />
                    d'Expérience
                  </div>
                </div>
              </div>

              <div className='absolute -top-16dp -left-16dp bg-functional-success text-white rounded-16dp shadow-lg px-24dp py-12dp'>
                <div className='text-caption font-semibold'>
                  ✓ Certifiée ASDD
                </div>
              </div>
            </div>
          </div>

          {/* Colonne Droite - Points de différenciation */}
          <div className='space-y-32dp order-1 lg:order-2'>
            {/* Introduction */}
            <div>
              <h3 className='text-h3 md:text-[28px] text-neutral-dark font-bold mb-16dp'>
                Une Expertise au Service de Votre Santé
              </h3>
              <p className='text-body text-neutral-medium leading-relaxed mb-16dp'>
                Diplômée en Nutrition et Diététique de la HES-SO, je combine
                expertise scientifique et approche humaine pour vous accompagner
                vers vos objectifs de santé.
              </p>
              <p className='text-body text-neutral-medium leading-relaxed'>
                Ma mission : rendre la nutrition accessible, compréhensible et
                durable pour chacun de mes patients.
              </p>
            </div>

            {/* Liste des différenciateurs */}
            <div className='space-y-24dp'>
              {differentiators.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start space-x-16dp p-24dp',
                    'bg-background-secondary rounded-16dp',
                    'border-2 border-transparent',
                    'hover:border-primary hover:shadow-sm',
                    'transition-all duration-200'
                  )}
                >
                  {/* Icône */}
                  <div
                    className={cn(
                      'w-56dp h-56dp rounded-12dp flex items-center justify-center flex-shrink-0',
                      item.color,
                      'text-white text-[28px] shadow-sm'
                    )}
                  >
                    {item.icon}
                  </div>

                  {/* Contenu */}
                  <div className='flex-1 pt-4dp'>
                    <h4 className='text-h4 text-neutral-dark font-semibold mb-8dp'>
                      {item.title}
                    </h4>
                    <p className='text-body-small text-neutral-medium leading-relaxed'>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className='pt-16dp'>
              <Button
                variant='primary'
                size='lg'
                fullWidth
                onClick={() => {
                  window.location.href = '/a-propos';
                }}
              >
                En Savoir Plus Sur Mon Parcours
              </Button>
            </div>
          </div>
        </div>

        {/* Citation ou philosophie */}
        <div className='mt-64dp max-w-[1370px] mx-auto'>
          <div className='relative bg-gradient-to-r from-primary/10 via-secondary/10 to-accent-teal/10 rounded-24dp p-48dp text-center'>
            <svg
              className='w-48dp h-48dp text-primary/30 mx-auto mb-24dp'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z' />
            </svg>
            <blockquote className='text-body-large md:text-[20px] text-neutral-dark font-medium leading-relaxed mb-16dp'>
              "La nutrition n'est pas qu'une question de calories, c'est une
              question d'équilibre, de bien-être et de respect de votre corps.
              Mon rôle est de vous guider vers une relation saine et durable
              avec l'alimentation."
            </blockquote>
            <cite className='text-body text-primary font-semibold not-italic'>
              — Lucie Cornille, Diététicienne-Nutritionniste
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
}
