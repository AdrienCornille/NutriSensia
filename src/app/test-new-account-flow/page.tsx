'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

/**
 * Page de test pour vérifier le nouveau flux d'authentification
 * 1. Création de compte avec email
 * 2. Vérification automatique de redirection vers 2FA
 * 3. Test OAuth Google
 */
export default function TestNewAccountFlowPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'nutritionist'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const testEmailSignup = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: `Test ${role} User`,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.session) {
        setMessage(
          `✅ Compte créé avec succès ! Un email de vérification a été envoyé à ${email}. ` +
          `Cliquez sur le lien dans l'email pour continuer le processus d'authentification.`
        );
      } else if (data.session) {
        setMessage(
          `✅ Compte créé et connecté ! Redirection automatique vers la configuration 2FA...`
        );
        // Simuler redirection vers 2FA
        setTimeout(() => {
          window.location.href = '/auth/enroll-mfa';
        }, 2000);
      }
    } catch (error: any) {
      setMessage(`❌ Erreur : ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGoogleOAuth = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      setMessage('🔄 Redirection vers Google en cours...');
    } catch (error: any) {
      setMessage(`❌ Erreur OAuth : ${error.message}`);
      setIsLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log('👤 Utilisateur actuel:', {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        createdAt: user.created_at,
        emailConfirmed: user.email_confirmed_at,
      });

      // Vérifier le profil dans la DB
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('📋 Profil DB:', profile);
      setMessage(`👤 Utilisateur connecté : ${user.email} (${user.user_metadata?.role || 'patient'})`);
    } else {
      setMessage('❌ Aucun utilisateur connecté');
    }
  };

  const disconnect = async () => {
    await supabase.auth.signOut();
    setMessage('🔓 Déconnecté');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">
            🧪 Test Nouveau Flux d'Authentification
          </h1>
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">📧 Test Création de Compte Email</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Mot de passe</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rôle</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as 'patient' | 'nutritionist')}
                className="w-full p-2 border rounded"
              >
                <option value="patient">Patient</option>
                <option value="nutritionist">Nutritionniste</option>
              </select>
            </div>

            <Button
              onClick={testEmailSignup}
              disabled={isLoading || !email || !password}
              className="w-full"
              variant="primary"
            >
              {isLoading ? 'Création...' : '📧 Créer Compte Email'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">🔍 Test OAuth Google</h2>
          
          <Button
            onClick={testGoogleOAuth}
            disabled={isLoading}
            className="w-full"
            variant="secondary"
          >
            {isLoading ? 'Redirection...' : '🔗 Test OAuth Google'}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">🔧 Utilitaires</h2>
          
          <div className="flex space-x-4">
            <Button
              onClick={checkCurrentUser}
              variant="ghost"
              className="flex-1"
            >
              👤 Vérifier Utilisateur
            </Button>
            
            <Button
              onClick={disconnect}
              variant="destructive"
              className="flex-1"
            >
              🔓 Déconnecter
            </Button>
          </div>
        </Card>

        {message && (
          <Card className="p-4">
            <div className="text-sm whitespace-pre-wrap">
              {message}
            </div>
          </Card>
        )}

        <Card className="p-4 bg-blue-50">
          <h3 className="font-semibold mb-2">📋 Flux Attendu :</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li><strong>Création compte email</strong> → Email de vérification envoyé</li>
            <li><strong>Clic lien email</strong> → Redirection vers /auth/callback</li>
            <li><strong>AuthCallback détecte nouveau compte</strong> → Force redirection vers /auth/enroll-mfa</li>
            <li><strong>Configuration 2FA</strong> → Scan QR code + vérification</li>
            <li><strong>2FA validé</strong> → Redirection vers dashboard</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}

