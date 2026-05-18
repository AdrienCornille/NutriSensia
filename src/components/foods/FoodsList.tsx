'use client';

import React from 'react';
import { Heart, ArrowUp, ArrowDown, ArrowUpDown, Plus } from 'lucide-react';
import type { Food, SortOption } from '@/types/foods';

interface FoodsListProps {
  foods: Food[];
  favorites: string[];
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  emptyMessage?: string;
  emptyIcon?: string;
  onToggleFavorite: (foodId: string) => void;
  onFoodClick: (food: Food) => void;
  onAddToMeal?: (food: Food) => void;
}

type SortColumn = 'name' | 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber';

const COLUMN_SORTS: Record<SortColumn, { asc: SortOption; desc: SortOption }> =
  {
    name: { asc: 'name-asc', desc: 'name-desc' },
    calories: { asc: 'calories-asc', desc: 'calories-desc' },
    protein: { asc: 'protein-asc', desc: 'protein-desc' },
    carbs: { asc: 'carbs-asc', desc: 'carbs-desc' },
    fat: { asc: 'fat-asc', desc: 'fat-desc' },
    fiber: { asc: 'fiber-asc', desc: 'fiber-desc' },
  };

function SortableHeader({
  label,
  column,
  currentSort,
  onSort,
  align = 'right',
}: {
  label: string;
  column: SortColumn;
  currentSort: SortOption;
  onSort: (option: SortOption) => void;
  align?: 'left' | 'right';
}) {
  const sorts = COLUMN_SORTS[column];
  const isAsc = currentSort === sorts.asc;
  const isDesc = currentSort === sorts.desc;
  const isActive = isAsc || isDesc;

  const handleClick = () => {
    if (isAsc) onSort(sorts.desc);
    else onSort(sorts.asc);
  };

  return (
    <th
      className={`px-4 py-3 text-sm font-medium select-none cursor-pointer transition-colors hover:bg-gray-100 ${
        align === 'left' ? 'text-left' : 'text-right'
      } ${isActive ? 'text-[#1B998B]' : 'text-gray-500'}`}
      onClick={handleClick}
    >
      <span
        className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        {label}
        {isAsc ? (
          <ArrowUp className='w-3.5 h-3.5' />
        ) : isDesc ? (
          <ArrowDown className='w-3.5 h-3.5' />
        ) : (
          <ArrowUpDown className='w-3 h-3 text-gray-300' />
        )}
      </span>
    </th>
  );
}

export function FoodsList({
  foods,
  favorites,
  sortOption,
  onSortChange,
  emptyMessage = 'Aucun aliment trouvé',
  emptyIcon = '🔍',
  onToggleFavorite,
  onFoodClick,
  onAddToMeal,
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
    <div>
      <table className='w-full bg-white'>
        <thead className='bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-[0_1px_0_0_rgb(229,231,235)]'>
          <tr>
            <SortableHeader
              label='Aliment'
              column='name'
              currentSort={sortOption}
              onSort={onSortChange}
              align='left'
            />
            <SortableHeader
              label='Calories'
              column='calories'
              currentSort={sortOption}
              onSort={onSortChange}
            />
            <SortableHeader
              label='Protéines'
              column='protein'
              currentSort={sortOption}
              onSort={onSortChange}
            />
            <SortableHeader
              label='Glucides'
              column='carbs'
              currentSort={sortOption}
              onSort={onSortChange}
            />
            <SortableHeader
              label='Lipides'
              column='fat'
              currentSort={sortOption}
              onSort={onSortChange}
            />
            <SortableHeader
              label='Fibres'
              column='fiber'
              currentSort={sortOption}
              onSort={onSortChange}
            />
            <th className='px-4 py-3 text-center text-sm font-medium text-gray-500'>
              Favori
            </th>
            {onAddToMeal && (
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-500'>
                Repas
              </th>
            )}
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-100'>
          {foods.map(food => {
            const isFavorite = favorites.includes(food.id);
            return (
              <tr key={food.id} className='hover:bg-gray-50'>
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
                {onAddToMeal && (
                  <td className='px-4 py-3 text-center'>
                    <button
                      onClick={() => onAddToMeal(food)}
                      className='p-1.5 text-[#1B998B] hover:bg-[#1B998B]/10 rounded-lg transition-colors'
                      title='Ajouter à un repas'
                    >
                      <Plus className='w-5 h-5' />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FoodsList;
