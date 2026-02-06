'use client';

import React from 'react';
import type { Objective } from '@/types/dossier';
import { statusConfig, objectiveCategoryConfig } from '@/types/dossier';

interface ObjectiveCardProps {
  objective: Objective;
}

export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const categoryConf = objectiveCategoryConfig[objective.category];
  const statusConf = statusConfig[objective.status];

  const getProgressBarColor = () => {
    switch (objective.status) {
      case 'on-track':
        return 'bg-emerald-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'needs-attention':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryConf.bgColor}`}
          >
            <span>{categoryConf.icon}</span>
          </div>
          <div>
            <h3 className='font-semibold text-gray-800'>{objective.title}</h3>
            <span className='text-xs text-gray-500'>{objective.category}</span>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusConf.bgColor} ${statusConf.textColor}`}
        >
          {statusConf.label}
        </span>
      </div>

      <div className='grid grid-cols-3 gap-4 mb-4'>
        <div className='bg-gray-50 rounded-lg p-3'>
          <p className='text-xs text-gray-500'>Départ</p>
          <p className='font-medium text-gray-700'>{objective.startValue}</p>
        </div>
        <div className='bg-[#1B998B]/10 rounded-lg p-3'>
          <p className='text-xs text-gray-500'>Actuel</p>
          <p className='font-medium text-[#1B998B]'>{objective.current}</p>
        </div>
        <div className='bg-blue-50 rounded-lg p-3'>
          <p className='text-xs text-gray-500'>Objectif</p>
          <p className='font-medium text-blue-700'>{objective.target}</p>
        </div>
      </div>

      <div>
        <div className='flex justify-between text-sm mb-1'>
          <span className='text-gray-500'>Progression</span>
          <span className='font-medium text-gray-700'>
            {objective.progress}%
          </span>
        </div>
        <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: `${objective.progress}%` }}
          />
        </div>
      </div>

      {objective.deadline && (
        <div className='mt-4 flex items-center gap-2 text-sm text-gray-500'>
          <span>📅</span>
          <span>Échéance: {objective.deadline}</span>
        </div>
      )}
    </div>
  );
}

export default ObjectiveCard;
