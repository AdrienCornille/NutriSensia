'use client';

import React, { useState } from 'react';
import { Check, ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import {
  useShoppingList,
  useToggleShoppingItem,
  useDeleteShoppingItem,
  useClearShoppingList,
} from '@/hooks/useShoppingList';

export function ShoppingListView() {
  const { data, isLoading } = useShoppingList();
  const toggleItem = useToggleShoppingItem();
  const deleteItem = useDeleteShoppingItem();
  const clearList = useClearShoppingList();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <div className='w-8 h-8 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  const categories = data?.categories || [];
  const progress = data?.progress || { total: 0, checked: 0, percentage: 0 };

  if (categories.length === 0 || progress.total === 0) {
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
            {data?.list?.name && data.list.name !== 'Ma liste de courses' && (
              <p className='text-white/80 text-sm'>{data.list.name}</p>
            )}
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
      {categories
        .filter(category => (category.items || []).length > 0)
        .map(category => {
          const items = category.items || [];
          const checkedCount = items.filter(i => i.is_checked).length;

          return (
            <div key={category.id} className='mb-4'>
              <div className='flex items-center justify-between mb-2'>
                <h4 className='font-semibold text-gray-900'>
                  {category.icon && (
                    <span className='mr-1'>{category.icon}</span>
                  )}
                  {category.name}
                </h4>
                <span className='text-sm text-gray-500'>
                  {checkedCount}/{items.length}
                </span>
              </div>

              <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
                {items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 ${
                      itemIndex !== items.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() =>
                        toggleItem.mutate({
                          itemId: item.id,
                          isChecked: !item.is_checked,
                        })
                      }
                      disabled={toggleItem.isPending}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        item.is_checked
                          ? 'bg-[#1B998B] border-[#1B998B]'
                          : 'border-gray-300 hover:border-[#1B998B]'
                      }`}
                    >
                      {item.is_checked && (
                        <Check className='w-4 h-4 text-white' />
                      )}
                    </button>

                    {/* Item info */}
                    <div className='flex-1 min-w-0'>
                      <p
                        className={`text-sm ${
                          item.is_checked
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
                        item.is_checked ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {item.quantity}
                    </span>

                    {/* Delete */}
                    <button
                      onClick={() => deleteItem.mutate(item.id)}
                      className='p-1 text-gray-300 hover:text-red-500 transition-colors'
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {/* Clear list button */}
      <button
        onClick={() => setShowClearConfirm(true)}
        className='w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-red-300 hover:text-red-500 transition-colors flex items-center justify-center gap-2 mt-2'
      >
        <Trash2 className='w-4 h-4' />
        Vider la liste
      </button>

      {/* Clear confirmation */}
      {showClearConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Vider la liste ?
            </h3>
            <p className='text-sm text-gray-600 mb-6'>
              Tous les articles seront supprimés de votre liste de courses.
            </p>
            <div className='flex items-center gap-3 justify-end'>
              <button
                onClick={() => setShowClearConfirm(false)}
                className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg'
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  clearList.mutate();
                  setShowClearConfirm(false);
                }}
                disabled={clearList.isPending}
                className='px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1'
              >
                {clearList.isPending && (
                  <Loader2 className='w-3 h-3 animate-spin' />
                )}
                Vider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingListView;
