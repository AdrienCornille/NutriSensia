'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { MealContext, MealContextConfig } from '@/types/meals';

interface MealContextTagsProps {
  selectedTags: MealContext[];
  onToggle: (tag: MealContext) => void;
  contextConfigs: MealContextConfig[];
}

export function MealContextTags({
  selectedTags,
  onToggle,
  contextConfigs,
}: MealContextTagsProps) {
  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h2 className='font-semibold text-gray-800 mb-4'>Contexte (optionnel)</h2>
      <div className='grid grid-cols-3 gap-3'>
        {contextConfigs.map(context => (
          <ContextTagButton
            key={context.id}
            context={context}
            isSelected={selectedTags.includes(context.id)}
            onToggle={() => onToggle(context.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Individual Context Tag Button
interface ContextTagButtonProps {
  context: MealContextConfig;
  isSelected: boolean;
  onToggle: () => void;
}

function ContextTagButton({
  context,
  isSelected,
  onToggle,
}: ContextTagButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`
        p-3 rounded-lg border transition-all text-center
        ${
          isSelected
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className='text-xl' role='img' aria-hidden='true'>
        {context.icon}
      </span>
      <p className='text-sm text-gray-700 mt-1'>{context.label}</p>
    </motion.button>
  );
}

export default MealContextTags;
