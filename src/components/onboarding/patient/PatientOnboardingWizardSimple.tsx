/**
 * Version simplifiée de l'assistant d'onboarding pour les patients
 * Sans hooks complexes pour éviter les boucles infinies
 */

'use client';

import React, { useState } from 'react';
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
  X,
  MessageCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { PatientOnboardingData } from '@/types/onboarding';
import { PatientOnboardingSchema } from '@/lib/onboarding-schemas';

// Import des étapes individuelles
import { WelcomeStep } from './steps/WelcomeStep';
import { ConsultationReasonStep } from './steps/ConsultationReasonStep';
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
const STEPS = [
  { id: 'welcome', title: 'Bienvenue', icon: <Heart className='h-6 w-6' /> },
  {
    id: 'consultation-reason',
    title: 'Raison de consultation',
    icon: <MessageCircle className='h-6 w-6' />,
  },
  {
    id: 'personal-info',
    title: 'Informations personnelles',
    icon: <User className='h-6 w-6' />,
  },
  {
    id: 'health-profile',
    title: 'Profil santé',
    icon: <Stethoscope className='h-6 w-6' />,
  },
  {
    id: 'health-goals',
    title: 'Objectifs santé',
    icon: <Target className='h-6 w-6' />,
  },
  {
    id: 'dietary-info',
    title: 'Habitudes alimentaires',
    icon: <Utensils className='h-6 w-6' />,
  },
  {
    id: 'medical-info',
    title: 'Informations médicales',
    icon: <Stethoscope className='h-6 w-6' />,
  },
  {
    id: 'lifestyle',
    title: 'Style de vie',
    icon: <Activity className='h-6 w-6' />,
  },
  {
    id: 'app-tour',
    title: "Découverte de l'app",
    icon: <Smartphone className='h-6 w-6' />,
  },
  {
    id: 'completion',
    title: 'Félicitations !',
    icon: <CheckCircle className='h-6 w-6' />,
  },
];

/**
 * Assistant d'onboarding simplifié pour les patients
 */
export const PatientOnboardingWizardSimple: React.FC<
  PatientOnboardingWizardProps
> = ({ onComplete, initialData = {}, compact = false }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] =
    useState<Partial<PatientOnboardingData>>(initialData);

  const currentStep = STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const progress = Math.round(((currentStepIndex + 1) / STEPS.length) * 100);

  // Configuration du formulaire React Hook Form
  const methods = useForm<PatientOnboardingData>({
    resolver: zodResolver(PatientOnboardingSchema),
    defaultValues: {
      ...initialData,
      ...formData,
    },
    mode: 'onChange',
  });

  /**
   * Naviguer vers l'étape suivante
   */
  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  /**
   * Naviguer vers l'étape précédente
   */
  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  /**
   * Mettre à jour les données du formulaire
   */
  const handleDataChange = (newData: Partial<PatientOnboardingData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  /**
   * Finaliser l'onboarding
   */
  const handleComplete = async () => {
    if (onComplete && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onComplete(formData as PatientOnboardingData);
      } catch (error) {
        console.error('Erreur lors de la finalisation:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * Rendu de l'étape actuelle
   */
  const renderCurrentStep = () => {
    const stepProps = {
      data: formData,
      onDataChange: handleDataChange,
      onNext: handleNext,
      onPrev: handlePrev,
      isFirstStep,
      isLastStep,
    };

    switch (currentStep.id) {
      case 'welcome':
        return <WelcomeStep {...stepProps} />;
      case 'consultation-reason':
        return <ConsultationReasonStep {...stepProps} />;
      case 'personal-info':
        return <PersonalInfoStep {...stepProps} />;
      case 'health-profile':
        return <HealthProfileStep {...stepProps} />;
      case 'health-goals':
        return <HealthGoalsStep {...stepProps} />;
      case 'dietary-info':
        return <DietaryInfoStep {...stepProps} />;
      case 'medical-info':
        return <MedicalInfoStep {...stepProps} />;
      case 'lifestyle':
        return <LifestyleStep {...stepProps} />;
      case 'app-tour':
        return <AppTourStep {...stepProps} />;
      case 'completion':
        return <CompletionStep {...stepProps} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-teal-100'>
        {/* En-tête avec progression */}
        <div className='bg-white shadow-sm'>
          <div className='max-w-4xl mx-auto px-4 py-4'>
            <div className='flex items-center justify-between mb-4'>
              <h1 className='text-2xl font-bold text-gray-900'>
                Configuration de votre profil
              </h1>
              <div className='text-sm text-gray-600'>
                Étape {currentStepIndex + 1} sur {STEPS.length}
              </div>
            </div>

            {/* Barre de progression */}
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-green-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Indicateurs d'étapes */}
            <div className='flex justify-between mt-4'>
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    index <= currentStepIndex
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStepIndex
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle className='h-4 w-4' />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className='text-xs mt-1 text-center max-w-16 truncate'>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className='max-w-4xl mx-auto px-4 py-8'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {currentStep.id !== 'welcome' && currentStep.id !== 'completion' && (
          <div className='fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg'>
            <div className='max-w-4xl mx-auto px-4 py-4 flex justify-between'>
              <Button
                variant='secondary'
                onClick={handlePrev}
                disabled={isFirstStep}
                className='flex items-center gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                Précédent
              </Button>

              <Button
                variant='primary'
                onClick={handleNext}
                disabled={isLastStep}
                className='flex items-center gap-2'
              >
                Suivant
                <ArrowRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </div>
    </FormProvider>
  );
};
