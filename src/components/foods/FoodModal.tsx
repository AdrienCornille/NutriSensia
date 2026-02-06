'use client';

import React from 'react';
import { X, Heart, Plus } from 'lucide-react';
import type { Food } from '@/types/foods';
import { calculateNutrition } from '@/types/foods';

interface FoodModalProps {
  isOpen: boolean;
  food: Food | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (foodId: string) => void;
}

export function FoodModal({
  isOpen,
  food,
  isFavorite,
  onClose,
  onToggleFavorite,
}: FoodModalProps) {
  if (!isOpen || !food) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='p-6 border-b border-gray-100'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center'>
                <span className='text-4xl'>{food.image}</span>
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-800'>{food.name}</h2>
                {food.brand && (
                  <p className='text-sm text-gray-500'>{food.brand}</p>
                )}
                <p className='text-sm text-gray-400 mt-1'>pour {food.per}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg text-gray-400'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-16rem)]'>
          {/* Macros */}
          <div className='grid grid-cols-4 gap-3 mb-6'>
            <div className='bg-gray-50 rounded-xl p-3 text-center'>
              <p className='text-2xl font-bold text-gray-800'>
                {food.calories}
              </p>
              <p className='text-xs text-gray-500'>kcal</p>
            </div>
            <div className='bg-blue-50 rounded-xl p-3 text-center'>
              <p className='text-2xl font-bold text-blue-600'>
                {food.protein}g
              </p>
              <p className='text-xs text-gray-500'>Protéines</p>
            </div>
            <div className='bg-amber-50 rounded-xl p-3 text-center'>
              <p className='text-2xl font-bold text-amber-600'>{food.carbs}g</p>
              <p className='text-xs text-gray-500'>Glucides</p>
            </div>
            <div className='bg-rose-50 rounded-xl p-3 text-center'>
              <p className='text-2xl font-bold text-rose-600'>{food.fat}g</p>
              <p className='text-xs text-gray-500'>Lipides</p>
            </div>
          </div>

          {/* Additional info */}
          <div className='bg-gray-50 rounded-xl p-4 mb-6'>
            <div className='flex justify-between py-2 border-b border-gray-200'>
              <span className='text-gray-600'>Fibres</span>
              <span className='font-medium text-gray-800'>{food.fiber}g</span>
            </div>
            {food.micronutrients && (
              <>
                {food.micronutrients.sodium !== undefined && (
                  <div className='flex justify-between py-2 border-b border-gray-200'>
                    <span className='text-gray-600'>Sodium</span>
                    <span className='font-medium text-gray-800'>
                      {food.micronutrients.sodium}mg
                    </span>
                  </div>
                )}
                {food.micronutrients.potassium !== undefined && (
                  <div className='flex justify-between py-2 border-b border-gray-200'>
                    <span className='text-gray-600'>Potassium</span>
                    <span className='font-medium text-gray-800'>
                      {food.micronutrients.potassium}mg
                    </span>
                  </div>
                )}
                {food.micronutrients.calcium !== undefined && (
                  <div className='flex justify-between py-2 border-b border-gray-200'>
                    <span className='text-gray-600'>Calcium</span>
                    <span className='font-medium text-gray-800'>
                      {food.micronutrients.calcium}mg
                    </span>
                  </div>
                )}
                {food.micronutrients.iron !== undefined && (
                  <div className='flex justify-between py-2 border-b border-gray-200'>
                    <span className='text-gray-600'>Fer</span>
                    <span className='font-medium text-gray-800'>
                      {food.micronutrients.iron}mg
                    </span>
                  </div>
                )}
                {food.micronutrients.magnesium !== undefined && (
                  <div className='flex justify-between py-2 border-b border-gray-200'>
                    <span className='text-gray-600'>Magnésium</span>
                    <span className='font-medium text-gray-800'>
                      {food.micronutrients.magnesium}mg
                    </span>
                  </div>
                )}
                {food.micronutrients.zinc !== undefined && (
                  <div className='flex justify-between py-2 border-b border-gray-200'>
                    <span className='text-gray-600'>Zinc</span>
                    <span className='font-medium text-gray-800'>
                      {food.micronutrients.zinc}mg
                    </span>
                  </div>
                )}
                {food.micronutrients.vitaminC !== undefined && (
                  <div className='flex justify-between py-2 border-b border-gray-200'>
                    <span className='text-gray-600'>Vitamine C</span>
                    <span className='font-medium text-gray-800'>
                      {food.micronutrients.vitaminC}mg
                    </span>
                  </div>
                )}
                {food.micronutrients.vitaminD !== undefined && (
                  <div className='flex justify-between py-2 border-b border-gray-200'>
                    <span className='text-gray-600'>Vitamine D</span>
                    <span className='font-medium text-gray-800'>
                      {food.micronutrients.vitaminD}mcg
                    </span>
                  </div>
                )}
                {food.micronutrients.vitaminB6 !== undefined && (
                  <div className='flex justify-between py-2 border-b border-gray-200'>
                    <span className='text-gray-600'>Vitamine B6</span>
                    <span className='font-medium text-gray-800'>
                      {food.micronutrients.vitaminB6}mg
                    </span>
                  </div>
                )}
                {food.micronutrients.vitaminB12 !== undefined && (
                  <div className='flex justify-between py-2'>
                    <span className='text-gray-600'>Vitamine B12</span>
                    <span className='font-medium text-gray-800'>
                      {food.micronutrients.vitaminB12}mcg
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Standard portions */}
          <div>
            <h3 className='font-semibold text-gray-800 mb-3'>
              Portions standards
            </h3>
            <div className='space-y-2'>
              {food.portions.map((portion, index) => {
                const nutrition = calculateNutrition(food, portion.grams);
                return (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors'
                  >
                    <div>
                      <p className='font-medium text-gray-800'>
                        {portion.label}
                      </p>
                      <p className='text-sm text-gray-500'>{portion.grams}g</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium text-gray-800'>
                        {nutrition.calories} kcal
                      </p>
                      <p className='text-xs text-gray-500'>
                        P: {nutrition.protein}g • G: {nutrition.carbs}g • L:{' '}
                        {nutrition.fat}g
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='p-6 border-t border-gray-100 flex gap-3'>
          <button
            onClick={() => onToggleFavorite(food.id)}
            className={`px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              isFavorite
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
          </button>
          <button className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors flex items-center justify-center gap-2'>
            <Plus className='w-5 h-5' />
            Ajouter à mon repas
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodModal;
