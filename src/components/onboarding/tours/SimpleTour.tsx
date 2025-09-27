/**
 * Version simplifiée du tour guidé pour l'onboarding
 * Alternative sans react-joyride pour éviter les problèmes de configuration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, SkipForward, HelpCircle } from 'lucide-react';

/**
 * Interface pour les étapes du tour
 */
interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

/**
 * Props du composant SimpleTour
 */
interface SimpleTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Étapes du tour pour les nutritionnistes
 */
const nutritionistTourSteps: TourStep[] = [
  {
    target: '.onboarding-welcome',
    title: 'Bienvenue ! 👋',
    content: 'Ce tour vous guidera à travers toutes les étapes pour configurer votre profil professionnel.',
    placement: 'center',
  },
  {
    target: '.onboarding-progress',
    title: 'Suivi de progression',
    content: 'Suivez votre progression ici. Chaque étape complétée vous rapproche de l\'activation de votre compte.',
    placement: 'bottom',
  },
  {
    target: '.onboarding-personal-info',
    title: 'Informations personnelles',
    content: 'Commencez par renseigner vos informations personnelles de base.',
    placement: 'right',
  },
  {
    target: '.onboarding-credentials',
    title: 'Identifiants professionnels',
    content: 'Vos identifiants ASCA, RME, EAN sont essentiels pour valider votre statut professionnel.',
    placement: 'right',
  },
];

/**
 * Étapes du tour pour les patients
 */
const patientTourSteps: TourStep[] = [
  {
    target: '.onboarding-welcome',
    title: 'Bienvenue ! 🌟',
    content: 'Ce parcours vous aidera à configurer votre profil pour des conseils nutritionnels personnalisés.',
    placement: 'center',
  },
  {
    target: '.onboarding-progress',
    title: 'Suivi de progression',
    content: 'Votre progression s\'affiche ici. Plus vous complétez d\'informations, plus vos recommandations seront précises.',
    placement: 'bottom',
  },
  {
    target: '.onboarding-health-goals',
    title: 'Objectifs santé',
    content: 'Définissez vos objectifs santé pour un accompagnement adapté.',
    placement: 'right',
  },
];

/**
 * Composant principal du tour simplifié
 */
