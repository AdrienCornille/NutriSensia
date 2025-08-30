import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function NutritionPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4'>
      <div className='container mx-auto max-w-4xl py-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Recommandations Nutritionnelles
          </h1>
          <p className='text-gray-600'>
            Découvrez des conseils personnalisés pour votre alimentation
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <Card className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Plan de repas</h2>
            <p className='text-gray-600 mb-4'>
              Votre plan de repas personnalisé basé sur vos objectifs et
              préférences.
            </p>
            <Button className='w-full'>Voir le plan</Button>
          </Card>

          <Card className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Suivi nutritionnel</h2>
            <p className='text-gray-600 mb-4'>
              Suivez vos apports nutritionnels et vos progrès.
            </p>
            <Button className='w-full'>Voir les statistiques</Button>
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
