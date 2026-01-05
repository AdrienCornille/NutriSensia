'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MFACleanupUtil } from '@/utils/mfa-cleanup';
import {
  runMFARedirectionTests,
  showMFAChanges,
} from '@/utils/test-mfa-redirection';

interface MFAFactor {
  id: string;
  factor_type: string;
  friendly_name: string;
  status: 'unverified' | 'verified';
  created_at?: string;
  updated_at?: string;
}

interface MFAFactorsData {
  totp?: MFAFactor[];
  phone?: MFAFactor[];
}

export const MFADiagnosticAdvanced: React.FC = () => {
  const [factorsData, setFactorsData] = useState<MFAFactorsData | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [aalData, setAalData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string>('');

  const loadDiagnosticData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Chargement des données de diagnostic MFA...');

      // 1. Session
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      setSessionData({ session: session?.session, error: sessionError });

      if (!session?.session?.user) {
        console.warn('⚠️ Aucune session utilisateur');
        return;
      }

      // 2. Facteurs MFA
      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      setFactorsData(factors);
      if (factorsError) {
        console.error('❌ Erreur facteurs:', factorsError);
      }

      // 3. Profil DB
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.session.user.id)
        .single();
      setProfileData({ profile, error: profileError });

      // 4. AAL
      const { data: aal, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      setAalData({ aal, error: aalError });

      console.log('✅ Données de diagnostic chargées');
    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const forceCleanup = async () => {
    setIsLoading(true);
    setCleanupResult('');
    try {
      console.log('🧹 Nettoyage forcé de TOUS les facteurs MFA...');

      const result = await MFACleanupUtil.cleanupUnverifiedFactors(true); // Force mode

      setCleanupResult(
        `Nettoyage terminé: ${result.cleaned} facteurs supprimés. Erreurs: ${result.errors.length}`
      );

      // Recharger les données
      await loadDiagnosticData();
    } catch (error) {
      setCleanupResult(
        `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const runTests = () => {
    console.clear();
    showMFAChanges();
    runMFARedirectionTests();
    setCleanupResult(
      'Tests de redirection exécutés - Consultez la console (F12)'
    );
  };

  useEffect(() => {
    loadDiagnosticData();
  }, []);

  const allFactors = [
    ...(factorsData?.totp || []),
    ...(factorsData?.phone || []),
  ];

  const verifiedFactors = allFactors.filter(f => f.status === 'verified');
  const unverifiedFactors = allFactors.filter(f => f.status === 'unverified');

  return (
    <Card className='p-6 max-w-4xl mx-auto'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-semibold'>Diagnostic MFA Avancé</h3>
        <div className='space-x-2'>
          <Button
            onClick={loadDiagnosticData}
            disabled={isLoading}
            variant='secondary'
          >
            🔄 Actualiser
          </Button>
          <Button
            onClick={forceCleanup}
            disabled={isLoading}
            variant='destructive'
            className='text-white'
          >
            🧹 Nettoyage Forcé
          </Button>
          <Button onClick={runTests} disabled={isLoading} variant='primary'>
            🧪 Tests Redirection
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className='text-center py-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto'></div>
          <p className='mt-2'>Chargement...</p>
        </div>
      )}

      {cleanupResult && (
        <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded'>
          <p className='text-yellow-800'>{cleanupResult}</p>
        </div>
      )}

      <div className='space-y-4'>
        {/* Session */}
        <div>
          <h4 className='font-medium mb-2'>📱 Session</h4>
          <div className='bg-gray-50 p-3 rounded text-sm'>
            <p>
              <strong>Utilisateur:</strong>{' '}
              {sessionData?.session?.user?.email || 'Non connecté'}
            </p>
            <p>
              <strong>ID:</strong> {sessionData?.session?.user?.id || 'N/A'}
            </p>
            <p>
              <strong>Erreur:</strong> {sessionData?.error?.message || 'Aucune'}
            </p>
          </div>
        </div>

        {/* AAL */}
        <div>
          <h4 className='font-medium mb-2'>🔐 Niveau d'Assurance (AAL)</h4>
          <div className='bg-gray-50 p-3 rounded text-sm'>
            <p>
              <strong>Niveau actuel:</strong>{' '}
              {aalData?.aal?.current_level || 'N/A'}
            </p>
            <p>
              <strong>Niveau suivant:</strong>{' '}
              {aalData?.aal?.next_level || 'N/A'}
            </p>
            <p>
              <strong>Erreur:</strong> {aalData?.error?.message || 'Aucune'}
            </p>
          </div>
        </div>

        {/* Facteurs MFA */}
        <div>
          <h4 className='font-medium mb-2'>🔑 Facteurs MFA</h4>
          <div className='bg-gray-50 p-3 rounded text-sm space-y-2'>
            <p>
              <strong>Total:</strong> {allFactors.length}
            </p>
            <p>
              <strong>Vérifiés:</strong> {verifiedFactors.length}
            </p>
            <p>
              <strong>Non vérifiés:</strong> {unverifiedFactors.length}
            </p>

            {allFactors.length > 0 && (
              <div className='mt-3'>
                <p className='font-medium mb-2'>Détails des facteurs:</p>
                {allFactors.map((factor, index) => (
                  <div
                    key={factor.id}
                    className='ml-4 mb-2 p-2 bg-white rounded border'
                  >
                    <p>
                      <strong>#{index + 1}</strong>
                    </p>
                    <p>
                      <strong>ID:</strong> {factor.id}
                    </p>
                    <p>
                      <strong>Type:</strong> {factor.factor_type}
                    </p>
                    <p>
                      <strong>Nom:</strong> {factor.friendly_name}
                    </p>
                    <p>
                      <strong>Statut:</strong>
                      <span
                        className={`ml-1 px-2 py-1 rounded text-xs ${
                          factor.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {factor.status}
                      </span>
                    </p>
                    {factor.created_at && (
                      <p>
                        <strong>Créé:</strong>{' '}
                        {new Date(factor.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profil DB */}
        <div>
          <h4 className='font-medium mb-2'>💾 Profil Base de Données</h4>
          <div className='bg-gray-50 p-3 rounded text-sm'>
            <p>
              <strong>2FA Activé (DB):</strong>{' '}
              {profileData?.profile?.two_factor_enabled ? 'Oui' : 'Non'}
            </p>
            <p>
              <strong>Rôle:</strong> {profileData?.profile?.role || 'N/A'}
            </p>
            <p>
              <strong>Erreur:</strong> {profileData?.error?.message || 'Aucune'}
            </p>
          </div>
        </div>

        {/* Diagnostic */}
        <div>
          <h4 className='font-medium mb-2'>🎯 Diagnostic</h4>
          <div className='bg-blue-50 p-3 rounded text-sm'>
            {verifiedFactors.length > 0 && (
              <div className='mb-2 p-2 bg-red-100 border border-red-200 rounded'>
                <p className='text-red-800 font-medium'>⚠️ PROBLÈME DÉTECTÉ:</p>
                <p className='text-red-700'>
                  {verifiedFactors.length} facteur(s) "vérifiés" trouvé(s) pour
                  un nouveau compte. Cela peut être dû à des données résiduelles
                  ou un bug.
                </p>
              </div>
            )}

            {unverifiedFactors.length > 0 && (
              <div className='mb-2 p-2 bg-yellow-100 border border-yellow-200 rounded'>
                <p className='text-yellow-800'>
                  ℹ️ {unverifiedFactors.length} facteur(s) non vérifiés détectés
                  (normal si enrôlement en cours)
                </p>
              </div>
            )}

            {allFactors.length === 0 && (
              <div className='mb-2 p-2 bg-green-100 border border-green-200 rounded'>
                <p className='text-green-800'>
                  ✅ Aucun facteur MFA détecté (compte propre)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
