'use client';

import React from 'react';

interface MealNotesProps {
  notes: string;
  onChange: (notes: string) => void;
  placeholder?: string;
}

export function MealNotes({
  notes,
  onChange,
  placeholder = 'Contexte du repas, ressenti, observations...',
}: MealNotesProps) {
  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h2 className='font-semibold text-gray-800 mb-4'>Notes (optionnel)</h2>
      <textarea
        value={notes}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className='w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none h-24'
      />
    </div>
  );
}

export default MealNotes;
