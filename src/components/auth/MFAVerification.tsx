'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface MFAVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onVerified?: () => void;
  onCancelled?: () => void;
  userEmail?: string;
}

/**
 * Composant de vérification pour l'authentification à deux facteurs (2FA)
 * Utilisé lors de la connexion pour vérifier le code TOTP
 */
export function MFAVerification({
  onSuccess,
  onCancel,
  onVerified,
  onCancelled,
  userEmail,
}: MFAVerificationProps) {
  // Utiliser les nouveaux callbacks ou les anciens pour la compatibilité
  const handleSuccess = onSuccess || onVerified;
  const handleCancel = onCancel || onCancelled;
  // États pour gérer la vérification
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [factorId, setFactorId] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Initialiser la vérification au montage du composant
  useEffect(() => {
    initializeVerification();
  }, []);

  // Vérifier si l'utilisateur est verrouillé après trop de tentatives
  useEffect(() => {
    if (attempts >= 5) {
      setIsLocked(true);
      const timer = setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
      }, 300000); // 5 minutes de verrouillage

      return () => clearTimeout(timer);
    }
  }, [attempts]);

  /**
   * Initialise le processus de vérification 2FA
   * Récupère les facteurs MFA et crée un défi
   */
  const initializeVerification = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Récupérer les facteurs MFA disponibles
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) {
        throw factors.error;
      }

      const totpFactor = factors.data.totp[0];
      if (!totpFactor) {
        throw new Error(
          'Aucun facteur TOTP trouvé. Veuillez configurer la 2FA.'
        );
      }

      setFactorId(totpFactor.id);

      // Créer un défi pour la vérification
      const challenge = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });
      if (challenge.error) {
        throw challenge.error;
      }

      setChallengeId(challenge.data.id);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors de l'initialisation de la vérification 2FA"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Vérifie le code TOTP fourni par l'utilisateur
   */
  const verifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      return;
    }

    if (isLocked) {
      setError('Trop de tentatives. Veuillez attendre 5 minutes.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Vérifier le code TOTP
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verificationCode.trim(),
      });

      if (verify.error) {
        throw verify.error;
      }

      // Vérification réussie
      setAttempts(0);
      handleSuccess?.();
    } catch (err: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 5) {
        setError(
          'Trop de tentatives incorrectes. Compte verrouillé pendant 5 minutes.'
        );
      } else {
        setError(`Code incorrect. Tentatives restantes : ${5 - newAttempts}`);
      }

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

  /**
   * Gère la saisie automatique du code (6 chiffres)
   */
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);

    // Vérification automatique quand 6 chiffres sont saisis
    if (value.length === 6 && !isLoading && !isLocked) {
      setTimeout(() => verifyCode(), 500); // Petit délai pour l'UX
    }
  };

  /**
   * Régénère un nouveau défi
   */
  const regenerateChallenge = async () => {
    setIsLoading(true);
    setError('');

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        throw challenge.error;
      }

      setChallengeId(challenge.data.id);
      setVerificationCode('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la régénération du défi');
    } finally {
      setIsLoading(false);
    }
  };

  // Affichage pendant le chargement initial
  if (isLoading && !factorId) {
    return (
      <Card className='p-6 max-w-md mx-auto'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Préparation de la vérification 2FA...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6 max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          Vérification requise
        </h2>
        <p className='text-gray-600'>
          Entrez le code de votre application d'authentification
        </p>
        {userEmail && (
          <p className='text-sm text-gray-500 mt-1'>
            Connecté en tant que {userEmail}
          </p>
        )}
      </div>

      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      {isLocked && (
        <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
          <p className='text-yellow-700 text-sm'>
            Compte temporairement verrouillé. Veuillez attendre 5 minutes.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
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
            onChange={handleCodeChange}
            placeholder='000000'
            maxLength={6}
            pattern='[0-9]{6}'
            className='text-center text-2xl tracking-widest font-mono'
            disabled={isLoading || isLocked}
            autoComplete='one-time-code'
            autoFocus
          />
          <p className='text-xs text-gray-500 mt-1'>
            Le code sera vérifié automatiquement
          </p>
        </div>

        <div className='flex space-x-3'>
          <Button
            type='submit'
            onClick={verifyCode}
            disabled={isLoading || isLocked || verificationCode.length !== 6}
            className='flex-1'
          >
            {isLoading ? 'Vérification...' : 'Vérifier'}
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={regenerateChallenge}
            disabled={isLoading || isLocked}
            className='flex-1'
          >
            Nouveau code
          </Button>
        </div>

        <div className='text-center'>
          <Button
            type='button'
            variant='ghost'
            onClick={handleCancel}
            disabled={isLoading}
            className='text-sm text-gray-500 hover:text-gray-700'
          >
            Se déconnecter
          </Button>
        </div>
      </form>

      {/* Instructions d'aide */}
      <div className='mt-6 bg-gray-50 p-4 rounded-md'>
        <h4 className='font-medium text-gray-900 mb-2'>Besoin d'aide ?</h4>
        <ul className='text-sm text-gray-600 space-y-1'>
          <li>• Vérifiez que l'heure de votre appareil est synchronisée</li>
          <li>
            • Assurez-vous d'utiliser la bonne application d'authentification
          </li>
          <li>• Le code change toutes les 30 secondes</li>
          <li>• Contactez le support si vous avez perdu votre appareil</li>
        </ul>
      </div>
    </Card>
  );
}
