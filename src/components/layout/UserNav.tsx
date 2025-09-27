'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface UserNavProps {
  className?: string;
}

export function UserNav({ className = '' }: UserNavProps) {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    getSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className='w-8 h-8 bg-gray-200 rounded-full animate-pulse'></div>
        <div className='w-20 h-4 bg-gray-200 rounded animate-pulse'></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <Link href='/auth/signin'>
          <Button variant='ghost' size='sm'>
            Se connecter
          </Button>
        </Link>
        <Link href='/auth/signup'>
          <Button size='sm'>S'inscrire</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Informations utilisateur */}
      <div className='flex items-center space-x-3'>
        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
          <svg
            className='w-4 h-4 text-blue-600'
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
        </div>
        <div className='hidden sm:block'>
          <p className='text-sm font-medium text-gray-900'>
            {session.user.user_metadata?.name || session.user.email}
          </p>
          <p className='text-xs text-gray-500'>
            {session.user.user_metadata?.role || 'patient'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center space-x-2'>
        <Link href='/profile'>
          <Button variant='ghost' size='sm'>
            Profil
          </Button>
        </Link>
        <Button onClick={handleSignOut} variant='ghost' size='sm'>
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
