import React from 'react';
import { UpdatePasswordForm } from '@/components/auth';

/**
 * Page de mise à jour de mot de passe après réinitialisation
 */
export default function UpdatePasswordPage() {
  return (
    <div className='min-h-screen bg-background-primary dark:bg-background-secondary flex items-center justify-center p-24dp'>
      <div className='w-full max-w-md space-y-24dp'>
        {/* Logo et titre */}
        <div className='text-center'>
          <h1 className='text-h1 font-bold text-neutral-dark dark:text-neutral-light mb-8dp'>
            NutriSensia
          </h1>
          <p className='text-body text-neutral-medium dark:text-neutral-medium'>
            Définissez votre nouveau mot de passe
          </p>
        </div>

        {/* Formulaire de mise à jour */}
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
