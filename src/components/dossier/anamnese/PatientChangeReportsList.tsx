'use client';

import React from 'react';
import { usePatientChangeReports } from '@/hooks/usePatientDossier';
import { ANAMNESE_SECTION_LABELS } from '@/types/dossier';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-700' },
  reviewed: { label: 'À aborder en consultation', className: 'bg-blue-100 text-blue-700' },
  integrated: { label: 'Intégré', className: 'bg-green-100 text-green-700' },
};

const CHANGE_TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  health: { label: 'Santé', icon: '🏥' },
  medication: { label: 'Médicament', icon: '💊' },
  allergy: { label: 'Allergie', icon: '⚠️' },
  lifestyle: { label: 'Mode de vie', icon: '🏃' },
  other: { label: 'Autre', icon: '📝' },
};

export function PatientChangeReportsList() {
  const { data: reports, isLoading, error } = usePatientChangeReports();

  if (isLoading) {
    return (
      <div className='animate-pulse space-y-3'>
        <div className='h-20 bg-gray-100 rounded-xl' />
        <div className='h-20 bg-gray-100 rounded-xl' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600'>
        Erreur lors du chargement des signalements.
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return null;
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <div className='p-4 border-b border-gray-100'>
        <h3 className='font-semibold text-gray-800'>Mes signalements</h3>
        <p className='text-sm text-gray-500 mt-0.5'>
          Historique de vos signalements de changement
        </p>
      </div>

      <div className='divide-y divide-gray-100'>
        {reports.map(report => {
          const typeConfig = CHANGE_TYPE_CONFIG[report.change_type] || CHANGE_TYPE_CONFIG.other;
          const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
          const sectionLabel = report.anamnesis_section_id
            ? ANAMNESE_SECTION_LABELS[report.anamnesis_section_id as keyof typeof ANAMNESE_SECTION_LABELS]
            : null;

          return (
            <div key={report.id} className='p-4'>
              <div className='flex items-start justify-between gap-3'>
                <div className='flex items-start gap-3 min-w-0'>
                  <span className='text-lg shrink-0 mt-0.5'>{typeConfig.icon}</span>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='font-medium text-gray-800 text-sm'>
                        {report.title}
                      </span>
                      <span className='text-xs text-gray-400'>
                        {sectionLabel || typeConfig.label}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 mt-0.5 line-clamp-2'>
                      {report.description}
                    </p>

                    {/* Old / New values */}
                    {(report.old_value || report.new_value) && (
                      <div className='flex items-center gap-2 mt-2 text-xs'>
                        {report.old_value && (
                          <span className='px-2 py-0.5 bg-red-50 text-red-600 rounded'>
                            {report.old_value}
                          </span>
                        )}
                        {report.old_value && report.new_value && (
                          <span className='text-gray-400'>→</span>
                        )}
                        {report.new_value && (
                          <span className='px-2 py-0.5 bg-green-50 text-green-600 rounded'>
                            {report.new_value}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reviewer notes */}
                    {report.reviewer_notes && (
                      <div className='mt-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600'>
                        <span className='font-medium'>Note du nutritionniste :</span>{' '}
                        {report.reviewer_notes}
                      </div>
                    )}

                    <span className='text-xs text-gray-400 mt-1.5 block'>
                      {new Date(report.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusConfig.className}`}
                >
                  {statusConfig.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PatientChangeReportsList;
