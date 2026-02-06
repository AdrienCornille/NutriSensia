/**
 * Système de tours guidés pour l'onboarding avec react-joyride
 * Tours personnalisés pour chaque rôle d'utilisateur
 */

'use client';

import React, { useState, useCallback } from 'react';
import Joyride from './JoyrideWrapper';

// Définition locale des types pour éviter l'import statique de react-joyride
// qui cause des erreurs avec Next.js 15 (APIs React deprecated)
interface Step {
  target: string;
  content: React.ReactNode;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
}

interface CallBackProps {
  action: string;
  index: number;
  status: string;
  type: string;
}

interface TooltipRenderProps {
  backProps: any;
  closeProps: any;
  continuous: boolean;
  index: number;
  primaryProps: any;
  skipProps: any;
  step: Step;
  tooltipProps: any;
  size: number;
}

interface Styles {
  options?: any;
  tooltip?: any;
  tooltipContainer?: any;
  tooltipTitle?: any;
  tooltipContent?: any;
  buttonNext?: any;
  buttonBack?: any;
  buttonSkip?: any;
  buttonClose?: any;
}

// Constantes locales pour éviter l'import de react-joyride
const STATUS = {
  FINISHED: 'finished',
  SKIPPED: 'skipped',
  RUNNING: 'running',
  PAUSED: 'paused',
  READY: 'ready',
  WAITING: 'waiting',
  IDLE: 'idle',
  ERROR: 'error',
} as const;

const EVENTS = {
  STEP_AFTER: 'step:after',
  STEP_BEFORE: 'step:before',
  TARGET_NOT_FOUND: 'target:not_found',
  TOUR_END: 'tour:end',
  TOUR_START: 'tour:start',
  TOUR_STATUS: 'tour:status',
  BEACON: 'beacon',
  TOOLTIP: 'tooltip',
  TOOLTIP_CLOSE: 'close',
  SPOTLIGHT: 'spotlight',
  OVERLAY: 'overlay',
  ERROR: 'error',
} as const;

const ACTIONS = {
  INIT: 'init',
  START: 'start',
  STOP: 'stop',
  RESET: 'reset',
  RESTART: 'restart',
  PREV: 'prev',
  NEXT: 'next',
  GO: 'go',
  CLOSE: 'close',
  SKIP: 'skip',
  UPDATE: 'update',
} as const;
import { motion } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

/**
 * Interface pour les props du tour guidé
 */
interface OnboardingTourProps {
  role: 'nutritionist' | 'patient';
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Styles personnalisés pour les tooltips
 */
const tourStyles: Partial<Styles> = {
  options: {
    arrowColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    overlayColor: 'rgba(0, 0, 0, 0.4)',
    primaryColor: '#3B82F6',
    textColor: '#374151',
    width: 350,
    zIndex: 1000,
  },
  tooltip: {
    borderRadius: '12px',
    boxShadow:
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '20px',
  },
  tooltipContainer: {
    textAlign: 'left' as const,
  },
  tooltipTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1F2937',
  },
  tooltipContent: {
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '16px',
    color: '#6B7280',
  },
  buttonNext: {
    backgroundColor: '#3B82F6',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '500',
    padding: '10px 16px',
    border: 'none',
    cursor: 'pointer',
  },
  buttonBack: {
    backgroundColor: 'transparent',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    color: '#6B7280',
    fontSize: '14px',
    fontWeight: '500',
    padding: '10px 16px',
    cursor: 'pointer',
    marginRight: '8px',
  },
  buttonSkip: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  buttonClose: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    padding: '4px',
    position: 'absolute' as const,
    right: '12px',
    top: '12px',
  },
};

/**
 * Étapes du tour pour les nutritionnistes
 */
const nutritionistSteps: Step[] = [
  {
    target: '.onboarding-welcome',
    content:
      "Bienvenue dans votre parcours d'onboarding ! Ce tour vous guidera à travers toutes les étapes pour configurer votre profil professionnel.",
    title: 'Bienvenue ! 👋',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.onboarding-progress',
    content:
      "Suivez votre progression ici. Chaque étape complétée vous rapproche de l'activation de votre compte professionnel.",
    title: 'Suivi de progression',
    placement: 'bottom',
  },
  {
    target: '.onboarding-personal-info',
    content:
      'Commencez par renseigner vos informations personnelles de base. Ces informations seront visibles sur votre profil public.',
    title: 'Informations personnelles',
    placement: 'right',
  },
  {
    target: '.onboarding-credentials',
    content:
      'Vos identifiants professionnels (ASCA, RME, EAN) sont essentiels pour valider votre statut de professionnel de santé.',
    title: 'Identifiants professionnels',
    placement: 'right',
  },
  {
    target: '.onboarding-practice-details',
    content:
      'Configurez les détails de votre cabinet : adresse, tarifs, types de consultations et langues parlées.',
    title: 'Détails du cabinet',
    placement: 'right',
  },
  {
    target: '.onboarding-specializations',
    content:
      'Mettez en avant vos spécialisations et votre expérience pour attirer les patients qui correspondent à votre expertise.',
    title: 'Spécialisations',
    placement: 'right',
  },
  {
    target: '.onboarding-platform-training',
    content:
      'Découvrez les fonctionnalités de la plateforme qui vous aideront à gérer vos patients et consultations.',
    title: 'Formation plateforme',
    placement: 'right',
  },
  {
    target: '.onboarding-navigation',
    content:
      'Utilisez ces boutons pour naviguer entre les étapes. Vous pouvez revenir en arrière à tout moment.',
    title: 'Navigation',
    placement: 'top',
  },
  {
    target: '.onboarding-help',
    content:
      "Besoin d'aide ? Cliquez ici à tout moment pour obtenir de l'assistance ou des explications supplémentaires.",
    title: 'Aide disponible',
    placement: 'left',
  },
];

