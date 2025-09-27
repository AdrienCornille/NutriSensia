import React from 'react';
import {
  SignUpForm,
  GoogleOAuthButton,
  AuthDivider,
  AuthNavigation,
} from '@/components/auth';

/**
 * Page d'inscription avec formulaire et options OAuth
 */
export default function SignUpPage() {
  return (
    <div className='min-h-screen bg-background-primary dark:bg-background-secondary flex items-center justify-center p-24dp'>
      <div className='w-full max-w-md space-y-24dp'>
        {/* Logo et titre */}
        <div className='text-center'>
          <h1 className='text-h1 font-bold text-neutral-dark dark:text-neutral-light mb-8dp'>
            NutriSensia
          </h1>
          <p className='text-body text-neutral-medium dark:text-neutral-medium'>
            Votre partenaire pour une nutrition équilibrée
          </p>
        </div>

        {/* Formulaire d'inscription */}
        <SignUpForm />

        {/* Séparateur */}
        <AuthDivider />

        {/* Bouton OAuth Google */}
        <GoogleOAuthButton />

        {/* Navigation vers la connexion */}
        <AuthNavigation currentForm='signup' />
      </div>
    </div>
  );
}
