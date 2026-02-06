'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type {
  FoodItem,
  PortionUnit,
  NutritionValues,
  StandardPortion,
} from '@/types/meals';
import { calculateNutrition } from '@/types/meals';

interface PortionModalProps {
  food: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, unit: PortionUnit) => void;
  standardPortions?: StandardPortion[];
  initialQuantity?: number;
  initialUnit?: PortionUnit;
}

const defaultStandardPortions: StandardPortion[] = [
  { label: '1 portion', grams: 150 },
  { label: '1/2 portion', grams: 75 },
  { label: '1 poignée', grams: 30 },
  { label: '1 c. à soupe', grams: 15 },
];

export function PortionModal({
  food,
  isOpen,
  onClose,
  onConfirm,
  standardPortions = defaultStandardPortions,
  initialQuantity = 150,
  initialUnit = 'g',
}: PortionModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [unit, setUnit] = useState<PortionUnit>(initialUnit);
  const [nutrition, setNutrition] = useState<NutritionValues>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  // Reset state when modal opens with new food
  useEffect(() => {
    if (isOpen && food) {
      setQuantity(initialQuantity);
      setUnit(initialUnit);
    }
  }, [isOpen, food, initialQuantity, initialUnit]);

  // Calculate nutrition whenever quantity or unit changes
  useEffect(() => {
    if (food) {
      const calculated = calculateNutrition(food, quantity, unit);
      setNutrition(calculated);
    }
  }, [food, quantity, unit]);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 0) {
        setQuantity(value);
      }
    },
    []
  );

  const handleUnitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setUnit(e.target.value as PortionUnit);
    },
    []
  );

  const handlePortionSelect = useCallback((grams: number) => {
    setQuantity(grams);
    setUnit('g');
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(quantity, unit);
    onClose();
  }, [quantity, unit, onConfirm, onClose]);

  if (!food) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className='bg-white rounded-2xl max-w-md w-full p-6'
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                {food.emoji && (
                  <span className='text-2xl' role='img' aria-hidden='true'>
                    {food.emoji}
                  </span>
                )}
                <h3 className='text-lg font-semibold text-gray-800'>
                  {food.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className='p-2 hover:bg-gray-100 rounded-lg text-gray-400'
                aria-label='Fermer'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Quantity input */}
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Quantité
              </label>
              <div className='flex gap-3'>
                <input
                  type='number'
                  value={quantity}
                  onChange={handleQuantityChange}
                  min={0}
                  className='flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-medium'
                />
                <select
                  value={unit}
                  onChange={handleUnitChange}
                  className='px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white'
                >
                  <option value='g'>grammes</option>
                  <option value='ml'>ml</option>
                  <option value='portion'>unité(s)</option>
                </select>
              </div>
            </div>

            {/* Standard portions */}
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Portions standards
              </label>
              <div className='grid grid-cols-2 gap-2'>
                {standardPortions.map(portion => (
                  <button
                    key={portion.label}
                    onClick={() => handlePortionSelect(portion.grams)}
                    className={`p-3 border rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left ${
                      quantity === portion.grams && unit === 'g'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <p className='font-medium text-gray-800'>{portion.label}</p>
                    <p className='text-sm text-gray-500'>{portion.grams}g</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition preview */}
            <div className='bg-gray-50 rounded-lg p-4 mb-6'>
              <p className='text-sm text-gray-500 mb-2'>
                Pour {quantity}
                {unit === 'g' ? 'g' : unit === 'ml' ? 'ml' : ' unité(s)'}
              </p>
              <div className='grid grid-cols-4 gap-2 text-center'>
                <div>
                  <p className='text-lg font-bold text-gray-800'>
                    {nutrition.calories}
                  </p>
                  <p className='text-xs text-gray-500'>kcal</p>
                </div>
                <div>
                  <p className='text-lg font-bold text-blue-600'>
                    {nutrition.protein}g
                  </p>
                  <p className='text-xs text-gray-500'>Prot.</p>
                </div>
                <div>
                  <p className='text-lg font-bold text-amber-600'>
                    {nutrition.carbs}g
                  </p>
                  <p className='text-xs text-gray-500'>Gluc.</p>
                </div>
                <div>
                  <p className='text-lg font-bold text-rose-600'>
                    {nutrition.fat}g
                  </p>
                  <p className='text-xs text-gray-500'>Lip.</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex gap-3'>
              <button
                onClick={onClose}
                className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className='flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors'
              >
                Ajouter
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PortionModal;
