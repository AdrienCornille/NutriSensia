'use client';

import React, { useState } from 'react';
import { Loader2, AlertCircle, Plus, FileText, Download } from 'lucide-react';
import {
  usePatientAnamnese,
  useCreateAnamnese,
  useUpsertAnamneseSection,
} from '@/hooks/useNutritionistDossier';
import { ExportDossierModal } from '../export/ExportDossierModal';
import { AnamneseSidebar, SIDEBAR_SECTION_IDS } from './AnamneseSidebar';
import { AnamneseSectionPanel } from './AnamneseSectionPanel';
import { ANAMNESE_SECTION_FIELDS } from './anamnese-fields-config';
import type { AnamneseSection, AnamneseSectionId } from '@/types/dossier';

interface NutritionistAnamneseViewProps {
  patientId: string;
  patientFirstName?: string;
  patientLastName?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientConsultationReason?: string;
}

// Display order of the 10 sections — drives the upsert `display_order` field.
// Mirrors SIDEBAR_SECTION_IDS exported by AnamneseSidebar.
const SECTION_DISPLAY_ORDER: AnamneseSectionId[] = [
  'identite',
  'morphologie',
  'historique',
  'sante',
  'sante_bilan',
  'habitudes',
  'consommation',
  'lifestyle',
  'motivation',
  'psycho_comportemental',
];

const SECTION_LABELS: Record<AnamneseSectionId, string> = {
  identite: 'Identité & Coordonnées',
  morphologie: 'Données morphologiques',
  historique: 'Historique pondéral',
  sante: 'Antécédents & Traitements',
  sante_bilan: 'Bilan digestif & biologique',
  habitudes: 'Habitudes alimentaires',
  consommation: 'Consommation & Boissons',
  lifestyle: 'Mode de vie',
  motivation: 'Motivation & Objectifs',
  psycho_comportemental: 'Psycho-comportemental',
};

