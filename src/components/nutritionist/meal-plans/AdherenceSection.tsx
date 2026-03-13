'use client';

import React, { useState, useMemo } from 'react';
import {
  Loader2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { usePlanAdherence, type AdherenceDay } from '@/hooks/useNutritionistMealPlans';

// ============================================================================
// Types
// ============================================================================

interface AdherenceSectionProps {
  patientId: string;
  planId: string;
}

type PeriodFilter = '7' | '14' | '30' | 'all';

interface ChartPoint {
  date: string;
  label: string;
  adherence: number | null;
  movingAvg: number | null;
  followed: number;
  partial: number;
  skipped: number;
  total: number;
}

// ============================================================================
// Helpers
// ============================================================================

function computeMovingAverage(daily: AdherenceDay[], window: number): (number | null)[] {
  return daily.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = daily.slice(start, i + 1).filter(d => d.adherence_rate != null);
    if (slice.length === 0) return null;
    const avg = slice.reduce((sum, d) => sum + (d.adherence_rate ?? 0), 0) / slice.length;
    return Math.round(avg * 10) / 10;
  });
}

function filterByPeriod(daily: AdherenceDay[], period: PeriodFilter): AdherenceDay[] {
  if (period === 'all') return daily;
  const days = parseInt(period, 10);
  return daily.slice(-days);
}

function buildChartData(daily: AdherenceDay[], period: PeriodFilter): ChartPoint[] {
  const filtered = filterByPeriod(daily, period);
  const movingAvg = computeMovingAverage(filtered, 3);

  return filtered.map((day, i) => ({
    date: day.date,
    label: new Date(day.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    }),
    adherence: day.adherence_rate,
    movingAvg: movingAvg[i],
    followed: day.followed,
    partial: day.partial,
    skipped: day.skipped,
    total: day.total,
  }));
}

// ============================================================================
// Custom Tooltip
// ============================================================================

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: ChartPoint }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className='bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-xs'>
      <p className='font-medium text-gray-800 mb-1.5'>{point.label}</p>
      <div className='space-y-1'>
        <div className='flex items-center justify-between gap-4'>
          <span className='text-gray-500'>Adhérence</span>
          <span className='font-semibold text-gray-800'>
            {point.adherence != null ? `${point.adherence}%` : '--'}
          </span>
        </div>
        {point.movingAvg != null && (
          <div className='flex items-center justify-between gap-4'>
            <span className='text-gray-500'>Tendance (3j)</span>
            <span className='font-medium text-[#1B998B]'>{point.movingAvg}%</span>
          </div>
        )}
        <hr className='border-gray-100' />
        <div className='flex items-center justify-between gap-4'>
          <span className='flex items-center gap-1 text-emerald-600'>
            <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full' />
            Suivis
          </span>
          <span>{point.followed}/{point.total}</span>
        </div>
        <div className='flex items-center justify-between gap-4'>
          <span className='flex items-center gap-1 text-amber-600'>
            <span className='w-1.5 h-1.5 bg-amber-400 rounded-full' />
            Partiels
          </span>
          <span>{point.partial}/{point.total}</span>
        </div>
        <div className='flex items-center justify-between gap-4'>
          <span className='flex items-center gap-1 text-red-600'>
            <span className='w-1.5 h-1.5 bg-red-400 rounded-full' />
            Sautés
          </span>
          <span>{point.skipped}/{point.total}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Period Filter Buttons
// ============================================================================

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: '7', label: '7j' },
  { value: '14', label: '14j' },
  { value: '30', label: '30j' },
  { value: 'all', label: 'Tout' },
];

// ============================================================================
// Component
// ============================================================================

