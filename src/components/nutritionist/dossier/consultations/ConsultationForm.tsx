'use client';

import React, { useState, useCallback } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import {
  useCreateConsultation,
  useUpdateConsultation,
} from '@/hooks/useNutritionistConsultations';
import type { AppointmentSummary } from '@/hooks/useNutritionistConsultations';
import type { ConsultationDetail } from '@/types/nutritionist-dossier';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';

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

function deriveFromAppointment(apt: AppointmentSummary) {
  const d = new Date(apt.scheduled_at);
  return {
    date: d.toISOString().split('T')[0],
    startTime: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    duration: apt.duration || apt.consultation_type?.default_duration || 30,
    type: apt.consultation_type?.name_fr || 'Consultation de suivi',
    mode: apt.mode,
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
  const prefill = prefillAppointment ? deriveFromAppointment(prefillAppointment) : null;

  // Form state — priority: consultation (edit) > prefillAppointment > defaults
  const [date, setDate] = useState(
    consultation?.date || prefill?.date || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(
    consultation?.start_time || prefill?.startTime || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
  const [durationMinutes, setDurationMinutes] = useState(
    consultation?.duration_minutes || prefill?.duration || 30
  );
  const [consultationType, setConsultationType] = useState(
    consultation?.consultation_type || prefill?.type || 'Consultation de suivi'
  );
  const [mode, setMode] = useState<'visio' | 'cabinet' | 'phone'>(
    (consultation?.mode as 'visio' | 'cabinet' | 'phone') || prefill?.mode || 'visio'
  );
  const [appointmentId] = useState<string | null>(prefill?.appointmentId || null);
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

  async function handleSubmit(asDraft: boolean = false) {
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

  const consultationTypes = [
    'Première consultation',
    'Consultation de suivi',
    'Bilan approfondi',
    'Consultation urgente',
  ];

  return (
    <div className='space-y-6'>
      <Toast
        isVisible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />

      {/* Appointment link indicator */}
      {appointmentId && (
        <div className='bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-700'>
          Ce compte-rendu sera lié au rendez-vous du{' '}
          <span className='font-medium'>
            {new Date(prefillAppointment!.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      )}

      {/* Auto-filled header */}
      <div className='bg-[#1B998B]/5 rounded-xl p-4 border border-[#1B998B]/10'>
        <div className='flex items-center gap-6 text-sm flex-wrap'>
          <div>
            <span className='text-[#1B998B] font-medium'>Patient :</span>
            <span className='text-[#147569] ml-1'>{patientName}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-[#1B998B] font-medium'>Date :</span>
            <input
              type='date'
              value={date}
              onChange={e => setDate(e.target.value)}
              className='px-2 py-1 border border-[#1B998B]/20 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30'
              disabled={isEditing}
            />
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-[#1B998B] font-medium'>Heure :</span>
            <input
              type='time'
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className='px-2 py-1 border border-[#1B998B]/20 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30'
              disabled={isEditing}
            />
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-[#1B998B] font-medium'>Durée :</span>
            <select
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
              className='px-2 py-1 border border-[#1B998B]/20 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30'
            >
              {[15, 30, 45, 60, 90, 120].map(d => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='flex items-center gap-6 text-sm mt-3 flex-wrap'>
          <div className='flex items-center gap-2'>
            <span className='text-[#1B998B] font-medium'>Type :</span>
            <select
              value={consultationType}
              onChange={e => setConsultationType(e.target.value)}
              className='px-2 py-1 border border-[#1B998B]/20 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30'
            >
              {consultationTypes.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-[#1B998B] font-medium'>Mode :</span>
            <div className='flex gap-1'>
              {(['visio', 'cabinet', 'phone'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    mode === m
                      ? 'bg-[#1B998B] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {m === 'visio'
                    ? '📹 Visio'
                    : m === 'cabinet'
                      ? '🏢 Cabinet'
                      : '📞 Téléphone'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='space-y-6'>
          {/* Summary */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Résumé de la consultation *
            </label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder='Décrivez les points abordés, les progrès observés et les ajustements décidés...'
              className='w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent resize-none h-32 text-sm'
            />
          </div>

          {/* Key points */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Points clés
            </label>
            <div className='space-y-2'>
              {keyPoints.map((point, i) => (
                <div key={i} className='flex items-center gap-2'>
                  <span className='text-[#1B998B]'>•</span>
                  <input
                    type='text'
                    value={point}
                    onChange={e => updateKeyPoint(i, e.target.value)}
                    placeholder='Saisissez un point clé...'
                    className='flex-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent text-sm'
                  />
                  {keyPoints.length > 1 && (
                    <button
                      onClick={() => removeKeyPoint(i)}
                      className='p-1 text-gray-400 hover:text-red-500 transition-colors'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addKeyPoint}
                className='flex items-center gap-1.5 text-sm text-[#1B998B] font-medium hover:text-[#147569] mt-1 transition-colors'
              >
                <Plus className='w-4 h-4' />
                Ajouter un point clé
              </button>
            </div>
          </div>

          {/* Next steps */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Prochaines étapes
            </label>
            <textarea
              value={nextSteps}
              onChange={e => setNextSteps(e.target.value)}
              placeholder='Définissez les actions et objectifs pour la période à venir...'
              className='w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent resize-none h-24 text-sm'
            />
          </div>

          {/* Private notes */}
          <div className='bg-red-50 rounded-xl p-5 border border-red-100'>
            <label className='flex items-center gap-2 text-sm font-medium text-red-700 mb-2'>
              🔒 Notes privées
              <span className='text-xs font-normal text-red-500'>
                (non visibles par le patient)
              </span>
            </label>
            <textarea
              value={privateNotes}
              onChange={e => setPrivateNotes(e.target.value)}
              placeholder='Notes confidentielles sur le patient...'
              className='w-full p-4 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none h-20 text-sm bg-white'
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center justify-between'>
        <button
          onClick={() => handleSubmit(true)}
          disabled={isSaving}
          className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm disabled:opacity-50'
        >
          Sauvegarder en brouillon
        </button>
        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm'
          >
            Annuler
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSaving || !summary.trim()}
            className='flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors font-medium text-sm disabled:opacity-50'
          >
            {isSaving && <Loader2 className='w-4 h-4 animate-spin' />}
            {isEditing ? 'Enregistrer les modifications' : 'Enregistrer le compte-rendu'}
          </button>
        </div>
      </div>
    </div>
  );
}
