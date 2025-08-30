'use client';

import { useAuth, usePermissions, useUserRole } from '@/contexts/AuthContext';
import {
  AuthGuard,
  AdminGuard,
  NutritionistGuard,
  PatientGuard,
} from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AuthContextTestPage() {
  const {
    user,
    session,
    loading,
    error,
    initialized,
    isAuthenticated,
    signInWithPassword,
    signOut,
    clearError,
  } = useAuth();

  const { hasRole, hasAnyRole, isAdmin, isNutritionist, isPatient } =
    usePermissions();
  const userRole = useUserRole();

  const handleSignIn = async () => {
    const result = await signInWithPassword('test@example.com', 'password123');
    if (result.error) {
      console.error('Erreur de connexion:', result.error);
    }
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.error) {
      console.error('Erreur de déconnexion:', result.error);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Test du AuthContext</h1>

      {/* État de chargement */}
      {loading && (
        <Card className='mb-6'>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-2'>État de chargement</h2>
            <p className='text-gray-600'>Chargement en cours...</p>
          </div>
        </Card>
      )}

      {/* État d'initialisation */}
      <Card className='mb-6'>
        <div className='p-4'>
          <h2 className='text-xl font-semibold mb-2'>État d'initialisation</h2>
          <p className='text-gray-600'>
            Initialisé: {initialized ? 'Oui' : 'Non'}
          </p>
        </div>
      </Card>

      {/* Informations utilisateur */}
      <Card className='mb-6'>
        <div className='p-4'>
          <h2 className='text-xl font-semibold mb-2'>
            Informations utilisateur
          </h2>
          <div className='space-y-2'>
            <p>
              <strong>Authentifié:</strong> {isAuthenticated ? 'Oui' : 'Non'}
            </p>
            <p>
              <strong>Rôle:</strong> {userRole || 'Aucun'}
            </p>
            {user && (
              <>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Nom:</strong>{' '}
                  {user.user_metadata?.full_name || 'Non défini'}
                </p>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Permissions */}
      <Card className='mb-6'>
        <div className='p-4'>
          <h2 className='text-xl font-semibold mb-2'>Permissions</h2>
          <div className='space-y-2'>
            <p>
              <strong>Admin:</strong> {isAdmin() ? 'Oui' : 'Non'}
            </p>
            <p>
              <strong>Nutritionniste:</strong>{' '}
              {isNutritionist() ? 'Oui' : 'Non'}
            </p>
            <p>
              <strong>Patient:</strong> {isPatient() ? 'Oui' : 'Non'}
            </p>
            <p>
              <strong>Admin ou Nutritionniste:</strong>{' '}
              {hasAnyRole(['admin', 'nutritionist']) ? 'Oui' : 'Non'}
            </p>
          </div>
        </div>
      </Card>

      {/* Session */}
      {session && (
        <Card className='mb-6'>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-2'>Session</h2>
            <div className='space-y-2'>
              <p>
                <strong>Expire le:</strong>{' '}
                {new Date(session.expires_at! * 1000).toLocaleString()}
              </p>
              <p>
                <strong>Token d'accès:</strong>{' '}
                {session.access_token ? 'Présent' : 'Absent'}
              </p>
              <p>
                <strong>Token de rafraîchissement:</strong>{' '}
                {session.refresh_token ? 'Présent' : 'Absent'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Erreurs */}
      {error && (
        <Card className='mb-6 border-red-200 bg-red-50'>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-2 text-red-800'>Erreur</h2>
            <p className='text-red-600'>{error.message}</p>
            <p className='text-red-500 text-sm'>Code: {error.code}</p>
            <Button onClick={clearError} className='mt-2'>
              Effacer l'erreur
            </Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <Card className='mb-6'>
        <div className='p-4'>
          <h2 className='text-xl font-semibold mb-2'>Actions</h2>
          <div className='space-x-4'>
            {!isAuthenticated ? (
              <Button onClick={handleSignIn}>Se connecter (test)</Button>
            ) : (
              <Button onClick={handleSignOut}>Se déconnecter</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tests des guards */}
      <div className='space-y-6'>
        <Card>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-2'>Test AuthGuard</h2>
            <AuthGuard>
              <p className='text-green-600'>✅ AuthGuard: Accès autorisé</p>
            </AuthGuard>
          </div>
        </Card>

        <Card>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-2'>Test AdminGuard</h2>
            <AdminGuard>
              <p className='text-green-600'>✅ AdminGuard: Accès autorisé</p>
            </AdminGuard>
          </div>
        </Card>

        <Card>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-2'>
              Test NutritionistGuard
            </h2>
            <NutritionistGuard>
              <p className='text-green-600'>
                ✅ NutritionistGuard: Accès autorisé
              </p>
            </NutritionistGuard>
          </div>
        </Card>

        <Card>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-2'>Test PatientGuard</h2>
            <PatientGuard>
              <p className='text-green-600'>✅ PatientGuard: Accès autorisé</p>
            </PatientGuard>
          </div>
        </Card>
      </div>
    </div>
  );
}
