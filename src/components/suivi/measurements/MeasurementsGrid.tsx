'use client';

import React from 'react';
import type { MeasurementsData } from '@/types/suivi';
import { MeasurementCard } from './MeasurementCard';

interface MeasurementsGridProps {
  data: MeasurementsData;
  onAddMeasurement: () => void;
}

export function MeasurementsGrid({ data, onAddMeasurement }: MeasurementsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {data.measurements.map((measurement) => (
        <MeasurementCard key={measurement.id} measurement={measurement} />
      ))}

      {/* Add new measurement button */}
      <button
        onClick={onAddMeasurement}
        className="bg-white rounded-xl p-5 border-2 border-dashed border-gray-200 hover:border-[#1B998B] hover:bg-[#1B998B]/5 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-[#1B998B]"
      >
        <span className="text-3xl mb-2">+</span>
        <span className="font-medium">Ajouter une mesure</span>
      </button>
    </div>
  );
}

export default MeasurementsGrid;
