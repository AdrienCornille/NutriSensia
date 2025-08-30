'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
} from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Schéma de validation pour la connexion
const signInSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type SignInData = z.infer<typeof signInSchema>;

/**
 * Formulaire de connexion spécifique pour la page MFA
 * Redirige automatiquement vers /mfa-test après connexion
 */
export const MFASignInForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignInData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Connexion avec Supabase
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Connexion réussie ! Redirection...',
      });

      // Rediriger vers /mfa-test après connexion
      setTimeout(() => {
        router.push('/mfa-test');
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Une erreur est survenue lors de la connexion',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader>
        <h2 className='text-2xl font-bold text-center text-gray-900'>
          Connexion
        </h2>
        <p className='text-center text-gray-600'>
          Connectez-vous pour tester la 2FA
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* Email */}
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Email
            </label>
            <Input
              id='email'
              type='email'
              {...register('email')}
              placeholder='votre@email.com'
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Mot de passe
            </label>
            <Input
              id='password'
              type='password'
              {...register('password')}
              placeholder='Votre mot de passe'
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Bouton de connexion */}
          <Button type='submit' disabled={isLoading} className='w-full'>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className='flex flex-col space-y-2'>
        <Button
          onClick={() => router.push('/auth/signup')}
          variant='outline'
          className='w-full'
        >
          📝 Créer un compte
        </Button>

        <Button
          onClick={() => router.push('/')}
          variant='outline'
          className='w-full'
        >
          🏠 Retour à l'accueil
        </Button>
      </CardFooter>
    </Card>
  );
};
