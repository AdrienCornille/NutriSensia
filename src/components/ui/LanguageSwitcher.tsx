'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { navigation } from '@/i18n/navigation';
import { useState } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const t = useTranslations('Common');
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === locale);

  const handleLanguageChange = (newLocale: string) => {
    // Construire l'URL pour la nouvelle locale
    const newUrl = navigation.getAlternateLink(pathname, newLocale as any);

    // Rediriger vers la nouvelle locale
    window.location.href = newUrl;
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        aria-expanded={isOpen}
        aria-haspopup='true'
      >
        <GlobeAltIcon className='w-4 h-4' />
        <span className='hidden sm:inline'>
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <span className='sm:hidden'>{currentLanguage?.flag}</span>
        <ChevronDownIcon className='w-4 h-4' />
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le menu */}
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
          />

          {/* Menu déroulant */}
          <div className='absolute right-0 z-20 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg'>
            <div className='py-1'>
              {languages.map(language => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                    language.code === locale
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <span className='mr-3'>{language.flag}</span>
                  <span>{language.name}</span>
                  {language.code === locale && (
                    <svg
                      className='ml-auto w-4 h-4 text-blue-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
