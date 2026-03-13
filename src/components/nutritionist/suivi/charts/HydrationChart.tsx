'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { NutriDailyHydration } from '@/types/nutritionist-suivi';

interface HydrationChartProps {
  dailyTotals: NutriDailyHydration[];
}

function formatDateFr(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatMlToLiters(ml: number): string {
  return `${(ml / 1000).toFixed(1)}L`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: NutriDailyHydration }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const dateFormatted = new Date(data.date + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-800 mb-1 capitalize">{dateFormatted}</p>
      <p className="text-blue-600">
        Total : {formatMlToLiters(data.total_ml)}
      </p>
      <p className="text-gray-500">
        Objectif : {formatMlToLiters(data.goal_ml)}
      </p>
      <p className={data.percentage >= 100 ? 'text-emerald-600 font-medium' : 'text-amber-600'}>
        {data.percentage}%
      </p>
    </div>
  );
}

export function HydrationChart({ dailyTotals }: HydrationChartProps) {
  if (!dailyTotals || dailyTotals.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
        Aucune donnee d&apos;hydratation disponible
      </div>
    );
  }

  const goalMl = dailyTotals[0]?.goal_ml || 2000;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={dailyTotals} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={formatDateFr}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(val: number) => formatMlToLiters(val)}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={goalMl}
          stroke="#1B998B"
          strokeDasharray="6 3"
          label={{
            value: 'Objectif',
            position: 'right',
            fill: '#1B998B',
            fontSize: 11,
          }}
        />
        <Bar dataKey="total_ml" radius={[4, 4, 0, 0]} maxBarSize={32}>
          {dailyTotals.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.percentage >= 100 ? '#3B82F6' : '#93C5FD'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default HydrationChart;
