/**
 * Layout principal pour les assistants d'onboarding
 * Composant réutilisable qui gère la structure visuelle et la navigation
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StepIndicator } from './StepIndicator';
import { OnboardingStep, OnboardingProgress } from '@/types/onboarding';
import { StepTransition, AnimatedProgress } from './animations';
import { ProgressIllustration } from './illustrations';

interface WizardLayoutProps {
  /** Titre principal de l'assistant */
  title: string;
  /** Description optionnelle */
  description?: string;
  /** Étape actuelle */
  currentStep: OnboardingStep;
  /** Progression complète */
  progress: OnboardingProgress;
  /** Contenu de l'étape actuelle */
  children: React.ReactNode;
  /** Actions de navigation */
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  onClose?: () => void;
  onHelp?: () => void;
  onStepClick?: (step: OnboardingStep) => void;
  /** États de navigation */
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  canSkip?: boolean;
  /** États de chargement */
  isLoading?: boolean;
  isSubmitting?: boolean;
  /** Configuration de l'affichage */
  showStepIndicator?: boolean;
  showProgressBar?: boolean;
  compact?: boolean;
  /** Textes personnalisés pour les boutons */
  nextButtonText?: string;
  previousButtonText?: string;
  skipButtonText?: string;
}

/**
 * Animations pour les transitions d'étapes
 */
const stepTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

/**
 * Layout principal de l'assistant d'onboarding
 */
export const WizardLayout: React.FC<WizardLayoutProps> = ({
  title,
  description,
  currentStep,
  progress,
  children,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  onHelp,
  onStepClick,
  canGoNext = true,
  canGoPrevious = true,
  canSkip = false,
  isLoading = false,
  isSubmitting = false,
  showStepIndicator = true,
  showProgressBar = true,
  compact = false,
  nextButtonText = 'Suivant',
  previousButtonText = 'Précédent',
  skipButtonText = 'Passer',
}) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-background-accent to-secondary-pale dark:from-background-secondary dark:to-background-accent ${compact ? 'p-2' : 'p-4'}`}
    >
      <div className={`mx-auto ${compact ? 'max-w-4xl' : 'max-w-7xl'}`}>
        {/* En-tête avec titre et boutons d'action */}
        <div className='flex items-center justify-end mb-6'>
          <div className='flex items-center space-x-2'>
            {/* Bouton d'aide */}
            {onHelp && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onHelp}
                className='text-neutral-medium hover:text-neutral-dark dark:text-neutral-medium dark:hover:text-neutral-light'
              >
                <HelpCircle className='h-5 w-5' />
              </Button>
            )}

            {/* Bouton de fermeture */}
            {onClose && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onClose}
                className='text-neutral-medium hover:text-neutral-dark dark:text-neutral-medium dark:hover:text-neutral-light'
              >
                <X className='h-5 w-5' />
              </Button>
            )}
          </div>
        </div>

        {/* Indicateur de progression des étapes */}
        {showStepIndicator && (
          <div className='mb-8'>
            <StepIndicator
              currentStep={currentStep}
              progress={progress}
              showProgressBar={showProgressBar}
              compact={compact}
              onStepClick={onStepClick}
            />
          </div>
        )}

        {/* Contenu principal avec animation améliorée */}
        <Card
          className={`${compact ? 'min-h-[400px]' : 'min-h-[500px]'} shadow-lg`}
        >
          <CardContent className='p-8'>
            <StepTransition stepKey={currentStep} direction='forward'>
              {children}
            </StepTransition>
          </CardContent>
        </Card>

        {/* Navigation gérée par le contenu de chaque étape */}
      </div>
    </div>
  );
};

/**
 * Composant wrapper pour les étapes d'onboarding
 * Fournit une structure cohérente pour chaque étape
 */
interface WizardStepProps {
  /** Titre de l'étape */
  title: string;
  /** Description de l'étape */
  description?: string;
  /** Icône de l'étape */
  icon?: React.ReactNode;
  /** Contenu de l'étape */
  children: React.ReactNode;
  /** Classe CSS personnalisée */
  className?: string;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  title,
  description,
  icon,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête de l'étape */}
      <div className='text-center space-y-2'>
        <h2 className='text-h3 font-semibold text-neutral-dark dark:text-neutral-light'>
          {title}
        </h2>

        {description && (
          <p className='text-body text-neutral-medium dark:text-neutral-medium max-w-2xl mx-auto'>
            {description}
          </p>
        )}
      </div>

      {/* Contenu de l'étape */}
      <div className='max-w-4xl mx-auto'>{children}</div>
    </div>
  );
};

/**
 * Composant pour afficher des conseils ou informations supplémentaires
 */
interface WizardTipProps {
  /** Type de conseil */
  type?: 'info' | 'warning' | 'success' | 'tip';
  /** Titre du conseil */
  title?: string;
  /** Contenu du conseil */
  children: React.ReactNode;
  /** Affichage compact */
  compact?: boolean;
}

export const WizardTip: React.FC<WizardTipProps> = ({
  type = 'info',
  title,
  children,
  compact = false,
}) => {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    tip: 'bg-purple-50 border-purple-200 text-purple-800',
  };

  return (
    <div
      className={`border rounded-lg ${compact ? 'p-3' : 'p-4'} ${typeStyles[type]}`}
    >
      {title && <h4 className='font-medium mb-2'>{title}</h4>}
      <div className={`${compact ? 'text-sm' : ''}`}>{children}</div>
    </div>
  );
};

export default WizardLayout;
