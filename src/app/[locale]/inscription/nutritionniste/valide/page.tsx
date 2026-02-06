'use client';

import { useEffect } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckCircle2,
  ArrowRight,
  Settings,
  Users,
  Calendar,
} from 'lucide-react';

/**
 * Page affichée quand l'inscription nutritionniste est validée
 * @see AUTH-011 dans USER_STORIES.md
 */
export default function NutritionistValidatedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Si pas connecté après chargement, rediriger vers la connexion
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B998B]'></div>
      </div>
    );
  }

  const firstName = user?.user_metadata?.first_name || 'Nutritionniste';

  return (
    <div className='min-h-screen bg-gradient-to-b from-emerald-50 to-white'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-center'>
            <Link href='/' className='flex items-center gap-2'>
              <span className='text-xl font-bold text-[#1B998B]'>
                NutriSensia
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        {/* Icône principale avec animation */}
        <div className='flex justify-center mb-8'>
          <div className='w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce'>
            <CheckCircle2 className='w-12 h-12 text-emerald-500' />
          </div>
        </div>

        {/* Message principal */}
        <div className='text-center mb-12'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
            Félicitations {firstName} ! 🎉
          </h1>
          <p className='text-xl text-gray-600 mb-2'>
            Votre compte nutritionniste est maintenant actif
          </p>
          <p className='text-gray-500'>
            Vous pouvez accéder à votre tableau de bord et commencer à
            accompagner vos patients.
          </p>
        </div>

        {/* Ce que vous pouvez faire */}
        <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
          <h2 className='text-lg font-semibold text-gray-800 mb-6'>
            Prêt à démarrer ? Voici vos prochaines étapes
          </h2>

          <div className='space-y-4'>
            <div className='flex items-start gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100'>
              <div className='w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                <Settings className='w-5 h-5 text-emerald-600' />
              </div>
              <div className='flex-1'>
                <h3 className='font-medium text-gray-800'>
                  Complétez votre profil
                </h3>
                <p className='text-sm text-gray-500 mb-2'>
                  Ajoutez votre photo, votre bio et vos disponibilités.
                </p>
                <a
                  href='/dashboard/nutritionist'
                  className='text-sm text-emerald-600 font-medium hover:underline inline-flex items-center gap-1'
                >
                  Configurer mon profil <ArrowRight className='w-3 h-3' />
                </a>
              </div>
            </div>

            <div className='flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                <Calendar className='w-5 h-5 text-blue-600' />
              </div>
              <div className='flex-1'>
                <h3 className='font-medium text-gray-800'>
                  Définissez vos disponibilités
                </h3>
                <p className='text-sm text-gray-500 mb-2'>
                  Paramétrez vos horaires de consultation et vos tarifs.
                </p>
                <a
                  href='/dashboard/nutritionist'
                  className='text-sm text-blue-600 font-medium hover:underline inline-flex items-center gap-1'
                >
                  Gérer mon agenda <ArrowRight className='w-3 h-3' />
                </a>
              </div>
            </div>

            <div className='flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100'>
              <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                <Users className='w-5 h-5 text-purple-600' />
              </div>
              <div className='flex-1'>
                <h3 className='font-medium text-gray-800'>
                  Recevez vos premiers patients
                </h3>
                <p className='text-sm text-gray-500 mb-2'>
                  Les patients peuvent désormais réserver des consultations avec
                  vous.
                </p>
                <a
                  href='/dashboard/nutritionist'
                  className='text-sm text-purple-600 font-medium hover:underline inline-flex items-center gap-1'
                >
                  Voir les patients <ArrowRight className='w-3 h-3' />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Badge certification */}
        <div className='bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white text-center mb-8'>
          <div className='w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-3xl'>🏅</span>
          </div>
          <h3 className='text-xl font-bold mb-2'>
            Nutritionniste Certifié NutriSensia
          </h3>
          <p className='text-emerald-100'>
            Votre profil affichera le badge de certification ASCA/RME
          </p>
        </div>

        {/* CTA principal */}
        <div className='text-center'>
          <Link
            href='/dashboard/nutritionist'
            className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1B998B] text-white font-semibold rounded-xl hover:bg-[#158578] transition-colors text-lg shadow-lg shadow-emerald-200'
          >
            Accéder à mon tableau de bord
            <ArrowRight className='w-5 h-5' />
          </Link>
        </div>
      </main>
    </div>
  );
}
