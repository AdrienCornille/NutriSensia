/**
 * Assistant d'onboarding principal pour les patients
 * Orchestre les différentes étapes du parcours d'inscription
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  User, 
  Target, 
  Utensils, 
  Stethoscope,
  Activity,
  Smartphone,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  X
} from 'lucide-react';

import { WizardLayout, WizardStep } from '../WizardLayout';
import { useSimpleOnboarding } from '@/hooks/useOnboardingProgressSimple';
import { PatientOnboardingStep, PatientOnboardingData } from '@/types/onboarding';
import { PatientOnboardingSchema } from '@/lib/onboarding-schemas';

// Import des étapes individuelles
import { WelcomeStep } from './steps/WelcomeStep';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { HealthProfileStep } from './steps/HealthProfileStep';
import { HealthGoalsStep } from './steps/HealthGoalsStep';
import { DietaryInfoStep } from './steps/DietaryInfoStep';
import { MedicalInfoStep } from './steps/MedicalInfoStep';
import { LifestyleStep } from './steps/LifestyleStep';
import { AppTourStep } from './steps/AppTourStep';
import { CompletionStep } from './steps/CompletionStep';

/**
 * Props du composant d'onboarding patient
 */
interface PatientOnboardingWizardProps {
  /** Callback appelé à la completion de l'onboarding */
  onComplete?: (data: PatientOnboardingData) => Promise<void>;
  /** Données initiales pré-remplies */
  initialData?: Partial<PatientOnboardingData>;
  /** Mode compact pour l'affichage */
  compact?: boolean;
}

/**
 * Configuration des étapes d'onboarding
 */
const PATIENT_ONBOARDING_STEPS: WizardStep<PatientOnboardingStep>[] = [
  {
    id: 'welcome',
    title: 'Bienvenue',
    description: 'Découvrez votre parcours nutritionnel personnalisé',
    icon: <Heart className="h-6 w-6" />,
    canSkip: false,
    estimatedDuration: 60, // en secondes
  },
  {
    id: 'personal-info',
    title: 'Informations personnelles',
    description: 'Parlez-nous de vous',
    icon: <User className="h-6 w-6" />,
    canSkip: false,
    estimatedDuration: 120,
  },
  {
    id: 'health-profile',
    title: 'Profil santé',
    description: 'Informations de base sur votre santé',
    icon: <Stethoscope className="h-6 w-6" />,
    canSkip: false,
    estimatedDuration: 90,
  },
  {
    id: 'health-goals',
    title: 'Objectifs santé',
    description: 'Définissez vos objectifs nutritionnels',
    icon: <Target className="h-6 w-6" />,
    canSkip: false,
    estimatedDuration: 180,
  },
  {
    id: 'dietary-info',
    title: 'Habitudes alimentaires',
    description: 'Restrictions et préférences alimentaires',
    icon: <Utensils className="h-6 w-6" />,
    canSkip: false,
    estimatedDuration: 150,
  },
  {
    id: 'medical-info',
    title: 'Informations médicales',
    description: 'Conditions et traitements en cours',
    icon: <Stethoscope className="h-6 w-6" />,
    canSkip: true,
    estimatedDuration: 120,
  },
  {
    id: 'lifestyle',
    title: 'Style de vie',
    description: 'Activité physique et habitudes quotidiennes',
    icon: <Activity className="h-6 w-6" />,
    canSkip: false,
    estimatedDuration: 120,
  },
  {
    id: 'app-tour',
    title: 'Découverte de l\'app',
    description: 'Explorez les fonctionnalités principales',
    icon: <Smartphone className="h-6 w-6" />,
    canSkip: true,
    estimatedDuration: 180,
  },
  {
    id: 'completion',
    title: 'Félicitations !',
    description: 'Votre profil est maintenant configuré',
    icon: <CheckCircle className="h-6 w-6" />,
    canSkip: false,
    estimatedDuration: 60,
  },
];

/**
 * Assistant d'onboarding pour les patients
 */
