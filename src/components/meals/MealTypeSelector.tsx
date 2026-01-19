'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { MealType, MealTypeConfig, PreviousMeal } from '@/types/meals';

interface MealTypeSelectorProps {
  selectedType: MealType | null;
  onSelect: (type: MealType) => void;
  mealTypes: MealTypeConfig[];
  previousMeals?: PreviousMeal[];
  onDuplicateMeal?: (meal: PreviousMeal) => void;
}

export function MealTypeSelector({
  selectedType,
  onSelect,
  mealTypes,
  previousMeals = [],
  onDuplicateMeal,
}: MealTypeSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Meal Type Selection */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-4">
          Quel repas souhaitez-vous enregistrer ?
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {mealTypes.map((meal) => (
            <MealTypeCard
              key={meal.id}
              meal={meal}
              isSelected={selectedType === meal.id}
              onSelect={() => onSelect(meal.id)}
            />
          ))}
        </div>
      </div>

      {/* Duplicate Previous Meal */}
      {previousMeals.length > 0 && onDuplicateMeal && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="font-semibold text-gray-800 mb-4">
            Ou dupliquer un repas précédent
          </h2>
          <div className="space-y-3">
            {previousMeals.map((meal) => (
              <PreviousMealCard
                key={meal.id}
                meal={meal}
                mealTypes={mealTypes}
                onDuplicate={() => onDuplicateMeal(meal)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Meal Type Card Component
interface MealTypeCardProps {
  meal: MealTypeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

function MealTypeCard({ meal, isSelected, onSelect }: MealTypeCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      className={`
        p-4 rounded-xl border-2 text-left transition-all w-full
        ${
          isSelected
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-emerald-300'
        }
      `}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-hidden="true">
          {meal.icon}
        </span>
        <div>
          <p className="font-medium text-gray-800">{meal.label}</p>
          <p className="text-sm text-gray-500">{meal.timeRange}</p>
        </div>
      </div>
    </motion.button>
  );
}

// Previous Meal Card Component
interface PreviousMealCardProps {
  meal: PreviousMeal;
  mealTypes: MealTypeConfig[];
  onDuplicate: () => void;
}

function PreviousMealCard({
  meal,
  mealTypes,
  onDuplicate,
}: PreviousMealCardProps) {
  const mealTypeConfig = mealTypes.find((m) => m.id === meal.type);

  return (
    <motion.button
      onClick={onDuplicate}
      className="w-full p-4 rounded-lg border border-gray-200 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg" role="img" aria-hidden="true">
            {mealTypeConfig?.icon || '🍽️'}
          </span>
          <div>
            <p className="font-medium text-gray-800">{meal.label}</p>
            <p className="text-sm text-gray-500">
              {meal.description} • {meal.calories} kcal
            </p>
          </div>
        </div>
        <span className="text-emerald-600 text-sm font-medium">Dupliquer</span>
      </div>
    </motion.button>
  );
}

export default MealTypeSelector;
