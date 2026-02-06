'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Scale, Check } from 'lucide-react';
import type { FoodItem, SelectedFood, StandardPortion } from '@/types/meals';
import { calculateNutrition } from '@/types/meals';

interface QuantitySelectorModalProps {
  isOpen: boolean;
  food: FoodItem | null;
  onClose: () => void;
  onConfirm: (selectedFood: SelectedFood) => void;
}

// Portions standards prédéfinies
const standardPortions: StandardPortion[] = [
  { label: '1 cuillère à café', grams: 5 },
  { label: '1 cuillère à soupe', grams: 15 },
  { label: '1 poignée', grams: 30 },
  { label: '1 portion (100g)', grams: 100 },
  { label: '1 bol', grams: 250 },
  { label: '1 assiette', grams: 300 },
];

// Quick quantity buttons
const quickQuantities = [50, 100, 150, 200];

export function QuantitySelectorModal({
  isOpen,
  food,
  onClose,
  onConfirm,
}: QuantitySelectorModalProps) {
  const [quantity, setQuantity] = useState(100);
  const [inputValue, setInputValue] = useState('100');

  // Reset state when modal opens with new food
  React.useEffect(() => {
    if (isOpen && food) {
      setQuantity(100);
      setInputValue('100');
    }
  }, [isOpen, food]);

  // Calculate nutrition based on current quantity
  const calculatedNutrition = useMemo(() => {
    if (!food) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return calculateNutrition(food, quantity, 'g');
  }, [food, quantity]);

  // Handle quantity input change
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 9999) {
      setQuantity(parsed);
    }
  }, []);

  // Handle input blur - ensure valid value
  const handleInputBlur = useCallback(() => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      setQuantity(1);
      setInputValue('1');
    } else if (parsed > 9999) {
      setQuantity(9999);
      setInputValue('9999');
    } else {
      setQuantity(parsed);
      setInputValue(parsed.toString());
    }
  }, [inputValue]);

  // Increment/decrement quantity
  const adjustQuantity = useCallback((delta: number) => {
    setQuantity(prev => {
      const newValue = Math.max(1, Math.min(9999, prev + delta));
      setInputValue(newValue.toString());
      return newValue;
    });
  }, []);

  // Select a standard portion
  const selectPortion = useCallback((grams: number) => {
    setQuantity(grams);
    setInputValue(grams.toString());
  }, []);

  // Handle confirm
  const handleConfirm = useCallback(() => {
    if (!food) return;

    const selectedFood: SelectedFood = {
      ...food,
      quantity,
      unit: 'g',
      calculatedNutrition,
    };

    onConfirm(selectedFood);
    onClose();
  }, [food, quantity, calculatedNutrition, onConfirm, onClose]);

  if (!food) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-[70] flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute inset-0 bg-black/70'
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className='relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden'
          >
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center'>
                  <span className='text-2xl'>{food.emoji || '🍽️'}</span>
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-gray-800 line-clamp-1'>
                    {food.name}
                  </h2>
                  {food.brand && (
                    <p className='text-sm text-gray-500'>{food.brand}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Content */}
            <div className='p-6'>
              {/* Quantity input */}
              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Quantité consommée
                </label>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => adjustQuantity(-10)}
                    className='w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors'
                  >
                    <Minus className='w-5 h-5 text-gray-600' />
                  </button>

                  <div className='flex-1 relative'>
                    <input
                      type='number'
                      value={inputValue}
                      onChange={e => handleInputChange(e.target.value)}
                      onBlur={handleInputBlur}
                      min={1}
                      max={9999}
                      className='w-full px-4 py-3 text-center text-2xl font-semibold text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent'
                    />
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium'>
                      g
                    </span>
                  </div>

                  <button
                    onClick={() => adjustQuantity(10)}
                    className='w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors'
                  >
                    <Plus className='w-5 h-5 text-gray-600' />
                  </button>
                </div>
              </div>

              {/* Quick quantities */}
              <div className='mb-6'>
                <p className='text-sm text-gray-500 mb-2'>Quantités rapides</p>
                <div className='flex gap-2'>
                  {quickQuantities.map(q => (
                    <button
                      key={q}
                      onClick={() => selectPortion(q)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        quantity === q
                          ? 'bg-[#1B998B] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {q}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Standard portions */}
              <div className='mb-6'>
                <p className='text-sm text-gray-500 mb-2'>Portions standards</p>
                <div className='grid grid-cols-2 gap-2'>
                  {standardPortions.map(portion => (
                    <button
                      key={portion.label}
                      onClick={() => selectPortion(portion.grams)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        quantity === portion.grams
                          ? 'bg-[#1B998B]/10 text-[#1B998B] border-2 border-[#1B998B]'
                          : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className='truncate'>{portion.label}</span>
                      <span className='text-xs text-gray-400 ml-1'>
                        {portion.grams}g
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nutrition preview */}
              <div className='bg-gradient-to-br from-[#1B998B]/5 to-[#1B998B]/10 rounded-xl p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <Scale className='w-4 h-4 text-[#1B998B]' />
                  <p className='text-sm font-medium text-gray-700'>
                    Valeurs nutritionnelles pour {quantity}g
                  </p>
                </div>

                {/* Calories - highlighted */}
                <div className='flex items-center justify-between mb-3 pb-3 border-b border-[#1B998B]/20'>
                  <span className='text-gray-600'>Calories</span>
                  <span className='text-xl font-bold text-[#1B998B]'>
                    {calculatedNutrition.calories} kcal
                  </span>
                </div>

                {/* Macros grid */}
                <div className='grid grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <p className='text-xs text-gray-500 mb-1'>Protéines</p>
                    <p className='font-semibold text-blue-600'>
                      {calculatedNutrition.protein}g
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-xs text-gray-500 mb-1'>Glucides</p>
                    <p className='font-semibold text-amber-600'>
                      {calculatedNutrition.carbs}g
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-xs text-gray-500 mb-1'>Lipides</p>
                    <p className='font-semibold text-rose-500'>
                      {calculatedNutrition.fat}g
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='px-6 py-4 border-t border-gray-200'>
              <div className='flex gap-3'>
                <button
                  onClick={onClose}
                  className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirm}
                  className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#147569] transition-colors flex items-center justify-center gap-2'
                >
                  <Check className='w-5 h-5' />
                  Ajouter
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default QuantitySelectorModal;
