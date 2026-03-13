'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreateObjective } from '@/hooks/useNutritionistDossier';

interface ObjectiveCreateModalProps {
  patientId: string;
  onClose: () => void;
}

const objectiveCategories = [
  'Poids',
  'Habitude',
  'Comportement',
  'Activité physique',
  'Hydratation',
  'Sommeil',
  'Autre',
];

export function ObjectiveCreateModal({
  patientId,
  onClose,
}: ObjectiveCreateModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Habitude');
  const [targetValue, setTargetValue] = useState('');
  const [targetUnit, setTargetUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState(3);

  const createObjective = useCreateObjective(patientId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createObjective.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        target_value: targetValue.trim() || undefined,
        target_unit: targetUnit.trim() || undefined,
        deadline: deadline || undefined,
        priority,
      });
      onClose();
    } catch {
      // error handled by React Query
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Nouvel objectif
          </h3>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-gray-700 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Titre *
            </label>
            <input
              type='text'
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='ex: Perdre 3 kg en 2 mois'
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Détails sur cet objectif...'
              rows={3}
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B] resize-none'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Catégorie *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
              >
                {objectiveCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Priorité
              </label>
              <select
                value={priority}
                onChange={e => setPriority(Number(e.target.value))}
                className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
              >
                <option value={1}>1 - Très haute</option>
                <option value={2}>2 - Haute</option>
                <option value={3}>3 - Moyenne</option>
                <option value={4}>4 - Basse</option>
                <option value={5}>5 - Très basse</option>
              </select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Valeur cible
              </label>
              <input
                type='text'
                value={targetValue}
                onChange={e => setTargetValue(e.target.value)}
                placeholder='ex: 70'
                className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Unité
              </label>
              <input
                type='text'
                value={targetUnit}
                onChange={e => setTargetUnit(e.target.value)}
                placeholder='ex: kg'
                className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Échéance
            </label>
            <input
              type='date'
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
            />
          </div>

          <div className='flex justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Annuler
            </button>
            <button
              type='submit'
              disabled={!title.trim() || createObjective.isPending}
              className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
            >
              {createObjective.isPending && (
                <Loader2 className='w-4 h-4 animate-spin' />
              )}
              Créer l&apos;objectif
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
