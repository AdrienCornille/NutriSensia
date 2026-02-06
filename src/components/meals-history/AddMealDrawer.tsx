'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Camera,
  Star,
  ChevronLeft,
  Trash2,
  Pencil,
  Check,
  XIcon,
  Plus,
  Minus,
} from 'lucide-react';
import type {
  MealType,
  FoodItem,
  SelectedFood,
  MealContext,
} from '@/types/meals';
import { calculateTotalNutrition, calculateNutrition } from '@/types/meals';
import type { LoggedMeal } from '@/types/meals-history';
import { mealTypeConfigs } from '@/types/meals-history';
import { formatDateLabel } from '@/lib/date-utils';
import { useFoodSearch, useFoodFavorites } from '@/hooks/useFoods';
import { FoodSearchItem } from './FoodSearchItem';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { QuantitySelectorModal } from './QuantitySelectorModal';
import { PhotoCaptureSection } from './PhotoCaptureSection';
import { NotesAndContextSection } from './NotesAndContextSection';
import { FrequentMealsSection } from './FrequentMealsSection';
import {
  useCreateMeal,
  useUpdateMeal,
  type CreateMealData,
} from '@/hooks/useMeals';
import { mapContextTagsToLocation } from '@/lib/meals-transformers';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';

interface AddMealDrawerProps {
  isOpen: boolean;
  selectedDate: Date;
  preselectedMealType?: MealType | null;
  /** Initial foods for duplication */
  initialFoods?: SelectedFood[];
  /** Meal being edited (edit mode) */
  editingMeal?: LoggedMeal | null;
  onClose: () => void;
  onSubmit: (mealId?: string) => void;
}

type FoodListView = 'default' | 'favorites';

