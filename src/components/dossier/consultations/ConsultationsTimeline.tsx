'use client';

import React from 'react';
import {
  Loader2,
  AlertCircle,
  Video,
  Building2,
  Phone,
} from 'lucide-react';
import { usePatientConsultations } from '@/hooks/usePatientDossier';
import type { PatientConsultation } from '@/hooks/usePatientDossier';

// ============================================================================
// HELPERS
// ============================================================================

const modeConfig: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    bgColor: string;
    textColor: string;
  }
> = {
  cabinet: {
    label: 'Cabinet',
    icon: Building2,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  visio: {
    label: 'Visio',
    icon: Video,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  phone: {
    label: 'Téléphone',
    icon: Phone,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
};

function formatDateFR(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}` : `${h}h`;
}

// ============================================================================
// CONSULTATION ITEM
// ============================================================================

function ConsultationItemCard({
  consultation,
  index,
  isLast,
}: {
  consultation: PatientConsultation;
  index: number;
  isLast: boolean;
}) {
  const mode = modeConfig[consultation.mode] || modeConfig.cabinet;
  const ModeIcon = mode.icon;

  return (
    <div className='relative'>
      {/* Timeline connector */}
      {!isLast && (
        <div className='absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200' />
      )}

      <div className='flex gap-4'>
        {/* Timeline dot */}
        <div className='relative z-10'>
          <div className='w-12 h-12 bg-[#1B998B]/10 rounded-full flex items-center justify-center'>
            <span className='text-[#1B998B] font-bold'>{index + 1}</span>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 bg-gray-50 rounded-xl p-5'>
          <div className='flex items-start justify-between mb-4'>
            <div>
              <h3 className='font-semibold text-gray-800'>
                {consultation.consultation_type || 'Consultation'}
              </h3>
              <div className='flex items-center gap-2 mt-1'>
                <span className='text-sm text-gray-500'>
                  {formatDateFR(consultation.date)}
                </span>
                {consultation.duration_minutes && (
                  <>
                    <span className='text-gray-300'>·</span>
                    <span className='text-sm text-gray-500'>
                      {formatDuration(consultation.duration_minutes)}
                    </span>
                  </>
                )}
                <span className='text-gray-300'>·</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${mode.bgColor} ${mode.textColor}`}
                >
                  <ModeIcon className='w-3 h-3' />
                  {mode.label}
                </span>
              </div>
            </div>
          </div>

          {consultation.summary && (
            <p className='text-sm text-gray-600 mb-4'>
              {consultation.summary}
            </p>
          )}

          {consultation.key_points && consultation.key_points.length > 0 && (
            <div className='mb-4'>
              <p className='text-sm font-medium text-gray-700 mb-2'>
                Points clés
              </p>
              <ul className='space-y-1'>
                {consultation.key_points.map((point, i) => (
                  <li
                    key={i}
                    className='flex items-start gap-2 text-sm text-gray-600'
                  >
                    <span className='text-[#1B998B] mt-0.5'>✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {consultation.next_steps && (
            <div className='p-3 bg-white rounded-lg border border-gray-200'>
              <p className='text-sm font-medium text-gray-700'>
                Prochaines étapes
              </p>
              <p className='text-sm text-gray-600 mt-1 whitespace-pre-line'>
                {consultation.next_steps}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ConsultationsTimeline() {
  const { data: consultations, isLoading, error } = usePatientConsultations();

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl p-6 border border-gray-200'>
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-5 h-5 animate-spin text-[#1B998B]' />
          <span className='ml-2 text-sm text-gray-500'>Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-xl p-6 border border-gray-200'>
        <div className='flex items-center justify-center py-12 text-red-500'>
          <AlertCircle className='w-5 h-5 mr-2' />
          <span className='text-sm'>Erreur lors du chargement</span>
        </div>
      </div>
    );
  }

  if (!consultations || consultations.length === 0) {
    return (
      <div className='bg-white rounded-xl p-6 border border-gray-200 text-center py-12'>
        <div className='w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
          <span className='text-2xl'>📋</span>
        </div>
        <p className='text-gray-800 font-medium'>
          Aucun compte-rendu de consultation
        </p>
        <p className='text-sm text-gray-500 mt-1'>
          Les comptes-rendus de vos consultations apparaîtront ici une fois
          rédigés par votre nutritionniste.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h2 className='font-semibold text-gray-800 mb-6'>
        Historique des consultations
      </h2>

      <div className='space-y-6'>
        {consultations.map((consultation, index) => (
          <ConsultationItemCard
            key={consultation.id}
            consultation={consultation}
            index={index}
            isLast={index === consultations.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default ConsultationsTimeline;
