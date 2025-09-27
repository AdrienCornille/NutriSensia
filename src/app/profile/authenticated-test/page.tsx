'use client';

import { AuthenticatedProfileForm } from '@/components/forms/AuthenticatedProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthenticatedProfileTestPage() {
  const { user, isAuthenticated, loading, getUserRole } = useAuth();
  const router = useRouter();

  const handleCancel = () => {
    router.push('/profile');
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Affichage si non authentifié
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Test du Formulaire Authentifié
            </h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                Authentification requise
              </h3>
              <p className="text-yellow-700 mb-4">
                Vous devez être connecté pour tester ce formulaire.
              </p>
              <div className="space-x-2">
                <button 
                  onClick={() => router.push('/auth/signin')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Se connecter
                </button>
                <button 
                  onClick={() => router.push('/profile')}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Retour au profil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage des informations de l'utilisateur connecté
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec informations utilisateur */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Test du Formulaire Authentifié
              </h1>
              <p className="text-sm text-gray-600">
                Connecté en tant que : {user?.email} 
                {getUserRole() && ` (${getUserRole()})`}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                🧪 Page de test - Utilise le hook Context7 optimisé
              </p>
            </div>
            <button 
              onClick={() => router.push('/profile')}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Retour au profil
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire authentifié */}
      <AuthenticatedProfileForm
        onCancel={handleCancel}
        redirectAfterSave="/profile"
      />
    </div>
  );
}