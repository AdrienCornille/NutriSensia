'use client';

import React, { useState, useCallback } from 'react';
import {
  Loader2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Calendar,
  Target,
  UtensilsCrossed,
  Settings,
  Trash2,
  Play,
  Archive,
  Copy,
  BookmarkPlus,
  BookmarkMinus,
} from 'lucide-react';
import { usePatientMealPlans, useDeleteMealPlan, useUpdateMealPlan } from '@/hooks/useNutritionistMealPlans';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';
import type { MealPlanSummary } from '@/types/nutritionist-dossier';

// ============================================================================
// Confirm Delete Modal
// ============================================================================

function ConfirmDeleteModal({
  planName,
  onConfirm,
  onCancel,
}: {
  planName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6'>
        <div className='flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4'>
          <AlertTriangle className='w-6 h-6 text-red-600' />
        </div>
        <h3 className='text-lg font-semibold text-gray-800 text-center mb-2'>
          Supprimer ce plan ?
        </h3>
        <p className='text-sm text-gray-500 text-center mb-6'>
          Le plan <span className='font-medium text-gray-700'>&laquo; {planName} &raquo;</span> et
          tous ses repas seront définitivement supprimés. Cette action est irréversible.
        </p>
        <div className='flex gap-3'>
          <button
            onClick={onCancel}
            className='flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className='flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium'
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Confirm Model Modal
// ============================================================================

function ConfirmTemplateModal({
  planName,
  onConfirm,
  onCancel,
}: {
  planName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6'>
        <div className='flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4'>
          <BookmarkPlus className='w-6 h-6 text-purple-600' />
        </div>
        <h3 className='text-lg font-semibold text-gray-800 text-center mb-2'>
          Sauvegarder comme modèle ?
        </h3>
        <p className='text-sm text-gray-500 text-center mb-6'>
          Le plan <span className='font-medium text-gray-700'>&laquo; {planName} &raquo;</span> sera
          enregistré comme modèle réutilisable pour vos futurs patients.
        </p>
        <div className='flex gap-3'>
          <button
            onClick={onCancel}
            className='flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className='flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium'
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Confirm Remove Model Modal
// ============================================================================

function ConfirmRemoveTemplateModal({
  planName,
  onConfirm,
  onCancel,
}: {
  planName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6'>
        <div className='flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4'>
          <BookmarkMinus className='w-6 h-6 text-purple-600' />
        </div>
        <h3 className='text-lg font-semibold text-gray-800 text-center mb-2'>
          Retirer des modèles ?
        </h3>
        <p className='text-sm text-gray-500 text-center mb-6'>
          Le plan <span className='font-medium text-gray-700'>&laquo; {planName} &raquo;</span> ne
          sera plus disponible comme modèle réutilisable. Le plan lui-même ne sera pas supprimé.
        </p>
        <div className='flex gap-3'>
          <button
            onClick={onCancel}
            className='flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className='flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium'
          >
            Retirer
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Status Config
// ============================================================================

const statusConfig: Record<
  string,
  { label: string; bgColor: string; textColor: string }
> = {
  draft: { label: 'Brouillon', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  active: { label: 'Actif', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  paused: { label: 'En pause', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
  completed: { label: 'Terminé', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  archived: { label: 'Archivé', bgColor: 'bg-gray-100', textColor: 'text-gray-500' },
};

// ============================================================================
// Plan Card
// ============================================================================

function PlanCard({
  plan,
  onOpen,
  onEdit,
  onDelete,
  onActivate,
  onArchive,
  onSaveAsTemplate,
  onRemoveTemplate,
}: {
  plan: MealPlanSummary;
  onOpen: (plan: MealPlanSummary) => void;
  onEdit: (plan: MealPlanSummary) => void;
  onDelete: (plan: MealPlanSummary) => void;
  onActivate: (plan: MealPlanSummary) => void;
  onArchive: (plan: MealPlanSummary) => void;
  onSaveAsTemplate: (plan: MealPlanSummary) => void;
  onRemoveTemplate: (plan: MealPlanSummary) => void;
}) {
  const s = statusConfig[plan.status] || statusConfig.draft;

  const startDate = new Date(plan.start_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const endDate = new Date(plan.end_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => onOpen(plan)}
      className='bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors cursor-pointer'
    >
      {/* Header */}
      <div className='mb-3'>
        <div className='flex items-center gap-2 mb-1'>
          <h3 className='text-base font-semibold text-gray-800 truncate'>
            {plan.name}
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.bgColor} ${s.textColor}`}
          >
            {s.label}
          </span>
          {plan.is_template && (
            <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600'>
              Modèle
            </span>
          )}
        </div>
        {plan.objective && (
          <p className='text-sm text-gray-500 flex items-center gap-1.5'>
            <Target className='w-3.5 h-3.5 shrink-0' />
            {plan.objective}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className='flex items-center gap-4 text-xs text-gray-500 mb-4'>
        <span className='flex items-center gap-1'>
          <Calendar className='w-3.5 h-3.5' />
          {startDate} - {endDate}
        </span>
        <span className='flex items-center gap-1'>
          <UtensilsCrossed className='w-3.5 h-3.5' />
          {plan.days_count} jour{plan.days_count !== 1 ? 's' : ''} &middot;{' '}
          {plan.meals_count} repas
        </span>
      </div>

      {/* Action buttons */}
      <div
        className='flex items-center gap-1.5 pt-3 border-t border-gray-100'
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => onOpen(plan)}
          className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#1B998B] hover:bg-emerald-50 rounded-lg transition-colors'
          title='Planifier les repas'
        >
          <UtensilsCrossed className='w-3.5 h-3.5' />
          Repas
        </button>
        <button
          onClick={() => onEdit(plan)}
          className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
          title='Paramètres du plan'
        >
          <Settings className='w-3.5 h-3.5' />
          Paramètres
        </button>
        {plan.status === 'draft' && (
          <button
            onClick={() => onActivate(plan)}
            className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors'
            title='Publier'
          >
            <Play className='w-3.5 h-3.5' />
            Publier
          </button>
        )}
        {(plan.status === 'active' || plan.status === 'paused') && (
          <button
            onClick={() => onArchive(plan)}
            className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'
            title='Archiver'
          >
            <Archive className='w-3.5 h-3.5' />
            Archiver
          </button>
        )}
        {plan.is_template ? (
          <button
            onClick={() => onRemoveTemplate(plan)}
            className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors'
            title='Retirer des modèles'
          >
            <BookmarkMinus className='w-3.5 h-3.5' />
            Retirer modèle
          </button>
        ) : (
          <button
            onClick={() => onSaveAsTemplate(plan)}
            className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#1B998B] hover:bg-emerald-50 rounded-lg transition-colors'
            title='Sauvegarder comme modèle'
          >
            <BookmarkPlus className='w-3.5 h-3.5' />
            Modèle
          </button>
        )}
        <div className='flex-1' />
        <button
          onClick={() => onDelete(plan)}
          className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors'
          title='Supprimer'
        >
          <Trash2 className='w-3.5 h-3.5' />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Main List Component
// ============================================================================

interface MealPlanListProps {
  patientId: string;
  onOpen: (plan: MealPlanSummary) => void;
  onEdit: (plan: MealPlanSummary) => void;
  onCreate: () => void;
  onCreateFromTemplate?: () => void;
}

const FILTER_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'archived', label: 'Archivés' },
];

export function MealPlanList({ patientId, onOpen, onEdit, onCreate, onCreateFromTemplate }: MealPlanListProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<MealPlanSummary | null>(null);
  const [templateTarget, setTemplateTarget] = useState<MealPlanSummary | null>(null);
  const [removeTemplateTarget, setRemoveTemplateTarget] = useState<MealPlanSummary | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; title: string; message?: string }>({
    visible: false, type: 'success', title: '',
  });
  const hideToast = useCallback(() => setToast(t => ({ ...t, visible: false })), []);
  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    setToast({ visible: true, type, title, message });
  }, []);

  const { data: plans, isLoading, error } = usePatientMealPlans(patientId);
  const deleteMutation = useDeleteMealPlan(patientId);
  const updateMutation = useUpdateMealPlan(patientId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        <span className='ml-2 text-sm text-gray-500'>
          Chargement des plans alimentaires...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
        <AlertCircle className='w-8 h-8 text-red-500 mx-auto mb-3' />
        <p className='text-gray-800 font-medium mb-1'>Erreur de chargement</p>
        <p className='text-sm text-gray-500'>{error.message}</p>
      </div>
    );
  }

  const allPlans = plans || [];
  const isArchived = (status: string) => !['active', 'draft'].includes(status);
  const filteredPlans = statusFilter === 'all'
    ? allPlans
    : statusFilter === 'archived'
      ? allPlans.filter(p => isArchived(p.status))
      : allPlans.filter(p => p.status === statusFilter);

  // Count per status for the tab badges
  const counts: Record<string, number> = {
    all: allPlans.length,
    active: allPlans.filter(p => p.status === 'active').length,
    draft: allPlans.filter(p => p.status === 'draft').length,
    archived: allPlans.filter(p => isArchived(p.status)).length,
  };

  function handleDelete(plan: MealPlanSummary) {
    setDeleteTarget(plan);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast('success', 'Plan supprimé', `Le plan « ${name} » a été supprimé.`);
      },
      onError: () => {
        showToast('error', 'Erreur', 'Impossible de supprimer le plan.');
      },
    });
    setDeleteTarget(null);
  }

  function handleActivate(plan: MealPlanSummary) {
    if (
      window.confirm(
        `Publier le plan "${plan.name}" ? Le plan actif actuel sera automatiquement archivé.`
      )
    ) {
      updateMutation.mutate({ planId: plan.id, data: { status: 'active' } });
    }
  }

  function handleArchive(plan: MealPlanSummary) {
    updateMutation.mutate({ planId: plan.id, data: { status: 'archived' } });
  }

  function handleSaveAsTemplate(plan: MealPlanSummary) {
    setTemplateTarget(plan);
  }

  function handleRemoveTemplate(plan: MealPlanSummary) {
    setRemoveTemplateTarget(plan);
  }

  function confirmRemoveTemplate() {
    if (!removeTemplateTarget) return;
    const name = removeTemplateTarget.name;
    updateMutation.mutate(
      { planId: removeTemplateTarget.id, data: { is_template: false } },
      {
        onSuccess: () => {
          showToast('success', 'Modèle retiré', `Le plan « ${name} » n'est plus un modèle.`);
        },
        onError: () => {
          showToast('error', 'Erreur', 'Impossible de retirer le modèle.');
        },
      },
    );
    setRemoveTemplateTarget(null);
  }

  function confirmSaveAsTemplate() {
    if (!templateTarget) return;
    const name = templateTarget.name;
    updateMutation.mutate(
      { planId: templateTarget.id, data: { is_template: true } },
      {
        onSuccess: () => {
          showToast('success', 'Modèle enregistré', `Le plan « ${name} » est maintenant un modèle réutilisable.`);
        },
        onError: () => {
          showToast('error', 'Erreur', 'Impossible d\'enregistrer le modèle.');
        },
      },
    );
    setTemplateTarget(null);
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

      {deleteTarget && (
        <ConfirmDeleteModal
          planName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {templateTarget && (
        <ConfirmTemplateModal
          planName={templateTarget.name}
          onConfirm={confirmSaveAsTemplate}
          onCancel={() => setTemplateTarget(null)}
        />
      )}

      {removeTemplateTarget && (
        <ConfirmRemoveTemplateModal
          planName={removeTemplateTarget.name}
          onConfirm={confirmRemoveTemplate}
          onCancel={() => setRemoveTemplateTarget(null)}
        />
      )}

      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Plans alimentaires
        </h2>
        <div className='flex items-center gap-2'>
          {onCreateFromTemplate && (
            <button
              onClick={onCreateFromTemplate}
              className='flex items-center gap-2 px-4 py-2 border border-[#1B998B] text-[#1B998B] rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium'
            >
              <Copy className='w-4 h-4' />
              Depuis un modèle
            </button>
          )}
          <button
            onClick={onCreate}
            className='flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium'
          >
            <Plus className='w-4 h-4' />
            Nouveau plan
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className='flex gap-2'>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-[#1B998B] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span className={`ml-1.5 ${statusFilter === tab.value ? 'opacity-80' : 'opacity-60'}`}>
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {allPlans.length === 0 && (
        <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <UtensilsCrossed className='w-8 h-8 text-gray-300' />
          </div>
          <p className='text-gray-800 font-medium mb-1'>
            Aucun plan alimentaire
          </p>
          <p className='text-gray-500 text-sm mb-4'>
            Créez un premier plan alimentaire pour ce patient.
          </p>
          <button
            onClick={onCreate}
            className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium'
          >
            <Plus className='w-4 h-4' />
            Créer un plan
          </button>
        </div>
      )}

      {/* Filtered plan list */}
      {allPlans.length > 0 && filteredPlans.length === 0 && (
        <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
          <p className='text-gray-500 text-sm'>
            Aucun plan dans cette catégorie.
          </p>
        </div>
      )}

      {filteredPlans.length > 0 && (
        <div className='space-y-3'>
          {filteredPlans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={handleDelete}
              onActivate={handleActivate}
              onArchive={handleArchive}
              onSaveAsTemplate={handleSaveAsTemplate}
              onRemoveTemplate={handleRemoveTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
