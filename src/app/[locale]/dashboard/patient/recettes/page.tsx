'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  RecipesTabs,
  RecipesGrid,
  ShoppingListView,
} from '@/components/recipes';
import {
  FilterSection,
  FilterCheckbox,
  FilterRangeSlider,
} from '@/components/recipes/RecipeFilterSidebar';
import { AddToShoppingListModal } from '@/components/recipes/AddToShoppingListModal';
import { LogMealModal } from '@/components/recipes/LogMealModal';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';
import {
  usePatientRecipes,
  usePatientFavoriteRecipes,
  useRecommendedRecipes,
  useCookedRecipes,
  useToggleFavorite,
  useLogRecipeAsMeal,
} from '@/hooks/usePatientRecipes';
import {
  useAddRecipeToShoppingList,
  useShoppingList,
} from '@/hooks/useShoppingList';
import type { NutriRecipe, RecipesTab } from '@/types/recipes';

export default function RecipesPage() {
  // Tab & search
  const [activeTab, setActiveTab] = useState<RecipesTab>('discover');
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar filters
  const [showFilters, setShowFilters] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [nutritionFilters, setNutritionFilters] = useState<string[]>([]);
  const [calRange, setCalRange] = useState<[number, number]>([0, 800]);
  const [protRange, setProtRange] = useState<[number, number]>([0, 60]);
  const [carbRange, setCarbRange] = useState<[number, number]>([0, 100]);
  const [fatRange, setFatRange] = useState<[number, number]>([0, 50]);

  // Toast
  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message?: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
  });
  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      setToast({ visible: true, type, title, message });
    },
    []
  );
  const hideToast = useCallback(
    () => setToast(t => ({ ...t, visible: false })),
    []
  );

  // Shopping list modal
  const [shoppingRecipe, setShoppingRecipe] = useState<NutriRecipe | null>(
    null
  );
  const addToShoppingList = useAddRecipeToShoppingList();

  // Log meal modal
  const [logMealRecipe, setLogMealRecipe] = useState<NutriRecipe | null>(null);
  const logRecipeAsMeal = useLogRecipeAsMeal();

  // API queries
  const { data: recipesData, isLoading } = usePatientRecipes({
    search: searchQuery || undefined,
    limit: 50,
  });
  const { data: favoriteRecipes = [] } = usePatientFavoriteRecipes();
  const { data: cookedRecipes = [] } = useCookedRecipes();
  const toggleFavorite = useToggleFavorite();
  const { data: recommendedRecipes = [] } = useRecommendedRecipes();

  const allRecipes = recipesData?.recipes || [];
  const favoriteIds = useMemo(
    () => favoriteRecipes.map(r => r.id),
    [favoriteRecipes]
  );
  const cookedIds = useMemo(
    () => cookedRecipes.map(r => r.id),
    [cookedRecipes]
  );

  // Shopping list recipe IDs
  const { data: shoppingData } = useShoppingList();
  const shoppingRecipeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const cat of shoppingData?.categories || []) {
      for (const item of cat.items || []) {
        if (item.recipe_id) ids.add(item.recipe_id);
      }
    }
    return [...ids];
  }, [shoppingData]);

  // Detect active filters
  const hasNutritionFilter =
    calRange[0] > 0 ||
    calRange[1] < 800 ||
    protRange[0] > 0 ||
    protRange[1] < 60 ||
    carbRange[0] > 0 ||
    carbRange[1] < 100 ||
    fatRange[0] > 0 ||
    fatRange[1] < 50;
  const hasAnyFilter =
    !!difficultyFilter ||
    !!timeFilter ||
    nutritionFilters.length > 0 ||
    hasNutritionFilter;

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    let list = allRecipes;

    if (activeTab === 'favorites') list = favoriteRecipes;
    else if (activeTab === 'cooked') list = cookedRecipes;
    else if (activeTab === 'recommended') list = recommendedRecipes;

    // Search (client-side on favorites/recommended)
    if (searchQuery && activeTab !== 'discover') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.tags.some(t => t.label.toLowerCase().includes(q))
      );
    }

    // Difficulty
    if (difficultyFilter) {
      list = list.filter(r => r.difficulty === difficultyFilter);
    }

    // Time (auto-tag based, client-side)
    if (timeFilter) {
      list = list.filter(r => {
        const t = r.totalTimeMinutes;
        if (timeFilter === 'time-lt-15') return t <= 15;
        if (timeFilter === 'time-lt-30') return t <= 30;
        if (timeFilter === 'time-lt-45') return t <= 45;
        if (timeFilter === 'time-lt-60') return t <= 60;
        if (timeFilter === 'time-gt-60') return t > 60;
        return true;
      });
    }

    // Profil nutritionnel / allergènes (check auto-tags)
    if (nutritionFilters.length > 0) {
      list = list.filter(r =>
        nutritionFilters.every(nf => r.autoTags.some(at => at.value === nf))
      );
    }

    // Nutrition range sliders (per serving, computed from ingredients)
    if (hasNutritionFilter) {
      list = list.filter(r => {
        let cal = r.calories;
        let prot = r.proteinG;
        let carb = r.carbsG;
        let fat = r.fatG;

        if (cal === null) {
          let eCal = 0,
            eProt = 0,
            eCarb = 0,
            eFat = 0;
          let hasData = false;
          for (const ing of r.ingredients) {
            if (ing.caloriesPer100g && ing.quantityValue) {
              const f = ing.quantityValue / 100;
              eCal += ing.caloriesPer100g * f;
              eProt += (ing.proteinPer100g || 0) * f;
              eCarb += (ing.carbsPer100g || 0) * f;
              eFat += (ing.fatPer100g || 0) * f;
              hasData = true;
            }
          }
          if (hasData) {
            cal = eCal;
            prot = eProt;
            carb = eCarb;
            fat = eFat;
          }
        }

        if (cal === null) return true;
        const s = r.servings || 1;
        if (cal / s < calRange[0] || cal / s > calRange[1]) return false;
        if ((prot || 0) / s < protRange[0] || (prot || 0) / s > protRange[1])
          return false;
        if ((carb || 0) / s < carbRange[0] || (carb || 0) / s > carbRange[1])
          return false;
        if ((fat || 0) / s < fatRange[0] || (fat || 0) / s > fatRange[1])
          return false;
        return true;
      });
    }

    return list;
  }, [
    allRecipes,
    favoriteRecipes,
    cookedRecipes,
    recommendedRecipes,
    activeTab,
    searchQuery,
    difficultyFilter,
    timeFilter,
    nutritionFilters,
    hasNutritionFilter,
    calRange,
    protRange,
    carbRange,
    fatRange,
  ]);

  // Handlers
  const handleTabChange = useCallback(
    (tab: RecipesTab) => setActiveTab(tab),
    []
  );

  const handleToggleFavorite = useCallback(
    async (recipeId: string) => {
      try {
        const result = await toggleFavorite.mutateAsync(recipeId);
        showToast(
          'success',
          result.is_favorite ? 'Ajouté aux favoris' : 'Retiré des favoris'
        );
      } catch {
        showToast('error', 'Erreur', 'Impossible de modifier les favoris');
      }
    },
    [toggleFavorite, showToast]
  );

  const handleAddToShoppingList = useCallback(
    async (
      recipeId: string,
      servingsMultiplier: number,
      excludedIngredientIds: string[] = []
    ) => {
      try {
        await addToShoppingList.mutateAsync({
          recipeId,
          servingsMultiplier,
          excludedIngredientIds,
        });
        setShoppingRecipe(null);
        showToast('success', 'Ajouté à la liste de courses');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erreur lors de l'ajout";
        showToast('error', 'Erreur', message);
      }
    },
    [addToShoppingList, showToast]
  );

  const handleConfirmLogMeal = useCallback(
    async (
      recipeId: string,
      mealType: string,
      date: string,
      servingsMultiplier: number
    ) => {
      try {
        await logRecipeAsMeal.mutateAsync({
          recipeId,
          mealType,
          date,
          servingsMultiplier,
        });
        setLogMealRecipe(null);
        showToast('success', 'Repas enregistré');
      } catch {
        showToast('error', 'Erreur', "Impossible d'enregistrer le repas");
      }
    },
    [logRecipeAsMeal, showToast]
  );

  const handleResetFilters = useCallback(() => {
    setDifficultyFilter('');
    setTimeFilter('');
    setNutritionFilters([]);
    setCalRange([0, 800]);
    setProtRange([0, 60]);
    setCarbRange([0, 100]);
    setFatRange([0, 50]);
  }, []);

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'favorites':
        return "Vous n'avez pas encore de recettes favorites";
      case 'cooked':
        return "Vous n'avez pas encore cuisiné de recettes";
      case 'recommended':
        return 'Aucune recette recommandée pour le moment';
      default:
        return 'Aucune recette ne correspond à vos critères';
    }
  };

  const getEmptyIcon = () => {
    switch (activeTab) {
      case 'favorites':
        return '❤️';
      case 'cooked':
        return '🍳';
      case 'recommended':
        return '✨';
      default:
        return '🍽️';
    }
  };

  return (
    <div className='h-screen flex flex-col'>
      <DashboardHeader />

      {/* Header: search + tabs */}
      <div className='bg-white border-b border-gray-200 px-4 py-3'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Rechercher une recette...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-all'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full'
              >
                <X className='w-3.5 h-3.5 text-gray-400' />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border rounded-xl transition-colors flex-shrink-0 ${
              showFilters
                ? 'bg-[#1B998B]/10 border-[#1B998B]/30 text-[#1B998B]'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className='w-4 h-4' />
            Filtres
          </button>
        </div>
        <RecipesTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          favoritesCount={favoriteIds.length}
          cookedCount={cookedRecipes.length}
        />
      </div>

      {/* Content: Sidebar + Grid */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Filter Sidebar */}
        <AnimatePresence>
          {activeTab !== 'shopping' && showFilters && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className='flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden'
            >
              <div className='w-64 py-5 px-5 space-y-6 overflow-y-auto h-full'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-sm font-semibold text-gray-800'>
                    Filtrer
                  </h2>
                  {hasAnyFilter && (
                    <button
                      onClick={handleResetFilters}
                      className='text-[10px] text-[#1B998B] hover:underline'
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>

                {/* Difficulté */}
                <FilterSection title='Difficulté'>
                  {[
                    { value: 'easy', label: 'Facile' },
                    { value: 'medium', label: 'Moyen' },
                    { value: 'hard', label: 'Difficile' },
                  ].map(opt => (
                    <FilterCheckbox
                      key={opt.value}
                      label={opt.label}
                      checked={difficultyFilter === opt.value}
                      onChange={() =>
                        setDifficultyFilter(
                          difficultyFilter === opt.value ? '' : opt.value
                        )
                      }
                    />
                  ))}
                </FilterSection>

                {/* Temps */}
                <FilterSection title='Temps'>
                  {[
                    { value: 'time-lt-15', label: '< 15 min' },
                    { value: 'time-lt-30', label: '< 30 min' },
                    { value: 'time-lt-45', label: '< 45 min' },
                    { value: 'time-lt-60', label: '< 1 heure' },
                    { value: 'time-gt-60', label: '> 1 heure' },
                  ].map(opt => (
                    <FilterCheckbox
                      key={opt.value}
                      label={opt.label}
                      checked={timeFilter === opt.value}
                      onChange={() =>
                        setTimeFilter(timeFilter === opt.value ? '' : opt.value)
                      }
                    />
                  ))}
                </FilterSection>

                {/* Nutrition par portion (sliders) */}
                <FilterSection title='Nutrition / portion'>
                  <div className='space-y-5'>
                    <FilterRangeSlider
                      label='Calories'
                      min={0}
                      max={800}
                      step={50}
                      unit='kcal'
                      valueMin={calRange[0]}
                      valueMax={calRange[1]}
                      onChange={(a, b) => setCalRange([a, b])}
                    />
                    <FilterRangeSlider
                      label='Protéines'
                      min={0}
                      max={60}
                      step={5}
                      unit='g'
                      valueMin={protRange[0]}
                      valueMax={protRange[1]}
                      onChange={(a, b) => setProtRange([a, b])}
                    />
                    <FilterRangeSlider
                      label='Glucides'
                      min={0}
                      max={100}
                      step={5}
                      unit='g'
                      valueMin={carbRange[0]}
                      valueMax={carbRange[1]}
                      onChange={(a, b) => setCarbRange([a, b])}
                    />
                    <FilterRangeSlider
                      label='Lipides'
                      min={0}
                      max={50}
                      step={5}
                      unit='g'
                      valueMin={fatRange[0]}
                      valueMax={fatRange[1]}
                      onChange={(a, b) => setFatRange([a, b])}
                    />
                  </div>
                </FilterSection>

                {/* Profil nutritionnel */}
                <FilterSection title='Profil nutritionnel'>
                  {[
                    { value: 'high-protein', label: 'Riche en protéines' },
                    { value: 'low-carb', label: 'Low carb' },
                    { value: 'low-fat', label: 'Low fat' },
                    { value: 'high-fiber', label: 'Riche en fibres' },
                  ].map(opt => (
                    <FilterCheckbox
                      key={opt.value}
                      label={opt.label}
                      checked={nutritionFilters.includes(opt.value)}
                      onChange={() =>
                        setNutritionFilters(prev =>
                          prev.includes(opt.value)
                            ? prev.filter(v => v !== opt.value)
                            : [...prev, opt.value]
                        )
                      }
                    />
                  ))}
                </FilterSection>

                {/* Régime alimentaire */}
                <FilterSection title='Régime alimentaire'>
                  {[
                    { value: 'vegan', label: 'Végan' },
                    { value: 'vegetarien', label: 'Végétarien' },
                    { value: 'pesco-vegetarien', label: 'Pesco-végétarien' },
                    { value: 'paleo', label: 'Paléo' },
                  ].map(opt => (
                    <FilterCheckbox
                      key={opt.value}
                      label={opt.label}
                      checked={nutritionFilters.includes(opt.value)}
                      onChange={() =>
                        setNutritionFilters(prev =>
                          prev.includes(opt.value)
                            ? prev.filter(v => v !== opt.value)
                            : [...prev, opt.value]
                        )
                      }
                    />
                  ))}
                </FilterSection>

                {/* Allergènes */}
                <FilterSection title='Allergènes'>
                  {[
                    { value: 'sans-gluten', label: 'Sans gluten' },
                    { value: 'sans-lactose', label: 'Sans lactose' },
                    { value: 'sans-oeuf', label: 'Sans œuf' },
                    { value: 'sans-arachide', label: 'Sans arachide' },
                    {
                      value: 'sans-fruits-a-coque',
                      label: 'Sans fruits à coque',
                    },
                    { value: 'sans-poisson-crustace', label: 'Sans poisson' },
                    { value: 'sans-soja', label: 'Sans soja' },
                  ].map(opt => (
                    <FilterCheckbox
                      key={opt.value}
                      label={opt.label}
                      checked={nutritionFilters.includes(opt.value)}
                      onChange={() =>
                        setNutritionFilters(prev =>
                          prev.includes(opt.value)
                            ? prev.filter(v => v !== opt.value)
                            : [...prev, opt.value]
                        )
                      }
                    />
                  ))}
                </FilterSection>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className='flex-1 overflow-y-auto'>
          {activeTab === 'shopping' ? (
            <ShoppingListView />
          ) : (
            <div className='p-4'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-sm text-gray-500'>
                  {filteredRecipes.length} recette
                  {filteredRecipes.length !== 1 ? 's' : ''}
                </span>
              </div>
              <RecipesGrid
                recipes={filteredRecipes}
                favorites={favoriteIds}
                shoppingListRecipeIds={shoppingRecipeIds}
                cookedRecipeIds={cookedIds}
                onToggleFavorite={handleToggleFavorite}
                onAddToShoppingList={recipe => setShoppingRecipe(recipe)}
                onLogMeal={recipe => setLogMealRecipe(recipe)}
                emptyMessage={getEmptyMessage()}
                emptyIcon={getEmptyIcon()}
                isLoading={isLoading && activeTab === 'discover'}
              />
            </div>
          )}
        </div>
      </div>

      <LogMealModal
        isOpen={!!logMealRecipe}
        recipe={logMealRecipe}
        onClose={() => setLogMealRecipe(null)}
        onConfirm={handleConfirmLogMeal}
        isSubmitting={logRecipeAsMeal.isPending}
      />

      <AddToShoppingListModal
        isOpen={!!shoppingRecipe}
        recipe={shoppingRecipe}
        onClose={() => setShoppingRecipe(null)}
        onConfirm={handleAddToShoppingList}
        isSubmitting={addToShoppingList.isPending}
      />

      <Toast
        isVisible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
}
