/**
 * Étape de finalisation pour l'onboarding des patients
 * Félicitations et présentation des prochaines étapes
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Heart,
  Calendar,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Star,
  Trophy,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { WizardTip } from '../../WizardLayout';
import { PatientOnboardingData } from '@/types/onboarding';

interface CompletionStepProps {
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
 * Prochaines étapes recommandées
 */
const NEXT_STEPS = [
  {
    icon: <Calendar className='h-6 w-6' />,
    title: 'Planifier votre première consultation',
    description: 'Rencontrez votre nutritionniste pour affiner votre plan',
    action: 'Réserver un créneau',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: <MessageSquare className='h-6 w-6' />,
    title: 'Commencer votre journal alimentaire',
    description: 'Enregistrez vos repas pour un suivi personnalisé',
    action: 'Ouvrir le journal',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: <BookOpen className='h-6 w-6' />,
    title: 'Explorer les ressources',
    description: 'Découvrez nos recettes et conseils nutritionnels',
    action: 'Parcourir',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

/**
 * Résumé du profil créé
 */
const getProfileSummary = (data: Partial<PatientOnboardingData>) => {
  const items = [];

  if (data.primaryGoals?.length) {
    items.push(
      `${data.primaryGoals.length} objectif${data.primaryGoals.length > 1 ? 's' : ''} principal${data.primaryGoals.length > 1 ? 'aux' : ''}`
    );
  }

  if (data.dietaryRestrictions?.length) {
    items.push(
      `${data.dietaryRestrictions.length} restriction${data.dietaryRestrictions.length > 1 ? 's' : ''} alimentaire${data.dietaryRestrictions.length > 1 ? 's' : ''}`
    );
  }

  if (data.allergies?.length) {
    items.push(
      `${data.allergies.length} allergie${data.allergies.length > 1 ? 's' : ''}`
    );
  }

  if (data.activityLevel) {
    const levelLabels = {
      sedentary: 'sédentaire',
      light: 'légèrement actif',
      moderate: 'modérément actif',
      active: 'actif',
      very_active: 'très actif',
    };
    items.push(
      `profil ${levelLabels[data.activityLevel as keyof typeof levelLabels]}`
    );
  }

  return items;
};

/**
 * Étape de finalisation
 */
export const CompletionStep: React.FC<CompletionStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
}) => {
  const profileSummary = getProfileSummary(data);

  const handleComplete = () => {
    // Marquer l'onboarding comme terminé
    onDataChange({
      ...data,
      onboardingCompletedAt: new Date().toISOString(),
      appTourCompleted: true,
    });

    onNext();
  };

  return (
    <div className='space-y-8'>
      {/* Animation de félicitations */}
      <motion.div
        className='text-center space-y-4'
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className='text-3xl font-bold text-gray-900'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Récapitulatif de votre profil, {data.firstName}
        </motion.h1>

        <motion.p
          className='text-lg text-gray-600 max-w-2xl mx-auto'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Voici un récapitulatif de toutes les informations que vous avez
          saisies lors de votre onboarding. Vous êtes prêt à commencer votre
          parcours !
        </motion.p>
      </motion.div>

      {/* Résumé du profil */}
      {profileSummary.length > 0 && (
        <motion.div
          className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className='flex items-start space-x-3'>
            <div className='p-2 bg-green-100 rounded-full'>
              <CheckCircle className='h-6 w-6 text-green-600' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-900 mb-2'>
                Informations enregistrées
              </h3>
              <div className='text-sm text-gray-700'>
                <p>Voici les informations que vous avez saisies :</p>
                <ul className='mt-2 space-y-1'>
                  {profileSummary.map((item, index) => (
                    <motion.li
                      key={index}
                      className='flex items-center space-x-2'
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <Star className='h-4 w-4 text-green-500 fill-current' />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Prochaines étapes */}
      <motion.div
        className='space-y-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h2 className='text-xl font-semibold text-gray-900 text-center'>
          Vos prochaines étapes
        </h2>

        <div className='space-y-3'>
          {NEXT_STEPS.map((step, index) => (
            <motion.div
              key={index}
              className='flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className='flex items-center space-x-4'>
                <div className={`p-3 rounded-full ${step.bgColor}`}>
                  <div className={step.color}>{step.icon}</div>
                </div>

                <div>
                  <h3 className='font-medium text-gray-900'>{step.title}</h3>
                  <p className='text-sm text-gray-600'>{step.description}</p>
                </div>
              </div>

              <Button variant='secondary' size='sm'>
                {step.action}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Message d'encouragement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
      >
        <WizardTip type='success' title='Vous êtes sur la bonne voie !'>
          <div className='space-y-2 text-sm'>
            <p>
              <strong>Bravo</strong> pour avoir pris cette décision importante
              pour votre santé. Notre équipe de nutritionnistes qualifiés est
              maintenant prête à vous accompagner.
            </p>
            <div className='flex items-center space-x-2 mt-3'>
              <Heart className='h-4 w-4 text-red-500' />
              <span className='text-gray-700'>
                Votre parcours vers une meilleure santé commence maintenant !
              </span>
            </div>
          </div>
        </WizardTip>
      </motion.div>

      {/* Boutons d'action */}
      <motion.div
        className='flex justify-between items-center pt-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
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
          onClick={handleComplete}
          disabled={isSubmitting}
          loading={isSubmitting}
          size='lg'
          className='flex items-center space-x-2 px-8'
        >
          <span>Accéder au tableau de bord</span>
          <ArrowRight className='h-5 w-5' />
        </Button>
      </motion.div>
    </div>
  );
};

export default CompletionStep;
