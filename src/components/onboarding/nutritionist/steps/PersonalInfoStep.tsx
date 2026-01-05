/**
 * Étape des informations personnelles pour l'onboarding des nutritionnistes
 * Collecte les informations de base du professionnel
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Phone, Globe } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { basePersonalInfoSchema } from '@/lib/onboarding-schemas';
import {
  NutritionistOnboardingData,
  AVAILABLE_LANGUAGES,
} from '@/types/onboarding';
import { z } from 'zod';

interface PersonalInfoStepProps {
  /** Données actuelles */
  data: Partial<NutritionistOnboardingData>;
  /** Callback de mise à jour des données */
  onDataChange: (data: Partial<NutritionistOnboardingData>) => void;
  /** Callback pour passer à l'étape suivante */
  onNext: (stepData?: Partial<NutritionistOnboardingData>) => void;
  /** Callback pour revenir à l'étape précédente */
  onPrevious: () => void;
  /** État de soumission */
  isSubmitting?: boolean;
  /** ID de l'utilisateur pour l'upload d'avatar */
  userId: string;
}

type PersonalInfoFormData = z.infer<typeof basePersonalInfoSchema>;

/**
 * Étape des informations personnelles
 */
export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
  userId,
}) => {
  // Configuration du formulaire avec validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(basePersonalInfoSchema),
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      locale: data.locale || 'fr-CH',
    },
    mode: 'onChange',
  });

  // Surveiller les changements pour la sauvegarde automatique
  const watchedFields = watch();

  useEffect(() => {
    if (isDirty) {
      // Mettre à jour les données localement seulement (pas de sauvegarde automatique)
      onDataChange({
        ...data,
        ...watchedFields,
      });
    }
  }, [watchedFields, isDirty, data, onDataChange]);

  /**
   * Soumettre le formulaire et passer à l'étape suivante
   */
  const onSubmit = (formData: PersonalInfoFormData) => {
    const updatedData = {
      ...data,
      ...formData,
    };
    console.log(`🚀 [PersonalInfoStep] Soumission avec données:`, formData);

    // Mettre à jour les données localement
    onDataChange(updatedData);

    // Passer à l'étape suivante avec les données
    onNext(updatedData);
  };

  /**
   * Formatage du numéro de téléphone
   */
  const formatPhoneNumber = (value: string) => {
    // Supprimer tous les caractères non numériques sauf le +
    const cleaned = value.replace(/[^\d+]/g, '');

    // Formater pour la Suisse
    if (cleaned.startsWith('+41')) {
      const number = cleaned.slice(3);
      if (number.length <= 9) {
        return `+41 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5, 7)} ${number.slice(7, 9)}`.trim();
      }
    } else if (cleaned.startsWith('0')) {
      const number = cleaned.slice(1);
      if (number.length <= 9) {
        return `0${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5, 7)} ${number.slice(7, 9)}`.trim();
      }
    }

    return value;
  };

  return (
    <div className='space-y-6'>
      {/* Formulaire */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Titre de l'étape */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-3'>
            Informations personnelles
          </h1>
          <p className='text-gray-600 text-lg'>
            Vos coordonnées et informations de contact
          </p>
        </div>

        {/* Upload d'avatar */}
        <div className='flex justify-center mb-8'>
          <AvatarUpload
            currentAvatarUrl={data.avatar_url}
            onAvatarChange={avatarUrl => {
              onDataChange({
                ...data,
                avatar_url: avatarUrl,
              });
            }}
            userId={userId}
            size={120}
            disabled={isSubmitting}
          />
        </div>
        {/* Nom et Prénom */}
        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Prénom *
            </label>
            <Input
              {...register('firstName')}
              type='text'
              placeholder='Votre prénom'
              className={errors.firstName ? 'border-red-300' : ''}
            />
            {errors.firstName && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Nom de famille *
            </label>
            <Input
              {...register('lastName')}
              type='text'
              placeholder='Votre nom de famille'
              className={errors.lastName ? 'border-red-300' : ''}
            />
            {errors.lastName && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Téléphone */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            <Phone className='inline h-4 w-4 mr-1' />
            Numéro de téléphone
          </label>
          <Input
            {...register('phone')}
            type='tel'
            placeholder='+41 21 123 45 67 ou 021 123 45 67'
            onChange={e => {
              const formatted = formatPhoneNumber(e.target.value);
              setValue('phone', formatted, { shouldValidate: true });
            }}
            className={errors.phone ? 'border-red-300' : ''}
          />
          {errors.phone && (
            <p className='mt-1 text-sm text-red-600'>{errors.phone.message}</p>
          )}
          <p className='mt-1 text-sm text-gray-500'>
            Numéro utilisé pour les contacts professionnels et urgences
          </p>
        </div>

        {/* Langue préférée */}
        <div>
          <label className='block text-label font-medium text-neutral-dark dark:text-neutral-light mb-8dp'>
            <Globe className='inline h-4 w-4 mr-4dp' />
            Langue préférée
          </label>
          <select
            {...register('locale')}
            className='w-full px-12dp py-8dp border border-neutral-border dark:border-neutral-border rounded-8dp shadow-sm bg-background-primary dark:bg-background-secondary text-neutral-dark dark:text-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
          >
            {AVAILABLE_LANGUAGES.map(lang => (
              <option key={lang.value} value={`${lang.value}-CH`}>
                {lang.label}
              </option>
            ))}
          </select>
          <p className='mt-4dp text-body-small text-neutral-medium dark:text-neutral-medium'>
            Langue d'affichage de l'interface
          </p>
        </div>

        {/* Boutons de navigation */}
        <div className='flex justify-between pt-6'>
          <Button
            type='button'
            variant='secondary'
            onClick={onPrevious}
            disabled={isSubmitting}
          >
            Retour
          </Button>

          <Button
            type='submit'
            disabled={!isValid || isSubmitting}
            className='flex items-center space-x-2'
          >
            <span>{isSubmitting ? 'Enregistrement...' : 'Continuer'}</span>
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default PersonalInfoStep;
