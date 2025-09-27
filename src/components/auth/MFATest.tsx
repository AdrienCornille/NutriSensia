'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMFA } from '@/hooks/useMFA';
import { MFAEnrollment } from './MFAEnrollment';
import { MFAVerification } from './MFAVerification';
import { MFAManagement } from './MFAManagement';
import { MFADiagnostic } from './MFADiagnostic';
import { MFACleanup } from './MFACleanup';
import { MFAFixer } from './MFAFixer';
import { MFASignInForm } from './MFASignInForm';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * Composant de test complet pour l'authentification à deux facteurs
 * Permet de tester toutes les fonctionnalités 2FA de manière interactive
 */
export function MFATest() {
  // États pour gérer l'interface de test
  const [currentView, setCurrentView] = useState<
    'overview' | 'enrollment' | 'verification' | 'management' | 'diagnostic'
  >('overview');
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  // Hooks pour l'authentification et la 2FA
  const { user, signOut } = useAuth();
  const {
    factors,
    assuranceLevel,
    isLoading,
    error,
    needsMFA,
    isMFAVerified,
    hasVerifiedFactors,
    hasUnverifiedFactors,
    loadFactors,
    checkAssuranceLevel,
    refreshSession,
    clearError,
  } = useMFA();

  /**
   * Gère la déconnexion de l'utilisateur
   */
  const handleSignOut = async () => {
    await signOut();
  };

  /**
   * Gère l'enrôlement réussi
   */
  const handleEnrollmentSuccess = () => {
    setShowEnrollment(false);
    loadFactors();
    checkAssuranceLevel();
  };

  /**
   * Gère la vérification réussie
   */
  const handleVerificationSuccess = () => {
    setShowVerification(false);
    refreshSession();
  };

  /**
   * Gère l'annulation de l'enrôlement
   */
  const handleEnrollmentCancelled = () => {
    setShowEnrollment(false);
  };

  /**
   * Gère l'annulation de la vérification
   */
  const handleVerificationCancelled = () => {
    setShowVerification(false);
    handleSignOut();
  };

  // Affichage des modales d'enrôlement et de vérification
  if (showEnrollment) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
        <div className='max-w-md w-full'>
          <MFAEnrollment
            onEnrolled={handleEnrollmentSuccess}
            onCancelled={handleEnrollmentCancelled}
            userRole={user?.user_metadata?.role}
          />
        </div>
      </div>
    );
  }

  if (showVerification) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
        <div className='max-w-md w-full'>
          <MFAVerification
            onVerified={handleVerificationSuccess}
            onCancelled={handleVerificationCancelled}
            userEmail={user?.email}
          />
        </div>
      </div>
    );
  }

  // Affichage de la page de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <div className='max-w-4xl mx-auto p-6 space-y-6'>
        {/* En-tête */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Test de l'authentification à deux facteurs (2FA)
          </h1>
          <p className='text-gray-600'>
            Connectez-vous pour tester les fonctionnalités 2FA de Nutrisensia
          </p>
        </div>

        {/* Formulaire de connexion intégré */}
        <MFASignInForm />

        {/* Instructions */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Instructions</h2>
          <div className='space-y-3 text-sm text-gray-600'>
            <p>
              <strong>1. Connexion :</strong> Utilisez "Se connecter" pour
              accéder avec un compte existant.
            </p>
            <p>
              <strong>2. Création de compte :</strong> Utilisez "Créer un
              compte" si vous n'avez pas encore de compte.
            </p>
            <p>
              <strong>3. Test 2FA :</strong> Une fois connecté, vous pourrez
              tester toutes les fonctionnalités 2FA.
            </p>
            <p>
              <strong>4. Applications recommandées :</strong> Google
              Authenticator, Authy, 1Password, ou Microsoft Authenticator.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      {/* En-tête */}
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Test de l'authentification à deux facteurs (2FA)
        </h1>
        <p className='text-gray-600'>
          Interface de test pour toutes les fonctionnalités 2FA de Nutrisensia
        </p>
      </div>

      {/* Informations utilisateur */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Informations utilisateur</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-500'>Email</p>
            <p className='font-medium'>{user?.email || 'Non connecté'}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Rôle</p>
            <p className='font-medium'>
              {user?.user_metadata?.role || 'Non défini'}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>ID utilisateur</p>
            <p className='font-mono text-sm'>{user?.id || 'Non disponible'}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Statut de connexion</p>
            <p className='font-medium'>{user ? 'Connecté' : 'Déconnecté'}</p>
          </div>
        </div>
      </Card>

      {/* État MFA */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>
          État de l'authentification à deux facteurs
        </h2>

        {isLoading ? (
          <div className='text-center py-4'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2'></div>
            <p className='text-gray-600'>Chargement des informations MFA...</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Niveau d'assurance */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <p className='text-sm text-gray-500'>Niveau actuel</p>
                <p className='text-lg font-semibold'>
                  {assuranceLevel?.currentLevel === 'aal2'
                    ? 'AAL2 (2FA)'
                    : 'AAL1 (Standard)'}
                </p>
              </div>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <p className='text-sm text-gray-500'>Niveau requis</p>
                <p className='text-lg font-semibold'>
                  {assuranceLevel?.nextLevel === 'aal2'
                    ? 'AAL2 (2FA)'
                    : 'AAL1 (Standard)'}
                </p>
              </div>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <p className='text-sm text-gray-500'>Statut</p>
                <p
                  className={`text-lg font-semibold ${isMFAVerified ? 'text-green-600' : 'text-yellow-600'}`}
                >
                  {isMFAVerified
                    ? 'Vérifié'
                    : needsMFA
                      ? 'Requis'
                      : 'Non configuré'}
                </p>
              </div>
            </div>

            {/* Facteurs MFA */}
            <div>
              <h3 className='text-lg font-medium mb-3'>
                Facteurs d'authentification
              </h3>
              {factors.length === 0 ? (
                <p className='text-gray-500'>Aucun facteur configuré</p>
              ) : (
                <div className='space-y-2'>
                  {factors.map(factor => (
                    <div
                      key={factor.id}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div>
                        <p className='font-medium'>
                          {factor.type === 'totp'
                            ? "Application d'authentification"
                            : 'Téléphone'}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Statut:{' '}
                          {factor.status === 'verified'
                            ? 'Vérifié'
                            : 'Non vérifié'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          factor.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {factor.status === 'verified' ? '✓' : '⏳'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messages d'erreur */}
            {error && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
                <p className='text-red-700 text-sm'>{error}</p>
                <Button onClick={clearError} size='sm' className='mt-2'>
                  Effacer l'erreur
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Actions */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Actions de test</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {/* Enrôlement */}
          <div className='space-y-2'>
            <h3 className='font-medium'>Enrôlement 2FA</h3>
            <Button
              onClick={() => setShowEnrollment(true)}
              disabled={!user}
              className='w-full'
            >
              Configurer la 2FA
            </Button>
            <p className='text-xs text-gray-500'>
              Configurez un nouveau facteur d'authentification
            </p>
          </div>

          {/* Vérification */}
          <div className='space-y-2'>
            <h3 className='font-medium'>Vérification 2FA</h3>
            <Button
              onClick={() => setShowVerification(true)}
              disabled={!user || !hasVerifiedFactors}
              className='w-full'
            >
              Tester la vérification
            </Button>
            <p className='text-xs text-gray-500'>
              Testez le processus de vérification 2FA
            </p>
          </div>

          {/* Gestion */}
          <div className='space-y-2'>
            <h3 className='font-medium'>Gestion MFA</h3>
            <Button
              onClick={() => setCurrentView('management')}
              disabled={!user}
              className='w-full'
            >
              Gérer les facteurs
            </Button>
            <p className='text-xs text-gray-500'>
              Consultez et gérez vos facteurs d'authentification
            </p>
          </div>

          {/* Rafraîchissement */}
          <div className='space-y-2'>
            <h3 className='font-medium'>Rafraîchissement</h3>
            <Button
              onClick={() => {
                loadFactors();
                checkAssuranceLevel();
              }}
              disabled={isLoading}
              variant='outline'
              className='w-full'
            >
              Rafraîchir les données
            </Button>
            <p className='text-xs text-gray-500'>
              Mettez à jour les informations MFA
            </p>
          </div>

          {/* Déconnexion */}
          <div className='space-y-2'>
            <h3 className='font-medium'>Session</h3>
            <Button
              onClick={handleSignOut}
              variant='outline'
              className='w-full text-red-600 hover:text-red-700'
            >
              Se déconnecter
            </Button>
            <p className='text-xs text-gray-500'>
              Déconnectez-vous pour tester la reconnexion
            </p>
          </div>

          {/* Retour à l'aperçu */}
          {currentView !== 'overview' && (
            <div className='space-y-2'>
              <h3 className='font-medium'>Navigation</h3>
              <Button
                onClick={() => setCurrentView('overview')}
                variant='outline'
                className='w-full'
              >
                Retour à l'aperçu
              </Button>
              <p className='text-xs text-gray-500'>
                Retournez à la vue principale
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Vue de gestion MFA */}
      {currentView === 'management' && (
        <MFAManagement
          onFactorRemoved={() => {
            loadFactors();
            checkAssuranceLevel();
          }}
          onEnrollNew={() => setShowEnrollment(true)}
        />
      )}

      {/* Diagnostic 2FA */}
      <MFADiagnostic />

      {/* Nettoyage des facteurs MFA */}
      <MFACleanup />

      {/* Correcteur MFA Avancé */}
      <MFAFixer />

      {/* Instructions */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Instructions de test</h2>
        <div className='space-y-3 text-sm text-gray-600'>
          <p>
            <strong>1. Connexion :</strong> Assurez-vous d'être connecté pour
            tester les fonctionnalités 2FA.
          </p>
          <p>
            <strong>2. Enrôlement :</strong> Utilisez "Configurer la 2FA" pour
            ajouter un facteur d'authentification.
          </p>
          <p>
            <strong>3. Vérification :</strong> Testez la vérification avec
            "Tester la vérification" après avoir configuré un facteur.
          </p>
          <p>
            <strong>4. Gestion :</strong> Utilisez "Gérer les facteurs" pour
            voir et supprimer vos facteurs d'authentification.
          </p>
          <p>
            <strong>5. Applications recommandées :</strong> Google
            Authenticator, Authy, 1Password, ou Microsoft Authenticator.
          </p>
        </div>
      </Card>
    </div>
  );
}
