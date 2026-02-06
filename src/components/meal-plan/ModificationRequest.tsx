'use client';

import React, { useState } from 'react';
import { Plus, ChevronDown, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  ModificationRequestData,
  ModificationRequestFormData,
} from '@/types/meal-plan';
import {
  modificationStatusConfig,
  formatRelativeDate,
} from '@/types/meal-plan';
import { ModificationRequestModal } from './ModificationRequestModal';

interface ModificationRequestProps {
  requests: ModificationRequestData[];
  onSubmitRequest: (data: ModificationRequestFormData) => void;
}

/**
 * Carte d'une demande de modification
 */
function RequestCard({ request }: { request: ModificationRequestData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = modificationStatusConfig[request.status];
  const hasResponse = request.nutritionistResponse && request.respondedAt;

  return (
    <div className='border border-gray-200 rounded-lg overflow-hidden'>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full p-4 flex items-start justify-between hover:bg-gray-50 transition-colors text-left'
      >
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-1'>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}
            >
              {statusConfig.icon} {statusConfig.label}
            </span>
            <span className='text-xs text-gray-400'>
              {formatRelativeDate(request.createdAt)}
            </span>
          </div>
          <p className='text-sm font-medium text-gray-800'>
            {request.mealLabel}
            {request.food && ` - ${request.food}`}
          </p>
          <p className='text-sm text-gray-500 mt-1 line-clamp-1'>
            {request.reason}
          </p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='px-4 pb-4 border-t border-gray-100 pt-3'>
              {/* Full reason */}
              <div className='mb-3'>
                <p className='text-xs font-medium text-gray-500 mb-1'>
                  Votre demande
                </p>
                <p className='text-sm text-gray-700'>{request.reason}</p>
              </div>

              {/* Nutritionist response */}
              {hasResponse && (
                <div className='bg-[#1B998B]/5 rounded-lg p-3 border border-[#1B998B]/10'>
                  <div className='flex items-center gap-2 mb-2'>
                    <MessageSquare className='w-4 h-4 text-[#1B998B]' />
                    <p className='text-xs font-medium text-[#1B998B]'>
                      Réponse de votre nutritionniste
                    </p>
                    <span className='text-xs text-gray-400'>
                      {formatRelativeDate(request.respondedAt!)}
                    </span>
                  </div>
                  <p className='text-sm text-gray-700'>
                    {request.nutritionistResponse}
                  </p>
                </div>
              )}

              {/* No response yet */}
              {!hasResponse && request.status === 'pending' && (
                <div className='bg-amber-50 rounded-lg p-3 border border-amber-100'>
                  <p className='text-sm text-amber-700'>
                    Votre nutritionniste n&apos;a pas encore répondu à cette
                    demande.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ModificationRequest({
  requests,
  onSubmitRequest,
}: ModificationRequestProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (data: ModificationRequestFormData) => {
    onSubmitRequest(data);
    // Toast de confirmation pourrait être ajouté ici
  };

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Header with CTA */}
      <div className='p-6 flex items-center justify-between border-b border-gray-100'>
        <div>
          <h3 className='font-semibold text-gray-800'>
            Un aliment ne vous convient pas ?
          </h3>
          <p className='text-sm text-gray-500 mt-1'>
            Signalez-le à votre nutritionniste pour ajuster votre plan.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className='flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white font-medium rounded-lg hover:bg-[#158578] transition-colors'
        >
          <Plus className='w-4 h-4' />
          Nouvelle demande
        </button>
      </div>

      {/* Requests list */}
      {requests.length > 0 && (
        <div className='p-4'>
          <p className='text-sm font-medium text-gray-700 mb-3'>
            Vos demandes récentes ({requests.length})
          </p>
          <div className='space-y-3'>
            {requests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {requests.length === 0 && (
        <div className='p-6 text-center'>
          <p className='text-sm text-gray-500'>
            Vous n&apos;avez pas encore fait de demande de modification.
          </p>
        </div>
      )}

      {/* Modal */}
      <ModificationRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default ModificationRequest;
