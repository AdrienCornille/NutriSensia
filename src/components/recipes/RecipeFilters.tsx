'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { RecipeFilters as RecipeFiltersType, RecipeCategory, RecipeDifficulty, RecipeTime, RecipeDiet } from '@/types/recipes';
import { categoryConfig, difficultyOptions, timeOptions, dietOptions } from '@/types/recipes';

interface RecipeFiltersProps {
  isOpen: boolean;
  filters: RecipeFiltersType;
  onClose: () => void;
  onFilterChange: (filterType: keyof RecipeFiltersType, values: string[]) => void;
  onResetFilters: () => void;
}

export function RecipeFilters({
  isOpen,
  filters,
  onClose,
  onFilterChange,
  onResetFilters,
}: RecipeFiltersProps) {
  if (!isOpen) return null;

  const toggleFilter = (filterType: keyof RecipeFiltersType, value: string) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onFilterChange(filterType, newValues);
  };

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.time.length > 0 ||
    filters.diet.length > 0;

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-4 animate-in slide-in-from-top duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filtres</h3>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-sm text-[#1B998B] font-medium hover:underline"
            >
              Réinitialiser
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Catégorie</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(categoryConfig) as RecipeCategory[]).map((category) => {
            const isSelected = filters.category.includes(category);
            const config = categoryConfig[category];
            return (
              <button
                key={category}
                onClick={() => toggleFilter('category', category)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isSelected
                    ? 'bg-[#1B998B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {config.emoji} {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Difficulté</p>
        <div className="flex flex-wrap gap-2">
          {difficultyOptions.map((difficulty: RecipeDifficulty) => {
            const isSelected = filters.difficulty.includes(difficulty);
            return (
              <button
                key={difficulty}
                onClick={() => toggleFilter('difficulty', difficulty)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isSelected
                    ? 'bg-[#1B998B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {difficulty}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Filter */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Temps de préparation</p>
        <div className="flex flex-wrap gap-2">
          {timeOptions.map((time: RecipeTime) => {
            const isSelected = filters.time.includes(time);
            return (
              <button
                key={time}
                onClick={() => toggleFilter('time', time)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isSelected
                    ? 'bg-[#1B998B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      {/* Diet Filter */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Régime alimentaire</p>
        <div className="flex flex-wrap gap-2">
          {dietOptions.map((diet: RecipeDiet) => {
            const isSelected = filters.diet.includes(diet);
            return (
              <button
                key={diet}
                onClick={() => toggleFilter('diet', diet)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isSelected
                    ? 'bg-[#1B998B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {diet}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RecipeFilters;
