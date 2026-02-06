'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNutritionistList } from '@/components/admin/AdminNutritionistList';
import { AdminNutritionistDetail } from '@/components/admin/AdminNutritionistDetail';
import {
  AdminValidationModal,
  type ValidationAction,
} from '@/components/admin/AdminValidationModal';
import type { AdminNutritionistProfile } from '@/types/admin';
import { formatNutritionistName } from '@/types/admin';

/**
 * Page admin de gestion des nutritionnistes
 * Permet de voir, filtrer et valider les demandes d'inscription
 */
export default function NutritionistsClient() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // État
  const [nutritionists, setNutritionists] = useState<
    AdminNutritionistProfile[]
  >([]);
  const [selectedNutritionist, setSelectedNutritionist] =
    useState<AdminNutritionistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de validation
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationAction, setValidationAction] =
    useState<ValidationAction>('approve');
  const [isValidating, setIsValidating] = useState(false);

  // Charger les nutritionnistes
  const fetchNutritionists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/nutritionists', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des nutritionnistes');
      }

      const data = await response.json();
      setNutritionists(data.data?.nutritionists || []);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les données au montage
  useEffect(() => {
    if (isAuthenticated) {
      fetchNutritionists();
    }
  }, [isAuthenticated, fetchNutritionists]);

  // Gérer la sélection d'un nutritionniste
  const handleSelectNutritionist = (nutritionist: AdminNutritionistProfile) => {
    setSelectedNutritionist(nutritionist);
  };

  // Retour à la liste
  const handleBack = () => {
    setSelectedNutritionist(null);
  };

  // Ouvrir le modal de validation
  const handleOpenValidation = (action: ValidationAction) => {
    setValidationAction(action);
    setShowValidationModal(true);
  };

  // Confirmer la validation
  const handleConfirmValidation = async (
    action: ValidationAction,
    reason?: string
  ) => {
    if (!selectedNutritionist) return;

    setIsValidating(true);

    try {
      const response = await fetch(
        `/api/admin/nutritionists/${selectedNutritionist.id}/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ action, reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la validation');
      }

      // Rafraîchir les données
      await fetchNutritionists();

      // Fermer le détail si validé ou rejeté
      if (action !== 'request_info') {
        setSelectedNutritionist(null);
      } else {
        // Mettre à jour le nutritionniste sélectionné
        const updatedList = nutritionists.map(n => {
          if (n.id === selectedNutritionist.id) {
            return {
              ...n,
              status:
                action === 'approve'
                  ? 'active'
                  : action === 'reject'
                    ? 'rejected'
                    : 'info_required',
              infoRequestMessage:
                action === 'request_info' ? reason : n.infoRequestMessage,
            } as AdminNutritionistProfile;
          }
          return n;
        });
        const updated = updatedList.find(n => n.id === selectedNutritionist.id);
        if (updated) {
          setSelectedNutritionist(updated);
        }
      }

      setShowValidationModal(false);
    } catch (err: any) {
      console.error('Erreur validation:', err);
      throw err;
    } finally {
      setIsValidating(false);
    }
  };

  // Vérifier l'authentification
  if (authLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B998B]' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Accès refusé
          </h1>
          <p className='text-gray-600 mb-4'>
            Vous devez être connecté en tant qu'administrateur.
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className='px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#178275] transition-colors'
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <ArrowLeft className='w-5 h-5' />
              </button>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-[#1B998B]/10 rounded-xl flex items-center justify-center'>
                  <Users className='w-5 h-5 text-[#1B998B]' />
                </div>
                <div>
                  <h1 className='text-lg font-bold text-gray-900'>
                    Gestion des nutritionnistes
                  </h1>
                  <p className='text-sm text-gray-500'>
                    Validez et gérez les demandes d'inscription
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={fetchNutritionists}
              disabled={isLoading}
              className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50'
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Actualiser
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700'
          >
            {error}
          </motion.div>
        )}

        {selectedNutritionist ? (
          <AdminNutritionistDetail
            nutritionist={selectedNutritionist}
            onBack={handleBack}
            onValidate={() => handleOpenValidation('approve')}
            onReject={() => handleOpenValidation('reject')}
            onRequestInfo={() => handleOpenValidation('request_info')}
            isLoading={isValidating}
          />
        ) : (
          <AdminNutritionistList
            nutritionists={nutritionists}
            isLoading={isLoading}
            onSelectNutritionist={handleSelectNutritionist}
          />
        )}
      </main>

      {/* Modal de validation */}
      {selectedNutritionist && (
        <AdminValidationModal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          onConfirm={handleConfirmValidation}
          action={validationAction}
          nutritionistName={formatNutritionistName(selectedNutritionist)}
          isLoading={isValidating}
        />
      )}
    </div>
  );
}
