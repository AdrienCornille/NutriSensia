'use client';

import React from 'react';
import { formatShortDate } from '@/types/agenda';

interface AgendaStatsProps {
  totalConsultations: number;
  firstConsultationDate: Date | null;
  followUpDuration: string;
}

export function AgendaStats({
  totalConsultations,
  firstConsultationDate,
  followUpDuration,
}: AgendaStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <p className="text-sm text-gray-500">Total consultations</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{totalConsultations}</p>
      </div>
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <p className="text-sm text-gray-500">Première consultation</p>
        <p className="text-lg font-bold text-gray-800 mt-1">
          {firstConsultationDate ? formatShortDate(firstConsultationDate) : '-'}
        </p>
      </div>
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <p className="text-sm text-gray-500">Durée totale de suivi</p>
        <p className="text-3xl font-bold text-emerald-600 mt-1">
          {followUpDuration.split(' ')[0]}{' '}
          <span className="text-lg font-normal text-gray-400">
            {followUpDuration.split(' ').slice(1).join(' ')}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AgendaStats;
