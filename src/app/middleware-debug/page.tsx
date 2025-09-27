/**
 * Page de debug pour diagnostiquer les problèmes de middleware
 * Affiche les informations de session, cookies et redirections
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function MiddlewareDebugPage() {
  const { user, session, loading, initialized, isAuthenticated } = useAuth();
  const { hasRole, isAdmin, userRole } = usePermissions();
  const [cookies, setCookies] = useState<string>('');
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [middlewareInfo, setMiddlewareInfo] = useState<any>(null);

  useEffect(() => {
    // Récupérer les cookies
    setCookies(document.cookie);

    // Récupérer les informations de session détaillées
    const getSessionInfo = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        setSessionInfo({ data, error });
      } catch (err) {
        setSessionInfo({ error: err });
      }
    };

    getSessionInfo();

    // Simuler les informations que le middleware verrait
    const getMiddlewareInfo = async () => {
      try {
        const [userResponse, sessionResponse] = await Promise.all([
          supabase.auth.getUser(),
          supabase.auth.getSession(),
        ]);

        const middlewareData = {
          user: userResponse.data.user,
          session: sessionResponse.data.session,
          cookies: {
            'sb-access-token': document.cookie.includes('sb-access-token'),
            'sb-refresh-token': document.cookie.includes('sb-refresh-token'),
            'supabase-auth-token': document.cookie.includes('supabase-auth-token'),
          },
          hasAuthCookies: document.cookie.includes('sb-access-token') ||
                          document.cookie.includes('sb-refresh-token') ||
                          document.cookie.includes('supabase-auth-token'),
        };

        setMiddlewareInfo(middlewareData);
      } catch (err) {
        setMiddlewareInfo({ error: err });
      }
    };

    getMiddlewareInfo();
  }, []);

  const testAdminAccess = async () => {
    try {
      const response = await fetch('/api/analytics/onboarding/metrics?type=overview&timeframe=7d');
      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Accès API admin réussi !');
        console.log('Données API:', result);
      } else {
        alert(`❌ Erreur API: ${result.error || 'Erreur inconnue'}`);
        console.error('Erreur API:', result);
      }
    } catch (error) {
      alert(`❌ Erreur de requête: ${error}`);
      console.error('Erreur:', error);
    }
  };

  const clearCookies = () => {
    // Supprimer tous les cookies Supabase
    const cookiesToDelete = [
      'sb-access-token',
      'sb-refresh-token', 
      'supabase-auth-token',
      'sb-ywshijyzpmothwjnvrxi-auth-token',
      'sb-ywshijyzpmothwjnvrxi-auth-token.0',
      'sb-ywshijyzpmothwjnvrxi-auth-token.1',
    ];

    cookiesToDelete.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
    });

    alert('Cookies supprimés ! Rechargez la page.');
    window.location.reload();
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        alert(`❌ Erreur de rafraîchissement: ${error.message}`);
      } else {
        alert('✅ Session rafraîchie !');
        window.location.reload();
      }
    } catch (error) {
      alert(`❌ Erreur: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Debug Middleware</h1>
        
        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">⚡ Actions Rapides</h2>
          <div className="space-x-4">
            <button
              onClick={testAdminAccess}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tester l'accès API admin
            </button>
            <button
              onClick={refreshSession}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Rafraîchir la session
            </button>
            <button
              onClick={clearCookies}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Supprimer les cookies
            </button>
            <button
              onClick={() => window.location.href = '/admin/analytics/onboarding'}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Aller aux analytics
            </button>
          </div>
        </div>

        {/* Statut d'authentification */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔐 Statut d'Authentification</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Initialisé:</strong> {initialized ? '✅ Oui' : '❌ Non'}</div>
            <div><strong>Chargement:</strong> {loading ? '⏳ En cours' : '✅ Terminé'}</div>
            <div><strong>Authentifié:</strong> {isAuthenticated ? '✅ Oui' : '❌ Non'}</div>
            <div><strong>Rôle:</strong> {userRole || 'Aucun'}</div>
            <div><strong>Est Admin:</strong> {isAdmin() ? '✅ Oui' : '❌ Non'}</div>
            <div><strong>Peut accéder admin:</strong> {hasRole('admin') ? '✅ Oui' : '❌ Non'}</div>
          </div>
        </div>

        {/* Informations utilisateur */}
        {user && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">👤 Informations Utilisateur</h2>
            <div className="space-y-2">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Rôle:</strong> {user.user_metadata?.role || 'Non défini'}</div>
              <div><strong>2FA vérifié:</strong> {user.user_metadata?.two_factor_verified ? '✅ Oui' : '❌ Non'}</div>
              <div><strong>Créé le:</strong> {new Date(user.created_at).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Cookies */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🍪 Cookies</h2>
          <div className="space-y-2">
            <div><strong>Cookies présents:</strong></div>
            <div className="bg-gray-100 p-4 rounded text-sm font-mono break-all">
              {cookies || 'Aucun cookie'}
            </div>
          </div>
        </div>

        {/* Informations middleware */}
        {middlewareInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">⚙️ Informations Middleware</h2>
            <div className="space-y-4">
              <div>
                <strong>Utilisateur détecté:</strong> {middlewareInfo.user ? '✅ Oui' : '❌ Non'}
              </div>
              <div>
                <strong>Session détectée:</strong> {middlewareInfo.session ? '✅ Oui' : '❌ Non'}
              </div>
              <div>
                <strong>Cookies d'auth détectés:</strong> {middlewareInfo.hasAuthCookies ? '✅ Oui' : '❌ Non'}
              </div>
              <div>
                <strong>Détail des cookies:</strong>
                <ul className="ml-4 mt-2">
                  <li>sb-access-token: {middlewareInfo.cookies['sb-access-token'] ? '✅' : '❌'}</li>
                  <li>sb-refresh-token: {middlewareInfo.cookies['sb-refresh-token'] ? '✅' : '❌'}</li>
                  <li>supabase-auth-token: {middlewareInfo.cookies['supabase-auth-token'] ? '✅' : '❌'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Informations session détaillées */}
        {sessionInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">🔑 Informations Session Détaillées</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Diagnostic */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-900">🔍 Diagnostic</h2>
          <div className="text-yellow-800 space-y-2">
            <p><strong>Si vous êtes redirigé vers /auth/signin :</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Vérifiez que "Authentifié" est ✅ Oui</li>
              <li>Vérifiez que "Cookies d'auth détectés" est ✅ Oui</li>
              <li>Vérifiez que "Session détectée" est ✅ Oui</li>
              <li>Si un élément est ❌, essayez "Rafraîchir la session"</li>
              <li>Si ça ne marche pas, essayez "Supprimer les cookies" puis reconnectez-vous</li>
            </ol>
            
            <p className="mt-4"><strong>Si l'accès API admin échoue :</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Vérifiez que "Rôle" est "admin"</li>
              <li>Vérifiez que "Est Admin" est ✅ Oui</li>
              <li>Vérifiez que "Peut accéder admin" est ✅ Oui</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