/**
 * Étapes du tour pour les patients
 */
const patientSteps: Step[] = [
  {
    target: '.onboarding-welcome',
    content:
      'Bienvenue ! Ce parcours vous aidera à configurer votre profil pour recevoir des conseils nutritionnels personnalisés.',
    title: 'Bienvenue ! 🌟',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.onboarding-progress',
    content:
      "Votre progression s'affiche ici. Plus vous complétez d'informations, plus vos recommandations seront précises.",
    title: 'Suivi de progression',
    placement: 'bottom',
  },
  {
    target: '.onboarding-personal-info',
    content:
      'Commencez par vos informations de base. Ces données nous aident à personnaliser votre expérience.',
    title: 'Vos informations',
    placement: 'right',
  },
  {
    target: '.onboarding-health-profile',
    content:
      'Votre profil santé nous permet de comprendre votre situation actuelle et vos besoins spécifiques.',
    title: 'Profil santé',
    placement: 'right',
  },
  {
    target: '.onboarding-health-goals',
    content:
      'Définissez vos objectifs santé pour que nous puissions vous proposer un accompagnement adapté.',
    title: 'Objectifs santé',
    placement: 'right',
  },
  {
    target: '.onboarding-dietary-info',
    content:
      'Vos habitudes alimentaires actuelles nous aident à créer des recommandations réalistes et durables.',
    title: 'Habitudes alimentaires',
    placement: 'right',
  },
  {
    target: '.onboarding-app-tour',
    content:
      'Découvrez les fonctionnalités qui vous accompagneront dans votre parcours santé au quotidien.',
    title: "Découverte de l'app",
    placement: 'right',
  },
  {
    target: '.onboarding-navigation',
    content:
      'Naviguez facilement entre les étapes avec ces boutons. Prenez votre temps !',
    title: 'Navigation',
    placement: 'top',
  },
];

/**
 * Composant de tooltip personnalisé
 */
const CustomTooltip: React.FC<TooltipRenderProps> = ({
  backProps,
  closeProps,
  continuous,
  index,
  primaryProps,
  skipProps,
  step,
  tooltipProps,
  size,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className='bg-white rounded-xl shadow-2xl p-6 max-w-sm'
      {...tooltipProps}
    >
      {/* Close button */}
      <motion.button
        className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        {...closeProps}
      >
        <X size={18} />
      </motion.button>

      {/* Title */}
      {step.title && (
        <h3 className='text-lg font-semibold text-gray-800 mb-3 pr-6'>
          {step.title}
        </h3>
      )}

      {/* Content */}
      <div className='text-gray-600 text-sm leading-relaxed mb-6'>
        {step.content}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between'>
        {/* Step indicator */}
        <div className='flex items-center space-x-2'>
          <span className='text-xs text-gray-400'>
            Étape {index + 1} sur {size}
          </span>
          <div className='flex space-x-1'>
            {Array.from({ length: size }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= index ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex items-center space-x-2'>
          {/* Skip button */}
          {!continuous && (
            <motion.button
              className='text-gray-400 hover:text-gray-600 text-sm transition-colors flex items-center space-x-1'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              {...skipProps}
            >
              <SkipForward size={14} />
              <span>{skipProps.title}</span>
            </motion.button>
          )}

          {/* Back button */}
          {index > 0 && (
            <motion.button
              className='flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              {...backProps}
            >
              <ArrowLeft size={16} />
              <span>{backProps.title}</span>
            </motion.button>
          )}

          {/* Next/Finish button */}
          {continuous && (
            <motion.button
              className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              {...primaryProps}
            >
              <span>{primaryProps.title}</span>
              {index < size - 1 && <ArrowRight size={16} />}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Composant principal du tour guidé d'onboarding
 */
export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  role,
  isActive,
  onComplete,
  onSkip,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = role === 'nutritionist' ? nutritionistSteps : patientSteps;

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { action, index, status, type } = data;

      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        // Mettre à jour l'index de l'étape
        setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
      } else if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        // Tour terminé ou ignoré
        if (status === STATUS.FINISHED) {
          onComplete();
        } else {
          onSkip();
        }
      }
    },
    [onComplete, onSkip]
  );

  if (!isActive) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={isActive}
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      continuous={true}
      showProgress={false}
      showSkipButton={true}
      styles={tourStyles}
      tooltipComponent={CustomTooltip}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        skip: 'Passer le tour',
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          floater: {
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
          },
        },
      }}
      spotlightClicks={true}
      disableOverlayClose={false}
      hideCloseButton={false}
      scrollToFirstStep={true}
      spotlightPadding={4}
    />
  );
};

/**
 * Hook pour gérer l'état du tour guidé
 */
export const useOnboardingTour = () => {
  const [isActive, setIsActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('onboarding-tour-completed') === 'true';
    }
    return false;
  });

  const startTour = useCallback(() => {
    setIsActive(true);
  }, []);

  const completeTour = useCallback(() => {
    setIsActive(false);
    setHasCompletedTour(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding-tour-completed', 'true');
    }
  }, []);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setHasCompletedTour(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding-tour-skipped', 'true');
    }
  }, []);

  const resetTour = useCallback(() => {
    setIsActive(false);
    setHasCompletedTour(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding-tour-completed');
      localStorage.removeItem('onboarding-tour-skipped');
    }
  }, []);

  return {
    isActive,
    hasCompletedTour,
    startTour,
    completeTour,
    skipTour,
    resetTour,
  };
};
