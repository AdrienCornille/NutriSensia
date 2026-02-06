'use client';

import React from 'react';
import type { MeasurementsData } from '@/types/suivi';

interface MeasurementsSummaryProps {
  data: MeasurementsData;
}

export function MeasurementsSummary({ data }: MeasurementsSummaryProps) {
  return (
    <div className='bg-gradient-to-r from-[#1B998B] to-[#147569] rounded-xl p-6 text-white'>
      <h2 className='font-semibold text-lg mb-2'>Évolution globale</h2>
      <p className='text-white/80'>
        Vous avez {data.totalChange < 0 ? 'perdu' : 'gagné'}{' '}
        <span className='font-bold text-white'>
          {Math.abs(data.totalChange)} cm
        </span>{' '}
        au total depuis le début de votre suivi.
      </p>
    </div>
  );
}

export default MeasurementsSummary;
