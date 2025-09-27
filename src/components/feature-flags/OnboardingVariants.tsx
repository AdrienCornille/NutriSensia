/**
 * Variantes d'onboarding pour les tests A/B
 * 
 * Ce fichier contient les différentes variantes des composants d'onboarding
 * utilisées dans les tests A/B pour optimiser l'expérience utilisateur.
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Star, Target, Zap, Users, Award } from 'lucide-react';
import { useFeatureFlag, useOnboardingTracking } from './ABTestProvider';

/**
 * Interface commune pour les props des variantes d'onboarding
 */
interface OnboardingVariantProps {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
}

/**
 * Variante de contrôle - Design actuel standard
 */
export function ControlOnboardingVariant({
  currentStep,
  totalSteps,
  stepName,
  children,
  onNext,
  onPrevious,
  onSkip
}: OnboardingVariantProps) {
  const { trackOnboardingStep } = useOnboardingTracking();

  React.useEffect(() => {
    trackOnboardingStep(stepName, currentStep, totalSteps);
  }, [stepName, currentStep, totalSteps, trackOnboardingStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Barre de progression standard */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Étape {currentStep} sur {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{stepName}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>

        {/* Navigation standard */}
        <div className="max-w-2xl mx-auto mt-6 flex justify-between">
          <button
            onClick={onPrevious}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Précédent
          </button>
          <div className="flex gap-2">
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Passer
              </button>
            )}
            <button
              onClick={onNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Variante simplifiée - Interface épurée avec moins d'éléments
 */
export function SimplifiedOnboardingVariant({
  currentStep,
  totalSteps,
  stepName,
  children,
  onNext,
  onPrevious
}: OnboardingVariantProps) {
  const { trackOnboardingStep } = useOnboardingTracking();

  React.useEffect(() => {
    trackOnboardingStep(stepName, currentStep, totalSteps);
  }, [stepName, currentStep, totalSteps, trackOnboardingStep]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Indicateur de progression minimaliste */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Contenu centré et épuré */}
        <div className="max-w-lg mx-auto">
          {children}
        </div>

        {/* Navigation simplifiée */}
        <div className="max-w-lg mx-auto mt-8 text-center">
          <button
            onClick={onNext}
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continuer
          </button>
          {currentStep > 1 && (
            <button
              onClick={onPrevious}
              className="mt-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              Retour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Variante gamifiée - Éléments de jeu et récompenses
 */
export function GamifiedOnboardingVariant({
  currentStep,
  totalSteps,
  stepName,
  children,
  onNext,
  onPrevious,
  onSkip
}: OnboardingVariantProps) {
  const { trackOnboardingStep } = useOnboardingTracking();
  const [showReward, setShowReward] = React.useState(false);

  React.useEffect(() => {
    trackOnboardingStep(stepName, currentStep, totalSteps);
    
    // Animation de récompense à chaque étape
    if (currentStep > 1) {
      setShowReward(true);
      setTimeout(() => setShowReward(false), 2000);
    }
  }, [stepName, currentStep, totalSteps, trackOnboardingStep]);

  const progress = (currentStep / totalSteps) * 100;
  const earnedPoints = currentStep * 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header gamifié */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-gray-800">{earnedPoints} points</span>
          </div>
        </div>

        {/* Barre de progression avec achievements */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-800">Mission: {stepName}</span>
            </div>
            <span className="text-sm text-gray-600">
              {currentStep}/{totalSteps} étapes
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Jalons de progression */}
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full border-2 ${
                  index < currentStep
                    ? 'bg-purple-500 border-purple-500'
                    : 'bg-white border-gray-300'
                }`}
                style={{ left: `${((index + 1) / totalSteps) * 100}%`, marginLeft: '-12px' }}
              >
                {index < currentStep && (
                  <CheckCircle className="w-4 h-4 text-white m-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu avec éléments gamifiés */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Niveau {currentStep}: {stepName}
            </h2>
          </div>
          
          {children}
          
          {/* Badges et achievements */}
          <div className="mt-6 flex flex-wrap gap-2">
            {currentStep >= 2 && (
              <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                <Award className="w-3 h-3" />
                Débutant
              </div>
            )}
            {currentStep >= Math.ceil(totalSteps / 2) && (
              <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                <Users className="w-3 h-3" />
                Progression rapide
              </div>
            )}
          </div>
        </div>

        {/* Navigation gamifiée */}
        <div className="max-w-2xl mx-auto mt-6 flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            ← Retour
          </button>
          
          <div className="flex gap-2">
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-4 py-2 text-purple-600 hover:text-purple-800"
              >
                Passer (+5 pts)
              </button>
            )}
            <button
              onClick={onNext}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium shadow-lg transform hover:scale-105 transition-all"
            >
              Continuer (+10 pts) →
            </button>
          </div>
        </div>

        {/* Animation de récompense */}
        <AnimatePresence>
          {showReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="bg-white rounded-xl shadow-2xl p-6 text-center">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-gray-800">Bravo !</h3>
                <p className="text-gray-600">+10 points gagnés</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Variante guidée - Assistance contextuelle renforcée
 */
export function GuidedOnboardingVariant({
  currentStep,
  totalSteps,
  stepName,
  children,
  onNext,
  onPrevious,
  onSkip
}: OnboardingVariantProps) {
  const { trackOnboardingStep } = useOnboardingTracking();
  const [showHelp, setShowHelp] = React.useState(false);

  React.useEffect(() => {
    trackOnboardingStep(stepName, currentStep, totalSteps);
  }, [stepName, currentStep, totalSteps, trackOnboardingStep]);

  const helpContent = getHelpContent(stepName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec aide */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Configuration de votre profil
          </h1>
          <p className="text-gray-600">
            Nous vous guidons étape par étape pour une expérience optimale
          </p>
        </div>

        {/* Barre de progression détaillée */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Étape {currentStep} sur {totalSteps}: {stepName}
            </span>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Aide
            </button>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Étapes avec descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            {Array.from({ length: Math.min(totalSteps, 3) }).map((_, index) => (
              <div
                key={index}
                className={`p-2 rounded text-center ${
                  index < currentStep
                    ? 'bg-emerald-100 text-emerald-800'
                    : index === currentStep - 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {getStepDescription(index + 1)}
              </div>
            ))}
          </div>
        </div>

        {/* Panel d'aide contextuelle */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-emerald-100 border-l-4 border-emerald-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-emerald-800">
                      Aide pour cette étape
                    </h3>
                    <div className="mt-2 text-sm text-emerald-700">
                      {helpContent}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenu principal */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 border border-emerald-100">
          {children}
        </div>

        {/* Navigation avec conseils */}
        <div className="max-w-2xl mx-auto mt-6">
          <div className="flex justify-between items-center">
            <button
              onClick={onPrevious}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              ← Précédent
            </button>
            
            <div className="flex gap-2">
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Passer cette étape
                </button>
              )}
              <button
                onClick={onNext}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
              >
                Continuer
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            💡 Conseil: Prenez votre temps pour remplir chaque section avec précision
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant principal qui sélectionne la variante appropriée
 */
export function AdaptiveOnboardingVariant(props: OnboardingVariantProps) {
  const variant = useFeatureFlag('nutritionist-onboarding-variant', 'control');

  switch (variant) {
    case 'simplified':
      return <SimplifiedOnboardingVariant {...props} />;
    case 'gamified':
      return <GamifiedOnboardingVariant {...props} />;
    case 'guided':
      return <GuidedOnboardingVariant {...props} />;
    default:
      return <ControlOnboardingVariant {...props} />;
  }
}

/**
 * Fonctions utilitaires
 */
function getHelpContent(stepName: string): string {
  const helpTexts: Record<string, string> = {
    'welcome': 'Bienvenue ! Cette première étape vous présente le processus d\'inscription.',
    'personal-info': 'Renseignez vos informations personnelles. Ces données sont sécurisées et ne seront partagées qu\'avec vos patients.',
    'credentials': 'Vos identifiants professionnels nous permettent de vérifier votre qualité de nutritionniste.',
    'practice-details': 'Les détails de votre cabinet nous aident à mieux vous référencer.',
    'specializations': 'Vos spécialisations permettent aux patients de mieux vous trouver.',
    'rates': 'Définissez vos tarifs pour différents types de consultations.',
    'training': 'Cette formation vous familiarise avec les fonctionnalités de la plateforme.',
    'completion': 'Félicitations ! Votre profil est prêt à être activé.',
  };
  
  return helpTexts[stepName] || 'Suivez les instructions à l\'écran pour continuer.';
}

function getStepDescription(stepNumber: number): string {
  const descriptions = [
    'Informations personnelles',
    'Identifiants professionnels',
    'Détails du cabinet',
    'Spécialisations',
    'Tarifs',
    'Formation',
    'Finalisation',
  ];
  
  return descriptions[stepNumber - 1] || `Étape ${stepNumber}`;
}
