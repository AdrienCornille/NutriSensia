'use client';

import React, { useState } from 'react';
import { usePatientMeals } from '@/hooks/useNutritionistSuivi';
import { MealDetailModal } from '@/components/nutritionist/suivi/MealDetailModal';
import type { NutriMeal } from '@/types/nutritionist-suivi';

interface MealsReviewSectionProps {
  patientId: string;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Petit-dejeuner',
  lunch: 'Dejeuner',
  dinner: 'Diner',
  snack: 'Collation',
};

const mealTypeIcons: Record<string, string> = {
  breakfast: '\u2615',
  lunch: '\uD83C\uDF5D',
  dinner: '\uD83C\uDF19',
  snack: '\uD83C\uDF4E',
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function MealsReviewSection({ patientId }: MealsReviewSectionProps) {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [selectedMeal, setSelectedMeal] = useState<NutriMeal | null>(null);

  const { data, isLoading, error } = usePatientMeals(patientId, selectedDate);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-40" />
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded-lg" />
            <div className="h-16 bg-gray-100 rounded-lg" />
            <div className="h-16 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-red-500 text-sm">
          Erreur lors du chargement des repas.
        </p>
      </div>
    );
  }

  const meals = data?.meals || [];
  const dailySummary = data?.daily_summary;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">
          Repas enregistres
        </h3>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]"
        />
      </div>

      {/* Daily summary */}
      {dailySummary && (
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <span className="text-[10px] font-medium text-orange-600 leading-none">
              Calories
            </span>
            <p className="text-sm font-bold text-orange-700 leading-tight">
              {Math.round(dailySummary.total_calories)}
              <span className="text-[10px] font-normal ml-0.5">kcal</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <span className="text-[10px] font-medium text-blue-600 leading-none">
              Proteines
            </span>
            <p className="text-sm font-bold text-blue-700 leading-tight">
              {Math.round(dailySummary.total_protein * 10) / 10}
              <span className="text-[10px] font-normal ml-0.5">g</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <span className="text-[10px] font-medium text-amber-600 leading-none">
              Glucides
            </span>
            <p className="text-sm font-bold text-amber-700 leading-tight">
              {Math.round(dailySummary.total_carbs * 10) / 10}
              <span className="text-[10px] font-normal ml-0.5">g</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <span className="text-[10px] font-medium text-rose-600 leading-none">
              Lipides
            </span>
            <p className="text-sm font-bold text-rose-700 leading-tight">
              {Math.round(dailySummary.total_fat * 10) / 10}
              <span className="text-[10px] font-normal ml-0.5">g</span>
            </p>
          </div>
        </div>
      )}

      {/* Meals list */}
      {meals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">
            Aucun repas enregistre ce jour
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {meals.map(meal => {
            const icon = mealTypeIcons[meal.meal_type] || '\uD83C\uDF7D\uFE0F';
            const label = mealTypeLabels[meal.meal_type] || meal.meal_type;
            const foodCount = meal.foods.length;
            const hasFeedback = meal.feedback.length > 0;

            return (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal)}
                className="w-full flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-shadow text-left"
              >
                <span className="text-lg shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(meal.consumed_at)}
                    </span>
                    {hasFeedback && (
                      <span className="inline-flex items-center justify-center w-4 h-4 bg-[#1B998B] text-white text-[9px] font-bold rounded-full">
                        {meal.feedback.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {foodCount} aliment{foodCount > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold text-orange-600">
                    {Math.round(meal.total_calories)} kcal
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          patientId={patientId}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </div>
  );
}

export default MealsReviewSection;
