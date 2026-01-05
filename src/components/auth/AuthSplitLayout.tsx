'use client';

import React from 'react';
import Image from 'next/image';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
}

/**
 * Layout split pour les pages d'authentification
 * - Gauche (1/4) : Formulaire avec logo
 * - Droite (3/4) : Image pleine hauteur
 * - Responsive : Image masquée sur mobile
 */
export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({
  children,
  imageSrc = '/images/hero-healthy-plate.jpg',
  imageAlt = 'Assiette saine et équilibrée',
}) => {
  return (
    <div className='min-h-screen flex'>
      {/* Volet gauche - Formulaire */}
      <div className='w-full lg:w-1/4 lg:min-w-[400px] xl:min-w-[450px] flex flex-col bg-primary-white'>
        {/* Contenu du formulaire */}
        <div className='flex-1 flex flex-col justify-center px-8 lg:px-10 py-8 lg:py-10'>
          {children}
        </div>

        {/* Footer */}
        <div className='p-8 lg:p-10 pt-0'>
          <p className='text-body-small text-neutral-medium'>
            &copy; {new Date().getFullYear()} NutriSensia. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Volet droit - Image (masqué sur mobile/tablet) */}
      <div className='hidden lg:block lg:w-3/4 relative'>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className='object-cover'
          sizes='(min-width: 1024px) 75vw, 0vw'
        />
        {/* Overlay subtil pour améliorer le contraste si nécessaire */}
        <div className='absolute inset-0 bg-gradient-to-r from-black/5 to-transparent' />
      </div>
    </div>
  );
};

export default AuthSplitLayout;
