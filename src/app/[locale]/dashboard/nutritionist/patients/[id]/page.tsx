'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  MessageSquare,
  FileText,
  ClipboardList,
  FolderOpen,
  Utensils,
  TrendingUp,
  MessageCircle,
  Calculator,
} from 'lucide-react';
import { useNutritionistPatientDetail } from '@/hooks/useNutritionistPatients';
import { PatientSyntheseTab } from '@/components/nutritionist/patients/PatientSyntheseTab';
import { PatientDossierTab } from '@/components/nutritionist/dossier/PatientDossierTab';
import { ConsultationsTab } from '@/components/nutritionist/dossier/consultations';
import { MealPlanTab } from '@/components/nutritionist/meal-plans';
import { SuiviTab } from '@/components/nutritionist/suivi';
import { NutritionalProfileTab } from '@/components/nutritionist/nutritional-profiles';
import { formatConsultationReason } from '@/lib/utils';

// ==================== TYPES ====================

type PatientTab =
  | 'synthese'
  | 'dossier'
  | 'profil'
  | 'plan'
  | 'suivi'
  | 'consultations'
  | 'messages';

const tabs: { id: PatientTab; label: string; icon: React.ElementType }[] = [
  { id: 'synthese', label: 'Synthèse', icon: ClipboardList },
  { id: 'dossier', label: 'Dossier', icon: FolderOpen },
  { id: 'profil', label: 'Profil nutritionnel', icon: Calculator },
  { id: 'plan', label: 'Plan alimentaire', icon: Utensils },
  { id: 'suivi', label: 'Suivi', icon: TrendingUp },
  { id: 'consultations', label: 'Consultations', icon: FileText },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
];

const statusConfig: Record<
  string,
  { label: string; bgColor: string; textColor: string }
> = {
  active: {
    label: 'Actif',
    bgColor: 'bg-[#1B998B]/10',
    textColor: 'text-[#1B998B]',
  },
  pending: {
    label: 'Nouveau',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  inactive: {
    label: 'En pause',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
  },
};

// ==================== PLACEHOLDER TAB ====================

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
      <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
        <FileText className='w-8 h-8 text-gray-300' />
      </div>
      <p className='text-gray-800 font-medium mb-1'>{label}</p>
      <p className='text-gray-500 text-sm'>
        Cette section sera disponible prochainement.
      </p>
    </div>
  );
}

// ==================== PAGE COMPONENT ====================

export default function NutritionistPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as PatientTab | null;
  const fromAppointment = searchParams.get('fromAppointment');
  const [activeTab, setActiveTab] = useState<PatientTab>(
    tabParam && tabs.some(t => t.id === tabParam) ? tabParam : 'synthese'
  );

  // Sync tab from URL params (e.g., after redirect from agenda)
  useEffect(() => {
    if (tabParam && tabs.some(t => t.id === tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  const { data, isLoading, error } = useNutritionistPatientDetail(id);

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-100'>
        <header className='bg-white border-b border-gray-200 px-8 h-[93px] flex items-center sticky top-0 z-10'>
          <h1 className='text-2xl font-semibold text-gray-800'>
            Dossier patient
          </h1>
        </header>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <Loader2 className='w-8 h-8 animate-spin text-[#1B998B] mx-auto mb-3' />
            <p className='text-gray-500 text-sm'>Chargement du dossier...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className='min-h-screen bg-gray-100'>
        <header className='bg-white border-b border-gray-200 px-8 h-[93px] flex items-center sticky top-0 z-10'>
          <h1 className='text-2xl font-semibold text-gray-800'>
            Dossier patient
          </h1>
        </header>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <AlertCircle className='w-8 h-8 text-red-500 mx-auto mb-3' />
            <p className='text-gray-800 font-medium mb-1'>
              Erreur de chargement
            </p>
            <p className='text-gray-500 text-sm'>
              {error?.message || 'Patient introuvable'}
            </p>
            <button
              onClick={() => router.push('/dashboard/nutritionist/patients')}
              className='mt-4 px-4 py-2 text-sm text-[#1B998B] hover:text-[#147569]'
            >
              ← Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { patient } = data;
  const fullName = `${patient.first_name} ${patient.last_name}`;
  const initials =
    `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`.toUpperCase();
  const status = statusConfig[patient.status] || statusConfig.active;

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 px-8 h-[93px] flex items-center sticky top-0 z-10'>
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-4'>
            {patient.avatar_url ? (
              <img
                src={patient.avatar_url}
                alt={fullName}
                className='w-10 h-10 rounded-full object-cover'
              />
            ) : (
              <div className='w-10 h-10 bg-[#1B998B] rounded-full flex items-center justify-center text-white font-semibold'>
                {initials}
              </div>
            )}
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-lg font-semibold text-gray-800'>
                  {fullName}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}
                >
                  {status.label}
                </span>
              </div>
              <p className='text-sm text-gray-500'>
                {patient.email}
                {patient.consultation_reason && (
                  <>
                    <span className='mx-1.5'>·</span>
                    {formatConsultationReason(patient.consultation_reason)}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={() => router.push('/dashboard/nutritionist/messagerie')}
              className='flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium'
            >
              <MessageSquare className='w-4 h-4' />
              Message
            </button>
            <button
              onClick={() => router.push('/dashboard/nutritionist/patients')}
              className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors'
            >
              Retour aux patients
            </button>
          </div>
        </div>
      </header>

      <div className='px-8 py-6'>
        {/* Tab Navigation */}
        <div className='mb-6'>
          <div className='flex gap-1 bg-gray-100 p-1 rounded-xl w-fit'>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'synthese' && <PatientSyntheseTab data={data} />}
        {activeTab === 'dossier' && (
          <PatientDossierTab
            patientId={patient.id}
            patientName={fullName}
            patientFirstName={patient.first_name}
            patientLastName={patient.last_name}
            patientEmail={patient.email}
            patientPhone={patient.phone || undefined}
            patientConsultationReason={patient.consultation_reason || undefined}
          />
        )}
        {activeTab === 'profil' && (
          <NutritionalProfileTab patientId={patient.id} patientName={fullName} />
        )}
        {activeTab === 'plan' && (
          <MealPlanTab patientId={patient.id} patientName={fullName} />
        )}
        {activeTab === 'suivi' && (
          <SuiviTab patientId={patient.id} patientName={fullName} />
        )}
        {activeTab === 'consultations' && (
          <ConsultationsTab
            patientId={patient.id}
            patientName={fullName}
            fromAppointmentId={fromAppointment || undefined}
          />
        )}
        {activeTab === 'messages' && <PlaceholderTab label='Messages' />}
      </div>
    </div>
  );
}
