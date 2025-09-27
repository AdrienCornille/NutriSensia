'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * Composant de diagnostic simple pour comprendre le problème 2FA
 */
export function MFADiagnosticSimple() {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostic = async () => {
    setIsLoading(true);
    const diagnosticResults: any = {
      timestamp: new Date().toISOString(),
    };

    try {
      // 1. Vérifier la session actuelle
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      diagnosticResults.session = {
        data: sessionData,
        error: sessionError?.message,
        user: sessionData?.session?.user ? {
          id: sessionData.session.user.id,
          email: sessionData.session.user.email,
          role: sessionData.session.user.user_metadata?.role,
        } : null,
      };

      if (sessionData?.session?.user) {
        // 2. Vérifier le niveau d'assurance
        const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        diagnosticResults.assuranceLevel = {
          data: mfaData,
          error: mfaError?.message,
        };

        // 3. Lister les facteurs MFA
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        diagnosticResults.factors = {
          data: factorsData,
          error: factorsError?.message,
          hasVerifiedFactors: factorsData?.totp?.some(f => f.status === 'verified') || 
                             factorsData?.phone?.some(f => f.status === 'verified'),
        };

        // 4. Vérifier dans la base de données
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('two_factor_enabled, role')
          .eq('id', sessionData.session.user.id)
          .single();
        
        diagnosticResults.database = {
          data: profileData,
          error: profileError?.message,
        };

        // 5. Déterminer la redirection recommandée
        if (mfaData && !mfaError) {
          const { currentLevel, nextLevel } = mfaData;
          const hasVerifiedFactors = diagnosticResults.factors.hasVerifiedFactors;
          
          let recommendedRedirect = '/';
          let reason = 'Niveau d\'assurance suffisant';

          if (nextLevel === 'aal2' && currentLevel === 'aal1') {
            if (hasVerifiedFactors) {
              recommendedRedirect = '/auth/verify-mfa';
              reason = 'Facteurs configurés, besoin de vérification';
            } else {
              recommendedRedirect = '/auth/enroll-mfa';
              reason = 'Pas de facteurs configurés, besoin d\'enrôlement';
            }
          }

          diagnosticResults.recommendation = {
            redirect: recommendedRedirect,
            reason: reason,
          };
        }
      }

    } catch (error: any) {
      diagnosticResults.globalError = error.message;
    }

    setResults(diagnosticResults);
    setIsLoading(false);
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Diagnostic 2FA Simple
        </h2>
        <p className="text-gray-600">
          Diagnostic pour comprendre le problème de redirection 2FA
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <Button
          onClick={runDiagnostic}
          disabled={isLoading}
          variant="primary"
        >
          {isLoading ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
        </Button>
      </div>

      {results && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📊 Résultats du diagnostic</h3>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>

          {results.recommendation && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Recommandation</h4>
              <p><strong>Redirection :</strong> {results.recommendation.redirect}</p>
              <p><strong>Raison :</strong> {results.recommendation.reason}</p>
            </div>
          )}

          {results.globalError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">❌ Erreur</h4>
              <p>{results.globalError}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

