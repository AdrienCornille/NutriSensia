/**
 * Étape de la raison de consultation pour l'onboarding des patients
 * AUTH-004: Permet d'indiquer la raison principale de la consultation
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import {
  MessageCircle,
  Flame,
  Scale,
  Stethoscope,
  Heart,
  Zap,
  Clock,
  Sparkles,
  Salad,
  HelpCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { WizardTip } from '../../WizardLayout';
import { PatientOnboardingData } from '@/types/onboarding';

/**
 * Raisons de consultation disponibles (synchronisé avec l'API)
 */
export const CONSULTATION_REASONS = [
  {
    id: 'menopause_perimenopause',
    label: 'Ménopause / Périménopause',
    description: 'Accompagnement nutritionnel pendant cette transition',
    icon: <Flame className='h-5 w-5' />,
    color: 'border-pink-200 bg-pink-50 text-pink-700',
  },
  {
    id: 'perte_poids_durable',
    label: 'Perte de poids durable',
    description: 'Atteindre et maintenir un poids santé',
    icon: <Scale className='h-5 w-5' />,
    color: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  {
    id: 'troubles_digestifs',
    label: 'Troubles digestifs',
    description: 'Ballonnements, inconfort, intolérances',
    icon: <Stethoscope className='h-5 w-5' />,
    color: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    id: 'glycemie_diabete',
    label: 'Glycémie / Diabète',
    description: 'Équilibrer sa glycémie naturellement',
    icon: <Heart className='h-5 w-5' />,
    color: 'border-red-200 bg-red-50 text-red-700',
  },
  {
    id: 'sante_cardiovasculaire',
    label: 'Santé cardiovasculaire',
    description: 'Cholestérol, tension, prévention',
    icon: <Heart className='h-5 w-5' />,
    color: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  {
    id: 'fatigue_energie',
    label: 'Fatigue / Énergie',
    description: 'Retrouver vitalité et dynamisme',
    icon: <Zap className='h-5 w-5' />,
    color: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  },
  {
    id: 'longevite_vieillissement',
    label: 'Longévité / Anti-âge',
    description: 'Vieillir en bonne santé',
    icon: <Clock className='h-5 w-5' />,
    color: 'border-purple-200 bg-purple-50 text-purple-700',
  },
  {
    id: 'sante_hormonale',
    label: 'Santé hormonale',
    description: 'Équilibrer ses hormones naturellement',
    icon: <Sparkles className='h-5 w-5' />,
    color: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  {
    id: 'alimentation_saine',
    label: 'Alimentation saine',
    description: 'Apprendre à mieux manger au quotidien',
    icon: <Salad className='h-5 w-5' />,
    color: 'border-green-200 bg-green-50 text-green-700',
  },
  {
    id: 'autre',
    label: 'Autre raison',
    description: 'Précisez votre besoin ci-dessous',
    icon: <HelpCircle className='h-5 w-5' />,
    color: 'border-gray-200 bg-gray-50 text-gray-700',
  },
] as const;

export type ConsultationReasonId = (typeof CONSULTATION_REASONS)[number]['id'];

/**
 * Schéma de validation pour cette étape
 */
const consultationReasonSchema = z.object({
  consultationReason: z
    .enum([
      'menopause_perimenopause',
      'perte_poids_durable',
      'troubles_digestifs',
      'glycemie_diabete',
      'sante_cardiovasculaire',
      'fatigue_energie',
      'longevite_vieillissement',
      'sante_hormonale',
      'alimentation_saine',
      'autre',
    ])
    .optional(),
  consultationReasonDetails: z.string().max(500).optional(),
});

type ConsultationReasonFormData = z.infer<typeof consultationReasonSchema>;

interface ConsultationReasonStepProps {
  /** Données actuelles */
  data: Partial<PatientOnboardingData>;
  /** Callback de mise à jour des données */
  onDataChange: (data: Partial<PatientOnboardingData>) => void;
  /** Callback pour passer à l'étape suivante */
  onNext: () => void;
  /** Callback pour revenir à l'étape précédente */
  onPrev?: () => void;
  /** Première étape ? */
  isFirstStep?: boolean;
  /** Dernière étape ? */
  isLastStep?: boolean;
  /** État de soumission */
  isSubmitting?: boolean;
}

/**
 * Étape de sélection de la raison de consultation
 */
export const ConsultationReasonStep: React.FC<ConsultationReasonStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrev,
  isFirstStep = false,
  isSubmitting = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<
    ConsultationReasonId | undefined
  >((data as any).consultationReason);

  // Configuration du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ConsultationReasonFormData>({
    resolver: zodResolver(consultationReasonSchema),
    defaultValues: {
      consultationReason: (data as any).consultationReason,
      consultationReasonDetails: (data as any).consultationReasonDetails || '',
    },
    mode: 'onChange',
  });

  /**
   * Gérer la sélection d'une raison
   */
  const handleReasonSelect = (reasonId: ConsultationReasonId) => {
    setSelectedReason(reasonId);
    setValue('consultationReason', reasonId);
  };

  /**
   * Gérer la soumission du formulaire
   */
  const onSubmit = (formData: ConsultationReasonFormData) => {
    onDataChange({
      ...data,
      consultationReason: formData.consultationReason,
      consultationReasonDetails: formData.consultationReasonDetails,
    } as any);
    onNext();
  };

  /**
   * Passer cette étape
   */
  const handleSkip = () => {
    onNext();
  };

  const showDetailsField = selectedReason === 'autre' || selectedReason;

  return (
    <div className='space-y-6'>
      {/* En-tête */}
      <motion.div
        className='text-center space-y-2'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className='mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-green-600 rounded-full flex items-center justify-center mb-4'>
          <MessageCircle className='h-8 w-8 text-white' />
        </div>

        <h1 className='text-3xl font-bold text-gray-900'>
          Quelle est votre raison de consultation ?
        </h1>

        <p className='text-gray-600'>
          Cette information aidera votre nutritionniste à préparer votre
          première rencontre
        </p>
      </motion.div>

      {/* Formulaire */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Grille des raisons */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Choisissez votre raison principale (optionnel)
          </h3>

          <div className='grid md:grid-cols-2 gap-3'>
            {CONSULTATION_REASONS.map(reason => (
              <motion.button
                key={reason.id}
                type='button'
                onClick={() => handleReasonSelect(reason.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedReason === reason.id
                    ? `border-green-500 ${reason.color}`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className='flex items-start space-x-3'>
                  <div className='mt-1'>{reason.icon}</div>
                  <div>
                    <div className='font-medium'>{reason.label}</div>
                    <div className='text-sm opacity-75'>
                      {reason.description}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Champ de détails (optionnel) */}
        {showDetailsField && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className='space-y-2'
          >
            <label className='block text-sm font-medium text-gray-700'>
              {selectedReason === 'autre'
                ? 'Précisez votre raison de consultation'
                : 'Détails supplémentaires (optionnel)'}
            </label>
            <textarea
              {...register('consultationReasonDetails')}
              placeholder='Décrivez brièvement votre situation ou vos attentes...'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none'
              rows={3}
              maxLength={500}
            />
            <div className='text-xs text-gray-500 text-right'>
              {watch('consultationReasonDetails')?.length || 0} / 500 caractères
            </div>
            {errors.consultationReasonDetails && (
              <p className='text-sm text-red-600'>
                {errors.consultationReasonDetails.message}
              </p>
            )}
          </motion.div>
        )}

        {/* Conseil */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <WizardTip type='info' title='Pourquoi cette question ?'>
            <p className='text-sm'>
              Connaître votre raison de consultation permet à votre
              nutritionniste de mieux préparer votre première rencontre et de
              vous proposer un accompagnement adapté à vos besoins spécifiques.
            </p>
          </WizardTip>
        </motion.div>

        {/* Boutons de navigation */}
        <motion.div
          className='flex justify-between pt-6'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {!isFirstStep && onPrev ? (
            <Button
              type='button'
              variant='secondary'
              onClick={onPrev}
              disabled={isSubmitting}
            >
              Retour
            </Button>
          ) : (
            <div />
          )}

          <div className='flex gap-3'>
            <Button
              type='button'
              variant='ghost'
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Passer cette étape
            </Button>

            <Button
              type='submit'
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Continuer
            </Button>
          </div>
        </motion.div>
      </motion.form>

      {/* Indicateur de progression */}
      <motion.div
        className='mt-8 text-center text-sm text-gray-500'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <p>Étape 2 sur 10 - Cette étape est optionnelle</p>

        {/* Barre de progression */}
        <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
          <motion.div
            className='bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full'
            initial={{ width: '10%' }}
            animate={{ width: '20%' }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ConsultationReasonStep;
