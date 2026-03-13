'use client';

import React, { useState } from 'react';
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  BarChart3,
  Video,
  Building2,
  Phone,
} from 'lucide-react';
import { useConsultationStatistics } from '@/hooks/useNutritionistStatistics';

// ============================================================================
// KPI Card
// ============================================================================

const colorStyles: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  green: { bg: 'bg-green-50', icon: 'text-green-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
  red: { bg: 'bg-red-50', icon: 'text-red-600' },
  teal: { bg: 'bg-teal-50', icon: 'text-teal-600' },
};

function KPICard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
  color: string;
}) {
  const c = colorStyles[color] || colorStyles.blue;
  return (
    <div className='bg-white rounded-xl p-5 border border-gray-200'>
      <div className='flex items-center gap-3 mb-2'>
        <div
          className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center ${c.icon}`}
        >
          {icon}
        </div>
        <p className='text-sm text-gray-500'>{label}</p>
      </div>
      <p className='text-2xl font-semibold text-gray-800'>{value}</p>
      <p className='text-xs text-gray-500 mt-1'>{subtitle}</p>
    </div>
  );
}

// ============================================================================
// Mode Distribution Bar
// ============================================================================

function ModeDistributionBar({
  distribution,
  total,
}: {
  distribution: { visio: number; cabinet: number; phone: number };
  total: number;
}) {
  const pct = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0);
  const visioPct = pct(distribution.visio);
  const cabinetPct = pct(distribution.cabinet);
  const phonePct = pct(distribution.phone);

  const items = [
    {
      label: 'Visio',
      icon: <Video className='w-3.5 h-3.5' />,
      count: distribution.visio,
      pct: visioPct,
      barColor: 'bg-purple-500',
      dotColor: 'bg-purple-500',
    },
    {
      label: 'Cabinet',
      icon: <Building2 className='w-3.5 h-3.5' />,
      count: distribution.cabinet,
      pct: cabinetPct,
      barColor: 'bg-blue-500',
      dotColor: 'bg-blue-500',
    },
    {
      label: 'Telephone',
      icon: <Phone className='w-3.5 h-3.5' />,
      count: distribution.phone,
      pct: phonePct,
      barColor: 'bg-green-500',
      dotColor: 'bg-green-500',
    },
  ];

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h3 className='text-sm font-medium text-gray-700 mb-4'>
        Repartition par mode
      </h3>

      {total === 0 ? (
        <p className='text-sm text-gray-400 text-center py-4'>
          Aucune consultation ce mois
        </p>
      ) : (
        <>
          {/* Stacked bar */}
          <div className='h-3 bg-gray-100 rounded-full overflow-hidden flex'>
            {items.map(
              item =>
                item.pct > 0 && (
                  <div
                    key={item.label}
                    className={`${item.barColor} h-full`}
                    style={{ width: `${item.pct}%` }}
                  />
                )
            )}
          </div>

          {/* Legend */}
          <div className='flex gap-6 mt-4'>
            {items.map(item => (
              <div key={item.label} className='flex items-center gap-2'>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`}
                />
                <span className='text-xs text-gray-500 flex items-center gap-1'>
                  {item.icon}
                  {item.label}
                </span>
                <span className='text-xs font-semibold text-gray-700'>
                  {item.count}{' '}
                  <span className='font-normal text-gray-400'>
                    ({item.pct}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Monthly Trend Chart (CSS-only)
// ============================================================================

function MonthlyTrendChart({
  trend,
}: {
  trend: { month: string; label: string; count: number }[];
}) {
  const maxCount = Math.max(...trend.map(t => t.count), 1);

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h3 className='text-sm font-medium text-gray-700 mb-4'>
        Tendance (6 derniers mois)
      </h3>

      <div className='flex items-end justify-between gap-3 h-32'>
        {trend.map((item, i) => {
          const heightPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const isLast = i === trend.length - 1;
          return (
            <div
              key={item.month}
              className='flex-1 flex flex-col items-center'
            >
              <span className='text-xs text-gray-500 mb-1'>{item.count}</span>
              <div
                className={`w-full rounded-t-md transition-all ${
                  isLast ? 'bg-[#1B998B]' : 'bg-[#1B998B]/40'
                }`}
                style={{ height: `${Math.max(heightPct, 4)}%` }}
              />
              <span className='text-xs text-gray-500 mt-2 capitalize'>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Main Section
// ============================================================================

export function ConsultationStatsSection() {
  const now = new Date();
  const currentYYYYMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
    undefined
  );

  const effectiveMonth = selectedMonth || currentYYYYMM;
  const isCurrentMonth = effectiveMonth === currentYYYYMM;

  const { data: stats, isLoading, error } = useConsultationStatistics(
    selectedMonth
  );

  function goToPreviousMonth() {
    const [y, m] = effectiveMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    setSelectedMonth(
      `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
    );
  }

  function goToNextMonth() {
    if (isCurrentMonth) return;
    const [y, m] = effectiveMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    const nextKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    if (nextKey === currentYYYYMM) {
      setSelectedMonth(undefined);
    } else {
      setSelectedMonth(nextKey);
    }
  }

  // Loading
  if (isLoading) {
    return (
      <div className='bg-white rounded-xl p-12 border border-gray-200'>
        <div className='flex items-center justify-center'>
          <Loader2 className='w-5 h-5 animate-spin text-[#1B998B]' />
          <span className='ml-2 text-sm text-gray-500'>
            Chargement des statistiques...
          </span>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className='bg-white rounded-xl p-8 border border-gray-200'>
        <div className='flex items-center justify-center text-red-500'>
          <AlertCircle className='w-5 h-5 mr-2' />
          <span className='text-sm'>
            Erreur lors du chargement des statistiques
          </span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <section className='space-y-6'>
      {/* Header + month nav */}
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Statistiques de consultations
        </h2>
        <div className='flex items-center gap-2'>
          <button
            onClick={goToPreviousMonth}
            className='p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>
          <span className='text-sm font-medium text-gray-700 min-w-[160px] text-center'>
            {stats.period.label}
          </span>
          <button
            onClick={goToNextMonth}
            disabled={isCurrentMonth}
            className={`p-1.5 rounded-lg transition-colors ${
              isCurrentMonth
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
        <KPICard
          icon={<Calendar className='w-4 h-4' />}
          label='Consultations'
          value={stats.total_consultations}
          subtitle='ce mois'
          color='blue'
        />
        <KPICard
          icon={<Clock className='w-4 h-4' />}
          label='Duree moyenne'
          value={
            stats.average_duration_minutes
              ? `${stats.average_duration_minutes} min`
              : '--'
          }
          subtitle='par consultation'
          color='green'
        />
        <KPICard
          icon={<Users className='w-4 h-4' />}
          label='Patients vus'
          value={stats.unique_patients}
          subtitle='ce mois'
          color='purple'
        />
        <KPICard
          icon={<AlertTriangle className='w-4 h-4' />}
          label='No-show'
          value={`${stats.no_show_rate}%`}
          subtitle={`${stats.no_show_count} absence${stats.no_show_count !== 1 ? 's' : ''}`}
          color={stats.no_show_rate > 15 ? 'red' : 'amber'}
        />
        <KPICard
          icon={<BarChart3 className='w-4 h-4' />}
          label='Type principal'
          value={stats.by_type[0]?.count || 0}
          subtitle={stats.by_type[0]?.label || 'Aucun'}
          color='teal'
        />
      </div>

      {/* Distribution + Trend */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <ModeDistributionBar
          distribution={stats.mode_distribution}
          total={stats.total_consultations}
        />
        <MonthlyTrendChart trend={stats.monthly_trend} />
      </div>

      {/* By-type breakdown */}
      {stats.by_type.length > 1 && (
        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <h3 className='text-sm font-medium text-gray-700 mb-3'>
            Repartition par type
          </h3>
          <div className='space-y-2'>
            {stats.by_type.map(t => (
              <div
                key={t.type}
                className='flex items-center justify-between py-1'
              >
                <span className='text-sm text-gray-600'>{t.label}</span>
                <span className='text-sm font-semibold text-gray-800'>
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
