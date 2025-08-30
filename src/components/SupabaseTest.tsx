'use client';

import { useState } from 'react';
import { auth, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export default function SupabaseTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');

  const addResult = (result: TestResult) => {
    setResults(prev => [
      ...prev,
      { ...result, timestamp: new Date().toISOString() },
    ]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testConfiguration = async () => {
    setLoading(true);
    addResult({
      success: isSupabaseConfigured,
      message: isSupabaseConfigured
        ? '✅ Configuration Supabase valide'
        : '❌ Configuration Supabase manquante ou invalide',
      details: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    });
    setLoading(false);
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await auth.getSession();
      addResult({
        success: !error,
        message: error
          ? `❌ Erreur de connexion: ${error.message}`
          : '✅ Connexion Supabase réussie',
        details: {
          session: data?.session ? 'Session active' : 'Aucune session',
        },
      });
    } catch (error: any) {
      addResult({
        success: false,
        message: `❌ Erreur inattendue: ${error.message}`,
        details: error,
      });
    }
    setLoading(false);
  };

  const testSignUp = async () => {
    setLoading(true);
    try {
      const { data, error } = await auth.signUp(email, password, {
        full_name: 'Utilisateur Test',
        role: 'patient',
      });

      addResult({
        success: !error,
        message: error
          ? `❌ Erreur d'inscription: ${error.message}`
          : '✅ Inscription réussie',
        details: {
          user: data?.user ? 'Utilisateur créé' : 'Aucun utilisateur',
          session: data?.session ? 'Session créée' : 'Aucune session',
        },
      });
    } catch (error: any) {
      addResult({
        success: false,
        message: `❌ Erreur inattendue: ${error.message}`,
        details: error,
      });
    }
    setLoading(false);
  };

  const testSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await auth.signInWithPassword(email, password);

      addResult({
        success: !error,
        message: error
          ? `❌ Erreur de connexion: ${error.message}`
          : '✅ Connexion réussie',
        details: {
          user: data?.user ? 'Utilisateur connecté' : 'Aucun utilisateur',
          session: data?.session ? 'Session active' : 'Aucune session',
        },
      });
    } catch (error: any) {
      addResult({
        success: false,
        message: `❌ Erreur inattendue: ${error.message}`,
        details: error,
      });
    }
    setLoading(false);
  };

  // Test de connexion avec Google OAuth
  const testGoogleOAuth = async () => {
    setResults(prev => ({
      ...prev,
      googleOAuth: { status: 'loading', message: 'Test en cours...' },
    }));

    try {
      const result = await auth.signInWithGoogle();

      if (result.error) {
        setResults(prev => ({
          ...prev,
          googleOAuth: {
            status: 'error',
            message: `❌ Erreur Google OAuth: ${result.error.message}`,
            details: {
              error: result.error,
              note: 'Vérifiez que Google OAuth est configuré dans votre projet Supabase',
            },
          },
        }));
      } else {
        setResults(prev => ({
          ...prev,
          googleOAuth: {
            status: 'success',
            message: '✅ Connexion Google OAuth initiée',
            details: {
              data: result.data,
              note: 'Redirection vers Google en cours...',
            },
          },
        }));
      }
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        googleOAuth: {
          status: 'error',
          message: `❌ Erreur Google OAuth: ${error.message}`,
          details: {
            error: error,
            note: 'Vérifiez la configuration Google OAuth dans Supabase',
          },
        },
      }));
    }
  };

  const testPasswordReset = async () => {
    setLoading(true);
    try {
      const { data, error } = await auth.resetPasswordForEmail(email);

      addResult({
        success: !error,
        message: error
          ? `❌ Erreur de réinitialisation: ${error.message}`
          : '✅ Email de réinitialisation envoyé',
        details: {
          success: data?.success ? 'Opération réussie' : 'Aucun résultat',
        },
      });
    } catch (error: any) {
      addResult({
        success: false,
        message: `❌ Erreur inattendue: ${error.message}`,
        details: error,
      });
    }
    setLoading(false);
  };

  // Test de récupération de l'utilisateur
  const testGetUser = async () => {
    setResults(prev => ({
      ...prev,
      getUser: { status: 'loading', message: 'Test en cours...' },
    }));

    try {
      const result = await auth.getUser();

      if (result.error) {
        setResults(prev => ({
          ...prev,
          getUser: {
            status: 'error',
            message: `❌ Erreur de récupération utilisateur: ${result.error.message}`,
            details: {
              error: result.error,
              note:
                result.error.code === 'NOT_AUTHENTICATED' ||
                result.error.code === 'NO_USER'
                  ? 'Aucun utilisateur connecté. Connectez-vous d\'abord avec "Test Connexion".'
                  : 'Erreur lors de la récupération des données utilisateur',
            },
          },
        }));
      } else {
        setResults(prev => ({
          ...prev,
          getUser: {
            status: 'success',
            message: '✅ Utilisateur récupéré avec succès',
            details: {
              user: result.data?.user
                ? {
                    id: result.data.user.id,
                    email: result.data.user.email,
                    created_at: result.data.user.created_at,
                    last_sign_in_at: result.data.user.last_sign_in_at,
                    user_metadata: result.data.user.user_metadata,
                  }
                : 'Aucun utilisateur',
              note: 'Utilisateur connecté et récupéré correctement',
            },
          },
        }));
      }
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        getUser: {
          status: 'error',
          message: `❌ Erreur inattendue: ${error.message}`,
          details: {
            error: error,
            note: "Erreur lors de la récupération de l'utilisateur",
          },
        },
      }));
    }
  };

  const testSignOut = async () => {
    setLoading(true);
    try {
      const { data, error } = await auth.signOut();

      addResult({
        success: !error,
        message: error
          ? `❌ Erreur de déconnexion: ${error.message}`
          : '✅ Déconnexion réussie',
        details: {
          success: data?.success ? 'Opération réussie' : 'Aucun résultat',
        },
      });
    } catch (error: any) {
      addResult({
        success: false,
        message: `❌ Erreur inattendue: ${error.message}`,
        details: error,
      });
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    clearResults();
    await testConfiguration();
    await testConnection();
    await testGetUser();
    await testSignUp();
    await testSignIn();
    await testGoogleOAuth();
    await testPasswordReset();
    await testSignOut();
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <Card className='p-6'>
        <h1 className='text-2xl font-bold mb-4'>
          Test de Configuration Supabase
        </h1>
        <p className='text-gray-600 mb-6'>
          Ce composant permet de tester toutes les fonctionnalités
          d'authentification Supabase.
        </p>

        {/* Configuration des tests */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div>
            <label className='block text-sm font-medium mb-2'>
              Email de test
            </label>
            <Input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='test@example.com'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>
              Mot de passe de test
            </label>
            <Input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='testpassword123'
            />
          </div>
        </div>

        {/* Boutons de test */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
          <Button
            onClick={runAllTests}
            disabled={loading}
            className='bg-blue-600 hover:bg-blue-700'
          >
            {loading ? 'Tests en cours...' : 'Tous les tests'}
          </Button>
          <Button
            onClick={testConfiguration}
            disabled={loading}
            variant='outline'
          >
            Configuration
          </Button>
          <Button onClick={testConnection} disabled={loading} variant='outline'>
            Connexion
          </Button>
          <Button onClick={clearResults} variant='outline'>
            Effacer
          </Button>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          <Button
            onClick={testSignUp}
            disabled={loading}
            variant='outline'
            size='sm'
          >
            Inscription
          </Button>
          <Button
            onClick={testSignIn}
            disabled={loading}
            variant='outline'
            size='sm'
          >
            Connexion
          </Button>
          <Button
            onClick={testGoogleOAuth}
            disabled={loading}
            variant='outline'
            size='sm'
          >
            Google OAuth
          </Button>
          <Button
            onClick={testPasswordReset}
            disabled={loading}
            variant='outline'
            size='sm'
          >
            Reset Password
          </Button>
          <Button
            onClick={testGetUser}
            disabled={loading}
            variant='outline'
            size='sm'
          >
            Get User
          </Button>
          <Button
            onClick={testSignOut}
            disabled={loading}
            variant='outline'
            size='sm'
          >
            Déconnexion
          </Button>
        </div>
      </Card>

      {/* Résultats des tests */}
      {results.length > 0 && (
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Résultats des tests</h2>
          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <p
                      className={`font-medium ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {result.message}
                    </p>
                    {result.details && (
                      <details className='mt-2'>
                        <summary className='cursor-pointer text-sm text-gray-600'>
                          Détails
                        </summary>
                        <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto'>
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <span className='text-xs text-gray-500 ml-2'>
                    {new Date(
                      result.timestamp || Date.now()
                    ).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Instructions</h2>
        <div className='space-y-3 text-sm text-gray-600'>
          <p>
            <strong>1. Configuration :</strong> Vérifie que les variables
            d'environnement Supabase sont correctement configurées.
          </p>
          <p>
            <strong>2. Connexion :</strong> Teste la connexion à la base de
            données Supabase.
          </p>
          <p>
            <strong>3. Inscription :</strong> Crée un nouvel utilisateur avec
            les informations fournies.
          </p>
          <p>
            <strong>4. Connexion :</strong> Connecte l'utilisateur avec
            email/mot de passe.
          </p>
          <p>
            <strong>5. Google OAuth :</strong> Initie le processus de connexion
            avec Google.
          </p>
          <p>
            <strong>6. Reset Password :</strong> Envoie un email de
            réinitialisation de mot de passe.
          </p>
          <p>
            <strong>7. Get User :</strong> Récupère les informations de
            l'utilisateur actuel.
          </p>
          <p>
            <strong>8. Déconnexion :</strong> Déconnecte l'utilisateur actuel.
          </p>
        </div>
      </Card>
    </div>
  );
}
