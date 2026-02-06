'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { FoodItem } from '@/types/meals';

interface FoodSearchItemProps {
  food: FoodItem;
  onAdd: (food: FoodItem) => void;
}

export function FoodSearchItem({ food, onAdd }: FoodSearchItemProps) {
  return (
    <button
      onClick={() => onAdd(food)}
      className='w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left'
    >
      {/* Emoji */}
      <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
        <span className='text-xl'>{food.emoji}</span>
      </div>

      {/* Food info */}
      <div className='flex-1 min-w-0'>
        <p className='text-gray-800 font-medium truncate'>{food.name}</p>
        <p className='text-xs text-gray-500'>
          {food.caloriesPer100g} kcal • P: {food.proteinPer100g}g • G:{' '}
          {food.carbsPer100g}g • L: {food.fatPer100g}g
        </p>
      </div>

      {/* Add button */}
      <div className='flex-shrink-0 w-8 h-8 bg-[#1B998B]/10 rounded-full flex items-center justify-center'>
        <Plus className='w-4 h-4 text-[#1B998B]' />
      </div>
    </button>
  );
}

export default FoodSearchItem;
