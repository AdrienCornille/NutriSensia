'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
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
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-blue-600 animate-spin'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
          </div>
          <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Bienvenue sur NutriSensia
          </h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto mb-8'>
            Votre assistant nutritionnel intelligent pour une alimentation
            équilibrée et personnalisée.
          </p>

          {session ? (
            // Utilisateur connecté
            <div className='space-y-4'>
              <div className='bg-white rounded-lg p-6 shadow-sm max-w-md mx-auto'>
                <div className='flex items-center justify-center mb-4'>
                  <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-blue-600'
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
                </div>
                <p className='text-lg font-semibold text-gray-900 mb-2'>
                  Bonjour,{' '}
                  {session.user.user_metadata?.name || session.user.email}!
                </p>
                <p className='text-sm text-gray-600 mb-4'>
                  Rôle : {session.user.user_metadata?.role || 'patient'}
                </p>
                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                  <Link href='/profile'>
                    <Button className='w-full sm:w-auto'>Mon profil</Button>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant='secondary'
                    className='w-full sm:w-auto'
                  >
                    Se déconnecter
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Utilisateur non connecté
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'>
              <Link href='/auth/signin'>
                <Button className='w-full sm:w-auto px-8 py-3 text-lg'>
                  Se connecter
                </Button>
              </Link>
              <Link href='/auth/signup'>
                <Button
                  variant='secondary'
                  className='w-full sm:w-auto px-8 py-3 text-lg'
                >
                  S'inscrire
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
          {/* Carte de profil */}
          <Card className='p-6 text-center'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-blue-600'
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
            <h3 className='text-lg font-semibold mb-2'>Profil</h3>
            <p className='text-gray-600 mb-4'>
              Gérez vos informations personnelles et préférences
              nutritionnelles.
            </p>
            <Link href='/profile' className='w-full'>
              <Button className='w-full'>Accéder au profil</Button>
            </Link>
          </Card>

          {/* Carte de nutrition */}
          <Card className='p-6 text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-green-600'
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
            <h3 className='text-lg font-semibold mb-2'>Nutrition</h3>
            <p className='text-gray-600 mb-4'>
              Découvrez des recommandations nutritionnelles personnalisées.
            </p>
            <Link href='/nutrition' className='w-full'>
              <Button className='w-full'>Voir les recommandations</Button>
            </Link>
          </Card>

          {/* Carte de paramètres */}
          <Card className='p-6 text-center'>
            <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-purple-600'
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
            </div>
            <h3 className='text-lg font-semibold mb-2'>Paramètres</h3>
            <p className='text-gray-600 mb-4'>
              Configurez vos préférences et la sécurité de votre compte.
            </p>
            <Link href='/settings' className='w-full'>
              <Button className='w-full'>Gérer les paramètres</Button>
            </Link>
          </Card>
        </div>

        {/* Section de test */}
        <div className='mt-16 text-center'>
          <Card className='p-6 max-w-2xl mx-auto'>
            <h3 className='text-lg font-semibold mb-4'>
              Tests et développement
            </h3>
            <p className='text-gray-600 mb-4'>
              Accédez aux outils de test pour vérifier le bon fonctionnement de
              l'authentification 2FA.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='/mfa-test'>
                <Button variant='secondary'>Tester la 2FA</Button>
              </Link>
              <Link href='/auth-flow-test'>
                <Button variant='secondary'>
                  Test du flux d'authentification
                </Button>
              </Link>
              <Link href='/role-test'>
                <Button variant='secondary'>Test des rôles et 2FA</Button>
              </Link>
              <Link href='/navigation-test'>
                <Button variant='secondary'>Test de la navigation</Button>
              </Link>
              <Link href='/debug-auth'>
                <Button variant='secondary'>Debug authentification</Button>
              </Link>
              <Link href='/profile-debug'>
                <Button variant='secondary'>Debug page profile</Button>
              </Link>
              <Link href='/profile-diagnostic'>
                <Button variant='secondary'>Diagnostic profil</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
