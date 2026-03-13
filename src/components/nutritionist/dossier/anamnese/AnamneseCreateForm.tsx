'use client';

import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { AnamneseSectionForm } from './AnamneseSectionForm';
import { ANAMNESE_SECTION_FIELDS } from './anamnese-fields-config';
import type { AnamneseSectionId } from '@/types/dossier';

interface AnamneseCreateFormProps {
  anamneseId: string;
  patientId: string;
  patientFirstName?: string;
  patientLastName?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientConsultationReason?: string;
  existingSections?: {
    section_id: string;
    fields: { label: string; value: string }[];
  }[];
  onSaveSection: (data: {
    section_id: string;
    section_label: string;
    section_icon: string;
    field_data: Record<string, string>;
    display_order: number;
  }) => Promise<void>;
  onUpdateStatus: (status: string) => Promise<void>;
  onClose: () => void;
  isSaving?: boolean;
  currentStatus: string;
}

// Mapping from DB consultation_reason IDs to anamnese multiselect labels
const CONSULTATION_REASON_ID_TO_LABEL: Record<string, string> = {
  menopause_perimenopause: 'Ménopause / Périménopause',
  perte_poids_durable: 'Perte de poids durable',
  troubles_digestifs: 'Troubles digestifs',
  glycemie_diabete: 'Glycémie / Diabète',
  sante_cardiovasculaire: 'Santé cardiovasculaire',
  fatigue_energie: 'Fatigue / Énergie',
  longevite_vieillissement: 'Longévité / Anti-âge',
  sante_hormonale: 'Santé hormonale',
  alimentation_saine: 'Alimentation saine',
};

const defaultSections: {
  id: AnamneseSectionId;
  label: string;
  icon: string;
}[] = [
  { id: 'identite', label: 'Identité & Coordonnées', icon: '👤' },
  { id: 'morphologie', label: 'Données morphologiques', icon: '📏' },
  { id: 'historique', label: 'Historique pondéral', icon: '📊' },
  { id: 'sante', label: 'Antécédents & Traitements', icon: '🏥' },
  { id: 'sante_bilan', label: 'Bilan digestif & biologique', icon: '🩺' },
  { id: 'habitudes', label: 'Habitudes alimentaires', icon: '🍽️' },
  { id: 'consommation', label: 'Consommation & Boissons', icon: '🥤' },
  { id: 'lifestyle', label: 'Mode de vie', icon: '🏃' },
  { id: 'motivation', label: 'Motivation & Objectifs', icon: '🎯' },
  { id: 'psycho_comportemental', label: 'Psycho-comportemental', icon: '🧠' },
];

export function AnamneseCreateForm({
  onSaveSection,
  onUpdateStatus,
  onClose,
  currentStatus,
  existingSections,
  patientFirstName,
  patientLastName,
  patientEmail,
  patientPhone,
  patientConsultationReason,
}: AnamneseCreateFormProps) {
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  function getExistingFields(sectionId: string) {
    const section = existingSections?.find(s => s.section_id === sectionId);
    const fields = section?.fields || [];

    // Pre-fill identite section with patient profile data
    if (sectionId === 'identite') {
      const defaults: Record<string, string> = {};
      if (patientFirstName) defaults['Prénom'] = patientFirstName;
      if (patientLastName) defaults['Nom'] = patientLastName;
      if (patientEmail) defaults['Adresse e-mail'] = patientEmail;
      if (patientPhone) defaults['Téléphone'] = patientPhone;
      if (patientConsultationReason) {
        const reasonLabel =
          CONSULTATION_REASON_ID_TO_LABEL[patientConsultationReason] ||
          patientConsultationReason;
        defaults['Raison de la consultation'] = reasonLabel;
      }

      const existingLabels = new Set(fields.map(f => f.label));
      const extraFields = Object.entries(defaults)
        .filter(([label]) => !existingLabels.has(label))
        .map(([label, value]) => ({ label, value }));

      return [...extraFields, ...fields];
    }

    return fields;
  }

  async function handleSaveSection(
    sectionId: AnamneseSectionId,
    sectionLabel: string,
    sectionIcon: string,
    displayOrder: number,
    fieldData: Record<string, string>
  ) {
    setSavingSection(sectionId);
    try {
      await onSaveSection({
        section_id: sectionId,
        section_label: sectionLabel,
        section_icon: sectionIcon,
        field_data: fieldData,
        display_order: displayOrder,
      });
    } finally {
      setSavingSection(null);
    }
  }

  async function handleComplete() {
    setStatusUpdating(true);
    try {
      await onUpdateStatus('completed');
      onClose();
    } finally {
      setStatusUpdating(false);
    }
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-start justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-800'>
              Édition de l&apos;anamnèse
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              Remplissez les sections ci-dessous. Chaque section est sauvegardée
              individuellement.
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-gray-700 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* Section forms */}
      {defaultSections.map((section, index) => (
        <AnamneseSectionForm
          key={section.id}
          sectionId={section.id}
          sectionLabel={section.label}
          sectionIcon={section.icon}
          initialFields={getExistingFields(section.id)}
          predefinedFields={ANAMNESE_SECTION_FIELDS[section.id]}
          displayOrder={index}
          onSave={fieldData =>
            handleSaveSection(
              section.id,
              section.label,
              section.icon,
              index,
              fieldData
            )
          }
          isSaving={savingSection === section.id}
          isExpanded={expandedSectionId === section.id}
          onToggle={() =>
            setExpandedSectionId(
              expandedSectionId === section.id ? null : section.id
            )
          }
        />
      ))}

      {/* Actions */}
      <div className='bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between'>
        <button
          onClick={onClose}
          className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
        >
          Retour à la lecture
        </button>
        {currentStatus !== 'completed' && (
          <button
            onClick={handleComplete}
            disabled={statusUpdating}
            className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
          >
            {statusUpdating && <Loader2 className='w-4 h-4 animate-spin' />}
            Marquer comme complétée
          </button>
        )}
      </div>
    </div>
  );
}
