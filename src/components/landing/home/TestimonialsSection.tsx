'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Section Témoignages
 *
 * Présente 3 témoignages de patients avec résultats concrets
 * Format card avec photo/initiales et note étoiles
 */
export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sophie M.',
      age: 34,
      location: 'Lausanne',
      avatar: 'SM',
      rating: 5,
      result: '-8kg en 3 mois',
      quote:
        "Grâce à Lucie et sa plateforme, j'ai enfin réussi à perdre du poids durablement. Le suivi quotidien fait toute la différence !",
      details:
        "J'ai particulièrement apprécié la flexibilité des plans de repas et la disponibilité de Lucie via la messagerie. Je me sens enfin en contrôle de mon alimentation.",
      program: 'Forfait Transformation',
      color: 'from-primary to-secondary',
    },
    {
      name: 'Marc L.',
      age: 45,
      location: 'Genève',
      avatar: 'ML',
      rating: 5,
      result: 'Énergie retrouvée',
      quote:
        "Un accompagnement professionnel et personnalisé qui a transformé ma relation avec la nourriture et mon niveau d'énergie.",
      details:
        "Après des années de fatigue chronique, les conseils de Lucie m'ont permis de retrouver une vitalité que je pensais avoir perdue. La plateforme est un vrai plus pour suivre mes progrès.",
      program: 'Forfait Parcours Complet',
      color: 'from-accent-teal to-accent-mint',
    },
    {
      name: 'Caroline D.',
      age: 38,
      location: 'Fribourg',
      avatar: 'CD',
      rating: 5,
      result: 'Troubles digestifs résolus',
      quote:
        'Mes problèmes digestifs qui me gâchaient la vie depuis des années se sont considérablement améliorés. Merci infiniment !',
      details:
        "L'approche personnalisée et le suivi régulier m'ont permis d'identifier et d'éliminer les aliments qui me causaient des problèmes. Je vis maintenant sans douleurs quotidiennes.",
      program: 'Forfait Fondation',
      color: 'from-secondary to-secondary-sage',
    },
  ];

  return (
    <section className='py-64dp md:py-96dp bg-gradient-to-b from-background-primary to-background-secondary'>
      <div className='container mx-auto px-16dp md:px-24dp lg:px-32dp'>
        {/* En-tête de section */}
        <div className='text-center mb-64dp'>
          <div className='inline-block px-16dp py-8dp bg-accent-orange/10 rounded-full mb-16dp'>
            <span className='text-caption text-accent-orange font-semibold'>
              TÉMOIGNAGES CLIENTS
            </span>
          </div>
          <h2 className='text-h2 md:text-[36px] text-neutral-dark font-bold mb-16dp'>
            Ils Ont Transformé Leur Vie
          </h2>
          <p className='text-body-large text-neutral-medium max-w-[922px] mx-auto'>
            Découvrez les témoignages authentiques de patients qui ont atteint
            leurs objectifs avec NutriSensia
          </p>
        </div>

        {/* Grille des témoignages */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-32dp max-w-[1370px] mx-auto mb-48dp'>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={cn(
                'relative bg-white rounded-24dp p-32dp',
                'shadow-card-primary',
                'border-2 border-transparent',
                'hover:border-primary hover:shadow-xl',
                'transition-all duration-200',
                'flex flex-col'
              )}
            >
              {/* Badge résultat */}
              <div className='absolute -top-12dp left-1/2 transform -translate-x-1/2 px-16dp py-8dp bg-gradient-to-r from-functional-success to-accent-teal text-white rounded-full text-caption font-semibold shadow-sm'>
                {testimonial.result}
              </div>

              {/* Header avec avatar et info */}
              <div className='flex items-start space-x-16dp mb-24dp pt-16dp'>
                {/* Avatar */}
                <div
                  className={cn(
                    'w-64dp h-64dp rounded-full flex items-center justify-center flex-shrink-0',
                    'bg-gradient-to-br',
                    testimonial.color,
                    'text-white text-h3 font-bold shadow-sm'
                  )}
                >
                  {testimonial.avatar}
                </div>

                {/* Info patient */}
                <div className='flex-1'>
                  <h3 className='text-h4 text-neutral-dark font-bold mb-4dp'>
                    {testimonial.name}
                  </h3>
                  <p className='text-body-small text-neutral-medium mb-8dp'>
                    {testimonial.age} ans • {testimonial.location}
                  </p>

                  {/* Étoiles */}
                  <div className='flex space-x-4dp'>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className='w-16dp h-16dp text-accent-orange'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Citation principale */}
              <div className='mb-24dp flex-1'>
                <svg
                  className='w-32dp h-32dp text-primary/20 mb-12dp'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z' />
                </svg>
                <blockquote className='text-body text-neutral-dark mb-16dp leading-relaxed'>
                  "{testimonial.quote}"
                </blockquote>
                <p className='text-body-small text-neutral-medium leading-relaxed'>
                  {testimonial.details}
                </p>
              </div>

              {/* Footer avec programme */}
              <div className='pt-16dp border-t border-neutral-border'>
                <p className='text-caption text-primary font-semibold'>
                  📦 {testimonial.program}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats globaux */}
        <div className='max-w-[1370px] mx-auto'>
          <div className='grid md:grid-cols-3 gap-24dp'>
            <div className='text-center p-24dp bg-white rounded-16dp shadow-sm'>
              <div className='text-h2 md:text-[40px] text-primary font-bold mb-8dp'>
                200+
              </div>
              <p className='text-body text-neutral-dark font-medium'>
                Patients Accompagnés
              </p>
            </div>
            <div className='text-center p-24dp bg-white rounded-16dp shadow-sm'>
              <div className='text-h2 md:text-[40px] text-accent-teal font-bold mb-8dp'>
                95%
              </div>
              <p className='text-body text-neutral-dark font-medium'>
                Taux de Satisfaction
              </p>
            </div>
            <div className='text-center p-24dp bg-white rounded-16dp shadow-sm'>
              <div className='text-h2 md:text-[40px] text-functional-success font-bold mb-8dp'>
                4.9/5
              </div>
              <p className='text-body text-neutral-dark font-medium'>
                Note Moyenne
              </p>
            </div>
          </div>
        </div>

        {/* Note de confidentialité */}
        <p className='text-caption text-neutral-medium text-center mt-32dp'>
          💚 Témoignages authentiques de patients réels. Prénoms abrégés pour
          respecter la confidentialité.
        </p>
      </div>
    </section>
  );
}
