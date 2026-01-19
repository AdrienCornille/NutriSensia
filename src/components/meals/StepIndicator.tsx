'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">
        Étape {currentStep}/{steps.length}
      </span>
      <div className="flex gap-1">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;
          const isClickable = onStepClick && stepNumber <= currentStep;

          return (
            <motion.button
              key={index}
              onClick={() => isClickable && onStepClick(stepNumber)}
              disabled={!isClickable}
              className={`
                w-8 h-1 rounded-full transition-colors
                ${isCompleted || isActive ? 'bg-emerald-500' : 'bg-gray-200'}
                ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
              `}
              initial={false}
              animate={{
                backgroundColor: isCompleted || isActive ? '#10B981' : '#E5E7EB',
              }}
              transition={{ duration: 0.2 }}
              title={step.label}
              aria-label={`${step.label} - ${
                isCompleted
                  ? 'Complété'
                  : isActive
                    ? 'En cours'
                    : 'À venir'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

// Extended version with labels and numbers
interface StepIndicatorExtendedProps extends StepIndicatorProps {
  showLabels?: boolean;
}

export function StepIndicatorExtended({
  steps,
  currentStep,
  onStepClick,
  showLabels = true,
}: StepIndicatorExtendedProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isClickable = onStepClick && stepNumber <= currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Step circle and label */}
              <div className="flex flex-col items-center">
                <motion.button
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    text-sm font-medium transition-all
                    ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                          : 'bg-gray-200 text-gray-500'
                    }
                    ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                  `}
                  whileTap={isClickable ? { scale: 0.95 } : undefined}
                  aria-label={`${step.label} - ${
                    isCompleted
                      ? 'Complété'
                      : isActive
                        ? 'En cours'
                        : 'À venir'
                  }`}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    stepNumber
                  )}
                </motion.button>

                {showLabels && (
                  <span
                    className={`
                      mt-2 text-xs font-medium text-center max-w-[80px]
                      ${isActive ? 'text-emerald-600' : 'text-gray-500'}
                    `}
                  >
                    {step.label}
                  </span>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-2 h-0.5 bg-gray-200 relative">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-emerald-500"
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
