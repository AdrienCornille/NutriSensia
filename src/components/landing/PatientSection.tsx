'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

/**
 * Props du composant PatientSection
 */
export interface PatientSectionProps {
  /**
   * Classes CSS personnalisées
   */
  className?: string;
  /**
   * ID de la section pour la navigation par ancres
   */
  id?: string;
}

/**
 * Composant PatientSection pour la landing page NutriSensia
 *
 * Cette section présente les informations spécifiquement destinées aux patients :
 * - Packages de consultation disponibles
 * - Processus de consultation nutritionnelle
 * - FAQ sur l'assurance maladie suisse
 * - Témoignages de patients
 *
 * @example
 * ```tsx
 * <PatientSection id="patients" />
 * ```
 */
export const PatientSection: React.FC<PatientSectionProps> = ({
  className,
  id = 'patients',
}) => {
  const consultationPackages = [
    {
      name: 'Consultation Découverte',
      price: '120 CHF',
      duration: '60 min',
      description:
        'Première consultation pour établir votre profil nutritionnel et vos objectifs',
      features: [
        'Analyse complète de vos habitudes alimentaires',
        "Définition d'objectifs personnalisés",
        'Plan nutritionnel de base',
        'Recommandations immédiates',
      ],
      popular: false,
      ctaText: 'Réserver maintenant',
    },
    {
      name: 'Suivi Personnalisé',
      price: '85 CHF',
      duration: '45 min',
      description:
        'Consultations de suivi pour ajuster et optimiser votre plan nutritionnel',
      features: [
        'Révision du plan nutritionnel',
        'Ajustements personnalisés',
        'Suivi des progrès',
        'Conseils pratiques',
        'Support entre les séances',
      ],
      popular: true,
      ctaText: 'Planifier un suivi',
    },
    {
      name: 'Programme Complet',
      price: '450 CHF',
      duration: '6 mois',
      description:
        "Programme d'accompagnement complet sur 6 mois avec suivi régulier",
      features: [
        '1 consultation découverte',
        '5 consultations de suivi',
        'Plan nutritionnel évolutif',
        'Recettes personnalisées',
        'Support WhatsApp inclus',
        'Bilan final détaillé',
      ],
      popular: false,
      ctaText: 'Commencer le programme',
    },
  ];

  const faqItems = [
    {
      question: 'Mon assurance maladie rembourse-t-elle les consultations ?',
      answer:
        "Oui, la plupart des assurances complémentaires suisses remboursent les consultations nutritionnelles. Nos nutritionnistes sont reconnus ASCA/RME. Vérifiez votre police d'assurance ou contactez votre assureur pour connaître le montant exact du remboursement.",
    },
    {
      question: 'Quels documents dois-je fournir pour le remboursement ?',
      answer:
        "Vous recevrez une facture détaillée après chaque consultation que vous pourrez transmettre directement à votre assurance. Aucun autre document n'est nécessaire pour les nutritionnistes reconnus ASCA/RME.",
    },
    {
      question: 'Puis-je annuler ou reporter ma consultation ?',
      answer:
        "Oui, vous pouvez annuler ou reporter votre consultation jusqu'à 24h avant le rendez-vous sans frais. En cas d'annulation tardive, des frais peuvent s'appliquer selon les conditions de votre nutritionniste.",
    },
    {
      question: 'Les consultations en ligne sont-elles aussi efficaces ?',
      answer:
        "Absolument ! Nos consultations en ligne offrent la même qualité d'accompagnement. Vous bénéficiez d'un échange personnalisé, de documents partagés en temps réel et d'un suivi aussi rigoureux qu'en présentiel.",
    },
  ];

  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  return (
    <section
      id={id}
      className={cn(
        'py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800',
        className
      )}
    >
      <div className='container mx-auto px-4'>
        <div className='max-w-7xl mx-auto'>
          {/* En-tête de section */}
          <div className='text-center mb-16'>
            <div className='inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6'>
              <svg
                className='w-4 h-4 mr-2'
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
              Pour les Patients
            </div>

            <h2 className='text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6'>
              Votre parcours vers une
              <span className='block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent'>
                nutrition équilibrée
              </span>
            </h2>

            <p className='text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed'>
              Découvrez nos packages de consultation adaptés à vos besoins et
              bénéficiez d'un accompagnement personnalisé par des
              nutritionnistes certifiés.
            </p>
          </div>

          {/* Packages de consultation */}
          <div className='mb-20'>
            <h3 className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center mb-12'>
              Nos Packages de Consultation
            </h3>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {consultationPackages.map((pkg, index) => (
                <Card
                  key={index}
                  className={cn(
                    'relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 consultation-package',
                    pkg.popular && 'ring-2 ring-blue-500 dark:ring-blue-400'
                  )}
                  data-package={pkg.name}
                  data-price={pkg.price}
                >
                  {pkg.popular && (
                    <div className='absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg'>
                      Populaire
                    </div>
                  )}

                  <CardHeader className='text-center'>
                    <div className='mb-4'>
                      <h4 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
                        {pkg.name}
                      </h4>
                      <div className='flex items-baseline justify-center space-x-2'>
                        <span className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
                          {pkg.price}
                        </span>
                        <span className='text-gray-500 dark:text-gray-400'>
                          / {pkg.duration}
                        </span>
                      </div>
                    </div>
                    <p className='text-gray-600 dark:text-gray-300 text-sm'>
                      {pkg.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    <ul className='space-y-3 mb-6'>
                      {pkg.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className='flex items-start space-x-3'
                        >
                          <svg
                            className='w-5 h-5 text-green-500 mt-0.5 flex-shrink-0'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                              clipRule='evenodd'
                            />
                          </svg>
                          <span className='text-gray-700 dark:text-gray-300 text-sm'>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link href='/auth/signup' className='block'>
                      <Button
                        className='w-full cta-button'
                        variant={pkg.popular ? 'primary' : 'secondary'}
                        data-cta={`consultation-${pkg.name.toLowerCase().replace(/\s+/g, '-')}`}
                        data-package={pkg.name}
                        data-price={pkg.price}
                      >
                        {pkg.ctaText}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Processus de consultation */}
          <div className='mb-20'>
            <h3 className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center mb-12'>
              Comment ça fonctionne ?
            </h3>

            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {[
                {
                  step: '1',
                  title: 'Réservation',
                  description:
                    'Choisissez votre nutritionniste et réservez votre créneau en ligne',
                  icon: (
                    <svg
                      className='w-8 h-8'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6 0h6'
                      />
                    </svg>
                  ),
                },
                {
                  step: '2',
                  title: 'Préparation',
                  description:
                    'Remplissez votre questionnaire de santé et vos objectifs nutritionnels',
                  icon: (
                    <svg
                      className='w-8 h-8'
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
                  ),
                },
                {
                  step: '3',
                  title: 'Consultation',
                  description:
                    'Échangez avec votre nutritionniste en vidéo ou en présentiel',
                  icon: (
                    <svg
                      className='w-8 h-8'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                      />
                    </svg>
                  ),
                },
                {
                  step: '4',
                  title: 'Suivi',
                  description:
                    "Recevez votre plan personnalisé et bénéficiez d'un suivi régulier",
                  icon: (
                    <svg
                      className='w-8 h-8'
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
                  ),
                },
              ].map((step, index) => (
                <div key={index} className='text-center'>
                  <div className='relative mb-6'>
                    <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-4'>
                      {step.icon}
                    </div>
                    <div className='absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                      {step.step}
                    </div>
                  </div>
                  <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                    {step.title}
                  </h4>
                  <p className='text-gray-600 dark:text-gray-300 text-sm'>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Assurance */}
          <div>
            <h3 className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center mb-12'>
              Questions fréquentes sur l'assurance
            </h3>

            <div className='max-w-4xl mx-auto'>
              <div className='space-y-4'>
                {faqItems.map((faq, index) => (
                  <Card key={index} className='overflow-hidden'>
                    <button
                      className='w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'
                      onClick={() =>
                        setOpenFaqIndex(openFaqIndex === index ? null : index)
                      }
                    >
                      <div className='flex items-center justify-between'>
                        <h4 className='text-lg font-semibold text-gray-900 dark:text-white pr-4'>
                          {faq.question}
                        </h4>
                        <svg
                          className={cn(
                            'w-5 h-5 text-gray-500 transition-transform duration-200',
                            openFaqIndex === index && 'rotate-180'
                          )}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </button>

                    {openFaqIndex === index && (
                      <div className='px-6 pb-6'>
                        <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              <div className='text-center mt-12'>
                <p className='text-gray-600 dark:text-gray-300 mb-6'>
                  Vous avez d'autres questions ? Notre équipe est là pour vous
                  aider.
                </p>
                <Link href='/contact'>
                  <Button
                    variant='secondary'
                    size='lg'
                    className='cta-button'
                    data-cta='contact-patients'
                  >
                    Nous contacter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatientSection;
