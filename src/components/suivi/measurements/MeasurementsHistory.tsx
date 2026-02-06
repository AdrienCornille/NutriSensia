'use client';

import React, { useState } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import type { MeasurementEntry, MeasurementType } from '@/types/suivi';
import { measurementTypeConfig, formatSuiviDate } from '@/types/suivi';
import {
  useUpdateMeasurement,
  useDeleteMeasurement,
} from '@/hooks/useMeasurements';

interface MeasurementsHistoryProps {
  history: MeasurementEntry[];
  maxItems?: number;
  onUpdate?: () => void;
}

// Icônes par type de mesure
const measurementIcons: Record<MeasurementType, string> = {
  poitrine: '👕',
  taille: '📏',
  hanches: '🩳',
  cuisse: '🦵',
  bras: '💪',
  mollet: '🦶',
};

export function MeasurementsHistory({
  history,
  maxItems = 8,
  onUpdate,
}: MeasurementsHistoryProps) {
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const updateMutation = useUpdateMeasurement();
  const deleteMutation = useDeleteMeasurement();

  const displayedHistory = history.slice(0, maxItems);

  const handleEdit = (entry: MeasurementEntry) => {
    setEditingEntryId(entry.id);
    setEditValue(entry.value);
  };

  const handleSaveEdit = async (entryId: string) => {
    try {
      await updateMutation.mutateAsync({
        id: entryId,
        data: { value_cm: editValue },
      });
      setEditingEntryId(null);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating measurement:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditValue(0);
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette mesure ?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(entryId);
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting measurement:', error);
    }
  };

  // Fonction pour calculer la variation avec l'entrée précédente du même type
  const getVariation = (entry: MeasurementEntry, index: number) => {
    // Chercher l'entrée précédente du même type
    const previousEntry = history
      .slice(index + 1)
      .find(e => e.type === entry.type);

    if (!previousEntry) return null;

    const diff = entry.value - previousEntry.value;
    if (Math.abs(diff) < 0.1)
      return { direction: 'stable' as const, value: 0, formatted: '=' };

    return {
      direction: diff < 0 ? ('down' as const) : ('up' as const),
      value: Math.abs(diff),
      formatted: `${diff > 0 ? '+' : ''}${diff} cm`,
    };
  };

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h2 className='font-semibold text-gray-800 mb-4'>
        Historique des mesures
      </h2>
      <div className='divide-y divide-gray-200'>
        {displayedHistory.map((entry, index) => {
          const variation = getVariation(entry, index);
          const config = measurementTypeConfig[entry.type];

          return (
            <div
              key={entry.id}
              className='flex items-center justify-between py-3 first:pt-0 last:pb-0'
            >
              {/* Icône + Infos */}
              <div className='flex items-center gap-3 flex-1'>
                <div className='w-10 h-10 bg-[#1B998B]/10 rounded-full flex items-center justify-center flex-shrink-0'>
                  <span className='text-[#1B998B]'>
                    {measurementIcons[entry.type]}
                  </span>
                </div>

                <div className='flex-1'>
                  {editingEntryId === entry.id ? (
                    <div className='flex items-center space-x-2'>
                      <input
                        type='number'
                        value={editValue}
                        onChange={e => setEditValue(Number(e.target.value))}
                        className='w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary'
                        min='10'
                        max='500'
                        step='0.1'
                      />
                      <span className='text-sm text-gray-600'>cm</span>
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
                          {entry.value.toFixed(1)} cm
                        </p>
                        {variation && (
                          <span
                            className={`text-xs font-medium ${
                              variation.direction === 'down'
                                ? 'text-[#1B998B]'
                                : variation.direction === 'up'
                                  ? 'text-blue-600'
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
                        {config.label} • {formatSuiviDate(entry.date)}
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

export default MeasurementsHistory;
