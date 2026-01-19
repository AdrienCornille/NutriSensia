'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Camera, Pencil, Trash2, Copy } from 'lucide-react';
import type { MealType } from '@/types/meals';
import type { LoggedMeal } from '@/types/meals-history';
import { getMealTypeConfig } from '@/types/meals-history';
import { formatTime } from '@/data/mock-meals-history';
import { contextConfigs } from './NotesAndContextSection';

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
        <div className="flex items-center gap-4">
          {/* Meal type icon */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bgColor} ${config.textColor}`}
          >
            <span className="text-xl">{config.icon}</span>
          </div>

          {/* Meal info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-800">{config.label}</h3>
              {isLogged && meal.photoUrl && (
                <Camera className="w-4 h-4 text-gray-400" />
              )}
            </div>
            {isLogged ? (
              <p className="text-sm text-gray-500">
                {formatTime(meal.loggedAt)} • {meal.foods.length} aliment
                {meal.foods.length > 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-sm text-gray-400">Non enregistré</p>
            )}
          </div>
        </div>

        {/* Right side - calories/macros or add button */}
        <div className="flex items-center gap-4">
          {isLogged ? (
            <>
              <div className="text-right">
                <p className="font-semibold text-gray-800">
                  {meal.totalNutrition.calories} kcal
                </p>
                <p className="text-xs text-gray-500">
                  P: {Math.round(meal.totalNutrition.protein)}g • G:{' '}
                  {Math.round(meal.totalNutrition.carbs)}g • L:{' '}
                  {Math.round(meal.totalNutrition.fat)}g
                </p>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddMeal();
              }}
              className="px-4 py-2 text-[#1B998B] font-medium hover:bg-[#1B998B]/10 rounded-lg transition-colors"
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
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100">
              {/* Photo if available */}
              {meal.photoUrl && (
                <div className="mt-4 mb-4">
                  <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src={meal.photoUrl}
                      alt={`Photo du ${config.label.toLowerCase()}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
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
                <div className="mt-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Contexte</p>
                  <div className="flex flex-wrap gap-2">
                    {meal.contextTags.map((tagId) => {
                      const config = contextConfigs.find((c) => c.id === tagId);
                      if (!config) return null;
                      return (
                        <span
                          key={tagId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
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
                <div className="mt-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 italic">{meal.notes}</p>
                </div>
              )}

              {/* Items list */}
              <div className="mt-4">
                {meal.foods.map((food, index) => (
                  <div
                    key={food.id || index}
                    className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                  >
                    <div>
                      <p className="text-gray-800">{food.name}</p>
                      <p className="text-sm text-gray-500">
                        {food.quantity}
                        {food.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-700">
                        {food.calculatedNutrition.calories} kcal
                      </p>
                      <p className="text-xs text-gray-400">
                        P: {Math.round(food.calculatedNutrition.protein)}g • G:{' '}
                        {Math.round(food.calculatedNutrition.carbs)}g • L:{' '}
                        {Math.round(food.calculatedNutrition.fat)}g
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateMeal?.(meal);
                  }}
                  className="flex-1 py-2 text-[#1B998B] font-medium hover:bg-[#1B998B]/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Dupliquer
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMeal?.();
                  }}
                  className="flex-1 py-2 text-[#1B998B] font-medium hover:bg-[#1B998B]/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMeal?.();
                  }}
                  className="flex-1 py-2 text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
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
