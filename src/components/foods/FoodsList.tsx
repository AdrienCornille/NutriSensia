'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import type { Food } from '@/types/foods';

interface FoodsListProps {
  foods: Food[];
  favorites: string[];
  emptyMessage?: string;
  emptyIcon?: string;
  onToggleFavorite: (foodId: string) => void;
  onFoodClick: (food: Food) => void;
}

export function FoodsList({
  foods,
  favorites,
  emptyMessage = 'Aucun aliment trouvé',
  emptyIcon = '🔍',
  onToggleFavorite,
  onFoodClick,
}: FoodsListProps) {
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

  const handleFavoriteClick = (foodId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(foodId);
  };

  return (
    <div className='p-4'>
      {/* Table */}
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                Aliment
              </th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-500'>
                Calories
              </th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-500'>
                Protéines
              </th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-500'>
                Glucides
              </th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-500'>
                Lipides
              </th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-500'>
                Fibres
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-500'>
                Favori
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {foods.map(food => {
              const isFavorite = favorites.includes(food.id);
              return (
                <tr
                  key={food.id}
                  onClick={() => onFoodClick(food)}
                  className='hover:bg-gray-50 cursor-pointer'
                >
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-3'>
                      <span className='text-xl'>{food.image}</span>
                      <div>
                        <p className='font-medium text-gray-800'>{food.name}</p>
                        <p className='text-xs text-gray-500'>
                          {food.brand ? `${food.brand} • ` : ''}pour {food.per}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-right font-medium text-gray-800'>
                    {food.calories}
                  </td>
                  <td className='px-4 py-3 text-right text-blue-600'>
                    {food.protein}g
                  </td>
                  <td className='px-4 py-3 text-right text-amber-600'>
                    {food.carbs}g
                  </td>
                  <td className='px-4 py-3 text-right text-rose-600'>
                    {food.fat}g
                  </td>
                  <td className='px-4 py-3 text-right text-gray-500'>
                    {food.fiber}g
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <button onClick={e => handleFavoriteClick(food.id, e)}>
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite
                            ? 'text-red-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FoodsList;
