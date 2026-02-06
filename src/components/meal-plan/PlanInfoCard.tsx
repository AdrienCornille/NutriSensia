'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { PlanInfo } from '@/types/meal-plan';

interface PlanInfoCardProps {
  planInfo: PlanInfo;
}

export function PlanInfoCard({ planInfo }: PlanInfoCardProps) {
  const formattedDate = planInfo.lastUpdated.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <div className='flex items-start gap-4'>
        <div className='w-12 h-12 bg-[#1B998B]/10 rounded-full flex items-center justify-center'>
          <span className='text-[#1B998B] font-bold'>
            {planInfo.creator.initials}
          </span>
        </div>
        <div className='flex-1'>
          <p className='font-medium text-gray-800'>
            Plan créé par {planInfo.creator.name}
          </p>
          <p className='text-sm text-gray-500 mt-1'>
            Dernière mise à jour : {formattedDate}
          </p>
          <p className='text-sm text-gray-600 mt-3'>
            <span className='font-medium'>Objectif :</span> {planInfo.objective}
          </p>
        </div>
        <div className='text-right'>
          {planInfo.isActive && (
            <span className='inline-flex items-center gap-1 px-3 py-1 bg-[#1B998B]/10 text-[#1B998B] text-sm font-medium rounded-full'>
              <Check className='w-4 h-4' />
              Plan actif
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanInfoCard;
