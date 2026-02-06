'use client';

import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import {
  Step1PersonalInfo,
  Step2ProfessionalInfo,
  Step3Documents,
  Step4Terms,
  Step5Summary,
} from './nutritionist/';
import type {
  NutritionistRegistrationData,
  RegistrationStep,
} from '@/types/nutritionist-registration';
import {
  getStepTitle,
  getStepDescription,
} from '@/types/nutritionist-registration';

interface NutritionistRegistrationFormProps {
  onSubmit: (data: NutritionistRegistrationData) => Promise<void>;
  userId?: string;
}

const TOTAL_STEPS = 5;

/**
 * Formulaire d'inscription nutritionniste multi-étapes
 * @see AUTH-008 dans USER_STORIES.md
 */
export function NutritionistRegistrationForm({
  onSubmit,
  userId,
}: NutritionistRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<NutritionistRegistrationData>({
    mode: 'onChange',
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      },
      professionalInfo: {
        ascaNumber: '',
        rmeNumber: '',
        specializations: [],
        yearsOfExperience: '',
        languages: ['fr'],
        bio: '',
        cabinetAddress: {
          street: '',
          postalCode: '',
          city: '',
          canton: '',
        },
      },
      documents: {},
      terms: {
        acceptTerms: false,
        acceptPrivacy: false,
        acceptSalesTerms: false,
        certifyAccuracy: false,
      },
    },
  });

  const goToStep = (step: RegistrationStep) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((currentStep + 1) as RegistrationStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as RegistrationStep);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const data = methods.getValues();
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <FormProvider {...methods}>
      <div className='w-full max-w-2xl mx-auto'>
        {/* Indicateur de progression */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(step => (
              <React.Fragment key={step}>
                {/* Cercle de l'étape */}
                <div className='flex flex-col items-center'>
                  <button
                    type='button'
                    onClick={() =>
                      step < currentStep && goToStep(step as RegistrationStep)
                    }
                    disabled={step > currentStep}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                      step < currentStep
                        ? 'bg-[#1B998B] text-white cursor-pointer hover:bg-[#158578]'
                        : step === currentStep
                          ? 'bg-[#1B998B] text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step < currentStep ? <Check className='w-5 h-5' /> : step}
                  </button>
                  <span
                    className={`mt-2 text-xs font-medium hidden sm:block ${
                      step <= currentStep ? 'text-gray-800' : 'text-gray-400'
                    }`}
                  >
                    {getStepTitle(step as RegistrationStep)}
                  </span>
                </div>

                {/* Ligne de connexion */}
                {step < TOTAL_STEPS && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      step < currentStep ? 'bg-[#1B998B]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Titre et description de l'étape */}
          <div className='text-center mt-6'>
            <h2 className='text-xl font-semibold text-gray-800'>
              {getStepTitle(currentStep)}
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              {getStepDescription(currentStep)}
            </p>
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8'>
          <AnimatePresence mode='wait' custom={currentStep}>
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {currentStep === 1 && <Step1PersonalInfo onNext={nextStep} />}

              {currentStep === 2 && (
                <Step2ProfessionalInfo onNext={nextStep} onBack={prevStep} />
              )}

              {currentStep === 3 && (
                <Step3Documents
                  onNext={nextStep}
                  onBack={prevStep}
                  userId={userId}
                />
              )}

              {currentStep === 4 && (
                <Step4Terms onNext={nextStep} onBack={prevStep} />
              )}

              {currentStep === 5 && (
                <Step5Summary
                  onBack={prevStep}
                  onSubmit={handleSubmit}
                  onEditStep={goToStep}
                  isSubmitting={isSubmitting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicateur mobile de l'étape actuelle */}
        <div className='mt-4 text-center sm:hidden'>
          <span className='text-sm text-gray-500'>
            Étape {currentStep} sur {TOTAL_STEPS}
          </span>
        </div>
      </div>
    </FormProvider>
  );
}

export default NutritionistRegistrationForm;
