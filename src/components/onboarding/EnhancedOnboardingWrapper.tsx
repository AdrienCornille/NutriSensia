/**
 * Wrapper d'onboarding avec intégration A/B Testing
 *
 * Ce composant intègre les tests A/B dans le système d'onboarding existant,
 * permettant de tester différentes variantes de l'expérience utilisateur.
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  ABTestProvider,
  useFeatureFlag,
  useOnboardingTracking,
} from '../feature-flags/ABTestProvider';
import { AdaptiveOnboardingVariant } from '../feature-flags/OnboardingVariants';
import { NutritionistOnboardingWizard } from './nutritionist/NutritionistOnboardingWizard';

/**
 * Interface pour les props du wrapper
 */
interface EnhancedOnboardingWrapperProps {
  userId: string;
  userRole: 'nutritionist' | 'patient' | 'admin';
  initialData?: any;
  onComplete?: (data: any) => void;
  onAbandon?: (step: string, reason?: string) => void;
}

/**
 * Wrapper principal avec intégration A/B Testing
 */
export default function EnhancedOnboardingWrapper({
  userId,
  userRole,
  initialData,
  onComplete,
  onAbandon,
}: EnhancedOnboardingWrapperProps) {
  return (
    <ABTestProvider userId={userId} userRole={userRole}>
      <OnboardingWithABTesting
        userId={userId}
        userRole={userRole}
        initialData={initialData}
        onComplete={onComplete}
        onAbandon={onAbandon}
      />
    </ABTestProvider>
  );
}

/**
 * Composant d'onboarding avec tests A/B
 */
function OnboardingWithABTesting({
  userId,
  userRole,
  initialData,
  onComplete,
  onAbandon,
}: EnhancedOnboardingWrapperProps) {
  // Récupération des feature flags
  const onboardingVariant = useFeatureFlag(
    `${userRole}-onboarding-variant`,
    'control'
  );
  const progressDisplay = useFeatureFlag(
    'onboarding-progress-display',
    'linear'
  );
  const validationType = useFeatureFlag('form-validation-type', 'realtime');
  const animationsEnabled = useFeatureFlag('onboarding-animations', true);
  const motivationStyle = useFeatureFlag('motivation-messages', 'encouraging');
  const stepOrder = useFeatureFlag('onboarding-step-order', 'standard');

  // Hooks de tracking
  const {
    trackOnboardingStart,
    trackOnboardingStep,
    trackOnboardingComplete,
    trackOnboardingAbandon,
    trackFormValidationError,
  } = useOnboardingTracking();

  // État local
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState(initialData || {});
  const [startTime] = useState(Date.now());
  const [stepStartTime, setStepStartTime] = useState(Date.now());

  // Configuration adaptée aux feature flags
  const onboardingConfig = {
    variant: onboardingVariant,
    progressDisplay,
    validationType,
    animationsEnabled,
    motivationStyle,
    stepOrder,
  };

  /**
   * Initialisation du tracking
   */
  useEffect(() => {
    trackOnboardingStart();
  }, [trackOnboardingStart]);

  /**
   * Gestion de la progression des étapes
   */
  const handleStepChange = async (newStep: number, stepName: string) => {
    const stepDuration = Date.now() - stepStartTime;

    // Tracking de l'étape précédente
    if (currentStep > 0) {
      await trackOnboardingStep(
        getStepName(currentStep),
        currentStep,
        getTotalSteps(),
        stepDuration
      );
    }

    setCurrentStep(newStep);
    setStepStartTime(Date.now());
  };

  /**
   * Gestion de la completion de l'onboarding
   */
  const handleComplete = async (finalData: any) => {
    const totalDuration = Date.now() - startTime;

    // Tracking de la completion
    await trackOnboardingComplete(totalDuration);

    // Sauvegarde des données avec les métadonnées A/B
    const enrichedData = {
      ...finalData,
      abTestMetadata: {
        userId,
        userRole,
        variant: onboardingVariant,
        config: onboardingConfig,
        totalDuration,
        completedAt: new Date().toISOString(),
      },
    };

    onComplete?.(enrichedData);
  };

  /**
   * Gestion de l'abandon de l'onboarding
   */
  const handleAbandon = async (reason?: string) => {
    await trackOnboardingAbandon(getStepName(currentStep), currentStep, reason);

    onAbandon?.(getStepName(currentStep), reason);
  };

  /**
   * Gestion des erreurs de validation
   */
  const handleValidationError = async (field: string, message: string) => {
    await trackFormValidationError(field, message);
  };

  /**
   * Rendu de la variante appropriée selon les tests A/B
   */
  const renderOnboardingVariant = () => {
    const commonProps = {
      currentStep,
      totalSteps: getTotalSteps(),
      stepName: getStepName(currentStep),
      onNext: () =>
        handleStepChange(currentStep + 1, getStepName(currentStep + 1)),
      onPrevious: () =>
        handleStepChange(currentStep - 1, getStepName(currentStep - 1)),
      onSkip: () =>
        handleStepChange(currentStep + 1, getStepName(currentStep + 1)),
    };

    // Si les animations sont désactivées, on utilise un wrapper sans animations
    if (!animationsEnabled) {
      return (
        <div className='min-h-screen bg-gray-50'>
          <StaticOnboardingContent
            {...commonProps}
            config={onboardingConfig}
            data={onboardingData}
            onDataChange={setOnboardingData}
            onComplete={handleComplete}
            onAbandon={handleAbandon}
            onValidationError={handleValidationError}
          />
        </div>
      );
    }

    // Rendu avec la variante adaptive
    return (
      <AdaptiveOnboardingVariant {...commonProps}>
        <OnboardingStepContent
          step={currentStep}
          config={onboardingConfig}
          data={onboardingData}
          onDataChange={setOnboardingData}
          onComplete={handleComplete}
          onAbandon={handleAbandon}
          onValidationError={handleValidationError}
        />
      </AdaptiveOnboardingVariant>
    );
  };

  return (
    <div className='onboarding-wrapper'>
      {/* Métadonnées pour le debugging (seulement en dev) */}
      {process.env.NODE_ENV === 'development' && (
        <ABTestDebugPanel config={onboardingConfig} />
      )}

      {renderOnboardingVariant()}
    </div>
  );
}

