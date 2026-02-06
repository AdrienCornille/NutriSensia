'use client';

import React from 'react';

interface SignalChangeCardProps {
  onSignalChange?: () => void;
}

export function SignalChangeCard({ onSignalChange }: SignalChangeCardProps) {
  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='font-semibold text-gray-800'>
            Une information a changé ?
          </h3>
          <p className='text-sm text-gray-500 mt-1'>
            Nouveau traitement, allergie découverte, changement de situation...
          </p>
        </div>
        <button
          onClick={onSignalChange}
          className='px-4 py-2 bg-[#1B998B]/10 text-[#1B998B] font-medium rounded-lg hover:bg-[#1B998B]/20 transition-colors'
        >
          Signaler un changement
        </button>
      </div>
    </div>
  );
}

export default SignalChangeCard;
