'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroComparisonChartProps {
  actual: MacroValues;
  planned?: MacroValues | null;
}

const macroLabels: Record<keyof MacroValues, string> = {
  calories: 'Calories',
  protein: 'Proteines',
  carbs: 'Glucides',
  fat: 'Lipides',
};

const macroColors: Record<keyof MacroValues, string> = {
  calories: '#F97316',
  protein: '#3B82F6',
  carbs: '#F59E0B',
  fat: '#F43F5E',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-800 mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {Math.round(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function MacroComparisonChart({ actual, planned }: MacroComparisonChartProps) {
  // Check if all values are zero
  const allZero =
    actual.calories === 0 &&
    actual.protein === 0 &&
    actual.carbs === 0 &&
    actual.fat === 0 &&
    (!planned || (planned.calories === 0 && planned.protein === 0 && planned.carbs === 0 && planned.fat === 0));

  if (allZero) {
    return null;
  }

  const keys: (keyof MacroValues)[] = ['calories', 'protein', 'carbs', 'fat'];

  const data = keys.map(key => ({
    name: macroLabels[key],
    actual: Math.round(actual[key]),
    ...(planned ? { planned: Math.round(planned[key]) } : {}),
    color: macroColors[key],
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        {planned && (
          <>
            <Legend
              wrapperStyle={{ fontSize: '11px' }}
              iconType="square"
              iconSize={10}
            />
            <Bar
              dataKey="planned"
              name="Prevu"
              fill="#D1D5DB"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </>
        )}
        <Bar
          dataKey="actual"
          name="Reel"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        >
          {/* Note: individual cell coloring is not straightforward with grouped bars
              so we use a single fill color for grouped mode */}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default MacroComparisonChart;