/**
 * Contenu statique d'onboarding (sans animations)
 */
function StaticOnboardingContent({
  currentStep,
  totalSteps,
  stepName,
  config,
  data,
  onDataChange,
  onComplete,
  onAbandon,
  onValidationError,
  onNext,
  onPrevious,
}: any) {
  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Barre de progression simple */}
      <div className='mb-8'>
        <div className='flex justify-between items-center mb-2'>
          <span className='text-sm font-medium text-gray-700'>
            Étape {currentStep} sur {totalSteps}
          </span>
          <span className='text-sm text-gray-500'>{stepName}</span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-blue-600 h-2 rounded-full'
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Contenu de l'étape */}
      <div className='max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6'>
        <OnboardingStepContent
          step={currentStep}
          config={config}
          data={data}
          onDataChange={onDataChange}
          onComplete={onComplete}
          onAbandon={onAbandon}
          onValidationError={onValidationError}
        />
      </div>

      {/* Navigation */}
      <div className='max-w-2xl mx-auto mt-6 flex justify-between'>
        <button
          onClick={onPrevious}
          disabled={currentStep === 1}
          className='px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50'
        >
          Précédent
        </button>
        <button
          onClick={onNext}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

/**
 * Contenu d'une étape d'onboarding
 */
function OnboardingStepContent({
  step,
  config,
  data,
  onDataChange,
  onComplete,
  onAbandon,
  onValidationError,
}: any) {
  // Ici, nous rendrions le contenu spécifique à chaque étape
  // en fonction de la configuration des tests A/B

  switch (step) {
    case 0:
      return <WelcomeStep config={config} />;
    case 1:
      return (
        <PersonalInfoStep
          config={config}
          data={data}
          onChange={onDataChange}
          onValidationError={onValidationError}
        />
      );
    case 2:
      return (
        <CredentialsStep
          config={config}
          data={data}
          onChange={onDataChange}
          onValidationError={onValidationError}
        />
      );
    // ... autres étapes
    default:
      return <div>Étape inconnue</div>;
  }
}

/**
 * Étape de bienvenue
 */
