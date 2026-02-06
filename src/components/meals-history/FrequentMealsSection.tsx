'use client';

import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import type { SelectedFood, MealType } from '@/types/meals';
import { getMealTypeConfig } from '@/types/meals-history';

// TODO: Implémenter l'API pour récupérer les repas fréquents
// Endpoint suggéré: GET /api/protected/meals/frequent

interface FrequentMeal {
  id: string;
  name: string;
  type: MealType;
  foods: SelectedFood[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  frequency: number;
}

interface FrequentMealsSectionProps {
  /** Filter by meal type (optional) */
  filterType?: MealType | null;
  /** Maximum number of meals to show */
  maxItems?: number;
  /** Callback when a meal is selected for duplication */
  onSelectMeal: (foods: SelectedFood[], mealType: MealType) => void;
}

export function FrequentMealsSection({
  filterType,
  maxItems = 4,
  onSelectMeal,
}: FrequentMealsSectionProps) {
  // TODO: Remplacer par un appel API réel
  // const { data: frequentMealsData } = useFrequentMeals(filterType, maxItems);
  // const frequentMeals = frequentMealsData?.meals || [];

  // Désactivé temporairement jusqu'à ce que l'API soit implémentée
  const frequentMeals: FrequentMeal[] = [];

  if (frequentMeals.length === 0) {
    return null;
  }

  return (
    <div className='mb-4'>
      <div className='flex items-center gap-2 mb-3'>
        <TrendingUp className='w-4 h-4 text-gray-400' />
        <p className='text-sm text-gray-500'>Repas fréquents</p>
      </div>
      <div className='space-y-2'>
        {frequentMeals.map(meal => (
          <FrequentMealItem
            key={meal.id}
            meal={meal}
            onSelect={() => onSelectMeal(meal.foods, meal.type)}
          />
        ))}
      </div>
    </div>
  );
}

interface FrequentMealItemProps {
  meal: FrequentMeal;
  onSelect: () => void;
}

function FrequentMealItem({ meal, onSelect }: FrequentMealItemProps) {
  const config = getMealTypeConfig(meal.type);
  const foodNames = meal.foods
    .map(f => f.name)
    .slice(0, 3)
    .join(', ');
  const hasMoreFoods = meal.foods.length > 3;

  return (
    <button
      onClick={onSelect}
      className='w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#1B998B]/30 transition-all text-left group'
    >
      {/* Meal type icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bgColor}`}
      >
        <span className='text-lg'>{config.icon}</span>
      </div>

      {/* Meal info */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <p className='font-medium text-gray-800 truncate'>{meal.name}</p>
          <span
            className={`px-1.5 py-0.5 rounded text-xs ${config.bgColor} ${config.textColor}`}
          >
            {config.label}
          </span>
        </div>
        <p className='text-sm text-gray-500 truncate'>
          {foodNames}
          {hasMoreFoods && ` +${meal.foods.length - 3}`}
        </p>
      </div>

      {/* Stats & action */}
      <div className='flex items-center gap-3 flex-shrink-0'>
        <div className='text-right'>
          <p className='text-sm font-medium text-gray-700'>
            {meal.totalNutrition.calories} kcal
          </p>
          <div className='flex items-center gap-1 text-xs text-gray-400'>
            <Clock className='w-3 h-3' />
            <span>{meal.frequency}x</span>
          </div>
        </div>
        <span className='text-[#1B998B] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity'>
          Dupliquer
        </span>
      </div>
    </button>
  );
}

export default FrequentMealsSection;
