'use client';

import React, { useState } from 'react';
import {
  Loader2,
  AlertCircle,
  Plus,
  FileText,
  Trash2,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  usePatientQuestionnaires,
  useDeleteQuestionnaire,
} from '@/hooks/useNutritionistDossier';
import { QuestionnaireCreateModal } from './QuestionnaireCreateModal';

interface NutritionistQuestionnairesViewProps {
  patientId: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: 'En attente',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
  completed: {
    label: 'Complété',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
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

export function NutritionistQuestionnairesView({
  patientId,
}: NutritionistQuestionnairesViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    data: questionnaires,
    isLoading,
    error,
  } = usePatientQuestionnaires(patientId);
  const deleteQuestionnaire = useDeleteQuestionnaire(patientId);

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

  const allQuestionnaires = questionnaires || [];

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-800'>
              Questionnaires
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              {allQuestionnaires.filter(q => q.status === 'pending').length} en
              attente &middot;{' '}
              {allQuestionnaires.filter(q => q.status === 'completed').length}{' '}
              complétés
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium'
          >
            <Plus className='w-4 h-4' />
            Nouveau questionnaire
          </button>
        </div>
      </div>

      {/* Questionnaires list */}
      {allQuestionnaires.length === 0 ? (
        <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
          <FileText className='w-12 h-12 text-gray-300 mx-auto mb-3' />
          <p className='text-gray-800 font-medium mb-1'>Aucun questionnaire</p>
          <p className='text-sm text-gray-500'>
            Envoyez un questionnaire de suivi au patient.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {allQuestionnaires.map(q => {
            const config = statusConfig[q.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const questionCount = Array.isArray(q.questions)
              ? q.questions.length
              : 0;
            const answerCount = Array.isArray(q.answers) ? q.answers.length : 0;

            return (
              <div
                key={q.id}
                className='bg-white rounded-xl border border-gray-200 p-5'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h4 className='text-sm font-semibold text-gray-800'>
                        {q.title}
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${config.color}`}
                      >
                        <StatusIcon className='w-3 h-3' />
                        {config.label}
                      </span>
                    </div>
                    <div className='flex items-center gap-3 text-xs text-gray-400'>
                      <span>Type : {q.questionnaire_type}</span>
                      <span>
                        {questionCount} question{questionCount !== 1 ? 's' : ''}
                      </span>
                      {q.status === 'completed' && (
                        <span>
                          {answerCount} réponse{answerCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span>Créé le {formatDate(q.created_at)}</span>
                      {q.due_date && (
                        <span>Échéance : {formatDate(q.due_date)}</span>
                      )}
                      {q.completed_at && (
                        <span>Complété le {formatDate(q.completed_at)}</span>
                      )}
                    </div>
                  </div>
                  {q.status === 'pending' && (
                    <button
                      onClick={() => {
                        if (confirm('Supprimer ce questionnaire ?')) {
                          deleteQuestionnaire.mutate(q.id);
                        }
                      }}
                      disabled={deleteQuestionnaire.isPending}
                      className='p-2 text-gray-400 hover:text-red-500 transition-colors'
                      title='Supprimer'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  )}
                </div>

                {/* Show answers summary if completed */}
                {q.status === 'completed' &&
                  q.answers &&
                  q.answers.length > 0 && (
                    <div className='mt-3 bg-gray-50 rounded-lg p-3'>
                      <p className='text-xs font-medium text-gray-500 mb-2'>
                        Réponses
                      </p>
                      <div className='space-y-1'>
                        {q.answers.slice(0, 3).map((a, i) => {
                          const question = Array.isArray(q.questions)
                            ? q.questions[i]
                            : null;
                          return (
                            <div key={a.question_id || i} className='text-xs'>
                              <span className='text-gray-500'>
                                {question?.question || `Q${i + 1}`}:{' '}
                              </span>
                              <span className='text-gray-800 font-medium'>
                                {String(a.answer)}
                              </span>
                            </div>
                          );
                        })}
                        {q.answers.length > 3 && (
                          <p className='text-xs text-gray-400'>
                            +{q.answers.length - 3} autres réponses
                          </p>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <QuestionnaireCreateModal
          patientId={patientId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
