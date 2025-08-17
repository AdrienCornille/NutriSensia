'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp, signOut, isAuthenticated } = useAuth();

  const testConnection = async () => {
    setLoading(true);
    setTestResult('Test en cours...');

    try {
      // Test de connexion simple
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        setTestResult(`❌ Erreur de connexion: ${error.message}`);
      } else {
        setTestResult('✅ Connexion Supabase réussie !');
      }
    } catch (error) {
      setTestResult(
        `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setTestResult("Test d'authentification en cours...");

    try {
      // Test d'inscription avec un email temporaire
      const testEmail = `test-${Date.now()}@example.com`;
      const { data, error } = await signUp(testEmail, 'testpassword123', {
        name: 'Test User',
      });

      if (error) {
        setTestResult(
          `❌ Erreur d'authentification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        );
      } else {
        setTestResult('✅ Authentification Supabase fonctionnelle !');
      }
    } catch (error) {
      setTestResult(
        `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='card max-w-md mx-auto'>
      <h3 className='text-lg font-semibold mb-4'>Test Supabase</h3>

      <div className='space-y-4'>
        <div>
          <p className='text-sm text-neutral mb-2'>
            Statut de l&apos;authentification:{' '}
            {isAuthenticated ? '✅ Connecté' : '❌ Non connecté'}
          </p>
          {user && (
            <p className='text-sm text-neutral'>Utilisateur: {user.email}</p>
          )}
        </div>

        <div className='space-y-2'>
          <button
            onClick={testConnection}
            disabled={loading}
            className='btn-primary w-full'
          >
            {loading ? 'Test en cours...' : 'Tester la connexion'}
          </button>

          <button
            onClick={testAuth}
            disabled={loading}
            className='btn-accent w-full'
          >
            {loading ? 'Test en cours...' : 'Tester l&apos;authentification'}
          </button>

          {isAuthenticated && (
            <button
              onClick={signOut}
              disabled={loading}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
            >
              Se déconnecter
            </button>
          )}
        </div>

        {testResult && (
          <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
            <p className='text-sm'>{testResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
