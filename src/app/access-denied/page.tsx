/**
 * Page d'accès refusé pour les utilisateurs non-administrateurs
 *
 * Cette page s'affiche quand un utilisateur tente d'accéder aux pages A/B Testing
 * sans avoir les permissions administrateur requises.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldX, ArrowLeft, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Accès refusé - NutriSensia',
  description:
    "Vous n'avez pas les permissions nécessaires pour accéder à cette page",
  robots: 'noindex, nofollow',
};

interface AccessDeniedPageProps {
  searchParams: {
    reason?: string;
    required_role?: string;
    current_role?: string;
  };
}

export default function AccessDeniedPage({
  searchParams,
}: AccessDeniedPageProps) {
  const { reason, required_role, current_role } = searchParams;

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
        {/* Icône d'accès refusé */}
        <div className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6'>
          <ShieldX className='h-8 w-8 text-red-600' />
        </div>

        {/* Titre */}
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>Accès refusé</h1>

        {/* Message principal */}
        <div className='mb-6'>
          <p className='text-gray-600 mb-4'>
            Vous n'avez pas les permissions nécessaires pour accéder aux pages
            de démonstration A/B Testing.
          </p>

          {/* Détails de l'erreur */}
          <div className='bg-gray-50 rounded-lg p-4 text-left'>
            <h3 className='font-medium text-gray-900 mb-2 flex items-center'>
              <UserCheck className='h-4 w-4 mr-2' />
              Détails de l'accès
            </h3>
            <div className='space-y-2 text-sm text-gray-600'>
              {required_role && (
                <div>
                  <span className='font-medium'>Rôle requis :</span>
                  <span className='ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs'>
                    {required_role}
                  </span>
                </div>
              )}
              {current_role && (
                <div>
                  <span className='font-medium'>Votre rôle :</span>
                  <span className='ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs'>
                    {current_role}
                  </span>
                </div>
              )}
              {reason && (
                <div>
                  <span className='font-medium'>Raison :</span>
                  <span className='ml-2 text-gray-700'>
                    {reason === 'admin_required'
                      ? 'Permissions administrateur requises'
                      : reason}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions pour les développeurs */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <h3 className='font-medium text-blue-900 mb-2'>
            🔧 Mode développement
          </h3>
          <p className='text-sm text-blue-800 mb-2'>
            Pour tester l'accès administrateur, ajoutez le paramètre{' '}
            <code>?role=admin</code> à l'URL.
          </p>
          <div className='text-xs text-blue-700 space-y-1'>
            <p>
              • <strong>Accès admin :</strong>{' '}
              <code>/testing/ab-demo?role=admin</code>
            </p>
            <p>
              • <strong>Accès refusé :</strong>{' '}
              <code>/testing/ab-demo?role=nutritionist</code>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className='space-y-3'>
          <Link
            href='/'
            className='inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Retour à l'accueil
          </Link>

          <Link
            href='/auth/signin'
            className='inline-flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
          >
            Se connecter avec un compte administrateur
          </Link>
        </div>

        {/* Informations de debug */}
        {process.env.NODE_ENV === 'development' && (
          <div className='mt-6 pt-4 border-t border-gray-200'>
            <h4 className='text-xs font-medium text-gray-500 mb-2'>
              Debug Info
            </h4>
            <div className='text-xs text-gray-400 space-y-1'>
              <p>Reason: {reason || 'unknown'}</p>
              <p>Required Role: {required_role || 'admin'}</p>
              <p>Current Role: {current_role || 'unknown'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
