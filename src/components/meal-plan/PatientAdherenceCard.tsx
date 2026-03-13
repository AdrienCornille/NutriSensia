'use client';

import React from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
import { usePatientPlanAdherence } from '@/hooks/usePatientMealPlan';

function getRateColor(rate: number | null): string {
  if (rate == null) return 'text-gray-400';
  if (rate >= 80) return 'text-[#1B998B]';
  if (rate >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function getRateRingColor(rate: number | null): string {
  if (rate == null) return 'stroke-gray-200';
  if (rate >= 80) return 'stroke-[#1B998B]';
  if (rate >= 50) return 'stroke-amber-500';
  return 'stroke-red-500';
}

function AdherenceRing({ rate }: { rate: number | null }) {
  const displayRate = rate ?? 0;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (displayRate / 100) * circumference;

  return (
    <div className='relative w-28 h-28 mx-auto'>
      <svg className='w-full h-full -rotate-90' viewBox='0 0 96 96'>
        <circle
          cx='48' cy='48' r='40'
          fill='none'
          strokeWidth='6'
          className='stroke-gray-100'
        />
        <circle
          cx='48' cy='48' r='40'
          fill='none'
          strokeWidth='6'
          strokeLinecap='round'
          className={getRateRingColor(rate)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className={`text-2xl font-bold ${getRateColor(rate)}`}>
          {rate != null ? `${Math.round(rate)}%` : '—'}
        </span>
      </div>
    </div>
  );
}

const STATUS_CONFIG = [
  { key: 'followed_meals', label: 'Suivi', color: 'bg-[#1B998B]', textColor: 'text-[#1B998B]' },
  { key: 'partial_meals', label: 'Partiel', color: 'bg-amber-500', textColor: 'text-amber-600' },
  { key: 'skipped_meals', label: 'Manqué', color: 'bg-red-500', textColor: 'text-red-600' },
  { key: 'not_tracked_meals', label: 'Non suivi', color: 'bg-gray-300', textColor: 'text-gray-500' },
] as const;

interface PatientAdherenceCardProps {
  enabled?: boolean;
}

export function PatientAdherenceCard({ enabled = true }: PatientAdherenceCardProps) {
  const { data, isLoading } = usePatientPlanAdherence(enabled);

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  const totalMeals = summary?.total_meals ?? 0;
  const rate = summary?.adherence_rate ?? null;

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-5'>
      <div className='flex items-center gap-2 mb-4'>
        <TrendingUp className='w-5 h-5 text-[#1B998B]' />
        <h3 className='font-semibold text-gray-800'>Adhérence au plan</h3>
      </div>

      {totalMeals === 0 ? (
        <div className='text-center py-6'>
          <div className='w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <TrendingUp className='w-7 h-7 text-gray-300' />
          </div>
          <p className='text-sm text-gray-500 mb-1'>Pas encore de données</p>
          <p className='text-xs text-gray-400'>
            Vos statistiques d&apos;adhérence apparaîtront ici au fur et à mesure de votre suivi.
          </p>
        </div>
      ) : (
        <>
          {/* Adherence ring */}
          <AdherenceRing rate={rate} />

          {/* Stacked bar */}
          <div className='h-2.5 bg-gray-100 rounded-full overflow-hidden flex mt-4 mb-4'>
            {STATUS_CONFIG.map(cfg => {
              const count = (summary as unknown as Record<string, number>)?.[cfg.key] ?? 0;
              const pct = totalMeals > 0 ? (count / totalMeals) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={cfg.key}
                  className={`${cfg.color} h-full transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>

          {/* Breakdown */}
          <div className='space-y-2'>
            {STATUS_CONFIG.map(cfg => {
              const count = (summary as unknown as Record<string, number>)?.[cfg.key] ?? 0;
              return (
                <div key={cfg.key} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                    <span className='text-sm text-gray-600'>{cfg.label}</span>
                  </div>
                  <span className={`text-sm font-medium ${cfg.textColor}`}>{count}</span>
                </div>
              );
            })}
          </div>

          <div className='mt-3 pt-3 border-t border-gray-100'>
            <p className='text-xs text-gray-400 text-center'>
              Sur {totalMeals} repas planifiés
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default PatientAdherenceCard;
