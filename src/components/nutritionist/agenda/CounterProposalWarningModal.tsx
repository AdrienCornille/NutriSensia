'use client';

import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface CounterProposalWarningModalProps {
  isOpen: boolean;
  patientName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function CounterProposalWarningModal({
  isOpen,
  patientName,
  onClose,
  onConfirm,
  isLoading,
}: CounterProposalWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-md w-full p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Confirmation de modification
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg text-gray-400'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-5'>
          <AlertTriangle className='w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5' />
          <div>
            <p className='text-sm font-medium text-amber-800'>
              Cette modification créera une contre-proposition
            </p>
            <p className='text-sm text-amber-600 mt-2'>
              En changeant l&apos;horaire, le rendez-vous passera en statut
              « en attente ». <strong>{patientName}</strong> devra accepter ou
              refuser le nouvel horaire proposé.
            </p>
          </div>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
          >
            {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
            {isLoading ? 'Modification...' : 'Confirmer la modification'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CounterProposalWarningModal;
