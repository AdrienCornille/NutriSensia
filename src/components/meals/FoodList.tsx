'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import type { SelectedFood } from '@/types/meals';

interface FoodListProps {
  foods: SelectedFood[];
  onEdit: (food: SelectedFood) => void;
  onRemove: (foodId: string) => void;
  emptyMessage?: string;
}

export function FoodList({
  foods,
  onEdit,
  onRemove,
  emptyMessage = 'Aucun aliment ajouté',
}: FoodListProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">Aliments ajoutés</h2>
        <span className="text-sm text-gray-500">
          {foods.length} aliment{foods.length !== 1 ? 's' : ''}
        </span>
      </div>

      {foods.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {foods.map((food) => (
              <FoodListItem
                key={food.id}
                food={food}
                onEdit={() => onEdit(food)}
                onRemove={() => onRemove(food.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-gray-400">
      <span className="text-4xl" role="img" aria-hidden="true">
        🍽️
      </span>
      <p className="mt-2">{message}</p>
    </div>
  );
}

// Food List Item Component
interface FoodListItemProps {
  food: SelectedFood;
  onEdit: () => void;
  onRemove: () => void;
}

function FoodListItem({ food, onEdit, onRemove }: FoodListItemProps) {
  const unitLabel = food.unit === 'g' ? 'g' : food.unit === 'ml' ? 'ml' : ' unité(s)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="p-4 bg-gray-50 rounded-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center gap-3">
          {food.emoji && (
            <span className="text-xl" role="img" aria-hidden="true">
              {food.emoji}
            </span>
          )}
          <div>
            <p className="font-medium text-gray-800">{food.name}</p>
            <p className="text-sm text-gray-500">
              {food.quantity}
              {unitLabel}
            </p>
          </div>
        </div>
        <div className="text-right mr-4">
          <p className="font-medium text-gray-800">
            {food.calculatedNutrition.calories} kcal
          </p>
          <p className="text-xs text-gray-500">
            P: {food.calculatedNutrition.protein}g • G:{' '}
            {food.calculatedNutrition.carbs}g • L:{' '}
            {food.calculatedNutrition.fat}g
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={`Modifier ${food.name}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-100 rounded-lg text-red-400 hover:text-red-600 transition-colors"
            aria-label={`Supprimer ${food.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default FoodList;
