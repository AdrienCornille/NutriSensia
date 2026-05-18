'use client';

import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import type { Food } from '@/types/foods';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Petit-déjeuner', emoji: '🌅' },
  { id: 'lunch', label: 'Déjeuner', emoji: '☀️' },
  { id: 'dinner', label: 'Dîner', emoji: '🌙' },
  { id: 'snack', label: 'Collation', emoji: '🍎' },
];

interface AddFoodToMealModalProps {
  isOpen: boolean;
  food: Food | null;
  onClose: () => void;
  onConfirm: (
    foodId: string,
    mealType: string,
    quantity: number,
    unit: string
  ) => Promise<void>;
  isSubmitting: boolean;
}

export function AddFoodToMealModal({
  isOpen,
  food,
  onClose,
  onConfirm,
  isSubmitting,
}: AddFoodToMealModalProps) {
  const [mealType, setMealType] = useState('lunch');
  const [quantity, setQuantity] = useState(100);

  if (!isOpen || !food) return null;

  // Compute nutrition for selected quantity
  const factor = quantity / 100;
  const cal = Math.round(food.calories * factor);
  const prot = Math.round(food.protein * factor * 10) / 10;
  const carbs = Math.round(food.carbs * factor * 10) / 10;
  const fat = Math.round(food.fat * factor * 10) / 10;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-xl max-w-sm w-full mx-4 shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-5 pb-3'>
          <h3 className='text-base font-semibold text-gray-800 flex items-center gap-2'>
            <Plus className='w-5 h-5 text-[#1B998B]' />
            Ajouter à un repas
          </h3>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-full'
          >
            <X className='w-4 h-4 text-gray-400' />
          </button>
        </div>

        {/* Food name */}
        <p className='text-sm text-gray-600 px-5 mb-4 line-clamp-2'>
          {food.name}
        </p>

        <div className='px-5 space-y-4'>
          {/* Meal type */}
          <div>
            <label className='text-sm font-medium text-gray-700 mb-2 block'>
              Type de repas
            </label>
            <div className='grid grid-cols-4 gap-2'>
              {MEAL_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setMealType(type.id)}
                  className={`p-2 rounded-lg text-center transition-colors ${
                    mealType === type.id
                      ? 'bg-[#1B998B]/10 border-2 border-[#1B998B] text-[#1B998B]'
                      : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className='text-lg block'>{type.emoji}</span>
                  <span className='text-[10px] font-medium mt-0.5 block'>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className='text-sm font-medium text-gray-700 mb-2 block'>
              Quantité (g)
            </label>
            <input
              type='number'
              value={quantity}
              onChange={e =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              min={1}
              max={5000}
              className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
            />
          </div>

          {/* Nutrition preview */}
          <div className='bg-gray-50 rounded-lg p-3'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-500'>Pour {quantity}g :</span>
              <span className='font-semibold text-gray-800'>{cal} kcal</span>
            </div>
            <div className='flex items-center gap-4 text-xs text-gray-500 mt-1'>
              <span className='text-blue-600'>P: {prot}g</span>
              <span className='text-amber-600'>G: {carbs}g</span>
              <span className='text-rose-600'>L: {fat}g</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-3 p-5 pt-4'>
          <button
            onClick={onClose}
            className='flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(food.id, mealType, quantity, 'g')}
            disabled={isSubmitting}
            className='flex-1 py-2.5 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#1B998B]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
          >
            {isSubmitting ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Plus className='w-4 h-4' />
            )}
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
