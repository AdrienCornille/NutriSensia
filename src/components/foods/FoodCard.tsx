'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import type { Food } from '@/types/foods';

interface FoodCardProps {
  food: Food;
  isFavorite: boolean;
  onToggleFavorite: (foodId: string) => void;
  onClick: (food: Food) => void;
}

export function FoodCard({
  food,
  isFavorite,
  onToggleFavorite,
  onClick,
}: FoodCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(food.id);
  };

  return (
    <div
      onClick={() => onClick(food)}
      className='bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group'
    >
      <div className='flex items-start justify-between mb-3'>
        <div className='w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center'>
          <span className='text-2xl'>{food.image}</span>
        </div>
        <button
          onClick={handleFavoriteClick}
          className={`p-1 rounded-full transition-colors ${
            isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <h3 className='font-medium text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2'>
        {food.name}
      </h3>
      {food.brand && (
        <p className='text-xs text-gray-500 mt-0.5'>{food.brand}</p>
      )}
      <p className='text-xs text-gray-400 mt-1'>pour {food.per}</p>

      <div className='mt-3 grid grid-cols-2 gap-2'>
        <div className='bg-gray-50 rounded-lg p-2 text-center'>
          <p className='text-sm font-bold text-gray-800'>{food.calories}</p>
          <p className='text-xs text-gray-500'>kcal</p>
        </div>
        <div className='bg-blue-50 rounded-lg p-2 text-center'>
          <p className='text-sm font-bold text-blue-600'>{food.protein}g</p>
          <p className='text-xs text-gray-500'>prot.</p>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
