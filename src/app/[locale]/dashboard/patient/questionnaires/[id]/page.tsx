'use client';

import React, { use } from 'react';
import { AlertCircle } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { usePatientQuestionnaireDetail } from '@/hooks/usePatientQuestionnaires';
import { QuestionnaireResponseForm } from '@/components/patient/questionnaires/QuestionnaireResponseForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PatientQuestionnaireDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: detail, isLoading, error } = usePatientQuestionnaireDetail(id);

  return (
    <>
      <DashboardHeader />
      {isLoading && (
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600' />
        </div>
      )}

      {error && (
        <div className='max-w-2xl mx-auto p-6'>
          <div className='p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm flex items-start gap-2'>
            <AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
            <div>
              <p className='font-semibold'>
                Impossible de charger le questionnaire
              </p>
              <p>{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && detail && (
        <QuestionnaireResponseForm detail={detail} />
      )}
    </>
  );
}
