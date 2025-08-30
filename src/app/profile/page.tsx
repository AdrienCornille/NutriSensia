import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='container mx-auto max-w-4xl py-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Profil Utilisateur
          </h1>
          <p className='text-gray-600'>
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <Card className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>
              Informations personnelles
            </h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email
                </label>
                <p className='text-gray-900'>utilisateur@example.com</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nom
                </label>
                <p className='text-gray-900'>John Doe</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Rôle
                </label>
                <p className='text-gray-900'>Utilisateur</p>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Sécurité</h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium text-gray-900'>
                    Authentification 2FA
                  </p>
                  <p className='text-sm text-gray-600'>
                    Protection supplémentaire de votre compte
                  </p>
                </div>
                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                  Activée
                </span>
              </div>
              <Button variant='outline' className='w-full'>
                Gérer la 2FA
              </Button>
            </div>
          </Card>
        </div>

        <div className='mt-8 text-center'>
          <Link href='/'>
            <Button variant='outline'>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
