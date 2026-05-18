'use client';

import React, { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import {
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Lock,
  Inbox,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { usePatientQuestionnaireInbox } from '@/hooks/usePatientQuestionnaires';
import type {
  PatientInboxItem,
  PatientResponseStatus,
} from '@/types/patient-questionnaires';
import {
  CATEGORY_LABELS,
  type QuestionnaireCategory,
} from '@/types/questionnaire-templates';

type TabKey = 'pending' | 'submitted';

const TAB_LABELS: Record<TabKey, string> = {
  pending: 'À compléter',
  submitted: 'Complétés',
};

function isOverdue(item: PatientInboxItem, now = Date.now()): boolean {
  if (item.status !== 'in_progress' || !item.due_at) return false;
  return new Date(item.due_at).getTime() < now;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusForTab(status: PatientResponseStatus): TabKey {
  return status === 'submitted' ? 'submitted' : 'pending';
}

export default function PatientQuestionnairesPage() {
  const {
    data: assignments,
    isLoading,
    error,
  } = usePatientQuestionnaireInbox();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');

  const grouped = useMemo(() => {
    const groups: Record<TabKey, PatientInboxItem[]> = {
      pending: [],
      submitted: [],
    };
    for (const a of assignments || []) groups[statusForTab(a.status)].push(a);
    return groups;
  }, [assignments]);

  const visible = grouped[activeTab];

  return (
    <>
      <DashboardHeader />
      <div className='p-6 lg:p-8 max-w-4xl mx-auto'>
        <header className='mb-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center'>
              <ClipboardList className='w-5 h-5 text-emerald-700' />
            </div>
            <div>
              <h1 className='text-2xl font-semibold text-gray-800'>
                Mes questionnaires
              </h1>
              <p className='text-sm text-gray-500'>
                Suivis envoyés par votre nutritionniste
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className='flex gap-2 mb-6 border-b border-gray-200'>
          {(['pending', 'submitted'] as TabKey[]).map(tab => {
            const count = grouped[tab].length;
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type='button'
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  active
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {TAB_LABELS[tab]}
                {count > 0 && (
                  <span
                    className={`ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-semibold ${
                      active
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        {isLoading && (
          <div className='flex items-center justify-center py-16'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600' />
          </div>
        )}

        {error && (
          <div className='p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm'>
            {error.message}
          </div>
        )}

        {!isLoading && !error && visible.length === 0 && (
          <EmptyState tab={activeTab} />
        )}

        {!isLoading && !error && visible.length > 0 && (
          <div className='space-y-3'>
            {visible.map(item => (
              <AssignmentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ==================== CARD ====================

function AssignmentCard({ item }: { item: PatientInboxItem }) {
  const overdue = isOverdue(item);
  const isCompleted = item.status === 'submitted';
  const progress =
    item.question_count > 0
      ? Math.min(
          100,
          Math.round((item.answered_count / item.question_count) * 100)
        )
      : 0;
  const started = item.answered_count > 0 && !isCompleted;

  const borderClass = overdue
    ? 'border-amber-300 bg-amber-50'
    : isCompleted
      ? 'border-emerald-200 bg-white'
      : 'border-gray-200 bg-white hover:border-emerald-300';

  return (
    <Link
      // next-intl typed routes don't include dynamic segments by default;
      // align with the rest of the codebase that uses `as any` for these.
      href={`/dashboard/patient/questionnaires/${item.id}` as any}
      className={`block p-5 rounded-xl border transition-colors ${borderClass}`}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1 flex-wrap'>
            <h3 className='font-semibold text-gray-800 truncate'>
              {item.title}
            </h3>
            <CategoryBadge category={item.category} />
            {item.is_sensitive && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800'>
                <Lock className='w-3 h-3' />
                Données sensibles
              </span>
            )}
          </div>

          {item.description && (
            <p className='text-sm text-gray-500 mb-3 line-clamp-2'>
              {item.description}
            </p>
          )}

          <div className='flex items-center gap-3 text-xs text-gray-500 flex-wrap'>
            <span>
              {item.question_count} question{item.question_count > 1 ? 's' : ''}
            </span>
            {item.estimated_minutes != null && (
              <>
                <span className='text-gray-300'>•</span>
                <span className='inline-flex items-center gap-1'>
                  <Clock className='w-3 h-3' />~{item.estimated_minutes} min
                </span>
              </>
            )}
            {item.due_at && !isCompleted && (
              <>
                <span className='text-gray-300'>•</span>
                <span
                  className={`inline-flex items-center gap-1 ${overdue ? 'text-amber-700 font-semibold' : ''}`}
                >
                  {overdue && <AlertCircle className='w-3 h-3' />}
                  Échéance : {formatDate(item.due_at)}
                </span>
              </>
            )}
            {item.submitted_at && (
              <>
                <span className='text-gray-300'>•</span>
                <span className='inline-flex items-center gap-1 text-emerald-700'>
                  <CheckCircle2 className='w-3 h-3' />
                  Complété le {formatDate(item.submitted_at)}
                </span>
              </>
            )}
          </div>

          {started && (
            <div className='mt-3'>
              <div className='flex items-center justify-between text-xs text-gray-500 mb-1'>
                <span>
                  {item.answered_count}/{item.question_count} répondues
                </span>
                <span className='font-semibold text-emerald-700'>
                  {progress}%
                </span>
              </div>
              <div className='h-1.5 rounded-full bg-gray-100 overflow-hidden'>
                <div
                  className='h-full bg-emerald-500 transition-all'
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <ChevronRight className='w-5 h-5 text-gray-400 flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
}

// ==================== HELPERS ====================

function CategoryBadge({ category }: { category: QuestionnaireCategory }) {
  const colors: Record<QuestionnaireCategory, string> = {
    regular_followup: 'bg-emerald-100 text-emerald-700',
    around_consultation: 'bg-blue-100 text-blue-700',
    deep_dive: 'bg-purple-100 text-purple-700',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  return (
    <div className='text-center py-16 px-6 rounded-xl border border-dashed border-gray-300 bg-gray-50'>
      <Inbox className='w-12 h-12 text-gray-400 mx-auto mb-3' />
      <p className='text-gray-600 font-medium mb-1'>
        {tab === 'pending'
          ? 'Aucun questionnaire à compléter'
          : 'Aucun questionnaire complété'}
      </p>
      <p className='text-sm text-gray-500'>
        {tab === 'pending'
          ? 'Votre nutritionniste vous enverra des suivis ici quand nécessaire.'
          : 'Les questionnaires que vous aurez complétés apparaîtront ici.'}
      </p>
    </div>
  );
}
