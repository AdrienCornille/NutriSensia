'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  profileUpdateSchema,
  type ProfileUpdate,
  type NutritionistProfile,
  type PatientProfile,
} from '@/lib/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CommonProfileFields } from './CommonProfileFields';
import { NutritionistProfileFields } from './NutritionistProfileFields';
import { PatientProfileFields } from './PatientProfileFields';
import { FormActions } from './FormActions';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

interface AuthenticatedProfileFormProps {
  onSave?: (data: ProfileUpdate) => Promise<void>;
  onCancel?: () => void;
  redirectAfterSave?: string;
}

export function AuthenticatedProfileForm({
  onSave,
  onCancel,
  redirectAfterSave,
}: AuthenticatedProfileFormProps) {
  const router = useRouter();
  const { user, getUserRole } = useAuth();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    updateProfile,
  } = useUserProfile();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Déterminer le type d'utilisateur
  const userType = getUserRole() as 'nutritionist' | 'patient';

  const methods = useForm<ProfileUpdate>({
    resolver: zodResolver(profileUpdateSchema),
    mode: 'onChange',
  });

  const {
    watch,
    formState: { isDirty, isSubmitting, errors },
  } = methods;

  // Surveiller les changements pour détecter les modifications non sauvegardées
  const watchedValues = watch();

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty, watchedValues]);

  // Initialiser le formulaire avec les données du profil quand elles sont chargées
  useEffect(() => {
    if (profile && !profileLoading) {
      methods.reset(profile);
    }
  }, [profile, profileLoading, methods]);

  // Gérer la navigation avec des changements non sauvegardés
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSubmit = async (data: ProfileUpdate) => {
    setSaveError(null);

    try {
      // Appeler la fonction onSave personnalisée si fournie
      if (onSave) {
        await onSave(data);
      } else {
        // Utiliser la fonction de mise à jour par défaut
        const success = await updateProfile(data);
        if (!success) {
          throw new Error('Échec de la mise à jour du profil');
        }
      }

      setHasUnsavedChanges(false);

      // Rediriger si spécifié
      if (redirectAfterSave) {
        router.push(redirectAfterSave);
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      setSaveError(error.message || 'Erreur lors de la sauvegarde du profil');
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      onCancel?.();
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
    setHasUnsavedChanges(false);
    methods.reset(profile);
    onCancel?.();
  };

  const handleDiscardChanges = () => {
    setShowConfirmDialog(false);
    setHasUnsavedChanges(false);
    methods.reset(profile);
  };

  // Affichage du chargement
  if (profileLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <LoadingSpinner size='lg' />
        <span className='ml-3 text-gray-600'>Chargement du profil...</span>
      </div>
    );
  }

  // Affichage des erreurs
  if (profileError) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <Alert variant='error' title='Erreur de chargement'>
          <p>{profileError}</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-2 text-sm text-red-600 hover:text-red-800 underline'
          >
            Recharger la page
          </button>
        </Alert>
      </div>
    );
  }

  // Vérifier que l'utilisateur a un rôle valide
  if (!userType || !['nutritionist', 'patient'].includes(userType)) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <Alert variant='error' title='Rôle utilisateur invalide'>
          <p>
            Votre compte n'a pas de rôle valide. Veuillez contacter
            l'administrateur.
          </p>
        </Alert>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className='max-w-4xl mx-auto p-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='bg-white rounded-lg shadow-lg p-8'
        >
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Édition du profil
            </h1>
            <p className='text-gray-600'>
              {userType === 'nutritionist'
                ? 'Modifiez vos informations professionnelles et personnelles'
                : 'Modifiez vos informations personnelles et médicales'}
            </p>
            {user && (
              <p className='text-sm text-gray-500 mt-1'>
                Connecté en tant que : {user.email}
              </p>
            )}
          </div>

          {/* Affichage des erreurs de sauvegarde */}
          {saveError && (
            <Alert
              variant='error'
              title='Erreur de sauvegarde'
              className='mb-6'
            >
              <p>{saveError}</p>
            </Alert>
          )}

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(handleSubmit)}
              className='space-y-8'
            >
              {/* Champs communs */}
              <CommonProfileFields />

              {/* Champs spécifiques au type d'utilisateur */}
              {userType === 'nutritionist' ? (
                <NutritionistProfileFields />
              ) : (
                <PatientProfileFields />
              )}

              {/* Actions du formulaire */}
              <FormActions
                isSubmitting={isSubmitting}
                hasUnsavedChanges={hasUnsavedChanges}
                onCancel={handleCancel}
                showConfirmDialog={showConfirmDialog}
                onConfirmCancel={handleConfirmCancel}
                onDiscardChanges={handleDiscardChanges}
              />
            </form>
          </FormProvider>

          {/* Affichage des erreurs globales */}
          {errors.root && (
            <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-600'>
                {errors.root.message as string}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AuthGuard>
  );
}
