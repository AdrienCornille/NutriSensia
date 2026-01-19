'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MealCard } from './MealCard';
import type { MealType, SelectedFood } from '@/types/meals';
import type { DailyMealsData, LoggedMeal } from '@/types/meals-history';
import { formatDateLabel } from '@/data/mock-meals-history';

interface DayViewProps {
  data: DailyMealsData;
  expandedMealId: string | null;
  onToggleExpand: (mealId: string) => void;
  onAddMeal: (type: MealType) => void;
  onEditMeal?: (mealId: string) => void;
  onDeleteMeal?: (mealId: string) => void;
  onDuplicateMeal?: (meal: LoggedMeal) => void;
}

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function DayView({
  data,
  expandedMealId,
  onToggleExpand,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
  onDuplicateMeal,
}: DayViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Date header */}
      <div className="mb-2">
        <h2 className="font-semibold text-gray-800">
          {formatDateLabel(data.date)}
        </h2>
      </div>

      {/* Meal cards */}
      {mealTypes.map((type, index) => {
        const meal = data.meals[type];
        const mealId = meal?.id ?? `empty-${type}`;

        return (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <MealCard
              mealType={type}
              meal={meal}
              isExpanded={expandedMealId === mealId}
              onToggleExpand={() => onToggleExpand(mealId)}
              onAddMeal={() => onAddMeal(type)}
              onEditMeal={meal ? () => onEditMeal?.(meal.id) : undefined}
              onDeleteMeal={meal ? () => onDeleteMeal?.(meal.id) : undefined}
              onDuplicateMeal={onDuplicateMeal}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default DayView;
