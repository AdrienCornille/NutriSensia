'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  mealName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  mealName,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute inset-0 bg-black/50'
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden'
          >
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                  <AlertTriangle className='w-5 h-5 text-red-600' />
                </div>
                <h2 className='text-lg font-semibold text-gray-800'>
                  Supprimer le repas
                </h2>
              </div>
              <button
                onClick={onCancel}
                className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Content */}
            <div className='px-6 py-5'>
              <p className='text-gray-600'>
                Êtes-vous sûr de vouloir supprimer{' '}
                <span className='font-medium text-gray-800'>{mealName}</span> ?
              </p>
              <p className='text-sm text-gray-500 mt-2'>
                Cette action est irréversible. Toutes les données de ce repas
                seront définitivement supprimées.
              </p>
            </div>

            {/* Footer */}
            <div className='flex gap-3 px-6 py-4 bg-gray-50'>
              <button
                onClick={onCancel}
                className='flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors'
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                className='flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors'
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDeleteModal;
