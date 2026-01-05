/**
 * Assistant d'onboarding spécifique aux nutritionnistes
 * Guide l'utilisateur à travers toutes les étapes de configuration professionnelle
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  FileCheck,
  Building,
  Award,
  DollarSign,
  GraduationCap,
  CheckCircle,
} from 'lucide-react';
import { WizardLayout, WizardStep } from '../WizardLayout';
import { useOnboardingProgressHybrid } from '@/hooks/useOnboardingProgressHybrid';
import { useOnboardingAnalytics } from '@/hooks/useOnboardingAnalytics';
import {
  NutritionistOnboardingStep,
  NutritionistOnboardingData,
} from '@/types/onboarding';

// Import des étapes individuelles
import { WelcomeStep } from './steps/WelcomeStep';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { CredentialsStep } from './steps/CredentialsStep';
import { PracticeDetailsStep } from './steps/PracticeDetailsStep';
import { SpecializationsStep } from './steps/SpecializationsStep';
import { ConsultationRatesStep } from './steps/ConsultationRatesStep';
import { PlatformTrainingStep } from './steps/PlatformTrainingStep';
import { CompletionStep } from './steps/CompletionStep';

interface NutritionistOnboardingWizardProps {
  /** ID de l'utilisateur */
  userId: string;
  /** Callback de fermeture */
  onClose?: () => void;
  /** Callback de completion */
  onComplete?: (data: NutritionistOnboardingData) => void;
  /** Callback de sauvegarde progressive */
  onProgressSave?: (data: Partial<NutritionistOnboardingData>) => Promise<void>;
  /** Callback de mise à jour de progression */
  onProgressUpdate?: (
    completionPercentage: number,
    isCompleted: boolean
  ) => void;
  /** Données initiales */
  initialData?: Partial<NutritionistOnboardingData>;
  /** Mode compact */
  compact?: boolean;
}

/**
 * Configuration des étapes pour les nutritionnistes
 * IMPORTANT: Défini en dehors du composant pour éviter les re-créations
 */
export const NUTRITIONIST_STEPS: Array<{
  id: NutritionistOnboardingStep;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: number;
  isRequired: boolean;
  canSkip: boolean;
}> = [
  {
    id: 'welcome',
    title: 'Bienvenue',
    description: 'Introduction à NutriSensia pour les professionnels',
    icon: <User className='h-5 w-5' />,
    estimatedTime: 2,
    isRequired: true,
    canSkip: false,
  },
  {
    id: 'personal-info',
    title: 'Informations personnelles',
    description: 'Vos coordonnées et informations de contact',
    icon: <User className='h-5 w-5' />,
    estimatedTime: 5,
    isRequired: true,
    canSkip: false,
  },
  {
    id: 'credentials',
    title: 'Identifiants professionnels',
    description: 'Numéros ASCA, RME et autres certifications',
    icon: <FileCheck className='h-5 w-5' />,
    estimatedTime: 10,
    isRequired: false,
    canSkip: true,
  },
  {
    id: 'practice-details',
    title: 'Détails du cabinet',
    description: 'Adresse du cabinet et informations pratiques',
    icon: <Building className='h-5 w-5' />,
    estimatedTime: 8,
    isRequired: true,
    canSkip: false,
  },
  {
    id: 'specializations',
    title: 'Spécialisations',
    description: "Vos domaines d'expertise et spécialisations",
    icon: <Award className='h-5 w-5' />,
    estimatedTime: 6,
    isRequired: true,
    canSkip: false,
  },
  {
    id: 'consultation-rates',
    title: 'Tarifs de consultation',
    description: 'Configuration de vos tarifs professionnels',
    icon: <DollarSign className='h-5 w-5' />,
    estimatedTime: 4,
    isRequired: true,
    canSkip: false,
  },
  {
    id: 'platform-training',
    title: 'Formation plateforme',
    description: 'Tour guidé des fonctionnalités professionnelles',
    icon: <GraduationCap className='h-5 w-5' />,
    estimatedTime: 15,
    isRequired: false,
    canSkip: true,
  },
  {
    id: 'completion',
    title: 'Finalisation',
    description: 'Révision et finalisation de votre profil',
    icon: <CheckCircle className='h-5 w-5' />,
    estimatedTime: 2,
    isRequired: true,
    canSkip: false,
  },
];

/**
 * Assistant d'onboarding principal pour les nutritionnistes
 */
export const NutritionistOnboardingWizard: React.FC<
  NutritionistOnboardingWizardProps