function WelcomeStep({ config }: { config: any }) {
  const getMotivationMessage = () => {
    switch (config.motivationStyle) {
      case 'encouraging':
        return 'Félicitations ! Vous êtes sur le point de rejoindre une communauté de professionnels de la nutrition. Nous allons vous accompagner dans cette aventure !';
      case 'informative':
        return "Ce processus d'inscription vous permettra de créer votre profil professionnel et de commencer à recevoir des demandes de consultation.";
      case 'minimal':
        return 'Créons votre profil professionnel.';
      case 'gamified':
        return '🎯 Mission : Créer votre profil de nutritionniste ! Êtes-vous prêt à débloquer tous les achievements ?';
      default:
        return 'Bienvenue sur NutriSensia !';
    }
  };

  return (
    <div className='text-center'>
      <h1 className='text-2xl font-bold text-gray-900 mb-4'>
        Bienvenue sur NutriSensia !
      </h1>
      <p className='text-gray-600 mb-6'>{getMotivationMessage()}</p>

      {config.variant === 'gamified' && (
        <div className='bg-purple-50 rounded-lg p-4 mb-6'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <span className='text-2xl'>🏆</span>
            <span className='font-semibold text-purple-800'>Objectif</span>
          </div>
          <p className='text-purple-700 text-sm'>
            Complétez votre profil pour débloquer l'accès à la plateforme !
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Étape d'informations personnelles
 */
function PersonalInfoStep({ config, data, onChange, onValidationError }: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    let error = '';

    switch (field) {
      case 'firstName':
        if (!value.trim()) error = 'Le prénom est requis';
        else if (value.length < 2)
          error = 'Le prénom doit contenir au moins 2 caractères';
        break;
      case 'lastName':
        if (!value.trim()) error = 'Le nom est requis';
        else if (value.length < 2)
          error = 'Le nom doit contenir au moins 2 caractères';
        break;
      case 'email':
        if (!value.trim()) error = "L'email est requis";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Format d'email invalide";
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      onValidationError(field, error);
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    return !error;
  };

  const handleFieldChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });

    // Validation en temps réel si configurée
    if (config.validationType === 'realtime') {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    // Validation au blur si configurée
    if (config.validationType === 'onblur') {
      validateField(field, value);
    }
  };

  return (
    <div>
      <h2 className='text-xl font-semibold text-gray-900 mb-4'>
        Informations personnelles
      </h2>

      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Prénom *
          </label>
          <input
            type='text'
            value={data.firstName || ''}
            onChange={e => handleFieldChange('firstName', e.target.value)}
            onBlur={e => handleFieldBlur('firstName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.firstName && (
            <p className='text-red-600 text-sm mt-1'>{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Nom *
          </label>
          <input
            type='text'
            value={data.lastName || ''}
            onChange={e => handleFieldChange('lastName', e.target.value)}
            onBlur={e => handleFieldBlur('lastName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.lastName && (
            <p className='text-red-600 text-sm mt-1'>{errors.lastName}</p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Email *
          </label>
          <input
            type='email'
            value={data.email || ''}
            onChange={e => handleFieldChange('email', e.target.value)}
            onBlur={e => handleFieldBlur('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className='text-red-600 text-sm mt-1'>{errors.email}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Étape des identifiants professionnels
 */
function CredentialsStep({ config, data, onChange, onValidationError }: any) {
  // Implémentation similaire à PersonalInfoStep
  return (
    <div>
      <h2 className='text-xl font-semibold text-gray-900 mb-4'>
        Identifiants professionnels
      </h2>
      {/* Formulaire des identifiants */}
    </div>
  );
}

/**
 * Panel de debug pour les tests A/B (développement seulement)
 */
function ABTestDebugPanel({ config }: { config: any }) {
  return (
    <div className='fixed top-0 right-0 bg-black text-white text-xs p-2 m-2 rounded z-50'>
      <div className='font-bold mb-1'>A/B Test Config:</div>
      <div>Variant: {config.variant}</div>
      <div>Progress: {config.progressDisplay}</div>
      <div>Validation: {config.validationType}</div>
      <div>Animations: {config.animationsEnabled ? 'ON' : 'OFF'}</div>
      <div>Motivation: {config.motivationStyle}</div>
    </div>
  );
}

/**
 * Fonctions utilitaires
 */
function getStepName(step: number): string {
  const stepNames = [
    'welcome',
    'personal-info',
    'credentials',
    'practice-details',
    'specializations',
    'rates',
    'training',
    'completion',
  ];

  return stepNames[step] || 'unknown';
}

function getTotalSteps(): number {
  return 8; // Nombre total d'étapes
}