const SECTION_ICONS: Record<AnamneseSectionId, string> = {
  identite: '👤',
  morphologie: '📏',
  historique: '📊',
  sante: '🏥',
  sante_bilan: '🩺',
  habitudes: '🍽️',
  consommation: '🥤',
  lifestyle: '🏃',
  motivation: '🎯',
  psycho_comportemental: '🧠',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function NutritionistAnamneseView({
  patientId,
  patientFirstName,
  patientLastName,
  patientEmail,
  patientPhone,
}: NutritionistAnamneseViewProps) {
  const [activeSectionId, setActiveSectionId] =
    useState<AnamneseSectionId>('identite');
  const [showExportModal, setShowExportModal] = useState(false);

  const {
    data: anamneseData,
    isLoading,
    error,
  } = usePatientAnamnese(patientId, false);
  const createAnamnese = useCreateAnamnese(patientId);
  const upsertSection = useUpsertAnamneseSection(patientId);

  async function handleCreate() {
    try {
      await createAnamnese.mutateAsync({});
    } catch {
      // handled by React Query
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2
          className='w-6 h-6 animate-spin'
          style={{ color: 'var(--ns-peps-deep)' }}
        />
        <span className='ml-2 text-sm' style={{ color: 'var(--ns-ink-3)' }}>
          Chargement de l&apos;anamnèse…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='fp-card text-center'>
        <AlertCircle
          className='w-8 h-8 mx-auto mb-3'
          style={{ color: 'var(--ns-coral)' }}
        />
        <p
          className='font-serif text-lg mb-1'
          style={{ color: 'var(--ns-ink)' }}
        >
          Erreur de chargement
        </p>
        <p className='text-sm' style={{ color: 'var(--ns-ink-3)' }}>
          {error.message}
        </p>
      </div>
    );
  }

  const current = anamneseData?.current;

  // Empty state — anamnèse not yet created
  if (!current) {
    return (
      <div className='fp-card text-center' style={{ padding: '48px 32px' }}>
        <div
          className='w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'
          style={{ background: 'var(--ns-cream-200)' }}
        >
          <FileText className='w-8 h-8' style={{ color: 'var(--ns-ink-4)' }} />
        </div>
        <p
          className='font-serif text-xl mb-1'
          style={{ color: 'var(--ns-ink)' }}
        >
          Aucune anamnèse créée
        </p>
        <p className='text-sm mb-5' style={{ color: 'var(--ns-ink-3)' }}>
          Créez l&apos;anamnèse pour ce patient — vous pourrez ensuite remplir
          chaque champ directement au clic.
        </p>
        <button
          type='button'
          onClick={handleCreate}
          disabled={createAnamnese.isPending}
          className='fp-btn fp-btn-peps'
        >
          {createAnamnese.isPending ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Plus className='w-4 h-4' />
          )}
          Créer l&apos;anamnèse
        </button>
      </div>
    );
  }

  // The hook returns sections with `id: string`; we cast to AnamneseSection at
  // the boundary since the API always emits one of the known section ids.
  const savedSections = (current.sections ?? undefined) as
    | AnamneseSection[]
    | undefined;
  const activeSavedSection =
    savedSections?.find(s => s.id === activeSectionId) ?? null;

  // Pre-fill helper for the `identite` section — seeds patient profile data
  // (keyed by cfg.key, matching the DB column names) when the section is
  // empty.
  function patientProfilePrefill(
    cfgByLabel: Map<string, { key: string }>
  ): Record<string, string> {
    const out: Record<string, string> = {};
    const setIfPresent = (label: string, value?: string) => {
      if (!value) return;
      const cfg = cfgByLabel.get(label);
      if (cfg) out[cfg.key] = value;
    };
    setIfPresent('Prénom', patientFirstName);
    setIfPresent('Nom', patientLastName);
    setIfPresent('Adresse e-mail', patientEmail);
    setIfPresent('Téléphone', patientPhone);
    return out;
  }

  async function handleUpdateField(
    sectionId: AnamneseSectionId,
    fieldLabel: string,
    newValue: string
  ) {
    const existingSection = savedSections?.find(s => s.id === sectionId);
    const displayOrder = SECTION_DISPLAY_ORDER.indexOf(sectionId);
    const configs = ANAMNESE_SECTION_FIELDS[sectionId] ?? [];
    const cfgByLabel = new Map(configs.map(c => [c.label, c]));

    // ── Build `field_data` keyed by cfg.key (snake_case DB column name).
    // The server's `convertToTableData` looks up each entry by key in the
    // section's config; sending labels (the display "Chirurgie bariatrique")
    // makes the upsert target non-existent columns. We also preserve the
    // existing field values (and their "(note)" siblings) so the upsert
    // doesn't nuke unrelated columns of the section row.
    const fieldData: Record<string, string> = {};

    if (sectionId === 'identite' && !existingSection) {
      Object.assign(fieldData, patientProfilePrefill(cfgByLabel));
    }

    for (const field of existingSection?.fields ?? []) {
      if (!field.value || field.value.trim().length === 0) continue;
      // Notes: "Field label (note)" → DB column `field_key_note`.
      const noteMatch = field.label.match(/^(.+) \(note\)$/);
      if (noteMatch) {
        const baseCfg = cfgByLabel.get(noteMatch[1]);
        if (baseCfg) fieldData[`${baseCfg.key}_note`] = field.value;
        continue;
      }
      const cfg = cfgByLabel.get(field.label);
      if (cfg) fieldData[cfg.key] = field.value;
    }

    // Apply the new value. Important: when the field is cleared we still
    // send the key with an empty string instead of removing it from the
    // payload — otherwise the BE upsert doesn't touch the column and the
    // previous value sticks around. The server converts "" to NULL via
    // `convertValue` in `anamnese-table-mapping.ts`.
    const updatedCfg = cfgByLabel.get(fieldLabel);
    if (!updatedCfg) {
      // eslint-disable-next-line no-console
      console.warn(
        `[anamnese] Unknown field label "${fieldLabel}" in section ${sectionId}`
      );
      return;
    }
    fieldData[updatedCfg.key] = newValue.trim();

    await upsertSection.mutateAsync({
      anamneseId: current!.id,
      section_id: sectionId,
      section_label: SECTION_LABELS[sectionId],
      section_icon: existingSection?.icon || SECTION_ICONS[sectionId],
      field_data: fieldData,
      display_order: displayOrder >= 0 ? displayOrder : 0,
    });
  }

  return (
    <div className='space-y-4'>
      {/* ─── Pane intro ─── */}
      <section className='fp-pane-intro'>
        <div>
          <h2 className='fp-pane-intro-title'>
            Anamnèse <em>du patient</em>
          </h2>
          <div className='fp-pane-intro-meta'>
            <span>
              Créée le <b>{formatDate(current.created_at)}</b>
            </span>
            {current.updated_at !== current.created_at && (
              <>
                <span className='dot' />
                <span>
                  Modifiée le <b>{formatDate(current.updated_at)}</b>
                </span>
              </>
            )}
            <span className='dot' />
            <span>
              <b>{SIDEBAR_SECTION_IDS.length}</b> sections · clic sur un champ
              pour l&apos;éditer
            </span>
          </div>
        </div>
        <div className='fp-pane-intro-actions'>
          <button
            type='button'
            className='fp-btn'
            onClick={() => setShowExportModal(true)}
          >
            <Download className='w-3.5 h-3.5' />
            Exporter
          </button>
        </div>
      </section>

      {/* ─── Sidebar + section panel ─── */}
      <div className='fp-anam-layout'>
        <AnamneseSidebar
          sections={savedSections}
          activeSectionId={activeSectionId}
          onSelectSection={setActiveSectionId}
        />
        <div className='fp-anam-main'>
          <AnamneseSectionPanel
            section={activeSavedSection}
            sectionId={activeSectionId}
            onUpdateField={handleUpdateField}
            isSaving={upsertSection.isPending}
          />
        </div>
      </div>

      {/* ─── Export modal ─── */}
      {showExportModal && (
        <ExportDossierModal
          patientId={patientId}
          patientName={
            patientFirstName && patientLastName
              ? `${patientFirstName} ${patientLastName}`
              : 'patient'
          }
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
