'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ActivityLogEntry {
  date: string;
  duration_minutes: number;
  calories_burned: number | null;
  intensity: string;
  activity_type: {
    slug: string;
    name_fr: string;
    emoji: string;
  };
}

interface ActivityChartProps {
  logs: ActivityLogEntry[];
}

interface AggregatedDay {
  date: string;
  dateLabel: string;
  duration: number;
  calories: number;
  types: string[];
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}min` : `${hours}h`;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload as AggregatedDay;
  if (!data) return null;

  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      <div className="font-medium mb-1">{data.dateLabel}</div>
      <div>Duree: {formatDuration(data.duration)}</div>
      <div>Calories: {data.calories > 0 ? `${data.calories} kcal` : '-'}</div>
      {data.types.length > 0 && (
        <div className="mt-1 text-gray-300">{data.types.join(', ')}</div>
      )}
    </div>
  );
}

export function ActivityChart({ logs }: ActivityChartProps) {
  const chartData = useMemo(() => {
    if (logs.length === 0) return [];

    // Aggregate by date
    const byDate = new Map<
      string,
      { duration: number; calories: number; types: Set<string> }
    >();

    for (const log of logs) {
      const existing = byDate.get(log.date);
      const typeName = log.activity_type
        ? `${log.activity_type.emoji} ${log.activity_type.name_fr}`
        : '';

      if (existing) {
        existing.duration += log.duration_minutes;
        existing.calories += log.calories_burned || 0;
        if (typeName) existing.types.add(typeName);
      } else {
        const types = new Set<string>();
        if (typeName) types.add(typeName);
        byDate.set(log.date, {
          duration: log.duration_minutes,
          calories: log.calories_burned || 0,
          types,
        });
      }
    }

    // Convert to sorted array
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, agg]) => ({
        date,
        dateLabel: new Date(date).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'numeric',
        }),
        duration: agg.duration,
        calories: agg.calories,
        types: Array.from(agg.types),
      }));
  }, [logs]);

  if (chartData.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 py-8">
        Aucune activite enregistree sur cette periode
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="dateLabel"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
          label={{
            value: 'min',
            position: 'insideTopLeft',
            offset: -5,
            style: { fontSize: 10, fill: '#9CA3AF' },
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
          label={{
            value: 'kcal',
            position: 'insideTopRight',
            offset: -5,
            style: { fontSize: 10, fill: '#9CA3AF' },
          }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
        <Bar
          yAxisId="left"
          dataKey="duration"
          fill="#1B998B"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
          name="Duree (min)"
        />
        <Bar
          yAxisId="right"
          dataKey="calories"
          fill="#F4A261"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
          name="Calories (kcal)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
