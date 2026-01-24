'use client';

import React from 'react';
import { ObjectiveCard } from './ObjectiveCard';
import type { Objective } from '@/types/dossier';

interface ObjectivesListProps {
  objectives: Objective[];
}

export function ObjectivesList({ objectives }: ObjectivesListProps) {
  return (
    <div className="space-y-4">
      {objectives.map((objective) => (
        <ObjectiveCard key={objective.id} objective={objective} />
      ))}
    </div>
  );
}

export default ObjectivesList;