export const SimpleTour: React.FC<SimpleTourProps> = ({
  steps,
  isActive,
  onComplete,
  onSkip,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const currentStep = steps[currentStepIndex];

  // Fonction pour calculer la transformation CSS du tooltip
  const getTooltipTransform = () => {
    if (!currentStep) return 'translate(-50%, -50%)';
    
    switch (currentStep.placement) {
      case 'top':
        return 'translate(-50%, 0%)';
      case 'bottom':
        return 'translate(-50%, -100%)';
      case 'left':
        return 'translate(0%, -50%)';
      case 'right':
        return 'translate(-100%, -50%)';
      case 'center':
      default:
        return 'translate(-50%, -50%)';
    }
  };

  // Trouver l'élément cible et calculer la position
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const element = document.querySelector(currentStep.target) as HTMLElement;
    if (element) {
      setTargetElement(element);
      
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      // Dimensions du tooltip adaptatives selon la taille d'écran
      const isSmallScreen = window.innerWidth < 640; // sm breakpoint
      const tooltipWidth = isSmallScreen ? Math.min(350, window.innerWidth - 40) : 420;
      const tooltipHeight = 250;
      
      let x = rect.left + scrollLeft;
      let y = rect.top + scrollTop;
      let finalPlacement = currentStep.placement;
      
      // Ajuster la position selon le placement initial
      switch (currentStep.placement) {
        case 'top':
          x += rect.width / 2;
          y -= tooltipHeight + 20;
          break;
        case 'bottom':
          x += rect.width / 2;
          y += rect.height + 20;
          break;
        case 'left':
          x -= tooltipWidth + 20;
          y += rect.height / 2;
          break;
        case 'right':
          x += rect.width + 20;
          y += rect.height / 2;
          break;
        case 'center':
        default:
          x = window.innerWidth / 2;
          y = window.innerHeight / 2;
          break;
      }
      
      // Vérifier les limites de l'écran et ajuster si nécessaire
      const margin = 20; // Marge de sécurité
      
      // Si le tooltip dépasse à droite, le positionner à gauche
      if (x + tooltipWidth / 2 > window.innerWidth - margin) {
        if (currentStep.placement === 'right') {
          x = rect.left + scrollLeft - tooltipWidth - 20;
          finalPlacement = 'left';
        } else {
          x = window.innerWidth - tooltipWidth - margin;
        }
      }
      
      // Si le tooltip dépasse à gauche, le repositionner
      if (x - tooltipWidth / 2 < margin) {
        if (currentStep.placement === 'left') {
          x = rect.right + scrollLeft + 20;
          finalPlacement = 'right';
        } else {
          x = margin + tooltipWidth / 2;
        }
      }

      // Cas spécial pour les placements 'left' et 'right' - ajustement plus précis
      if (currentStep.placement === 'left') {
        // Pour placement à gauche, vérifier qu'on ne dépasse pas le bord gauche
        if (x < margin) {
          x = rect.right + scrollLeft + 20; // Basculer à droite
          finalPlacement = 'right';
        }
      } else if (currentStep.placement === 'right') {
        // Pour placement à droite, vérifier qu'on ne dépasse pas le bord droit
        if (x + tooltipWidth > window.innerWidth - margin) {
          x = rect.left + scrollLeft - tooltipWidth - 20; // Basculer à gauche
          finalPlacement = 'left';
        }
      }
      
      // Si le tooltip dépasse en haut
      if (y < margin) {
        if (currentStep.placement === 'top') {
          y = rect.bottom + scrollTop + 20;
          finalPlacement = 'bottom';
        } else {
          y = margin;
        }
      }
      
      // Si le tooltip dépasse en bas
      if (y + tooltipHeight > window.innerHeight - margin) {
        if (currentStep.placement === 'bottom') {
          y = rect.top + scrollTop - tooltipHeight - 20;
          finalPlacement = 'top';
        } else {
          y = window.innerHeight - tooltipHeight - margin;
        }
      }
      
      setTooltipPosition({ x, y });
      
      // Scroll vers l'élément
      if (currentStep.placement !== 'center') {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, currentStepIndex, isActive]);

  // Recalculer la position lors du redimensionnement de la fenêtre
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => {
      // Forcer le recalcul de la position
      const element = document.querySelector(currentStep?.target || '') as HTMLElement;
      if (element) {
        setTargetElement(element);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, currentStep]);

  // Gestion des actions
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleClose = () => {
    onSkip();
  };

  if (!isActive || !currentStep) {
    return null;
  }

  return (
    <>
      {/* Overlay sombre */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />

      {/* Spotlight sur l'élément cible */}
      {targetElement && currentStep.placement !== 'center' && (
        <motion.div
          className="fixed z-50 pointer-events-none"
          style={{
            left: targetElement.getBoundingClientRect().left - 4,
            top: targetElement.getBoundingClientRect().top - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full h-full border-4 border-blue-500 rounded-lg bg-white bg-opacity-10" />
        </motion.div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        <motion.div
          className="fixed z-50"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: getTooltipTransform(),
            width: window.innerWidth < 640 ? `${Math.min(350, window.innerWidth - 40)}px` : '420px',
            minHeight: '200px',
            maxWidth: '90vw', // Limite la largeur sur très petits écrans
          }}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200 w-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 pr-4">
                {currentStep.title}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="text-gray-600 text-sm leading-relaxed mb-6">
              {currentStep.content}
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-xs text-gray-400">
                Étape {currentStepIndex + 1} sur {steps.length}
              </span>
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Action buttons - Réorganisés sur plusieurs lignes si nécessaire */}
            <div className="space-y-3">
              {/* Ligne principale avec boutons principaux */}
              <div className="flex items-center justify-between space-x-3">
                {/* Back button */}
                {currentStepIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm flex-1"
                  >
                    <ArrowLeft size={16} />
                    <span>Précédent</span>
                  </button>
                )}

                {/* Next/Finish button */}
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex-1"
                >
                  <span>
                    {currentStepIndex === steps.length - 1 ? 'Terminer' : 'Suivant'}
                  </span>
                  {currentStepIndex < steps.length - 1 && <ArrowRight size={16} />}
                </button>
              </div>

              {/* Ligne secondaire avec bouton skip */}
              <div className="flex justify-center">
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-600 text-sm transition-colors flex items-center space-x-1 px-2 py-1"
                >
                  <SkipForward size={14} />
                  <span>Passer le tour</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

/**
 * Hook pour gérer le tour guidé simplifié
 */
export const useSimpleTour = (role: 'nutritionist' | 'patient') => {
  const [isActive, setIsActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`simple-tour-completed-${role}`) === 'true';
    }
    return false;
  });

  const steps = role === 'nutritionist' ? nutritionistTourSteps : patientTourSteps;

  const startTour = () => {
    setIsActive(true);
  };

  const completeTour = () => {
    setIsActive(false);
    setHasCompletedTour(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`simple-tour-completed-${role}`, 'true');
    }
  };

  const skipTour = () => {
    setIsActive(false);
    setHasCompletedTour(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`simple-tour-skipped-${role}`, 'true');
    }
  };

  const resetTour = () => {
    setIsActive(false);
    setHasCompletedTour(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`simple-tour-completed-${role}`);
      localStorage.removeItem(`simple-tour-skipped-${role}`);
    }
  };

  return {
    steps,
    isActive,
    hasCompletedTour,
    startTour,
    completeTour,
    skipTour,
    resetTour,
  };
};

/**
 * Bouton d'aide pour démarrer le tour
 */
export const TourHelpButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    className="fixed bottom-6 right-6 z-30 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 1, duration: 0.3 }}
  >
    <HelpCircle size={24} />
  </motion.button>
);


