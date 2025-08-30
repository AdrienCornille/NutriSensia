'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface MFAManagementProps {
  onFactorRemoved?: () => void;
  onEnrollNew?: () => void;
}

interface MFAFactor {
  id: string;
  type: 'totp' | 'phone';
  status: 'verified' | 'unverified';
  friendly_name?: string;
  created_at: string;
}

/**
 * Composant de gestion des facteurs d'authentification à deux facteurs
 * Permet de lister, afficher et supprimer les facteurs MFA
 */
export function MFAManagement({
  onFactorRemoved,
  onEnrollNew,
}: MFAManagementProps) {
  // États pour gérer les facteurs MFA
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deletingFactorId, setDeletingFactorId] = useState<string>('');

  // Charger les facteurs au montage du composant
  useEffect(() => {
    loadFactors();
  }, []);

  /**
   * Charge la liste des facteurs MFA de l'utilisateur
   */
  const loadFactors = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        throw error;
      }

      // Combiner les facteurs TOTP et téléphone
      const allFactors: MFAFactor[] = [
        ...(data.totp || []).map(factor => ({
          ...factor,
          type: 'totp' as const,
        })),
        ...(data.phone || []).map(factor => ({
          ...factor,
          type: 'phone' as const,
        })),
      ];

      setFactors(allFactors);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des facteurs MFA');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Supprime un facteur MFA
   */
  const removeFactor = async (factorId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce facteur d'authentification ?"
      )
    ) {
      return;
    }

    setDeletingFactorId(factorId);
    setError('');

    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) {
        throw error;
      }

      // Rafraîchir la liste des facteurs
      await loadFactors();

      // Callback pour informer le parent
      if (onFactorRemoved) {
        onFactorRemoved();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du facteur');
    } finally {
      setDeletingFactorId('');
    }
  };

  /**
   * Formate la date de création
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Obtient le nom d'affichage du type de facteur
   */
  const getFactorTypeName = (type: string) => {
    switch (type) {
      case 'totp':
        return "Application d'authentification (TOTP)";
      case 'phone':
        return 'Téléphone (SMS)';
      default:
        return type;
    }
  };

  /**
   * Obtient l'icône pour le type de facteur
   */
  const getFactorIcon = (type: string) => {
    switch (type) {
      case 'totp':
        return '📱';
      case 'phone':
        return '📞';
      default:
        return '🔐';
    }
  };

  /**
   * Obtient la couleur du statut
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50';
      case 'unverified':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  /**
   * Obtient le texte du statut
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Vérifié';
      case 'unverified':
        return 'Non vérifié';
      default:
        return status;
    }
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <Card className='p-6'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>
            Chargement des facteurs d'authentification...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-bold text-gray-900'>
          Facteurs d'authentification à deux facteurs
        </h2>
        {onEnrollNew && (
          <Button onClick={onEnrollNew} size='sm'>
            Ajouter un facteur
          </Button>
        )}
      </div>

      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      {factors.length === 0 ? (
        <div className='text-center py-8'>
          <div className='text-4xl mb-4'>🔐</div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Aucun facteur d'authentification configuré
          </h3>
          <p className='text-gray-600 mb-4'>
            Configurez l'authentification à deux facteurs pour sécuriser votre
            compte.
          </p>
          {onEnrollNew && (
            <Button onClick={onEnrollNew}>Configurer la 2FA</Button>
          )}
        </div>
      ) : (
        <div className='space-y-4'>
          {factors.map(factor => (
            <div
              key={factor.id}
              className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
            >
              <div className='flex items-center space-x-3'>
                <div className='text-2xl'>{getFactorIcon(factor.type)}</div>
                <div>
                  <h4 className='font-medium text-gray-900'>
                    {factor.friendly_name || getFactorTypeName(factor.type)}
                  </h4>
                  <p className='text-sm text-gray-500'>
                    Configuré le {formatDate(factor.created_at)}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(factor.status)}`}
                  >
                    {getStatusText(factor.status)}
                  </span>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                {factor.status === 'unverified' && (
                  <span className='text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded'>
                    En attente de vérification
                  </span>
                )}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => removeFactor(factor.id)}
                  disabled={deletingFactorId === factor.id}
                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                >
                  {deletingFactorId === factor.id
                    ? 'Suppression...'
                    : 'Supprimer'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informations de sécurité */}
      <div className='mt-6 bg-blue-50 p-4 rounded-md'>
        <h4 className='font-medium text-blue-900 mb-2'>
          Conseils de sécurité :
        </h4>
        <ul className='text-sm text-blue-800 space-y-1'>
          <li>• Gardez au moins un facteur d'authentification configuré</li>
          <li>
            • Utilisez des applications d'authentification fiables (Google
            Authenticator, Authy)
          </li>
          <li>• Configurez un appareil de sauvegarde si possible</li>
          <li>• Ne partagez jamais vos codes d'authentification</li>
        </ul>
      </div>
    </Card>
  );
}
