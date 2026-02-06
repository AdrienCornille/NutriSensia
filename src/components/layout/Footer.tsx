'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Navigation');
  const year = new Date().getFullYear();

  return (
    <footer className='bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Colonne 1: À propos */}
          <div>
            <h3 className='text-xl font-semibold mb-4'>NutriSensia</h3>
            <p className='text-gray-400'>
              Plateforme suisse de nutrition personnalisée. Consultations en
              ligne avec des nutritionnistes certifiés.
            </p>
          </div>

          {/* Colonne 2: Navigation */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Navigation</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  href='/about'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link
                  href='/services'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  {t('services')}
                </Link>
              </li>
              <li>
                <Link
                  href='/pricing'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  {t('pricing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Ressources */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Ressources</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/blog'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  {t('blog')}
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link
                  href='/nutrition'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  {t('nutrition')}
                </Link>
              </li>
            </ul>

            {/* Pour les professionnels */}
            <h3 className='text-lg font-semibold mb-4 mt-6'>
              Pour les professionnels
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/inscription/nutritionniste'
                  className='text-[#1B998B] hover:text-emerald-400 transition-colors font-medium'
                >
                  Devenir Nutritionniste NutriSensia
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Contact */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Contact</h3>
            <ul className='space-y-2 text-gray-400'>
              <li>Email: contact@nutrisensia.ch</li>
              <li>Suisse</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
          <p>&copy; {year} NutriSensia. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
