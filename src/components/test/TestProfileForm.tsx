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
import {
  UserIcon,
  AcademicCapIcon,
  HeartIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

// Données d'exemple
const sampleNutritionistData = {
  first_name: 'Marie',
  last_name: 'Dubois',
  phone: '+41791234567',
  avatar_url: null,
  locale: 'fr-CH',
  timezone: 'Europe/Zurich',
  asca_number: 'ND123456',
  rme_number: 'RME789012',
  ean_code: '1234567890123',
  specializations: [
    'Nutrition sportive',
    'Perte de poids',
    'Allergies alimentaires',
  ],
  bio: "Nutritionniste diplômée avec plus de 10 ans d'expérience dans le domaine de la nutrition sportive et de la perte de poids. Spécialisée dans les allergies alimentaires et les intolérances.",
  consultation_rates: {
    initial: 15000,
    follow_up: 10000,
    express: 5000,
  },
  practice_address: {
    street: 'Rue de la Paix 123',
    postal_code: '1200',
    city: 'Genève',
    canton: 'GE',
    country: 'CH',
  },
  verified: true,
  is_active: true,
  max_patients: 50,
};

const samplePatientData = {
  first_name: 'Jean',
  last_name: 'Martin',
  phone: '+41787654321',
  avatar_url: null,
  locale: 'fr-CH',
  timezone: 'Europe/Zurich',
  date_of_birth: '1985-06-15',
  gender: 'male',
  emergency_contact: {
    name: 'Sophie Martin',
    phone: '+41781234567',
    relationship: 'Conjoint',
  },
  height: 175,
  initial_weight: 80,
  target_weight: 70,
  activity_level: 'moderate',
  allergies: ['Gluten', 'Lactose'],
  dietary_restrictions: ['Végétarien'],
  medical_conditions: ['Hypertension'],
  medications: ['Médicament A', 'Vitamine D'],
  subscription_tier: 2,
  subscription_status: 'active',
  subscription_start_date: '2024-01-01T00:00:00Z',
  subscription_end_date: '2024-12-31T23:59:59Z',
};

interface TestProfileFormProps {
  userType: 'nutritionist' | 'patient';
  onBack: () => void;
}

export function TestProfileForm({ userType, onBack }: TestProfileFormProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialData =
    userType === 'nutritionist' ? sampleNutritionistData : samplePatientData;

  const methods = useForm<ProfileUpdate>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const {
    watch,
    formState: { isDirty, errors },
  } = methods;
  const watchedValues = watch();

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty, watchedValues]);

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
    setIsSubmitting(true);
    try {
      // Simulation d'une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Données sauvegardées:', data);
      alert('Profil sauvegardé avec succès ! (Simulation)');
      setHasUnsavedChanges(false);
      methods.reset(data);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      onBack();
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
    setHasUnsavedChanges(false);
    methods.reset(initialData);
    onBack();
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
            Édition du profil{' '}
            {userType === 'nutritionist' ? 'Nutritionniste' : 'Patient'}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className='space-y-6'
            >
              <div className='flex items-center space-x-3 mb-6'>
                <UserIcon className='h-6 w-6 text-blue-600' />
                <h2 className='text-xl font-semibold text-gray-900'>
                  Informations personnelles
                </h2>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Prénom *
                  </label>
                  <input
                    {...methods.register('first_name')}
                    type='text'
                    placeholder='Votre prénom'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  {errors.first_name && (
                    <p className='text-sm text-red-600 mt-1'>
                      {errors.first_name.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Nom de famille *
                  </label>
                  <input
                    {...methods.register('last_name')}
                    type='text'
                    placeholder='Votre nom'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  {errors.last_name && (
                    <p className='text-sm text-red-600 mt-1'>
                      {errors.last_name.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Téléphone *
                </label>
                <input
                  {...methods.register('phone')}
                  type='tel'
                  placeholder='+41 XX XXX XX XX'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                {errors.phone && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.phone.message as string}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Champs spécifiques au type d'utilisateur */}
            {userType === 'nutritionist' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className='space-y-6'
              >
                <div className='flex items-center space-x-3 mb-6'>
                  <AcademicCapIcon className='h-6 w-6 text-blue-600' />
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Informations professionnelles
                  </h2>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Numéro ASCA
                    </label>
                    <input
                      {...methods.register('asca_number')}
                      type='text'
                      placeholder='XX123456'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                    {errors.asca_number && (
                      <p className='text-sm text-red-600 mt-1'>
                        {errors.asca_number.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Numéro RME
                    </label>
                    <input
                      {...methods.register('rme_number')}
                      type='text'
                      placeholder='RME123456'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                    {errors.rme_number && (
                      <p className='text-sm text-red-600 mt-1'>
                        {errors.rme_number.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Code EAN
                    </label>
                    <input
                      {...methods.register('ean_code')}
                      type='text'
                      placeholder='1234567890123'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                    {errors.ean_code && (
                      <p className='text-sm text-red-600 mt-1'>
                        {errors.ean_code.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Biographie professionnelle
                  </label>
                  <textarea
                    {...methods.register('bio')}
                    rows={4}
                    placeholder='Décrivez votre parcours, vos spécialités et votre approche...'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  {errors.bio && (
                    <p className='text-sm text-red-600 mt-1'>
                      {errors.bio.message as string}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className='space-y-6'
              >
                <div className='flex items-center space-x-3 mb-6'>
                  <HeartIcon className='h-6 w-6 text-blue-600' />
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Informations médicales
                  </h2>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Date de naissance
                    </label>
                    <input
                      {...methods.register('date_of_birth')}
                      type='date'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                    {errors.date_of_birth && (
                      <p className='text-sm text-red-600 mt-1'>
                        {errors.date_of_birth.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Taille (cm)
                    </label>
                    <input
                      {...methods.register('height', { valueAsNumber: true })}
                      type='number'
                      placeholder='170'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                    {errors.height && (
                      <p className='text-sm text-red-600 mt-1'>
                        {errors.height.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Poids initial (kg)
                    </label>
                    <input
                      {...methods.register('initial_weight', {
                        valueAsNumber: true,
                      })}
                      type='number'
                      placeholder='70'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                    {errors.initial_weight && (
                      <p className='text-sm text-red-600 mt-1'>
                        {errors.initial_weight.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions du formulaire */}
            <div className='flex flex-col space-y-4'>
              <div className='flex flex-col sm:flex-row gap-4 justify-end'>
                <button
                  type='button'
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className='inline-flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'
                >
                  <ArrowLeftIcon className='h-5 w-5' />
                  <span>Annuler</span>
                </button>

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
                >
                  {isSubmitting ? (
                    <>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className='h-5 w-5' />
                      <span>Sauvegarder</span>
                    </>
                  )}
                </button>
              </div>

              {hasUnsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'
                >
                  <ExclamationTriangleIcon className='h-5 w-5 text-yellow-600' />
                  <span className='text-sm text-yellow-800'>
                    Vous avez des modifications non sauvegardées
                  </span>
                </motion.div>
              )}
            </div>
          </form>
        </FormProvider>

        {errors.root && (
          <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-600'>
              {errors.root.message as string}
            </p>
          </div>
        )}

        {/* Dialog de confirmation */}
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className='bg-white rounded-lg p-6 max-w-md w-full mx-4'
            >
              <div className='flex items-center space-x-3 mb-4'>
                <ExclamationTriangleIcon className='h-6 w-6 text-yellow-600' />
                <h3 className='text-lg font-semibold text-gray-900'>
                  Modifications non sauvegardées
                </h3>
              </div>
              <p className='text-gray-600 mb-6'>
                Vous avez des modifications non sauvegardées. Êtes-vous sûr de
                vouloir quitter sans sauvegarder ?
              </p>
              <div className='flex flex-col sm:flex-row gap-3 justify-end'>
                <button
                  type='button'
                  onClick={handleDiscardChanges}
                  className='inline-flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <XMarkIcon className='h-4 w-4' />
                  <span>Ignorer les changements</span>
                </button>
                <button
                  type='button'
                  onClick={handleConfirmCancel}
                  className='inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <ArrowLeftIcon className='h-4 w-4' />
                  <span>Continuer l'édition</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
