'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

/**
 * Props du composant NutritionistSection
 */
export interface NutritionistSectionProps {
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
 * Composant NutritionistSection pour la landing page NutriSensia
 *
 * Cette section présente les informations spécifiquement destinées aux nutritionnistes :
 * - Avantages de rejoindre la plateforme
 * - Structure tarifaire et commissions
 * - Outils et fonctionnalités disponibles
 * - Formulaire de demande de démo
 *
 * @example
 * ```tsx
 * <NutritionistSection id="nutritionnistes" />
 * ```
 */
export const NutritionistSection: React.FC<NutritionistSectionProps> = ({
  className,
  id = 'nutritionnistes',
}) => {
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    message: '',
  });

  const platformBenefits = [
    {
      title: 'Gestion simplifiée',
      description:
        'Agenda en ligne, facturation automatique et suivi des patients centralisés',
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
            d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
          />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Visibilité accrue',
      description:
        'Profil professionnel optimisé et référencement dans notre annuaire',
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
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
          />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Outils professionnels',
      description:
        "Plans nutritionnels, bibliothèque de recettes et outils d'analyse",
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
            d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
        </svg>
      ),
      color: 'purple',
    },
    {
      title: 'Revenus optimisés',
      description: 'Commission attractive et paiements sécurisés automatiques',
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
            d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
          />
        </svg>
      ),
      color: 'yellow',
    },
    {
      title: 'Support dédié',
      description: 'Équipe support technique et commercial disponible 6j/7',
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
            d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75 9.75 9.75 0 019.75-9.75z'
          />
        </svg>
      ),
      color: 'indigo',
    },
    {
      title: 'Formation continue',
      description:
        'Webinaires, ressources et mise à jour des meilleures pratiques',
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
            d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
          />
        </svg>
      ),
      color: 'pink',
    },
  ];

  const pricingTiers = [
    {
      name: 'Starter',
      commission: '15%',
      description: 'Parfait pour débuter sur la plateforme',
      features: [
        'Profil professionnel',
        'Agenda en ligne',
        'Facturation automatique',
        'Support par email',
        "Jusqu'à 20 patients/mois",
      ],
      highlight: false,
    },
    {
      name: 'Professional',
      commission: '12%',
      description: 'Pour les nutritionnistes établis',
      features: [
        'Tout du plan Starter',
        "Outils d'analyse avancés",
        'Bibliothèque de recettes',
        'Support prioritaire',
        'Patients illimités',
        'Statistiques détaillées',
      ],
      highlight: true,
    },
    {
      name: 'Premium',
      commission: '10%',
      description: 'Pour les cabinets et équipes',
      features: [
        'Tout du plan Professional',
        'Gestion multi-praticiens',
        'API personnalisée',
        'Formation dédiée',
        'Account manager dédié',
        'Intégrations sur mesure',
      ],
      highlight: false,
    },
  ];

  const handleDemoFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici on implémenterait l'envoi du formulaire
    console.log('Demo form submitted:', demoFormData);
    alert('Merci pour votre demande ! Nous vous contacterons sous 24h.');
    setShowDemoForm(false);
    setDemoFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experience: '',
      message: '',
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setDemoFormData({
      ...demoFormData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section
      id={id}
      className={cn(
        'py-20 lg:py-32 bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900',
        className
      )}
    >
      <div className='container mx-auto px-4'>
        <div className='max-w-7xl mx-auto'>
          {/* En-tête de section */}
          <div className='text-center mb-16'>
            <div className='inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mb-6'>
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
                  d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6'
                />
              </svg>
              Pour les Nutritionnistes
            </div>

            <h2 className='text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6'>
              Développez votre pratique avec
              <span className='block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
                NutriSensia
              </span>
            </h2>

            <p className='text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed'>
              Rejoignez notre réseau de nutritionnistes certifiés et bénéficiez
              d'outils professionnels pour développer votre clientèle et
              optimiser votre pratique.
            </p>
          </div>

          {/* Avantages de la plateforme */}
          <div className='mb-20'>
            <h3 className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center mb-12'>
              Pourquoi choisir NutriSensia ?
            </h3>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {platformBenefits.map((benefit, index) => (
                <Card
                  key={index}
                  className='text-center hover:shadow-lg transition-all duration-300 hover:scale-105'
                >
                  <CardContent className='pt-8'>
                    <div
                      className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6',
                        benefit.color === 'blue' &&
                          'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                        benefit.color === 'green' &&
                          'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                        benefit.color === 'purple' &&
                          'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
                        benefit.color === 'yellow' &&
                          'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
                        benefit.color === 'indigo' &&
                          'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
                        benefit.color === 'pink' &&
                          'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                      )}
                    >
                      {benefit.icon}
                    </div>
                    <h4 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
                      {benefit.title}
                    </h4>
                    <p className='text-gray-600 dark:text-gray-300'>
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Structure tarifaire */}
          <div className='mb-20'>
            <h3 className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center mb-12'>
              Structure Tarifaire Transparente
            </h3>

            <div className='grid md:grid-cols-3 gap-8'>
              {pricingTiers.map((tier, index) => (
                <Card
                  key={index}
                  className={cn(
                    'relative overflow-hidden transition-all duration-300 hover:shadow-xl',
                    tier.highlight &&
                      'ring-2 ring-green-500 dark:ring-green-400 scale-105'
                  )}
                >
                  {tier.highlight && (
                    <div className='absolute top-0 right-0 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg'>
                      Recommandé
                    </div>
                  )}

                  <CardHeader className='text-center'>
                    <h4 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
                      {tier.name}
                    </h4>
                    <div className='mb-4'>
                      <span className='text-3xl font-bold text-green-600 dark:text-green-400'>
                        {tier.commission}
                      </span>
                      <span className='text-gray-500 dark:text-gray-400 ml-2'>
                        de commission
                      </span>
                    </div>
                    <p className='text-gray-600 dark:text-gray-300 text-sm'>
                      {tier.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    <ul className='space-y-3 mb-6'>
                      {tier.features.map((feature, featureIndex) => (
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
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className='text-center mt-12'>
              <p className='text-gray-600 dark:text-gray-300 mb-6'>
                <strong>Aucun frais d'inscription</strong> • Paiements mensuels
                automatiques • Support inclus
              </p>
            </div>
          </div>

          {/* Demande de démo */}
          <div className='bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-8 lg:p-12 text-white'>
            <div className='max-w-4xl mx-auto text-center'>
              <h3 className='text-3xl lg:text-4xl font-bold mb-6'>
                Prêt à rejoindre NutriSensia ?
              </h3>
              <p className='text-xl mb-8 opacity-90'>
                Demandez une démonstration personnalisée et découvrez comment
                notre plateforme peut transformer votre pratique nutritionnelle.
              </p>

              {!showDemoForm ? (
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <Button
                    onClick={() => setShowDemoForm(true)}
                    className='bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold'
                  >
                    Demander une démo
                  </Button>
                  <Link href='/auth/signup'>
                    <Button
                      variant='secondary'
                      className='border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg font-semibold'
                    >
                      S'inscrire maintenant
                    </Button>
                  </Link>
                </div>
              ) : (
                <Card className='max-w-2xl mx-auto text-left'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-xl font-semibold text-gray-900'>
                        Demande de démonstration
                      </h4>
                      <button
                        onClick={() => setShowDemoForm(false)}
                        className='text-gray-500 hover:text-gray-700'
                      >
                        <svg
                          className='w-6 h-6'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDemoFormSubmit} className='space-y-4'>
                      <div className='grid md:grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Nom complet *
                          </label>
                          <input
                            type='text'
                            name='name'
                            value={demoFormData.name}
                            onChange={handleInputChange}
                            required
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                            placeholder='Votre nom complet'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Email professionnel *
                          </label>
                          <input
                            type='email'
                            name='email'
                            value={demoFormData.email}
                            onChange={handleInputChange}
                            required
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                            placeholder='votre.email@exemple.ch'
                          />
                        </div>
                      </div>

                      <div className='grid md:grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Téléphone
                          </label>
                          <input
                            type='tel'
                            name='phone'
                            value={demoFormData.phone}
                            onChange={handleInputChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                            placeholder='+41 XX XXX XX XX'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Spécialisation
                          </label>
                          <select
                            name='specialization'
                            value={demoFormData.specialization}
                            onChange={handleInputChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                          >
                            <option value=''>Sélectionnez...</option>
                            <option value='nutrition-generale'>
                              Nutrition générale
                            </option>
                            <option value='nutrition-sportive'>
                              Nutrition sportive
                            </option>
                            <option value='nutrition-clinique'>
                              Nutrition clinique
                            </option>
                            <option value='nutrition-pediatrique'>
                              Nutrition pédiatrique
                            </option>
                            <option value='troubles-alimentaires'>
                              Troubles alimentaires
                            </option>
                            <option value='autre'>Autre</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Années d'expérience
                        </label>
                        <select
                          name='experience'
                          value={demoFormData.experience}
                          onChange={handleInputChange}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                        >
                          <option value=''>Sélectionnez...</option>
                          <option value='0-2'>0-2 ans</option>
                          <option value='3-5'>3-5 ans</option>
                          <option value='6-10'>6-10 ans</option>
                          <option value='10+'>Plus de 10 ans</option>
                        </select>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Message (optionnel)
                        </label>
                        <textarea
                          name='message'
                          value={demoFormData.message}
                          onChange={handleInputChange}
                          rows={3}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                          placeholder='Parlez-nous de vos besoins spécifiques...'
                        />
                      </div>

                      <div className='flex gap-4 pt-4'>
                        <Button type='submit' className='flex-1'>
                          Envoyer la demande
                        </Button>
                        <Button
                          type='button'
                          variant='secondary'
                          onClick={() => setShowDemoForm(false)}
                          className='flex-1'
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NutritionistSection;
