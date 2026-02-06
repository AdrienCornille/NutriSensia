'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { PatientDocument } from '@/types/dossier';

interface DocumentModalProps {
  isOpen: boolean;
  document: PatientDocument | null;
  onClose: () => void;
  nutritionistName?: string;
}

export function DocumentModal({
  isOpen,
  document,
  onClose,
  nutritionistName = 'Lucie Martin',
}: DocumentModalProps) {
  if (!isOpen || !document) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-lg w-full p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Détails du document
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg text-gray-400'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='flex items-center gap-4 mb-6'>
          <div className='w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center'>
            <span className='text-3xl'>
              {document.type === 'pdf' ? '📕' : '🖼'}
            </span>
          </div>
          <div>
            <p className='font-medium text-gray-800'>{document.name}</p>
            <p className='text-sm text-gray-500'>
              {document.size} • {document.type.toUpperCase()}
            </p>
          </div>
        </div>

        <div className='space-y-3 mb-6'>
          <div className='flex justify-between p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm text-gray-500'>Catégorie</span>
            <span className='text-sm font-medium text-gray-800'>
              {document.category}
            </span>
          </div>
          <div className='flex justify-between p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm text-gray-500'>Ajouté par</span>
            <span className='text-sm font-medium text-gray-800'>
              {document.uploadedBy === 'nutritionist'
                ? `${nutritionistName} (Nutritionniste)`
                : 'Vous'}
            </span>
          </div>
          <div className='flex justify-between p-3 bg-gray-50 rounded-lg'>
            <span className='text-sm text-gray-500'>Date d&apos;ajout</span>
            <span className='text-sm font-medium text-gray-800'>
              {document.uploadedAt}
            </span>
          </div>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
          >
            Fermer
          </button>
          <button className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#147569] transition-colors flex items-center justify-center gap-2'>
            <span>📥</span>
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentModal;
