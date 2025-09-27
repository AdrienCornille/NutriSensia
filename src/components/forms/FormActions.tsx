'use client';

import { motion } from 'framer-motion';
import {
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface FormActionsProps {
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  onCancel: () => void;
  showConfirmDialog: boolean;
  onConfirmCancel: () => void;
  onDiscardChanges: () => void;
}

export function FormActions({
  isSubmitting,
  hasUnsavedChanges,
  onCancel,
  showConfirmDialog,
  onConfirmCancel,
  onDiscardChanges,
}: FormActionsProps) {
  return (
    <div className='flex flex-col space-y-4'>
      {/* Actions principales */}
      <div className='flex flex-col sm:flex-row gap-4 justify-end'>
        <Button
          type='button'
          variant='secondary'
          onClick={onCancel}
          disabled={isSubmitting}
          className='flex items-center justify-center space-x-2'
        >
          <ArrowLeftIcon className='h-5 w-5' />
          <span>Annuler</span>
        </Button>

        <Button
          type='submit'
          variant='primary'
          disabled={isSubmitting}
          className='flex items-center justify-center space-x-2'
        >
          {isSubmitting ? (
            <>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
              <span>Sauvegarde...</span>
            </>
          ) : (
            <>
              <CheckIcon className='h-5 w-5' />
              <span>Sauvegarder</span>
            </>
          )}
        </Button>
      </div>

      {/* Indicateur de changements non sauvegardés */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'
        >
          <ExclamationTriangleIcon className='h-5 w-5 text-yellow-600' />
          <span className='text-sm text-yellow-800'>
            Vous avez des modifications non sauvegardées
          </span>
        </motion.div>
      )}

      {/* Dialogue de confirmation */}
      {showConfirmDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className='bg-white rounded-lg p-6 max-w-md w-full mx-4'
          >
            <div className='flex items-center space-x-3 mb-4'>
              <ExclamationTriangleIcon className='h-6 w-6 text-yellow-600' />
              <h3 className='text-lg font-semibold text-gray-900'>
                Modifications non sauvegardées
              </h3>
            </div>

            <p className='text-gray-600 mb-6'>
              Vous avez des modifications non sauvegardées. Êtes-vous sûr de
              vouloir quitter sans sauvegarder ?
            </p>

            <div className='flex flex-col sm:flex-row gap-3 justify-end'>
              <Button
                type='button'
                variant='secondary'
                onClick={onDiscardChanges}
                className='flex items-center justify-center space-x-2'
              >
                <XMarkIcon className='h-4 w-4' />
                <span>Ignorer les changements</span>
              </Button>

              <Button
                type='button'
                variant='primary'
                onClick={onConfirmCancel}
                className='flex items-center justify-center space-x-2'
              >
                <ArrowLeftIcon className='h-4 w-4' />
                <span>Continuer l'édition</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
