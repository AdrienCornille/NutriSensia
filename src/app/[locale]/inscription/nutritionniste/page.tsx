'use client';

import { NutritionistRegistrationForm } from '@/components/forms/NutritionistRegistrationForm';
import { useNutritionistRegistration } from '@/hooks/useNutritionistRegistration';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';

/**
 * Page d'inscription nutritionniste
 * Formulaire multi-étapes avec upload de documents
 * @see AUTH-008, AUTH-009 dans USER_STORIES.md
 */
export default function NutritionistRegistrationPage() {
  const { submitRegistration, isSubmitting, error, clearError } =
    useNutritionistRegistration();

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <Link
              href='/'
              className='flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              <span className='font-medium'>Retour à l'accueil</span>
            </Link>
            <Link href='/' className='flex items-center gap-2'>
              <span className='text-xl font-bold text-[#1B998B]'>
                NutriSensia
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Titre */}
        <div className='text-center mb-10'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
            Devenir nutritionniste sur NutriSensia
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Rejoignez notre réseau de professionnels certifiés et accompagnez
            vos patients dans leur parcours nutritionnel.
          </p>
        </div>

        {/* Avantages */}
        <div className='grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12'>
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4'>
              <span className='text-2xl'>🎯</span>
            </div>
            <h3 className='font-semibold text-gray-800 mb-2'>
              Développez votre patientèle
            </h3>
            <p className='text-sm text-gray-600'>
              Accédez à une plateforme connectée à des centaines de patients en
              recherche d'accompagnement.
            </p>
          </div>
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
              <span className='text-2xl'>📊</span>
            </div>
            <h3 className='font-semibold text-gray-800 mb-2'>
              Outils professionnels
            </h3>
            <p className='text-sm text-gray-600'>
              Plans alimentaires, suivi nutritionnel, messagerie sécurisée et
              visioconférence intégrés.
            </p>
          </div>
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4'>
              <span className='text-2xl'>🛡️</span>
            </div>
            <h3 className='font-semibold text-gray-800 mb-2'>
              Certification ASCA/RME
            </h3>
            <p className='text-sm text-gray-600'>
              Mettez en avant vos certifications et permettez à vos patients
              d'être remboursés.
            </p>
          </div>
        </div>

        {/* Message d'erreur global */}
        {error && (
          <div className='max-w-2xl mx-auto mb-6'>
            <div className='bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3'>
              <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
              <div className='flex-1'>
                <p className='text-red-800 font-medium'>
                  Une erreur est survenue
                </p>
                <p className='text-red-600 text-sm mt-1'>{error}</p>
              </div>
              <button
                onClick={clearError}
                className='text-red-400 hover:text-red-600 transition-colors'
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <NutritionistRegistrationForm
          onSubmit={async data => {
            await submitRegistration(data);
          }}
        />

        {/* Footer info */}
        <div className='text-center mt-12'>
          <p className='text-sm text-gray-500'>
            Déjà inscrit ?{' '}
            <Link
              href='/auth/signin'
              className='text-[#1B998B] hover:underline font-medium'
            >
              Connectez-vous
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-gray-50 border-t border-gray-200 mt-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <p className='text-sm text-gray-500'>
              © {new Date().getFullYear()} NutriSensia. Tous droits réservés.
            </p>
            <div className='flex items-center gap-6'>
              <a
                href='/conditions-generales'
                className='text-sm text-gray-500 hover:text-gray-700'
              >
                Conditions générales
              </a>
              <a
                href='/politique-confidentialite'
                className='text-sm text-gray-500 hover:text-gray-700'
              >
                Confidentialité
              </a>
              <Link
                href='/contact'
                className='text-sm text-gray-500 hover:text-gray-700'
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
