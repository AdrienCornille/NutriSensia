'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  profileUpdateSchema,
  type ProfileUpdate,
  type NutritionistProfile,
  type PatientProfile,
} from '@/lib/schemas';
import { CommonProfileFields } from './CommonProfileFields';
import { NutritionistProfileFields } from './NutritionistProfileFields';
import { PatientProfileFields } from './PatientProfileFields';
import { FormActions } from './FormActions';

// Mock du store pour éviter les erreurs d'authentification
const useAppStore = () => ({
  setLoading: () => {},
  loading: false,
});

interface ProfileEditFormProps {
  userType: 'nutritionist' | 'patient';
  initialData?: Partial<NutritionistProfile | PatientProfile>;
  onSave?: (data: ProfileUpdate) => Promise<void>;
  onCancel?: () => void;
}

export function ProfileEditForm({
  userType,
  initialData = {},
  onSave,
  onCancel,
}: ProfileEditFormProps) {
  const { setLoading } = useAppStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const methods = useForm<ProfileUpdate>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: initialData,
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
    setLoading(true);
    try {
      if (onSave) {
        await onSave(data);
      }
      setHasUnsavedChanges(false);
      // Réinitialiser le formulaire avec les nouvelles valeurs
      methods.reset(data);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    } finally {
      setLoading(false);
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
    methods.reset(initialData);
    onCancel?.();
  };

  const handleDiscardChanges = () => {
    setShowConfirmDialog(false);
    setHasUnsavedChanges(false);
    methods.reset(initialData);
  };

  return (
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
        </div>

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
  );
}
