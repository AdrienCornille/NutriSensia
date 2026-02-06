'use client';

import React from 'react';
import {
  Home,
  Briefcase,
  UtensilsCrossed,
  Users,
  UserPlus,
  User,
  MessageSquare,
} from 'lucide-react';
import type { MealContext, MealContextConfig } from '@/types/meals';

interface NotesAndContextSectionProps {
  notes: string;
  contextTags: MealContext[];
  onNotesChange: (notes: string) => void;
  onToggleTag: (tag: MealContext) => void;
}

// Configuration des tags de contexte
const contextConfigs: MealContextConfig[] = [
  { id: 'home', label: 'Maison', icon: '🏠' },
  { id: 'work', label: 'Travail', icon: '💼' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'family', label: 'Famille', icon: '👨‍👩‍👧‍👦' },
  { id: 'friends', label: 'Amis', icon: '👥' },
  { id: 'alone', label: 'Seul(e)', icon: '🧘' },
];

export function NotesAndContextSection({
  notes,
  contextTags,
  onNotesChange,
  onToggleTag,
}: NotesAndContextSectionProps) {
  return (
    <div className='space-y-4'>
      {/* Context tags */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Contexte du repas
          <span className='text-gray-400 font-normal ml-1'>(optionnel)</span>
        </label>
        <div className='flex flex-wrap gap-2'>
          {contextConfigs.map(config => {
            const isSelected = contextTags.includes(config.id);
            return (
              <button
                key={config.id}
                type='button'
                onClick={() => onToggleTag(config.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[#1B998B] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes textarea */}
      <div>
        <label
          htmlFor='meal-notes'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Notes
          <span className='text-gray-400 font-normal ml-1'>(optionnel)</span>
        </label>
        <div className='relative'>
          <MessageSquare className='absolute left-3 top-3 w-4 h-4 text-gray-400' />
          <textarea
            id='meal-notes'
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder='Ex: Repas rapide entre deux réunions, très satisfaisant...'
            rows={3}
            maxLength={500}
            className='w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent text-sm'
          />
        </div>
        <p className='text-xs text-gray-400 mt-1 text-right'>
          {notes.length}/500 caractères
        </p>
      </div>
    </div>
  );
}

// Export des configs pour utilisation externe
export { contextConfigs };

export default NotesAndContextSection;
