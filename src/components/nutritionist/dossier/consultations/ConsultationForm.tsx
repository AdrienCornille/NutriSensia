'use client';

import React, { useState, useCallback } from 'react';
import { X, Plus, Loader2, Clock, Video, Building2, Phone } from 'lucide-react';
import {
  useCreateConsultation,
  useUpdateConsultation,
} from '@/hooks/useNutritionistConsultations';
import type { AppointmentSummary } from '@/hooks/useNutritionistConsultations';
import type { ConsultationDetail } from '@/types/nutritionist-dossier';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';
import { PrivateNotesBlock } from './PrivateNotesBlock';

interface ConsultationFormProps {
  patientId: string;
  patientName: string;
  /** If provided, we are in edit mode */
  consultation?: ConsultationDetail | null;
  /** If provided, pre-fill from this appointment */
  prefillAppointment?: AppointmentSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CONSULTATION_TYPES = [
  'Première consultation',
  'Consultation de suivi',
  'Bilan approfondi',
  'Consultation urgente',
];

type ConsultationMode = 'visio' | 'cabinet' | 'phone';

function deriveFromAppointment(apt: AppointmentSummary) {
  const d = new Date(apt.scheduled_at);
  return {
    date: d.toISOString().split('T')[0],
    startTime: d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    duration: apt.duration || apt.consultation_type?.default_duration || 30,
    type: apt.consultation_type?.name_fr || 'Consultation de suivi',
    mode: apt.mode as ConsultationMode,
    appointmentId: apt.id,
  };
}

export function ConsultationForm({
  patientId,
  patientName,
  consultation,
  prefillAppointment,
  onClose,
  onSuccess,
}: ConsultationFormProps) {
  const isEditing = !!consultation;
  const prefill = prefillAppointment
    ? deriveFromAppointment(prefillAppointment)
    : null;

  // Form state — priority: consultation (edit) > prefillAppointment > defaults
  const [date, setDate] = useState(
    consultation?.date ||
      prefill?.date ||
      new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(
    consultation?.start_time ||
      prefill?.startTime ||
      new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
  );
  const [durationMinutes, setDurationMinutes] = useState(
    consultation?.duration_minutes || prefill?.duration || 30
  );
  const [consultationType, setConsultationType] = useState(
    consultation?.consultation_type || prefill?.type || 'Consultation de suivi'
  );
  const [mode, setMode] = useState<ConsultationMode>(
    (consultation?.mode as ConsultationMode) || prefill?.mode || 'visio'
  );
  const [appointmentId] = useState<string | null>(
    prefill?.appointmentId || null
  );
  const [summary, setSummary] = useState(consultation?.summary || '');
  const [keyPoints, setKeyPoints] = useState<string[]>(
    consultation?.key_points && consultation.key_points.length > 0
      ? consultation.key_points
      : ['']
  );
  const [nextSteps, setNextSteps] = useState(consultation?.next_steps || '');
  const [privateNotes, setPrivateNotes] = useState(
    consultation?.private_notes || ''
  );

  // Toast
  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message?: string;
  }>({ visible: false, type: 'success', title: '' });
  const hideToast = useCallback(
    () => setToast(t => ({ ...t, visible: false })),
    []
  );

  const createMutation = useCreateConsultation(patientId);
  const updateMutation = useUpdateConsultation(patientId);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function addKeyPoint() {
    setKeyPoints(prev => [...prev, '']);
  }
  function removeKeyPoint(index: number) {
    setKeyPoints(prev => prev.filter((_, i) => i !== index));
  }
  function updateKeyPoint(index: number, value: string) {
    setKeyPoints(prev => prev.map((p, i) => (i === index ? value : p)));
  }

  async function handleSubmit(asDraft = false) {
    if (!summary.trim()) {
      setToast({
        visible: true,
        type: 'error',
        title: 'Résumé requis',
        message: 'Veuillez saisir un résumé de la consultation.',
      });
      return;
    }

    const filteredKeyPoints = keyPoints.filter(p => p.trim());

    try {
      if (isEditing && consultation) {
        await updateMutation.mutateAsync({
          consultationId: consultation.id,
          summary: summary.trim(),
          key_points: filteredKeyPoints,
          next_steps: nextSteps.trim() || undefined,
          private_notes: privateNotes.trim() || undefined,
          consultation_type: consultationType.trim() || undefined,
          duration_minutes: durationMinutes,
          mode,
          status: asDraft ? 'draft' : 'final',
        });
      } else {
        await createMutation.mutateAsync({
          appointment_id: appointmentId || undefined,
          date,
          start_time: startTime || undefined,
          duration_minutes: durationMinutes,
          consultation_type: consultationType.trim() || undefined,
          mode,
          summary: summary.trim(),
          key_points: filteredKeyPoints,
          next_steps: nextSteps.trim() || undefined,
          private_notes: privateNotes.trim() || undefined,
          status: asDraft ? 'draft' : 'final',
        });
      }

      setToast({
        visible: true,
        type: 'success',
        title: isEditing ? 'Compte-rendu modifié' : 'Compte-rendu créé',
        message: asDraft
          ? 'Le brouillon a été sauvegardé.'
          : 'Le compte-rendu a été enregistré.',
      });

      setTimeout(() => onSuccess(), 800);
    } catch (err: unknown) {
      setToast({
        visible: true,
        type: 'error',
        title: 'Erreur',
        message:
          err instanceof Error ? err.message : 'Impossible de sauvegarder.',
      });
    }
  }

  return (
    <div className='space-y-4'>
      <Toast
        isVisible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />

      {/* Appointment link indicator */}
      {appointmentId && prefillAppointment && (
        <div
          className='fp-cons-drafts-alert'
          style={{
            background: 'var(--ns-peps-soft)',
            borderColor: 'var(--ns-ink)',
          }}
        >
          <span>
            <b>Lié au rendez-vous</b> du{' '}
            {new Date(prefillAppointment.scheduled_at).toLocaleDateString(
              'fr-FR',
              { day: 'numeric', month: 'long', year: 'numeric' }
            )}
          </span>
        </div>
      )}

      <form
        className='fp-cons-form'
        onSubmit={e => {
          e.preventDefault();
          handleSubmit(false);
        }}
      >
        {/* ─── Meta row ─── */}
        <div className='fp-form-meta'>
          <div className='fp-form-meta-cell'>
            <label>Patient</label>
            <input type='text' value={patientName} disabled readOnly />
          </div>
          <div className='fp-form-meta-cell'>
            <label>Date</label>
            <input
              type='date'
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={isEditing}
            />
          </div>
          <div className='fp-form-meta-cell'>
            <label>Heure</label>
            <input
              type='time'
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              disabled={isEditing}
            />
          </div>
          <div className='fp-form-meta-cell'>
            <label>Durée</label>
            <select
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
            >
              {[15, 30, 45, 60, 90, 120].map(d => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>
          <div className='fp-form-meta-cell'>
            <label>Type</label>
            <select
              value={consultationType}
              onChange={e => setConsultationType(e.target.value)}
            >
              {CONSULTATION_TYPES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div
            className='fp-form-meta-cell'
            style={{ gridColumn: 'span 2', minWidth: 0 }}
          >
            <label>Mode</label>
            <div className='fp-form-mode-row'>
              {(
                [
                  { id: 'visio', label: 'Visio', Icon: Video },
                  { id: 'cabinet', label: 'Cabinet', Icon: Building2 },
                  { id: 'phone', label: 'Téléphone', Icon: Phone },
                ] as const
              ).map(({ id, label, Icon }) => (
                <label
                  key={id}
                  className={mode === id ? 'is-active' : ''}
                  onClick={() => setMode(id)}
                >
                  <Icon className='w-3 h-3' />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Summary ─── */}
        <div>
          <label className='fp-form-label'>
            Résumé de la consultation <em>· obligatoire</em>
          </label>
          <textarea
            className='fp-form-textarea'
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder='Décrivez les points abordés, les observations cliniques, le ressenti du patient…'
          />
        </div>

        {/* ─── Key points ─── */}
        <div>
          <label className='fp-form-label'>
            Points clés <em>· trois max recommandés</em>
          </label>
          <div className='fp-form-points'>
            {keyPoints.map((point, i) => (
              <div key={i} className='fp-form-point-row'>
                <input
                  type='text'
                  className='fp-form-input'
                  value={point}
                  onChange={e => updateKeyPoint(i, e.target.value)}
                  placeholder='Saisissez un point clé…'
                />
                <button
                  type='button'
                  aria-label='Supprimer ce point clé'
                  onClick={() => removeKeyPoint(i)}
                  disabled={keyPoints.length <= 1}
                >
                  <X className='w-3 h-3' />
                </button>
              </div>
            ))}
          </div>
          <button
            type='button'
            className='fp-form-add-point'
            onClick={addKeyPoint}
            style={{ marginTop: 8 }}
          >
            <Plus className='w-3 h-3' />
            Ajouter un point clé
          </button>
        </div>

        {/* ─── Next steps ─── */}
        <div>
          <label className='fp-form-label'>Prochaines étapes</label>
          <textarea
            className='fp-form-textarea'
            style={{ minHeight: 70 }}
            value={nextSteps}
            onChange={e => setNextSteps(e.target.value)}
            placeholder='Actions, objectifs, plan envoyé, prochain RDV…'
          />
        </div>

        {/* ─── Private notes ─── */}
        <div>
          <label className='fp-form-label'>
            Notes privées <em>· non visibles par le patient</em>
          </label>
          <PrivateNotesBlock>
            <textarea
              className='fp-form-textarea is-private'
              style={{
                marginTop: 6,
                background: 'transparent',
                border: 0,
                padding: 0,
                minHeight: 60,
              }}
              value={privateNotes}
              onChange={e => setPrivateNotes(e.target.value)}
              placeholder='Vos observations cliniques internes, hypothèses, alertes à garder en tête…'
            />
          </PrivateNotesBlock>
        </div>

        {/* ─── Form footer ─── */}
        <div className='fp-form-foot'>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--ns-font-serif)',
              fontStyle: 'italic',
              fontSize: 13,
              color: 'var(--ns-ink-3)',
            }}
          >
            <Clock className='w-3 h-3' style={{ color: 'var(--ns-ink-3)' }} />
            <span>
              Une fois finalisé, vous disposez de{' '}
              <b style={{ color: 'var(--ns-ink)' }}>48h</b> pour modifier ce
              compte-rendu.
            </span>
          </div>
          <div className='fp-form-foot-actions'>
            <button
              type='button'
              className='fp-btn'
              onClick={onClose}
              disabled={isSaving}
            >
              Annuler
            </button>
            <button
              type='button'
              className='fp-btn'
              style={{ background: 'var(--ns-honey)' }}
              onClick={() => handleSubmit(true)}
              disabled={isSaving}
            >
              Sauvegarder en brouillon
            </button>
            <button
              type='submit'
              className='fp-btn fp-btn-peps'
              disabled={isSaving || !summary.trim()}
            >
              {isSaving && <Loader2 className='w-3 h-3 animate-spin' />}
              {isEditing ? 'Enregistrer' : 'Finaliser'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
