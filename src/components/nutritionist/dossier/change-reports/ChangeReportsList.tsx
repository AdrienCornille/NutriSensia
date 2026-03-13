'use client';

import React, { useState, useCallback } from 'react';
import {
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Eye,
  MessageSquare,
} from 'lucide-react';
import {
  useChangeReports,
  useReviewChangeReport,
} from '@/hooks/useNutritionistDossier';
import { ANAMNESE_SECTION_LABELS } from '@/types/dossier';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';

interface ChangeReportsListProps {
  patientId: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  reviewed: { label: 'À aborder en consultation', color: 'bg-blue-100 text-blue-700' },
  integrated: { label: 'Intégré', color: 'bg-green-100 text-green-700' },
};

const changeTypeConfig: Record<string, { label: string; icon: string }> = {
  health: { label: 'Santé', icon: '🏥' },
  medication: { label: 'Médicament', icon: '💊' },
  allergy: { label: 'Allergie', icon: '⚠️' },
  lifestyle: { label: 'Mode de vie', icon: '🏃' },
  other: { label: 'Autre', icon: '📝' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ChangeReportsList({ patientId }: ChangeReportsListProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message?: string;
  }>({ visible: false, type: 'success', title: '' });

  const hideToast = useCallback(() => setToast(t => ({ ...t, visible: false })), []);

  const {
    data: reports,
    isLoading,
    error,
  } = useChangeReports(patientId, statusFilter);
  const reviewReport = useReviewChangeReport(patientId);

  async function handleReview(
    reportId: string,
    status: 'reviewed' | 'integrated'
  ) {
    try {
      await reviewReport.mutateAsync({
        report_id: reportId,
        status,
        reviewer_notes: reviewNotes || undefined,
      });
      setReviewingId(null);
      setReviewNotes('');

      if (status === 'integrated') {
        setToast({
          visible: true,
          type: 'success',
          title: 'Changement intégré',
          message: 'La valeur a été mise à jour dans l\'anamnèse du patient.',
        });
      } else {
        setToast({
          visible: true,
          type: 'success',
          title: 'Signalement mis à jour',
          message: 'Ce point sera abordé lors de la prochaine consultation.',
        });
      }
    } catch {
      setToast({
        visible: true,
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour le signalement.',
      });
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        <span className='ml-2 text-sm text-gray-500'>Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
        <AlertCircle className='w-8 h-8 text-red-500 mx-auto mb-3' />
        <p className='text-sm text-gray-500'>{error.message}</p>
      </div>
    );
  }

  const allReports = reports || [];

  return (
    <div className='space-y-4'>
      <Toast
        isVisible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />

      {/* Header with filter */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-3'>
          Signalements de changement
        </h3>
        <div className='flex gap-2'>
          {['all', 'pending', 'reviewed', 'integrated'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'Tous' : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {allReports.length === 0 ? (
        <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
          <AlertTriangle className='w-12 h-12 text-gray-300 mx-auto mb-3' />
          <p className='text-gray-800 font-medium mb-1'>Aucun signalement</p>
          <p className='text-sm text-gray-500'>
            Les signalements du patient apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {allReports.map(report => {
            const typeInfo =
              changeTypeConfig[report.change_type] || changeTypeConfig.other;
            const statusInfo =
              statusConfig[report.status] || statusConfig.pending;
            const isReviewing = reviewingId === report.id;
            const sectionLabel = report.anamnesis_section_id
              ? ANAMNESE_SECTION_LABELS[report.anamnesis_section_id as keyof typeof ANAMNESE_SECTION_LABELS]
              : null;

            return (
              <div
                key={report.id}
                className='bg-white rounded-xl border border-gray-200 p-5'
              >
                <div className='flex items-start justify-between mb-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-lg'>{typeInfo.icon}</span>
                    <div>
                      <h4 className='text-sm font-semibold text-gray-800'>
                        {report.title}
                      </h4>
                      <span className='text-xs text-gray-400'>
                        {sectionLabel || typeInfo.label} &middot;{' '}
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                <p className='text-sm text-gray-600 mb-2'>
                  {report.description}
                </p>

                {(report.old_value || report.new_value) && (
                  <div className='flex gap-4 text-xs mb-3'>
                    {report.old_value && (
                      <span className='text-red-500'>
                        Avant : {report.old_value}
                      </span>
                    )}
                    {report.new_value && (
                      <span className='text-green-600'>
                        Après : {report.new_value}
                      </span>
                    )}
                  </div>
                )}

                {report.reviewer_notes && (
                  <div className='bg-gray-50 rounded-lg p-3 mb-3'>
                    <p className='text-xs text-gray-500 flex items-center gap-1'>
                      <MessageSquare className='w-3 h-3' />
                      Note du reviewer
                    </p>
                    <p className='text-sm text-gray-700 mt-1'>
                      {report.reviewer_notes}
                    </p>
                  </div>
                )}

                {report.status === 'pending' && (
                  <div>
                    {isReviewing ? (
                      <div className='space-y-2'>
                        <textarea
                          value={reviewNotes}
                          onChange={e => setReviewNotes(e.target.value)}
                          placeholder='Notes (optionnel)...'
                          rows={2}
                          className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 resize-none'
                        />
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleReview(report.id, 'reviewed')}
                            disabled={reviewReport.isPending}
                            className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200'
                          >
                            <Eye className='w-3 h-3' />
                            À aborder en consultation
                          </button>
                          <button
                            onClick={() =>
                              handleReview(report.id, 'integrated')
                            }
                            disabled={reviewReport.isPending}
                            className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200'
                          >
                            <CheckCircle className='w-3 h-3' />
                            Intégrer
                          </button>
                          <button
                            onClick={() => {
                              setReviewingId(null);
                              setReviewNotes('');
                            }}
                            className='px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700'
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewingId(report.id)}
                        className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1B998B] bg-[#1B998B]/10 rounded-lg hover:bg-[#1B998B]/20'
                      >
                        <Eye className='w-3 h-3' />
                        Examiner
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
