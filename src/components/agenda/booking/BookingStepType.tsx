'use client';

import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import type { ConsultationTypeDB } from '@/types/agenda';

interface BookingStepTypeProps {
  consultationTypes: ConsultationTypeDB[];
  isLoading: boolean;
  error: Error | null;
  selectedTypeId: string | null;
  onSelectType: (type: ConsultationTypeDB) => void;
}

export function BookingStepType({
  consultationTypes,
  isLoading,
  error,
  selectedTypeId,
  onSelectType,
}: BookingStepTypeProps) {
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='w-8 h-8 animate-spin text-[#1B998B]' />
        <span className='ml-3 text-gray-500'>
          Chargement des types de consultation...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
        <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
        <div>
          <p className='font-medium text-red-800'>
            Erreur lors du chargement
          </p>
          <p className='text-sm text-red-600 mt-1'>{error.message}</p>
        </div>
      </div>
    );
  }

  if (consultationTypes.length === 0) {
    return (
      <div className='p-6 bg-amber-50 border border-amber-200 rounded-xl text-center'>
        <AlertCircle className='w-10 h-10 text-amber-500 mx-auto mb-3' />
        <p className='font-medium text-amber-800'>
          Aucun type de consultation disponible
        </p>
        <p className='text-sm text-amber-600 mt-1'>
          Votre nutritionniste n&apos;a pas encore configuré ses types de
          consultation. Veuillez réessayer plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h4 className='font-medium text-gray-800 mb-4'>
        Quel type de consultation ?
      </h4>
      {consultationTypes.map(type => (
        <button
          key={type.id}
          onClick={() => onSelectType(type)}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            selectedTypeId === type.id
              ? 'border-[#1B998B] bg-emerald-50'
              : 'border-gray-200 hover:border-emerald-300'
          }`}
        >
          <div className='flex items-start justify-between'>
            <div>
              <div className='flex items-center gap-2'>
                {type.icon && <span className='text-xl'>{type.icon}</span>}
                <p className='font-medium text-gray-800'>{type.name_fr}</p>
              </div>
              {type.description_fr && (
                <p className='text-sm text-gray-500 mt-1'>
                  {type.description_fr}
                </p>
              )}
              <div className='flex items-center gap-3 mt-2'>
                <span className='text-sm text-gray-400'>
                  ⏱ {type.default_duration} min
                </span>
                <div className='flex gap-1'>
                  {type.visio_available && (
                    <span className='text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded'>
                      Visio
                    </span>
                  )}
                  {type.cabinet_available && (
                    <span className='text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded'>
                      Cabinet
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className='font-semibold text-[#1B998B] whitespace-nowrap'>
              {type.default_price} CHF
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default BookingStepType;
