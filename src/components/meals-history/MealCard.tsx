'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Camera,
  Pencil,
  Trash2,
  Copy,
  Minus,
  Plus,
} from 'lucide-react';
import type { MealType, SelectedFood } from '@/types/meals';
import type { LoggedMeal } from '@/types/meals-history';
import { getMealTypeConfig } from '@/types/meals-history';
import { formatTime } from '@/lib/date-utils';
import { contextConfigs } from './NotesAndContextSection';
import { useUpdateMeal } from '@/hooks/useMeals';
import { transformLoggedMealToCreateData } from '@/lib/meals-transformers';

interface MealCardProps {
  mealType: MealType;
  meal: LoggedMeal | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAddMeal: () => void;
  onEditMeal?: () => void;
  onDeleteMeal?: () => void;
  onDuplicateMeal?: (meal: LoggedMeal) => void;
}

export function MealCard({
  mealType,
  meal,
  isExpanded,
  onToggleExpand,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
  onDuplicateMeal,
}: MealCardProps) {
  const config = getMealTypeConfig(mealType);
  const isLogged = meal !== null;

  // State for inline quantity editing
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(0);

  // Mutation for updating meal
  const updateMeal = useUpdateMeal(meal?.id || '');

  const handleUpdateFoodQuantity = async (
    food: SelectedFood,
    newQuantity: number
  ) => {
    if (!meal || newQuantity <= 0) return;

    try {
      // Update the foods array with new quantity
      const updatedFoods = meal.foods.map(f =>
        f.id === food.id ? { ...f, quantity: newQuantity } : f
      );

      // Create updated meal data
      const updatedMeal = {
        ...meal,
        foods: updatedFoods,
      };

      // Transform and send to API
      const payload = transformLoggedMealToCreateData(updatedMeal);
      await updateMeal.mutateAsync(payload);

      setEditingFoodId(null);
    } catch (error) {
      console.error('Error updating food quantity:', error);
    }
  };

  const handleRemoveFood = async (foodId: string) => {
    if (!meal) return;

    try {
      // Filter out the food
      const updatedFoods = meal.foods.filter(f => f.id !== foodId);

      // If no foods left, show error or delete meal
      if (updatedFoods.length === 0) {
        alert(
          'Un repas doit contenir au moins un aliment. Supprimez le repas entier si nécessaire.'
        );
        return;
      }

      // Create updated meal data
      const updatedMeal = {
        ...meal,
        foods: updatedFoods,
      };

      // Transform and send to API
      const payload = transformLoggedMealToCreateData(updatedMeal);
      await updateMeal.mutateAsync(payload);
    } catch (error) {
      console.error('Error removing food:', error);
    }
  };

  const startEditingQuantity = (food: SelectedFood) => {
    setEditingFoodId(food.id);
    setEditingQuantity(food.quantity);
  };

  const cancelEditingQuantity = () => {
    setEditingFoodId(null);
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all ${
        isLogged ? 'border-gray-200' : 'border-dashed border-gray-300'
      }`}
    >
      {/* Meal header */}
      <div
        className={`p-4 flex items-center justify-between ${
          isLogged ? 'cursor-pointer' : ''
        }`}
        onClick={isLogged ? onToggleExpand : undefined}
      >
        <div className='flex items-center gap-4'>
          {/* Meal type icon */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bgColor} ${config.textColor}`}
          >
            <span className='text-xl'>{config.icon}</span>
          </div>

          {/* Meal info */}
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='font-medium text-gray-800'>{config.label}</h3>
              {isLogged && meal.photoUrl && (
                <Camera className='w-4 h-4 text-gray-400' />
              )}
            </div>
            {isLogged ? (
              <p className='text-sm text-gray-500'>
                {formatTime(meal.loggedAt)} •{' '}
                {meal.foodCount ?? meal.foods.length} aliment
                {(meal.foodCount ?? meal.foods.length) > 1 ? 's' : ''}
              </p>
            ) : (
              <p className='text-sm text-gray-400'>Non enregistré</p>
            )}
          </div>
        </div>

        {/* Right side - calories/macros or add button */}
        <div className='flex items-center gap-4'>
          {isLogged ? (
            <>
              <div className='text-right'>
                <p className='font-semibold text-gray-800'>
                  {meal.totalNutrition.calories} kcal
                </p>
                <p className='text-xs text-gray-500'>
                  P: {Math.round(meal.totalNutrition.protein)}g • G:{' '}
                  {Math.round(meal.totalNutrition.carbs)}g • L:{' '}
                  {Math.round(meal.totalNutrition.fat)}g
                </p>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className='w-5 h-5 text-gray-400' />
              </motion.div>
            </>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation();
                onAddMeal();
              }}
              className='px-4 py-2 text-[#1B998B] font-medium hover:bg-[#1B998B]/10 rounded-lg transition-colors'
            >
              + Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isLogged && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='px-4 pb-4 border-t border-gray-100'>
              {/* Photo if available */}
              {meal.photoUrl && (
                <div className='mt-4 mb-4'>
                  <div className='w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden'>
                    <img
                      src={meal.photoUrl}
                      alt={`Photo du ${config.label.toLowerCase()}`}
                      className='w-full h-full object-cover'
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML =
                          '<span class="text-4xl">📸</span>';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Context tags if available */}
              {meal.contextTags && meal.contextTags.length > 0 && (
                <div className='mt-4 mb-4'>
                  <p className='text-xs text-gray-500 mb-2'>Contexte</p>
                  <div className='flex flex-wrap gap-2'>
                    {meal.contextTags.map(tagId => {
                      const config = contextConfigs.find(c => c.id === tagId);
                      if (!config) return null;
                      return (
                        <span
                          key={tagId}
                          className='inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600'
                        >
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes if available */}
              {meal.notes && (
                <div className='mt-4 mb-4 p-3 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-600 italic'>{meal.notes}</p>
                </div>
              )}

              {/* Items list */}
              <div className='mt-4'>
                {meal.foods.length === 0 ? (
                  <p className='text-sm text-gray-400 text-center py-4'>
                    Chargement des aliments...
                  </p>
                ) : (
                  meal.foods.map((food, index) => (
                    <div
                      key={food.id || index}
                      className='flex items-center gap-3 py-3 border-b border-gray-200 last:border-0'
                    >
                      {/* Food info */}
                      <div className='flex-1'>
                        <p className='text-gray-800 font-medium'>{food.name}</p>
                        {editingFoodId === food.id ? (
                          // Editing mode
                          <div className='flex items-center gap-2 mt-1'>
                            <button
                              onClick={() =>
                                setEditingQuantity(
                                  Math.max(1, editingQuantity - 10)
                                )
                              }
                              className='p-1 hover:bg-gray-100 rounded'
                            >
                              <Minus className='w-4 h-4 text-gray-600' />
                            </button>
                            <input
                              type='number'
                              value={editingQuantity}
                              onChange={e =>
                                setEditingQuantity(Number(e.target.value))
                              }
                              className='w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center'
                              min='1'
                            />
                            <span className='text-sm text-gray-600'>
                              {food.unit}
                            </span>
                            <button
                              onClick={() =>
                                setEditingQuantity(editingQuantity + 10)
                              }
                              className='p-1 hover:bg-gray-100 rounded'
                            >
                              <Plus className='w-4 h-4 text-gray-600' />
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateFoodQuantity(food, editingQuantity)
                              }
                              className='px-2 py-1 text-xs bg-[#1B998B] text-white rounded hover:bg-[#158f7d]'
                              disabled={updateMeal.isPending}
                            >
                              OK
                            </button>
                            <button
                              onClick={cancelEditingQuantity}
                              className='px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          // Display mode
                          <p className='text-sm text-gray-500'>
                            {food.quantity}
                            {food.unit}
                          </p>
                        )}
                      </div>

                      {/* Nutrition info */}
                      <div className='text-right'>
                        <p className='font-medium text-gray-700'>
                          {food.calculatedNutrition.calories} kcal
                        </p>
                        <p className='text-xs text-gray-400'>
                          P: {Math.round(food.calculatedNutrition.protein)}g •
                          G: {Math.round(food.calculatedNutrition.carbs)}g • L:{' '}
                          {Math.round(food.calculatedNutrition.fat)}g
                        </p>
                      </div>

                      {/* Action buttons */}
                      {editingFoodId !== food.id && (
                        <div className='flex gap-1'>
                          <button
                            onClick={() => startEditingQuantity(food)}
                            className='p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors'
                            title='Modifier la quantité'
                          >
                            <Pencil className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(`Supprimer ${food.name} de ce repas ?`)
                              ) {
                                handleRemoveFood(food.id);
                              }
                            }}
                            className='p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors'
                            title='Supprimer cet aliment'
                            disabled={updateMeal.isPending}
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className='flex gap-2 mt-4'>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDuplicateMeal?.(meal);
                  }}
                  className='flex-1 py-2 text-[#1B998B] font-medium hover:bg-[#1B998B]/10 rounded-lg transition-colors flex items-center justify-center gap-2'
                >
                  <Copy className='w-4 h-4' />
                  Dupliquer
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onEditMeal?.();
                  }}
                  className='flex-1 py-2 text-[#1B998B] font-medium hover:bg-[#1B998B]/10 rounded-lg transition-colors flex items-center justify-center gap-2'
                >
                  <Pencil className='w-4 h-4' />
                  Modifier
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteMeal?.();
                  }}
                  className='flex-1 py-2 text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2'
                >
                  <Trash2 className='w-4 h-4' />
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MealCard;
