'use client';

import React from 'react';
import { ConsultationItem } from './ConsultationItem';
import type { Consultation } from '@/types/dossier';

interface ConsultationsTimelineProps {
  consultations: Consultation[];
}

export function ConsultationsTimeline({
  consultations,
}: ConsultationsTimelineProps) {
  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h2 className='font-semibold text-gray-800 mb-6'>
        Historique des consultations
      </h2>

      <div className='space-y-6'>
        {consultations.map((consultation, index) => (
          <ConsultationItem
            key={consultation.id}
            consultation={consultation}
            index={index}
            isLast={index === consultations.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default ConsultationsTimeline;
