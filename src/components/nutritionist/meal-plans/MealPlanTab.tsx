'use client';

import React, { useState, useCallback, useRef } from 'react';
import { MealPlanList } from './MealPlanList';
import { MealPlanForm } from './MealPlanForm';
import { MealPlanEditor } from './MealPlanEditor';
import { TemplatePicker } from './TemplatePicker';
import { useViewHistory } from '@/hooks/useViewHistory';
import type { MealPlanSummary } from '@/types/nutritionist-dossier';

// ============================================================================
// Types
// ============================================================================

type MealPlanView = 'list' | 'create' | 'edit' | 'editor';

interface MealPlanTabProps {
  patientId: string;
  patientName: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function MealPlanTab({ patientId, patientName }: MealPlanTabProps) {
  const [view, setView] = useState<MealPlanView>('list');
  const [selectedPlan, setSelectedPlan] = useState<MealPlanSummary | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [editOrigin, setEditOrigin] = useState<'list' | 'editor'>('list');

  // Keep a ref of the last selected plan so browser forward can restore it
  const lastPlanRef = useRef<MealPlanSummary | null>(null);

  // Reset state to list view (used by useViewHistory on browser back)
  const resetToList = useCallback(() => {
    setSelectedPlan(null);
    setView('list');
  }, []);

  // Restore child view on browser forward
  const handleForward = useCallback((v: MealPlanView) => {
    if ((v === 'editor' || v === 'edit') && lastPlanRef.current) {
      setSelectedPlan(lastPlanRef.current);
    }
    setView(v);
  }, []);

  const { goBack } = useViewHistory(view, 'list', resetToList, handleForward);

  function handleOpenEditor(plan: MealPlanSummary) {
    lastPlanRef.current = plan;
    setSelectedPlan(plan);
    setView('editor');
  }

  function handleEditSettingsFromList(plan: MealPlanSummary) {
    lastPlanRef.current = plan;
    setSelectedPlan(plan);
    setEditOrigin('list');
    setView('edit');
  }

  function handleEditSettingsFromEditor(plan: MealPlanSummary) {
    lastPlanRef.current = plan;
    setSelectedPlan(plan);
    setEditOrigin('editor');
    setView('edit');
  }

  function handleBackToList() {
    goBack();
  }

  function handleBackFromEdit() {
    if (editOrigin === 'editor') {
      setView('editor');
    } else {
      goBack();
    }
  }

  return (
    <div>
      {view === 'list' && (
        <MealPlanList
          patientId={patientId}
          onOpen={handleOpenEditor}
          onEdit={handleEditSettingsFromList}
          onCreate={() => setView('create')}
          onCreateFromTemplate={() => setShowTemplatePicker(true)}
        />
      )}

      {view === 'create' && (
        <MealPlanForm
          patientId={patientId}
          patientName={patientName}
          onClose={handleBackToList}
          onSuccess={handleBackToList}
          onCreated={(plan) => {
            setSelectedPlan(plan);
            setView('editor');
          }}
        />
      )}

      {view === 'edit' && selectedPlan && (
        <MealPlanForm
          patientId={patientId}
          patientName={patientName}
          editPlan={selectedPlan}
          onClose={handleBackFromEdit}
          onSuccess={handleBackFromEdit}
        />
      )}

      {view === 'editor' && selectedPlan && (
        <MealPlanEditor
          patientId={patientId}
          patientName={patientName}
          plan={selectedPlan}
          onBack={handleBackToList}
          onEditSettings={handleEditSettingsFromEditor}
        />
      )}

      {/* Template picker modal (PLAN-N-005) */}
      {showTemplatePicker && (
        <TemplatePicker
          patientId={patientId}
          patientName={patientName}
          onClose={() => setShowTemplatePicker(false)}
          onSuccess={() => {
            setShowTemplatePicker(false);
            // Stay on list view, query will refetch
          }}
        />
      )}
    </div>
  );
}
