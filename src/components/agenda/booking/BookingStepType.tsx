'use client';

import React from 'react';
import { ConsultationTypeCard } from './ConsultationTypeCard';
import type { ConsultationType } from '@/types/agenda';
import { consultationTypeConfig } from '@/types/agenda';

interface BookingStepTypeProps {
  selectedType: ConsultationType | null;
  onSelectType: (type: ConsultationType) => void;
}

export function BookingStepType({ selectedType, onSelectType }: BookingStepTypeProps) {
  const consultationTypes = Object.values(consultationTypeConfig);

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-800 mb-4">Quel type de consultation ?</h4>
      {consultationTypes.map((config) => (
        <ConsultationTypeCard
          key={config.id}
          config={config}
          isSelected={selectedType === config.id}
          onSelect={() => onSelectType(config.id)}
        />
      ))}
    </div>
  );
}

export default BookingStepType;
