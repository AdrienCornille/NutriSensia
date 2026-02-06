'use client';

import React from 'react';
import type { BookingStep } from '@/types/agenda';

interface BookingStepIndicatorProps {
  currentStep: BookingStep;
  isEditMode?: boolean; // AGENDA-007
}

export function BookingStepIndicator({
  currentStep,
  isEditMode = false,
}: BookingStepIndicatorProps) {
  // AGENDA-007: In edit mode, show only 2 steps (slot selection + confirmation)
  const steps = isEditMode ? [2, 3] : [1, 2, 3];

  return (
    <div className='flex gap-2'>
      {steps.map(step => (
        <div
          key={step}
          className={`flex-1 h-1 rounded-full transition-colors ${
            step <= currentStep ? 'bg-[#1B998B]' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default BookingStepIndicator;
