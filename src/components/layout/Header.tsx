'use client';

import Link from 'next/link';
import { UserNav } from './UserNav';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  return (
    <header
      className={`bg-white shadow-sm border-b border-gray-200 ${className}`}
    >
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo et navigation principale */}
          <div className='flex items-center space-x-8'>
            <Link href='/' className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-5 h-5 text-white'
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
              <span className='text-xl font-bold text-gray-900'>
                NutriSensia
              </span>
            </Link>

            {/* Navigation principale */}
            <nav className='hidden md:flex items-center space-x-6'>
              <Link
                href='/nutrition'
                className='text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors'
              >
                Nutrition
              </Link>
              <Link
                href='/profile'
                className='text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors'
              >
                Profil
              </Link>
              <Link
                href='/settings'
                className='text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors'
              >
                Paramètres
              </Link>
            </nav>
          </div>

          {/* Navigation utilisateur */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
