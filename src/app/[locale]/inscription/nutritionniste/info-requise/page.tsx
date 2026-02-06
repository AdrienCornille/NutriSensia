'use client';

import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Mail, FileEdit, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface RequiredInfo {
  type: string;
  message: string;
}

/**
 * Page affichée quand des informations supplémentaires sont requises
 * @see AUTH-013 dans USER_STORIES.md
 */
export default function NutritionistInfoRequiredPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [requiredInfo, setRequiredInfo] = useState<RequiredInfo[]>([]);

  // Récupérer les informations manquantes
  useEffect(() => {
    async function fetchRequiredInfo() {
      if (!user) return;

      // Note: nutritionist_profiles n'est pas dans les types générés
      const { data } = (await (supabase as any)
        .from('nutritionist_profiles')
        .select('required_info')
        .eq('user_id', user.id)
        .single()) as { data: { required_info?: RequiredInfo[] } | null };

      if (data?.required_info) {
        setRequiredInfo(data.required_info);
      }
    }

    fetchRequiredInfo();
  }, [user]);

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
            <AlertTriangle className='w-12 h-12 text-amber-500' />
          </div>
        </div>

        {/* Message principal */}
        <div className='text-center mb-12'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
            Informations supplémentaires requises
          </h1>
          <p className='text-xl text-gray-600 mb-2'>
            Bonjour {firstName}, nous avons besoin de compléments d'information.
          </p>
          <p className='text-gray-500'>
            Veuillez fournir les éléments suivants pour finaliser votre
            inscription.
          </p>
        </div>

        {/* Liste des informations requises */}
        <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
          <h2 className='text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2'>
            <FileEdit className='w-5 h-5 text-amber-500' />
            Éléments à fournir
          </h2>

          {requiredInfo.length > 0 ? (
            <div className='space-y-4'>
              {requiredInfo.map((info, index) => (
                <div
                  key={index}
                  className='flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100'
                >
                  <div className='w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <span className='text-amber-600 font-bold'>
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-800 capitalize'>
                      {info.type}
                    </h3>
                    <p className='text-sm text-gray-600'>{info.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100'>
                <div className='w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <Upload className='w-4 h-4 text-amber-600' />
                </div>
                <div>
                  <h3 className='font-medium text-gray-800'>
                    Documents manquants
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Certains documents n'ont pas pu être vérifiés. Veuillez les
                    renvoyer.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comment fournir les informations */}
        <div className='bg-blue-50 rounded-xl p-6 mb-8'>
          <h3 className='font-medium text-blue-800 mb-4'>
            Comment fournir ces informations ?
          </h3>
          <ol className='space-y-3 text-sm text-blue-700'>
            <li className='flex items-start gap-3'>
              <span className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-medium'>
                1
              </span>
              <span>
                Répondez directement à l'email que vous avez reçu avec les
                documents demandés.
              </span>
            </li>
            <li className='flex items-start gap-3'>
              <span className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-medium'>
                2
              </span>
              <span>
                Ou contactez notre support à{' '}
                <a
                  href='mailto:support@nutrisensia.ch'
                  className='font-medium hover:underline'
                >
                  support@nutrisensia.ch
                </a>
              </span>
            </li>
            <li className='flex items-start gap-3'>
              <span className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-medium'>
                3
              </span>
              <span>
                Votre dossier sera réexaminé dans les 24 à 48 heures suivant la
                réception.
              </span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <a
            href='mailto:support@nutrisensia.ch'
            className='inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors'
          >
            <Mail className='w-5 h-5' />
            Envoyer les documents par email
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