export function AddMealDrawer({
  isOpen,
  selectedDate,
  preselectedMealType,
  initialFoods,
  editingMeal,
  onClose,
  onSubmit,
}: AddMealDrawerProps) {
  const isEditMode = !!editingMeal;
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(
    preselectedMealType ?? null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [foodListView, setFoodListView] = useState<FoodListView>('default');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Quantity selector state
  const [selectedFoodForQuantity, setSelectedFoodForQuantity] =
    useState<FoodItem | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);

  // Added foods with quantities
  const [addedFoods, setAddedFoods] = useState<SelectedFood[]>([]);

  // Photo state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Notes and context state
  const [notes, setNotes] = useState('');
  const [contextTags, setContextTags] = useState<MealContext[]>([]);

  // State for editing food quantity inline
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(0);

  // Calculate total nutrition from added foods
  const totalNutrition = useMemo(() => {
    return calculateTotalNutrition(addedFoods);
  }, [addedFoods]);

  // Fetch food search results from API
  const { data: searchData, isLoading: isSearchLoading } =
    useFoodSearch(searchQuery);
  const searchResults = useMemo(() => {
    if (!searchData) return [];

    // Transform API results to FoodItem format
    return searchData.foods.map(food => ({
      id: food.id,
      name: food.name,
      brand: food.brand,
      emoji: undefined,
      barcode: undefined,
      caloriesPer100g: food.calories_per_100g,
      proteinPer100g: food.protein_per_100g,
      carbsPer100g: food.carbs_per_100g,
      fatPer100g: food.fat_per_100g,
      source: 'database' as const,
    }));
  }, [searchData]);

  // Fetch favorites from API
  const { data: favoritesData } = useFoodFavorites();
  const favoriteFoods = useMemo(() => {
    if (!favoritesData) return [];

    // Transform API favorites to FoodItem format
    return favoritesData.favorites.map(food => ({
      id: food.id,
      name: food.name,
      brand: food.brand,
      emoji: undefined,
      barcode: undefined,
      caloriesPer100g: food.calories_per_100g,
      proteinPer100g: food.protein_per_100g,
      carbsPer100g: food.carbs_per_100g,
      fatPer100g: food.fat_per_100g,
      source: 'database' as const,
    }));
  }, [favoritesData]);

  // For now, use empty array for recent foods (will be implemented in Phase 2)
  const recentFoods: any[] = [];

  const isSearching = searchQuery.trim().length > 0;
  const showMinCharsHint =
    searchQuery.trim().length > 0 && searchQuery.trim().length < 2;

  // Update selected meal type when preselected changes
  React.useEffect(() => {
    if (preselectedMealType) {
      setSelectedMealType(preselectedMealType);
    }
  }, [preselectedMealType]);

  // Populate foods when initialFoods is provided (for duplication)
  React.useEffect(() => {
    if (initialFoods && initialFoods.length > 0) {
      setAddedFoods(initialFoods);
    }
  }, [initialFoods]);

  // Populate all fields when editing an existing meal
  React.useEffect(() => {
    if (editingMeal) {
      setSelectedMealType(editingMeal.type);
      setAddedFoods(editingMeal.foods);
      setPhotoUrl(editingMeal.photoUrl ?? null);
      setNotes(editingMeal.notes ?? '');
      setContextTags(editingMeal.contextTags ?? []);
    }
  }, [editingMeal]);

  const handleClose = () => {
    setSelectedMealType(null);
    setSearchQuery('');
    setFoodListView('default');
    setAddedFoods([]);
    setPhotoUrl(null);
    setNotes('');
    setContextTags([]);
    setSelectedFoodForQuantity(null);
    setIsQuantityModalOpen(false);
    onClose();
  };

  // Toggle context tag
  const handleToggleTag = useCallback((tag: MealContext) => {
    setContextTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  // Open quantity modal when clicking on a food
  const handleAddFood = useCallback((food: FoodItem) => {
    setSelectedFoodForQuantity(food);
    setIsQuantityModalOpen(true);
  }, []);

  // Confirm quantity and add food to list
  const handleConfirmQuantity = useCallback((selectedFood: SelectedFood) => {
    setAddedFoods(prev => [...prev, selectedFood]);
    setSelectedFoodForQuantity(null);
    setIsQuantityModalOpen(false);
    setSearchQuery('');
  }, []);

  // Remove a food from the list
  const handleRemoveFood = useCallback((foodId: string) => {
    setAddedFoods(prev => prev.filter(f => f.id !== foodId));
  }, []);

  // Start editing a food's quantity
  const handleStartEditFood = useCallback((food: SelectedFood) => {
    setEditingFoodId(food.id);
    setEditingQuantity(food.quantity);
  }, []);

  // Cancel editing
  const handleCancelEditFood = useCallback(() => {
    setEditingFoodId(null);
  }, []);

  // Save edited quantity
  const handleSaveEditFood = useCallback(
    (foodId: string) => {
      if (editingQuantity <= 0) return;

      setAddedFoods(prev =>
        prev.map(f => {
          if (f.id === foodId) {
            // Recalculate nutrition based on new quantity using the imported function
            const newNutrition = calculateNutrition(
              {
                id: f.id,
                name: f.name,
                brand: f.brand,
                caloriesPer100g: f.caloriesPer100g,
                proteinPer100g: f.proteinPer100g,
                carbsPer100g: f.carbsPer100g,
                fatPer100g: f.fatPer100g,
              },
              editingQuantity,
              f.unit // Garder l'unité actuelle
            );

            return {
              ...f,
              quantity: editingQuantity,
              calculatedNutrition: newNutrition,
            };
          }
          return f;
        })
      );

      setEditingFoodId(null);
    },
    [editingQuantity]
  );

  // Duplicate a frequent meal (add all its foods)
  const handleDuplicateFrequentMeal = useCallback(
    (foods: SelectedFood[], mealType: MealType) => {
      // Set the meal type if not already set
      setSelectedMealType(mealType);
      // Add all foods from the frequent meal
      setAddedFoods(foods);
    },
    []
  );

  // API mutations
  const createMeal = useCreateMeal();
  const updateMeal = useUpdateMeal(editingMeal?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastTitle, setToastTitle] = useState('');

  const showToast = (type: ToastType, title: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastVisible(true);
  };

  const handleSubmit = async () => {
    if (!selectedMealType || addedFoods.length === 0) {
      showToast(
        'warning',
        'Veuillez sélectionner un type de repas et au moins un aliment'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Build the payload
      const payload: CreateMealData = {
        type: selectedMealType,
        consumed_at: new Date(selectedDate).toISOString(),
        notes: notes.trim() || undefined,
        location: mapContextTagsToLocation(contextTags) as any,
        photo_url: photoUrl || undefined,
        foods: addedFoods.map(food => ({
          food_id: food.id,
          quantity: food.quantity,
          unit: food.unit,
        })),
      };

      if (isEditMode && editingMeal) {
        // UPDATE mode
        await updateMeal.mutateAsync(payload);
        showToast('success', 'Repas modifié avec succès');
      } else {
        // CREATE mode
        await createMeal.mutateAsync(payload);
        showToast('success', 'Repas ajouté avec succès');
      }

      // Notify parent of success
      onSubmit();

      // Close drawer
      handleClose();
    } catch (error) {
      console.error('Error submitting meal:', error);
      showToast('error', "Erreur lors de l'enregistrement du repas");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className='fixed inset-0 z-50 flex justify-end'>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='absolute inset-0 bg-black/50'
              onClick={handleClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='relative w-full max-w-lg bg-white shadow-xl overflow-y-auto'
            >
              {/* Drawer header */}
              <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10'>
                <div>
                  <h2 className='text-lg font-semibold text-gray-800'>
                    {isEditMode ? 'Modifier le repas' : 'Ajouter un repas'}
                  </h2>
                  <p className='text-sm text-gray-500'>
                    {formatDateLabel(selectedDate)}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Meal type selection */}
              <div className='p-6'>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>
                  Type de repas
                </h3>
                <div className='grid grid-cols-2 gap-3'>
                  {mealTypeConfigs.map(config => (
                    <button
                      key={config.type}
                      onClick={() => setSelectedMealType(config.type)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedMealType === config.type
                          ? 'border-[#1B998B] bg-[#1B998B]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className='text-2xl'>{config.icon}</span>
                      <p className='font-medium text-gray-800 mt-2'>
                        {config.label}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {config.timeRange}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Food search - shown when meal type is selected */}
              {selectedMealType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className='px-6 pb-6'
                >
                  <h3 className='text-sm font-medium text-gray-700 mb-3'>
                    Ajouter des aliments
                  </h3>
                  {/* Search input */}
                  <div className='relative mb-4'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                    <input
                      type='text'
                      placeholder='Rechercher un aliment (min. 3 caractères)...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:border-transparent'
                    />
                  </div>

                  {/* Minimum characters hint */}
                  {showMinCharsHint && (
                    <p className='text-sm text-gray-400 mb-4 text-center'>
                      Tapez au moins 3 caractères pour rechercher
                    </p>
                  )}

                  {/* Search results */}
                  {searchResults.length > 0 && (
                    <div className='mb-4'>
                      <p className='text-sm text-gray-500 mb-2'>
                        {searchResults.length} résultat
                        {searchResults.length > 1 ? 's' : ''}
                      </p>
                      <div className='space-y-2 max-h-64 overflow-y-auto'>
                        {searchResults.map(food => (
                          <FoodSearchItem
                            key={food.id}
                            food={food}
                            onAdd={handleAddFood}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading indicator */}
                  {isSearchLoading && (
                    <div className='flex justify-center items-center py-8'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                    </div>
                  )}

                  {/* No results */}
                  {isSearching &&
                    !showMinCharsHint &&
                    !isSearchLoading &&
                    searchResults.length === 0 && (
                      <p className='text-sm text-gray-400 mb-4 text-center'>
                        Aucun aliment trouvé pour &quot;{searchQuery}&quot;
                      </p>
                    )}

                  {/* Quick add buttons - only show when not searching */}
                  {!isSearching && foodListView === 'default' && (
                    <div className='flex gap-2 mb-4'>
                      <button
                        onClick={() => setIsScannerOpen(true)}
                        className='flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors'
                      >
                        <Camera className='w-4 h-4' />
                        Scan code-barres
                      </button>
                      <button
                        onClick={() => setFoodListView('favorites')}
                        className='flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors'
                      >
                        <Star className='w-4 h-4' />
                        Favoris
                      </button>
                    </div>
                  )}

                  {/* Frequent meals section - only show when not searching, no foods added, and not editing */}
                  {!isSearching &&
                    foodListView === 'default' &&
                    addedFoods.length === 0 &&
                    !isEditMode && (
                      <FrequentMealsSection
                        filterType={selectedMealType}
                        maxItems={3}
                        onSelectMeal={handleDuplicateFrequentMeal}
                      />
                    )}

                  {/* Favorites view */}
                  {!isSearching && foodListView === 'favorites' && (
                    <div>
                      <button
                        onClick={() => setFoodListView('default')}
                        className='flex items-center gap-1 text-sm text-[#1B998B] font-medium mb-3 hover:underline'
                      >
                        <ChevronLeft className='w-4 h-4' />
                        Retour
                      </button>
                      <p className='text-sm text-gray-500 mb-2'>Favoris</p>
                      <div className='space-y-2'>
                        {favoriteFoods.map(food => (
                          <FoodSearchItem
                            key={food.id}
                            food={food}
                            onAdd={handleAddFood}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent foods - only show on default view when not searching */}
                  {!isSearching && foodListView === 'default' && (
                    <div>
                      <p className='text-sm text-gray-500 mb-2'>Récents</p>
                      <div className='space-y-2'>
                        {recentFoods.map(food => (
                          <FoodSearchItem
                            key={food.id}
                            food={food}
                            onAdd={handleAddFood}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Added foods list */}
              {addedFoods.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='px-6 pb-6'
                >
                  <div className='border-t border-gray-200 pt-4'>
                    <h3 className='text-sm font-medium text-gray-700 mb-3'>
                      Aliments ajoutés ({addedFoods.length})
                    </h3>
                    <div className='space-y-2'>
                      {addedFoods.map(food => (
                        <div
                          key={`${food.id}-${food.quantity}`}
                          className='flex items-center gap-3 p-3 bg-[#1B998B]/5 border border-[#1B998B]/20 rounded-xl'
                        >
                          <div className='w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm'>
                            <span className='text-xl'>
                              {food.emoji || '🍽️'}
                            </span>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-800 truncate'>
                              {food.name}
                            </p>
                            {editingFoodId === food.id ? (
                              // Editing mode
                              <div className='flex items-center gap-2 mt-1'>
                                <button
                                  onClick={() =>
                                    setEditingQuantity(
                                      Math.max(1, editingQuantity - 10)
                                    )
                                  }
                                  className='p-0.5 hover:bg-white rounded'
                                >
                                  <Minus className='w-3 h-3 text-gray-600' />
                                </button>
                                <input
                                  type='number'
                                  value={editingQuantity}
                                  onChange={e =>
                                    setEditingQuantity(Number(e.target.value))
                                  }
                                  className='w-14 px-1 py-0.5 text-xs border border-gray-300 rounded text-center'
                                  min='1'
                                />
                                <span className='text-xs text-gray-600'>
                                  {food.unit}
                                </span>
                                <button
                                  onClick={() =>
                                    setEditingQuantity(editingQuantity + 10)
                                  }
                                  className='p-0.5 hover:bg-white rounded'
                                >
                                  <Plus className='w-3 h-3 text-gray-600' />
                                </button>
                                <button
                                  onClick={() => handleSaveEditFood(food.id)}
                                  className='p-1 bg-[#1B998B] text-white rounded hover:bg-[#158f7d]'
                                  title='Sauvegarder'
                                >
                                  <Check className='w-3 h-3' />
                                </button>
                                <button
                                  onClick={handleCancelEditFood}
                                  className='p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
                                  title='Annuler'
                                >
                                  <X className='w-3 h-3' />
                                </button>
                              </div>
                            ) : (
                              // Display mode
                              <p className='text-xs text-gray-500'>
                                {food.quantity}
                                {food.unit} •{' '}
                                {food.calculatedNutrition.calories} kcal
                              </p>
                            )}
                          </div>
                          {editingFoodId !== food.id && (
                            <div className='flex gap-1'>
                              <button
                                onClick={() => handleStartEditFood(food)}
                                className='p-2 text-gray-400 hover:text-[#1B998B] hover:bg-[#1B998B]/10 rounded-lg transition-colors'
                                title='Modifier la quantité'
                              >
                                <Pencil className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() => handleRemoveFood(food.id)}
                                className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                                title='Supprimer'
                              >
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Total nutrition summary */}
                    <div className='mt-4 p-3 bg-gray-50 rounded-xl'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm text-gray-600'>
                          Total calories
                        </span>
                        <span className='text-lg font-bold text-[#1B998B]'>
                          {totalNutrition.calories} kcal
                        </span>
                      </div>
                      <div className='flex gap-4 text-xs text-gray-500'>
                        <span>P: {totalNutrition.protein}g</span>
                        <span>G: {totalNutrition.carbs}g</span>
                        <span>L: {totalNutrition.fat}g</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Photo section - shown when meal type is selected */}
              {selectedMealType && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='px-6 pb-6'
                >
                  <div
                    className={
                      addedFoods.length > 0
                        ? ''
                        : 'border-t border-gray-200 pt-4'
                    }
                  >
                    <PhotoCaptureSection
                      photoUrl={photoUrl}
                      onPhotoChange={setPhotoUrl}
                    />
                  </div>
                </motion.div>
              )}

              {/* Notes and context section - shown when meal type is selected */}
              {selectedMealType && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='px-6 pb-6'
                >
                  <div className='border-t border-gray-200 pt-4'>
                    <NotesAndContextSection
                      notes={notes}
                      contextTags={contextTags}
                      onNotesChange={setNotes}
                      onToggleTag={handleToggleTag}
                    />
                  </div>
                </motion.div>
              )}

              {/* Footer */}
              <div className='sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4'>
                <div className='flex gap-3'>
                  <button
                    onClick={handleClose}
                    className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      !selectedMealType ||
                      addedFoods.length === 0 ||
                      isSubmitting
                    }
                    className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#147569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                  >
                    {isSubmitting ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        {isEditMode
                          ? 'Enregistrer les modifications'
                          : 'Enregistrer'}
                        {addedFoods.length > 0 && (
                          <span className='ml-1'>
                            ({totalNutrition.calories} kcal)
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onFoodFound={handleAddFood}
      />

      {/* Quantity Selector Modal */}
      <QuantitySelectorModal
        isOpen={isQuantityModalOpen}
        food={selectedFoodForQuantity}
        onClose={() => {
          setIsQuantityModalOpen(false);
          setSelectedFoodForQuantity(null);
        }}
        onConfirm={handleConfirmQuantity}
      />

      {/* Toast Notifications */}
      <Toast
        isVisible={toastVisible}
        type={toastType}
        title={toastTitle}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}

export default AddMealDrawer;
