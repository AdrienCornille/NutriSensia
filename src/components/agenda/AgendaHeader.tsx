'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface AgendaHeaderProps {
  onBookAppointment: () => void;
}

export function AgendaHeader({ onBookAppointment }: AgendaHeaderProps) {
  return (
    <div className='bg-white border-b border-gray-200 px-8 py-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-lg font-semibold text-gray-800'>
            Mes rendez-vous
          </h1>
          <p className='text-sm text-gray-500'>
            Gérez vos consultations avec votre nutritionniste
          </p>
        </div>
        <button
          onClick={onBookAppointment}
          className='flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors'
        >
          <Plus className='w-5 h-5' />
          <span className='font-medium'>Prendre rendez-vous</span>
        </button>
      </div>
    </div>
  );
}

export default AgendaHeader;
