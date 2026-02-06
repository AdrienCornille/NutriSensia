'use client';

import React, { useState } from 'react';
import { Trash2, Edit2, Scale } from 'lucide-react';
import type { WeightEntry } from '@/types/suivi';
import { formatSuiviDate, calculateWeightVariation } from '@/types/suivi';
import { useUpdateWeightEntry, useDeleteWeightEntry } from '@/hooks/useWeight';

interface WeightHistoryProps {
  history: WeightEntry[];
  maxItems?: number;
  onUpdate?: () => void;
}

export function WeightHistory({
  history,
  maxItems = 5,
  onUpdate,
}: WeightHistoryProps) {
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState<number>(0);

  const updateMutation = useUpdateWeightEntry();
  const deleteMutation = useDeleteWeightEntry();

  const displayedHistory = history.slice(0, maxItems);

  const handleEdit = (entry: WeightEntry) => {
    setEditingEntryId(entry.id);
    setEditWeight(entry.value);
  };

  const handleSaveEdit = async (entryId: string) => {
    try {
      await updateMutation.mutateAsync({
        entryId,
        data: { weight_kg: editWeight },
      });
      setEditingEntryId(null);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating weight entry:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditWeight(0);
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pesée ?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(entryId);
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting weight entry:', error);
    }
  };

  if (displayedHistory.length === 0) {
    return (
      <div className='bg-white rounded-xl p-6 border border-gray-200'>
        <h2 className='font-semibold text-gray-800 mb-4'>Dernières pesées</h2>
        <div className='text-center py-8 text-gray-500'>
          <Scale className='h-12 w-12 mx-auto mb-2 opacity-30' />
          <p>Aucune pesée enregistrée</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h2 className='font-semibold text-gray-800 mb-4'>
        Dernières pesées ({displayedHistory.length}{' '}
        {displayedHistory.length === 1 ? 'entrée' : 'entrées'})
      </h2>
      <div className='space-y-3'>
        {displayedHistory.map((entry, index) => {
          const previousEntry = history[index + 1];
          const variation = previousEntry
            ? calculateWeightVariation(entry.value, previousEntry.value)
            : null;

          return (
            <div
              key={entry.id}
              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:shadow-sm transition-shadow'
            >
              {/* Icône + Infos */}
              <div className='flex items-center gap-3 flex-1'>
                <div className='w-10 h-10 bg-[#1B998B]/10 rounded-full flex items-center justify-center flex-shrink-0'>
                  <span className='text-[#1B998B]'>⚖️</span>
                </div>

                <div className='flex-1'>
                  {editingEntryId === entry.id ? (
                    <div className='flex items-center space-x-2'>
                      <input
                        type='number'
                        value={editWeight}
                        onChange={e => setEditWeight(Number(e.target.value))}
                        className='w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary'
                        min='20'
                        max='500'
                        step='0.1'
                      />
                      <span className='text-sm text-gray-600'>kg</span>
                      <div className='flex space-x-1'>
                        <button
                          onClick={() => handleSaveEdit(entry.id)}
                          disabled={updateMutation.isPending}
                          className='px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50'
                        >
                          {updateMutation.isPending
                            ? 'Sauvegarde...'
                            : 'Sauvegarder'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className='px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium text-gray-800'>
                          {entry.value.toFixed(1)} kg
                        </p>
                        {variation && (
                          <span
                            className={`text-xs font-medium ${
                              variation.direction === 'down'
                                ? 'text-[#1B998B]'
                                : variation.direction === 'up'
                                  ? 'text-amber-600'
                                  : 'text-gray-400'
                            }`}
                          >
                            {variation.direction === 'down' && '↓ '}
                            {variation.direction === 'up' && '↑ '}
                            {variation.formatted}
                          </span>
                        )}
                      </div>
                      <p className='text-xs text-gray-500'>
                        {formatSuiviDate(entry.date)} 2026
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {editingEntryId !== entry.id && (
                <div className='flex items-center space-x-1'>
                  <button
                    onClick={() => handleEdit(entry)}
                    className='p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-md transition-colors'
                    title='Modifier'
                  >
                    <Edit2 className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleteMutation.isPending}
                    className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50'
                    title='Supprimer'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeightHistory;
