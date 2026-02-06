'use client';

import React from 'react';
import type { WellbeingInsightData, InsightType } from '@/types/suivi';

interface WellbeingInsightProps {
  insights: WellbeingInsightData[];
}

// Configuration des styles par type d'insight
const insightStyles: Record<
  InsightType,
  {
    bg: string;
    border: string;
    iconBg: string;
    title: string;
    titleColor: string;
    textColor: string;
  }
> = {
  positive: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-100',
    title: 'Bonne nouvelle',
    titleColor: 'text-emerald-800',
    textColor: 'text-emerald-700',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100',
    title: "Point d'attention",
    titleColor: 'text-amber-800',
    textColor: 'text-amber-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    title: 'Observation',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700',
  },
};

export function WellbeingInsight({ insights }: WellbeingInsightProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className='space-y-4'>
      <h2 className='font-semibold text-gray-800'>Insights automatiques</h2>
      <div className='grid gap-4'>
        {insights.map(insight => {
          const style = insightStyles[insight.type];
          return (
            <div
              key={insight.id}
              className={`${style.bg} rounded-xl p-5 border ${style.border}`}
            >
              <div className='flex items-start gap-4'>
                <div
                  className={`w-10 h-10 ${style.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <span className='text-xl'>{insight.icon || '💡'}</span>
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className={`font-medium ${style.titleColor}`}>
                    {style.title}
                  </h3>
                  <p className={`text-sm ${style.textColor} mt-1`}>
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WellbeingInsight;
