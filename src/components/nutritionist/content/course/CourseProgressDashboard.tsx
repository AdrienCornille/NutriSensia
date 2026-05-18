'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Check,
  Minus,
  Clock,
  Users,
  Loader2,
} from 'lucide-react';
import {
  useCourseProgressOverview,
  usePatientCourseProgressDetail,
} from '@/hooks/useCourseBuilder';

interface CourseProgressDashboardProps {
  courseId: string;
}

function formatTime(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className='flex items-center gap-2'>
      <div className='flex-1 h-2 bg-gray-100 rounded-full overflow-hidden'>
        <div
          className='h-full bg-primary rounded-full transition-all duration-300'
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className='text-xs font-medium text-gray-600 w-10 text-right'>
        {clamped}%
      </span>
    </div>
  );
}

function PatientDetailRow({
  courseId,
  patientId,
}: {
  courseId: string;
  patientId: string;
}) {
  const { data: detail, isLoading } = usePatientCourseProgressDetail(
    courseId,
    patientId
  );

  if (isLoading) {
    return (
      <tr>
        <td colSpan={6} className='px-4 py-6 text-center'>
          <Loader2 className='w-4 h-4 animate-spin text-gray-400 mx-auto' />
        </td>
      </tr>
    );
  }

  if (!detail) return null;

  const sections = detail.sections || [];
  const quizScores = detail.quiz_scores || [];

  return (
    <tr>
      <td colSpan={6} className='px-4 py-4 bg-gray-50/80'>
        <div className='space-y-4'>
          {/* Sections detail */}
          {sections.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                D&eacute;tail des sections
              </p>
              <div className='divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden bg-white'>
                {sections.map((section: any, idx: number) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between px-3 py-2 text-sm'
                  >
                    <span className='text-gray-700'>
                      {section.title || `Section ${idx + 1}`}
                    </span>
                    {section.completed ? (
                      <span className='inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full'>
                        <Check className='w-3 h-3' />
                        Termin&eacute;e
                      </span>
                    ) : (
                      <span className='text-xs text-gray-400'>En cours</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz scores */}
          {quizScores.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                Scores des quizz
              </p>
              <div className='divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden bg-white'>
                {quizScores.map((quiz: any, idx: number) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between px-3 py-2 text-sm'
                  >
                    <span className='text-gray-700'>
                      {quiz.title || `Quizz ${idx + 1}`}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        quiz.score >= (quiz.passing_score || 70)
                          ? 'text-green-700 bg-green-50'
                          : 'text-red-600 bg-red-50'
                      }`}
                    >
                      {quiz.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sections.length === 0 && quizScores.length === 0 && (
            <p className='text-sm text-gray-400 text-center py-2'>
              Aucun d&eacute;tail disponible.
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}

export function CourseProgressDashboard({
  courseId,
}: CourseProgressDashboardProps) {
  const { data: overview, isLoading } = useCourseProgressOverview(courseId);
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(
    null
  );

  const toggleExpand = (patientId: string) => {
    setExpandedPatientId(prev => (prev === patientId ? null : patientId));
  };

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center gap-2 mb-6'>
          <BarChart3 className='w-5 h-5 text-primary' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Suivi de progression
          </h3>
        </div>
        {/* Skeleton rows */}
        <div className='space-y-3'>
          {[1, 2, 3].map(i => (
            <div key={i} className='animate-pulse flex items-center gap-4'>
              <div className='h-4 bg-gray-200 rounded w-32' />
              <div className='h-2 bg-gray-200 rounded flex-1' />
              <div className='h-4 bg-gray-200 rounded w-12' />
              <div className='h-4 bg-gray-200 rounded w-16' />
              <div className='h-4 bg-gray-200 rounded w-20' />
              <div className='h-4 bg-gray-200 rounded w-8' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-5'>
      <div className='flex items-center gap-2'>
        <BarChart3 className='w-5 h-5 text-primary' />
        <h3 className='text-lg font-semibold text-gray-900'>
          Suivi de progression
        </h3>
        {overview && overview.length > 0 && (
          <span className='ml-auto inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
            <Users className='w-3 h-3' />
            {overview.length} patient{overview.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {!overview || overview.length === 0 ? (
        <div className='text-center py-10 text-gray-500 text-sm'>
          <Users className='w-8 h-8 mx-auto mb-2 text-gray-300' />
          Aucun patient n&apos;a commenc&eacute; ce cours.
        </div>
      ) : (
        <div className='overflow-x-auto border border-gray-100 rounded-lg'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide'>
                <th className='px-4 py-3'>Patient</th>
                <th className='px-4 py-3 min-w-[160px]'>Progression</th>
                <th className='px-4 py-3'>Sections</th>
                <th className='px-4 py-3'>
                  <div className='flex items-center gap-1'>
                    <Clock className='w-3 h-3' />
                    Temps total
                  </div>
                </th>
                <th className='px-4 py-3'>Dernier acc&egrave;s</th>
                <th className='px-4 py-3 text-center'>Badge</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {overview.map((patient: any) => (
                <React.Fragment key={patient.patient_id}>
                  <tr
                    onClick={() => toggleExpand(patient.patient_id)}
                    className='hover:bg-gray-50 cursor-pointer transition-colors'
                  >
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        {expandedPatientId === patient.patient_id ? (
                          <ChevronUp className='w-4 h-4 text-gray-400 flex-shrink-0' />
                        ) : (
                          <ChevronDown className='w-4 h-4 text-gray-400 flex-shrink-0' />
                        )}
                        <span className='font-medium text-gray-900'>
                          {patient.patient_name || 'Patient'}
                        </span>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <ProgressBar value={patient.progress_percent ?? 0} />
                    </td>
                    <td className='px-4 py-3 text-gray-600'>
                      {patient.sections_completed ?? 0}/
                      {patient.sections_total ?? 0}
                    </td>
                    <td className='px-4 py-3 text-gray-600'>
                      {formatTime(patient.total_time_seconds)}
                    </td>
                    <td className='px-4 py-3 text-gray-600'>
                      {formatDate(patient.last_accessed_at)}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      {patient.badge_earned ? (
                        <Check className='w-4 h-4 text-green-600 mx-auto' />
                      ) : (
                        <Minus className='w-4 h-4 text-gray-300 mx-auto' />
                      )}
                    </td>
                  </tr>
                  {expandedPatientId === patient.patient_id && (
                    <PatientDetailRow
                      courseId={courseId}
                      patientId={patient.patient_id}
                    />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
