'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

interface WeightChartProps {
  entries: Array<{ weight_kg: number; date: string }>;
  goalWeight: number | null;
}

interface ChartPoint {
  date: string;
  label: string;
  weight: number;
  movingAvg: number | null;
}

// ============================================================================
// Helpers
// ============================================================================

function computeMovingAverage(
  values: number[],
  window: number
): (number | null)[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    if (slice.length === 0) return null;
    const avg = slice.reduce((sum, v) => sum + v, 0) / slice.length;
    return Math.round(avg * 100) / 100;
  });
}

function buildChartData(
  entries: Array<{ weight_kg: number; date: string }>
): ChartPoint[] {
  // Entries come DESC from API; reverse to ASC for chart (left=oldest, right=newest)
  const sorted = [...entries].reverse();
  const weights = sorted.map(e => e.weight_kg);
  const movingAvg = computeMovingAverage(weights, 3);

  return sorted.map((entry, i) => ({
    date: entry.date,
    label: new Date(entry.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    }),
    weight: entry.weight_kg,
    movingAvg: movingAvg[i],
  }));
}

// ============================================================================
// Custom Tooltip
// ============================================================================

function ChartTooltip({
  active,
  payload,
  goalWeight,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ChartPoint }>;
  goalWeight: number | null;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const goalDistance =
    goalWeight !== null
      ? Math.round((point.weight - goalWeight) * 100) / 100
      : null;

  return (
    <div className='bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-xs'>
      <p className='font-medium text-gray-800 mb-1.5'>{point.label}</p>
      <div className='space-y-1'>
        <div className='flex items-center justify-between gap-4'>
          <span className='text-gray-500'>Poids</span>
          <span className='font-semibold text-gray-800'>
            {point.weight.toFixed(1)} kg
          </span>
        </div>
        {point.movingAvg != null && (
          <div className='flex items-center justify-between gap-4'>
            <span className='text-gray-500'>Tendance (3j)</span>
            <span className='font-medium text-[#F4A261]'>
              {point.movingAvg.toFixed(1)} kg
            </span>
          </div>
        )}
        {goalDistance !== null && (
          <>
            <hr className='border-gray-100' />
            <div className='flex items-center justify-between gap-4'>
              <span className='text-gray-500'>Distance objectif</span>
              <span
                className={`font-medium ${
                  goalDistance === 0
                    ? 'text-emerald-600'
                    : goalDistance > 0
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                }`}
              >
                {goalDistance > 0 ? '+' : ''}
                {goalDistance.toFixed(1)} kg
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function WeightChart({ entries, goalWeight }: WeightChartProps) {
  const chartData = useMemo(() => buildChartData(entries), [entries]);

  if (entries.length === 0) {
    return (
      <p className='text-sm text-gray-400 text-center py-6'>
        Aucune donnee de poids enregistree
      </p>
    );
  }

  // Compute Y axis domain with some padding
  const weights = chartData.map(d => d.weight);
  const allValues = goalWeight !== null ? [...weights, goalWeight] : weights;
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = Math.max((maxVal - minVal) * 0.1, 1);
  const yMin = Math.floor(minVal - padding);
  const yMax = Math.ceil(maxVal + padding);

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width='100%' height='100%'>
        <ComposedChart
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
            domain={[yMin, yMax]}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}kg`}
          />
          <Tooltip
            content={<ChartTooltip goalWeight={goalWeight} />}
          />

          {/* Area fill under the weight line */}
          <Area
            type='monotone'
            dataKey='weight'
            fill='#1B998B'
            fillOpacity={0.08}
            stroke='none'
            connectNulls
          />

          {/* Weight dots + line */}
          <Line
            type='monotone'
            dataKey='weight'
            stroke='#1B998B'
            strokeWidth={2}
            dot={{ r: 3, fill: '#1B998B', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: '#1B998B', stroke: '#fff', strokeWidth: 2 }}
            connectNulls
            name='Poids'
          />

          {/* Moving average trend line */}
          <Line
            type='monotone'
            dataKey='movingAvg'
            stroke='#F4A261'
            strokeWidth={2}
            strokeDasharray='6 3'
            dot={false}
            connectNulls
            name='Tendance (3j)'
          />

          {/* Goal reference line */}
          {goalWeight !== null && (
            <ReferenceLine
              y={goalWeight}
              stroke='#E76F51'
              strokeDasharray='8 4'
              label={{
                value: 'Objectif',
                position: 'insideTopRight',
                fill: '#E76F51',
                fontSize: 11,
                fontWeight: 500,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className='flex items-center gap-4 mt-2 text-xs text-gray-500'>
        <span className='flex items-center gap-1.5'>
          <span className='w-3 h-0.5 bg-[#1B998B] rounded' />
          Poids
        </span>
        <span className='flex items-center gap-1.5'>
          <span
            className='w-3 h-0.5 rounded'
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #F4A261 0, #F4A261 4px, transparent 4px, transparent 6px)',
            }}
          />
          Tendance (moy. 3j)
        </span>
        {goalWeight !== null && (
          <span className='flex items-center gap-1.5'>
            <span
              className='w-3 h-0.5 rounded'
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #E76F51 0, #E76F51 4px, transparent 4px, transparent 6px)',
              }}
            />
            Objectif ({goalWeight} kg)
          </span>
        )}
      </div>
    </div>
  );
}
