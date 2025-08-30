import React from 'react';
import {
  SignInForm,
  GoogleOAuthButton,
  AuthDivider,
  AuthNavigation,
} from '@/components/auth';

/**
 * Page de connexion avec formulaire et options OAuth
 */
export default function SignInPage() {
  return (
    <div className='min-h-screen bg-background-primary dark:bg-background-secondary flex items-center justify-center p-24dp'>
      <div className='w-full max-w-md space-y-24dp'>
        {/* Logo et titre */}
        <div className='text-center'>
          <h1 className='text-h1 font-bold text-neutral-dark dark:text-neutral-light mb-8dp'>
            NutriSensia
          </h1>
          <p className='text-body text-neutral-medium dark:text-neutral-medium'>
            Connectez-vous à votre espace personnel
          </p>
        </div>

        {/* Formulaire de connexion */}
        <SignInForm />

        {/* Séparateur */}
        <AuthDivider />

        {/* Bouton OAuth Google */}
        <GoogleOAuthButton />

        {/* Navigation vers l'inscription */}
        <AuthNavigation currentForm='signin' />
      </div>
    </div>
  );
}
