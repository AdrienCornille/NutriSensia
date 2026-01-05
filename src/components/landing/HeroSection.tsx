'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface HeroSectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  className,
  title,
  subtitle,
  primaryCtaText,
  primaryCtaLink = '/contact?type=consultation',
}) => {
  const t = useTranslations('HomePage');

  // Utiliser les traductions par défaut si aucune prop n'est fournie
  const heroTitle = title || t('heroTitle');
  const heroSubtitle = subtitle || t('heroSubtitle');
  const primaryCta = primaryCtaText || 'Réserver Ma Consultation Découverte';
  return (
    <section
      className={cn(
        'relative min-h-screen flex items-center justify-center overflow-hidden',
        'bg-gradient-to-br from-blue-50 via-white to-green-50',
        'dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
        className
      )}
    >
      {/* Éléments décoratifs en arrière-plan */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-20 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000' />
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/10 to-green-100/10 rounded-full blur-3xl' />
      </div>

      {/* Contenu principal */}
      <div className='relative z-10 container mx-auto px-4 py-16 lg:py-24'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            {/* Contenu textuel */}
            <div className='text-center lg:text-left space-y-8'>
              {/* Titre principal */}
              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight'>
                <span className='block'>
                  {heroTitle.split(' ').slice(0, 3).join(' ')}
                </span>
                <span className='block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent'>
                  {heroTitle.split(' ').slice(3).join(' ')}
                </span>
              </h1>

              {/* Sous-titre */}
              <p className='text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0'>
                {heroSubtitle}
              </p>

              {/* Bouton CTA unique */}
              <div className='flex justify-center lg:justify-start'>
                <Link href={primaryCtaLink}>
                  <Button
                    size='lg'
                    className='px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
                  >
                    {primaryCta}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Section visuelle */}
            <div className='relative'>
              <div className='relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500'>
                <div className='space-y-6'>
                  {/* Header de l'interface */}
                  <div className='flex items-center space-x-3'>
                    <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 dark:text-white'>
                        Plan Nutritionnel
                      </h3>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Personnalisé pour vous
                      </p>
                    </div>
                  </div>

                  {/* Contenu de l'interface */}
                  <div className='space-y-4'>
                    <div className='bg-gray-50 dark:bg-gray-700 rounded-xl p-4'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Objectif calorique
                        </span>
                        <span className='text-sm text-green-600 dark:text-green-400'>
                          2,200 kcal
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2'>
                        <div
                          className='bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full'
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>

                    <div className='grid grid-cols-3 gap-3'>
                      <div className='bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center'>
                        <div className='text-lg font-bold text-blue-600 dark:text-blue-400'>
                          45%
                        </div>
                        <div className='text-xs text-blue-600 dark:text-blue-400'>
                          Glucides
                        </div>
                      </div>
                      <div className='bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center'>
                        <div className='text-lg font-bold text-green-600 dark:text-green-400'>
                          25%
                        </div>
                        <div className='text-xs text-green-600 dark:text-green-400'>
                          Protéines
                        </div>
                      </div>
                      <div className='bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 text-center'>
                        <div className='text-lg font-bold text-yellow-600 dark:text-yellow-400'>
                          30%
                        </div>
                        <div className='text-xs text-yellow-600 dark:text-yellow-400'>
                          Lipides
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Éléments décoratifs */}
              <div className='absolute -top-4 -right-4 w-24 h-24 bg-blue-200 dark:bg-blue-800 rounded-full opacity-50 animate-bounce'></div>
              <div className='absolute -bottom-4 -left-4 w-16 h-16 bg-green-200 dark:bg-green-800 rounded-full opacity-50 animate-pulse'></div>

              {/* Badges flottants */}
              <div className='absolute top-8 -left-8 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg transform -rotate-12'>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    En ligne
                  </span>
                </div>
              </div>

              <div className='absolute bottom-8 -right-8 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg transform rotate-12'>
                <div className='flex items-center space-x-2'>
                  <svg
                    className='w-4 h-4 text-yellow-500'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    4.9/5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de scroll */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce'>
        <div className='flex flex-col items-center space-y-2'>
          <span className='text-sm text-gray-500 dark:text-gray-400'>
            Découvrir
          </span>
          <svg
            className='w-6 h-6 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 14l-7 7m0 0l-7-7m7 7V3'
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
