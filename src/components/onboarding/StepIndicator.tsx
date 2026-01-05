/**
 * Indicateur de progression des étapes d'onboarding
 * Affiche visuellement la progression et permet la navigation entre les étapes
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, ChevronRight } from 'lucide-react';
import {
  OnboardingStep,
  OnboardingProgress,
  StepStatus,
} from '@/types/onboarding';

interface StepIndicatorProps {
  /** Étape actuelle */
  currentStep: OnboardingStep;
  /** Progression complète */
  progress: OnboardingProgress;
  /** Afficher la barre de progression */
  showProgressBar?: boolean;
  /** Navigation cliquable vers les étapes */
  allowNavigation?: boolean;
  /** Callback de navigation */
  onStepClick?: (step: OnboardingStep) => void;
  /** Affichage compact */
  compact?: boolean;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Configuration des icônes par statut d'étape
 */
const getStepIcon = (status: StepStatus, isActive: boolean) => {
  switch (status) {
    case 'completed':
      return <Check className='h-4 w-4' />;
    case 'in-progress':
      return isActive ? (
        <Circle className='h-4 w-4 animate-pulse' />
      ) : (
        <Circle className='h-4 w-4' />
      );
    case 'skipped':
      return <ChevronRight className='h-4 w-4' />;
    default:
      return <Circle className='h-4 w-4' />;
  }
};

/**
 * Configuration des styles par statut d'étape
 */
const getStepStyles = (status: StepStatus, isActive: boolean) => {
  if (isActive) {
    return {
      circle: 'bg-green-500 text-white border-green-500',
      text: 'text-green-600 font-medium',
      connector: 'bg-green-200',
    };
  }

  switch (status) {
    case 'completed':
      return {
        circle: 'bg-green-600 text-white border-green-600',
        text: 'text-green-600',
        connector: 'bg-green-200',
      };
    case 'in-progress':
      return {
        circle: 'bg-green-100 text-green-600 border-green-300',
        text: 'text-green-600',
        connector: 'bg-green-200',
      };
    case 'skipped':
      return {
        circle: 'bg-gray-300 text-gray-500 border-gray-300',
        text: 'text-gray-500',
        connector: 'bg-gray-200',
      };
    default:
      return {
        circle: 'bg-white text-gray-400 border-gray-300',
        text: 'text-gray-400',
        connector: 'bg-gray-200',
      };
  }
};

/**
 * Composant d'une étape individuelle
 */
interface StepItemProps {
  step: string;
  stepInfo: any;
  isActive: boolean;
  isLast: boolean;
  compact: boolean;
  allowNavigation: boolean;
  orientation: 'horizontal' | 'vertical';
  onClick?: () => void;
}

const StepItem: React.FC<StepItemProps> = ({
  step,
  stepInfo,
  isActive,
  isLast,
  compact,
  allowNavigation,
  orientation,
  onClick,
}) => {
  const styles = getStepStyles(stepInfo.status, isActive);
  const icon = getStepIcon(stepInfo.status, isActive);
  const isClickable =
    allowNavigation && onClick && stepInfo.status === 'completed';

  return (
    <div
      className={`flex ${orientation === 'vertical' ? 'flex-col' : 'items-center'}`}
    >
      {/* Étape */}
      <div
        className={`flex ${orientation === 'vertical' ? 'flex-row items-center' : 'flex-col items-center'} ${orientation === 'vertical' ? 'mb-4' : ''}`}
      >
        {/* Cercle avec icône */}
        <motion.button
          className={`
            relative flex items-center justify-center
            ${compact ? 'h-8 w-8' : 'h-10 w-10'}
            rounded-full border-2 transition-all duration-200
            ${styles.circle}
            ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
            ${isActive ? 'shadow-lg' : ''}
          `}
          onClick={isClickable ? onClick : undefined}
          disabled={!isClickable}
          whileHover={isClickable ? { scale: 1.1 } : {}}
          whileTap={isClickable ? { scale: 0.95 } : {}}
        >
          {icon}

          {/* Indicateur d'étape active */}
          {isActive && (
            <motion.div
              className='absolute -inset-1 rounded-full border-2 border-green-400 opacity-75'
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>

        {/* Texte de l'étape */}
        {!compact && (
          <div
            className={`
            ${orientation === 'vertical' ? 'ml-3' : 'mt-2'}
            text-center
          `}
          >
            <p
              className={`text-sm ${styles.text} ${orientation === 'vertical' ? 'text-left' : ''}`}
            >
              {stepInfo.title}
            </p>
          </div>
        )}
      </div>

      {/* Connecteur vers l'étape suivante - supprimé car on utilise justify-between */}
    </div>
  );
};

/**
 * Composant principal de l'indicateur d'étapes
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  progress,
  showProgressBar = true,
  allowNavigation = true,
  onStepClick,
  compact = false,
  orientation = 'horizontal',
}) => {
  // Vérification de sécurité pour progress
  if (!progress || !progress.steps) {
    return (
      <div className='space-y-4'>
        <div className='text-center text-sm text-gray-500'>
          Chargement de la progression...
        </div>
      </div>
    );
  }

  // Convertir les étapes en tableau ordonné
  const orderedSteps = Object.entries(progress.steps).sort(([, a], [, b]) => {
    // Tri basé sur l'ordre logique des étapes
    const stepOrder = [
      'welcome',
      'personal-info',
      'credentials',
      'practice-details',
      'specializations',
      'consultation-rates',
      'platform-training',
      'health-goals',
      'dietary-restrictions',
      'measurements',
      'activity-level',
      'app-tour',
      'system-overview',
      'user-management',
      'analytics-setup',
      'security-config',
      'completion',
    ];

    return stepOrder.indexOf(a.id) - stepOrder.indexOf(b.id);
  });

  const handleStepClick = (step: string) => {
    if (onStepClick) {
      onStepClick(step as OnboardingStep);
    }
  };

  // Debug supprimé pour éviter les warnings React

  return (
    <div className='space-y-4'>
      {/* Liste des étapes */}
      <div
        className={`
        flex
        ${orientation === 'vertical' ? 'flex-col' : 'flex-row justify-between'}
        ${orientation === 'vertical' ? 'space-y-0' : ''}
        w-full
      `}
      >
        {orderedSteps.map(([stepId, stepInfo], index) => (
          <StepItem
            key={stepId}
            step={stepId}
            stepInfo={stepInfo}
            isActive={stepId === currentStep}
            isLast={index === orderedSteps.length - 1}
            compact={compact}
            allowNavigation={allowNavigation}
            orientation={orientation}
            onClick={() => handleStepClick(stepId)}
          />
        ))}
      </div>

      {/* Barre de progression globale */}
      {showProgressBar && (
        <div className='space-y-2'>
          <div className='flex justify-between text-sm text-gray-600'>
            <span>Progression</span>
            <span>{Math.round(progress.completionPercentage)}%</span>
          </div>

          <div className='w-full bg-gray-200 rounded-full h-2'>
            <motion.div
              className='bg-green-500 h-2 rounded-full'
              initial={{ width: 0 }}
              animate={{ width: `${progress.completionPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StepIndicator;
