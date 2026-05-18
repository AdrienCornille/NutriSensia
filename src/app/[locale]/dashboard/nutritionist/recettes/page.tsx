'use client';

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  X,
  BarChart3,
  Trash2,
  Eye,
  EyeOff,
  Send,
  ChefHat,
  SlidersHorizontal,
} from 'lucide-react';
import {
  useNutritionistRecipes,
  useCreateRecipe,
  useUpdateRecipe,
  useDeleteRecipe,
  usePublishRecipe,
  useDuplicateRecipe,
  useUpsertRecipeIngredients,
  useUpsertRecipeSteps,
  useRecipeCategories,
  useRecipeTagGroups,
  useAssignRecipe,
} from '@/hooks/useNutritionistRecipes';
import { RecipeList } from '@/components/nutritionist/recipes/RecipeList';
import { RecipeForm } from '@/components/nutritionist/recipes/RecipeForm';
import { RecipeAssignModal } from '@/components/nutritionist/recipes/RecipeAssignModal';
import { RecipeStatsPanel } from '@/components/nutritionist/recipes/RecipeStatsPanel';
import { Toast, ToastType } from '@/components/suivi/shared/Toast';
import {
  NutriRecipe,
  RecipeDifficulty,
  RecipeStatus,
  transformRecipeFromDB,
} from '@/types/recipes';
import { IngredientFormItem } from '@/components/nutritionist/recipes/RecipeIngredientEditor';
import { StepFormItem } from '@/components/nutritionist/recipes/RecipeStepEditor';
import { useViewHistory } from '@/hooks/useViewHistory';

import {
  FilterSection,
  FilterCheckbox,
  FilterRangeSlider,
} from '@/components/recipes/RecipeFilterSidebar';

// ==================== TYPES ====================

type View = 'list' | 'create' | 'edit';

// Confirmation action types
type ConfirmAction =
  | { type: 'delete'; recipe: NutriRecipe }
  | { type: 'publish'; recipe: NutriRecipe }
  | { type: 'unpublish'; recipe: NutriRecipe };

const CONFIRM_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    title: string;
    message: string;
    confirmLabel: string;
    confirmClass: string;
    iconBg: string;
  }
> = {
  delete: {
    icon: <Trash2 className='w-6 h-6' />,
    title: 'Supprimer la recette ?',
    message:
      'Cette action est irréversible. La recette sera définitivement supprimée.',
    confirmLabel: 'Supprimer',
    confirmClass: 'bg-red-600 hover:bg-red-700',
    iconBg: 'bg-red-50 text-red-600',
  },
  publish: {
    icon: <Eye className='w-6 h-6' />,
    title: 'Publier la recette ?',
    message:
      "La recette sera visible par vos patients. Assurez-vous que le titre, les ingrédients, les étapes et l'image sont renseignés.",
    confirmLabel: 'Publier',
    confirmClass: 'bg-[#1B998B] hover:bg-[#158a7d]',
    iconBg: 'bg-[#1B998B]/10 text-[#1B998B]',
  },
  unpublish: {
    icon: <EyeOff className='w-6 h-6' />,
    title: 'Dé-publier la recette ?',
    message: 'La recette ne sera plus visible par vos patients.',
    confirmLabel: 'Dé-publier',
    confirmClass: 'bg-orange-500 hover:bg-orange-600',
    iconBg: 'bg-orange-50 text-orange-600',
  },
};

