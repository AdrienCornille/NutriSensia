'use client';

import React from 'react';
import type { AnamneseSection, AnamneseSectionId } from '@/types/dossier';
import { ANAMNESE_SECTION_LABELS } from '@/types/dossier';
import { ANAMNESE_SECTION_FIELDS } from './anamnese-fields-config';

// Default ordering of sections — drives the sidebar list and the SECTION_DISPLAY_ORDER
// constant in NutritionistAnamneseView (kept in sync there).
const SIDEBAR_SECTIONS: {
  id: AnamneseSectionId;
  shortLabel: string;
}[] = [
  { id: 'identite', shortLabel: 'Identité & Coordonnées' },
  { id: 'morphologie', shortLabel: 'Données morphologiques' },
  { id: 'historique', shortLabel: 'Historique pondéral' },
  { id: 'sante', shortLabel: 'Antécédents & Traitements' },
  { id: 'sante_bilan', shortLabel: 'Bilan digestif & biologique' },
  { id: 'habitudes', shortLabel: 'Habitudes alimentaires' },
  { id: 'consommation', shortLabel: 'Consommation & Boissons' },
  { id: 'lifestyle', shortLabel: 'Mode de vie' },
  { id: 'motivation', shortLabel: 'Motivation & Objectifs' },
  { id: 'psycho_comportemental', shortLabel: 'Psycho-comportemental' },
];

type SectionStatus = 'good' | 'todo' | 'empty';

interface AnamneseSidebarProps {
  sections: AnamneseSection[] | undefined;
  activeSectionId: AnamneseSectionId;
  onSelectSection: (id: AnamneseSectionId) => void;
}

// Count only fields that map to a real config entry (not the "(note)"
// siblings emitted by `convertFromTableData` for fields with `hasNotes`,
// nor any unknown labels) AND whose `dependsOn` condition is currently
// satisfied. Without the dependsOn filter a hidden field (e.g.
// "Événements déclencheurs" when "Effet yo-yo = Non") stays in the
// denominator forever, capping the count at N-1 even when every reachable
// field is filled.
function countFilledFields(
  sectionId: AnamneseSectionId,
  savedSection: AnamneseSection | undefined
): { filled: number; total: number } {
  const configs = ANAMNESE_SECTION_FIELDS[sectionId] ?? [];
  const valuesByLabel = new Map<string, string>();
  for (const f of savedSection?.fields ?? []) {
    valuesByLabel.set(f.label, f.value ?? '');
  }
  const visibleConfigs = configs.filter(cfg => {
    if (!cfg.dependsOn) return true;
    // Resolve the dependency by either the dependent field's `key` (if
    // listed as such) or its display `label` — the saved data is keyed by
    // label, but configs reference dependencies by key.
    const depCfg = configs.find(c => c.key === cfg.dependsOn!.field);
    const depLabel = depCfg ? depCfg.label : cfg.dependsOn.field;
    const depValue = valuesByLabel.get(depLabel);
    return depValue === cfg.dependsOn.value;
  });
  const total = visibleConfigs.length;
  const expectedLabels = new Set(visibleConfigs.map(c => c.label));
  const filled = (savedSection?.fields ?? []).filter(
    f => expectedLabels.has(f.label) && f.value && f.value.trim().length > 0
  ).length;
  return { filled: Math.min(filled, total), total };
}

function computeSectionStatus(
  sectionId: AnamneseSectionId,
  savedSection: AnamneseSection | undefined
): SectionStatus {
  const { filled, total } = countFilledFields(sectionId, savedSection);
  // Section with no expected fields (defensive — shouldn't happen with the
  // current config) is rendered as "good" so it doesn't flag a non-issue.
  if (total === 0) return 'good';
  if (filled === 0) return 'empty';
  if (filled >= total) return 'good';
  return 'todo';
}

function computeOverallProgress(
  sections: AnamneseSection[] | undefined
): number {
  if (!sections || sections.length === 0) return 0;
  let totalExpected = 0;
  let totalFilled = 0;
  for (const sectionDef of SIDEBAR_SECTIONS) {
    const saved = sections.find(s => s.id === sectionDef.id);
    const { filled, total } = countFilledFields(sectionDef.id, saved);
    totalExpected += total;
    totalFilled += filled;
  }
  if (totalExpected === 0) return 0;
  // Clamp to [0, 100] as a final safety: any future divergence between
  // expected/filled (e.g. duplicate labels in the DB) won't produce
  // nonsensical "165% rempli" values.
  const pct = Math.round((totalFilled / totalExpected) * 100);
  return Math.max(0, Math.min(100, pct));
}

export function AnamneseSidebar({
  sections,
  activeSectionId,
  onSelectSection,
}: AnamneseSidebarProps) {
  const overallProgress = computeOverallProgress(sections);

  return (
    <aside className='fp-anam-side'>
      <div className='fp-anam-side-head'>
        <span className='fp-anam-side-eyebrow'>Sections</span>
        <span className='fp-anam-progress'>
          <b>{overallProgress}</b>% rempli
        </span>
      </div>

      <ul className='fp-anam-side-list' role='tablist'>
        {SIDEBAR_SECTIONS.map((sectionDef, index) => {
          const saved = sections?.find(s => s.id === sectionDef.id);
          const status = computeSectionStatus(sectionDef.id, saved);
          const { filled, total } = countFilledFields(sectionDef.id, saved);
          const isActive = sectionDef.id === activeSectionId;
          const statusClass = `is-${status}`;
          const fullLabel =
            ANAMNESE_SECTION_LABELS[sectionDef.id] || sectionDef.shortLabel;
          const ariaStatusLabel =
            status === 'good'
              ? `complète, ${filled} sur ${total} champs`
              : status === 'empty'
                ? `vide, aucun champ rempli sur ${total}`
                : `incomplète, ${filled} sur ${total} champs`;

          return (
            <li key={sectionDef.id}>
              <button
                type='button'
                role='tab'
                aria-selected={isActive}
                aria-current={isActive ? 'true' : undefined}
                className={`fp-anam-side-item ${isActive ? 'is-active' : ''}`}
                onClick={() => onSelectSection(sectionDef.id)}
              >
                <span className='fp-anam-side-item-num'>{index + 1}</span>
                <span className='fp-anam-side-item-label' title={fullLabel}>
                  {sectionDef.shortLabel}
                </span>
                <span
                  className={`fp-anam-side-item-count ${statusClass}`}
                  aria-hidden='true'
                >
                  {filled}/{total}
                </span>
                <span
                  className={`fp-anam-side-item-status ${statusClass}`}
                  aria-label={ariaStatusLabel}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export const SIDEBAR_SECTION_IDS = SIDEBAR_SECTIONS.map(s => s.id);
