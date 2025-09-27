/**
 * Étape du profil santé pour l'onboarding des patients
 * Collecte les informations de base : âge, genre, taille, poids
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Heart, Calendar, Ruler, Weight, User } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { WizardTip } from '../../WizardLayout';
import { PatientOnboardingData } from '@/types/onboarding';
import { healthProfileSchema } from '@/lib/onboarding-schemas';

interface HealthProfileStepProps {
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
type HealthProfileFormData = {
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height?: number;
  currentWeight?: number;
};

/**
 * Options de genre
 */
const GENDER_OPTIONS = [
  { value: 'male', label: 'Homme', icon: '👨' },
  { value: 'female', label: 'Femme', icon: '👩' },
  { value: 'other', label: 'Autre', icon: '👤' },
  { value: 'prefer_not_to_say', label: 'Préfère ne pas dire', icon: '🤐' },
] as const;

/**
 * Calculer l'âge à partir de la date de naissance
 */
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calculer l'IMC
 */
const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

/**
 * Obtenir la catégorie IMC
 */
const getBMICategory = (bmi: number): { category: string; color: string } => {
  if (bmi < 18.5) return { category: 'Insuffisance pondérale', color: 'text-blue-600' };
  if (bmi < 25) return { category: 'Poids normal', color: 'text-green-600' };
  if (bmi < 30) return { category: 'Surpoids', color: 'text-orange-600' };
  return { category: 'Obésité', color: 'text-red-600' };
};

/**
 * Étape du profil santé
 */
export const HealthProfileStep: React.FC<HealthProfileStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
}) => {
  
  const [selectedGender, setSelectedGender] = useState<string>(data.gender || '');
  
  // Configuration du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<HealthProfileFormData>({
    resolver: zodResolver(healthProfileSchema),
    defaultValues: {
      dateOfBirth: data.dateOfBirth || '',
      gender: data.gender || 'prefer_not_to_say',
      height: data.height || undefined,
      currentWeight: data.currentWeight || undefined,
    },
    mode: 'onChange',
  });

  // Surveiller les changements
  const watchedValues = watch();
  const { dateOfBirth, height, currentWeight } = watchedValues;

  // Calculer l'âge et l'IMC si les données sont disponibles
  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const bmi = height && currentWeight ? calculateBMI(currentWeight, height) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  // Pas de useEffect automatique pour éviter les boucles infinies
  // Les données seront mises à jour lors de la soumission

  /**
   * Gérer la sélection du genre
   */
  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
    setValue('gender', gender as any);
  };

  /**
   * Gérer la soumission du formulaire
   */
  const onSubmit = (formData: HealthProfileFormData) => {
    onDataChange({
      ...data,
      ...formData,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Votre profil santé
        </h1>
        
        <p className="text-gray-600">
          Ces informations nous aident à personnaliser vos recommandations nutritionnelles
        </p>
      </motion.div>

      {/* Formulaire */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Date de naissance */}
        <div className="space-y-2">
          <FormField
            label="Date de naissance *"
            type="date"
            {...register('dateOfBirth')}
            error={errors.dateOfBirth?.message}
            leftIcon={<Calendar className="h-4 w-4" />}
            max={new Date().toISOString().split('T')[0]} // Pas de date future
          />
          
          {age && (
            <motion.p
              className="text-sm text-gray-600 ml-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Vous avez {age} ans
            </motion.p>
          )}
        </div>

        {/* Genre */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <User className="h-4 w-4 inline mr-2" />
            Genre *
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            {GENDER_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => handleGenderSelect(option.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedGender === option.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </motion.button>
            ))}
          </div>
          
          {errors.gender && (
            <p className="text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        {/* Taille et poids */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            label="Taille (cm)"
            type="number"
            placeholder="170"
            {...register('height', { valueAsNumber: true })}
            error={errors.height?.message}
            leftIcon={<Ruler className="h-4 w-4" />}
            helperText="Optionnel - Aide au calcul de l'IMC"
          />
          
          <FormField
            label="Poids actuel (kg)"
            type="number"
            placeholder="70"
            step="0.1"
            {...register('currentWeight', { valueAsNumber: true })}
            error={errors.currentWeight?.message}
            leftIcon={<Weight className="h-4 w-4" />}
            helperText="Optionnel - Pour le suivi des progrès"
          />
        </div>

        {/* Calcul IMC */}
        {bmi && bmiCategory && (
          <motion.div
            className="p-4 bg-gray-50 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Indice de Masse Corporelle (IMC)
                </p>
                <p className={`text-lg font-bold ${bmiCategory.color}`}>
                  {bmi.toFixed(1)} - {bmiCategory.category}
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              L'IMC est un indicateur général. Votre nutritionniste vous donnera 
              une évaluation plus précise.
            </p>
          </motion.div>
        )}

        {/* Conseil */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <WizardTip type="privacy" title="Confidentialité de vos données">
            <p className="text-sm">
              Toutes vos informations de santé sont <strong>strictement confidentielles</strong> 
              et protégées selon les normes RGPD. Seul votre nutritionniste assigné y aura accès 
              pour personnaliser votre suivi.
            </p>
          </WizardTip>
        </motion.div>

        {/* Boutons de navigation */}
        <motion.div
          className="flex justify-between pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={onPrevious}
            disabled={isSubmitting}
          >
            Retour
          </Button>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            Continuer
          </Button>
        </motion.div>
      </motion.form>

      {/* Indicateur de progression */}
      <motion.div
        className="mt-8 text-center text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <p>Étape 3 sur 9 • Environ 10 minutes restantes</p>
        
        {/* Barre de progression */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full"
            initial={{ width: '22%' }}
            animate={{ width: '33%' }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default HealthProfileStep;
