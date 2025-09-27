/**
 * Étape des objectifs de santé pour l'onboarding des patients
 * Permet de définir les objectifs principaux et secondaires
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Target, TrendingDown, TrendingUp, Heart, Zap, Shield } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { WizardTip } from '../../WizardLayout';
import { PatientOnboardingData } from '@/types/onboarding';
import { healthGoalsSchema } from '@/lib/onboarding-schemas';

interface HealthGoalsStepProps {
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
type HealthGoalsFormData = {
  primaryGoals: string[];
  secondaryGoals?: string[];
  motivations: string[];
  targetWeight?: number;
  timeline: '1-month' | '3-months' | '6-months' | '1-year' | 'long-term';
};

/**
 * Objectifs principaux disponibles
 */
const PRIMARY_GOALS = [
  { 
    id: 'weight-loss', 
    label: 'Perdre du poids', 
    icon: <TrendingDown className="h-5 w-5" />,
    description: 'Atteindre un poids santé',
    color: 'border-red-200 bg-red-50 text-red-700'
  },
  { 
    id: 'weight-gain', 
    label: 'Prendre du poids', 
    icon: <TrendingUp className="h-5 w-5" />,
    description: 'Augmenter la masse corporelle sainement',
    color: 'border-blue-200 bg-blue-50 text-blue-700'
  },
  { 
    id: 'maintain-weight', 
    label: 'Maintenir mon poids', 
    icon: <Target className="h-5 w-5" />,
    description: 'Stabiliser mon poids actuel',
    color: 'border-green-200 bg-green-50 text-green-700'
  },
  { 
    id: 'improve-health', 
    label: 'Améliorer ma santé', 
    icon: <Heart className="h-5 w-5" />,
    description: 'Réduire les risques de maladies',
    color: 'border-pink-200 bg-pink-50 text-pink-700'
  },
  { 
    id: 'increase-energy', 
    label: 'Avoir plus d\'énergie', 
    icon: <Zap className="h-5 w-5" />,
    description: 'Combattre la fatigue',
    color: 'border-yellow-200 bg-yellow-50 text-yellow-700'
  },
  { 
    id: 'manage-condition', 
    label: 'Gérer une condition médicale', 
    icon: <Shield className="h-5 w-5" />,
    description: 'Diabète, hypertension, etc.',
    color: 'border-purple-200 bg-purple-50 text-purple-700'
  },
];

/**
 * Objectifs secondaires disponibles
 */
const SECONDARY_GOALS = [
  'Améliorer la digestion',
  'Réduire le stress',
  'Mieux dormir',
  'Améliorer les performances sportives',
  'Avoir une peau plus saine',
  'Renforcer le système immunitaire',
  'Améliorer la concentration',
  'Équilibrer les hormones',
];

/**
 * Motivations disponibles
 */
const MOTIVATIONS = [
  { id: 'health', label: 'Santé générale', icon: '🏥' },
  { id: 'appearance', label: 'Apparence physique', icon: '💪' },
  { id: 'energy', label: 'Niveau d\'énergie', icon: '⚡' },
  { id: 'confidence', label: 'Confiance en soi', icon: '🌟' },
  { id: 'family', label: 'Famille et proches', icon: '👨‍👩‍👧‍👦' },
  { id: 'longevity', label: 'Longévité', icon: '🌱' },
  { id: 'sport', label: 'Performance sportive', icon: '🏃‍♂️' },
  { id: 'medical', label: 'Recommandation médicale', icon: '👨‍⚕️' },
];

/**
 * Options de délai
 */
const TIMELINE_OPTIONS = [
  { value: '1-month', label: '1 mois', description: 'Objectif à court terme' },
  { value: '3-months', label: '3 mois', description: 'Résultats visibles' },
  { value: '6-months', label: '6 mois', description: 'Transformation durable' },
  { value: '1-year', label: '1 an', description: 'Changement profond' },
  { value: 'long-term', label: 'Long terme', description: 'Mode de vie permanent' },
];

/**
 * Étape des objectifs de santé
 */
