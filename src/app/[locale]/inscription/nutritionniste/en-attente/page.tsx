'use client';

import { useEffect } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Mail, FileCheck, ArrowRight } from 'lucide-react';

/**
 * Page d'attente après inscription nutritionniste
 * Affichée quand le dossier est en cours de validation
 * @see AUTH-010 dans USER_STORIES.md
 */
export default function NutritionistPendingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Si pas connecté après chargement, rediriger vers la page d'inscription
  useEffect(() => {
    if (!loading && !user) {
      router.push('/inscription/nutritionniste');
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
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-white'>
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
        {/* Icône principale */}
        <div className='flex justify-center mb-8'>
          <div className='w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center'>
            <Clock className='w-12 h-12 text-amber-600' />
          </div>
        </div>

        {/* Message principal */}
        <div className='text-center mb-12'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
            Merci {firstName} ! 🎉
          </h1>
          <p className='text-xl text-gray-600 mb-2'>
            Votre demande d'inscription est en cours d'examen
          </p>
          <p className='text-gray-500'>
            Notre équipe vérifie actuellement vos documents et certifications.
          </p>
        </div>

        {/* Étapes du processus */}
        <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
          <h2 className='text-lg font-semibold text-gray-800 mb-6'>
            Prochaines étapes
          </h2>

          <div className='space-y-6'>
            {/* Étape 1 - Complétée */}
            <div className='flex items-start gap-4'>
              <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <span className='text-green-600 font-bold'>✓</span>
              </div>
              <div>
                <h3 className='font-medium text-gray-800'>
                  Inscription soumise
                </h3>
                <p className='text-sm text-gray-500'>
                  Votre dossier a bien été reçu par notre équipe.
                </p>
              </div>
            </div>

            {/* Étape 2 - En cours */}
            <div className='flex items-start gap-4'>
              <div className='w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse'>
                <FileCheck className='w-4 h-4 text-amber-600' />
              </div>
              <div>
                <h3 className='font-medium text-gray-800'>
                  Vérification en cours
                </h3>
                <p className='text-sm text-gray-500'>
                  Nous vérifions vos certifications ASCA/RME et vos documents.
                  Délai habituel : 24 à 48 heures ouvrées.
                </p>
              </div>
            </div>

            {/* Étape 3 - À venir */}
            <div className='flex items-start gap-4 opacity-50'>
              <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <Mail className='w-4 h-4 text-gray-400' />
              </div>
              <div>
                <h3 className='font-medium text-gray-800'>
                  Notification par email
                </h3>
                <p className='text-sm text-gray-500'>
                  Vous recevrez un email dès que votre compte sera validé.
                </p>
              </div>
            </div>

            {/* Étape 4 - À venir */}
            <div className='flex items-start gap-4 opacity-50'>
              <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <ArrowRight className='w-4 h-4 text-gray-400' />
              </div>
              <div>
                <h3 className='font-medium text-gray-800'>
                  Accès à votre tableau de bord
                </h3>
                <p className='text-sm text-gray-500'>
                  Configurez votre profil et commencez à recevoir des patients.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations de contact */}
        <div className='bg-blue-50 rounded-xl p-6 text-center'>
          <h3 className='font-medium text-blue-800 mb-2'>
            Des questions sur votre inscription ?
          </h3>
          <p className='text-sm text-blue-600 mb-4'>
            Notre équipe est disponible pour vous aider.
          </p>
          <a
            href='mailto:support@nutrisensia.ch'
            className='inline-flex items-center gap-2 text-blue-700 font-medium hover:underline'
          >
            <Mail className='w-4 h-4' />
            support@nutrisensia.ch
          </a>
        </div>

        {/* Bouton retour */}
        <div className='text-center mt-8'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors'
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