export function AdherenceSection({ patientId, planId }: AdherenceSectionProps) {
  const { data, isLoading } = usePlanAdherence(patientId, planId);
  const [period, setPeriod] = useState<PeriodFilter>('all');

  const chartData = useMemo(() => {
    if (!data) return [];
    return buildChartData(data.daily, period);
  }, [data, period]);

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <TrendingUp className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-base font-semibold text-gray-800'>Adhérence au plan</h3>
        </div>
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
        </div>
      </div>
    );
  }

  if (!data || data.summary.total_meals === 0) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <TrendingUp className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-base font-semibold text-gray-800'>Adhérence au plan</h3>
        </div>
        <p className='text-sm text-gray-400 text-center py-4'>
          Pas encore de données d&apos;adhérence
        </p>
      </div>
    );
  }

  const { summary, daily } = data;
  const rate = summary.adherence_rate;
  const rateColor =
    rate === null
      ? 'text-gray-400'
      : rate >= 80
        ? 'text-emerald-600'
        : rate >= 50
          ? 'text-amber-600'
          : 'text-red-600';
  const rateLabel = rate === null ? '--' : `${rate}%`;

  // Stats cards
  const stats = [
    {
      label: 'Suivis',
      count: summary.followed_meals,
      icon: <CheckCircle2 className='w-4 h-4' />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Partiels',
      count: summary.partial_meals,
      icon: <AlertTriangle className='w-4 h-4' />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Sautés',
      count: summary.skipped_meals,
      icon: <XCircle className='w-4 h-4' />,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Non suivi',
      count: summary.not_tracked_meals,
      icon: <MinusCircle className='w-4 h-4' />,
      color: 'text-gray-400',
      bg: 'bg-gray-50',
    },
  ];

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2'>
          <TrendingUp className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-base font-semibold text-gray-800'>Adhérence au plan</h3>
        </div>
        <div className='text-right'>
          <p className={`text-2xl font-bold ${rateColor}`}>{rateLabel}</p>
          <p className='text-xs text-gray-400'>taux global</p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className='grid grid-cols-4 gap-3 mb-5'>
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-lg p-3 text-center`}>
            <div className={`flex items-center justify-center mb-1 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className={`text-lg font-semibold ${stat.color}`}>{stat.count}</p>
            <p className='text-xs text-gray-500'>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stacked progress bar */}
      {summary.total_meals > 0 && (
        <div className='mb-5'>
          <div className='h-3 bg-gray-100 rounded-full overflow-hidden flex'>
            {summary.followed_meals > 0 && (
              <div
                className='bg-emerald-500 h-full'
                style={{
                  width: `${(summary.followed_meals / summary.total_meals) * 100}%`,
                }}
              />
            )}
            {summary.partial_meals > 0 && (
              <div
                className='bg-amber-400 h-full'
                style={{
                  width: `${(summary.partial_meals / summary.total_meals) * 100}%`,
                }}
              />
            )}
            {summary.skipped_meals > 0 && (
              <div
                className='bg-red-400 h-full'
                style={{
                  width: `${(summary.skipped_meals / summary.total_meals) * 100}%`,
                }}
              />
            )}
          </div>
          <div className='flex items-center gap-4 mt-2 text-xs text-gray-500'>
            <span className='flex items-center gap-1'>
              <span className='w-2 h-2 bg-emerald-500 rounded-full' /> Suivis
            </span>
            <span className='flex items-center gap-1'>
              <span className='w-2 h-2 bg-amber-400 rounded-full' /> Partiels
            </span>
            <span className='flex items-center gap-1'>
              <span className='w-2 h-2 bg-red-400 rounded-full' /> Sautés
            </span>
            <span className='flex items-center gap-1'>
              <span className='w-2 h-2 bg-gray-200 rounded-full' /> Non suivi
            </span>
          </div>
        </div>
      )}

      {/* Adherence trend chart */}
      {daily.length > 0 && (
        <div>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-xs font-medium text-gray-500 uppercase'>
              Graphique d&apos;adhérence
            </h4>
            <div className='flex items-center gap-1'>
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    period === opt.value
                      ? 'bg-[#1B998B] text-white font-medium'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {chartData.length > 0 ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f3f4f6' vertical={false} />
                  <XAxis
                    dataKey='label'
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    interval='preserveStartEnd'
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip content={<ChartTooltip />} />

                  {/* Area fill under the adherence line */}
                  <Area
                    type='monotone'
                    dataKey='adherence'
                    fill='#1B998B'
                    fillOpacity={0.08}
                    stroke='none'
                    connectNulls
                  />

                  {/* Daily adherence dots + line */}
                  <Line
                    type='monotone'
                    dataKey='adherence'
                    stroke='#1B998B'
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#1B998B', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: '#1B998B', stroke: '#fff', strokeWidth: 2 }}
                    connectNulls
                    name='Adhérence'
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
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className='text-sm text-gray-400 text-center py-6'>
              Aucune donnée sur cette période
            </p>
          )}

          {/* Legend */}
          <div className='flex items-center gap-4 mt-2 text-xs text-gray-500'>
            <span className='flex items-center gap-1.5'>
              <span className='w-3 h-0.5 bg-[#1B998B] rounded' />
              Adhérence quotidienne
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
          </div>
        </div>
      )}
    </div>
  );
}