export const HealthGoalsStep: React.FC<HealthGoalsStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
}) => {
  
  const [selectedPrimaryGoals, setSelectedPrimaryGoals] = useState<string[]>(
    data.primaryGoals || []
  );
  const [selectedSecondaryGoals, setSelectedSecondaryGoals] = useState<string[]>(
    data.secondaryGoals || []
  );
  const [selectedMotivations, setSelectedMotivations] = useState<string[]>(
    data.motivations || []
  );
  
  // Configuration du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<HealthGoalsFormData>({
    resolver: zodResolver(healthGoalsSchema),
    defaultValues: {
      primaryGoals: data.primaryGoals || [],
      secondaryGoals: data.secondaryGoals || [],
      motivations: data.motivations || [],
      targetWeight: data.targetWeight || undefined,
      timeline: data.timeline || '3-months',
    },
    mode: 'onChange',
  });

  // Surveiller les changements
  const watchedValues = watch();

  // Pas de useEffect automatique pour éviter les boucles infinies
  // Les données seront mises à jour lors de la soumission

  /**
   * Gérer la sélection des objectifs principaux
   */
  const handlePrimaryGoalToggle = (goalId: string) => {
    const newGoals = selectedPrimaryGoals.includes(goalId)
      ? selectedPrimaryGoals.filter(id => id !== goalId)
      : [...selectedPrimaryGoals, goalId];
    
    setSelectedPrimaryGoals(newGoals);
    setValue('primaryGoals', newGoals);
  };

  /**
   * Gérer la sélection des objectifs secondaires
   */
  const handleSecondaryGoalToggle = (goal: string) => {
    const newGoals = selectedSecondaryGoals.includes(goal)
      ? selectedSecondaryGoals.filter(g => g !== goal)
      : [...selectedSecondaryGoals, goal];
    
    setSelectedSecondaryGoals(newGoals);
    setValue('secondaryGoals', newGoals);
  };

  /**
   * Gérer la sélection des motivations
   */
  const handleMotivationToggle = (motivationId: string) => {
    const newMotivations = selectedMotivations.includes(motivationId)
      ? selectedMotivations.filter(id => id !== motivationId)
      : [...selectedMotivations, motivationId];
    
    setSelectedMotivations(newMotivations);
    setValue('motivations', newMotivations);
  };

  /**
   * Gérer la soumission du formulaire
   */
  const onSubmit = (formData: HealthGoalsFormData) => {
    onDataChange({
      ...data,
      ...formData,
      primaryGoals: selectedPrimaryGoals,
      secondaryGoals: selectedSecondaryGoals,
      motivations: selectedMotivations,
    });
    onNext();
  };

  // Vérifier si on peut afficher le poids cible
  const showTargetWeight = selectedPrimaryGoals.includes('weight-loss') || 
                          selectedPrimaryGoals.includes('weight-gain');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Vos objectifs santé
        </h1>
        
        <p className="text-gray-600">
          Définissons ensemble vos objectifs pour personnaliser votre parcours
        </p>
      </motion.div>

      {/* Formulaire */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Objectifs principaux */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Objectifs principaux * (1 à 3)
          </h3>
          
          <div className="grid md:grid-cols-2 gap-3">
            {PRIMARY_GOALS.map((goal) => (
              <motion.button
                key={goal.id}
                type="button"
                onClick={() => handlePrimaryGoalToggle(goal.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedPrimaryGoals.includes(goal.id)
                    ? `border-green-500 ${goal.color}`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{goal.icon}</div>
                  <div>
                    <div className="font-medium">{goal.label}</div>
                    <div className="text-sm opacity-75">{goal.description}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          
          {errors.primaryGoals && (
            <p className="text-sm text-red-600">{errors.primaryGoals.message}</p>
          )}
        </div>

        {/* Poids cible (conditionnel) */}
        {showTargetWeight && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <FormField
              label="Poids cible (kg)"
              type="number"
              placeholder="65"
              step="0.1"
              {...register('targetWeight', { valueAsNumber: true })}
              error={errors.targetWeight?.message}
              helperText="Optionnel - Votre nutritionniste vous aidera à définir un objectif réaliste"
            />
          </motion.div>
        )}

        {/* Délai */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Dans quel délai ? *
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TIMELINE_OPTIONS.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  value={option.value}
                  {...register('timeline')}
                  className="sr-only"
                />
                <div className={`p-4 rounded-lg border-2 text-center transition-all ${
                  watch('timeline') === option.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
          
          {errors.timeline && (
            <p className="text-sm text-red-600">{errors.timeline.message}</p>
          )}
        </div>

        {/* Motivations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Qu'est-ce qui vous motive ? * (1 à 5)
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MOTIVATIONS.map((motivation) => (
              <motion.button
                key={motivation.id}
                type="button"
                onClick={() => handleMotivationToggle(motivation.id)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  selectedMotivations.includes(motivation.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-2">{motivation.icon}</div>
                <div className="text-sm font-medium">{motivation.label}</div>
              </motion.button>
            ))}
          </div>
          
          {errors.motivations && (
            <p className="text-sm text-red-600">{errors.motivations.message}</p>
          )}
        </div>

        {/* Objectifs secondaires */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Objectifs secondaires (optionnel)
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SECONDARY_GOALS.map((goal) => (
              <motion.button
                key={goal}
                type="button"
                onClick={() => handleSecondaryGoalToggle(goal)}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  selectedSecondaryGoals.includes(goal)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {goal}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Conseil */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <WizardTip type="tip" title="Conseils pour définir vos objectifs">
            <ul className="space-y-1 text-sm">
              <li>• Soyez <strong>réaliste</strong> : des objectifs atteignables vous motivent</li>
              <li>• Pensez <strong>long terme</strong> : les changements durables prennent du temps</li>
              <li>• Votre nutritionniste vous aidera à <strong>affiner</strong> vos objectifs</li>
              <li>• Vous pourrez <strong>modifier</strong> vos objectifs à tout moment</li>
            </ul>
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
        <p>Étape 4 sur 9 • Environ 7 minutes restantes</p>
        
        {/* Barre de progression */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full"
            initial={{ width: '33%' }}
            animate={{ width: '44%' }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default HealthGoalsStep;
