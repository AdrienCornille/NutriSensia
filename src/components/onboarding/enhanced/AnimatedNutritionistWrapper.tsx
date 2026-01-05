/**
 * Wrapper animé pour l'onboarding nutritionniste
 * Ajoute les éléments visuels sans modifier la logique existante
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, HelpCircle } from 'lucide-react';

// Imports des composants visuels
import {
  NutritionistWelcomeIllustration,
  ProgressIllustration,
  SuccessIllustration,
} from '../illustrations';
import { AnimatedButton, staggerContainer, staggerItem } from '../animations';
import { SimpleTour, useSimpleTour, TourHelpButton } from '../tours';

// Import du wizard existant
import { NutritionistOnboardingWizard } from '../nutritionist/NutritionistOnboardingWizard';
import { NutritionistOnboardingData } from '@/types/onboarding';

interface AnimatedNutritionistWrapperProps {
  userId: string;
  onClose?: () => void;
  onComplete?: (data: NutritionistOnboardingData) => Promise<void>;
  onProgressSave?: (data: Partial<NutritionistOnboardingData>) => Promise<void>;
  initialData?: Partial<NutritionistOnboardingData>;
  compact?: boolean;
  onProgressUpdate?: (
    completionPercentage: number,
    isCompleted: boolean
  ) => void;
}

export const AnimatedNutritionistWrapper: React.FC<
  AnimatedNutritionistWrapperProps
> = ({
  userId,
  onClose,
  onComplete,
  onProgressSave,
  initialData = {},
  compact = false,
  onProgressUpdate,
}) => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] =
    useState<NutritionistOnboardingData | null>(null);

  // État local pour la progression (sera mis à jour par le wizard)
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProgressLoading, setIsProgressLoading] = useState(true);

  // Hook pour le tour guidé
  const {
    isActive: isTourActive,
    startTour,
    completeTour,
    skipTour,
    hasCompletedTour,
  } = useSimpleTour('nutritionist');

  // Fonction pour recevoir les mises à jour de progression du wizard
  const handleProgressUpdate = (
    newCompletionPercentage: number,
    newIsCompleted: boolean
  ) => {
    setCompletionPercentage(newCompletionPercentage);
    setIsCompleted(newIsCompleted);
    setIsProgressLoading(false);

    // Appeler le callback parent si fourni
    if (onProgressUpdate) {
      onProgressUpdate(newCompletionPercentage, newIsCompleted);
    }
  };

  // Démarrer le tour guidé après le premier rendu
  useEffect(() => {
    if (!hasCompletedTour && !showWelcome) {
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour, showWelcome, startTour]);

  // Gérer la completion automatique basée sur la progression
  useEffect(() => {
    if (isCompleted && !showCompletion && !showWelcome) {
      setShowCompletion(true);
    }
  }, [isCompleted, showCompletion, showWelcome]);

  /**
   * Gestion du démarrage de l'onboarding
   */
  const handleStartOnboarding = () => {
    setShowWelcome(false);
  };

  /**
   * Gestion de la completion avec célébration
   */
  const handleOnboardingComplete = async (data: NutritionistOnboardingData) => {
    setCompletionData(data);
    setShowCompletion(true);

    if (onComplete) {
      await onComplete(data);
    }
  };

  // Écran de bienvenue avec illustration
  if (showWelcome) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50'>
        <div className='onboarding-welcome flex items-center justify-center min-h-screen p-4'>
          <motion.div
            className='max-w-4xl mx-auto text-center'
            variants={staggerContainer}
            initial='initial'
            animate='animate'
          >
            {/* Illustration principale */}
            <motion.div className='mb-8' variants={staggerItem}>
              <NutritionistWelcomeIllustration
                className='w-80 h-80 mx-auto'
                animate={true}
              />
            </motion.div>

            {/* Titre et description */}
            <motion.div className='mb-8 space-y-4' variants={staggerItem}>
              <h1 className='text-4xl font-bold text-gray-800 flex items-center justify-center gap-3'>
                <Sparkles className='h-10 w-10 text-yellow-500' />
                Bienvenue dans NutriSensia !
              </h1>
              <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
                Créons ensemble votre profil professionnel pour vous connecter
                avec vos futurs patients. Ce parcours ne prendra que quelques
                minutes.
              </p>
            </motion.div>

            {/* Informations sur le parcours */}
            <motion.div className='mb-8' variants={staggerItem}>
              <div className='bg-white rounded-2xl p-6 shadow-lg inline-block'>
                <div className='flex items-center justify-center space-x-8'>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-blue-600'>7</div>
                    <div className='text-sm text-gray-500'>Étapes</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-green-600'>~15</div>
                    <div className='text-sm text-gray-500'>Minutes</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl'>🎯</div>
                    <div className='text-sm text-gray-500'>Personnalisé</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bouton de démarrage */}
            <motion.div variants={staggerItem}>
              <AnimatedButton
                onClick={handleStartOnboarding}
                variant='primary'
                className='px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700'
              >
                <span className='flex items-center space-x-2'>
                  <span>Commencer mon parcours</span>
                  <Sparkles className='h-5 w-5' />
                </span>
              </AnimatedButton>

              <div className='mt-4 text-sm text-gray-500'>
                Vous pourrez sauvegarder et reprendre à tout moment
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Écran de fin avec célébration
  if (showCompletion && completionData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center relative overflow-hidden'>
        {/* Confettis d'arrière-plan sans modale */}
        <div className='fixed inset-0 pointer-events-none z-10'>
          {[...Array(20)].map((_, i) => {
            const colors = [
              '#F59E0B',
              '#EF4444',
              '#3B82F6',
              '#10B981',
              '#8B5CF6',
            ];
            const color = colors[i % colors.length];

            return (
              <motion.div
                key={i}
                className='absolute w-3 h-3 rounded-full opacity-70'
                style={{ backgroundColor: color }}
                initial={{
                  x: '50vw',
                  y: '50vh',
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: '100vh',
                  scale: [0, 1, 0],
                  rotate: 360 * 2,
                }}
                transition={{
                  duration: 4,
                  ease: 'easeOut',
                  delay: i * 0.1,
                }}
              />
            );
          })}
        </div>

        <motion.div
          className='max-w-2xl mx-auto text-center p-8 relative z-20'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Illustration de succès */}
          <div className='mb-8'>
            <SuccessIllustration className='w-64 h-64 mx-auto' animate={true} />
          </div>

          {/* Message de félicitations */}
          <h1 className='text-4xl font-bold text-gray-800 mb-4'>
            Félicitations ! 🎉
          </h1>
          <p className='text-xl text-gray-600 mb-8'>
            Votre profil professionnel est maintenant configuré. Vous pouvez
            commencer à recevoir des demandes de patients.
          </p>

          {/* Boutons d'action */}
          <div className='space-y-4'>
            <AnimatedButton
              onClick={() => (window.location.href = '/dashboard')}
              variant='primary'
              className='px-8 py-4 text-lg'
            >
              Accéder à mon tableau de bord
            </AnimatedButton>

            <AnimatedButton
              onClick={() => (window.location.href = '/profile')}
              variant='secondary'
              className='px-6 py-3 ml-4'
            >
              Voir mon profil
            </AnimatedButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // Assistant d'onboarding principal avec éléments visuels
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative'>
      {/* Indicateur de progression global */}
      <motion.div
        className='onboarding-progress fixed top-4 right-4 z-40'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className='bg-white rounded-2xl p-4 shadow-lg'>
          <div className='flex items-center space-x-3'>
            <ProgressIllustration
              progress={completionPercentage || 0} // Progression réelle depuis Supabase
              className='w-16 h-16'
            />
            <div>
              <div className='text-sm font-medium text-gray-700'>
                Progression
              </div>
              <div className='text-xs text-gray-500'>
                {isProgressLoading
                  ? 'Chargement...'
                  : `${Math.round(completionPercentage || 0)}% terminé`}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assistant principal avec transition */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <NutritionistOnboardingWizard
          userId={userId}
          onClose={onClose}
          onComplete={handleOnboardingComplete}
          onProgressSave={onProgressSave}
          onProgressUpdate={handleProgressUpdate}
          initialData={initialData}
          compact={compact}
        />
      </motion.div>

      {/* Tour guidé */}
      <SimpleTour
        steps={[
          {
            target: '.onboarding-welcome',
            title: 'Bienvenue ! 👋',
            content:
              'Ce tour vous guidera à travers toutes les étapes pour configurer votre profil professionnel.',
            placement: 'center',
          },
          {
            target: '.onboarding-progress',
            title: 'Suivi de progression',
            content:
              "Suivez votre progression ici. Chaque étape complétée vous rapproche de l'activation de votre compte.",
            placement: 'left', // Changé de 'bottom' à 'left' pour éviter le débordement
          },
          {
            target: '.wizard-step',
            title: "Étapes d'onboarding",
            content:
              'Complétez chaque étape pour configurer votre profil professionnel.',
            placement: 'center', // Changé de 'right' à 'center' pour plus de sécurité
          },
        ]}
        isActive={isTourActive}
        onComplete={completeTour}
        onSkip={skipTour}
      />

      {/* Bouton d'aide pour relancer le tour */}
      {!isTourActive && hasCompletedTour && (
        <TourHelpButton onClick={startTour} />
      )}
    </div>
  );
};
