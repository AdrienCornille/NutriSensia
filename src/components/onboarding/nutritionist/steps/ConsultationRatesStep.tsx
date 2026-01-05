/**
 * Étape des tarifs de consultation pour l'onboarding des nutritionnistes
 * Configuration des tarifs professionnels
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Info } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PriceInput } from '@/components/ui/PriceInput';
import { consultationRatesSchema } from '@/lib/onboarding-schemas';
import { NutritionistOnboardingData } from '@/types/onboarding';
import { z } from 'zod';

interface ConsultationRatesStepProps {
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
}

type ConsultationRatesFormData = z.infer<typeof consultationRatesSchema>;

/**
 * Tarifs suggérés par région/type
 */
const SUGGESTED_RATES = {
  initial: {
    min: 150,
    max: 300,
    average: 225,
    description: 'Première consultation (60-90 minutes)',
  },
  follow_up: {
    min: 100,
    max: 200,
    average: 150,
    description: 'Consultation de suivi (45-60 minutes)',
  },
  express: {
    min: 50,
    max: 120,
    average: 75,
    description: 'Consultation courte (15-30 minutes)',
  },
};

/**
 * Étape des tarifs de consultation
 */
export const ConsultationRatesStep: React.FC<ConsultationRatesStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Configuration du formulaire avec validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<ConsultationRatesFormData>({
    resolver: zodResolver(consultationRatesSchema),
    defaultValues: {
      initial: data.consultationRates?.initial || 22500, // CHF 225.00
      follow_up: data.consultationRates?.follow_up || 15000, // CHF 150.00
      express: data.consultationRates?.express || 7500, // CHF 75.00
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
        consultationRates: {
          initial: watchedFields.initial,
          follow_up: watchedFields.follow_up,
          express: watchedFields.express,
        },
      });
    }
  }, [watchedFields, isDirty, data, onDataChange]);

  /**
   * Soumettre le formulaire et passer à l'étape suivante
   */
  const onSubmit = (formData: ConsultationRatesFormData) => {
    const updatedData = {
      ...data,
      consultationRates: {
        initial: formData.initial,
        follow_up: formData.follow_up,
        express: formData.express,
      },
    };
    console.log(
      `🚀 [ConsultationRatesStep] Soumission avec données:`,
      formData
    );
    console.log(
      `📤 [ConsultationRatesStep] Données complètes transmises:`,
      updatedData
    );

    // Mettre à jour les données localement
    onDataChange(updatedData);

    // Passer à l'étape suivante avec les données
    onNext(updatedData);
  };

  /**
   * Convertir CHF en centimes
   */
  const chfToCentimes = (chf: number): number => {
    return Math.round(chf * 100);
  };

  /**
   * Convertir centimes en CHF
   */
  const centimesToChf = (centimes: number): number => {
    return centimes / 100;
  };

  /**
   * Appliquer les tarifs suggérés
   */
  const applySuggestedRates = () => {
    setValue('initial', chfToCentimes(SUGGESTED_RATES.initial.average), {
      shouldValidate: true,
    });
    setValue('follow_up', chfToCentimes(SUGGESTED_RATES.follow_up.average), {
      shouldValidate: true,
    });
    setValue('express', chfToCentimes(SUGGESTED_RATES.express.average), {
      shouldValidate: true,
    });
  };

  /**
   * Calculer le revenu mensuel estimé
   */
  const calculateMonthlyRevenue = () => {
    const initialRate = centimesToChf(watchedFields.initial);
    const followUpRate = centimesToChf(watchedFields.follow_up);
    const expressRate = centimesToChf(watchedFields.express);

    // Estimation basée sur une pratique moyenne
    const monthlyInitial = initialRate * 8; // 8 nouvelles consultations
    const monthlyFollowUp = followUpRate * 20; // 20 suivis
    const monthlyExpress = expressRate * 12; // 12 consultations express

    return monthlyInitial + monthlyFollowUp + monthlyExpress;
  };

  return (
    <div className='space-y-6'>
      {/* Titre de l'étape */}
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-3'>
          Tarifs de consultation
        </h1>
        <p className='text-gray-600 text-lg'>
          Configuration de vos tarifs professionnels
        </p>
      </div>

      {/* Tarifs suggérés */}
      <motion.div
        className='bg-blue-50 rounded-lg p-4 border border-blue-200'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className='flex items-center justify-between mb-3'>
          <h3 className='font-medium text-blue-900 flex items-center'>
            <Info className='h-4 w-4 mr-2' />
            Tarifs suggérés en Suisse
          </h3>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            onClick={applySuggestedRates}
            className='text-blue-600 border-blue-300'
          >
            Appliquer
          </Button>
        </div>

        <div className='grid md:grid-cols-3 gap-4 text-sm'>
          {Object.entries(SUGGESTED_RATES).map(([type, rates]) => (
            <div
              key={type}
              className='bg-white rounded-lg p-3 border border-blue-100'
            >
              <h4 className='font-medium text-gray-900 mb-1'>
                {type === 'initial'
                  ? 'Initiale'
                  : type === 'follow_up'
                    ? 'Suivi'
                    : 'Express'}
              </h4>
              <p className='text-xs text-gray-600 mb-2'>{rates.description}</p>
              <div className='space-y-1'>
                <p>
                  Moyenne: <strong>CHF {rates.average}</strong>
                </p>
                <p className='text-xs text-gray-500'>
                  Fourchette: CHF {rates.min} - {rates.max}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Formulaire */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Consultation initiale */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Consultation initiale (CHF) *
          </label>
          <PriceInput
            value={watchedFields.initial}
            onChange={centimes =>
              setValue('initial', centimes, { shouldValidate: true })
            }
            min={50}
            max={500}
            className={errors.initial ? 'border-red-300' : ''}
          />
          {errors.initial && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.initial.message}
            </p>
          )}
          <p className='mt-1 text-sm text-gray-500'>
            Première consultation (60-90 minutes) - Anamnèse complète
          </p>
        </div>

        {/* Consultation de suivi */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Consultation de suivi (CHF) *
          </label>
          <PriceInput
            value={watchedFields.follow_up}
            onChange={centimes =>
              setValue('follow_up', centimes, { shouldValidate: true })
            }
            min={30}
            max={400}
            className={errors.follow_up ? 'border-red-300' : ''}
          />
          {errors.follow_up && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.follow_up.message}
            </p>
          )}
          <p className='mt-1 text-sm text-gray-500'>
            Consultation de suivi (45-60 minutes) - Ajustements et conseils
          </p>
        </div>

        {/* Consultation express */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Consultation express (CHF) *
          </label>
          <PriceInput
            value={watchedFields.express}
            onChange={centimes =>
              setValue('express', centimes, { shouldValidate: true })
            }
            min={20}
            max={300}
            className={errors.express ? 'border-red-300' : ''}
          />
          {errors.express && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.express.message}
            </p>
          )}
          <p className='mt-1 text-sm text-gray-500'>
            Consultation courte (15-30 minutes) - Questions ponctuelles
          </p>
        </div>

        {/* Estimation des revenus */}
        <motion.div
          className='bg-green-50 rounded-lg p-4 border border-green-200'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className='font-medium text-green-900 mb-2 flex items-center'>
            <Calculator className='h-4 w-4 mr-2' />
            Estimation du revenu mensuel
          </h3>
          <div className='text-2xl font-bold text-green-800 mb-2'>
            CHF{' '}
            {calculateMonthlyRevenue().toLocaleString('fr-CH', {
              minimumFractionDigits: 0,
            })}
          </div>
          <p className='text-sm text-green-700'>
            Basé sur: 8 consultations initiales, 20 suivis, 12 express par mois
          </p>
          <p className='text-xs text-green-600 mt-1'>
            Cette estimation est indicative et dépend de votre pratique réelle.
          </p>
        </motion.div>

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

      {/* Comparaison avec les tarifs moyens */}
      <motion.div
        className='grid md:grid-cols-3 gap-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {Object.entries(SUGGESTED_RATES).map(([type, rates]) => {
          const currentRate = centimesToChf(
            type === 'initial'
              ? watchedFields.initial
              : type === 'follow_up'
                ? watchedFields.follow_up
                : watchedFields.express
          );
          const difference = currentRate - rates.average;
          const percentDifference = Math.round(
            (difference / rates.average) * 100
          );

          return (
            <div
              key={type}
              className='text-center p-4 bg-white rounded-lg shadow-sm border'
            >
              <h4 className='font-medium text-gray-900 mb-2'>
                {type === 'initial'
                  ? 'Initiale'
                  : type === 'follow_up'
                    ? 'Suivi'
                    : 'Express'}
              </h4>
              <div className='text-lg font-bold text-gray-900 mb-1'>
                CHF {currentRate.toFixed(2)}
              </div>
              <div
                className={`text-sm flex items-center justify-center ${
                  difference > 0
                    ? 'text-green-600'
                    : difference < 0
                      ? 'text-red-600'
                      : 'text-gray-500'
                }`}
              >
                <TrendingUp
                  className={`h-3 w-3 mr-1 ${difference < 0 ? 'rotate-180' : ''}`}
                />
                {difference > 0 ? '+' : ''}
                {percentDifference}% vs moyenne
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ConsultationRatesStep;
