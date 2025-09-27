/**
 * Page de test pour vérifier le tooltip amélioré
 * À supprimer après validation
 */

'use client';

import React from 'react';
import { TourDebug } from '@/components/onboarding/tours/TourDebug';

export default function TestTooltipPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold p-4">Test du tooltip amélioré</h1>
      <TourDebug />
    </div>
  );
}
