'use client';

import React, { useState, useCallback } from 'react';
import { X, FileEdit, Send, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationKeys } from '@/hooks/useConversations';

interface ModificationRequestFormProps {
  conversationId: string;
  mealPlanId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const requestTypes = [
  {
    value: 'substitute',
    label: 'Substitution',
    description: 'Remplacer un aliment par un autre',
  },
  {
    value: 'remove',
    label: 'Suppression',
    description: 'Retirer un aliment du plan',
  },
  {
    value: 'add',
    label: 'Ajout',
    description: 'Ajouter un aliment au plan',
  },
  {
    value: 'modify_quantity',
    label: 'Quantité',
    description: "Modifier la quantité d'un aliment",
  },
  {
    value: 'general',
    label: 'Autre',
    description: 'Modification générale du plan',
  },
] as const;

export function ModificationRequestForm({
  conversationId,
  mealPlanId,
  onClose,
  onSuccess,
}: ModificationRequestFormProps) {
  const queryClient = useQueryClient();

  const [requestType, setRequestType] = useState<string>('general');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suggestedAlternative, setSuggestedAlternative] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/protected/conversations/${conversationId}/modification-request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            meal_plan_id: mealPlanId,
            request_type: requestType,
            title: title.trim(),
            description: description.trim(),
            suggested_alternative: suggestedAlternative.trim() || undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la demande');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(),
      });
      onSuccess?.();
      onClose();
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !description.trim() || mutation.isPending) return;
      mutation.mutate();
    },
    [title, description, mutation]
  );

  const isValid = title.trim().length >= 3 && description.trim().length >= 5;

  return (
    <div className='fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-100'>
          <div className='flex items-center gap-2'>
            <FileEdit className='w-5 h-5 text-[#1B998B]' />
            <h2 className='text-base font-semibold text-gray-800'>
              Demander une modification
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 hover:bg-gray-100 rounded-lg'
          >
            <X className='w-4 h-4 text-gray-400' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-4 space-y-4'>
          {/* Request type */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Type de modification
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {requestTypes.map(type => (
                <button
                  key={type.value}
                  type='button'
                  onClick={() => setRequestType(type.value)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    requestType === type.value
                      ? 'border-[#1B998B] bg-[#1B998B]/5 text-[#1B998B]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className='text-sm font-medium'>{type.label}</span>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor='mod-title'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Titre de la demande
            </label>
            <input
              id='mod-title'
              type='text'
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='Ex: Remplacer le riz par des pâtes complètes'
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent'
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor='mod-description'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Description / Raison
            </label>
            <textarea
              id='mod-description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Expliquez pourquoi vous souhaitez cette modification...'
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent resize-none'
              rows={3}
              maxLength={2000}
            />
          </div>

          {/* Suggested alternative */}
          {(requestType === 'substitute' || requestType === 'add') && (
            <div>
              <label
                htmlFor='mod-alternative'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Alternative suggérée{' '}
                <span className='text-gray-400'>(optionnel)</span>
              </label>
              <input
                id='mod-alternative'
                type='text'
                value={suggestedAlternative}
                onChange={e => setSuggestedAlternative(e.target.value)}
                placeholder='Ex: Pâtes complètes bio'
                className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent'
                maxLength={500}
              />
            </div>
          )}

          {/* Error */}
          {mutation.isError && (
            <p className='text-sm text-red-600'>{mutation.error.message}</p>
          )}

          {/* Actions */}
          <div className='flex gap-2 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Annuler
            </button>
            <button
              type='submit'
              disabled={!isValid || mutation.isPending}
              className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1B998B] rounded-lg hover:bg-[#147569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {mutation.isPending ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Send className='w-4 h-4' />
              )}
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModificationRequestForm;
