/**
 * Étape des informations alimentaires pour l'onboarding des patients
 * Collecte les restrictions, allergies et préférences alimentaires
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Utensils, AlertTriangle, ChefHat, Clock } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { WizardTip } from '../../WizardLayout';
import { PatientOnboardingData } from '@/types/onboarding';
import { dietaryInfoSchema } from '@/lib/onboarding-schemas';

interface DietaryInfoStepProps {
  data: Partial<PatientOnboardingData>;
  onDataChange: (data: Partial<PatientOnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
}

const DIETARY_RESTRICTIONS = [
  'Végétarien',
  'Végétalien',
  'Sans gluten',
  'Sans lactose',
  'Cétogène',
  'Paléo',
  'Sans sucre',
  'Halal',
  'Casher',
];

const COMMON_ALLERGIES = [
  'Arachides',
  'Fruits à coque',
  'Lait',
  'Œufs',
  'Poisson',
  'Crustacés',
  'Soja',
  'Blé',
  'Sésame',
];

const COOKING_LEVELS = [
  { value: 'beginner', label: 'Débutant', icon: '🥗' },
  { value: 'intermediate', label: 'Intermédiaire', icon: '👨‍🍳' },
  { value: 'advanced', label: 'Avancé', icon: '👩‍🍳' },
];

const PREP_TIMES = [
  { value: 'quick', label: 'Rapide (< 20 min)', icon: '⚡' },
  { value: 'moderate', label: 'Modéré (20-45 min)', icon: '⏰' },
  { value: 'elaborate', label: 'Élaboré (> 45 min)', icon: '🍽️' },
];

export const DietaryInfoStep: React.FC<DietaryInfoStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
}) => {
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    data.dietaryRestrictions || []
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    data.allergies || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(dietaryInfoSchema),
    defaultValues: {
      dietaryRestrictions: data.dietaryRestrictions || [],
      allergies: data.allergies || [],
      cookingSkillLevel: data.cookingSkillLevel || 'intermediate',
      mealPrepTime: data.mealPrepTime || 'moderate',
      eatingOutFrequency: data.eatingOutFrequency || 'sometimes',
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Pas de useEffect automatique pour éviter les boucles infinies
  // Les données seront mises à jour lors de la soumission

  const toggleRestriction = (restriction: string) => {
    const newRestrictions = selectedRestrictions.includes(restriction)
      ? selectedRestrictions.filter(r => r !== restriction)
      : [...selectedRestrictions, restriction];
    setSelectedRestrictions(newRestrictions);
    setValue('dietaryRestrictions', newRestrictions);
  };

  const toggleAllergy = (allergy: string) => {
    const newAllergies = selectedAllergies.includes(allergy)
      ? selectedAllergies.filter(a => a !== allergy)
      : [...selectedAllergies, allergy];
    setSelectedAllergies(newAllergies);
    setValue('allergies', newAllergies);
  };

  const onSubmit = (formData: any) => {
    onDataChange({
      ...data,
      ...formData,
      dietaryRestrictions: selectedRestrictions,
      allergies: selectedAllergies,
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
        <div className='mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4'>
          <Utensils className='h-8 w-8 text-white' />
        </div>
        <h1 className='text-3xl font-bold text-gray-900'>
          Vos habitudes alimentaires
        </h1>
        <p className='text-gray-600'>
          Aidez-nous à personnaliser vos recommandations nutritionnelles
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Restrictions alimentaires */}
        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
            <Utensils className='h-5 w-5 mr-2' />
            Restrictions alimentaires
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
            {DIETARY_RESTRICTIONS.map(restriction => (
              <motion.button
                key={restriction}
                type='button'
                onClick={() => toggleRestriction(restriction)}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  selectedRestrictions.includes(restriction)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {restriction}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
            <AlertTriangle className='h-5 w-5 mr-2 text-red-500' />
            Allergies alimentaires
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
            {COMMON_ALLERGIES.map(allergy => (
              <motion.button
                key={allergy}
                type='button'
                onClick={() => toggleAllergy(allergy)}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  selectedAllergies.includes(allergy)
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {allergy}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Niveau de cuisine */}
        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
            <ChefHat className='h-5 w-5 mr-2' />
            Niveau de cuisine *
          </h3>
          <div className='grid grid-cols-3 gap-3'>
            {COOKING_LEVELS.map(level => (
              <label key={level.value} className='cursor-pointer'>
                <input
                  type='radio'
                  value={level.value}
                  {...register('cookingSkillLevel')}
                  className='sr-only'
                />
                <div
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    watch('cookingSkillLevel') === level.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='text-2xl mb-2'>{level.icon}</div>
                  <div className='font-medium'>{level.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Temps de préparation */}
        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
            <Clock className='h-5 w-5 mr-2' />
            Temps de préparation préféré *
          </h3>
          <div className='grid grid-cols-3 gap-3'>
            {PREP_TIMES.map(time => (
              <label key={time.value} className='cursor-pointer'>
                <input
                  type='radio'
                  value={time.value}
                  {...register('mealPrepTime')}
                  className='sr-only'
                />
                <div
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    watch('mealPrepTime') === time.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='text-2xl mb-2'>{time.icon}</div>
                  <div className='text-sm font-medium'>{time.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Fréquence repas extérieur */}
        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Fréquence des repas à l'extérieur *
          </h3>
          <select
            {...register('eatingOutFrequency')}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500'
          >
            <option value='never'>Jamais</option>
            <option value='rarely'>Rarement (1-2 fois/mois)</option>
            <option value='sometimes'>Parfois (1-2 fois/semaine)</option>
            <option value='often'>Souvent (3-4 fois/semaine)</option>
            <option value='daily'>Quotidiennement</option>
          </select>
        </div>

        <WizardTip type='info' title='Pourquoi ces informations ?'>
          <p className='text-sm'>
            Ces détails nous permettent de créer des recommandations
            alimentaires parfaitement adaptées à vos besoins, contraintes et
            préférences.
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
          <Button
            type='submit'
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            Continuer
          </Button>
        </div>
      </motion.form>

      <div className='mt-8 text-center text-sm text-gray-500'>
        <p>Étape 5 sur 9 • Environ 5 minutes restantes</p>
        <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
          <motion.div
            className='bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full'
            initial={{ width: '44%' }}
            animate={{ width: '55%' }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default DietaryInfoStep;
