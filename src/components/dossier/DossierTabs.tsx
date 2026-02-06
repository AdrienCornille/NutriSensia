'use client';

import React from 'react';
import {
  ClipboardList,
  FileText,
  FolderOpen,
  Calendar,
  Target,
} from 'lucide-react';
import type { DossierTab } from '@/types/dossier';

interface DossierTabsProps {
  activeTab: DossierTab;
  onTabChange: (tab: DossierTab) => void;
}

const tabs: { id: DossierTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'anamnese',
    label: 'Anamnèse',
    icon: <ClipboardList className='w-4 h-4' />,
  },
  {
    id: 'questionnaires',
    label: 'Questionnaires',
    icon: <FileText className='w-4 h-4' />,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: <FolderOpen className='w-4 h-4' />,
  },
  {
    id: 'consultations',
    label: 'Consultations',
    icon: <Calendar className='w-4 h-4' />,
  },
  { id: 'objectifs', label: 'Objectifs', icon: <Target className='w-4 h-4' /> },
];

export function DossierTabs({ activeTab, onTabChange }: DossierTabsProps) {
  return (
    <div className='bg-white border-b border-gray-200 px-4 py-4'>
      <div className='flex gap-1 bg-gray-100 p-1 rounded-xl'>
        {tabs.map(tab => {
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

export default DossierTabs;
