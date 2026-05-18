'use client';

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  FoodsHeader,
  FoodsTabs,
  FoodsList,
  ScannerModal,
  type FoodsTab,
} from '@/components/foods';
import { FoodFilterSidebar } from '@/components/foods/FoodFilterSidebar';
import { AddFoodToMealModal } from '@/components/foods/AddFoodToMealModal';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';
import type { Food, SortOption } from '@/types/foods';
import {
  useInfinitePatientFoods,
  useToggleFoodFavorite,
  type PatientFood,
} from '@/hooks/usePatientFoods';

// Map API food to component Food type
function toFood(f: PatientFood): Food {
  return {
    id: f.id,
    name: f.name,
    category: (f.category || 'all') as Food['category'],
    image: f.image || '',
    calories: f.calories,
    protein: f.protein,
    carbs: f.carbs,
    fat: f.fat,
    fiber: f.fiber,
    per: f.per || '100g',
    brand: f.brand,
    portions: [
      { label: '100g', grams: 100 },
      { label: '1 portion (150g)', grams: 150 },
    ],
  };
}

export default function AlimentsPage() {
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [activeTab, setActiveTab] = useState<FoodsTab>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [addToMealFood, setAddToMealFood] = useState<Food | null>(null);
  const [isAddingMeal, setIsAddingMeal] = useState(false);

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

  // API — infinite scroll
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfinitePatientFoods({
      search: searchQuery || undefined,
      category: activeCategory !== 'all' ? activeCategory : undefined,
      sort: sortOption,
      limit: 50,
    });
  const toggleFavorite = useToggleFoodFavorite();

  // Flatten pages
  const allApiFoods = useMemo(
    () => (data?.pages || []).flatMap(page => page.foods),
    [data?.pages]
  );
  const foods = useMemo(() => allApiFoods.map(toFood), [allApiFoods]);
  const totalFoods = data?.pages?.[0]?.pagination?.total || 0;
  const categories = data?.pages?.[0]?.categories || [];
  const favoriteIds = useMemo(
    () => allApiFoods.filter(f => f.isFavorite).map(f => f.id),
    [allApiFoods]
  );

  // Tab filter
  const displayedFoods = useMemo(() => {
    if (activeTab === 'favorites') {
      return foods.filter(f => favoriteIds.includes(f.id));
    }
    return foods;
  }, [foods, favoriteIds, activeTab]);

  // Infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setSearchQuery('');
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortOption(option);
  }, []);

  const handleFoodClick = useCallback((_food: Food) => {
    // No-op for now
  }, []);

  const handleAddToMeal = useCallback(
    async (
      foodId: string,
      mealType: string,
      quantity: number,
      unit: string
    ) => {
      setIsAddingMeal(true);
      try {
        const res = await fetch('/api/protected/meals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            type: mealType,
            consumed_at: new Date().toISOString(),
            foods: [{ food_id: foodId, quantity, unit }],
          }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || 'Erreur');
        }
        setAddToMealFood(null);
        showToast('success', 'Aliment ajouté au repas');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erreur lors de l'ajout";
        showToast('error', 'Erreur', message);
      } finally {
        setIsAddingMeal(false);
      }
    },
    [showToast]
  );

  const handleToggleFavorite = useCallback(
    (foodId: string) => {
      toggleFavorite.mutate(foodId);
    },
    [toggleFavorite]
  );

  return (
    <div className='h-screen flex flex-col'>
      <DashboardHeader />

      <FoodsHeader
        searchQuery={searchQuery}
        recentSearches={recentSearches}
        totalFoods={totalFoods}
        onSearchChange={handleSearchChange}
        onOpenScanner={() => setShowScanner(true)}
        onRecentSearchClick={handleSearchChange}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <FoodsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        favoritesCount={favoriteIds.length}
      />

      {/* Content: Sidebar + List */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className='flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden'
            >
              <div className='w-[260px] py-5 px-4 overflow-y-auto h-full'>
                <FoodFilterSidebar
                  activeCategory={activeCategory}
                  categories={categories}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className='flex-1 overflow-y-auto'>
          {isLoading ? (
            <div className='flex items-center justify-center py-16'>
              <div className='w-8 h-8 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
            </div>
          ) : (
            <div className='p-4'>
              <FoodsList
                foods={displayedFoods}
                favorites={favoriteIds}
                sortOption={sortOption}
                onSortChange={handleSortChange}
                emptyMessage={
                  activeTab === 'favorites'
                    ? 'Aucun aliment favori'
                    : 'Aucun aliment trouvé'
                }
                emptyIcon={activeTab === 'favorites' ? '❤️' : '🔍'}
                onToggleFavorite={handleToggleFavorite}
                onFoodClick={handleFoodClick}
                onAddToMeal={food => setAddToMealFood(food)}
              />

              {/* Infinite scroll sentinel */}
              <div ref={loadMoreRef} className='h-10' />
              {isFetchingNextPage && (
                <div className='flex items-center justify-center py-4'>
                  <Loader2 className='w-5 h-5 animate-spin text-[#1B998B]' />
                </div>
              )}
              {!hasNextPage && displayedFoods.length > 0 && (
                <p className='text-center text-xs text-gray-400 py-4'>
                  Tous les aliments ont été chargés
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
      />

      <AddFoodToMealModal
        isOpen={!!addToMealFood}
        food={addToMealFood}
        onClose={() => setAddToMealFood(null)}
        onConfirm={handleAddToMeal}
        isSubmitting={isAddingMeal}
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
