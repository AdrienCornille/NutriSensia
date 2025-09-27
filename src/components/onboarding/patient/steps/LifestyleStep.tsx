/**
 * Étape du style de vie pour l'onboarding des patients
 * Collecte les informations sur l'activité physique et les habitudes
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Activity, Moon, Briefcase, Cigarette, Wine } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { WizardTip } from '../../WizardLayout';
import { PatientOnboardingData } from '@/types/onboarding';
import { lifestyleSchema } from '@/lib/onboarding-schemas';

interface LifestyleStepProps {
  data: Partial<PatientOnboardingData>;
  onDataChange: (data: Partial<PatientOnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
}

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sédentaire', description: 'Peu ou pas d\'exercice', icon: '🪑' },
  { value: 'light', label: 'Léger', description: 'Exercice léger 1-3 jours/semaine', icon: '🚶‍♂️' },
  { value: 'moderate', label: 'Modéré', description: 'Exercice modéré 3-5 jours/semaine', icon: '🏃‍♂️' },
  { value: 'active', label: 'Actif', description: 'Exercice intense 6-7 jours/semaine', icon: '🏋️‍♂️' },
  { value: 'very_active', label: 'Très actif', description: 'Exercice très intense, travail physique', icon: '💪' },
];

const STRESS_LEVELS = [
  { value: 'very-low', label: 'Très faible', icon: '😌' },
  { value: 'low', label: 'Faible', icon: '🙂' },
  { value: 'moderate', label: 'Modéré', icon: '😐' },
  { value: 'high', label: 'Élevé', icon: '😰' },
  { value: 'very-high', label: 'Très élevé', icon: '😫' },
];

export const LifestyleStep: React.FC<LifestyleStepProps> = ({
  data, onDataChange, onNext, onPrevious, isSubmitting = false,
}) => {
  
  const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm({
    resolver: zodResolver(lifestyleSchema),
    defaultValues: {
      activityLevel: data.activityLevel || 'moderate',
      exerciseFrequency: data.exerciseFrequency || '3-4-times',
      sleepHours: data.sleepHours || 8,
      stressLevel: data.stressLevel || 'moderate',
      workSchedule: data.workSchedule || 'regular',
      smokingStatus: data.smokingStatus || 'never',
      alcoholConsumption: data.alcoholConsumption || 'occasionally',
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Pas de useEffect automatique pour éviter les boucles infinies
  // Les données seront mises à jour lors de la soumission

  const onSubmit = (formData: any) => {
    onDataChange({
      ...data,
      ...formData,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <motion.div className="text-center space-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Votre style de vie</h1>
        <p className="text-gray-600">Ces informations nous aident à adapter vos recommandations</p>
      </motion.div>

      <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        
        {/* Niveau d'activité */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Niveau d'activité physique *
          </h3>
          <div className="space-y-2">
            {ACTIVITY_LEVELS.map((level) => (
              <label key={level.value} className="cursor-pointer">
                <input
                  type="radio"
                  value={level.value}
                  {...register('activityLevel')}
                  className="sr-only"
                />
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  watch('activityLevel') === level.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Heures de sommeil */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Moon className="h-5 w-5 mr-2" />
            Heures de sommeil par nuit *
          </h3>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="4"
              max="12"
              step="0.5"
              {...register('sleepHours', { valueAsNumber: true })}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-lg font-medium w-16">
              {watch('sleepHours')}h
            </span>
          </div>
        </div>

        {/* Niveau de stress */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Niveau de stress général *
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {STRESS_LEVELS.map((level) => (
              <label key={level.value} className="cursor-pointer">
                <input
                  type="radio"
                  value={level.value}
                  {...register('stressLevel')}
                  className="sr-only"
                />
                <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                  watch('stressLevel') === level.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="text-2xl mb-1">{level.icon}</div>
                  <div className="text-xs font-medium">{level.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Horaires de travail */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Type d'horaire de travail *
          </h3>
          <select
            {...register('workSchedule')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="regular">Régulier (9h-17h)</option>
            <option value="shift-work">Travail posté (équipes)</option>
            <option value="flexible">Flexible</option>
            <option value="irregular">Irrégulier</option>
          </select>
        </div>

        {/* Tabac et alcool */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Cigarette className="h-5 w-5 mr-2" />
              Tabac *
            </h3>
            <select
              {...register('smokingStatus')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="never">Jamais fumé</option>
              <option value="former">Ancien fumeur</option>
              <option value="occasional">Occasionnel</option>
              <option value="regular">Régulier</option>
            </select>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Wine className="h-5 w-5 mr-2" />
              Alcool *
            </h3>
            <select
              {...register('alcoholConsumption')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="never">Jamais</option>
              <option value="rarely">Rarement</option>
              <option value="occasionally">Occasionnellement</option>
              <option value="regularly">Régulièrement</option>
              <option value="daily">Quotidiennement</option>
            </select>
          </div>
        </div>

        <WizardTip type="tip" title="Pourquoi ces questions ?">
          <p className="text-sm">
            Votre style de vie influence directement vos besoins nutritionnels. 
            Ces informations nous permettent de vous proposer des recommandations 
            adaptées à votre rythme de vie.
          </p>
        </WizardTip>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="secondary" onClick={onPrevious} disabled={isSubmitting}>
            Retour
          </Button>
          <Button type="submit" disabled={!isValid || isSubmitting} loading={isSubmitting}>
            Continuer
          </Button>
        </div>
      </motion.form>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Étape 7 sur 9 • Environ 2 minutes restantes</p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full"
            initial={{ width: '66%' }}
            animate={{ width: '77%' }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default LifestyleStep;
