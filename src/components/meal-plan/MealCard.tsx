'use client';

import React, { useState } from 'react';
import { ChevronDown, Lightbulb, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  PlanMeal,
  PlanMealType,
  PlanFood,
  FoodAlternative,
} from '@/types/meal-plan';
import { calculateMealTotal, formatCalorieDifference } from '@/types/meal-plan';

interface MealCardProps {
  meal: PlanMeal;
  isExpanded: boolean;
  onToggleExpand: (mealId: PlanMealType) => void;
}

/**
 * Composant pour afficher un aliment avec ses alternatives
 */
function FoodItem({ food }: { food: PlanFood }) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const hasAlternatives = food.alternatives && food.alternatives.length > 0;

  return (
    <div className='bg-white rounded-lg overflow-hidden'>
      {/* Aliment principal */}
      <div className='flex items-center justify-between p-3'>
        <div className='flex-1'>
          <p className='font-medium text-gray-800'>{food.name}</p>
          <p className='text-sm text-gray-500'>{food.quantity}</p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='text-right'>
            <p className='font-medium text-gray-700'>{food.calories} kcal</p>
            <p className='text-xs text-gray-400'>
              P: {food.protein}g • G: {food.carbs}g • L: {food.fat}g
            </p>
          </div>
          {hasAlternatives && (
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className={`p-2 rounded-lg transition-colors ${
                showAlternatives
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-[#1B998B]/10 hover:text-[#1B998B]'
              }`}
              title='Voir les alternatives'
            >
              <ArrowLeftRight className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>

      {/* Section alternatives */}
      <AnimatePresence>
        {showAlternatives && hasAlternatives && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='px-3 pb-3'>
              <div className='bg-[#1B998B]/5 rounded-lg p-3 border border-[#1B998B]/10'>
                <p className='text-xs font-medium text-[#1B998B] mb-2 flex items-center gap-1.5'>
                  <ArrowLeftRight className='w-3.5 h-3.5' />
                  Alternatives possibles
                </p>
                <div className='space-y-2'>
                  {food.alternatives!.map((alt: FoodAlternative) => (
                    <div
                      key={alt.id}
                      className='flex items-center justify-between p-2 bg-white rounded-md'
                    >
                      <div>
                        <p className='text-sm font-medium text-gray-700'>
                          {alt.name}
                        </p>
                        <p className='text-xs text-gray-500'>{alt.quantity}</p>
                      </div>
                      <div className='text-right'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium text-gray-700'>
                            {alt.calories} kcal
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              Math.abs(alt.calories - food.calories) <= 10
                                ? 'bg-[#1B998B]/10 text-[#1B998B]'
                                : alt.calories < food.calories
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {formatCalorieDifference(
                              food.calories,
                              alt.calories
                            )}
                          </span>
                        </div>
                        <p className='text-xs text-gray-400'>
                          P: {alt.protein}g • G: {alt.carbs}g • L: {alt.fat}g
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MealCard({ meal, isExpanded, onToggleExpand }: MealCardProps) {
  const mealTotal = calculateMealTotal(meal.foods);

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Meal header */}
      <button
        onClick={() => onToggleExpand(meal.type)}
        className='w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'
      >
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-[#1B998B]/10 rounded-xl flex items-center justify-center'>
            <span className='text-2xl'>{meal.icon}</span>
          </div>
          <div className='text-left'>
            <p className='font-semibold text-gray-800'>{meal.label}</p>
            <p className='text-sm text-gray-500'>{meal.time}</p>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <div className='text-right'>
            <p className='font-semibold text-gray-800'>
              {mealTotal.calories} kcal
            </p>
            <p className='text-xs text-gray-500'>
              P: {mealTotal.protein.toFixed(0)}g • G:{' '}
              {mealTotal.carbs.toFixed(0)}g • L: {mealTotal.fat.toFixed(0)}g
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Meal details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='border-t border-gray-100 p-4 bg-gray-50'>
              <div className='space-y-2'>
                {meal.foods.map(food => (
                  <FoodItem key={food.id} food={food} />
                ))}
              </div>

              {/* Alternatives suggestion */}
              {meal.alternatives && (
                <div className='mt-4 p-3 bg-[#1B998B]/10 rounded-lg border border-[#1B998B]/20'>
                  <div className='flex items-start gap-3'>
                    <Lightbulb className='w-5 h-5 text-[#1B998B] flex-shrink-0 mt-0.5' />
                    <div>
                      <p className='text-sm font-medium text-[#1B998B]'>
                        Alternatives possibles
                      </p>
                      <p className='text-sm text-[#1B998B]/80 mt-1'>
                        {meal.alternatives}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MealCard;
