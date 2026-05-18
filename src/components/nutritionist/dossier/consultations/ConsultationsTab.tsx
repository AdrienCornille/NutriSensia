'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, Sparkles, ClipboardEdit } from 'lucide-react';
import { ConsultationsList } from './ConsultationsList';
import { ConsultationForm } from './ConsultationForm';
import { ConsultationPreparation } from './ConsultationPreparation';
import { useViewHistory } from '@/hooks/useViewHistory';
import { usePatientConsultations } from '@/hooks/useNutritionistConsultations';
import type { ConsultationDetail } from '@/types/nutritionist-dossier';
import type { AppointmentSummary } from '@/hooks/useNutritionistConsultations';

type ConsultationView = 'list' | 'create' | 'edit' | 'preparation';

interface ConsultationsTabProps {
  patientId: string;
  patientName: string;
  fromAppointmentId?: string;
}

export function ConsultationsTab({
  patientId,
  patientName,
  fromAppointmentId,
}: ConsultationsTabProps) {
  const [view, setView] = useState<ConsultationView>('list');
  const [editingConsultation, setEditingConsultation] =
    useState<ConsultationDetail | null>(null);
  // Pre-fill data from an appointment
  const [prefillFromAppointment, setPrefillFromAppointment] =
    useState<AppointmentSummary | null>(null);

  // Keep refs for browser forward restoration
  const lastEditingRef = useRef<ConsultationDetail | null>(null);
  const lastPrefillRef = useRef<AppointmentSummary | null>(null);

  // Reset state to list view (used by useViewHistory on browser back)
  const resetToList = useCallback(() => {
    setEditingConsultation(null);
    setPrefillFromAppointment(null);
    setView('list');
  }, []);

  // Restore child view on browser forward
  const handleForward = useCallback((v: ConsultationView) => {
    if (v === 'edit' && lastEditingRef.current) {
      setEditingConsultation(lastEditingRef.current);
    }
    if (v === 'create' && lastPrefillRef.current) {
      setPrefillFromAppointment(lastPrefillRef.current);
    }
    setView(v);
  }, []);

  const { goBack } = useViewHistory(view, 'list', resetToList, handleForward);

  // Auto-open consultation creation from agenda redirect
  const { data: consultationsData } = usePatientConsultations(patientId);
  const autoTriggeredRef = useRef(false);

  useEffect(() => {
    if (!fromAppointmentId || autoTriggeredRef.current || !consultationsData)
      return;

    // Find the appointment in past_without_report
    const appointment = consultationsData.past_without_report?.find(
      (apt: AppointmentSummary) => apt.id === fromAppointmentId
    );

    if (appointment) {
      autoTriggeredRef.current = true;
      handleCreateFromAppointment(appointment);
    } else {
      // Appointment not found in past_without_report, just open create form
      autoTriggeredRef.current = true;
      setView('create');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromAppointmentId, consultationsData]);

  function handleEdit(consultation: ConsultationDetail) {
    lastEditingRef.current = consultation;
    setEditingConsultation(consultation);
    setPrefillFromAppointment(null);
    setView('edit');
  }

  function handleCreateFromAppointment(appointment: AppointmentSummary) {
    lastPrefillRef.current = appointment;
    setEditingConsultation(null);
    setPrefillFromAppointment(appointment);
    setView('create');
  }

  function handleBackToList() {
    goBack();
  }

  // Show sub-navigation when in form views
  const showSubNav = view === 'create' || view === 'preparation';

  return (
    <div className='space-y-4'>
      {/* Sub-navigation for create flow (Preparation / Compte-rendu toggle) */}
      {showSubNav && (
        <div className='fp-cons-mode'>
          <button
            type='button'
            className='fp-cons-mode-back'
            onClick={handleBackToList}
          >
            <ChevronLeft className='w-3 h-3' />
            Retour à l&apos;historique
          </button>
          <div className='fp-toggle-pill'>
            <button
              type='button'
              onClick={() => setView('preparation')}
              className={view === 'preparation' ? 'is-active' : ''}
            >
              <Sparkles className='w-3 h-3' />
              Préparation
            </button>
            <button
              type='button'
              onClick={() => setView('create')}
              className={view === 'create' ? 'is-active' : ''}
            >
              <ClipboardEdit className='w-3 h-3' />
              Compte-rendu
            </button>
          </div>
        </div>
      )}

      {/* Edit mode has its own back button */}
      {view === 'edit' && (
        <div className='fp-cons-mode'>
          <button
            type='button'
            className='fp-cons-mode-back'
            onClick={handleBackToList}
          >
            <ChevronLeft className='w-3 h-3' />
            Retour à l&apos;historique
          </button>
        </div>
      )}

      {/* Views */}
      {view === 'list' && (
        <ConsultationsList
          patientId={patientId}
          onEdit={handleEdit}
          onCreateFromAppointment={handleCreateFromAppointment}
        />
      )}

      {view === 'preparation' && (
        <ConsultationPreparation
          patientId={patientId}
          onStartReport={() => setView('create')}
        />
      )}

      {view === 'create' && (
        <ConsultationForm
          patientId={patientId}
          patientName={patientName}
          prefillAppointment={prefillFromAppointment}
          onClose={handleBackToList}
          onSuccess={handleBackToList}
        />
      )}

      {view === 'edit' && editingConsultation && (
        <ConsultationForm
          patientId={patientId}
          patientName={patientName}
          consultation={editingConsultation}
          onClose={handleBackToList}
          onSuccess={handleBackToList}
        />
      )}
    </div>
  );
}
