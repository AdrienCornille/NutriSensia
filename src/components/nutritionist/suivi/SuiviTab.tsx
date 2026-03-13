'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Scale,
  Ruler,
  Heart,
  Activity,
  Droplets,
  UtensilsCrossed,
} from 'lucide-react';
import { SuiviSynthese } from './SuiviSynthese';
import { WeightSection } from './WeightSection';
import { MeasurementsSection } from './MeasurementsSection';
import { WellbeingSection } from './WellbeingSection';
import { ActivitySection } from './ActivitySection';
import { HydrationSection } from './HydrationSection';
import { MealsReviewSection } from './MealsReviewSection';
import type { NutritionistSuiviTab } from '@/types/nutritionist-suivi';

interface SuiviTabProps {
  patientId: string;
  patientName: string;
}

const suiviSubTabs: {
  id: NutritionistSuiviTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'synthese', label: 'Synthèse', icon: LayoutDashboard },
  { id: 'poids', label: 'Poids', icon: Scale },
  { id: 'mensurations', label: 'Mensurations', icon: Ruler },
  { id: 'bien-etre', label: 'Bien-être', icon: Heart },
  { id: 'activite', label: 'Activité', icon: Activity },
  { id: 'hydratation', label: 'Hydratation', icon: Droplets },
  { id: 'repas', label: 'Repas', icon: UtensilsCrossed },
];

export function SuiviTab({ patientId }: SuiviTabProps) {
  const [activeSubTab, setActiveSubTab] =
    useState<NutritionistSuiviTab>('synthese');

  return (
    <div className='space-y-6'>
      {/* Sub-tab navigation */}
      <div className='flex gap-1 bg-gray-100 p-1 rounded-xl'>
        {suiviSubTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center flex-1 justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className='w-4 h-4' />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      <div>
        {activeSubTab === 'synthese' && <SuiviSynthese patientId={patientId} />}
        {activeSubTab === 'poids' && <WeightSection patientId={patientId} />}
        {activeSubTab === 'mensurations' && (
          <MeasurementsSection patientId={patientId} />
        )}
        {activeSubTab === 'bien-etre' && (
          <WellbeingSection patientId={patientId} />
        )}
        {activeSubTab === 'activite' && (
          <ActivitySection patientId={patientId} />
        )}
        {activeSubTab === 'hydratation' && (
          <HydrationSection patientId={patientId} />
        )}
        {activeSubTab === 'repas' && (
          <MealsReviewSection patientId={patientId} />
        )}
      </div>
    </div>
  );
}
