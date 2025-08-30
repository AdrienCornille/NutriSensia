import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Bienvenue sur NutriSensia
          </h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Votre assistant nutritionnel intelligent pour une alimentation
            équilibrée et personnalisée.
          </p>
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
            <Link href='/mfa-test'>
              <Button variant='outline'>Tester la 2FA</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
