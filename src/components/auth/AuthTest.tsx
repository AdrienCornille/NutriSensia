'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
} from '@/components/ui';
import {
  SignUpForm,
  SignInForm,
  ResetPasswordForm,
  UpdatePasswordForm,
  GoogleOAuthButton,
  GitHubOAuthButton,
  AuthDivider,
  AuthNavigation,
  PasswordStrengthIndicator,
} from '@/components/auth';

/**
 * Composant de test pour tous les composants d'authentification
 */
export const AuthTest: React.FC = () => {
  const [activeForm, setActiveForm] = useState<
    'signup' | 'signin' | 'reset' | 'update'
  >('signup');
  const [testPassword, setTestPassword] = useState('');

  const forms = {
    signup: { title: 'Inscription', component: <SignUpForm /> },
    signin: { title: 'Connexion', component: <SignInForm /> },
    reset: { title: 'Réinitialisation', component: <ResetPasswordForm /> },
    update: { title: 'Mise à jour', component: <UpdatePasswordForm /> },
  };

  return (
    <div className='min-h-screen bg-background-primary dark:bg-background-secondary p-24dp'>
      <div className='max-w-6xl mx-auto space-y-32dp'>
        {/* En-tête */}
        <div className='text-center'>
          <h1 className='text-h1 font-bold text-neutral-dark dark:text-neutral-light mb-16dp'>
            Test des Composants d'Authentification
          </h1>
          <p className='text-body text-neutral-medium dark:text-neutral-medium'>
            Testez tous les composants d'authentification de NutriSensia
          </p>
        </div>

        {/* Navigation entre les formulaires */}
        <Card variant='primary'>
          <CardHeader>
            <h2 className='text-h2 font-bold text-neutral-dark dark:text-neutral-light'>
              Navigation entre les formulaires
            </h2>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-12dp'>
              {Object.entries(forms).map(([key, form]) => (
                <Button
                  key={key}
                  variant={activeForm === key ? 'primary' : 'secondary'}
                  onClick={() => setActiveForm(key as any)}
                >
                  {form.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formulaire actif */}
        <Card variant='primary'>
          <CardHeader>
            <h2 className='text-h2 font-bold text-neutral-dark dark:text-neutral-light'>
              {forms[activeForm].title}
            </h2>
          </CardHeader>
          <CardContent>{forms[activeForm].component}</CardContent>
        </Card>

        {/* Test des boutons OAuth */}
        <Card variant='primary'>
          <CardHeader>
            <h2 className='text-h2 font-bold text-neutral-dark dark:text-neutral-light'>
              Boutons OAuth
            </h2>
          </CardHeader>
          <CardContent className='space-y-16dp'>
            <GoogleOAuthButton />
            <GitHubOAuthButton />
          </CardContent>
        </Card>

        {/* Test du séparateur et de la navigation */}
        <Card variant='primary'>
          <CardHeader>
            <h2 className='text-h2 font-bold text-neutral-dark dark:text-neutral-light'>
              Navigation et séparateurs
            </h2>
          </CardHeader>
          <CardContent className='space-y-16dp'>
            <AuthDivider />
            <AuthNavigation currentForm='signin' />
            <AuthNavigation currentForm='signup' />
            <AuthNavigation currentForm='reset' />
          </CardContent>
        </Card>

        {/* Test de l'indicateur de force du mot de passe */}
        <Card variant='primary'>
          <CardHeader>
            <h2 className='text-h2 font-bold text-neutral-dark dark:text-neutral-light'>
              Indicateur de force du mot de passe
            </h2>
          </CardHeader>
          <CardContent className='space-y-16dp'>
            <div className='max-w-md'>
              <label className='block text-label font-medium text-neutral-dark dark:text-neutral-light mb-8dp'>
                Testez votre mot de passe :
              </label>
              <input
                type='password'
                value={testPassword}
                onChange={e => setTestPassword(e.target.value)}
                placeholder='Entrez un mot de passe pour tester'
                className='w-full h-56dp border-2 border-neutral-border dark:border-neutral-medium rounded-8dp bg-background-primary dark:bg-background-secondary px-16dp text-neutral-dark dark:text-neutral-light focus:border-primary focus:outline-none'
              />
            </div>

            {testPassword && (
              <PasswordStrengthIndicator password={testPassword} />
            )}
          </CardContent>
        </Card>

        {/* Exemples de mots de passe pour tester */}
        <Card variant='primary'>
          <CardHeader>
            <h2 className='text-h2 font-bold text-neutral-dark dark:text-neutral-light'>
              Exemples de mots de passe pour tester
            </h2>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-16dp'>
              <div className='space-y-8dp'>
                <h3 className='text-h3 font-semibold text-neutral-dark dark:text-neutral-light'>
                  Mots de passe faibles :
                </h3>
                <div className='space-y-4dp'>
                  <button
                    onClick={() => setTestPassword('123')}
                    className='text-left text-body text-neutral-medium dark:text-neutral-medium hover:text-primary transition-colors'
                  >
                    • 123 (très faible)
                  </button>
                  <button
                    onClick={() => setTestPassword('password')}
                    className='text-left text-body text-neutral-medium dark:text-neutral-medium hover:text-primary transition-colors'
                  >
                    • password (faible)
                  </button>
                  <button
                    onClick={() => setTestPassword('Password1')}
                    className='text-left text-body text-neutral-medium dark:text-neutral-medium hover:text-primary transition-colors'
                  >
                    • Password1 (moyen)
                  </button>
                </div>
              </div>

              <div className='space-y-8dp'>
                <h3 className='text-h3 font-semibold text-neutral-dark dark:text-neutral-light'>
                  Mots de passe forts :
                </h3>
                <div className='space-y-4dp'>
                  <button
                    onClick={() => setTestPassword('Password123!')}
                    className='text-left text-body text-neutral-medium dark:text-neutral-medium hover:text-primary transition-colors'
                  >
                    • Password123! (fort)
                  </button>
                  <button
                    onClick={() => setTestPassword('MySecureP@ssw0rd')}
                    className='text-left text-body text-neutral-medium dark:text-neutral-medium hover:text-primary transition-colors'
                  >
                    • MySecureP@ssw0rd (très fort)
                  </button>
                  <button
                    onClick={() => setTestPassword('NutriSensia2024!')}
                    className='text-left text-body text-neutral-medium dark:text-neutral-medium hover:text-primary transition-colors'
                  >
                    • NutriSensia2024! (très fort)
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations sur les fonctionnalités */}
        <Card variant='primary'>
          <CardHeader>
            <h2 className='text-h2 font-bold text-neutral-dark dark:text-neutral-light'>
              Fonctionnalités implémentées
            </h2>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-16dp'>
              <div className='space-y-12dp'>
                <h3 className='text-h3 font-semibold text-neutral-dark dark:text-neutral-light'>
                  ✅ Formulaires d'authentification :
                </h3>
                <ul className='space-y-6dp text-body text-neutral-medium dark:text-neutral-medium'>
                  <li>• Inscription avec validation complète</li>
                  <li>• Connexion avec gestion d'erreurs</li>
                  <li>• Réinitialisation de mot de passe</li>
                  <li>• Mise à jour de mot de passe</li>
                </ul>
              </div>

              <div className='space-y-12dp'>
                <h3 className='text-h3 font-semibold text-neutral-dark dark:text-neutral-light'>
                  ✅ Fonctionnalités avancées :
                </h3>
                <ul className='space-y-6dp text-body text-neutral-medium dark:text-neutral-medium'>
                  <li>• Validation Zod avec React Hook Form</li>
                  <li>• Indicateur de force du mot de passe</li>
                  <li>• Authentification OAuth Google</li>
                  <li>• Design responsive et accessible</li>
                  <li>• Support du thème sombre/clair</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
