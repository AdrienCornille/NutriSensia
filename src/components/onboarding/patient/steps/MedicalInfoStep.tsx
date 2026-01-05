/**
 * Étape des informations médicales pour l'onboarding des patients
 * Collecte les conditions médicales et médicaments (optionnel)
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Stethoscope, Pill, Phone, Shield } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { WizardTip } from '../../WizardLayout';
import { PatientOnboardingData } from '@/types/onboarding';
import { medicalInfoSchema } from '@/lib/onboarding-schemas';

interface MedicalInfoStepProps {
  data: Partial<PatientOnboardingData>;
  onDataChange: (data: Partial<PatientOnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
}

const COMMON_CONDITIONS = [
  'Diabète',
  'Hypertension',
  'Cholestérol élevé',
  'Hypothyroïdie',
  'Hyperthyroïdie',
  'Syndrome métabolique',
  'Maladie cœliaque',
  "Syndrome de l'intestin irritable",
  'Reflux gastrique',
  'Anémie',
];

export const MedicalInfoStep: React.FC<MedicalInfoStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
}) => {
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    data.medicalConditions || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(medicalInfoSchema),
    defaultValues: {
      medicalConditions: data.medicalConditions || [],
      medications: data.medications || [],
      emergencyContact: data.emergencyContact || {
        name: '',
        phone: '',
        relationship: '',
      },
      hasHealthInsurance: data.hasHealthInsurance ?? true,
      previousNutritionistExperience:
        data.previousNutritionistExperience ?? false,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Pas de useEffect automatique pour éviter les boucles infinies
  // Les données seront mises à jour lors de la soumission

  const toggleCondition = (condition: string) => {
    const newConditions = selectedConditions.includes(condition)
      ? selectedConditions.filter(c => c !== condition)
      : [...selectedConditions, condition];
    setSelectedConditions(newConditions);
    setValue('medicalConditions', newConditions);
  };

  const onSubmit = (formData: any) => {
    onDataChange({
      ...data,
      ...formData,
      medicalConditions: selectedConditions,
    });
    onNext();
  };

  return (
    <div className='space-y-6'>
      <motion.div
        className='text-center space-y-2'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className='mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-4'>
          <Stethoscope className='h-8 w-8 text-white' />
        </div>
        <h1 className='text-3xl font-bold text-gray-900'>
          Informations médicales
        </h1>
        <p className='text-gray-600'>
          Ces informations nous aident à personnaliser votre suivi (optionnel)
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Conditions médicales */}
        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Conditions médicales (optionnel)
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
            {COMMON_CONDITIONS.map(condition => (
              <motion.button
                key={condition}
                type='button'
                onClick={() => toggleCondition(condition)}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  selectedConditions.includes(condition)
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {condition}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Contact d'urgence */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
            <Phone className='h-5 w-5 mr-2' />
            Contact d'urgence (optionnel)
          </h3>

          <div className='grid md:grid-cols-2 gap-4'>
            <FormField
              label='Nom complet'
              type='text'
              placeholder='Marie Dupont'
              {...register('emergencyContact.name')}
              error={errors.emergencyContact?.name?.message}
            />

            <FormField
              label='Relation'
              type='text'
              placeholder='Épouse, Mère, Ami...'
              {...register('emergencyContact.relationship')}
              error={errors.emergencyContact?.relationship?.message}
            />
          </div>

          <FormField
            label='Téléphone'
            type='text'
            placeholder='+41 79 123 45 67'
            {...register('emergencyContact.phone')}
            error={errors.emergencyContact?.phone?.message}
          />
        </div>

        {/* Questions diverses */}
        <div className='space-y-4'>
          <div className='flex items-center space-x-3'>
            <input
              type='checkbox'
              id='hasHealthInsurance'
              {...register('hasHealthInsurance')}
              className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
            />
            <label
              htmlFor='hasHealthInsurance'
              className='text-sm font-medium text-gray-700'
            >
              J'ai une assurance maladie
            </label>
          </div>

          <div className='flex items-center space-x-3'>
            <input
              type='checkbox'
              id='previousNutritionistExperience'
              {...register('previousNutritionistExperience')}
              className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
            />
            <label
              htmlFor='previousNutritionistExperience'
              className='text-sm font-medium text-gray-700'
            >
              J'ai déjà consulté un nutritionniste
            </label>
          </div>
        </div>

        <WizardTip type='privacy' title='Confidentialité médicale'>
          <p className='text-sm'>
            Toutes vos informations médicales sont{' '}
            <strong>strictement confidentielles</strong>
            et ne seront partagées qu'avec votre nutritionniste assigné pour
            optimiser votre suivi.
          </p>
        </WizardTip>

        <div className='flex justify-between pt-6'>
          <Button
            type='button'
            variant='secondary'
            onClick={onPrevious}
            disabled={isSubmitting}
          >
            Retour
          </Button>
          <Button type='submit' disabled={isSubmitting} loading={isSubmitting}>
            Continuer
          </Button>
        </div>
      </motion.form>

      <div className='mt-8 text-center text-sm text-gray-500'>
        <p>Étape 6 sur 9 • Environ 3 minutes restantes</p>
        <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
          <motion.div
            className='bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full'
            initial={{ width: '55%' }}
            animate={{ width: '66%' }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default MedicalInfoStep;
