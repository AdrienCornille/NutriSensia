'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * Composant pour nettoyer les facteurs MFA existants
 * Résout le problème "A factor with the friendly name "" for this user already exists"
 */
export function MFACleanup() {
  const [isLoading, setIsLoading] = useState(false);
  const [factors, setFactors] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFactors = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (factorsError) {
        setError(
          `Erreur lors du chargement des facteurs: ${factorsError.message}`
        );
        return;
      }

      const allFactors = [
        ...(data.totp || []).map(f => ({ ...f, type: 'TOTP' })),
        ...(data.sms || []).map(f => ({ ...f, type: 'SMS' })),
      ];

      setFactors(allFactors);

      if (allFactors.length === 0) {
        setMessage(
          'Aucun facteur MFA trouvé. Vous pouvez configurer un nouveau facteur.'
        );
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFactor = async (factorId: string) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: deleteError } = await supabase.auth.mfa.unenroll({
        factorId: factorId,
      });

      if (deleteError) {
        setError(`Erreur lors de la suppression: ${deleteError.message}`);
        return;
      }

      setMessage('Facteur supprimé avec succès !');
      loadFactors(); // Recharger la liste
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllFactors = async () => {
    if (
      !confirm('Êtes-vous sûr de vouloir supprimer tous les facteurs MFA ?')
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      let deletedCount = 0;

      for (const factor of factors) {
        const { error: deleteError } = await supabase.auth.mfa.unenroll({
          factorId: factor.id,
        });

        if (!deleteError) {
          deletedCount++;
        }
      }

      setMessage(`${deletedCount} facteur(s) supprimé(s) avec succès !`);
      loadFactors(); // Recharger la liste
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='p-6'>
      <div className='mb-6'>
        <h3 className='text-xl font-semibold mb-2'>
          🧹 Nettoyage des facteurs MFA
        </h3>
        <p className='text-sm text-gray-600'>
          Supprimez les facteurs MFA existants pour résoudre les problèmes de
          configuration
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
          <p className='text-green-800 text-sm'>{message}</p>
        </div>
      )}

      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-red-800 text-sm'>{error}</p>
        </div>
      )}

      {/* Boutons d'action */}
      <div className='flex gap-2 mb-4'>
        <Button onClick={loadFactors} disabled={isLoading} variant='outline'>
          🔍 Charger les facteurs
        </Button>

        {factors.length > 0 && (
          <Button
            onClick={deleteAllFactors}
            disabled={isLoading}
            variant='outline'
            className='text-red-600 hover:text-red-700'
          >
            🗑️ Supprimer tout
          </Button>
        )}
      </div>

      {/* Liste des facteurs */}
      {isLoading && (
        <div className='text-center py-4'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2'></div>
          <p className='text-gray-600 text-sm'>Chargement...</p>
        </div>
      )}

      {factors.length > 0 && (
        <div className='space-y-3'>
          <h4 className='font-medium'>Facteurs trouvés ({factors.length})</h4>

          {factors.map(factor => (
            <div
              key={factor.id}
              className='border rounded-lg p-3 flex justify-between items-center'
            >
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>
                    {factor.type === 'TOTP' ? '📱' : '📞'} {factor.type}
                  </span>
                  <span className='text-xs text-gray-500'>
                    ID: {factor.id.substring(0, 8)}...
                  </span>
                </div>
                <div className='text-xs text-gray-600 mt-1'>
                  <span>Nom: "{factor.friendly_name || '(vide)'}"</span>
                  <span className='mx-2'>•</span>
                  <span>Statut: {factor.status}</span>
                  <span className='mx-2'>•</span>
                  <span>
                    Créé:{' '}
                    {new Date(factor.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => deleteFactor(factor.id)}
                disabled={isLoading}
                size='sm'
                variant='outline'
                className='text-red-600 hover:text-red-700'
              >
                Supprimer
              </Button>
            </div>
          ))}
        </div>
      )}

      {factors.length === 0 && !isLoading && (
        <div className='text-center py-4 text-gray-500'>
          <p>Aucun facteur MFA trouvé</p>
          <p className='text-sm mt-1'>
            Cliquez sur "Charger les facteurs" pour vérifier
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
        <h4 className='font-medium text-blue-900 mb-2'>💡 Instructions</h4>
        <div className='text-sm text-blue-800 space-y-1'>
          <p>• Ce composant vous aide à nettoyer les facteurs MFA existants</p>
          <p>
            • Utile si vous obtenez l'erreur "A factor with the friendly name
            already exists"
          </p>
          <p>
            • Après nettoyage, vous pourrez configurer un nouveau facteur MFA
          </p>
        </div>
      </div>
    </Card>
  );
}
