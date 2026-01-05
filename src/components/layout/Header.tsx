'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Détection du scroll pour ajuster l'opacité du header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du redimensionnement vers desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Empêcher le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out w-full max-w-7xl px-4 ${className}`}
    >
      <div
        className={`
          relative overflow-hidden rounded-3xl
          backdrop-blur-3xl backdrop-saturate-200
          border border-white/30
          shadow-[0_8px_32px_rgba(0,0,0,0.12)]
          transition-all duration-300 ease-out
          ${
            scrolled
              ? 'bg-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.18)] border-white/40'
              : 'bg-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
          }
        `}
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
        }}
      >
        {/* Effets de brillance animés multiples */}
        <div
          className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer'
          style={{ animationDuration: '3s' }}
        />
        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5' />

        {/* Ombre interne pour effet de profondeur */}
        <div className='absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.05)] rounded-3xl pointer-events-none' />

        {/* Contenu du header */}
        <div className='px-6 py-3'>
          <div className='flex items-center justify-between gap-8'>
            {/* Logo à gauche */}
            <Link
              href='/'
              className='flex items-center space-x-3 group transition-transform duration-200 hover:scale-105 flex-shrink-0'
            >
              <div className='w-11 h-11 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-200 ring-2 ring-white/20'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2.5}
                    d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                  />
                </svg>
              </div>
              <span className='text-xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent'>
                NutriSensia
              </span>
            </Link>

            {/* Navigation au centre - Desktop uniquement */}
            <nav className='hidden lg:flex items-center space-x-1 flex-1 justify-center'>
              <Link
                href='/'
                className='relative px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-white/40 hover:shadow-lg hover:backdrop-blur-xl group'
              >
                <span className='relative z-10 text-gray-700 group-hover:text-gray-900 transition-colors font-semibold'>
                  Accueil
                </span>
              </Link>
              <Link
                href='/approche'
                className='relative px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-white/40 hover:shadow-lg hover:backdrop-blur-xl group'
              >
                <span className='relative z-10 text-gray-700 group-hover:text-gray-900 transition-colors font-semibold'>
                  L&apos;Approche
                </span>
              </Link>
              <Link
                href='/forfaits'
                className='relative px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-white/40 hover:shadow-lg hover:backdrop-blur-xl group'
              >
                <span className='relative z-10 text-gray-700 group-hover:text-gray-900 transition-colors font-semibold'>
                  Forfaits & Tarifs
                </span>
              </Link>
              <Link
                href='/plateforme'
                className='relative px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-white/40 hover:shadow-lg hover:backdrop-blur-xl group'
              >
                <span className='relative z-10 text-gray-700 group-hover:text-gray-900 transition-colors font-semibold'>
                  La Plateforme
                </span>
              </Link>
              <Link
                href='/a-propos'
                className='relative px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-white/40 hover:shadow-lg hover:backdrop-blur-xl group'
              >
                <span className='relative z-10 text-gray-700 group-hover:text-gray-900 transition-colors font-semibold'>
                  À Propos
                </span>
              </Link>
              <Link
                href='/blog'
                className='relative px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-white/40 hover:shadow-lg hover:backdrop-blur-xl group'
              >
                <span className='relative z-10 text-gray-700 group-hover:text-gray-900 transition-colors font-semibold'>
                  Blog
                </span>
              </Link>
            </nav>

            {/* Boutons à droite - Desktop */}
            <div className='hidden lg:flex items-center space-x-3 flex-shrink-0'>
              <Link href='/auth/signin'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='relative overflow-hidden backdrop-blur-xl bg-white/30 hover:bg-white/50 border border-white/40 text-gray-700 hover:text-gray-900 font-semibold shadow-md hover:shadow-lg transition-all duration-200'
                >
                  Se connecter / S&apos;inscrire
                </Button>
              </Link>
              <Link href='/contact'>
                <Button
                  size='sm'
                  className='relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ring-2 ring-white/30'
                >
                  <span className='relative z-10'>
                    Réserver une Consultation
                  </span>
                  {/* Effet de brillance sur le bouton */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
                </Button>
              </Link>
            </div>

            {/* Bouton menu burger - Mobile/Tablet */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='lg:hidden relative p-2 rounded-xl bg-white/30 hover:bg-white/50 border border-white/40 transition-all duration-200 shadow-md hover:shadow-lg'
              aria-label='Menu'
            >
              <div className='w-6 h-5 flex flex-col justify-between'>
                <span
                  className={`block h-0.5 w-full bg-gray-700 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}
                />
                <span
                  className={`block h-0.5 w-full bg-gray-700 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}
                />
                <span
                  className={`block h-0.5 w-full bg-gray-700 rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile - Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        style={{ top: '0' }}
      />

      {/* Menu Mobile - Panel */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-screen w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 51 }}
      >
        <div className='flex flex-col h-full'>
          {/* Header du menu mobile */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg'>
                <svg
                  className='w-5 h-5 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2.5}
                    d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                  />
                </svg>
              </div>
              <span className='text-lg font-bold text-gray-900'>
                NutriSensia
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className='p-2 rounded-xl hover:bg-gray-100 transition-colors'
              aria-label='Fermer le menu'
            >
              <svg
                className='w-6 h-6 text-gray-700'
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

          {/* Navigation mobile */}
          <nav className='flex-1 overflow-y-auto p-6 space-y-2'>
            <Link
              href='/'
              onClick={() => setMobileMenuOpen(false)}
              className='block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold transition-colors'
            >
              Accueil
            </Link>
            <Link
              href='/approche'
              onClick={() => setMobileMenuOpen(false)}
              className='block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold transition-colors'
            >
              L&apos;Approche
            </Link>
            <Link
              href='/forfaits'
              onClick={() => setMobileMenuOpen(false)}
              className='block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold transition-colors'
            >
              Forfaits & Tarifs
            </Link>
            <Link
              href='/plateforme'
              onClick={() => setMobileMenuOpen(false)}
              className='block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold transition-colors'
            >
              La Plateforme
            </Link>
            <Link
              href='/a-propos'
              onClick={() => setMobileMenuOpen(false)}
              className='block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold transition-colors'
            >
              À Propos
            </Link>
            <Link
              href='/blog'
              onClick={() => setMobileMenuOpen(false)}
              className='block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold transition-colors'
            >
              Blog
            </Link>
          </nav>

          {/* Boutons d'action mobile */}
          <div className='p-6 border-t border-gray-200 space-y-3'>
            <Link
              href='/auth/signin'
              onClick={() => setMobileMenuOpen(false)}
              className='block'
            >
              <Button
                variant='ghost'
                className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-semibold'
              >
                Se connecter / S&apos;inscrire
              </Button>
            </Link>
            <Link
              href='/contact'
              onClick={() => setMobileMenuOpen(false)}
              className='block'
            >
              <Button className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg'>
                Réserver une Consultation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
