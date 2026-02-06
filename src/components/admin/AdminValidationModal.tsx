'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ValidationAction = 'approve' | 'reject' | 'request_info';

interface AdminValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: ValidationAction, reason?: string) => Promise<void>;
  action: ValidationAction;
  nutritionistName: string;
  isLoading?: boolean;
}

const actionConfig: Record<
  ValidationAction,
  {
    title: string;
    description: string;
    confirmText: string;
    confirmColor: string;
    icon: React.ElementType;
    iconColor: string;
    requiresReason: boolean;
    reasonLabel: string;
    reasonPlaceholder: string;
  }
> = {
  approve: {
    title: 'Valider la demande',
    description:
      'Le nutritionniste pourra accéder à son espace professionnel et commencer à exercer sur NutriSensia.',
    confirmText: 'Valider',
    confirmColor: 'bg-emerald-600 hover:bg-emerald-700',
    icon: CheckCircle,
    iconColor: 'text-emerald-600 bg-emerald-100',
    requiresReason: false,
    reasonLabel: '',
    reasonPlaceholder: '',
  },
  reject: {
    title: 'Rejeter la demande',
    description:
      "Le nutritionniste recevra un email l'informant du rejet de sa demande avec la raison indiquée.",
    confirmText: 'Rejeter',
    confirmColor: 'bg-red-600 hover:bg-red-700',
    icon: XCircle,
    iconColor: 'text-red-600 bg-red-100',
    requiresReason: true,
    reasonLabel: 'Raison du rejet *',
    reasonPlaceholder:
      'Ex: Documents non conformes, certifications non reconnues, informations incomplètes...',
  },
  request_info: {
    title: 'Demander des informations',
    description:
      'Le nutritionniste recevra un email lui demandant de fournir des informations complémentaires.',
    confirmText: 'Envoyer la demande',
    confirmColor: 'bg-blue-600 hover:bg-blue-700',
    icon: AlertCircle,
    iconColor: 'text-blue-600 bg-blue-100',
    requiresReason: true,
    reasonLabel: 'Informations demandées *',
    reasonPlaceholder:
      'Ex: Veuillez fournir une copie plus lisible de votre certificat ASCA, préciser vos spécialisations...',
  },
};

/**
 * Modal de confirmation pour les actions de validation admin
 */
export function AdminValidationModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  nutritionistName,
  isLoading = false,
}: AdminValidationModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const config = actionConfig[action];
  const Icon = config.icon;

  const handleConfirm = async () => {
    if (config.requiresReason && !reason.trim()) {
      setError('Ce champ est obligatoire');
      return;
    }

    setError(null);

    try {
      await onConfirm(action, reason.trim() || undefined);
      setReason('');
      onClose();
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden'
          >
            {/* Header */}
            <div className='p-6 pb-0'>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className='absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50'
              >
                <X className='w-5 h-5' />
              </button>

              {/* Icon */}
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mb-4',
                  config.iconColor
                )}
              >
                <Icon className='w-7 h-7' />
              </div>

              <h2 className='text-xl font-bold text-gray-900'>
                {config.title}
              </h2>
              <p className='text-sm text-gray-600 mt-1'>
                Pour <span className='font-medium'>{nutritionistName}</span>
              </p>
            </div>

            {/* Content */}
            <div className='p-6'>
              <p className='text-sm text-gray-600 mb-4'>{config.description}</p>

              {/* Textarea pour la raison */}
              {config.requiresReason && (
                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    {config.reasonLabel}
                  </label>
                  <textarea
                    value={reason}
                    onChange={e => {
                      setReason(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={config.reasonPlaceholder}
                    rows={4}
                    disabled={isLoading}
                    className={cn(
                      'w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all',
                      error
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-200 focus:ring-[#1B998B]/20 focus:border-[#1B998B]',
                      isLoading && 'opacity-50 cursor-not-allowed'
                    )}
                  />
                  {error && <p className='text-sm text-red-600'>{error}</p>}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='p-6 pt-0 flex gap-3'>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className='flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50'
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={cn(
                  'flex-1 px-4 py-2.5 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2',
                  config.confirmColor
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Traitement...
                  </>
                ) : (
                  config.confirmText
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AdminValidationModal;
