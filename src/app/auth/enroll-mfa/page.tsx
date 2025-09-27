'use client';

import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { MFAEnrollment } from '@/components/auth/MFAEnrollment';
import { Card } from '@/components/ui/Card';

export default function EnrollMFAPage() {
  const { redirectToHome, redirectToSignIn } = useAuthRedirect();

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <Card className='p-8'>
          <div className='text-center mb-6'>
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
                  d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Configuration de sécurité
            </h1>
            <p className='text-gray-600'>
              Configurez l'authentification à deux facteurs pour sécuriser votre compte.
            </p>
          </div>

          <MFAEnrollment
            onSuccess={() => {
              // Redirection automatique après configuration réussie
              redirectToHome();
            }}
            onCancel={() => {
              // Redirection vers la page de connexion
              redirectToSignIn();
            }}
          />
        </Card>
      </div>
    </div>
  );
}

