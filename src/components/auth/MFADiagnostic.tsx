'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * Composant de diagnostic pour vérifier l'état de la 2FA
 * Affiche des informations détaillées sur la configuration
 */
export function MFADiagnostic() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = {
        timestamp: new Date().toISOString(),
        supabaseConfig: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        },
        connection: null as any,
        mfaTest: null as any,
        session: null as any,
      };

      // Test de connexion
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        results.session = {
          hasSession: !!sessionData.session,
          error: sessionError?.message || null,
        };
      } catch (err: any) {
        results.session = {
          hasSession: false,
          error: err.message,
        };
      }

      // Test de l'API MFA
      try {
        const { data: mfaData, error: mfaError } =
          await supabase.auth.mfa.listFactors();
        results.mfaTest = {
          success: !mfaError,
          error: mfaError?.message || null,
          factors: mfaData?.totp?.length || 0,
        };
      } catch (err: any) {
        results.mfaTest = {
          success: false,
          error: err.message,
          factors: 0,
        };
      }

      // Test d'enrôlement MFA
      try {
        const { data: enrollData, error: enrollError } =
          await supabase.auth.mfa.enroll({
            factorType: 'totp',
          });
        results.connection = {
          success: !enrollError,
          error: enrollError?.message || null,
          hasQrCode: !!enrollData?.totp?.qr_code,
        };
      } catch (err: any) {
        results.connection = {
          success: false,
          error: err.message,
          hasQrCode: false,
        };
      }

      // Test de suppression forcée si l'enrôlement échoue
      if (
        !results.connection.success &&
        results.connection.error?.includes('friendly name')
      ) {
        try {
          console.log('🔧 Tentative de suppression forcée des facteurs...');

          // Essayer de supprimer tous les facteurs possibles
          const { data: factorsData, error: factorsError } =
            await supabase.auth.mfa.listFactors();

          if (!factorsError && factorsData) {
            const totpFactors = factorsData.totp || [];
            const smsFactors = factorsData.sms || [];

            for (const factor of [...totpFactors, ...smsFactors]) {
              try {
                await supabase.auth.mfa.unenroll({ factorId: factor.id });
                console.log(`✅ Facteur supprimé: ${factor.id}`);
              } catch (deleteErr) {
                console.log(`❌ Erreur suppression: ${deleteErr}`);
              }
            }

            // Réessayer l'enrôlement après nettoyage
            const { data: retryEnrollData, error: retryEnrollError } =
              await supabase.auth.mfa.enroll({
                factorType: 'totp',
              });

            if (!retryEnrollError) {
              results.connection = {
                success: true,
                error: null,
                hasQrCode: !!retryEnrollData?.totp?.qr_code,
              };
            }
          }
        } catch (cleanupErr: any) {
          console.log('❌ Erreur lors du nettoyage forcé:', cleanupErr.message);
        }
      }

      setDiagnosticData(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  if (isLoading) {
    return (
      <Card className='p-6'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Exécution du diagnostic...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='p-6'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>
            Erreur lors du diagnostic : {error}
          </p>
          <Button onClick={runDiagnostic}>Réessayer</Button>
        </div>
      </Card>
    );
  }

  if (!diagnosticData) {
    return (
      <Card className='p-6'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>
            Aucune donnée de diagnostic disponible
          </p>
          <Button onClick={runDiagnostic}>Lancer le diagnostic</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <div className='mb-6'>
        <h3 className='text-xl font-semibold mb-2'>🔍 Diagnostic 2FA</h3>
        <p className='text-sm text-gray-600'>
          Dernière vérification :{' '}
          {new Date(diagnosticData.timestamp).toLocaleString('fr-FR')}
        </p>
      </div>

      <div className='space-y-4'>
        {/* Configuration Supabase */}
        <div className='border rounded-lg p-4'>
          <h4 className='font-semibold mb-2'>📋 Configuration Supabase</h4>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>URL configurée :</span>
              <span
                className={getStatusColor(!!diagnosticData.supabaseConfig.url)}
              >
                {getStatusIcon(!!diagnosticData.supabaseConfig.url)}
                {diagnosticData.supabaseConfig.url ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Clé API configurée :</span>
              <span
                className={getStatusColor(diagnosticData.supabaseConfig.hasKey)}
              >
                {getStatusIcon(diagnosticData.supabaseConfig.hasKey)}
                {diagnosticData.supabaseConfig.hasKey ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Longueur de la clé :</span>
              <span>{diagnosticData.supabaseConfig.keyLength} caractères</span>
            </div>
          </div>
        </div>

        {/* Test de session */}
        <div className='border rounded-lg p-4'>
          <h4 className='font-semibold mb-2'>🔑 Test de session</h4>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Session active :</span>
              <span
                className={getStatusColor(diagnosticData.session.hasSession)}
              >
                {getStatusIcon(diagnosticData.session.hasSession)}
                {diagnosticData.session.hasSession ? 'Oui' : 'Non'}
              </span>
            </div>
            {diagnosticData.session.error && (
              <div className='text-red-600 text-xs'>
                Erreur : {diagnosticData.session.error}
              </div>
            )}
          </div>
        </div>

        {/* Test API MFA */}
        <div className='border rounded-lg p-4'>
          <h4 className='font-semibold mb-2'>🔐 Test API MFA</h4>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>API MFA accessible :</span>
              <span className={getStatusColor(diagnosticData.mfaTest.success)}>
                {getStatusIcon(diagnosticData.mfaTest.success)}
                {diagnosticData.mfaTest.success ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Facteurs configurés :</span>
              <span>{diagnosticData.mfaTest.factors}</span>
            </div>
            {diagnosticData.mfaTest.error && (
              <div className='text-red-600 text-xs'>
                Erreur : {diagnosticData.mfaTest.error}
              </div>
            )}
          </div>
        </div>

        {/* Test d'enrôlement */}
        <div className='border rounded-lg p-4'>
          <h4 className='font-semibold mb-2'>📱 Test d'enrôlement</h4>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Enrôlement possible :</span>
              <span
                className={getStatusColor(diagnosticData.connection.success)}
              >
                {getStatusIcon(diagnosticData.connection.success)}
                {diagnosticData.connection.success ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>QR Code généré :</span>
              <span
                className={getStatusColor(diagnosticData.connection.hasQrCode)}
              >
                {getStatusIcon(diagnosticData.connection.hasQrCode)}
                {diagnosticData.connection.hasQrCode ? 'Oui' : 'Non'}
              </span>
            </div>
            {diagnosticData.connection.error && (
              <div className='text-red-600 text-xs'>
                Erreur : {diagnosticData.connection.error}
              </div>
            )}
          </div>
        </div>

        {/* Recommandations */}
        <div className='border rounded-lg p-4 bg-blue-50'>
          <h4 className='font-semibold mb-2 text-blue-900'>
            💡 Recommandations
          </h4>
          <div className='space-y-2 text-sm text-blue-800'>
            {!diagnosticData.mfaTest.success && (
              <div>
                • <strong>2FA non activée :</strong> Activez la 2FA dans votre
                dashboard Supabase
              </div>
            )}
            {!diagnosticData.session.hasSession && (
              <div>
                • <strong>Session requise :</strong> Connectez-vous pour tester
                la 2FA
              </div>
            )}
            {diagnosticData.connection.error?.includes('MFA') && (
              <div>
                • <strong>Configuration manquante :</strong> Vérifiez les
                paramètres MFA dans Supabase
              </div>
            )}
            {diagnosticData.mfaTest.success &&
              diagnosticData.connection.success && (
                <div>
                  • <strong>Tout fonctionne !</strong> La 2FA est correctement
                  configurée
                </div>
              )}
          </div>
        </div>
      </div>

      <div className='mt-6 text-center'>
        <Button onClick={runDiagnostic} variant='outline'>
          🔄 Actualiser le diagnostic
        </Button>
      </div>
    </Card>
  );
}
