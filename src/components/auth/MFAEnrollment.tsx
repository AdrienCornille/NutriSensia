'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface MFAEnrollmentProps {
  onEnrolled: () => void;
  onCancelled: () => void;
  userRole?: string;
}

/**
 * Composant d'enrôlement pour l'authentification à deux facteurs (2FA)
 * Permet aux utilisateurs de configurer TOTP avec leur application d'authentification
 */
export function MFAEnrollment({
  onEnrolled,
  onCancelled,
  userRole,
}: MFAEnrollmentProps) {
  // États pour gérer le processus d'enrôlement
  const [factorId, setFactorId] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>(''); // Code QR SVG
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<'enrolling' | 'verifying'>('enrolling');
  const [enrollmentData, setEnrollmentData] = useState<any>(null);

  // Initialiser l'enrôlement au montage du composant
  useEffect(() => {
    initializeEnrollment();
  }, []);

  /**
   * Nettoie les facteurs MFA existants
   */
  const cleanupExistingFactors = async () => {
    try {
      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.warn(
          'Erreur lors de la récupération des facteurs:',
          factorsError
        );
        return;
      }

      const allFactors = [
        ...(factorsData.totp || []),
        ...(factorsData.phone || []),
      ];

      // Supprimer tous les facteurs existants
      for (const factor of allFactors) {
        try {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
          console.log('Facteur supprimé:', factor.id);
        } catch (deleteError) {
          console.warn(
            'Erreur lors de la suppression du facteur:',
            deleteError
          );
        }
      }
    } catch (err) {
      console.warn('Erreur lors du nettoyage des facteurs:', err);
    }
  };

  /**
   * Initialise le processus d'enrôlement 2FA
   * Génère le QR code et le secret pour l'application d'authentification
   */
  const initializeEnrollment = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Vérifier d'abord la session utilisateur
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error(
          'Session utilisateur invalide. Veuillez vous reconnecter.'
        );
      }

      let { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Authenticator-${Date.now()}`,
      });

      // Si erreur de nom déjà existant, nettoyer et réessayer
      if (error && error.message && error.message.includes('friendly name')) {
        await cleanupExistingFactors();

        // Deuxième tentative après nettoyage
        const result = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: `Authenticator-${Date.now()}`,
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        throw error;
      }

      // Stockage des données d'enrôlement
      setFactorId(data.id);
      setQrCode(data.totp.qr_code); // Code QR au format SVG
      setEnrollmentData(data); // Stocker toutes les données
      setStep('verifying');
    } catch (err: any) {
      console.error("Erreur lors de l'enrôlement MFA:", err);

      setError(err.message || "Erreur lors de l'initialisation de la 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Vérifie le code TOTP fourni par l'utilisateur
   * Complète le processus d'enrôlement si le code est correct
   */
  const verifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Créer un défi pour la vérification
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        throw challenge.error;
      }

      const challengeId = challenge.data.id;

      // Vérifier le code TOTP
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verificationCode.trim(),
      });

      if (verify.error) {
        throw verify.error;
      }

      // Enrôlement réussi
      onEnrolled();
    } catch (err: any) {
      setError(err.message || 'Code incorrect. Veuillez réessayer.');
      setVerificationCode('');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode();
  };

  // Affichage pendant le chargement initial
  if (isLoading && step === 'enrolling') {
    return (
      <Card className='p-6 max-w-md mx-auto'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Initialisation de la 2FA...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6 max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          Configuration de l'authentification à deux facteurs
        </h2>
        <p className='text-gray-600'>
          {userRole === 'nutritionist'
            ? 'La 2FA est obligatoire pour les nutritionnistes'
            : 'Améliorez la sécurité de votre compte'}
        </p>
      </div>

      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      <div className='space-y-6'>
        {/* Étape 1: Affichage du QR Code */}
        <div className='text-center'>
          <h3 className='text-lg font-semibold mb-4'>
            Étape 1: Scannez le QR code
          </h3>
          <div className='bg-white p-4 rounded-lg border'>
            {isLoading && !qrCode && (
              <div className='flex items-center justify-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                <span className='ml-3 text-gray-600'>
                  Génération du QR code...
                </span>
              </div>
            )}
            {qrCode ? (
              <div className='flex flex-col items-center space-y-4'>
                {/* Méthode 1: Affichage direct du Data URL */}
                <img
                  src={qrCode}
                  alt="QR Code pour l'authentification 2FA"
                  className='max-w-48'
                  style={{
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                  onError={e => {
                    console.error('Erreur lors du chargement du QR code:', e);
                    e.currentTarget.style.display = 'none';
                    // Afficher le fallback
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />

                {/* Méthode 2: Fallback avec extraction du SVG */}
                <div
                  className='max-w-48 hidden'
                  dangerouslySetInnerHTML={{
                    __html: qrCode.startsWith('data:image/svg+xml')
                      ? qrCode.replace(/^data:image\/svg\+xml[^,]*,\s*/, '')
                      : qrCode,
                  }}
                  style={{
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                />

                {/* Méthode 3: Affichage du code secret comme fallback */}
                <div className='mt-4 p-3 bg-gray-50 rounded border'>
                  <p className='text-sm text-gray-600 mb-2'>
                    Code secret (si le QR code ne fonctionne pas) :
                  </p>
                  <code className='text-xs break-all bg-white p-2 rounded border'>
                    {enrollmentData?.totp?.secret || 'Non disponible'}
                  </code>
                </div>
              </div>
            ) : (
              <div className='text-center py-8'>
                <div className='text-gray-500'>Aucun QR code disponible</div>
                <div className='text-xs text-gray-400 mt-2'>État: {step}</div>
              </div>
            )}
          </div>
          <p className='text-sm text-gray-600 mt-3'>
            Utilisez une application comme Google Authenticator, Authy ou
            1Password
          </p>
        </div>

        {/* Étape 2: Vérification du code */}
        <div>
          <h3 className='text-lg font-semibold mb-4'>
            Étape 2: Vérifiez le code
          </h3>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='verificationCode'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Code de vérification (6 chiffres)
              </label>
              <Input
                id='verificationCode'
                type='text'
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder='000000'
                maxLength={6}
                pattern='[0-9]{6}'
                className='text-center text-lg tracking-widest'
                disabled={isLoading}
                autoComplete='one-time-code'
              />
            </div>

            <div className='flex space-x-3'>
              <Button
                type='submit'
                onClick={verifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className='flex-1'
              >
                {isLoading ? 'Vérification...' : 'Activer la 2FA'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={onCancelled}
                disabled={isLoading}
                className='flex-1'
              >
                Annuler
              </Button>
            </div>

            {/* Boutons de réinitialisation si erreur */}
            {error && (
              <div className='mt-4 space-y-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={initializeEnrollment}
                  disabled={isLoading}
                  className='w-full'
                >
                  {isLoading ? 'Réinitialisation...' : "Réessayer l'enrôlement"}
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      setError('');
                      await supabase.auth.refreshSession();
                      await initializeEnrollment();
                    } catch (err: any) {
                      setError(
                        'Erreur lors du rafraîchissement: ' + err.message
                      );
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className='w-full'
                >
                  Rafraîchir la session et réessayer
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Instructions supplémentaires */}
        <div className='bg-blue-50 p-4 rounded-md'>
          <h4 className='font-medium text-blue-900 mb-2'>
            Instructions importantes :
          </h4>
          <ul className='text-sm text-blue-800 space-y-1'>
            <li>
              • Scannez le QR code avec votre application d'authentification
            </li>
            <li>• Entrez le code à 6 chiffres généré par l'application</li>
            <li>• Gardez votre appareil d'authentification en sécurité</li>
            <li>• Configurez un appareil de sauvegarde si possible</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
