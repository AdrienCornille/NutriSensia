/**
 * Page de diagnostic pour vérifier le statut d'authentification
 * Utile pour déboguer les problèmes d'accès admin
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function DebugAuthStatusPage() {
  const { user, session, loading, initialized, isAuthenticated } = useAuth();
  const { hasRole, isAdmin, userRole } = usePermissions();
  const [mfaStatus, setMfaStatus] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    const checkMfaStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          setMfaStatus({ data, error });
        } catch (err) {
          setMfaStatus({ error: err });
        }

        try {
          const { data, error } = await supabase.auth.getSession();
          setSessionInfo({ data, error });
        } catch (err) {
          setSessionInfo({ error: err });
        }
      }
    };

    checkMfaStatus();
  }, [user]);

  const createAdminAccount = async () => {
    const email = prompt('Email pour le compte admin:');
    const password = prompt('Mot de passe:');
    
    if (!email || !password) return;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin',
            full_name: 'Administrateur',
          }
        }
      });

      if (error) {
        alert(`Erreur: ${error.message}`);
      } else {
        alert('Compte admin créé ! Vérifiez votre email pour confirmer.');
      }
    } catch (err) {
      alert(`Erreur: ${err}`);
    }
  };

  const signInAsAdmin = async () => {
    const email = prompt('Email admin:');
    const password = prompt('Mot de passe:');
    
    if (!email || !password) return;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(`Erreur de connexion: ${error.message}`);
      } else {
        alert('Connexion réussie !');
        window.location.reload();
      }
    } catch (err) {
      alert(`Erreur: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Diagnostic d'Authentification</h1>
        
        {/* Statut général */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Statut Général</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Initialisé:</strong> {initialized ? '✅ Oui' : '❌ Non'}
            </div>
            <div>
              <strong>Chargement:</strong> {loading ? '⏳ En cours' : '✅ Terminé'}
            </div>
            <div>
              <strong>Authentifié:</strong> {isAuthenticated ? '✅ Oui' : '❌ Non'}
            </div>
            <div>
              <strong>Rôle:</strong> {userRole || 'Aucun'}
            </div>
            <div>
              <strong>Est Admin:</strong> {isAdmin() ? '✅ Oui' : '❌ Non'}
            </div>
            <div>
              <strong>Peut accéder admin:</strong> {hasRole('admin') ? '✅ Oui' : '❌ Non'}
            </div>
          </div>
        </div>

        {/* Informations utilisateur */}
        {user && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">👤 Informations Utilisateur</h2>
            <div className="space-y-2">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Nom:</strong> {user.user_metadata?.full_name || 'Non défini'}</div>
              <div><strong>Rôle:</strong> {user.user_metadata?.role || 'Non défini'}</div>
              <div><strong>2FA vérifié:</strong> {user.user_metadata?.two_factor_verified ? '✅ Oui' : '❌ Non'}</div>
              <div><strong>Créé le:</strong> {new Date(user.created_at).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Informations session */}
        {session && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">🔑 Informations Session</h2>
            <div className="space-y-2">
              <div><strong>Token d'accès:</strong> {session.access_token ? '✅ Présent' : '❌ Absent'}</div>
              <div><strong>Token de rafraîchissement:</strong> {session.refresh_token ? '✅ Présent' : '❌ Absent'}</div>
              <div><strong>Expire le:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Statut MFA */}
        {mfaStatus && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">🔐 Statut MFA</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(mfaStatus, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">⚡ Actions</h2>
          <div className="space-x-4">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={signInAsAdmin}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Se connecter en tant qu'admin
                </button>
                <button
                  onClick={createAdminAccount}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Créer un compte admin
                </button>
              </>
            ) : (
              <button
                onClick={() => supabase.auth.signOut()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Se déconnecter
              </button>
            )}
            <button
              onClick={() => window.location.href = '/admin/analytics/onboarding'}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Aller aux analytics
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">📋 Instructions</h2>
          <div className="text-blue-800 space-y-2">
            <p><strong>Si vous n'êtes pas connecté :</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Cliquez sur "Se connecter en tant qu'admin" si vous avez déjà un compte</li>
              <li>Ou cliquez sur "Créer un compte admin" pour en créer un nouveau</li>
            </ol>
            
            <p className="mt-4"><strong>Si vous êtes connecté mais pas admin :</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Déconnectez-vous et créez un compte admin</li>
              <li>Ou modifiez votre rôle dans la base de données</li>
            </ol>

            <p className="mt-4"><strong>Si vous êtes admin :</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Cliquez sur "Aller aux analytics" pour accéder à la page</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
