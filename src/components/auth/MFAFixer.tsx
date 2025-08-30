'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * Composant spécial pour résoudre le problème "A factor with the friendly name already exists"
 * Utilise des méthodes avancées pour nettoyer les facteurs corrompus
 */
export function MFAFixer() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<
    'idle' | 'analyzing' | 'cleaning' | 'testing' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${log}`]);
  };

  const fixMFA = async () => {
    setIsLoading(true);
    setError(null);
    setMessage('');
    setLogs([]);
    setStep('analyzing');

    try {
      addLog("🔍 Début de l'analyse du problème MFA...");

      // Étape 1: Analyser l'état actuel
      setStep('analyzing');
      setMessage("Analyse de l'état MFA...");

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        throw new Error('Aucune session active. Veuillez vous connecter.');
      }

      addLog(`✅ Session active pour: ${sessionData.session.user.email}`);

      // Étape 2: Lister les facteurs existants
      addLog('📋 Récupération des facteurs MFA existants...');

      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (factorsError) {
        addLog(`❌ Erreur lors de la récupération: ${factorsError.message}`);
      } else {
        const totpFactors = factorsData.totp || [];
        const smsFactors = factorsData.sms || [];

        addLog(`📱 Facteurs TOTP trouvés: ${totpFactors.length}`);
        addLog(`📞 Facteurs SMS trouvés: ${smsFactors.length}`);

        // Afficher les détails des facteurs
        totpFactors.forEach((factor, index) => {
          addLog(
            `   TOTP ${index + 1}: ID=${factor.id.substring(0, 8)}..., Nom="${factor.friendly_name || '(vide)'}", Statut=${factor.status}`
          );
        });

        smsFactors.forEach((factor, index) => {
          addLog(
            `   SMS ${index + 1}: ID=${factor.id.substring(0, 8)}..., Nom="${factor.friendly_name || '(vide)'}", Statut=${factor.status}`
          );
        });
      }

      // Étape 3: Tester l'enrôlement pour confirmer le problème
      addLog("🧪 Test d'enrôlement pour confirmer le problème...");

      try {
        const { data: enrollData, error: enrollError } =
          await supabase.auth.mfa.enroll({
            factorType: 'totp',
          });

        if (enrollError) {
          addLog(`❌ Erreur d'enrôlement confirmée: ${enrollError.message}`);

          if (enrollError.message.includes('friendly name')) {
            addLog('🎯 Problème identifié: Facteur avec nom vide détecté');
          }
        } else {
          addLog('✅ Enrôlement réussi - Aucun problème détecté');
          setStep('success');
          setMessage('Aucun problème détecté. La 2FA fonctionne correctement.');
          return;
        }
      } catch (err: any) {
        addLog(`❌ Erreur lors du test d'enrôlement: ${err.message}`);
      }

      // Étape 4: Nettoyer les facteurs existants
      setStep('cleaning');
      setMessage('Nettoyage des facteurs MFA...');
      addLog('🧹 Début du nettoyage des facteurs...');

      if (factorsData) {
        const allFactors = [
          ...(factorsData.totp || []).map(f => ({ ...f, type: 'TOTP' })),
          ...(factorsData.sms || []).map(f => ({ ...f, type: 'SMS' })),
        ];

        let deletedCount = 0;

        for (const factor of allFactors) {
          try {
            addLog(
              `🗑️  Suppression du facteur ${factor.type}: ${factor.id.substring(0, 8)}...`
            );

            const { error: deleteError } = await supabase.auth.mfa.unenroll({
              factorId: factor.id,
            });

            if (deleteError) {
              addLog(
                `❌ Erreur lors de la suppression: ${deleteError.message}`
              );
            } else {
              addLog(`✅ Facteur supprimé avec succès`);
              deletedCount++;
            }
          } catch (err: any) {
            addLog(`❌ Erreur lors de la suppression: ${err.message}`);
          }
        }

        addLog(
          `📊 Résumé: ${deletedCount}/${allFactors.length} facteurs supprimés`
        );
      }

      // Étape 5: Tester l'enrôlement après nettoyage
      setStep('testing');
      setMessage("Test de l'enrôlement après nettoyage...");
      addLog("🧪 Test de l'enrôlement après nettoyage...");

      // Attendre un peu pour que les changements se propagent
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const { data: retryEnrollData, error: retryEnrollError } =
          await supabase.auth.mfa.enroll({
            factorType: 'totp',
          });

        if (retryEnrollError) {
          addLog(`❌ Erreur persistante: ${retryEnrollError.message}`);

          // Essayer une méthode alternative
          addLog('🔄 Tentative de méthode alternative...');

          // Se déconnecter et se reconnecter
          await supabase.auth.signOut();
          addLog('🔓 Déconnexion effectuée');

          await new Promise(resolve => setTimeout(resolve, 3000));

          setStep('error');
          setMessage(
            'Problème résolu partiellement. Veuillez vous reconnecter et réessayer.'
          );
          addLog(
            '📋 Veuillez vous reconnecter sur http://localhost:3002/mfa-test'
          );
        } else {
          addLog('✅ Enrôlement réussi après nettoyage !');
          setStep('success');
          setMessage(
            'Problème résolu ! Vous pouvez maintenant configurer votre 2FA.'
          );
        }
      } catch (err: any) {
        addLog(`❌ Erreur lors du test final: ${err.message}`);
        setStep('error');
        setMessage('Erreur lors du test final. Veuillez réessayer.');
      }
    } catch (err: any) {
      addLog(`❌ Erreur générale: ${err.message}`);
      setStep('error');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'analyzing':
        return '🔍';
      case 'cleaning':
        return '🧹';
      case 'testing':
        return '🧪';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '🚀';
    }
  };

  const getStepColor = () => {
    switch (step) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'idle':
        return 'text-gray-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <Card className='p-6'>
      <div className='mb-6'>
        <h3 className='text-xl font-semibold mb-2'>🔧 Correcteur MFA Avancé</h3>
        <p className='text-sm text-gray-600'>
          Résout automatiquement le problème "A factor with the friendly name
          already exists"
        </p>
      </div>

      {/* État actuel */}
      <div className='mb-4 p-3 bg-blue-50 rounded-lg'>
        <div className='flex items-center gap-2'>
          <span className='text-lg'>{getStepIcon()}</span>
          <span className={`font-medium ${getStepColor()}`}>
            {step === 'idle' && 'Prêt à corriger'}
            {step === 'analyzing' && 'Analyse en cours...'}
            {step === 'cleaning' && 'Nettoyage en cours...'}
            {step === 'testing' && 'Test en cours...'}
            {step === 'success' && 'Problème résolu !'}
            {step === 'error' && 'Erreur détectée'}
          </span>
        </div>
        {message && <p className='text-sm text-gray-700 mt-1'>{message}</p>}
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-red-800 text-sm'>{error}</p>
        </div>
      )}

      {/* Bouton d'action */}
      <div className='mb-4'>
        <Button onClick={fixMFA} disabled={isLoading} className='w-full'>
          {isLoading ? 'Correction en cours...' : '🔧 Corriger le problème MFA'}
        </Button>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className='border rounded-lg p-3 bg-gray-50'>
          <h4 className='font-medium mb-2'>📋 Logs de correction</h4>
          <div className='space-y-1 text-xs font-mono max-h-40 overflow-y-auto'>
            {logs.map((log, index) => (
              <div key={index} className='text-gray-700'>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className='mt-6 p-4 bg-yellow-50 rounded-lg'>
        <h4 className='font-medium text-yellow-900 mb-2'>⚠️ Attention</h4>
        <div className='text-sm text-yellow-800 space-y-1'>
          <p>• Ce correcteur supprime TOUS les facteurs MFA existants</p>
          <p>• Vous devrez reconfigurer votre 2FA après correction</p>
          <p>• Assurez-vous d'avoir accès à votre compte avant de commencer</p>
        </div>
      </div>
    </Card>
  );
}