export default function NutritionistRecipesPage() {
  const [view, setView] = useState<View>('list');
  const editingRecipeRef = useRef<NutriRecipe | null>(null);
  const [recipeRevision, setRecipeRevision] = useState(0);
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync URL → state on mount/URL change
  const urlRecipeId = searchParams.get('id');
  const urlMode = searchParams.get('mode'); // 'create' or absent
  const lastLoadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (urlMode === 'create' && view !== 'create') {
      setView('create');
    } else if (urlRecipeId && urlRecipeId !== lastLoadedIdRef.current) {
      // Load recipe from URL and switch to edit
      lastLoadedIdRef.current = urlRecipeId;
      (async () => {
        try {
          const res = await fetch(
            `/api/protected/nutritionist/recipes/${urlRecipeId}`,
            { credentials: 'include' }
          );
          if (res.ok) {
            const json = await res.json();
            const recipe = transformRecipeFromDB(json.data);
            editingRecipeRef.current = recipe;
            setView('edit');
          }
        } catch {
          // Silent fail — stay on list
        }
      })();
    } else if (!urlRecipeId && !urlMode && view !== 'list') {
      setView('list');
      editingRecipeRef.current = null;
      lastLoadedIdRef.current = null;
    }
  }, [urlRecipeId, urlMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync state → URL
  const updateUrl = useCallback(
    (newView: View, recipeId?: string) => {
      if (newView === 'list') {
        router.replace(pathname);
      } else if (newView === 'create') {
        router.replace(`${pathname}?mode=create`);
      } else if (recipeId) {
        router.replace(`${pathname}?id=${recipeId}`);
      }
    },
    [router, pathname]
  );

  // Wrapper around setView that also updates URL
  const setViewWithUrl = useCallback(
    (newView: View, recipeId?: string) => {
      setView(newView);
      updateUrl(newView, recipeId);
    },
    [updateUrl]
  );

  // View history
  const { goBack } = useViewHistory<View>(
    view,
    'list',
    () => {
      setViewWithUrl('list');
      editingRecipeRef.current = null;
    },
    v => {
      if (v === 'edit' && editingRecipeRef.current)
        setViewWithUrl('edit', editingRecipeRef.current.id);
      else if (v === 'create') setViewWithUrl('create');
    }
  );

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [nutritionFilters, setNutritionFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Nutrition range sliders (per serving)
  const [calRange, setCalRange] = useState<[number, number]>([0, 800]);
  const [protRange, setProtRange] = useState<[number, number]>([0, 60]);
  const [carbRange, setCarbRange] = useState<[number, number]>([0, 100]);
  const [fatRange, setFatRange] = useState<[number, number]>([0, 50]);

  // Modals
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [assignRecipeTarget, setAssignRecipeTarget] =
    useState<NutriRecipe | null>(null);

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

  // Build auto-tags filter array
  const activeAutoTags = useMemo(() => {
    const tags: string[] = [];
    if (timeFilter) tags.push(timeFilter);
    tags.push(...nutritionFilters);
    return tags;
  }, [timeFilter, nutritionFilters]);

  // Queries
  const { data, isLoading } = useNutritionistRecipes({
    status: (statusFilter as RecipeStatus) || undefined,
    difficulty: (difficultyFilter as RecipeDifficulty) || undefined,
    autoTags: activeAutoTags.length > 0 ? activeAutoTags : undefined,
    search: searchQuery || undefined,
    limit: 50,
  });
  const { data: categories = [] } = useRecipeCategories();
  const { data: tagGroupsData } = useRecipeTagGroups();
  const tagGroups = tagGroupsData?.groups || [];

  // Mutations
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const deleteRecipe = useDeleteRecipe();
  const publishRecipe = usePublishRecipe();
  const duplicateRecipe = useDuplicateRecipe();
  const upsertIngredients = useUpsertRecipeIngredients();
  const upsertSteps = useUpsertRecipeSteps();
  const assignRecipe = useAssignRecipe();

  const allRecipes = data?.recipes || [];

  // Client-side nutrition filtering (per serving, range sliders)
  const hasNutritionFilter =
    calRange[0] > 0 ||
    calRange[1] < 800 ||
    protRange[0] > 0 ||
    protRange[1] < 60 ||
    carbRange[0] > 0 ||
    carbRange[1] < 100 ||
    fatRange[0] > 0 ||
    fatRange[1] < 50;

  const recipes = useMemo(() => {
    if (!hasNutritionFilter) return allRecipes;

    return allRecipes.filter(recipe => {
      let cal = recipe.calories;
      let prot = recipe.proteinG;
      let carb = recipe.carbsG;
      let fat = recipe.fatG;

      if (cal === null) {
        let eCal = 0,
          eProt = 0,
          eCarb = 0,
          eFat = 0;
        let hasData = false;
        for (const ing of recipe.ingredients) {
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
      const s = recipe.servings || 1;
      const calPerS = cal / s;
      const protPerS = (prot || 0) / s;
      const carbPerS = (carb || 0) / s;
      const fatPerS = (fat || 0) / s;

      if (calPerS < calRange[0] || calPerS > calRange[1]) return false;
      if (protPerS < protRange[0] || protPerS > protRange[1]) return false;
      if (carbPerS < carbRange[0] || carbPerS > carbRange[1]) return false;
      if (fatPerS < fatRange[0] || fatPerS > fatRange[1]) return false;
      return true;
    });
  }, [
    allRecipes,
    hasNutritionFilter,
    calRange,
    protRange,
    carbRange,
    fatRange,
  ]);

  // Navigation
  const handleCreate = useCallback(() => {
    editingRecipeRef.current = null;
    setViewWithUrl('create');
  }, [setViewWithUrl]);

  const handleEdit = useCallback(
    async (recipe: NutriRecipe) => {
      // Set immediately for fast UI response
      editingRecipeRef.current = recipe;
      setViewWithUrl('edit', recipe.id);
      // Fetch fresh data in background to ensure auto-tags reflect latest DB state
      try {
        const res = await fetch(
          `/api/protected/nutritionist/recipes/${recipe.id}`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const json = await res.json();
          const fresh = transformRecipeFromDB(json.data);
          editingRecipeRef.current = fresh;
          setRecipeRevision(r => r + 1);
        }
      } catch {
        // Silent fail — list data is used as fallback
      }
    },
    [setViewWithUrl]
  );

  const handleBack = useCallback(() => {
    setConfirmAction(null);
    editingRecipeRef.current = null;
    setView('list');
    router.replace(pathname);
  }, [router, pathname]);

  // CRUD
  const handleSave = useCallback(
    async (formData: {
      title: string;
      description: string;
      category_id: string;
      difficulty: string;
      prep_time_minutes: number;
      cook_time_minutes: number;
      servings: number;
      image_url: string;
      tips: string;
      tag_ids?: string[];
    }) => {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
        prep_time_minutes: formData.prep_time_minutes,
        cook_time_minutes: formData.cook_time_minutes,
        servings: formData.servings,
        image_url: formData.image_url || null,
        tips: formData.tips || null,
        tags: formData.tag_ids || [],
      };

      if (view === 'create') {
        const result = await createRecipe.mutateAsync(payload);
        editingRecipeRef.current = result;
        setViewWithUrl('edit', result.id);
        // No toast here — shown at the end of the save flow by RecipeForm
        return result;
      } else if (editingRecipeRef.current) {
        const result = await updateRecipe.mutateAsync({
          recipeId: editingRecipeRef.current.id,
          data: payload,
        });
        editingRecipeRef.current = result;
        // No toast here — shown at the end of the save flow by RecipeForm
        return result;
      }
    },
    [view, createRecipe, updateRecipe, showToast]
  );

  const handleSaveIngredients = useCallback(
    async (recipeId: string, ingredients: IngredientFormItem[]) => {
      await upsertIngredients.mutateAsync({
        recipeId,
        data: {
          ingredients: ingredients.map((ing, idx) => ({
            food_id: ing.food_id,
            name: ing.name,
            quantity: ing.quantity,
            quantity_value: ing.quantity_value,
            quantity_unit: ing.quantity_unit,
            is_optional: ing.is_optional,
            substitution_notes: ing.substitution_notes,
            group_name: ing.group_name,
            display_order: idx,
          })),
        },
      });
    },
    [upsertIngredients]
  );

  const handleSaveSteps = useCallback(
    async (recipeId: string, steps: StepFormItem[]) => {
      if (steps.length === 0) return;
      await upsertSteps.mutateAsync({
        recipeId,
        data: {
          steps: steps.map((step, idx) => ({
            step_number: idx + 1,
            instruction: step.instruction,
            duration_minutes: step.duration_minutes,
            image_url: step.image_url,
            tips: step.tips,
          })),
        },
      });
    },
    [upsertSteps]
  );

  // Refetch recipe after ingredients/steps save to get fresh auto-tags
  const handleAfterSave = useCallback(
    async (recipeId: string) => {
      try {
        const res = await fetch(
          `/api/protected/nutritionist/recipes/${recipeId}`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const json = await res.json();
          const fresh = transformRecipeFromDB(json.data);
          editingRecipeRef.current = fresh;
          setRecipeRevision(r => r + 1);
        }
        // Invalidate list cache so reopening the recipe from the list shows fresh data
        await queryClient.invalidateQueries({
          queryKey: ['nutritionist-recipes'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['nutritionist-recipe', recipeId],
        });
      } catch (err) {
        console.error('[handleAfterSave] error:', err);
      }
    },
    [queryClient]
  );

  // Confirm action handler
  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'delete') {
        await deleteRecipe.mutateAsync(confirmAction.recipe.id);
        showToast(
          'success',
          'Recette supprimée',
          `"${confirmAction.recipe.title}" a été supprimée.`
        );
      } else if (confirmAction.type === 'publish') {
        const result = await publishRecipe.mutateAsync(confirmAction.recipe.id);
        if (editingRecipeRef.current?.id === confirmAction.recipe.id) {
          editingRecipeRef.current = result;
        }
        showToast(
          'success',
          'Recette publiée',
          `"${confirmAction.recipe.title}" est maintenant visible par vos patients.`
        );
      } else if (confirmAction.type === 'unpublish') {
        const result = await publishRecipe.mutateAsync(confirmAction.recipe.id);
        if (editingRecipeRef.current?.id === confirmAction.recipe.id) {
          editingRecipeRef.current = result;
        }
        showToast('success', 'Recette dé-publiée');
      }
    } catch (err) {
      showToast(
        'error',
        'Erreur',
        err instanceof Error ? err.message : 'Une erreur est survenue'
      );
    }
    setConfirmAction(null);
  }, [confirmAction, deleteRecipe, publishRecipe, showToast]);

  const handlePublishClick = useCallback((recipe: NutriRecipe) => {
    setConfirmAction({
      type: recipe.status === 'draft' ? 'publish' : 'unpublish',
      recipe,
    });
  }, []);

  const handleDeleteClick = useCallback((recipe: NutriRecipe) => {
    setConfirmAction({ type: 'delete', recipe });
  }, []);

  const handleDuplicate = useCallback(
    async (recipe: NutriRecipe) => {
      try {
        const result = await duplicateRecipe.mutateAsync({
          recipeId: recipe.id,
          data: { new_title: `${recipe.title} (copie)` },
        });
        showToast(
          'success',
          'Recette dupliquée',
          `"${result.title}" a été créée.`
        );
        handleEdit(result);
      } catch (err) {
        showToast(
          'error',
          'Erreur',
          err instanceof Error ? err.message : 'Erreur lors de la duplication'
        );
      }
    },
    [duplicateRecipe, handleEdit, showToast]
  );

  const handleAssign = useCallback(
    async (patientIds: string[], note: string | null) => {
      if (!assignRecipeTarget) return;
      try {
        await assignRecipe.mutateAsync({
          recipeId: assignRecipeTarget.id,
          data: { patient_ids: patientIds, note },
        });
        showToast(
          'success',
          'Recette recommandée',
          `Envoyée à ${patientIds.length} patient${patientIds.length > 1 ? 's' : ''}.`
        );
      } catch (err) {
        showToast(
          'error',
          'Erreur',
          err instanceof Error ? err.message : 'Erreur'
        );
      }
    },
    [assignRecipeTarget, assignRecipe, showToast]
  );

  const handlePublishFromForm = useCallback(
    async (recipeId: string) => {
      // Publish directly — the nutritionist already confirmed by clicking "Publier" in the form.
      // No need for a second confirmation modal.
      try {
        const result = await publishRecipe.mutateAsync(recipeId);
        if (editingRecipeRef.current?.id === recipeId) {
          editingRecipeRef.current = result;
          setRecipeRevision(r => r + 1);
        }
        const isPublished = result?.status === 'published';
        showToast(
          'success',
          isPublished ? 'Recette publiée' : 'Recette dé-publiée',
          isPublished
            ? 'Elle est maintenant visible par vos patients.'
            : undefined
        );
      } catch (err) {
        showToast(
          'error',
          'Erreur',
          err instanceof Error ? err.message : 'Une erreur est survenue'
        );
      }
    },
    [publishRecipe, showToast]
  );

  // ==================== RENDER ====================

  // Edit/Create view — full screen like ContentForm
  if (view !== 'list') {
    return (
      <>
        <RecipeForm
          key={editingRecipeRef.current?.id || 'new'}
          recipe={view === 'edit' ? editingRecipeRef.current : null}
          onSave={handleSave}
          onSaveIngredients={handleSaveIngredients}
          onSaveSteps={handleSaveSteps}
          onPublish={handlePublishFromForm}
          onAfterSave={handleAfterSave}
          onSavedAsDraft={() => showToast('success', 'Recette enregistrée')}
          onBack={handleBack}
          isSaving={
            createRecipe.isPending ||
            updateRecipe.isPending ||
            upsertIngredients.isPending ||
            upsertSteps.isPending
          }
          isPublishing={publishRecipe.isPending}
          categories={categories}
          tagGroups={tagGroups}
          onFoodCreated={name =>
            showToast(
              'success',
              'Ingrédient créé',
              `"${name}" a été ajouté à la base et à la recette.`
            )
          }
          onBadgesOverridden={() =>
            showToast(
              'success',
              'Badges corrigés',
              'Les badges automatiques ont été mis à jour.'
            )
          }
        />
        <Toast
          isVisible={toast.visible}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={hideToast}
        />
      </>
    );
  }

  // List view
  return (
    <div className='h-screen flex flex-col bg-gray-50'>
      {/* ─── Header (matches contenu page) ─── */}
      <div className='bg-white border-b border-gray-200 px-8'>
        <div className='flex items-center justify-between w-full h-[93px]'>
          <h1 className='text-xl font-semibold text-gray-900'>Recettes</h1>
          <div className='flex items-center gap-2'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Rechercher...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-48 pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-all'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full'
                >
                  <X className='w-3.5 h-3.5 text-gray-400' />
                </button>
              )}
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
                showFilters
                  ? 'bg-[#1B998B]/10 border-[#1B998B]/30 text-[#1B998B]'
                  : 'text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className='w-4 h-4' />
              <span className='hidden sm:inline'>Filtres</span>
            </button>

            {/* Stats */}
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
                showStats
                  ? 'bg-[#1B998B]/10 border-[#1B998B]/30 text-[#1B998B]'
                  : 'text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className='w-4 h-4' />
              <span className='hidden sm:inline'>Stats</span>
            </button>

            {/* Create */}
            <button
              onClick={handleCreate}
              className='flex items-center gap-2 px-4 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors text-sm font-medium'
            >
              <Plus className='w-4 h-4' />
              Nouvelle recette
            </button>
          </div>
        </div>
      </div>

      {/* ─── Content: Sidebar filters + Grid ─── */}
      <div className='flex flex-1 overflow-hidden'>
        {/* ─── Filter Sidebar ─── */}
        <AnimatePresence>
          {showFilters && (
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
                  {(statusFilter ||
                    difficultyFilter ||
                    timeFilter ||
                    nutritionFilters.length > 0 ||
                    hasNutritionFilter) && (
                    <button
                      onClick={() => {
                        setStatusFilter('');
                        setDifficultyFilter('');
                        setTimeFilter('');
                        setNutritionFilters([]);
                        setCalRange([0, 800]);
                        setProtRange([0, 60]);
                        setCarbRange([0, 100]);
                        setFatRange([0, 50]);
                      }}
                      className='text-[10px] text-[#1B998B] hover:underline'
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>

                {/* Statut */}
                <FilterSection title='Statut'>
                  {[
                    { value: 'draft', label: 'Brouillon' },
                    { value: 'published', label: 'Publié' },
                  ].map(opt => (
                    <FilterCheckbox
                      key={opt.value}
                      label={opt.label}
                      checked={statusFilter === opt.value}
                      onChange={() =>
                        setStatusFilter(
                          statusFilter === opt.value ? '' : opt.value
                        )
                      }
                    />
                  ))}
                </FilterSection>

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

                {/* Nutrition par portion (range sliders) */}
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

        {/* ─── Main content ─── */}
        <div className='flex-1 overflow-y-auto'>
          {/* Stats Panel */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='overflow-hidden'
              >
                <div className='px-8 py-4 bg-gray-50'>
                  <RecipeStatsPanel
                    onOpenRecipe={async id => {
                      try {
                        const res = await fetch(
                          `/api/protected/nutritionist/recipes/${id}`,
                          { credentials: 'include' }
                        );
                        if (res.ok) {
                          const json = await res.json();
                          const recipe = transformRecipeFromDB(json.data);
                          handleEdit(recipe);
                        }
                      } catch {
                        /* silent */
                      }
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recipe count + Grid */}
          <div className='px-8 py-6'>
            <div className='flex items-center justify-between mb-4'>
              <span className='text-sm text-gray-500'>
                {recipes.length} recette{recipes.length !== 1 ? 's' : ''}
              </span>
            </div>
            <RecipeList
              recipes={recipes}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onPublish={handlePublishClick}
              onDuplicate={handleDuplicate}
              onAssign={recipe => setAssignRecipeTarget(recipe)}
            />
          </div>
        </div>
      </div>

      {/* ─── Confirmation Modal ─── */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'
            >
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${CONFIRM_CONFIG[confirmAction.type].iconBg}`}
                  >
                    {CONFIRM_CONFIG[confirmAction.type].icon}
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {CONFIRM_CONFIG[confirmAction.type].title}
                  </h3>
                </div>
                <button
                  onClick={() => setConfirmAction(null)}
                  className='p-1 hover:bg-gray-100 rounded-full'
                >
                  <X className='w-5 h-5 text-gray-400' />
                </button>
              </div>
              <p className='text-sm text-gray-600 mb-2'>
                <strong>{confirmAction.recipe.title}</strong>
              </p>
              <p className='text-sm text-gray-500 mb-6'>
                {CONFIRM_CONFIG[confirmAction.type].message}
              </p>
              <div className='flex justify-end gap-2'>
                <button
                  onClick={() => setConfirmAction(null)}
                  className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={deleteRecipe.isPending || publishRecipe.isPending}
                  className={`px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 ${CONFIRM_CONFIG[confirmAction.type].confirmClass}`}
                >
                  {CONFIRM_CONFIG[confirmAction.type].confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Assign Modal ─── */}
      <RecipeAssignModal
        isOpen={!!assignRecipeTarget}
        recipeTitle={assignRecipeTarget?.title || ''}
        onClose={() => setAssignRecipeTarget(null)}
        onAssign={handleAssign}
        isSubmitting={assignRecipe.isPending}
      />

      {/* ─── Toast ─── */}
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