export const PatientOnboardingWizard: React.FC<PatientOnboardingWizardProps> = ({
  onComplete,
  initialData = {},
  compact = false,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Hook de progression d'onboarding
  const {
    currentStep,
    onboardingData,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep,
    isLastStep,
    submitOnboarding,
    isLoading,
    error
  } = useOnboardingProgress<PatientOnboardingData, PatientOnboardingStep>(
    'patient',
    PatientOnboardingSchema
  );

  // Configuration du formulaire React Hook Form
  const methods = useForm<PatientOnboardingData>({
    resolver: zodResolver(PatientOnboardingSchema),
    defaultValues: {
      ...initialData,
      ...onboardingData,
    },
    mode: 'onChange',
  });

  // Synchroniser l'index de l'étape actuelle
  useEffect(() => {
    const stepIndex = PATIENT_ONBOARDING_STEPS.findIndex(step => step.id === currentStep);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  }, [currentStep]);

  /**
   * Naviguer vers l'étape suivante
   */
  const handleNext = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Valider les données actuelles
      const formData = methods.getValues();
      
      // Mettre à jour les données
      await updateData(formData);
      
      // Passer à l'étape suivante ou finaliser
      if (!isLastStep) {
        await nextStep();
      } else {
        // Dernière étape - finaliser l'onboarding
        await handleComplete();
      }
    } catch (error) {
      console.error('Erreur lors de la navigation:', error);
      // Note: Les erreurs de navigation seront gérées par le composant parent
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Naviguer vers l'étape précédente
   */
  const handlePrevious = async () => {
    if (isSubmitting || isFirstStep) return;

    try {
      // Sauvegarder les données actuelles avant de revenir
      const formData = methods.getValues();
      await updateData(formData);
      await prevStep();
    } catch (error) {
      console.error('Erreur lors du retour:', error);
    }
  };

  /**
   * Passer une étape
   */
  const handleSkip = async () => {
    const currentStepConfig = PATIENT_ONBOARDING_STEPS.find(step => step.id === currentStep);
    
    if (currentStepConfig?.canSkip) {
      try {
        await nextStep();
      } catch (error) {
        console.error('Erreur lors du passage d\'étape:', error);
        // Note: Les erreurs seront gérées par le composant parent
      }
    }
  };

  /**
   * Finaliser l'onboarding
   */
  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const formData = methods.getValues();
      
      // Soumettre l'onboarding
      await submitOnboarding(formData);
      
      // Marquer l'onboarding comme terminé
      if (onComplete) {
        await onComplete(formData as PatientOnboardingData);
      }
      
      // Rediriger vers le tableau de bord patient
      router.push('/dashboard/patient');
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      // Note: Les erreurs de finalisation seront gérées par le composant parent
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Mettre à jour les données du formulaire
   */
  const handleDataChange = (stepData: Partial<PatientOnboardingData>) => {
    // Mettre à jour le formulaire
    Object.entries(stepData).forEach(([key, value]) => {
      methods.setValue(key as keyof PatientOnboardingData, value);
    });

    // Mettre à jour les données d'onboarding
    updateData(stepData);
  };

  /**
   * Fermer l'onboarding (avec confirmation)
   */
  const handleClose = () => {
    if (window.confirm('Êtes-vous sûr de vouloir quitter l\'onboarding ? Votre progression sera sauvegardée.')) {
      router.push('/dashboard');
    }
  };

  /**
   * Afficher l'aide
   */
  const handleHelp = () => {
    // Note: L'aide sera implémentée dans une version future
    console.log('Aide demandée pour l\'étape:', currentStep);
  };

  /**
   * Rendu du contenu de l'étape actuelle
   */
  const renderStepContent = () => {
    const commonProps = {
      data: onboardingData,
      onDataChange: handleDataChange,
      onNext: handleNext,
      onPrevious: handlePrevious,
      isSubmitting,
    };

    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep {...commonProps} />;
      
      case 'personal-info':
        return <PersonalInfoStep {...commonProps} />;
      
      case 'health-profile':
        return <HealthProfileStep {...commonProps} />;
      
      case 'health-goals':
        return <HealthGoalsStep {...commonProps} />;
      
      case 'dietary-info':
        return <DietaryInfoStep {...commonProps} />;
      
      case 'medical-info':
        return <MedicalInfoStep {...commonProps} />;
      
      case 'lifestyle':
        return <LifestyleStep {...commonProps} />;
      
      case 'app-tour':
        return <AppTourStep {...commonProps} />;
      
      case 'completion':
        return <CompletionStep {...commonProps} />;
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Étape non trouvée: {currentStep}</p>
          </div>
        );
    }
  };

  // Affichage de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  const currentStepConfig = PATIENT_ONBOARDING_STEPS[currentStepIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <FormProvider {...methods}>
        <WizardLayout
          title={currentStepConfig?.title || 'Onboarding Patient'}
          description={currentStepConfig?.description || ''}
          currentStep={currentStepIndex + 1}
          totalSteps={PATIENT_ONBOARDING_STEPS.length}
          canGoPrevious={!isFirstStep}
          canGoNext={true}
          canSkip={currentStepConfig?.canSkip}
          isLoading={isSubmitting}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSkip={handleSkip}
          onClose={handleClose}
          onHelp={handleHelp}
          compact={compact}
          nextButtonText={isLastStep ? 'Terminer' : 'Continuer'}
          skipButtonText="Passer cette étape"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Affichage des erreurs */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}
        </WizardLayout>
      </FormProvider>
    </div>
  );
};

export default PatientOnboardingWizard;
