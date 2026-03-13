'use client';

import React, { useState } from 'react';
import {
  Loader2,
  AlertCircle,
  Plus,
  Clock,
  FileText,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  usePatientAnamnese,
  useCreateAnamnese,
  useUpsertAnamneseSection,
  useUpdateAnamneseStatus,
  useAnamneseVersion,
  useDeleteAnamnese,
} from '@/hooks/useNutritionistDossier';
import { AnamneseSectionList } from '@/components/dossier';
import { AnamneseCreateForm } from './AnamneseCreateForm';
import { ChangeReportsList } from '../change-reports/ChangeReportsList';
import type { AnamneseSectionId } from '@/types/dossier';

interface NutritionistAnamneseViewProps {
  patientId: string;
  patientFirstName?: string;
  patientLastName?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientConsultationReason?: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const statusLabels: Record<string, { label: string; color: string }> = {
  completed: { label: 'Complétée', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Brouillon', color: 'bg-amber-100 text-amber-700' },
  pending: { label: 'En attente', color: 'bg-blue-100 text-blue-700' },
  archived: { label: 'Archivée', color: 'bg-gray-100 text-gray-600' },
};

export function NutritionistAnamneseView({
  patientId,
  patientFirstName,
  patientLastName,
  patientEmail,
  patientPhone,
  patientConsultationReason,
}: NutritionistAnamneseViewProps) {
  const [expandedSection, setExpandedSection] =
    useState<AnamneseSectionId | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const {
    data: anamneseData,
    isLoading,
    error,
  } = usePatientAnamnese(patientId, true);

  const {
    data: editingVersionData,
    isLoading: isLoadingVersion,
  } = useAnamneseVersion(patientId, editingVersionId);

  const createAnamnese = useCreateAnamnese(patientId);
  const upsertSection = useUpsertAnamneseSection(patientId);
  const updateStatus = useUpdateAnamneseStatus(patientId);
  const deleteAnamnese = useDeleteAnamnese(patientId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        <span className='ml-2 text-sm text-gray-500'>
          Chargement de l&apos;anamnèse...
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

  const current = anamneseData?.current;
  const history = anamneseData?.history;

  // Handle create
  async function handleCreate() {
    try {
      await createAnamnese.mutateAsync({});
    } catch {
      // error handled by React Query
    }
  }

  async function handleNewVersion() {
    try {
      await createAnamnese.mutateAsync({
        prefill_from_version: current?.version,
      });
      setEditMode(true);
    } catch {
      // error handled by React Query
    }
  }

  // No anamnesis yet
  if (!current) {
    return (
      <div className='space-y-4'>
        <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <FileText className='w-8 h-8 text-gray-300' />
          </div>
          <p className='text-gray-800 font-medium mb-1'>
            Aucune anamnèse créée
          </p>
          <p className='text-sm text-gray-500 mb-4'>
            Créez la première anamnèse pour ce patient.
          </p>
          <button
            onClick={handleCreate}
            disabled={createAnamnese.isPending}
            className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
          >
            {createAnamnese.isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Plus className='w-4 h-4' />
            )}
            Créer une anamnèse
          </button>
        </div>
      </div>
    );
  }

  // Edit mode (current version)
  if (editMode && current) {
    return (
      <AnamneseCreateForm
        anamneseId={current.id}
        patientId={patientId}
        currentStatus={current.status}
        patientFirstName={patientFirstName}
        patientLastName={patientLastName}
        patientEmail={patientEmail}
        patientPhone={patientPhone}
        patientConsultationReason={patientConsultationReason}
        existingSections={current.sections?.map(s => ({
          section_id: s.id,
          fields: s.fields,
        }))}
        onSaveSection={async sectionData => {
          await upsertSection.mutateAsync({
            anamneseId: current.id,
            ...sectionData,
          });
        }}
        onUpdateStatus={async status => {
          await updateStatus.mutateAsync({
            anamneseId: current.id,
            status,
          });
        }}
        onClose={() => setEditMode(false)}
        isSaving={upsertSection.isPending}
      />
    );
  }

  // Edit mode (historical version)
  if (editingVersionId) {
    if (isLoadingVersion) {
      return (
        <div className='flex items-center justify-center py-16'>
          <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
          <span className='ml-2 text-sm text-gray-500'>
            Chargement de la version...
          </span>
        </div>
      );
    }

    if (editingVersionData) {
      return (
        <AnamneseCreateForm
          anamneseId={editingVersionId}
          patientId={patientId}
          currentStatus={editingVersionData.status}
          patientFirstName={patientFirstName}
          patientLastName={patientLastName}
          patientEmail={patientEmail}
          patientPhone={patientPhone}
          patientConsultationReason={patientConsultationReason}
          existingSections={editingVersionData.sections?.map(s => ({
            section_id: s.id,
            fields: s.fields,
          }))}
          onSaveSection={async sectionData => {
            await upsertSection.mutateAsync({
              anamneseId: editingVersionId,
              ...sectionData,
            });
          }}
          onUpdateStatus={async status => {
            await updateStatus.mutateAsync({
              anamneseId: editingVersionId,
              status,
            });
          }}
          onClose={() => setEditingVersionId(null)}
          isSaving={upsertSection.isPending}
        />
      );
    }
  }

  const statusInfo = statusLabels[current.status] || statusLabels.pending;

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-3 mb-1'>
              <h3 className='text-lg font-semibold text-gray-800'>
                Anamnèse v{current.version}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>
            <p className='text-sm text-gray-500'>
              Créée le {formatDate(current.created_at)}
              {current.updated_at !== current.created_at && (
                <> &middot; Modifiée le {formatDate(current.updated_at)}</>
              )}
            </p>
          </div>
          <div className='flex gap-2'>
            <button
              onClick={() => setEditMode(true)}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#1B998B] bg-[#1B998B]/10 rounded-lg hover:bg-[#1B998B]/20 transition-colors'
            >
              <Pencil className='w-3.5 h-3.5' />
              Éditer
            </button>
            <button
              onClick={handleNewVersion}
              disabled={createAnamnese.isPending}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50'
            >
              {createAnamnese.isPending ? (
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
              ) : (
                <Plus className='w-3.5 h-3.5' />
              )}
              Nouvelle version
            </button>
          </div>
        </div>
      </div>

      {/* Sections */}
      {current.sections && current.sections.length > 0 ? (
        <AnamneseSectionList
          sections={current.sections}
          expandedSection={expandedSection}
          onToggleSection={sectionId =>
            setExpandedSection(expandedSection === sectionId ? null : sectionId)
          }
        />
      ) : (
        <div className='bg-white rounded-xl border border-gray-200 p-6 text-center'>
          <p className='text-sm text-gray-500'>
            Aucune section renseignée.{' '}
            <button
              onClick={() => setEditMode(true)}
              className='text-[#1B998B] hover:underline font-medium'
            >
              Commencer à remplir
            </button>
          </p>
        </div>
      )}

      {/* Version History */}
      {history && history.length > 1 && (
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <h4 className='text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2'>
            <Clock className='w-4 h-4 text-gray-400' />
            Historique des versions
          </h4>
          <div className='space-y-2'>
            {history.map(v => {
              const vStatus = statusLabels[v.status] || statusLabels.pending;
              return (
                <div
                  key={v.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    v.is_current
                      ? 'bg-[#1B998B]/5 border border-[#1B998B]/20'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <span className='text-sm font-medium text-gray-800'>
                      Version {v.version}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${vStatus.color}`}
                    >
                      {vStatus.label}
                    </span>
                    {v.is_current && (
                      <span className='px-1.5 py-0.5 rounded text-xs font-medium bg-[#1B998B]/10 text-[#1B998B]'>
                        Actuelle
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-500'>
                      {formatDate(v.created_at)}
                    </span>
                    {!v.is_current && (
                      <>
                        <button
                          onClick={() => setEditingVersionId(v.id)}
                          className='p-1.5 text-gray-400 hover:text-[#1B998B] hover:bg-[#1B998B]/10 rounded-md transition-colors'
                          title={`Éditer la version ${v.version}`}
                        >
                          <Pencil className='w-3.5 h-3.5' />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(v.id)}
                          className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'
                          title={`Supprimer la version ${v.version}`}
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='absolute inset-0 bg-black/40'
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className='relative bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4'>
            <h4 className='text-base font-semibold text-gray-800 mb-2'>
              Supprimer cette version ?
            </h4>
            <p className='text-sm text-gray-500 mb-5'>
              La version{' '}
              {history?.find(v => v.id === confirmDeleteId)?.version} sera
              définitivement supprimée avec toutes ses données. Cette action est
              irréversible.
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteAnamnese.mutateAsync(confirmDeleteId);
                    setConfirmDeleteId(null);
                  } catch {
                    // error handled by React Query
                  }
                }}
                disabled={deleteAnamnese.isPending}
                className='inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
              >
                {deleteAnamnese.isPending && (
                  <Loader2 className='w-4 h-4 animate-spin' />
                )}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Reports (DOSSIER-004) */}
      <ChangeReportsList patientId={patientId} />
    </div>
  );
}
