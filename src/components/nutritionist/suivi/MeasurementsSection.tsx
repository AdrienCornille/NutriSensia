'use client';

import React, { useState, useMemo } from 'react';
import { Loader2, Ruler } from 'lucide-react';
import type { TimeRange, MeasurementType } from '@/types/suivi';
import { measurementTypeConfig } from '@/types/suivi';
import { usePatientMeasurements } from '@/hooks/useNutritionistSuivi';
import { TimeRangeSelector } from './TimeRangeSelector';
import { MeasurementChart } from './charts/MeasurementChart';

// ============================================================================
// Types
// ============================================================================

interface MeasurementsSectionProps {
  patientId: string;
}

interface TypeSummary {
  type: MeasurementType;
  label: string;
  latestValue: number | null;
  change: number;
  color: string;
  bgColor: string;
}

// ============================================================================
// Color config per measurement type
// ============================================================================

const typeColorConfig: Record<
  MeasurementType,
  { color: string; bgColor: string; textColor: string }
> = {
  poitrine: { color: '#E76F51', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  taille: { color: '#1B998B', bgColor: 'bg-teal-50', textColor: 'text-teal-600' },
  hanches: { color: '#F4A261', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
  cuisse: { color: '#8B5CF6', bgColor: 'bg-violet-50', textColor: 'text-violet-600' },
  bras: { color: '#3B82F6', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  mollet: { color: '#EC4899', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
};

const MEASUREMENT_TYPES: MeasurementType[] = [
  'poitrine',
  'taille',
  'hanches',
  'cuisse',
  'bras',
  'mollet',
];

// ============================================================================
// Component
// ============================================================================

export function MeasurementsSection({ patientId }: MeasurementsSectionProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  );

  const { data, isLoading, error } = usePatientMeasurements(
    patientId,
    undefined,
    timeRange
  );

  // Compute per-type summaries
  const typeSummaries = useMemo<TypeSummary[]>(() => {
    if (!data || data.measurements.length === 0) {
      return MEASUREMENT_TYPES.map(type => ({
        type,
        label: measurementTypeConfig[type].label,
        latestValue: null,
        change: 0,
        color: typeColorConfig[type].color,
        bgColor: typeColorConfig[type].bgColor,
      }));
    }

    return MEASUREMENT_TYPES.map(type => {
      const typeEntries = data.measurements
        .filter(m => m.measurement_type === type)
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      const latestValue =
        typeEntries.length > 0 ? typeEntries[0].value_cm : null;
      const oldestValue =
        typeEntries.length > 1
          ? typeEntries[typeEntries.length - 1].value_cm
          : null;
      const change =
        latestValue !== null && oldestValue !== null
          ? Math.round((latestValue - oldestValue) * 10) / 10
          : 0;

      return {
        type,
        label: measurementTypeConfig[type].label,
        latestValue,
        change,
        color: typeColorConfig[type].color,
        bgColor: typeColorConfig[type].bgColor,
      };
    });
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <Ruler className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-base font-semibold text-gray-800'>
            Mensurations
          </h3>
        </div>
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <Ruler className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-base font-semibold text-gray-800'>
            Mensurations
          </h3>
        </div>
        <p className='text-sm text-red-500 text-center py-4'>
          Erreur lors du chargement des donnees
        </p>
      </div>
    );
  }

  const handleTypeClick = (type: string) => {
    setSelectedType(prev => (prev === type ? undefined : type));
  };

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2'>
          <Ruler className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-base font-semibold text-gray-800'>
            Mensurations
          </h3>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Type cards grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mb-5'>
        {typeSummaries.map(summary => {
          const isSelected = selectedType === summary.type;
          const colors = typeColorConfig[summary.type];

          return (
            <button
              key={summary.type}
              onClick={() => handleTypeClick(summary.type)}
              className={`bg-white rounded-xl p-4 border border-gray-200 text-left transition-all ${
                isSelected
                  ? 'ring-2 ring-offset-1 ring-[#1B998B]'
                  : 'hover:shadow-sm'
              }`}
            >
              <div className='flex items-center justify-between mb-2'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${colors.bgColor}`}
                >
                  <span
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: colors.color }}
                  />
                </div>
                {summary.change !== 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      summary.change < 0
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-amber-600 bg-amber-50'
                    }`}
                  >
                    {summary.change > 0 ? '+' : ''}
                    {summary.change.toFixed(1)} cm
                  </span>
                )}
              </div>
              <p className='text-2xl font-bold text-gray-800'>
                {summary.latestValue !== null
                  ? summary.latestValue.toFixed(1)
                  : '--'}
                <span className='text-base font-normal text-gray-400 ml-0.5'>
                  cm
                </span>
              </p>
              <p className='text-xs text-gray-500 truncate mt-1'>{summary.label}</p>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <MeasurementChart
        entries={data?.measurements || []}
        selectedType={selectedType}
      />
    </div>
  );
}
