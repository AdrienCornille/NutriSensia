'use client';

import React from 'react';
import { Check, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import type { ShoppingList } from '@/types/recipes';
import { getShoppingListProgress } from '@/types/recipes';

interface ShoppingListViewProps {
  shoppingList: ShoppingList;
  onToggleItem: (categoryIndex: number, itemId: string) => void;
  onAddItem?: (category: string) => void;
}

export function ShoppingListView({
  shoppingList,
  onToggleItem,
}: ShoppingListViewProps) {
  const progress = getShoppingListProgress(shoppingList);

  if (shoppingList.categories.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 px-4'>
        <ShoppingBag className='w-16 h-16 text-gray-300 mb-4' />
        <h3 className='text-lg font-medium text-gray-700 mb-2'>
          Liste de courses vide
        </h3>
        <p className='text-gray-500 text-center text-sm'>
          Ajoutez des ingrédients depuis les recettes pour commencer votre liste
        </p>
      </div>
    );
  }

  return (
    <div className='p-4'>
      {/* Header */}
      <div className='bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 mb-4 text-white'>
        <div className='flex items-center justify-between mb-3'>
          <div>
            <h3 className='font-semibold text-lg'>Ma liste de courses</h3>
            <p className='text-white/80 text-sm'>{shoppingList.weekRange}</p>
          </div>
          <div className='text-right'>
            <p className='text-2xl font-bold'>{progress.percentage}%</p>
            <p className='text-white/80 text-sm'>complété</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className='h-2 bg-white/20 rounded-full overflow-hidden'>
          <div
            className='h-full bg-white rounded-full transition-all duration-300'
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className='text-white/80 text-xs mt-2'>
          {progress.checked} sur {progress.total} articles cochés
        </p>
      </div>

      {/* Categories */}
      {shoppingList.categories.map((category, categoryIndex) => (
        <div key={category.category} className='mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <h4 className='font-semibold text-gray-900'>{category.category}</h4>
            <span className='text-sm text-gray-500'>
              {category.items.filter(i => i.checked).length}/
              {category.items.length}
            </span>
          </div>

          <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
            {category.items.map((item, itemIndex) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 ${
                  itemIndex !== category.items.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => onToggleItem(categoryIndex, item.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.checked
                      ? 'bg-[#1B998B] border-[#1B998B]'
                      : 'border-gray-300 hover:border-[#1B998B]'
                  }`}
                >
                  {item.checked && <Check className='w-4 h-4 text-white' />}
                </button>

                {/* Item info */}
                <div className='flex-1 min-w-0'>
                  <p
                    className={`text-sm ${
                      item.checked
                        ? 'text-gray-400 line-through'
                        : 'text-gray-900'
                    }`}
                  >
                    {item.name}
                  </p>
                </div>

                {/* Quantity */}
                <span
                  className={`text-sm ${
                    item.checked ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add Item Button */}
      <button className='w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-[#1B998B] hover:text-[#1B998B] transition-colors flex items-center justify-center gap-2'>
        <Plus className='w-5 h-5' />
        Ajouter un article
      </button>
    </div>
  );
}

export default ShoppingListView;
