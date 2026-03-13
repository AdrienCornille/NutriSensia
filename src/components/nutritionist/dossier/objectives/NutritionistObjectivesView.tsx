'use client';

import React, { useState } from 'react';
import {
  Loader2,
  AlertCircle,
  Plus,
  Target,
  CheckCircle,
  Pause,
  TrendingUp,
} from 'lucide-react';
import {
  usePatientObjectives,
  useUpdateObjective,
} from '@/hooks/useNutritionistDossier';
import { ObjectiveCreateModal } from './ObjectiveCreateModal';

interface NutritionistObjectivesViewProps {
  patientId: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  active: {
    label: 'Actif',
    color: 'bg-green-100 text-green-700',
    icon: TrendingUp,
  },
  paused: {
    label: 'En pause',
    color: 'bg-amber-100 text-amber-700',
    icon: Pause,
  },
  completed: {
    label: 'Terminé',
    color: 'bg-blue-100 text-blue-700',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Annulé',
    color: 'bg-gray-100 text-gray-600',
    icon: Target,
  },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function NutritionistObjectivesView({
  patientId,
}: NutritionistObjectivesViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    data: objectives,
    isLoading,
    error,
  } = usePatientObjectives(patientId);

  const updateObjective = useUpdateObjective(patientId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        <span className='ml-2 text-sm text-gray-500'>
          Chargement des objectifs...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
        <AlertCircle className='w-8 h-8 text-red-500 mx-auto mb-3' />
        <p className='text-gray-800 font-medium mb-1'>Erreur de chargement</p>
        <p className='text-sm text-gray-500'>{error.message}</p>
      </div>
    );
  }

  const allObjectives = objectives || [];
  const filtered =
    statusFilter === 'all'
      ? allObjectives
      : allObjectives.filter(o => o.status === statusFilter);

  const activeCount = allObjectives.filter(o => o.status === 'active').length;
  const completedCount = allObjectives.filter(
    o => o.status === 'completed'
  ).length;

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-800'>Objectifs</h3>
            <p className='text-sm text-gray-500 mt-1'>
              {activeCount} actif{activeCount !== 1 ? 's' : ''} &middot;{' '}
              {completedCount} terminé{completedCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium'
          >
            <Plus className='w-4 h-4' />
            Nouvel objectif
          </button>
        </div>

        {/* Status filter */}
        <div className='flex gap-2 mt-4'>
          {['all', 'active', 'paused', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all'
                ? 'Tous'
                : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Objectives list */}
      {filtered.length === 0 ? (
        <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
          <Target className='w-12 h-12 text-gray-300 mx-auto mb-3' />
          <p className='text-gray-800 font-medium mb-1'>Aucun objectif</p>
          <p className='text-sm text-gray-500'>
            Créez le premier objectif pour ce patient.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {filtered.map(obj => {
            const config = statusConfig[obj.status] || statusConfig.active;
            const StatusIcon = config.icon;
            return (
              <div
                key={obj.id}
                className='bg-white rounded-xl border border-gray-200 p-5'
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h4 className='text-sm font-semibold text-gray-800'>
                        {obj.title}
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${config.color}`}
                      >
                        <StatusIcon className='w-3 h-3' />
                        {config.label}
                      </span>
                    </div>
                    {obj.description && (
                      <p className='text-sm text-gray-500'>{obj.description}</p>
                    )}
                  </div>
                  <div className='flex gap-1 ml-3'>
                    {obj.status === 'active' && (
                      <>
                        <button
                          onClick={() =>
                            updateObjective.mutate({
                              objectiveId: obj.id,
                              status: 'completed',
                            })
                          }
                          className='p-1.5 text-gray-400 hover:text-green-600 transition-colors'
                          title='Marquer terminé'
                        >
                          <CheckCircle className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() =>
                            updateObjective.mutate({
                              objectiveId: obj.id,
                              status: 'paused',
                            })
                          }
                          className='p-1.5 text-gray-400 hover:text-amber-600 transition-colors'
                          title='Mettre en pause'
                        >
                          <Pause className='w-4 h-4' />
                        </button>
                      </>
                    )}
                    {obj.status === 'paused' && (
                      <button
                        onClick={() =>
                          updateObjective.mutate({
                            objectiveId: obj.id,
                            status: 'active',
                          })
                        }
                        className='p-1.5 text-gray-400 hover:text-green-600 transition-colors'
                        title='Réactiver'
                      >
                        <TrendingUp className='w-4 h-4' />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className='mb-3'>
                  <div className='flex items-center justify-between text-xs text-gray-500 mb-1'>
                    <span>Progression</span>
                    <span>{obj.progress}%</span>
                  </div>
                  <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-[#1B998B] rounded-full transition-all'
                      style={{ width: `${Math.min(obj.progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className='flex items-center gap-4 text-xs text-gray-400'>
                  <span>Catégorie : {obj.category}</span>
                  {obj.target_value && (
                    <span>
                      Cible : {obj.target_value}
                      {obj.target_unit ? ` ${obj.target_unit}` : ''}
                    </span>
                  )}
                  <span>Début : {formatDate(obj.start_date)}</span>
                  {obj.deadline && (
                    <span>Échéance : {formatDate(obj.deadline)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <ObjectiveCreateModal
          patientId={patientId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
