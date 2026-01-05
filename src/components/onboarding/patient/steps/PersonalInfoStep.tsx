/**
 * Étape des informations personnelles pour l'onboarding des patients
 * Collecte les données de base : nom, prénom, téléphone, préférences
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Phone, Globe, Clock } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { WizardTip } from '../../WizardLayout';
import { PatientOnboardingData } from '@/types/onboarding';
import { basePersonalInfoSchema } from '@/lib/onboarding-schemas';

interface PersonalInfoStepProps {
  /** Données actuelles */
  data: Partial<PatientOnboardingData>;
  /** Callback de mise à jour des données */
  onDataChange: (data: Partial<PatientOnboardingData>) => void;
  /** Callback pour passer à l'étape suivante */
  onNext: () => void;
  /** Callback pour revenir à l'étape précédente */
  onPrevious: () => void;
  /** État de soumission */
  isSubmitting?: boolean;
}

/**
 * Type pour les données du formulaire de cette étape
 */
type PersonalInfoFormData = {
  firstName: string;
  lastName: string;
  phone?: string;
  timezone?: string;
  locale?: string;
};

/**
 * Options de langue disponibles
 */
const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
];

/**
 * Options de fuseau horaire pour la Suisse
 */
const TIMEZONE_OPTIONS = [
  { value: 'Europe/Zurich', label: 'Suisse (UTC+1/+2)' },
  { value: 'Europe/Paris', label: 'France (UTC+1/+2)' },
  { value: 'Europe/Berlin', label: 'Allemagne (UTC+1/+2)' },
  { value: 'Europe/Rome', label: 'Italie (UTC+1/+2)' },
];

/**
 * Étape des informations personnelles
 */
export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
}) => {
  // Configuration du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(basePersonalInfoSchema),
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      timezone: data.timezone || 'Europe/Zurich',
      locale: data.locale || 'fr',
    },
    mode: 'onChange',
  });

  // Surveiller les changements pour mise à jour en temps réel
  const watchedValues = watch();

  // Pas de useEffect automatique pour éviter les boucles infinies
  // Les données seront mises à jour lors de la soumission

  /**
   * Gérer la soumission du formulaire
   */
  const onSubmit = (formData: PersonalInfoFormData) => {
    onDataChange({
      ...data,
      ...formData,
    });
    onNext();
  };

  return (
    <div className='space-y-6'>
      {/* En-tête */}
      <motion.div
        className='text-center space-y-2'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className='mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4'>
          <User className='h-8 w-8 text-white' />
        </div>

        <h1 className='text-3xl font-bold text-gray-900'>
          Parlez-nous de vous
        </h1>

        <p className='text-gray-600'>
          Ces informations nous aident à personnaliser votre expérience
        </p>
      </motion.div>

      {/* Formulaire */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Nom et prénom */}
        <div className='grid md:grid-cols-2 gap-4'>
          <FormField
            label='Prénom *'
            type='text'
            placeholder='Votre prénom'
            {...register('firstName')}
            error={errors.firstName?.message}
            leftIcon={<User className='h-4 w-4' />}
          />

          <FormField
            label='Nom *'
            type='text'
            placeholder='Votre nom'
            {...register('lastName')}
            error={errors.lastName?.message}
            leftIcon={<User className='h-4 w-4' />}
          />
        </div>

        {/* Téléphone */}
        <FormField
          label='Téléphone'
          type='text'
          placeholder='+41 79 123 45 67'
          {...register('phone')}
          error={errors.phone?.message}
          leftIcon={<Phone className='h-4 w-4' />}
          helperText='Optionnel - Pour les rappels de rendez-vous'
        />

        {/* Préférences de langue et fuseau horaire */}
        <div className='grid md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              <Globe className='h-4 w-4 inline mr-2' />
              Langue préférée
            </label>
            <select
              {...register('locale')}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
            >
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.locale && (
              <p className='text-sm text-red-600'>{errors.locale.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              <Clock className='h-4 w-4 inline mr-2' />
              Fuseau horaire
            </label>
            <select
              {...register('timezone')}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
            >
              {TIMEZONE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.timezone && (
              <p className='text-sm text-red-600'>{errors.timezone.message}</p>
            )}
          </div>
        </div>

        {/* Conseil */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <WizardTip type='tip' title='Pourquoi ces informations ?'>
            <ul className='space-y-1 text-sm'>
              <li>
                • <strong>Nom complet</strong> : Pour personnaliser votre suivi
              </li>
              <li>
                • <strong>Téléphone</strong> : Pour les rappels de rendez-vous
                (optionnel)
              </li>
              <li>
                • <strong>Langue</strong> : Pour adapter l'interface à vos
                préférences
              </li>
              <li>
                • <strong>Fuseau horaire</strong> : Pour programmer vos
                consultations
              </li>
            </ul>
          </WizardTip>
        </motion.div>

        {/* Boutons de navigation */}
        <motion.div
          className='flex justify-between pt-6'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
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
            loading={isSubmitting}
          >
            Continuer
          </Button>
        </motion.div>
      </motion.form>

      {/* Indicateur de progression */}
      <motion.div
        className='mt-8 text-center text-sm text-gray-500'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <p>Étape 2 sur 9 • Environ 13 minutes restantes</p>

        {/* Barre de progression */}
        <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
          <motion.div
            className='bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full'
            initial={{ width: '11%' }}
            animate={{ width: '22%' }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalInfoStep;
