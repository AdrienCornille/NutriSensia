'use client';

import React, { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  MessageSquare,
  FileText,
  ClipboardList,
  ClipboardCheck,
  FolderOpen,
  Calendar,
  Utensils,
  TrendingUp,
  MessageCircle,
  Calculator,
  ChevronLeft,
  CalendarPlus,
  MoreVertical,
  Target,
} from 'lucide-react';
import { useNutritionistPatientDetail } from '@/hooks/useNutritionistPatients';
import { useDossierSummary } from '@/hooks/useNutritionistDossier';
import { formatConsultationReason } from '@/lib/utils';

// Lazy-load tab content — each tab is heavy (forms, charts, lists) and only one
// is visible at a time. Splits into 7 chunks loaded on-demand on tab click.
const TabLoadingFallback = () => (
  <div className='flex items-center justify-center min-h-[40vh]'>
    <Loader2
      className='w-8 h-8 animate-spin'
      style={{ color: 'var(--ns-peps-deep)' }}
    />
  </div>
);

const PatientSyntheseTab = dynamic(
  () =>
    import('@/components/nutritionist/patients/PatientSyntheseTab').then(
      m => m.PatientSyntheseTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);

const PatientMessagesTab = dynamic(
  () =>
    import('@/components/nutritionist/patients/PatientMessagesTab').then(
      m => m.PatientMessagesTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);

// Dossier sub-components — promoted to top-level tabs (v3 flat structure).
// Imported directly (not via PatientDossierTab orchestrator, which is deprecated).
const NutritionistAnamneseView = dynamic(
  () =>
    import('@/components/nutritionist/dossier/anamnese/NutritionistAnamneseView').then(
      m => m.NutritionistAnamneseView
    ),
  { ssr: false, loading: TabLoadingFallback }
);

const NutritionistQuestionnairesView = dynamic(
  () =>
    import('@/components/nutritionist/dossier/questionnaires/NutritionistQuestionnairesView').then(
      m => m.NutritionistQuestionnairesView
    ),
  { ssr: false, loading: TabLoadingFallback }
);

const NutritionistDocumentsView = dynamic(
  () =>
    import('@/components/nutritionist/dossier/documents/NutritionistDocumentsView').then(
      m => m.NutritionistDocumentsView
    ),
  { ssr: false, loading: TabLoadingFallback }
);

const ConsultationsTab = dynamic(
  () =>
    import('@/components/nutritionist/dossier/consultations/ConsultationsTab').then(
      m => m.ConsultationsTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);

const NutritionistObjectivesView = dynamic(
  () =>
    import('@/components/nutritionist/dossier/objectives/NutritionistObjectivesView').then(
      m => m.NutritionistObjectivesView
    ),
  { ssr: false, loading: TabLoadingFallback }
);

const MealPlanTab = dynamic(
  () =>
    import('@/components/nutritionist/meal-plans/MealPlanTab').then(
      m => m.MealPlanTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);

const SuiviTab = dynamic(
  () =>
    import('@/components/nutritionist/suivi/SuiviTab').then(m => m.SuiviTab),
  { ssr: false, loading: TabLoadingFallback }
);

const NutritionalProfileTab = dynamic(
  () =>
    import('@/components/nutritionist/nutritional-profiles/NutritionalProfileTab').then(
      m => m.NutritionalProfileTab
    ),
  { ssr: false, loading: TabLoadingFallback }
);

// ==================== TYPES ====================

type PatientTab =
  | 'synthese'
  | 'anamnese'
  | 'questionnaires'
  | 'documents'
  | 'consultations'
  | 'objectifs'
  | 'profil'
  | 'plan'
  | 'suivi'
  | 'messages';

type TabGroup = 'dossier' | 'autre';

const tabs: {
  id: PatientTab;
  label: string;
  icon: React.ElementType;
  group: TabGroup;
}[] = [
  // ─── Groupe Dossier (flat v3) ───
  { id: 'synthese', label: 'Synthèse', icon: ClipboardList, group: 'dossier' },
  { id: 'anamnese', label: 'Anamnèse', icon: FileText, group: 'dossier' },
  {
    id: 'questionnaires',
    label: 'Questionnaires',
    icon: ClipboardCheck,
    group: 'dossier',
  },
  { id: 'documents', label: 'Documents', icon: FolderOpen, group: 'dossier' },
  {
    id: 'consultations',
    label: 'Consultations',
    icon: Calendar,
    group: 'dossier',
  },
  { id: 'objectifs', label: 'Objectifs', icon: Target, group: 'dossier' },
  // ─── Groupe Autre ───
  {
    id: 'profil',
    label: 'Profil nutritionnel',
    icon: Calculator,
    group: 'autre',
  },
  {
    id: 'plan',
    label: 'Plan alimentaire',
    icon: Utensils,
    group: 'autre',
  },
  { id: 'suivi', label: 'Suivi', icon: TrendingUp, group: 'autre' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, group: 'autre' },
];

const statusConfig: Record<
  string,
  { label: string; chipClass: string; bannerClass: string; barClass: string }
> = {
  active: {
    label: 'Suivi actif',
    chipClass: '',
    bannerClass: '',
    barClass: '',
  },
  pending: {
    label: 'Nouveau',
    chipClass: 'is-pending',
    bannerClass: 'is-pending',
    barClass: 'is-pending',
  },
  inactive: {
    label: 'En pause',
    chipClass: 'is-inactive',
    bannerClass: 'is-inactive',
    barClass: 'is-inactive',
  },
};

// ==================== HELPERS ====================

function computeAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatGender(g: string | null): string | null {
  if (!g) return null;
  const lower = g.toLowerCase();
  if (lower === 'male' || lower === 'm' || lower === 'homme') return 'Homme';
  if (lower === 'female' || lower === 'f' || lower === 'femme') return 'Femme';
  return g;
}

function formatFollowUpDuration(assignedAt: string | null): string | null {
  if (!assignedAt) return null;
  const start = new Date(assignedAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) return null;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 30) return `Suivi · ${diffDays} j`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `Suivi · ${diffMonths} mois`;
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  return months > 0
    ? `Suivi · ${years} an${years > 1 ? 's' : ''} ${months} m`
    : `Suivi · ${years} an${years > 1 ? 's' : ''}`;
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
    if (
      tabParam &&
      tabs.some(t => t.id === tabParam) &&
      tabParam !== activeTab
    ) {
      setActiveTab(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  const { data, isLoading, error } = useNutritionistPatientDetail(id);
  // Aggregated summary used to drive tab badge counts (Anamnèse signalements, Questionnaires pending).
  // Returns `undefined` while loading — badges stay hidden until data arrives.
  const { data: dossierSummary } = useDossierSummary(id);

  // Loading state
  if (isLoading) {
    return (
      <div className='px-9 pb-16'>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <Loader2
              className='w-8 h-8 animate-spin mx-auto mb-3'
              style={{ color: 'var(--ns-peps-deep)' }}
            />
            <p className='ns2-body' style={{ color: 'var(--ns-ink-3)' }}>
              Chargement du dossier…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className='px-9 pb-16'>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <AlertCircle
              className='w-8 h-8 mx-auto mb-3'
              style={{ color: 'var(--ns-coral)' }}
            />
            <p
              className='font-serif text-2xl mb-2'
              style={{ color: 'var(--ns-ink)' }}
            >
              Erreur de chargement
            </p>
            <p className='ns2-body mb-4' style={{ color: 'var(--ns-ink-3)' }}>
              {error?.message || 'Patient introuvable'}
            </p>
            <button
              onClick={() => router.push('/dashboard/nutritionist/patients')}
              className='fp-btn'
            >
              <ChevronLeft className='w-3.5 h-3.5' />
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { patient, appointments_count } = data;
  const fullName = `${patient.first_name} ${patient.last_name}`;
  const initials =
    `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`.toUpperCase();
  const status = statusConfig[patient.status] || statusConfig.active;

  const age = computeAge(patient.date_of_birth);
  const gender = formatGender(patient.gender);
  const stickerLabel = formatFollowUpDuration(patient.assigned_at);
  const reasonLabel = patient.consultation_reason
    ? formatConsultationReason(patient.consultation_reason)
    : null;
  const sinceLabel = patient.assigned_at
    ? `Patient depuis le ${new Date(patient.assigned_at).toLocaleDateString(
        'fr-FR',
        { day: 'numeric', month: 'long', year: 'numeric' }
      )}`
    : null;
  const sessionsLabel =
    appointments_count > 0
      ? `${appointments_count} séance${appointments_count > 1 ? 's' : ''}`
      : null;

  // Split last name to italicize it for editorial effect (matches Fraunces italic accent)
  const firstNameDisplay = patient.first_name;
  const lastNameDisplay = patient.last_name;

  return (
    <div className='px-9 pb-16'>
      {/* ─── Hero patient ─── */}
      <section className='fp-hero'>
        {stickerLabel && (
          <span className='fp-hero-sticker'>{stickerLabel}</span>
        )}

        <div className='fp-hero-left'>
          <span
            className={`fp-hero-avatar ${
              patient.status === 'pending'
                ? 'is-pending'
                : patient.status === 'inactive'
                  ? 'is-inactive'
                  : ''
            }`}
            style={
              patient.avatar_url
                ? { backgroundImage: `url(${patient.avatar_url})` }
                : undefined
            }
            aria-label={fullName}
          >
            {!patient.avatar_url && initials}
            <span className='fp-status-dot' aria-hidden='true' />
          </span>

          <div className='min-w-0'>
            <span className='fp-eyebrow'>
              Fiche patient
              {sinceLabel ? <> · {sinceLabel}</> : null}
            </span>
            <h1 className='fp-hero-name'>
              {firstNameDisplay} <em>{lastNameDisplay}</em>
              <span className={`fp-hero-chip ${status.chipClass}`}>
                {status.label}
              </span>
            </h1>
            <div className='fp-hero-meta'>
              {reasonLabel && (
                <span className='fp-pill-obj'>
                  <Target className='w-3.5 h-3.5' />
                  {reasonLabel}
                </span>
              )}
              {(age || gender) && (
                <>
                  {reasonLabel && (
                    <span className='fp-hero-meta-sep' aria-hidden='true' />
                  )}
                  <span>
                    {age && <>{age} ans</>}
                    {age && gender && ' · '}
                    {gender}
                  </span>
                </>
              )}
              {sessionsLabel && (
                <>
                  <span className='fp-hero-meta-sep' aria-hidden='true' />
                  <span>{sessionsLabel}</span>
                </>
              )}
              <span className='fp-hero-meta-sep' aria-hidden='true' />
              <a href={`mailto:${patient.email}`}>{patient.email}</a>
              {patient.phone && (
                <>
                  <span className='fp-hero-meta-sep' aria-hidden='true' />
                  <a href={`tel:${patient.phone}`}>{patient.phone}</a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className='fp-hero-actions'>
          <button
            className='fp-btn fp-btn-icon'
            aria-label="Plus d'actions"
            title="Plus d'actions"
            type='button'
          >
            <MoreVertical className='w-4 h-4' />
          </button>
          <button
            type='button'
            className='fp-btn'
            onClick={() => router.push('/dashboard/nutritionist/patients')}
          >
            <ChevronLeft className='w-3.5 h-3.5' />
            Retour
          </button>
          <button
            type='button'
            className='fp-btn fp-btn-peps'
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare className='w-3.5 h-3.5' />
            Message
          </button>
          <button
            type='button'
            className='fp-btn fp-btn-dark'
            onClick={() => router.push('/dashboard/nutritionist/agenda')}
          >
            <CalendarPlus className='w-3.5 h-3.5' />
            Planifier RDV
          </button>
        </div>
      </section>

      {/* ─── Tabs (flat v3 — Dossier group + separator + Autre group) ─── */}
      <div className='fp-tabs' role='tablist'>
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const prevTab = tabs[index - 1];
          const showSeparator = prevTab && prevTab.group !== tab.group;

          // Tab badges driven by useDossierSummary.
          // Anamnèse no longer carries a badge: change-reports are removed
          // from the simplified UI.
          let badge: { count: number; coral?: boolean } | null = null;
          if (
            tab.id === 'questionnaires' &&
            dossierSummary?.pending_questionnaires
          ) {
            badge = { count: dossierSummary.pending_questionnaires };
          }

          return (
            <React.Fragment key={tab.id}>
              {showSeparator && (
                <span className='fp-tab-sep' aria-hidden='true' />
              )}
              <button
                type='button'
                role='tab'
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`fp-tab ${isActive ? 'is-active' : ''}`}
              >
                <Icon className='w-3.5 h-3.5' />
                {tab.label}
                {badge && (
                  <span
                    className={`fp-tab-count ${badge.coral ? 'is-coral' : ''}`}
                  >
                    {badge.count}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* ─── Tab Content ─── */}
      <div className='fp-pane' key={activeTab}>
        {activeTab === 'synthese' && <PatientSyntheseTab data={data} />}
        {activeTab === 'anamnese' && (
          <NutritionistAnamneseView
            patientId={patient.id}
            patientFirstName={patient.first_name}
            patientLastName={patient.last_name}
            patientEmail={patient.email}
            patientPhone={patient.phone || undefined}
            patientConsultationReason={patient.consultation_reason || undefined}
          />
        )}
        {activeTab === 'questionnaires' && (
          <NutritionistQuestionnairesView patientId={patient.id} />
        )}
        {activeTab === 'documents' && (
          <NutritionistDocumentsView patientId={patient.id} />
        )}
        {activeTab === 'consultations' && (
          <ConsultationsTab
            patientId={patient.id}
            patientName={fullName}
            fromAppointmentId={fromAppointment || undefined}
          />
        )}
        {activeTab === 'objectifs' && (
          <NutritionistObjectivesView patientId={patient.id} />
        )}
        {activeTab === 'profil' && (
          <NutritionalProfileTab
            patientId={patient.id}
            patientName={fullName}
          />
        )}
        {activeTab === 'plan' && (
          <MealPlanTab patientId={patient.id} patientName={fullName} />
        )}
        {activeTab === 'suivi' && (
          <SuiviTab patientId={patient.id} patientName={fullName} />
        )}
        {activeTab === 'messages' && (
          <PatientMessagesTab
            patientUserId={patient.user_id}
            patientName={fullName}
          />
        )}
      </div>
    </div>
  );
}
