import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4'>
      <div className='container mx-auto max-w-4xl py-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Paramètres</h1>
          <p className='text-gray-600'>
            Configurez vos préférences et la sécurité de votre compte
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <Card className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Sécurité</h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium text-gray-900'>
                    Authentification 2FA
                  </p>
                  <p className='text-sm text-gray-600'>
                    Protection supplémentaire
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

          <Card className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Préférences</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Langue
                </label>
                <select className='w-full p-2 border border-gray-300 rounded-md'>
                  <option>Français</option>
                  <option>English</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Thème
                </label>
                <select className='w-full p-2 border border-gray-300 rounded-md'>
                  <option>Clair</option>
                  <option>Sombre</option>
                  <option>Automatique</option>
                </select>
              </div>
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
