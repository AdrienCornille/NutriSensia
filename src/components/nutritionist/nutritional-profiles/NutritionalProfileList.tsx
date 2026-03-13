'use client';

import React, { useState, useCallback } from 'react';
import {
  Loader2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Eye,
  Edit3,
  Play,
  Archive,
  Trash2,
  GitCompare,
  Calendar,
  Target,
  Flame,
  Check,
} from 'lucide-react';
import {
  useNutritionalProfiles,
  useActivateProfile,
  useArchiveProfile,
  useDeleteProfile,
} from '@/hooks/useNutritionistNutritionalProfiles';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';
import { GOAL_ADJUSTMENTS, BMR_FORMULAS } from '@/lib/nutritional-profile-calculator';
import type { NutritionalProfile, NutritionalProfileSummary, ProfileStatus } from '@/types/nutritional-profile';

// ============================================================================
// Status Config
// ============================================================================

const statusConfig: Record<ProfileStatus, { label: string; bgColor: string; textColor: string }> = {
  active: { label: 'Actif', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  draft: { label: 'Brouillon', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  archived: { label: 'Archivé', bgColor: 'bg-gray-100', textColor: 'text-gray-500' },
};

// ============================================================================
// Confirm Modal
// ============================================================================

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmColor,
  icon,
  iconBgColor,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  confirmColor: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6'>
        <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${iconBgColor || 'bg-gray-100'}`}>
          {icon}
        </div>
        <h3 className='text-lg font-semibold text-gray-800 text-center mb-2'>{title}</h3>
        <div className='text-sm text-gray-500 text-center mb-6'>{message}</div>
        <div className='flex gap-3'>
          <button
            onClick={onCancel}
            className='flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors text-sm font-medium ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Profile Card
// ============================================================================

function ProfileCard({
  profile,
  onView,
  onEdit,
  onActivate,
  onArchive,
  onDelete,
  isCompareMode,
  isSelected,
  onToggleSelect,
}: {
  profile: NutritionalProfileSummary;
  onView: (profile: NutritionalProfileSummary) => void;
  onEdit: (profile: NutritionalProfileSummary) => void;
  onActivate: (profile: NutritionalProfileSummary) => void;
  onArchive: (profile: NutritionalProfileSummary) => void;
  onDelete: (profile: NutritionalProfileSummary) => void;
  isCompareMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const s = statusConfig[profile.status] || statusConfig.draft;
  const isArchived = profile.status === 'archived';
  const isDraft = profile.status === 'draft';

  const createdDate = new Date(profile.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const goalLabel = GOAL_ADJUSTMENTS[profile.goal]?.label ?? profile.goal;
  const formulaLabel = BMR_FORMULAS[profile.bmr_formula]?.label ?? profile.bmr_formula;

  return (
    <div
      onClick={() => (isCompareMode ? onToggleSelect(profile.id) : onView(profile))}
      className={`bg-white rounded-xl border p-5 transition-colors cursor-pointer ${
        isCompareMode && isSelected
          ? 'border-[#1B998B] ring-2 ring-[#1B998B]/20'
          : 'border-gray-200 hover:border-gray-300'
      } ${profile.status === 'active' ? 'border-l-4 border-l-emerald-500' : ''}`}
    >
      {/* Compare checkbox */}
      {isCompareMode && (
        <div className='flex items-center gap-2 mb-3'>
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
              isSelected
                ? 'border-[#1B998B] bg-[#1B998B]'
                : 'border-gray-300'
            }`}
          >
            {isSelected && <Check className='w-3 h-3 text-white' />}
          </div>
          <span className='text-xs text-gray-500'>Sélectionner pour comparaison</span>
        </div>
      )}

      {/* Header */}
      <div className='mb-3'>
        <div className='flex items-center gap-2 mb-1'>
          <h3 className='text-base font-semibold text-gray-800 truncate'>
            {profile.name}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.bgColor} ${s.textColor}`}>
            {s.label}
          </span>
          <span className='text-xs text-gray-400'>v{profile.version}</span>
        </div>
        <div className='flex items-center gap-3 text-xs text-gray-500'>
          <span className='flex items-center gap-1'>
            <Target className='w-3.5 h-3.5' />
            {goalLabel}
          </span>
          <span className='flex items-center gap-1'>
            <Flame className='w-3.5 h-3.5' />
            {profile.calculated_calories ? `${profile.calculated_calories} kcal` : '—'}
          </span>
          <span className='flex items-center gap-1'>
            <Calendar className='w-3.5 h-3.5' />
            {createdDate}
          </span>
        </div>
      </div>

      <p className='text-xs text-gray-400 mb-3'>Formule : {formulaLabel}</p>

      {/* Action buttons */}
      {!isCompareMode && (
        <div
          className='flex items-center gap-1.5 pt-3 border-t border-gray-100'
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onView(profile)}
            className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#1B998B] hover:bg-emerald-50 rounded-lg transition-colors'
          >
            <Eye className='w-3.5 h-3.5' />
            Voir
          </button>
          {!isArchived && (
            <button
              onClick={() => onEdit(profile)}
              className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <Edit3 className='w-3.5 h-3.5' />
              Modifier
            </button>
          )}
          {(isDraft || isArchived) && (
            <button
              onClick={() => onActivate(profile)}
              className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors'
            >
              <Play className='w-3.5 h-3.5' />
              {isArchived ? 'Réactiver' : 'Activer'}
            </button>
          )}
          <div className='flex items-center gap-1.5 ml-auto'>
            {!isArchived && (
              <button
                onClick={() => onArchive(profile)}
                className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <Archive className='w-3.5 h-3.5' />
                Archiver
              </button>
            )}
            <button
              onClick={() => onDelete(profile)}
              className='flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors'
            >
              <Trash2 className='w-3.5 h-3.5' />
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Filter Tabs
// ============================================================================

const FILTER_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'archived', label: 'Archivés' },
];

// ============================================================================
// Main Component
// ============================================================================

interface NutritionalProfileListProps {
  patientId: string;
  onCreate: () => void;
  onView: (profile: NutritionalProfileSummary) => void;
  onEdit: (profile: NutritionalProfileSummary) => void;
  onCompare: (idA: string, idB: string) => void;
}

export function NutritionalProfileList({
  patientId,
  onCreate,
  onView,
  onEdit,
  onCompare,
}: NutritionalProfileListProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activateTarget, setActivateTarget] = useState<NutritionalProfileSummary | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<NutritionalProfileSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NutritionalProfileSummary | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; title: string; message?: string }>({
    visible: false,
    type: 'success',
    title: '',
  });
  const hideToast = useCallback(() => setToast((t) => ({ ...t, visible: false })), []);
  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    setToast({ visible: true, type, title, message });
  }, []);

  const { data: profiles, isLoading, error } = useNutritionalProfiles(patientId);
  const activateMutation = useActivateProfile(patientId);
  const archiveMutation = useArchiveProfile(patientId);
  const deleteMutation = useDeleteProfile(patientId);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id]; // Replace oldest selection
      return [...prev, id];
    });
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedIds.length === 2) {
      onCompare(selectedIds[0], selectedIds[1]);
      setCompareMode(false);
      setSelectedIds([]);
    }
  }, [selectedIds, onCompare]);

  const toggleCompareMode = useCallback(() => {
    setCompareMode((prev) => !prev);
    setSelectedIds([]);
  }, []);

  function handleActivate(profile: NutritionalProfileSummary) {
    setActivateTarget(profile);
  }

  function confirmActivate() {
    if (!activateTarget) return;
    const name = activateTarget.name;
    activateMutation.mutate(activateTarget.id, {
      onSuccess: () => {
        showToast('success', 'Profil activé', `Le profil « ${name} » est maintenant actif.`);
      },
      onError: () => {
        showToast('error', 'Erreur', 'Impossible d\'activer le profil.');
      },
    });
    setActivateTarget(null);
  }

  function handleArchive(profile: NutritionalProfileSummary) {
    setArchiveTarget(profile);
  }

  function confirmArchive() {
    if (!archiveTarget) return;
    const name = archiveTarget.name;
    archiveMutation.mutate(archiveTarget.id, {
      onSuccess: () => {
        showToast('success', 'Profil archivé', `Le profil « ${name} » a été archivé.`);
      },
      onError: () => {
        showToast('error', 'Erreur', 'Impossible d\'archiver le profil.');
      },
    });
    setArchiveTarget(null);
  }

  function handleDelete(profile: NutritionalProfileSummary) {
    setDeleteTarget(profile);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast('success', 'Profil supprimé', `Le profil « ${name} » a été définitivement supprimé.`);
      },
      onError: () => {
        showToast('error', 'Erreur', 'Impossible de supprimer le profil.');
      },
    });
    setDeleteTarget(null);
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        <span className='ml-2 text-sm text-gray-500'>Chargement des profils nutritionnels...</span>
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

  const allProfiles = profiles || [];
  const filteredProfiles =
    statusFilter === 'all'
      ? allProfiles
      : allProfiles.filter((p) => p.status === statusFilter);

  const counts: Record<string, number> = {
    all: allProfiles.length,
    active: allProfiles.filter((p) => p.status === 'active').length,
    draft: allProfiles.filter((p) => p.status === 'draft').length,
    archived: allProfiles.filter((p) => p.status === 'archived').length,
  };

  return (
    <div className='space-y-4'>
      <Toast
        isVisible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />

      {/* Activate confirm modal */}
      {activateTarget && (
        <ConfirmModal
          title='Activer ce profil ?'
          message={
            <p>
              Le profil <span className='font-medium text-emerald-700'>&laquo; {activateTarget.name} &raquo;</span> sera{' '}
              <span className='font-medium text-emerald-700'>activé immédiatement</span>.
              Le patient pourra le consulter dès maintenant. Si un profil actif existe déjà, il sera automatiquement archivé.
            </p>
          }
          confirmLabel='Confirmer et activer'
          confirmColor='bg-[#1B998B] hover:bg-[#147569]'
          icon={<Play className='w-6 h-6 text-[#1B998B]' />}
          iconBgColor='bg-emerald-50'
          onConfirm={confirmActivate}
          onCancel={() => setActivateTarget(null)}
        />
      )}

      {/* Archive confirm modal */}
      {archiveTarget && (
        <ConfirmModal
          title='Archiver ce profil ?'
          message={
            <p>
              Le profil <span className='font-medium text-gray-700'>&laquo; {archiveTarget.name} &raquo;</span> sera
              archivé. Vous pourrez toujours le consulter mais ne pourrez plus le modifier.
            </p>
          }
          confirmLabel='Archiver'
          confirmColor='bg-gray-600 hover:bg-gray-700'
          icon={<Archive className='w-6 h-6 text-gray-600' />}
          onConfirm={confirmArchive}
          onCancel={() => setArchiveTarget(null)}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <ConfirmModal
          title='Supprimer définitivement ?'
          message={
            <p>
              Le profil <span className='font-medium text-gray-700'>&laquo; {deleteTarget.name} &raquo;</span> sera
              supprimé définitivement. Cette action est irréversible.
            </p>
          }
          confirmLabel='Supprimer'
          confirmColor='bg-red-600 hover:bg-red-700'
          icon={<AlertTriangle className='w-6 h-6 text-red-600' />}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-800'>Profils nutritionnels</h2>
        <div className='flex items-center gap-2'>
          {allProfiles.length >= 2 && (
            <button
              onClick={toggleCompareMode}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                compareMode
                  ? 'border-[#1B998B] bg-emerald-50 text-[#1B998B]'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <GitCompare className='w-4 h-4' />
              {compareMode ? 'Annuler' : 'Comparer'}
            </button>
          )}
          <button
            onClick={onCreate}
            className='flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium'
          >
            <Plus className='w-4 h-4' />
            Nouveau profil
          </button>
        </div>
      </div>

      {/* Compare bar */}
      {compareMode && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between'>
          <p className='text-sm text-blue-700'>
            Sélectionnez 2 profils à comparer ({selectedIds.length}/2)
          </p>
          <button
            onClick={handleCompare}
            disabled={selectedIds.length !== 2}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors'
          >
            <GitCompare className='w-4 h-4' />
            Comparer
          </button>
        </div>
      )}

      {/* Filter tabs */}
      {allProfiles.length > 0 && (
        <div className='flex gap-2'>
          {FILTER_TABS.map((tab) => (
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
      )}

      {/* Empty state */}
      {allProfiles.length === 0 && (
        <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Target className='w-8 h-8 text-gray-300' />
          </div>
          <p className='text-gray-800 font-medium mb-1'>Aucun profil nutritionnel</p>
          <p className='text-gray-500 text-sm mb-4'>
            Créez un premier profil nutritionnel pour ce patient.
          </p>
          <button
            onClick={onCreate}
            className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium'
          >
            <Plus className='w-4 h-4' />
            Créer un profil
          </button>
        </div>
      )}

      {/* Filtered empty state */}
      {allProfiles.length > 0 && filteredProfiles.length === 0 && (
        <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
          <p className='text-gray-500 text-sm'>Aucun profil dans cette catégorie.</p>
        </div>
      )}

      {/* Profile list */}
      {filteredProfiles.length > 0 && (
        <div className='space-y-3'>
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onView={onView}
              onEdit={onEdit}
              onActivate={handleActivate}
              onArchive={handleArchive}
              onDelete={handleDelete}
              isCompareMode={compareMode}
              isSelected={selectedIds.includes(profile.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
