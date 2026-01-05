'use client';

import React, { useState } from 'react';
import {
  GeneralContactForm,
  PatientContactForm,
  NutritionistPartnershipForm,
  DemoRequestForm,
} from '@/components/forms';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Types de formulaires disponibles
 */
type FormType = 'general' | 'patient' | 'nutritionist' | 'demo';

/**
 * Page de contact avec sélection de formulaire
 */
export default function ContactPage() {
  const [selectedForm, setSelectedForm] = useState<FormType>('general');

  const formOptions = [
    {
      type: 'general' as FormType,
      title: 'Contact général',
      description: 'Questions générales, support, partenariats',
      icon: (
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
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          />
        </svg>
      ),
    },
    {
      type: 'patient' as FormType,
      title: 'Je suis patient',
      description: 'Demande de consultation nutritionnelle',
      icon: (
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
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      ),
    },
    {
      type: 'nutritionist' as FormType,
      title: 'Je suis nutritionniste',
      description: 'Candidature pour rejoindre la plateforme',
      icon: (
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
            d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6'
          />
        </svg>
      ),
    },
    {
      type: 'demo' as FormType,
      title: 'Demande de démo',
      description: 'Démonstration personnalisée de la plateforme',
      icon: (
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
            d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
          />
        </svg>
      ),
    },
  ];

  const handleFormSuccess = (data: any) => {
    console.log('Formulaire soumis avec succès:', data);
    // Ici, vous pourriez ajouter des actions supplémentaires comme :
    // - Redirection vers une page de remerciement
    // - Envoi d'un email de confirmation
    // - Tracking analytics
  };

  const handleFormError = (error: Error) => {
    console.error('Erreur lors de la soumission:', error);
    // Ici, vous pourriez ajouter des actions comme :
    // - Logging d'erreur
    // - Notification à l'équipe technique
  };

  const renderForm = () => {
    const commonProps = {
      onSuccess: handleFormSuccess,
      onError: handleFormError,
      className: 'mt-8',
    };

    switch (selectedForm) {
      case 'patient':
        return <PatientContactForm {...commonProps} />;
      case 'nutritionist':
        return <NutritionistPartnershipForm {...commonProps} />;
      case 'demo':
        return <DemoRequestForm {...commonProps} />;
      default:
        return <GeneralContactForm {...commonProps} />;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          {/* En-tête */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6'>
              Contactez-nous
            </h1>
            <p className='text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
              Choisissez le type de demande qui correspond le mieux à votre
              situation pour recevoir une réponse personnalisée et rapide.
            </p>
          </div>

          {/* Sélecteur de formulaire */}
          <div className='mb-8'>
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {formOptions.map(option => (
                <Card
                  key={option.type}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-lg',
                    selectedForm === option.type
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:shadow-md'
                  )}
                  onClick={() => setSelectedForm(option.type)}
                >
                  <CardContent className='p-6 text-center'>
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4',
                        selectedForm === option.type
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      )}
                    >
                      {option.icon}
                    </div>
                    <h3 className='font-semibold text-gray-900 dark:text-white mb-2'>
                      {option.title}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      {option.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Formulaire sélectionné */}
          <div className='max-w-4xl mx-auto'>{renderForm()}</div>

          {/* Informations de contact alternatives */}
          <div className='mt-16 max-w-4xl mx-auto'>
            <Card>
              <CardContent className='p-8'>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center'>
                  Autres moyens de nous contacter
                </h2>

                <div className='grid md:grid-cols-3 gap-8'>
                  {/* Email */}
                  <div className='text-center'>
                    <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-6 h-6 text-blue-600 dark:text-blue-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        />
                      </svg>
                    </div>
                    <h3 className='font-semibold text-gray-900 dark:text-white mb-2'>
                      Email
                    </h3>
                    <p className='text-gray-600 dark:text-gray-300'>
                      <a
                        href='mailto:contact@nutrisensia.ch'
                        className='hover:text-blue-600 transition-colors'
                      >
                        contact@nutrisensia.ch
                      </a>
                    </p>
                  </div>

                  {/* Téléphone */}
                  <div className='text-center'>
                    <div className='w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-6 h-6 text-green-600 dark:text-green-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                        />
                      </svg>
                    </div>
                    <h3 className='font-semibold text-gray-900 dark:text-white mb-2'>
                      Téléphone
                    </h3>
                    <p className='text-gray-600 dark:text-gray-300'>
                      <a
                        href='tel:+41123456789'
                        className='hover:text-green-600 transition-colors'
                      >
                        +41 XX XXX XX XX
                      </a>
                    </p>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                      Lun-Ven 9h-18h
                    </p>
                  </div>

                  {/* Adresse */}
                  <div className='text-center'>
                    <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-6 h-6 text-purple-600 dark:text-purple-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                      </svg>
                    </div>
                    <h3 className='font-semibold text-gray-900 dark:text-white mb-2'>
                      Adresse
                    </h3>
                    <p className='text-gray-600 dark:text-gray-300'>
                      NutriSensia
                      <br />
                      Genève, Suisse
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
