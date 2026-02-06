'use client';

import React, { useState } from 'react';
import { Trash2, Edit2, Droplet, Coffee, Leaf } from 'lucide-react';
import type { HydrationLog } from '@/lib/hydration-transformers';
import {
  useUpdateHydrationLog,
  useDeleteHydrationLog,
} from '@/hooks/useHydration';

interface HydrationHistoryProps {
  logs: HydrationLog[];
  onUpdate?: () => void;
}

// Icônes par type de boisson
const beverageIcons: Record<string, React.ReactNode> = {
  water: <Droplet className='h-5 w-5 text-blue-500' />,
  tea: <Leaf className='h-5 w-5 text-green-500' />,
  coffee: <Coffee className='h-5 w-5 text-amber-700' />,
  juice: <Droplet className='h-5 w-5 text-orange-500' />,
  other: <Droplet className='h-5 w-5 text-gray-500' />,
};

// Labels par type de boisson
const beverageLabels: Record<string, string> = {
  water: 'Eau',
  tea: 'Thé',
  coffee: 'Café',
  juice: 'Jus',
  other: 'Autre',
};

export function HydrationHistory({ logs, onUpdate }: HydrationHistoryProps) {
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  const updateMutation = useUpdateHydrationLog();
  const deleteMutation = useDeleteHydrationLog();

  const handleEdit = (log: HydrationLog) => {
    setEditingLogId(log.id);
    setEditAmount(log.amount_ml);
  };

  const handleSaveEdit = async (logId: string) => {
    try {
      await updateMutation.mutateAsync({
        logId,
        data: { amount_ml: editAmount },
      });
      setEditingLogId(null);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating log:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setEditAmount(0);
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce log ?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(logId);
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (logs.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500'>
        <Droplet className='h-12 w-12 mx-auto mb-2 opacity-30' />
        <p>Aucun log d'hydratation pour aujourd'hui</p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <h3 className='text-sm font-semibold text-gray-700 mb-3'>
        Historique du jour ({logs.length}{' '}
        {logs.length === 1 ? 'entrée' : 'entrées'})
      </h3>

      {logs.map(log => (
        <div
          key={log.id}
          className='flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow'
        >
          {/* Icône + Infos */}
          <div className='flex items-center space-x-3 flex-1'>
            <div className='flex-shrink-0'>
              {beverageIcons[log.beverage_type] || beverageIcons.water}
            </div>

            <div className='flex-1'>
              {editingLogId === log.id ? (
                <div className='flex items-center space-x-2'>
                  <input
                    type='number'
                    value={editAmount}
                    onChange={e => setEditAmount(Number(e.target.value))}
                    className='w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary'
                    min='0'
                    max='5000'
                    step='50'
                  />
                  <span className='text-sm text-gray-600'>ml</span>
                  <div className='flex space-x-1'>
                    <button
                      onClick={() => handleSaveEdit(log.id)}
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
                  <p className='font-medium text-gray-900'>
                    {log.amount_ml} ml
                    <span className='text-sm text-gray-500 ml-2'>
                      {beverageLabels[log.beverage_type] || 'Eau'}
                    </span>
                  </p>
                  <p className='text-xs text-gray-500'>
                    {formatTime(log.created_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {editingLogId !== log.id && (
            <div className='flex items-center space-x-1'>
              <button
                onClick={() => handleEdit(log)}
                className='p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-md transition-colors'
                title='Modifier'
              >
                <Edit2 className='h-4 w-4' />
              </button>
              <button
                onClick={() => handleDelete(log.id)}
                disabled={deleteMutation.isPending}
                className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50'
                title='Supprimer'
              >
                <Trash2 className='h-4 w-4' />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
