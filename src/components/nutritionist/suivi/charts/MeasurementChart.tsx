'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { MeasurementType } from '@/types/suivi';
import { measurementTypeConfig } from '@/types/suivi';

// ============================================================================
// Types
// ============================================================================

interface MeasurementChartProps {
  entries: Array<{
    measurement_type: string;
    value_cm: number;
    date: string;
  }>;
  selectedType?: string;
}

interface ChartPoint {
  date: string;
  label: string;
  [key: string]: number | string | undefined;
}

// ============================================================================
// Color config per measurement type
// ============================================================================

const measurementColors: Record<string, string> = {
  poitrine: '#E76F51',
  taille: '#1B998B',
  hanches: '#F4A261',
  cuisse: '#8B5CF6',
  bras: '#3B82F6',
  mollet: '#EC4899',
};

function getTypeLabel(type: string): string {
  const config = measurementTypeConfig[type as MeasurementType];
  return config ? config.label : type;
}

// ============================================================================
// Custom Tooltip
// ============================================================================

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className='bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-xs'>
      <p className='font-medium text-gray-800 mb-1.5'>{label}</p>
      <div className='space-y-1'>
        {payload.map(entry => (
          <div
            key={entry.dataKey}
            className='flex items-center justify-between gap-4'
          >
            <span className='flex items-center gap-1.5'>
              <span
                className='w-2 h-2 rounded-full'
                style={{ backgroundColor: entry.color }}
              />
              <span className='text-gray-500'>{getTypeLabel(entry.dataKey)}</span>
            </span>
            <span className='font-semibold text-gray-800'>
              {entry.value.toFixed(1)} cm
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function MeasurementChart({
  entries,
  selectedType,
}: MeasurementChartProps) {
  const { chartData, types } = useMemo(() => {
    if (entries.length === 0) return { chartData: [], types: [] };

    // Filter by selected type if provided
    const filteredEntries = selectedType
      ? entries.filter(e => e.measurement_type === selectedType)
      : entries;

    // Get unique types
    const uniqueTypes = Array.from(
      new Set(filteredEntries.map(e => e.measurement_type))
    );

    // Group entries by date, keeping the latest per type per date
    const dateMap = new Map<string, Record<string, number>>();
    // Process in reverse (entries come DESC from API) so ASC order in chart
    const sorted = [...filteredEntries].reverse();

    for (const entry of sorted) {
      if (!dateMap.has(entry.date)) {
        dateMap.set(entry.date, {});
      }
      const dateEntry = dateMap.get(entry.date)!;
      dateEntry[entry.measurement_type] = entry.value_cm;
    }

    // Build chart data
    const data: ChartPoint[] = Array.from(dateMap.entries()).map(
      ([date, values]) => ({
        date,
        label: new Date(date).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        }),
        ...values,
      })
    );

    return { chartData: data, types: uniqueTypes };
  }, [entries, selectedType]);

  if (entries.length === 0 || chartData.length === 0) {
    return (
      <p className='text-sm text-gray-400 text-center py-6'>
        Aucune mensuration enregistree
      </p>
    );
  }

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray='3 3'
            stroke='#f3f4f6'
            vertical={false}
          />
          <XAxis
            dataKey='label'
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            interval='preserveStartEnd'
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}cm`}
          />
          <Tooltip content={<ChartTooltip />} />

          {types.map(type => (
            <Line
              key={type}
              type='monotone'
              dataKey={type}
              stroke={measurementColors[type] || '#6B7280'}
              strokeWidth={2}
              dot={{
                r: 3,
                fill: measurementColors[type] || '#6B7280',
                stroke: '#fff',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5,
                fill: measurementColors[type] || '#6B7280',
                stroke: '#fff',
                strokeWidth: 2,
              }}
              connectNulls
              name={getTypeLabel(type)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className='flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500'>
        {types.map(type => (
          <span key={type} className='flex items-center gap-1.5'>
            <span
              className='w-3 h-0.5 rounded'
              style={{ backgroundColor: measurementColors[type] || '#6B7280' }}
            />
            {getTypeLabel(type)}
          </span>
        ))}
      </div>
    </div>
  );
}