> = ({
  userId,
  onClose,
  onComplete,
  onProgressSave,
  onProgressUpdate,
  initialData = {},
  compact = false,
}) => {
  // Identifiant unique pour tracer les instances du wizard
  const wizardInstanceId = React.useRef(
    Math.random().toString(36).substr(2, 9)
  ).current;

  // Ref pour éviter les appels répétés de sauvegarde
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSaveDataRef = React.useRef<string>('');

  // Refs pour éviter les appels multiples de tracking
  const hasTrackedOnboardingStarted = React.useRef(false);
  const hasTrackedStepStarted = React.useRef<Set<string>>(new Set());

  const router = useRouter();

  // État local
  const [currentStep, setCurrentStep] =
    useState<NutritionistOnboardingStep>('welcome');
  const [formData, setFormData] =
    useState<Partial<NutritionistOnboardingData>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effet pour mettre à jour formData quand initialData change (seulement la première fois)
  const [hasInitializedData, setHasInitializedData] = useState(false);

  useEffect(() => {
    if (
      initialData &&
      Object.keys(initialData).length > 0 &&
      !hasInitializedData
    ) {
      setFormData(initialData);
      setHasInitializedData(true);
    }
  }, [initialData, hasInitializedData]); // Dépendances stables

  // Stabiliser les étapes pour éviter les re-créations
  const stableSteps = React.useMemo(() => NUTRITIONIST_STEPS, []);

  // Hook de gestion de la progression hybride (localStorage + DB)
  const {
    progress,
    updateProgress,
    completeStep,
    skipStep,
    isLoading,
    error,
    isProgressLocked,
  } = useOnboardingProgressHybrid({
    userId,
    role: 'nutritionist',
    steps: stableSteps,
  });

  // Hook pour les analytics d'onboarding
  const {
    trackOnboardingStarted,
    trackStepStarted,
    trackStepCompleted,
    trackStepSkipped,
    trackStepError,
    trackHelpRequested,
    trackOnboardingCompleted,
    trackOnboardingAbandoned,
  } = useOnboardingAnalytics({
    role: 'nutritionist',
    totalSteps: NUTRITIONIST_STEPS.length,
  });

  // L'initialisation se fait automatiquement dans le hook useOnboardingProgress

  // Tracking du début de l'onboarding
  useEffect(() => {
    if (progress && !isProgressLocked && !hasTrackedOnboardingStarted.current) {
      trackOnboardingStarted();
      hasTrackedOnboardingStarted.current = true;
    }
  }, [progress, isProgressLocked, trackOnboardingStarted]);

  // Notifier le parent des changements de progression
  useEffect(() => {
    if (progress && onProgressUpdate) {
      onProgressUpdate(progress.completionPercentage, progress.isCompleted);
    }
  }, [progress?.completionPercentage, progress?.isCompleted, onProgressUpdate]);

  // Suivi de la progression reçue
  useEffect(() => {
    if (progress && isProgressLocked && progress.completionPercentage === 100) {
      // Onboarding terminé - pas de redirection automatique
    }
  }, [progress, isProgressLocked, wizardInstanceId, router]);

  // Effet pour marquer l'étape actuelle comme "in-progress" quand on y arrive
  useEffect(() => {
    if (progress && currentStep && !isProgressLocked) {
      const currentStepStatus = progress.steps[currentStep]?.status;
      const currentStepIndex = getCurrentStepIndex();

      // Tracking du début de l'étape (éviter les appels multiples)
      if (!hasTrackedStepStarted.current.has(currentStep)) {
        trackStepStarted(currentStep, currentStepIndex + 1);
        hasTrackedStepStarted.current.add(currentStep);
      }

      if (currentStepStatus === 'not-started') {
        // Pour l'étape "welcome", la marquer directement comme "completed" car c'est juste informatif
        if (currentStep === 'welcome') {
          completeStep(currentStep, {});
        } else {
          updateProgress(currentStep, {});
        }
      } else if (currentStepStatus === 'completed') {
        // Si l'étape est déjà terminée, permettre la modification en la marquant comme "in-progress"
        updateProgress(currentStep, {});
      }
    }
  }, [
    currentStep,
    progress,
    updateProgress,
    completeStep,
    isProgressLocked,
    wizardInstanceId,
    trackStepStarted,
  ]);

  // Cleanup des timeouts au démontage
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Obtenir la configuration de l'étape actuelle
   */
  const getCurrentStepConfig = () => {
    return NUTRITIONIST_STEPS.find(step => step.id === currentStep);
  };

  /**
   * Obtenir l'index de l'étape actuelle
   */
  const getCurrentStepIndex = () => {
    return NUTRITIONIST_STEPS.findIndex(step => step.id === currentStep);
  };

  /**
   * Finaliser l'onboarding
   */
  const handleComplete = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // IMPORTANT: Forcer la progression à 100% lors de la finalisation

      // Marquer toutes les étapes comme terminées
      const allSteps = [
        'welcome',
        'personal-info',
        'credentials',
        'practice-details',
        'consultation-rates',
        'specializations',
        'platform-training',
        'completion',
      ];

      for (const step of allSteps) {
        await completeStep(step as NutritionistOnboardingStep);
      }

      // Tracking de la completion de l'onboarding
      trackOnboardingCompleted();

      // Marquer l'onboarding comme terminé
      if (onComplete) {
        await onComplete(formData as NutritionistOnboardingData);
      }

      // Pas de redirection automatique - l'utilisateur reste sur la page d'onboarding
    } catch (error) {
      // Note: Les erreurs de finalisation seront gérées par le composant parent
    } finally {
      setIsSubmitting(false);
    }
  }, [completeStep, onComplete, formData, router, wizardInstanceId]);

  /**
   * Naviguer vers l'étape suivante (avec sauvegarde)
   */
  const handleNext = useCallback(
    async (stepData?: Partial<NutritionistOnboardingData>) => {
      const currentStepIndex = getCurrentStepIndex();
      const currentStepConfig = getCurrentStepConfig();

      if (!currentStepConfig) return;

      try {
        setIsSubmitting(true);

        // 1. FUSIONNER les données de l'étape avec les données existantes
        let dataToSave = formData;
        if (stepData) {
          dataToSave = { ...formData, ...stepData };
          // Mettre à jour formData avec les nouvelles données
          setFormData(dataToSave);
        }

        // 2. SAUVEGARDER les données COMPLÈTES dans Supabase AVANT de continuer
        if (onProgressSave && dataToSave) {
          try {
            await onProgressSave(dataToSave);
          } catch (error) {
            // Ne pas continuer si la sauvegarde échoue
            throw error;
          }
        }

        // 3. Marquer l'étape actuelle comme terminée
        completeStep(currentStep);

        // Tracking de la completion de l'étape
        trackStepCompleted(
          currentStep,
          currentStepIndex + 1,
          progress?.completionPercentage || 0
        );

        // 4. Passer à l'étape suivante
        if (currentStepIndex < NUTRITIONIST_STEPS.length - 1) {
          const nextStep = NUTRITIONIST_STEPS[currentStepIndex + 1];
          setCurrentStep(nextStep.id);
          // Marquer la nouvelle étape comme en cours seulement si elle n'est pas déjà terminée
          if (progress && progress.steps[nextStep.id]?.status !== 'completed') {
            updateProgress(nextStep.id);
          }
        } else {
          // Dernière étape - finaliser l'onboarding
          await handleComplete();
        }
      } catch (error) {
        // Re-lancer l'erreur pour empêcher la progression
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      getCurrentStepIndex,
      getCurrentStepConfig,
      onProgressSave,
      formData,
      currentStep,
      completeStep,
      updateProgress,
    ]
  );

  /**
   * Naviguer vers l'étape précédente (permettre la navigation libre)
   */
  const handlePrevious = useCallback(async () => {
    const currentStepIndex = getCurrentStepIndex();

    if (currentStepIndex > 0) {
      const previousStep = NUTRITIONIST_STEPS[currentStepIndex - 1];

      // Permettre la navigation vers l'étape précédente (navigation libre)
      setCurrentStep(previousStep.id);

      // Ne pas mettre à jour la progression lors de la navigation en arrière
      // pour éviter de diminuer la progression
    }
  }, [getCurrentStepIndex]);

  /**
   * Passer une étape
   */
  const handleSkip = async () => {
    const currentStepConfig = getCurrentStepConfig();

    if (currentStepConfig?.canSkip) {
      try {
        skipStep(currentStep);
        await handleNext();
      } catch (error) {
        // Note: Les erreurs seront gérées par le composant parent
      }
    }
  };

  /**
   * Mettre à jour les données du formulaire (mémorisé pour éviter les re-rendus)
   */
  const handleDataUpdate = useCallback(
    async (stepData: Partial<NutritionistOnboardingData>) => {
      setFormData(prevData => {
        const updatedData = { ...prevData, ...stepData };

        // Pour les consentements, sauvegarder immédiatement en base de données
        const hasConsentData =
          stepData.termsAccepted !== undefined ||
          stepData.privacyPolicyAccepted !== undefined ||
          stepData.marketingConsent !== undefined;

        if (hasConsentData && onProgressSave) {
          // Créer un hash des données pour éviter les sauvegardes répétées
          const dataHash = JSON.stringify(updatedData);

          // Vérifier si les données ont changé
          if (dataHash !== lastSaveDataRef.current) {
            console.log(
              '🔄 Déclenchement sauvegarde consentement depuis handleDataUpdate'
            );

            // Annuler le timeout précédent s'il existe
            if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current);
            }

            // Débouncer la sauvegarde pour éviter les appels répétés
            saveTimeoutRef.current = setTimeout(() => {
              lastSaveDataRef.current = dataHash;
              onProgressSave(updatedData).catch(error => {
                console.error('❌ Erreur sauvegarde consentement:', error);
              });
            }, 300);
          }
        }

        return updatedData;
      });
    },
    [onProgressSave]
  );

  /**
   * Fermer l'assistant
   */
  const handleClose = () => {
    // Tracking de l'abandon de l'onboarding
    const currentStepIndex = getCurrentStepIndex();
    trackOnboardingAbandoned(currentStep, currentStepIndex + 1, 'user_closed');

    if (onClose) {
      onClose();
    } else {
      router.push('/dashboard');
    }
  };

  /**
   * Afficher l'aide
   */
  const handleHelp = () => {
    // Note: L'aide sera implémentée dans une version future
  };

  /**
   * Gérer le clic sur une étape (navigation vers les étapes complétées)
   */
  const handleStepClick = useCallback(
    (step: NutritionistOnboardingStep) => {
      // Vérifier que l'étape est complétée avant de permettre la navigation
      if (progress?.steps?.[step]?.status === 'completed') {
        setCurrentStep(step);
      }
    },
    [progress]
  );

  /**
   * Props communes pour tous les composants d'étape (mémorisées pour éviter les re-rendus)
   */
  const commonProps = useMemo(
    () => ({
      data: formData,
      onDataChange: handleDataUpdate,
      onNext: (stepData?: Partial<NutritionistOnboardingData>) =>
        handleNext(stepData),
      onPrevious: handlePrevious,
      isSubmitting,
      userId,
    }),
    [
      formData,
      handleDataUpdate,
      handleNext,
      handlePrevious,
      isSubmitting,
      userId,
    ]
  );

  /**
   * Rendu du contenu de l'étape actuelle
   */
  const renderStepContent = () => {
    const stepConfig = getCurrentStepConfig();

    if (!stepConfig) {
      return <div>Étape non trouvée</div>;
    }

    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeStep
            {...commonProps}
            userName={formData.firstName || 'Nutritionniste'}
          />
        );

      case 'personal-info':
        return <PersonalInfoStep {...commonProps} />;

      case 'credentials':
        return <CredentialsStep {...commonProps} />;

      case 'practice-details':
        return <PracticeDetailsStep {...commonProps} />;

      case 'specializations':
        return <SpecializationsStep {...commonProps} />;

      case 'consultation-rates':
        return <ConsultationRatesStep {...commonProps} />;

      case 'platform-training':
        return <PlatformTrainingStep {...commonProps} />;

      case 'completion':
        return <CompletionStep {...commonProps} onComplete={handleComplete} />;

      default:
        return <div>Étape non implémentée</div>;
    }
  };

  // Affichage de chargement
  if (isLoading && !progress) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Chargement de votre progression...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>
            Erreur lors du chargement : {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const currentStepConfig = getCurrentStepConfig();

  return (
    <div className='wizard-step'>
      <WizardLayout
        title='Configuration de votre profil nutritionniste'
        description='Configurons ensemble votre profil professionnel sur NutriSensia'
        currentStep={currentStep}
        progress={progress!}
        onClose={handleClose}
        onHelp={handleHelp}
        onStepClick={handleStepClick}
        isSubmitting={isSubmitting}
        isLoading={isLoading}
        compact={compact}
        showProgressBar={false}
      >
        <WizardStep title='' description='' icon={currentStepConfig?.icon}>
          {renderStepContent()}
        </WizardStep>
      </WizardLayout>
    </div>
  );
};

export default NutritionistOnboardingWizard;
