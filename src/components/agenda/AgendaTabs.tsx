'use client';

import React from 'react';
import type { AgendaTab } from '@/types/agenda';
import { agendaTabsConfig } from '@/types/agenda';

interface AgendaTabsProps {
  activeTab: AgendaTab;
  onTabChange: (tab: AgendaTab) => void;
}

export function AgendaTabs({ activeTab, onTabChange }: AgendaTabsProps) {
  return (
    <div className='bg-white border-b border-gray-200 px-8 py-4'>
      <div className='flex gap-1 bg-gray-100 p-1 rounded-xl w-fit'>
        {agendaTabsConfig.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AgendaTabs;
