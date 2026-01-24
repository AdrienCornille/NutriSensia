'use client';

import React from 'react';
import { Scale, Ruler, Smile, Activity, Droplets } from 'lucide-react';
import type { SuiviTab } from '@/types/suivi';

interface SuiviTabsProps {
  activeTab: SuiviTab;
  onTabChange: (tab: SuiviTab) => void;
}

const tabs: { id: SuiviTab; label: string; icon: React.ReactNode }[] = [
  { id: 'poids', label: 'Poids', icon: <Scale className="w-4 h-4" /> },
  { id: 'mensurations', label: 'Mensurations', icon: <Ruler className="w-4 h-4" /> },
  { id: 'bien-etre', label: 'Bien-être', icon: <Smile className="w-4 h-4" /> },
  { id: 'activite', label: 'Activité', icon: <Activity className="w-4 h-4" /> },
  { id: 'hydratation', label: 'Hydratation', icon: <Droplets className="w-4 h-4" /> },
];

export function SuiviTabs({ activeTab, onTabChange }: SuiviTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SuiviTabs;
