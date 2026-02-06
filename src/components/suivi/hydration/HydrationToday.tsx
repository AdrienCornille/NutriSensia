'use client';

import React, { useState } from 'react';
import type { HydrationData } from '@/types/suivi';
import { calculateHydrationPercentage } from '@/types/suivi';
import { hydrationQuickAddOptions } from '@/data/mock-suivi';

interface HydrationTodayProps {
  data: HydrationData;
  onAddWater: (amount: number) => void;
}

export function HydrationToday({ data, onAddWater }: HydrationTodayProps) {
  const [customAmount, setCustomAmount] = useState('');
  const percentage = calculateHydrationPercentage(data.today, data.goal);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      onAddWater(amount);
      setCustomAmount('');
    }
  };

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='font-semibold text-gray-800'>Aujourd&apos;hui</h2>
        <span className='text-sm text-gray-500'>Objectif: {data.goal}L</span>
      </div>

      <div className='flex items-center gap-8'>
        {/* Visual glass */}
        <div className='relative w-32 h-48 bg-gray-100 rounded-b-3xl rounded-t-lg overflow-hidden border-4 border-gray-200'>
          <div
            className='absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500'
            style={{ height: `${percentage}%` }}
          >
            <div className='absolute inset-0 bg-white/20' />
          </div>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-gray-800'>{data.today}L</p>
              <p className='text-sm text-gray-500'>/ {data.goal}L</p>
            </div>
          </div>
        </div>

        {/* Quick add buttons */}
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-700 mb-3'>
            Ajouter rapidement
          </p>
          <div className='grid grid-cols-2 gap-3'>
            {hydrationQuickAddOptions.map(option => (
              <button
                key={option.amount}
                onClick={() => onAddWater(option.amount)}
                className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'
              >
                <span className='text-xl'>{option.icon}</span>
                <div className='text-left'>
                  <p className='text-sm font-medium text-blue-800'>
                    {option.label}
                  </p>
                  <p className='text-xs text-blue-600'>{option.amount} ml</p>
                </div>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <form onSubmit={handleCustomSubmit} className='mt-4 flex gap-2'>
            <input
              type='number'
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              placeholder='Quantité personnalisée'
              className='flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <button
              type='submit'
              className='px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600'
            >
              + ml
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HydrationToday;
