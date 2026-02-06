'use client';

import React from 'react';
import { Search } from 'lucide-react';
import type { Food } from '@/types/foods';
import { FoodCard } from './FoodCard';

interface FoodsGridProps {
  foods: Food[];
  favorites: string[];
  emptyMessage?: string;
  emptyIcon?: string;
  onToggleFavorite: (foodId: string) => void;
  onFoodClick: (food: Food) => void;
}

export function FoodsGrid({
  foods,
  favorites,
  emptyMessage = 'Aucun aliment trouvé',
  emptyIcon = '🔍',
  onToggleFavorite,
  onFoodClick,
}: FoodsGridProps) {
  if (foods.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 px-4'>
        <span className='text-5xl mb-4'>{emptyIcon}</span>
        <p className='text-gray-500 text-center'>{emptyMessage}</p>
        <p className='text-sm text-gray-400 mt-2 text-center'>
          Essayez avec d'autres termes ou scannez un code-barres
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4'>
      {foods.map(food => (
        <FoodCard
          key={food.id}
          food={food}
          isFavorite={favorites.includes(food.id)}
          onToggleFavorite={onToggleFavorite}
          onClick={onFoodClick}
        />
      ))}
    </div>
  );
}

export default FoodsGrid;
