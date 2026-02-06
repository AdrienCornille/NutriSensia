'use client';

import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { XCircle, Mail, RefreshCw, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Page affichée quand l'inscription nutritionniste est rejetée
 * @see AUTH-012 dans USER_STORIES.md
 */
export default function NutritionistRejectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Récupérer la raison du rejet
  useEffect(() => {
    async function fetchRejectionReason() {
      if (!user) return;

      // Note: nutritionist_profiles n'est pas dans les types générés
      const { data } = (await (supabase as any)
        .from('nutritionist_profiles')
        .select('rejection_reason')
        .eq('user_id', user.id)
        .single()) as { data: { rejection_reason?: string } | null };

      if (data?.rejection_reason) {
        setRejectionReason(data.rejection_reason);
      }
    }

    fetchRejectionReason();
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
    <div className='min-h-screen bg-gradient-to-b from-red-50 to-white'>
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
          <div className='w-24 h-24 bg-red-100 rounded-full flex items-center justify-center'>
            <XCircle className='w-12 h-12 text-red-500' />
          </div>
        </div>

        {/* Message principal */}
        <div className='text-center mb-12'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
            Demande non approuvée
          </h1>
          <p className='text-xl text-gray-600 mb-2'>
            Bonjour {firstName}, nous n'avons pas pu valider votre inscription.
          </p>
          <p className='text-gray-500'>
            Ne vous inquiétez pas, vous pouvez soumettre une nouvelle demande.
          </p>
        </div>

        {/* Raison du rejet */}
        {rejectionReason && (
          <div className='bg-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-red-400'>
            <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
              <HelpCircle className='w-5 h-5 text-red-500' />
              Raison du rejet
            </h2>
            <p className='text-gray-700'>{rejectionReason}</p>
          </div>
        )}

        {/* Problèmes courants */}
        <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
          <h2 className='text-lg font-semibold text-gray-800 mb-6'>
            Problèmes courants
          </h2>

          <div className='space-y-4'>
            <div className='flex items-start gap-4 p-4 bg-gray-50 rounded-xl'>
              <div className='w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <span className='text-amber-600'>📄</span>
              </div>
              <div>
                <h3 className='font-medium text-gray-800'>
                  Documents illisibles ou expirés
                </h3>
                <p className='text-sm text-gray-500'>
                  Vérifiez que vos certificats ASCA/RME sont à jour et lisibles.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4 p-4 bg-gray-50 rounded-xl'>
              <div className='w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <span className='text-amber-600'>🔢</span>
              </div>
              <div>
                <h3 className='font-medium text-gray-800'>
                  Numéro de certification incorrect
                </h3>
                <p className='text-sm text-gray-500'>
                  Assurez-vous que les numéros ASCA ou RME correspondent à vos
                  documents.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4 p-4 bg-gray-50 rounded-xl'>
              <div className='w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <span className='text-amber-600'>📷</span>
              </div>
              <div>
                <h3 className='font-medium text-gray-800'>
                  Photo non conforme
                </h3>
                <p className='text-sm text-gray-500'>
                  Utilisez une photo professionnelle claire et récente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/inscription/nutritionniste'
            className='inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors'
          >
            <RefreshCw className='w-5 h-5' />
            Soumettre une nouvelle demande
          </Link>
          <a
            href='mailto:support@nutrisensia.ch'
            className='inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
          >
            <Mail className='w-5 h-5' />
            Contacter le support
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
