'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { QRCodeComponent } from '@/components/ui/QRCode';
import { MFACleanupUtil } from '@/utils/mfa-cleanup';

interface MFAEnrollmentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onEnrolled?: () => void;
  onCancelled?: () => void;
  userRole?: string;
}

/**
 * Composant d'enrôlement pour l'authentification à deux facteurs (2FA)
 * Utilisé pour configurer TOTP lors de la première utilisation
 */
export function MFAEnrollment({
  onSuccess,
  onCancel,
  onEnrolled,
  onCancelled,
  userRole,
}: MFAEnrollmentProps) {
  // Utiliser les nouveaux callbacks ou les anciens pour la compatibilité
  const handleSuccess = onSuccess || onEnrolled;
  const handleCancel = onCancel || onCancelled;

  // États pour gérer l'enrôlement
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCodeUri, setQrCodeUri] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Initialiser l'enrôlement au montage du composant
  useEffect(() => {
    initializeEnrollment();
  }, []);

  /**
   * Initialise le processus d'enrôlement 2FA
   * Crée un nouveau facteur TOTP et génère le QR code
   */
  const initializeEnrollment = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Vérifier d'abord la session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Erreur de session: ' + sessionError.message);
      }
      
      if (!session) {
        throw new Error('Utilisateur non connecté. Veuillez vous connecter d\'abord.');
      }

      console.log('🔐 Initialisation de l\'enrôlement MFA pour:', session.user.email);

      // Vérifier le niveau d'assurance actuel
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (aalError) {
        console.warn('⚠️ Erreur lors de la vérification AAL:', aalError);
      } else {
        console.log('🔍 Niveau d\'assurance actuel:', aalData);
      }

      // NETTOYAGE PRÉVENTIF DÉSACTIVÉ TEMPORAIREMENT
      // Le nettoyage préventif cause des problèmes de timing avec Supabase
      console.log('⚠️ Nettoyage préventif désactivé temporairement pour éviter les problèmes de timing');
      setCleanupResult('Nettoyage préventif désactivé temporairement');
      
      // TODO: Réactiver le nettoyage préventif une fois le problème de timing résolu
      /*
      try {
        const preCleanupResult = await MFACleanupUtil.cleanupUnverifiedFactors(true);
        if (preCleanupResult.cleaned > 0) {
          console.log(`🧹 Nettoyage préventif: ${preCleanupResult.cleaned} facteurs supprimés`);
          setCleanupResult(`Nettoyage préventif: ${preCleanupResult.cleaned} facteurs supprimés`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (preCleanupError) {
        console.warn('⚠️ Erreur lors du nettoyage préventif:', preCleanupError);
        // Ne pas faire échouer l'enrôlement pour une erreur de nettoyage
      }
      */

      // Vérifier s'il y a déjà des facteurs MFA
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        console.warn('⚠️ Erreur lors de la liste des facteurs:', factorsError);
      } else {
        console.log('📋 Facteurs existants:', factorsData);
        
        // Analyser TOUS les facteurs (pas seulement totp/phone)
        const allFactors = factorsData.all || [];
        const verifiedTotpFactors = factorsData.totp?.filter(f => f.status === 'verified') || [];
        const verifiedPhoneFactors = factorsData.phone?.filter(f => f.status === 'verified') || [];
        const hasVerifiedFactors = verifiedTotpFactors.length > 0 || verifiedPhoneFactors.length > 0;
        
        console.log('🔍 Analyse des facteurs vérifiés:', {
          allFactorsCount: allFactors.length,
          totpFactors: factorsData.totp?.map(f => ({ id: f.id, status: f.status, friendly_name: f.friendly_name })),
          phoneFactors: factorsData.phone?.map(f => ({ id: f.id, status: f.status, friendly_name: f.friendly_name })),
          allFactorsDetails: allFactors.map(f => ({ id: f.id, status: f.status, friendly_name: f.friendly_name, factor_type: f.factor_type })),
          verifiedTotpCount: verifiedTotpFactors.length,
          verifiedPhoneCount: verifiedPhoneFactors.length,
          hasVerifiedFactors
        });
        
        // Détecter les facteurs fantômes MAIS seulement s'ils sont anciens
        const totpPhoneCount = (factorsData.totp?.length || 0) + (factorsData.phone?.length || 0);
        const hasGhostFactors = allFactors.length > totpPhoneCount;
        
        if (hasGhostFactors) {
          const ghostFactors = allFactors.filter(f => 
            !factorsData.totp?.some(t => t.id === f.id) && 
            !factorsData.phone?.some(p => p.id === f.id)
          );
          
          // Vérifier si ces facteurs sont anciens (plus de 5 minutes)
          const oldGhostFactors = ghostFactors.filter(f => {
            const createdAt = new Date(f.created_at);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            return createdAt < fiveMinutesAgo;
          });
          
          console.warn('👻 Facteurs fantômes détectés:', {
            allFactorsCount: allFactors.length,
            totpPhoneCount,
            totalGhostFactors: ghostFactors.length,
            oldGhostFactors: oldGhostFactors.length,
            ghostFactorsDetails: ghostFactors.map(f => ({
              id: f.id,
              factor_type: f.factor_type,
              created_at: f.created_at,
              age_minutes: Math.round((Date.now() - new Date(f.created_at).getTime()) / 60000)
            }))
          });
          
          // CORRECTION : Nettoyer TOUS les facteurs fantômes pour éviter l'erreur "already exists"
          // Même les récents car ils empêchent la création de nouveaux facteurs
          console.log('🧹 Nettoyage forcé de TOUS les facteurs fantômes (pour éviter "already exists")...');
          // Protéger le facteur actuel s'il existe déjà
          const cleanupResult = await MFACleanupUtil.cleanupUnverifiedFactors(true, factorId);
          console.log('🧹 Nettoyage forcé effectué:', cleanupResult);
          setCleanupResult(`Nettoyage des facteurs fantômes: ${cleanupResult.cleaned} facteurs supprimés.`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        if (hasVerifiedFactors) {
          console.error('❌ Facteurs vérifiés détectés:', {
            verifiedTotp: verifiedTotpFactors,
            verifiedPhone: verifiedPhoneFactors
          });
          
          // Vérification supplémentaire : si c'est un compte récent, il pourrait y avoir des données résiduelles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('created_at, two_factor_enabled')
            .eq('id', session.user.id)
            .single();
            
          const isRecentAccount = profileData && !profileError && profileData.created_at && 
            (Date.now() - new Date(profileData.created_at).getTime()) < 24 * 60 * 60 * 1000; // 24h
            
          const twoFactorDisabledInDB = !profileData?.two_factor_enabled;
          
          console.log('🔍 Analyse compte récent:', {
            isRecentAccount,
            twoFactorDisabledInDB,
            hasProfileData: !!profileData,
            profileError: profileError?.message,
            createdAt: profileData?.created_at,
            twoFactorEnabled: profileData?.two_factor_enabled
          });
          
          if (isRecentAccount && twoFactorDisabledInDB) {
            console.warn('⚠️ Compte récent avec facteurs vérifiés suspects - Nettoyage forcé');
            
            // Nettoyage forcé pour les comptes récents
            const cleanupResult = await MFACleanupUtil.cleanupUnverifiedFactors(true, factorId);
            console.log('🧹 Nettoyage forcé effectué:', cleanupResult);
            
            // Attendre que le nettoyage soit effectif
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Continuer avec l'enrôlement
          } else {
            throw new Error('Vous avez déjà configuré l\'authentification à deux facteurs. Utilisez la page de gestion MFA pour modifier vos paramètres.');
          }
        }

        // Nettoyer les facteurs non vérifiés existants
        const factorsCount = await MFACleanupUtil.getFactorsCount();
        console.log('📊 État des facteurs MFA:', factorsCount);

        if (factorsCount.unverified > 0) {
          console.log('🧹 Nettoyage automatique des facteurs non vérifiés (sauf facteurs récents)...');
          
          // Nettoyage plus conservateur - ne supprime que les anciens facteurs
          const cleanupResult = await MFACleanupUtil.cleanupUnverifiedFactors(false);
          
          if (cleanupResult.errors.length > 0) {
            console.warn('⚠️ Erreurs lors du nettoyage:', cleanupResult.errors);
          }
          
          console.log(`✨ Nettoyage terminé: ${cleanupResult.cleaned} facteurs supprimés`);
          
          // Attendre un peu pour que les suppressions soient effectives
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      // Créer un nouveau facteur TOTP avec un nom unique
      const timestamp = Date.now();
      const baseName = userRole === 'nutritionist' ? 'NutriSensia Pro' : 'NutriSensia';
      const uniqueName = `${baseName} ${timestamp}`;
      
      console.log('🏷️ Création facteur avec nom unique:', uniqueName);
      
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: uniqueName,
      });

      if (enrollError) {
        console.error('❌ Erreur d\'enrôlement:', enrollError);
        console.error('📋 Détails de l\'erreur:', {
          message: enrollError.message,
          status: enrollError.status,
          name: enrollError.name
        });
        
        // Gestion spéciale des erreurs courantes
        if (enrollError.message?.includes('AAL2 required')) {
          throw new Error(
            'Configuration requise : Votre compte doit être configuré pour permettre l\'enrôlement MFA. ' +
            'Contactez l\'administrateur ou consultez la documentation pour résoudre ce problème.'
          );
        }
        
        if (enrollError.message?.includes('already exists') || 
            enrollError.message?.includes('friendly name') && enrollError.message?.includes('exists')) {
          console.warn('⚠️ Facteur avec le même nom détecté - nettoyage automatique...');
          
          // Nettoyage automatique des facteurs avec le même nom
          try {
            const cleanupResult = await MFACleanupUtil.cleanupUnverifiedFactors(true);
            console.log('🧹 Nettoyage automatique "already exists":', cleanupResult);
            setCleanupResult(`Nettoyage automatique: ${cleanupResult.cleaned} facteurs supprimés`);
            
            // Attendre un peu puis réessayer automatiquement
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Relancer l'enrôlement après nettoyage (avec protection contre boucle infinie)
            if (retryCount < 2) {
              console.log('🔄 Nouvel essai après nettoyage... (tentative', retryCount + 1, '/3)');
              setRetryCount(prev => prev + 1);
              return await initializeEnrollment();
            } else {
              console.error('❌ Trop de tentatives de nettoyage - arrêt pour éviter boucle infinie');
              throw new Error(
                'Impossible de créer le facteur MFA après plusieurs tentatives de nettoyage. ' +
                'Veuillez utiliser le bouton "Nettoyer les facteurs fantômes" manuellement.'
              );
            }
          } catch (cleanupError) {
            console.error('❌ Erreur lors du nettoyage automatique:', cleanupError);
            throw new Error(
              'Un facteur d\'authentification existe déjà. Un nettoyage automatique a échoué. ' +
              'Veuillez utiliser le bouton "Nettoyer les facteurs fantômes".'
            );
          }
        }
        
        if (enrollError.message?.includes('Unexpected failure')) {
          console.warn('⚠️ Erreur inattendue détectée - mais PAS de nettoyage automatique pour éviter de supprimer le facteur en cours');
          
          // NE PAS nettoyer automatiquement car cela supprime le facteur que l'utilisateur configure
          // L'utilisateur peut utiliser le bouton de nettoyage manuel si nécessaire
          
          throw new Error(
            'Erreur de configuration détectée. Cette erreur est souvent temporaire. ' +
            'Veuillez cliquer sur "Réessayer" pour continuer. Si le problème persiste, ' +
            'utilisez le bouton "Nettoyer les facteurs fantômes".'
          );
        }
        
        throw enrollError;
      }

      if (data && data.totp) {
        console.log('🔐 Données MFA reçues:', {
          factorId: data.id,
          hasQrCode: !!data.totp.qr_code,
          hasSecret: !!data.totp.secret,
          qrCodeLength: data.totp.qr_code?.length,
          qrCodeType: data.totp.qr_code?.startsWith('data:') ? 'SVG Data URI' : 'TOTP URI'
        });
        
        // Vérifier si on a reçu un SVG au lieu d'une URI TOTP
        let totpUri = data.totp.qr_code;
        
        if (data.totp.qr_code?.startsWith('data:image/svg')) {
          console.warn('⚠️ Supabase a renvoyé un SVG au lieu d\'une URI TOTP, génération manuelle...');
          
          // Générer manuellement l'URI TOTP à partir du secret
          const { data: { user } } = await supabase.auth.getUser();
          const userEmail = user?.email || 'utilisateur@nutrisensia.com';
          // Utiliser le nom de base pour l'URI TOTP (sans timestamp)
          const serviceName = baseName;
          
          totpUri = `otpauth://totp/${encodeURIComponent(serviceName)}:${encodeURIComponent(userEmail)}?secret=${data.totp.secret}&issuer=${encodeURIComponent(serviceName)}`;
          
          console.log('🔧 URI TOTP générée manuellement:', {
            userEmail,
            serviceName,
            secretLength: data.totp.secret?.length,
            uriLength: totpUri.length
          });
        }
        
        setQrCodeUri(totpUri);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        console.log('✅ QR Code URI défini, longueur:', totpUri?.length);
      } else {
        console.log('❌ Aucune donnée MFA ou TOTP reçue:', data);
        throw new Error('Aucune donnée TOTP reçue du serveur');
      }
    } catch (error: any) {
      console.error('❌ Erreur complète lors de l\'enrôlement:', error);
      setError(error.message || 'Erreur lors de l\'initialisation MFA');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Vérifie le code d'authentification et finalise l'enrôlement
   * Suit le flux correct Supabase: challenge -> verify
   * Gestion améliorée des erreurs "Factor not found"
   */
  const verifyAndFinalize = async () => {
    if (verificationCode.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('🔐 Début de la vérification pour factorId:', factorId);
      
      // Attendre un peu pour laisser le temps à Supabase de synchroniser les facteurs
      console.log('⏳ Attente de synchronisation Supabase...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifier que le facteur existe encore avant de continuer
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        console.error('❌ Erreur lors de la vérification des facteurs:', factorsError);
        throw new Error('Impossible de vérifier les facteurs MFA. Veuillez réessayer.');
      }

      // CORRECTION: Chercher d'abord dans totp, puis dans all si pas trouvé
      let factorExists = factorsData.totp?.some(factor => factor.id === factorId);
      
      // Si pas trouvé dans totp, chercher dans all (problème de synchronisation Supabase)
      if (!factorExists && factorsData.all) {
        factorExists = factorsData.all.some(factor => factor.id === factorId);
        if (factorExists) {
          console.warn('⚠️ Facteur trouvé dans "all" mais pas dans "totp" - problème de synchronisation Supabase');
        }
      }
      
      if (!factorExists) {
        console.error('❌ Facteur non trouvé:', factorId);
        console.log('📋 Facteurs disponibles:', factorsData.totp?.map(f => ({ id: f.id, status: f.status, friendly_name: f.friendly_name })));
        
        // Diagnostic plus détaillé pour comprendre pourquoi le facteur a disparu
        console.log('🔍 Diagnostic détaillé:', {
          factorIdSearched: factorId,
          allFactorsCount: factorsData.all?.length || 0,
          totpFactorsCount: factorsData.totp?.length || 0,
          phoneFactorsCount: factorsData.phone?.length || 0,
          allFactorsDetails: factorsData.all?.map(f => ({ 
            id: f.id, 
            status: f.status, 
            factor_type: f.factor_type,
            created_at: f.created_at,
            matches_searched_id: f.id === factorId
          })),
          totpFactorsDetails: factorsData.totp?.map(f => ({ 
            id: f.id, 
            status: f.status, 
            factor_type: f.factor_type,
            created_at: f.created_at,
            matches_searched_id: f.id === factorId
          })),
          factorInAll: factorsData.all?.some(f => f.id === factorId),
          factorInTotp: factorsData.totp?.some(f => f.id === factorId)
        });
        
        // NE PAS NETTOYER - Cela supprime le facteur que l'utilisateur essaie de vérifier
        console.log('⚠️ Facteur non trouvé - Le facteur a probablement été supprimé par un nettoyage automatique');
        console.log('💡 L\'utilisateur doit recommencer la configuration 2FA depuis le début');
        
        throw new Error(
          'Le facteur MFA a disparu. Ceci peut être dû à un nettoyage automatique. ' +
          'Veuillez recommencer la configuration depuis le début.'
        );
      }

      console.log('✅ Facteur vérifié, création du challenge...');

      // Étape 1: Créer un challenge pour le facteur
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        console.error('❌ Erreur de challenge:', challengeError);
        
        // Gestion spécifique de l'erreur "Factor not found"
        if (challengeError.message?.includes('Factor not found') || 
            challengeError.message?.includes('factor not found')) {
          throw new Error('Facteur MFA non trouvé. Veuillez recommencer la configuration 2FA.');
        }
        
        throw challengeError;
      }

      if (!challengeData?.id) {
        throw new Error('Aucun ID de challenge reçu');
      }

      console.log('✅ Challenge créé:', challengeData.id);

      // Étape 2: Vérifier le code TOTP avec le challenge
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (verifyError) {
        console.error('❌ Erreur de vérification:', verifyError);
        
        // Gestion spécifique de l'erreur "Factor not found"
        if (verifyError.message?.includes('Factor not found') || 
            verifyError.message?.includes('factor not found')) {
          throw new Error('Facteur MFA non trouvé. Veuillez recommencer la configuration 2FA.');
        }
        
        throw verifyError;
      }

      console.log('✅ Vérification réussie:', verifyData);

      // Mettre à jour le statut 2FA dans la base de données
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: true } as any)
        .eq('id', verifyData.user.id);

      if (updateError) {
        console.warn('⚠️ Erreur mise à jour profil:', updateError);
      }

      // Enrôlement réussi
      if (handleSuccess) {
        handleSuccess();
      }
    } catch (error: any) {
      console.error('❌ Erreur complète de vérification:', error);
      
      // Gestion améliorée des erreurs
      let errorMessage = 'Code incorrect. Veuillez réessayer.';
      
      if (error.message?.includes('Factor not found') || 
          error.message?.includes('factor not found')) {
        errorMessage = 'Facteur MFA non trouvé. Veuillez recommencer la configuration 2FA.';
      } else if (error.message?.includes('Invalid code') || 
                 error.message?.includes('invalid code')) {
        errorMessage = 'Code incorrect. Vérifiez votre application d\'authentification.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gère les changements du code de vérification
   */
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setError('');

    // Vérification automatique si 6 chiffres
    if (value.length === 6) {
      setTimeout(() => verifyAndFinalize(), 500);
    }
  };

  /**
   * Gère l'annulation de l'enrôlement
   */
  const handleCancelEnrollment = () => {
    if (handleCancel) {
      handleCancel();
    }
  };

  if (isLoading && !qrCodeUri) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation de la sécurité...</p>
        </div>
      </Card>
    );
  }

  // Afficher les erreurs d'initialisation
  if (error && !qrCodeUri) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur d'initialisation</h2>
          <p className="text-red-600 mb-4">{error}</p>
          
          {cleanupResult && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
              <p className="text-sm text-blue-600">{cleanupResult}</p>
            </div>
          )}
          
          <div className="space-y-3">
            {error.includes('already exists') && (
              <Button
                onClick={async () => {
                  setIsLoading(true);
                  setError('');
                  try {
                    console.log('🧹 Nettoyage d\'urgence des facteurs MFA...');
                    const result = await MFACleanupUtil.cleanupUnverifiedFactors(true);
                    console.log('🧹 Résultat nettoyage d\'urgence:', result);
                    setCleanupResult(`Nettoyage d'urgence: ${result.cleaned} facteurs supprimés`);
                    // Attendre un peu puis réessayer
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await initializeEnrollment();
                  } catch (cleanupError) {
                    console.error('❌ Erreur nettoyage d\'urgence:', cleanupError);
                    setError('Erreur lors du nettoyage. Veuillez contacter le support.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                variant="destructive"
                disabled={isLoading}
                className="w-full"
              >
                🧹 Nettoyer les facteurs fantômes
              </Button>
            )}
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={initializeEnrollment}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Réessai...' : 'Réessayer'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancelEnrollment}
                className="flex-1"
                disabled={isLoading}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      {step === 'setup' && (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Configuration de l'authentification
            </h2>
            <p className="text-gray-600">
              Scannez ce code QR avec votre application d'authentification
            </p>
          </div>

          {qrCodeUri && (
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-white rounded-lg border shadow-sm">
                {/* QR Code principal */}
                <QRCodeComponent value={qrCodeUri} size={200} />
                
                {/* Info de debug (masquée en production) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                    <p>Type: {qrCodeUri.startsWith('otpauth://') ? 'TOTP URI' : 'Autre'}</p>
                    <p>Longueur: {qrCodeUri.length} caractères</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Applications recommandées :
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Google Authenticator</li>
              <li>• Microsoft Authenticator</li>
              <li>• Authy</li>
              <li>• 1Password</li>
            </ul>
          </div>

          {secret && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                Clé secrète (si vous ne pouvez pas scanner) :
              </h4>
              <code className="text-sm font-mono break-all text-gray-700">
                {secret}
              </code>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="primary"
              onClick={() => setStep('verify')}
              className="flex-1"
              disabled={!qrCodeUri}
            >
              Continuer
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancelEnrollment}
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Vérification
            </h2>
            <p className="text-gray-600">
              Entrez le code à 6 chiffres de votre application
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); verifyAndFinalize(); }} className="space-y-6">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification (6 chiffres)
              </label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={handleCodeChange}
                maxLength={6}
                pattern="[0-9]{6}"
                autoComplete="one-time-code"
                autoFocus
                className="text-center text-2xl tracking-widest font-mono"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Le code sera vérifié automatiquement
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 mb-3">{error}</p>
                {error.includes('already exists') && (
                  <Button
                    onClick={async () => {
                      setIsLoading(true);
                      setError('');
                      try {
                        console.log('🧹 Nettoyage d\'urgence des facteurs MFA...');
                        const result = await MFACleanupUtil.cleanupUnverifiedFactors(true);
                        console.log('🧹 Résultat nettoyage d\'urgence:', result);
                        setCleanupResult(`Nettoyage d'urgence: ${result.cleaned} facteurs supprimés`);
                        // Attendre un peu puis réessayer
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await initializeEnrollment();
                      } catch (cleanupError) {
                        console.error('❌ Erreur nettoyage d\'urgence:', cleanupError);
                        setError('Erreur lors du nettoyage. Veuillez contacter le support.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    variant="secondary"
                    disabled={isLoading}
                    className="text-sm"
                  >
                    🧹 Nettoyer et réessayer
                  </Button>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="submit"
                variant="primary"
                disabled={verificationCode.length !== 6 || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Vérification...' : 'Vérifier'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep('setup')}
                className="flex-1"
                disabled={isLoading}
              >
                Retour
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={handleCancelEnrollment}
              className="text-sm text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              Annuler la configuration
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
