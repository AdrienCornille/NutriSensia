'use client';

import React from 'react';
import type {
  AnamneseSection as AnamneseSectionType,
  AnamneseSectionId,
} from '@/types/dossier';

interface AnamneseSectionProps {
  section: AnamneseSectionType;
  isExpanded: boolean;
  onToggle: (sectionId: AnamneseSectionId) => void;
}

export function AnamneseSection({
  section,
  isExpanded,
  onToggle,
}: AnamneseSectionProps) {
  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <button
        onClick={() => onToggle(section.id)}
        className='w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-[#1B998B]/10 rounded-lg flex items-center justify-center'>
            <span className='text-xl'>{section.icon}</span>
          </div>
          <span className='font-medium text-gray-800'>{section.label}</span>
        </div>
        <span
          className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className='border-t border-gray-100 p-4 bg-gray-50'>
          <div className='space-y-3'>
            {section.fields.map((field, index) => (
              <div
                key={index}
                className='flex items-start justify-between p-3 bg-white rounded-lg'
              >
                <span className='text-sm text-gray-500'>{field.label}</span>
                <span className='text-sm font-medium text-gray-800 text-right max-w-md'>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnamneseSection;
