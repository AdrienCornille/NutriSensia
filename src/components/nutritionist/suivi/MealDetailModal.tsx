'use client';

import React from 'react';
import type { NutriMeal, FeedbackType } from '@/types/nutritionist-suivi';
import { feedbackTypeConfig } from '@/types/nutritionist-suivi';
import { useDeleteMealFeedback } from '@/hooks/useNutritionistSuivi';
import { MealFeedbackForm } from '@/components/nutritionist/suivi/MealFeedbackForm';

interface MealDetailModalProps {
  meal: NutriMeal | null;
  patientId: string;
  onClose: () => void;
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

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MealDetailModal({ meal, patientId, onClose }: MealDetailModalProps) {
  const deleteFeedback = useDeleteMealFeedback(patientId);

  if (!meal) return null;

  const mealLabel = mealTypeLabels[meal.meal_type] || meal.meal_type;
  const mealIcon = mealTypeIcons[meal.meal_type] || '\uD83C\uDF7D\uFE0F';

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await deleteFeedback.mutateAsync({
        mealId: meal.id,
        feedbackId,
      });
    } catch {
      // Error handled by React Query
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">{mealIcon}</span>
            <div>
              <h3 className="text-base font-semibold text-gray-800">{mealLabel}</h3>
              <p className="text-xs text-gray-500 capitalize">
                {formatDateTime(meal.consumed_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Macro badges */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-orange-50 rounded-lg px-2 py-2 text-center">
              <span className="text-[10px] font-medium text-orange-600 leading-none">Calories</span>
              <p className="text-sm font-bold text-orange-700 leading-tight">
                {Math.round(meal.total_calories)}
                <span className="text-[10px] font-normal ml-0.5">kcal</span>
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg px-2 py-2 text-center">
              <span className="text-[10px] font-medium text-blue-600 leading-none">Proteines</span>
              <p className="text-sm font-bold text-blue-700 leading-tight">
                {Math.round(meal.total_protein * 10) / 10}
                <span className="text-[10px] font-normal ml-0.5">g</span>
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg px-2 py-2 text-center">
              <span className="text-[10px] font-medium text-amber-600 leading-none">Glucides</span>
              <p className="text-sm font-bold text-amber-700 leading-tight">
                {Math.round(meal.total_carbs * 10) / 10}
                <span className="text-[10px] font-normal ml-0.5">g</span>
              </p>
            </div>
            <div className="bg-rose-50 rounded-lg px-2 py-2 text-center">
              <span className="text-[10px] font-medium text-rose-600 leading-none">Lipides</span>
              <p className="text-sm font-bold text-rose-700 leading-tight">
                {Math.round(meal.total_fat * 10) / 10}
                <span className="text-[10px] font-normal ml-0.5">g</span>
              </p>
            </div>
          </div>

          {/* Foods list */}
          {meal.foods.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Aliments</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-1.5 pr-2 text-gray-500 font-medium">Aliment</th>
                      <th className="text-right py-1.5 px-1 text-gray-500 font-medium">Qte</th>
                      <th className="text-right py-1.5 px-1 text-gray-500 font-medium">Cal</th>
                      <th className="text-right py-1.5 px-1 text-gray-500 font-medium">P</th>
                      <th className="text-right py-1.5 px-1 text-gray-500 font-medium">G</th>
                      <th className="text-right py-1.5 pl-1 text-gray-500 font-medium">L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.foods.map(food => (
                      <tr key={food.id} className="border-b border-gray-50">
                        <td className="py-1.5 pr-2 text-gray-700">{food.food_name}</td>
                        <td className="text-right py-1.5 px-1 text-gray-500">
                          {food.quantity}{food.unit}
                        </td>
                        <td className="text-right py-1.5 px-1 text-orange-600 font-medium">
                          {food.calories}
                        </td>
                        <td className="text-right py-1.5 px-1 text-blue-600">
                          {food.protein_g}g
                        </td>
                        <td className="text-right py-1.5 px-1 text-amber-600">
                          {food.carbs_g}g
                        </td>
                        <td className="text-right py-1.5 pl-1 text-rose-600">
                          {food.fat_g}g
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Photo */}
          {meal.photo_url && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Photo</h4>
              <img
                src={meal.photo_url}
                alt={`Photo du repas - ${mealLabel}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Notes */}
          {meal.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {meal.notes}
              </p>
            </div>
          )}

          {/* Existing feedback */}
          {meal.feedback.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback</h4>
              <div className="space-y-2">
                {meal.feedback.map(fb => {
                  const config = feedbackTypeConfig[fb.feedback_type as FeedbackType] || feedbackTypeConfig.general;
                  return (
                    <div
                      key={fb.id}
                      className={`${config.bgColor} rounded-lg p-3 flex items-start justify-between gap-2`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs">{config.icon}</span>
                          <span className={`text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(fb.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{fb.comment}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        aria-label="Supprimer le feedback"
                        disabled={deleteFeedback.isPending}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback form */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Ajouter un feedback
            </h4>
            <MealFeedbackForm patientId={patientId} mealId={meal.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MealDetailModal;
