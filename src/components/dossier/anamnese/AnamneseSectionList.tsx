'use client';

import React from 'react';
import { AnamneseSection } from './AnamneseSection';
import type { AnamneseSection as AnamneseSectionType, AnamneseSectionId } from '@/types/dossier';

interface AnamneseSectionListProps {
  sections: AnamneseSectionType[];
  expandedSection: AnamneseSectionId | null;
  onToggleSection: (sectionId: AnamneseSectionId) => void;
}

export function AnamneseSectionList({
  sections,
  expandedSection,
  onToggleSection,
}: AnamneseSectionListProps) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <AnamneseSection
          key={section.id}
          section={section}
          isExpanded={expandedSection === section.id}
          onToggle={onToggleSection}
        />
      ))}
    </div>
  );
}

export default AnamneseSectionList;
