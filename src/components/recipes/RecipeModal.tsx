'use client';

import React from 'react';
import {
  X,
  Heart,
  Clock,
  Star,
  Flame,
  ChefHat,
  ShoppingCart,
  Share2,
  Users,
} from 'lucide-react';
import type { Recipe } from '@/types/recipes';
import { categoryConfig } from '@/types/recipes';

interface RecipeModalProps {
  isOpen: boolean;
  recipe: Recipe | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (recipeId: string) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
}

export function RecipeModal({
  isOpen,
  recipe,
  isFavorite,
  onClose,
  onToggleFavorite,
  onAddToShoppingList,
}: RecipeModalProps) {
  if (!isOpen || !recipe) return null;

  const categoryInfo = categoryConfig[recipe.category];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Découvrez cette recette : ${recipe.title}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100">
          {recipe.image.startsWith('http') ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">{categoryInfo.emoji}</span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => onToggleFavorite(recipe.id)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/80 rounded-full text-gray-600 hover:bg-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Category badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-700">
            {categoryInfo.emoji} {categoryInfo.label}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
          <div className="p-4">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {recipe.title}
            </h2>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {recipe.time}
              </span>
              <span className="flex items-center gap-1">
                <ChefHat className="w-4 h-4" />
                {recipe.difficulty}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {recipe.rating} ({recipe.reviews})
              </span>
            </div>

            {/* Nutrition Card */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Valeurs nutritionnelles
              </h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{recipe.calories}</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">{recipe.protein}g</p>
                  <p className="text-xs text-gray-500">Protéines</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-600">{recipe.carbs}g</p>
                  <p className="text-xs text-gray-500">Glucides</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{recipe.fat}g</p>
                  <p className="text-xs text-gray-500">Lipides</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Ingrédients
                  </h3>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />2 portions
                  </span>
                </div>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-gray-700">{ing.name}</span>
                      <span className="text-gray-500 text-sm">{ing.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps */}
            {recipe.steps && recipe.steps.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  Préparation
                </h3>
                <ol className="space-y-3">
                  {recipe.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#1B998B] text-white rounded-full text-sm flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 text-sm leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tips */}
            {recipe.tips && (
              <div className="bg-amber-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-amber-800 mb-2">Conseil du chef</h3>
                <p className="text-amber-700 text-sm">{recipe.tips}</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100">
            <button
              onClick={() => onAddToShoppingList(recipe)}
              className="w-full py-3 bg-[#1B998B] text-white rounded-xl font-medium hover:bg-[#158578] transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Ajouter à ma liste de courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeModal;
