import React from 'react';
import { ResetPasswordForm, AuthNavigation } from '@/components/auth';

/**
 * Page de réinitialisation de mot de passe
 */
export default function ResetPasswordPage() {
  return (
    <div className='min-h-screen bg-background-primary dark:bg-background-secondary flex items-center justify-center p-24dp'>
      <div className='w-full max-w-md space-y-24dp'>
        {/* Logo et titre */}
        <div className='text-center'>
          <h1 className='text-h1 font-bold text-neutral-dark dark:text-neutral-light mb-8dp'>
            NutriSensia
          </h1>
          <p className='text-body text-neutral-medium dark:text-neutral-medium'>
            Réinitialisez votre mot de passe
          </p>
        </div>

        {/* Formulaire de réinitialisation */}
        <ResetPasswordForm />

        {/* Navigation vers la connexion */}
        <AuthNavigation currentForm='reset' />
      </div>
    </div>
  );
}
