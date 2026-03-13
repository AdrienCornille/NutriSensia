'use client';

import React, { useState, useCallback, useRef } from 'react';
import { NutritionalProfileList } from './NutritionalProfileList';
import { NutritionalProfileForm } from './NutritionalProfileForm';
import { NutritionalProfileDetail } from './NutritionalProfileDetail';
import { NutritionalProfileCompare } from './NutritionalProfileCompare';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';
import { useViewHistory } from '@/hooks/useViewHistory';
import type { NutritionalProfileSummary } from '@/types/nutritional-profile';

// ============================================================================
// Types
// ============================================================================

type ProfileView = 'list' | 'create' | 'edit' | 'detail' | 'compare';

interface NutritionalProfileTabProps {
  patientId: string;
  patientName: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function NutritionalProfileTab({ patientId, patientName }: NutritionalProfileTabProps) {
  const [view, setView] = useState<ProfileView>('list');
  const [selectedProfile, setSelectedProfile] = useState<NutritionalProfileSummary | null>(null);
  const [compareIds, setCompareIds] = useState<[string, string] | null>(null);

  // Keep a ref so browser forward can restore the child view
  const lastProfileRef = useRef<NutritionalProfileSummary | null>(null);

  const resetToList = useCallback(() => {
    setSelectedProfile(null);
    setCompareIds(null);
    setView('list');
  }, []);

  const handleForward = useCallback((v: string) => {
    if (v === 'detail' && lastProfileRef.current) {
      setSelectedProfile(lastProfileRef.current);
      setView('detail');
    } else if (v === 'edit' && lastProfileRef.current) {
      setSelectedProfile(lastProfileRef.current);
      setView('edit');
    }
  }, []);

  const { goBack } = useViewHistory(view, 'list', resetToList, handleForward);

  // ---- Handlers ----

  const handleViewDetail = useCallback((profile: NutritionalProfileSummary) => {
    lastProfileRef.current = profile;
    setSelectedProfile(profile);
    setView('detail');
  }, []);

  const handleEdit = useCallback((profile: NutritionalProfileSummary) => {
    lastProfileRef.current = profile;
    setSelectedProfile(profile);
    setView('edit');
  }, []);

  const handleEditFromDetail = useCallback(() => {
    // selectedProfile is already set from detail view
    setView('edit');
  }, []);

  const handleCompare = useCallback((idA: string, idB: string) => {
    setCompareIds([idA, idB]);
    setView('compare');
  }, []);

  const handleBackToList = useCallback(() => {
    goBack();
  }, [goBack]);

  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; title: string; message?: string }>({
    visible: false,
    type: 'success',
    title: '',
  });
  const hideToast = useCallback(() => setToast((t) => ({ ...t, visible: false })), []);

  const FORM_SUCCESS_MESSAGES: Record<string, { title: string; message: string }> = {
    created_draft: {
      title: 'Brouillon enregistré',
      message: 'Le profil nutritionnel a été sauvegardé en brouillon.',
    },
    created_active: {
      title: 'Profil créé et activé',
      message: 'Le profil nutritionnel est maintenant actif et visible par le patient.',
    },
    updated: {
      title: 'Profil mis à jour',
      message: 'Les modifications ont été enregistrées avec succès.',
    },
  };

  const handleFormSuccess = useCallback((action: 'created_draft' | 'created_active' | 'updated') => {
    resetToList();
    const msg = FORM_SUCCESS_MESSAGES[action];
    if (msg) {
      setToast({ visible: true, type: 'success', title: msg.title, message: msg.message });
    }
  }, [resetToList]);

  // ---- Render ----

  return (
    <div>
      <Toast
        isVisible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />

      {view === 'list' && (
        <NutritionalProfileList
          patientId={patientId}
          onCreate={() => setView('create')}
          onView={handleViewDetail}
          onEdit={handleEdit}
          onCompare={handleCompare}
        />
      )}

      {view === 'create' && (
        <NutritionalProfileForm
          patientId={patientId}
          patientName={patientName}
          onClose={handleBackToList}
          onSuccess={handleFormSuccess}
        />
      )}

      {view === 'edit' && selectedProfile && (
        <NutritionalProfileForm
          patientId={patientId}
          patientName={patientName}
          editProfileId={selectedProfile.id}
          onClose={handleBackToList}
          onSuccess={handleFormSuccess}
        />
      )}

      {view === 'detail' && selectedProfile && (
        <NutritionalProfileDetail
          patientId={patientId}
          profileId={selectedProfile.id}
          onBack={handleBackToList}
          onEdit={handleEditFromDetail}
        />
      )}

      {view === 'compare' && compareIds && (
        <NutritionalProfileCompare
          patientId={patientId}
          profileAId={compareIds[0]}
          profileBId={compareIds[1]}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
}
