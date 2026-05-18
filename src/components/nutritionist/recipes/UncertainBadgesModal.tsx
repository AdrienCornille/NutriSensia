'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { AUTO_TAG_LABELS, TAG_GROUP_MAP } from '@/lib/recipe-auto-tags';

// ==================== TYPES ====================

interface UncertainTag {
  tag_group: string;
  tag_value: string;
}

export interface UncertainDecisions {
  /** Map of "group:value" → true (confirm) or false (remove) */
  decisions: Record<string, boolean>;
  /** Original uncertain tags (used by parent to compute final values) */
  uncertainTags: UncertainTag[];
}

interface UncertainBadgesModalProps {
  isOpen: boolean;
  uncertainTags: UncertainTag[];
  isProcessing?: boolean;
  onClose: () => void;
  onConfirmed: (resolved: UncertainDecisions) => void | Promise<void>;
}

// ==================== COMPONENT ====================

export function UncertainBadgesModal({
  isOpen,
  uncertainTags,
  isProcessing = false,
  onClose,
  onConfirmed,
}: UncertainBadgesModalProps) {
  const [decisions, setDecisions] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const t of uncertainTags) {
      init[`${t.tag_group}:${t.tag_value}`] = true;
    }
    return init;
  });

  const toggleDecision = (key: string) => {
    setDecisions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirm = async () => {
    await onConfirmed({ decisions, uncertainTags });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center'>
                  <AlertTriangle className='w-6 h-6 text-amber-500' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Badges à confirmer
                </h3>
              </div>
              <button
                type='button'
                onClick={onClose}
                className='p-1 hover:bg-gray-100 rounded-full transition-colors'
              >
                <X className='w-5 h-5 text-gray-400' />
              </button>
            </div>

            {/* Description */}
            <p className='text-sm text-gray-500 mb-5'>
              Certains badges n&apos;ont pas pu être vérifiés automatiquement.
              Merci de confirmer ou retirer chacun avant de continuer.
            </p>

            {/* Badge list */}
            <div className='space-y-2.5 mb-6'>
              {uncertainTags.map(tag => {
                const key = `${tag.tag_group}:${tag.tag_value}`;
                const confirmed = decisions[key];
                const confirmedValue = tag.tag_value.replace(/-uncertain$/, '');
                const label = AUTO_TAG_LABELS[confirmedValue] || confirmedValue;
                const groupConfig =
                  TAG_GROUP_MAP[tag.tag_group as keyof typeof TAG_GROUP_MAP];
                const color = groupConfig?.color || '#6B7280';

                return (
                  <div
                    key={key}
                    className='flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white'
                  >
                    <span
                      className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium'
                      style={{
                        backgroundColor: `${color}15`,
                        color: color,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      {label}
                    </span>

                    {/* Confirm / Remove segmented control */}
                    <div className='flex'>
                      <button
                        type='button'
                        onClick={() => {
                          if (!confirmed) toggleDecision(key);
                        }}
                        className={`px-3 py-1.5 rounded-l-lg text-xs font-medium border transition-colors ${
                          confirmed
                            ? 'bg-[#1B998B]/10 border-[#1B998B]/30 text-[#1B998B]'
                            : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        Confirmer
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          if (confirmed) toggleDecision(key);
                        }}
                        className={`px-3 py-1.5 rounded-r-lg text-xs font-medium border border-l-0 transition-colors ${
                          !confirmed
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className='flex justify-end gap-2'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
              >
                Annuler
              </button>
              <button
                type='button'
                onClick={handleConfirm}
                disabled={isProcessing}
                className='flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#1B998B] hover:bg-[#158578] rounded-lg transition-colors disabled:opacity-50'
              >
                {isProcessing && <Loader2 className='w-4 h-4 animate-spin' />}
                Valider et continuer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
