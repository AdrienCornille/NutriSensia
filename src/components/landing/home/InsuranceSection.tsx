'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Section "Remboursement Assurance" - VERSION MODERNISÉE 2025
 *
 * Explique comment obtenir le remboursement des consultations avec design premium :
 * - Timeline visuelle en 4 étapes avec glassmorphism
 * - Badges de certifications (ASCA, RME, TCMA) animés
 * - Section logos d'assurances modernisée
 * - Icônes SVG professionnelles
 * - Animations d'entrée progressives
 * - Effet de garantie avec bouclier animé
 */
export function InsuranceSection() {
  const steps = [
    {
      number: '1',
      iconType: 'calendar',
      title: 'Réservez Votre Consultation',
      description:
        'Choisissez votre forfait et réservez votre première consultation découverte',
      gradientFrom: 'from-primary',
      gradientTo: 'to-secondary',
      iconBg: 'from-primary/20 to-secondary/20',
    },
    {
      number: '2',
      iconType: 'consultation',
      title: 'Consultation & Accompagnement',
      description: 'Bénéficiez de votre suivi nutritionnel personnalisé',
      gradientFrom: 'from-accent-teal',
      gradientTo: 'to-accent-mint',
      iconBg: 'from-accent-teal/20 to-accent-mint/20',
    },
    {
      number: '3',
      iconType: 'invoice',
      title: 'Recevez Votre Facture',
      description:
        'Je vous fournis une facture conforme aux exigences des assureurs et tous les documents nécessaires',
      gradientFrom: 'from-secondary',
      gradientTo: 'to-accent-teal',
      iconBg: 'from-secondary/20 to-accent-teal/20',
    },
    {
      number: '4',
      iconType: 'money',
      title: 'Envoyez à Votre Assurance',
      description:
        'Transmettez les documents à votre assurance complémentaire pour remboursement',
      gradientFrom: 'from-functional-success',
      gradientTo: 'to-accent-teal',
      iconBg: 'from-functional-success/20 to-accent-teal/20',
    },
  ];

  const certifications = [
    {
      name: 'ASCA',
      fullName: 'Fondation ASCA',
      description: 'Reconnue par les assurances',
      iconType: 'shield',
      color: 'from-functional-success to-accent-teal',
    },
    {
      name: 'RME',
      fullName: 'Registre des Médecines Empiriques',
      description: 'Thérapeute agréée',
      iconType: 'certificate',
      color: 'from-primary to-secondary',
    },
    {
      name: 'TCMA',
      fullName: 'Formation Nutrition & Micronutrition',
      description: 'Diplôme reconnu',
      iconType: 'education',
      color: 'from-accent-teal to-accent-mint',
    },
  ];

  // Principales assurances suisses
  const insurances = [
    { name: 'CSS', coverage: '70-90%' },
    { name: 'Helsana', coverage: '70-90%' },
    { name: 'Swica', coverage: '70-90%' },
    { name: 'Sanitas', coverage: '70-90%' },
    { name: 'Visana', coverage: '70-90%' },
    { name: 'Concordia', coverage: '70-90%' },
    { name: 'Groupe Mutuel', coverage: '70-90%' },
    { name: 'Assura', coverage: '70-90%' },
  ];

  // Fonction pour rendre les icônes SVG selon le type
  const renderIcon = (type: string, className: string) => {
    switch (type) {
      case 'calendar':
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
              d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
        );
      case 'consultation':
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
              d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
            />
          </svg>
        );
      case 'invoice':
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
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        );
      case 'money':
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
              d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        );
      case 'shield':
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
              d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
            />
          </svg>
        );
      case 'certificate':
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
              d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
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
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section className='relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-functional-success/5 via-background-primary to-accent-teal/5'>
      {/* Blobs animés en arrière-plan */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div
          className='absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-functional-success/10 to-accent-teal/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDuration: '8s' }}
        />
        <div
          className='absolute bottom-20 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDuration: '7s', animationDelay: '2s' }}
        />
      </div>

      <div className='container mx-auto px-6 md:px-8 lg:px-12 relative z-10'>
        {/* En-tête de section */}
        <div className='text-center mb-16 md:mb-20 animate-fadeIn'>
          {/* Badge avec glassmorphism */}
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass mb-6'>
            <svg
              className='w-4 h-4 text-functional-success'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-sm font-medium text-neutral-dark'>
              Remboursement Assurance
            </span>
          </div>

          {/* Titre XXL moderne */}
          <h2 className='text-3xl md:text-4xl lg:text-5xl leading-[1.1] font-bold tracking-tight mb-6 px-4'>
            <span className='block text-neutral-dark mb-2'>
              Vos Consultations Prises en Charge
            </span>
            <span className='block bg-gradient-to-r from-functional-success via-accent-teal to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]'>
              par Votre Assurance Complémentaire
            </span>
          </h2>

          {/* Sous-titre */}
          <p className='text-lg md:text-xl text-neutral-medium leading-relaxed max-w-[922px] mx-auto'>
            En tant que thérapeute diplômée et reconnue ASCA/RME,{' '}
            <span className='text-neutral-dark font-semibold'>
              mes consultations sont remboursables par la plupart des assurances
              complémentaires suisses
            </span>
            .
          </p>
        </div>

        {/* Badges de Certifications */}
        <div className='max-w-[1370px] mx-auto mb-16 md:mb-20'>
          <div className='grid md:grid-cols-3 gap-6'>
            {certifications.map((cert, index) => (
              <div
                key={index}
                className='relative group animate-fadeIn'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Glow effect */}
                <div
                  className={cn(
                    'absolute -inset-2 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500',
                    `bg-gradient-to-br ${cert.color}`
                  )}
                ></div>

                {/* Card */}
                <div className='relative h-full backdrop-blur-xl bg-white/70 rounded-3xl border border-white/60 shadow-glass-lg p-6 text-center transform transition-all duration-500 hover:scale-[1.03]'>
                  {/* Icône */}
                  <div
                    className={cn(
                      'w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br backdrop-blur-sm border border-white/40 shadow-glass transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6',
                      cert.color
                    )}
                  >
                    {renderIcon(cert.iconType, 'w-8 h-8 text-white')}
                  </div>

                  {/* Nom de la certification */}
                  <div
                    className={cn(
                      'text-2xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent',
                      cert.color
                    )}
                  >
                    {cert.name}
                  </div>

                  {/* Nom complet */}
                  <div className='text-sm font-semibold text-neutral-dark mb-1'>
                    {cert.fullName}
                  </div>

                  {/* Description */}
                  <div className='text-xs text-neutral-medium'>
                    {cert.description}
                  </div>

                  {/* Checkmark badge */}
                  <div className='mt-4 inline-flex items-center px-3 py-1 rounded-full bg-functional-success/10 text-functional-success text-xs font-medium'>
                    <svg
                      className='w-3 h-3 mr-1'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Vérifiée
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processus en 4 étapes */}
        <div className='mb-16 md:mb-20'>
          <h3
            className='text-2xl md:text-3xl text-neutral-dark font-bold text-center mb-12 animate-fadeIn'
            style={{ animationDelay: '0.3s' }}
          >
            Comment Obtenir Mon Remboursement ?
          </h3>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto'>
            {steps.map((step, index) => (
              <div
                key={index}
                className='relative animate-fadeIn'
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className='relative group h-full'>
                  {/* Glow effect */}
                  <div
                    className={cn(
                      'absolute -inset-2 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500',
                      `bg-gradient-to-br ${step.gradientFrom} ${step.gradientTo}`
                    )}
                  ></div>

                  {/* Card */}
                  <div className='relative h-full backdrop-blur-xl bg-white/70 rounded-3xl border border-white/60 shadow-glass-lg p-6 transform transition-all duration-500 hover:scale-[1.03]'>
                    {/* Numéro badge */}
                    <div
                      className={cn(
                        'absolute -top-3 -right-3 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br backdrop-blur-sm border-2 border-white shadow-xl font-bold text-white',
                        `${step.gradientFrom} ${step.gradientTo}`
                      )}
                    >
                      {step.number}
                    </div>

                    {/* Icône */}
                    <div
                      className={cn(
                        'w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br backdrop-blur-sm border border-white/40 shadow-glass transform transition-transform duration-500 group-hover:scale-110',
                        step.iconBg
                      )}
                    >
                      {renderIcon(
                        step.iconType,
                        cn(
                          'w-7 h-7',
                          index === 0 && 'text-primary',
                          index === 1 && 'text-accent-teal',
                          index === 2 && 'text-secondary',
                          index === 3 && 'text-functional-success'
                        )
                      )}
                    </div>

                    {/* Contenu */}
                    <div className='text-center'>
                      <h4 className='text-base font-bold text-neutral-dark mb-2 leading-tight'>
                        {step.title}
                      </h4>
                      <p className='text-sm text-neutral-medium leading-relaxed'>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flèche de connexion */}
                {index < steps.length - 1 && (
                  <div className='hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20'>
                    <svg
                      className='w-6 h-6 text-functional-success animate-pulse'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      style={{ animationDuration: '2s' }}
                    >
                      <path
                        fillRule='evenodd'
                        d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Logos des assurances */}
        <div
          className='mb-16 md:mb-20 animate-fadeIn'
          style={{ animationDelay: '0.8s' }}
        >
          <h3 className='text-xl md:text-2xl text-neutral-dark font-bold text-center mb-8'>
            Accepté par les Principales Assurances Suisses
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1370px] mx-auto mb-6'>
            {insurances.map((insurance, index) => (
              <div key={index} className='relative group'>
                <div className='backdrop-blur-xl bg-white/70 rounded-2xl border border-white/60 shadow-glass p-6 flex flex-col items-center justify-center hover:scale-[1.05] transition-all duration-300'>
                  <span className='text-base font-bold text-neutral-dark mb-1'>
                    {insurance.name}
                  </span>
                  <span className='text-xs text-functional-success font-semibold'>
                    {insurance.coverage}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className='text-sm text-neutral-medium text-center'>
            Et bien d'autres assurances complémentaires suisses
          </p>
        </div>

        {/* Texte explicatif */}
        <div
          className='max-w-[1370px] mx-auto mb-16 animate-fadeIn'
          style={{ animationDelay: '1s' }}
        >
          <div className='backdrop-blur-xl bg-white/60 rounded-3xl border border-white/80 shadow-glass-lg p-8 md:p-12'>
            <h4 className='text-xl font-bold text-neutral-dark text-center mb-6'>
              Je Vous Fournis Systématiquement
            </h4>
            <ul className='space-y-4 max-w-[806px] mx-auto'>
              <li className='flex items-start gap-3'>
                <div className='flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-functional-success/20'>
                  <svg
                    className='w-4 h-4 text-functional-success'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <span className='text-base text-neutral-dark'>
                  Une facture conforme aux exigences des assureurs
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <div className='flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-functional-success/20'>
                  <svg
                    className='w-4 h-4 text-functional-success'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <span className='text-base text-neutral-dark'>
                  Un récapitulatif détaillé de chaque consultation
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <div className='flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-functional-success/20'>
                  <svg
                    className='w-4 h-4 text-functional-success'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <span className='text-base text-neutral-dark'>
                  Tous les documents nécessaires à votre remboursement
                </span>
              </li>
            </ul>
            <div className='mt-6 pt-6 border-t border-neutral-border/30'>
              <p className='text-sm text-neutral-medium text-center'>
                <span className='font-semibold text-neutral-dark'>
                  Important :
                </span>{' '}
                Le montant et le pourcentage de remboursement dépendent de votre
                contrat d'assurance. Je vous conseille de vérifier vos
                couvertures en médecines complémentaires avant de débuter.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className='text-center animate-fadeIn'
          style={{ animationDelay: '1.2s' }}
        >
          <button
            className='group relative overflow-hidden px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-functional-success to-accent-teal hover:from-accent-teal hover:to-functional-success transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-[1.02] transform text-white'
            onClick={() => {
              window.location.href = '/remboursement-assurance';
            }}
          >
            <span className='relative z-10 flex items-center justify-center gap-2'>
              En Savoir Plus sur le Remboursement
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
    </section>
  );
}
