'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onDelete,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleDelete = () => {
    if (confirmText === 'SUPPRIMER') {
      onDelete();
      onClose();
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-md w-full p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Supprimer votre compte ?
          </h3>
          <button
            onClick={handleClose}
            className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-3xl'>⚠️</span>
          </div>
          <p className='text-gray-500'>Cette action est irréversible.</p>
        </div>

        <div className='p-4 bg-red-50 rounded-lg mb-6'>
          <p className='text-sm text-red-700'>
            <strong>Vous perdrez :</strong>
          </p>
          <ul className='text-sm text-red-600 mt-2 space-y-1'>
            <li>• Votre historique de repas et suivi</li>
            <li>• Vos messages avec votre nutritionniste</li>
            <li>• Vos documents et questionnaires</li>
          </ul>
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Tapez "SUPPRIMER" pour confirmer
          </label>
          <input
            type='text'
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder='SUPPRIMER'
            className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20'
          />
        </div>

        <div className='flex gap-3'>
          <button
            onClick={handleClose}
            className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== 'SUPPRIMER'}
            className='flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
