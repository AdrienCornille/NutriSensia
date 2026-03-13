'use client';

import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useConsultationPreparation } from '@/hooks/useNutritionistConsultations';
import type { ConsultationDetail } from '@/types/nutritionist-dossier';
import type { PatientObjectiveDetail } from '@/types/nutritionist-dossier';

interface ConsultationPreparationProps {
  patientId: string;
  onStartReport: () => void;
}

function formatDateFR(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const statusColors: Record<string, { bar: string; text: string }> = {
  on_track: { bar: 'bg-green-500', text: 'text-green-600' },
  in_progress: { bar: 'bg-blue-500', text: 'text-blue-600' },
  needs_attention: { bar: 'bg-amber-500', text: 'text-amber-600' },
  not_started: { bar: 'bg-gray-300', text: 'text-gray-500' },
  completed: { bar: 'bg-[#1B998B]', text: 'text-[#1B998B]' },
};

export function ConsultationPreparation({
  patientId,
  onStartReport,
}: ConsultationPreparationProps) {
  const { data, isLoading, error } = useConsultationPreparation(patientId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        <span className='ml-2 text-sm text-gray-500'>
          Chargement de la préparation...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
        <p className='text-gray-500 text-sm'>
          Impossible de charger les données de préparation.
        </p>
      </div>
    );
  }

  const { lastConsultation, objectives, changeReports } = data as {
    lastConsultation: ConsultationDetail | null;
    objectives: PatientObjectiveDetail[];
    changeReports: { id: string; change_type: string; title: string; description: string }[];
  };

  const activeObjectives = objectives.filter(
    (o: PatientObjectiveDetail) => o.status !== 'completed' && o.status !== 'abandoned'
  );
  const pendingReports = changeReports || [];

  return (
    <div className='space-y-6'>
      {/* Alerts - Pending change reports */}
      {pendingReports.length > 0 && (
        <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
          <h3 className='text-sm font-semibold text-red-800 mb-2 flex items-center gap-1.5'>
            <AlertTriangle className='w-4 h-4' />
            Signalements à traiter
          </h3>
          <div className='space-y-2'>
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className='bg-white rounded-lg p-3 border border-red-100'
              >
                <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600'>
                  {report.change_type === 'health'
                    ? 'Santé'
                    : report.change_type === 'medication'
                      ? 'Médicament'
                      : report.change_type === 'lifestyle'
                        ? 'Mode de vie'
                        : report.change_type === 'allergy'
                          ? 'Allergie'
                          : 'Autre'}
                </span>
                <p className='text-sm text-gray-600 mt-1'>
                  {report.title}
                  {report.description && ` — ${report.description}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-column grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Last consultation */}
        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <h3 className='font-medium text-gray-800 mb-4'>
            Dernière consultation
          </h3>
          {lastConsultation ? (
            <div className='space-y-3'>
              <p className='text-xs text-gray-500'>
                {formatDateFR(lastConsultation.date)}
                {lastConsultation.duration_minutes &&
                  ` · ${lastConsultation.duration_minutes} min`}
              </p>
              {lastConsultation.summary && (
                <div>
                  <p className='text-xs font-semibold text-gray-500 uppercase mb-1'>
                    Résumé
                  </p>
                  <p className='text-sm text-gray-600'>
                    {lastConsultation.summary}
                  </p>
                </div>
              )}
              {lastConsultation.next_steps && (
                <div>
                  <p className='text-xs font-semibold text-gray-500 uppercase mb-1'>
                    Prochaines étapes définies
                  </p>
                  <p className='text-sm text-gray-600 whitespace-pre-line'>
                    {lastConsultation.next_steps}
                  </p>
                </div>
              )}
              {lastConsultation.private_notes && (
                <div className='bg-red-50 rounded-lg p-3 border border-red-200'>
                  <p className='text-xs font-semibold text-red-400 mb-1'>
                    🔒 Notes privées
                  </p>
                  <p className='text-xs text-gray-600 italic'>
                    {lastConsultation.private_notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className='text-sm text-gray-500 italic'>
              Aucune consultation précédente
            </p>
          )}
        </div>

        {/* Active objectives */}
        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <h3 className='font-medium text-gray-800 mb-4'>
            Objectifs en cours
          </h3>
          {activeObjectives.length > 0 ? (
            <div className='space-y-4'>
              {activeObjectives.map((obj: PatientObjectiveDetail) => {
                const colors =
                  statusColors[obj.status] || statusColors.in_progress;
                return (
                  <div key={obj.id}>
                    <div className='flex items-center justify-between mb-1'>
                      <p className='text-sm font-medium text-gray-700'>
                        {obj.title}
                      </p>
                      <span className={`text-xs font-medium ${colors.text}`}>
                        {obj.progress}%
                      </span>
                    </div>
                    <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                      <div
                        className={`h-full rounded-full ${colors.bar}`}
                        style={{ width: `${Math.min(obj.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className='text-sm text-gray-500 italic'>
              Aucun objectif actif
            </p>
          )}
        </div>
      </div>

      {/* KPI indicators */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-gray-50 rounded-xl p-4 text-center'>
          <p className='text-sm text-gray-500'>Consultations</p>
          <p className='text-3xl font-bold text-gray-800 mt-1'>
            {lastConsultation ? '1+' : '0'}
          </p>
          <p className='text-xs text-gray-500 mt-1'>au total</p>
        </div>
        <div className='bg-gray-50 rounded-xl p-4 text-center'>
          <p className='text-sm text-gray-500'>Objectifs actifs</p>
          <p className='text-3xl font-bold text-gray-800 mt-1'>
            {activeObjectives.length}
          </p>
          <p className='text-xs text-gray-500 mt-1'>en cours</p>
        </div>
        <div className='bg-gray-50 rounded-xl p-4 text-center'>
          <p className='text-sm text-gray-500'>Signalements</p>
          <p className='text-3xl font-bold text-gray-800 mt-1'>
            {pendingReports.length}
          </p>
          <p className='text-xs text-gray-500 mt-1'>à traiter</p>
        </div>
        <div className='bg-gray-50 rounded-xl p-4 text-center'>
          <p className='text-sm text-gray-500'>Progression moy.</p>
          <p className='text-3xl font-bold text-gray-800 mt-1'>
            {activeObjectives.length > 0
              ? Math.round(
                  activeObjectives.reduce(
                    (sum: number, o: PatientObjectiveDetail) => sum + o.progress,
                    0
                  ) / activeObjectives.length
                )
              : 0}
            %
          </p>
          <p className='text-xs text-gray-500 mt-1'>des objectifs</p>
        </div>
      </div>

      {/* CTA */}
      <div className='text-center'>
        <button
          onClick={onStartReport}
          className='px-6 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors font-medium'
        >
          Commencer le compte-rendu →
        </button>
      </div>
    </div>
  );
}
