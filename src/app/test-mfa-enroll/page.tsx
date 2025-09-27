'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { MFAEnrollment } from '@/components/auth/MFAEnrollment';

/**
 * Page de test pour l'enrôlement MFA
 * Permet de tester le flux complet avec connexion + enrôlement
 */
export default function TestMFAEnrollPage() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fonction de connexion de test
  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      console.log('✅ Connexion réussie:', data);
      setIsSignedIn(true);
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsSignedIn(false);
  };

  // Callbacks pour l'enrôlement MFA
  const handleMFASuccess = () => {
    console.log('✅ Enrôlement MFA réussi');
    router.push('/dashboard');
  };

  const handleMFACancel = () => {
    console.log('❌ Enrôlement MFA annulé');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!isSignedIn ? (
          <Card className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Test MFA - Connexion
              </h1>
              <p className="text-gray-600">
                Connectez-vous pour tester l'enrôlement MFA
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleSignIn}
                disabled={isLoading || !email || !password}
                className="w-full"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Page de test pour l'enrôlement MFA
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div>
            <div className="mb-4 text-center">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-sm"
              >
                Se déconnecter
              </Button>
            </div>
            
            <MFAEnrollment
              onSuccess={handleMFASuccess}
              onCancel={handleMFACancel}
              userRole="patient"
            />
          </div>
        )}
      </div>
    </div>
  );
}

