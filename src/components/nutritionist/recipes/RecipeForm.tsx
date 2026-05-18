'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Save,
  Clock,
  Users,
  Loader2,
  Upload,
  Trash2,
  Send,
  EyeOff,
  Eye,
  ChefHat,
} from 'lucide-react';
import {
  NutriRecipe,
  RecipeDifficulty,
  DIFFICULTY_LABELS,
} from '@/types/recipes';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import {
  RecipeIngredientEditor,
  IngredientFormItem,
} from './RecipeIngredientEditor';
import { RecipePreviewModal } from './RecipePreviewModal';
import { RecipeStepEditor, StepFormItem } from './RecipeStepEditor';
import { RecipeFormSidebar } from './RecipeFormSidebar';
import { RecipeTagSelector } from './RecipeTagSelector';
import { AutoBadgeOverrideModal } from './AutoBadgeOverrideModal';
import {
  UncertainBadgesModal,
  UncertainDecisions,
} from './UncertainBadgesModal';
import { computeAllAutoTags } from '@/lib/recipe-auto-tags';

// ==================== TYPES ====================

export interface RecipeFormData {
  title: string;
  description: string;
  category_id: string; // DEPRECATED — kept for backward compat
  difficulty: RecipeDifficulty;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  image_url: string;
  tips: string;
  tag_ids: string[];
}

export interface TagGroupForForm {
  slug: string;
  label: string;
  color: string;
  tags: {
    id: string;
    slug: string;
    name_fr: string;
    color: string | null;
    icon: string | null;
  }[];
}

interface RecipeFormProps {
  recipe: NutriRecipe | null;
  onSave: (data: RecipeFormData) => Promise<NutriRecipe | void>;
  onSaveIngredients: (
    recipeId: string,
    ingredients: IngredientFormItem[]
  ) => Promise<void>;
  onSaveSteps: (recipeId: string, steps: StepFormItem[]) => Promise<void>;
  onPublish: (recipeId: string) => Promise<void>;
  onAfterSave?: (recipeId: string) => Promise<void>;
  onSavedAsDraft?: () => void;
  onBack: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  categories: {
    id: string;
    slug: string;
    name_fr: string;
    emoji: string | null;
  }[]; // DEPRECATED
  tagGroups?: TagGroupForForm[];
  onFoodCreated?: (name: string) => void;
  onBadgesOverridden?: () => void;
}

// ==================== COMPONENT ====================

export function RecipeForm({
  recipe,
  onSave,
  onSaveIngredients,
  onSaveSteps,
  onPublish,
  onAfterSave,
  onSavedAsDraft,
  onBack,
  isSaving,
  isPublishing,
  categories,
  tagGroups = [],
  onFoodCreated,
  onBadgesOverridden,
}: RecipeFormProps) {
  const isEdit = !!recipe;

  const initialFormRef = useRef<RecipeFormData>({
    title: recipe?.title || '',
    description: recipe?.description || '',
    category_id: '',
    difficulty: recipe?.difficulty || 'easy',
    prep_time_minutes: recipe?.prepTimeMinutes || 0,
    cook_time_minutes: recipe?.cookTimeMinutes || 0,
    servings: recipe?.servings || 2,
    image_url: recipe?.imageUrl || '',
    tips: recipe?.tips || '',
    tag_ids: recipe?.tags.map(t => t.id) || [],
  });

  const [form, setForm] = useState<RecipeFormData>({
    ...initialFormRef.current,
  });

  const [ingredients, setIngredients] = useState<IngredientFormItem[]>(
    recipe?.ingredients.map(ing => {
      // Parse quantity_number from the quantity string (e.g., "100g" -> 100, "2 c. à soupe" -> 2)
      const parsedNumber =
        parseFloat(ing.quantity) || ing.quantityValue || undefined;
      return {
        _tempId: `temp-${ing.id}`,
        id: ing.id,
        food_id: ing.foodId,
        name: ing.name,
        quantity: ing.quantity,
        quantity_number: parsedNumber,
        quantity_value: ing.quantityValue,
        quantity_unit: ing.quantityUnit,
        is_optional: ing.isOptional,
        substitution_notes: ing.substitutionNotes,
        group_name: ing.groupName,
        calories_per_100g: ing.caloriesPer100g,
        protein_per_100g: ing.proteinPer100g,
        carbs_per_100g: ing.carbsPer100g,
        fat_per_100g: ing.fatPer100g,
        fiber_per_100g: ing.fiberPer100g,
      };
    }) || []
  );

  const [steps, setSteps] = useState<StepFormItem[]>(
    recipe?.steps.map(s => ({
      _tempId: `step-${s.id}`,
      id: s.id,
      instruction: s.instruction,
      duration_minutes: s.durationMinutes,
      image_url: s.imageUrl,
      tips: s.tips,
    })) || []
  );

  // Dirty tracking
  const [savedFingerprint, setSavedFingerprint] = useState(() => {
    const init = initialFormRef.current;
    return `${init.title}|${init.difficulty}|${init.prep_time_minutes}|${init.cook_time_minutes}|${init.servings}|${init.image_url}|${init.tips}|${[...init.tag_ids].sort().join(',')}|${recipe?.ingredients.length || 0}|${recipe?.steps.length || 0}`;
  });

  const currentFingerprint = `${form.title}|${form.difficulty}|${form.prep_time_minutes}|${form.cook_time_minutes}|${form.servings}|${form.image_url}|${form.tips}|${[...form.tag_ids].sort().join(',')}|${ingredients.length}|${steps.length}`;
  const isDirty = currentFingerprint !== savedFingerprint;

  const markClean = useCallback(() => {
    setSavedFingerprint(currentFingerprint);
  }, [currentFingerprint]);

  // Thumbnail upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFieldChange = useCallback(
    <K extends keyof RecipeFormData>(field: K, value: RecipeFormData[K]) => {
      setForm(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleThumbnailUpload = useCallback(
    async (file: File) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setUploadError('Format non supporté. Utilisez JPEG, PNG ou WebP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image trop volumineuse (maximum 5 Mo).');
        return;
      }

      setIsUploadingThumbnail(true);
      setUploadError(null);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(
          '/api/protected/nutritionist/recipes/upload-thumbnail',
          {
            method: 'POST',
            credentials: 'include',
            body: formData,
          }
        );

        const data = await res.json();
        if (res.ok && data.data?.url) {
          handleFieldChange('image_url', data.data.url);
        } else {
          setUploadError(data.error || "Erreur lors de l'upload de l'image.");
        }
      } catch {
        setUploadError(
          'Impossible de contacter le serveur. Vérifiez votre connexion.'
        );
      } finally {
        setIsUploadingThumbnail(false);
      }
    },
    [handleFieldChange]
  );

  const totalTime = form.prep_time_minutes + form.cook_time_minutes;
  const totalWeightGrams = useMemo(
    () => ingredients.reduce((sum, ing) => sum + (ing.quantity_value || 0), 0),
    [ingredients]
  );

  // Real-time nutrition calculation from CIQUAL-linked ingredients
  const computedNutrition = useMemo(() => {
    const linked = ingredients.filter(
      i => i.food_id && i.quantity_value && i.calories_per_100g !== undefined
    );
    if (linked.length === 0) return null;

    let totalCal = 0,
      totalPro = 0,
      totalCarbs = 0,
      totalFat = 0,
      totalFiber = 0;
    for (const ing of linked) {
      const factor = (ing.quantity_value || 0) / 100;
      totalCal += (ing.calories_per_100g || 0) * factor;
      totalPro += (ing.protein_per_100g || 0) * factor;
      totalCarbs += (ing.carbs_per_100g || 0) * factor;
      totalFat += (ing.fat_per_100g || 0) * factor;
      totalFiber += (ing.fiber_per_100g || 0) * factor;
    }

    return {
      calories: Math.round(totalCal),
      protein: Math.round(totalPro * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
    };
  }, [ingredients]);

  // Preview modal
  const [showPreview, setShowPreview] = useState(false);

  // Badge override modal
  const [showBadgeOverride, setShowBadgeOverride] = useState(false);

  // Uncertain badges confirmation modal
  const [showUncertainConfirm, setShowUncertainConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'save' | 'publish' | null>(
    null
  );

  // Compute auto-tags in real-time from current form data (Phase 1: calories, time, nutrition)
  const realtimeAutoTags = useMemo(() => {
    const clientTags = computeAllAutoTags({
      calories: computedNutrition?.calories ?? null,
      proteinG: computedNutrition?.protein ?? null,
      carbsG: computedNutrition?.carbs ?? null,
      fatG: computedNutrition?.fat ?? null,
      fiberG: computedNutrition?.fiber ?? null,
      servings: form.servings,
      prepTimeMinutes: totalTime,
      cookTimeMinutes: 0,
    });

    // Merge with DB-persisted auto-tags (Phase 2: diet, Phase 3: allergen)
    const dbOnlyTags = (recipe?.autoTags || [])
      .filter(t => t.group === 'diet' || t.group === 'allergen')
      .map(t => ({ tag_group: t.group, tag_value: t.value }));

    return [...clientTags, ...dbOnlyTags];
  }, [computedNutrition, form.servings, totalTime, recipe?.autoTags]);

  // ── Save / Publish handlers with uncertain badge check ──

  // Core save: persists recipe metadata, ingredients, and steps. Returns the recipeId.
  // After this runs, the server recomputes auto-tags from the freshly saved ingredients.
  const persistRecipe = useCallback(async (): Promise<string | null> => {
    const result = await onSave(form);
    const recipeId = result?.id || recipe?.id || null;
    if (recipeId) {
      await Promise.all([
        onSaveIngredients(recipeId, ingredients),
        onSaveSteps(recipeId, steps),
      ]);
    }
    return recipeId;
  }, [
    form,
    ingredients,
    steps,
    recipe,
    onSave,
    onSaveIngredients,
    onSaveSteps,
  ]);

  // Fetch the auto-tags currently in DB for a recipe
  const fetchAutoTags = useCallback(
    async (
      recipeId: string
    ): Promise<{ tag_group: string; tag_value: string }[]> => {
      const res = await fetch(
        `/api/protected/nutritionist/recipes/${recipeId}/auto-tags`,
        {
          credentials: 'include',
        }
      );
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.auto_tags || [];
    },
    []
  );

  // Apply nutritionist decisions on uncertain badges. Called AFTER persistRecipe.
  const applyDecisions = useCallback(
    async (recipeId: string, resolved: UncertainDecisions) => {
      const currentTags = await fetchAutoTags(recipeId);

      const nonUncertain = currentTags.filter(
        t => !t.tag_value.endsWith('-uncertain')
      );
      const confirmedFromDecisions = resolved.uncertainTags
        .filter(t => resolved.decisions[`${t.tag_group}:${t.tag_value}`])
        .map(t => ({
          tag_group: t.tag_group,
          tag_value: t.tag_value.replace(/-uncertain$/, ''),
        }));

      const seen = new Set(
        nonUncertain.map(t => `${t.tag_group}:${t.tag_value}`)
      );
      const merged = [...nonUncertain];
      for (const t of confirmedFromDecisions) {
        const key = `${t.tag_group}:${t.tag_value}`;
        if (!seen.has(key)) {
          merged.push(t);
          seen.add(key);
        }
      }

      await fetch(`/api/protected/nutritionist/recipes/${recipeId}/auto-tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ auto_tags: merged }),
      });
    },
    [fetchAutoTags]
  );

  // Pending state for the full save/publish flow
  const [isProcessingSave, setIsProcessingSave] = useState(false);
  const pendingRecipeIdRef = useRef<string | null>(null);
  const pendingUncertainRef = useRef<
    { tag_group: string; tag_value: string }[]
  >([]);

  // Unified save flow: persist → recompute auto-tags → check uncertain → modal or finalize
  const runSaveFlow = useCallback(
    async (alsoPublish: boolean) => {
      setIsProcessingSave(true);
      setPendingAction(alsoPublish ? 'publish' : 'save');
      try {
        // 1. Persist recipe + ingredients + steps (server recomputes auto-tags)
        const recipeId = await persistRecipe();
        if (!recipeId) return;

        // 2. Fetch the freshly recomputed auto-tags from DB
        const freshTags = await fetchAutoTags(recipeId);
        const uncertain = freshTags.filter(t =>
          t.tag_value.endsWith('-uncertain')
        );

        // 3. If uncertain tags exist, show modal — finalization happens after user confirms
        if (uncertain.length > 0) {
          pendingRecipeIdRef.current = recipeId;
          pendingUncertainRef.current = uncertain;
          setShowUncertainConfirm(true);
          return;
        }

        // 4. No uncertain tags — finalize directly
        await onAfterSave?.(recipeId);
        markClean();
        if (alsoPublish) {
          await onPublish(recipeId);
        } else {
          onSavedAsDraft?.();
        }
        setPendingAction(null);
      } finally {
        // Only clear processing if we're not waiting for the modal
        if (!showUncertainConfirm) {
          setIsProcessingSave(false);
        }
      }
    },
    [
      persistRecipe,
      fetchAutoTags,
      onAfterSave,
      onPublish,
      onSavedAsDraft,
      showUncertainConfirm,
      markClean,
    ]
  );

  const handleSave = useCallback(() => runSaveFlow(false), [runSaveFlow]);
  const handleSaveAndPublish = useCallback(
    () => runSaveFlow(true),
    [runSaveFlow]
  );

  // Called when nutri confirms decisions in the modal — recipe is already persisted
  const handleUncertainResolved = useCallback(
    async (resolved: UncertainDecisions) => {
      const recipeId = pendingRecipeIdRef.current;
      if (!recipeId) {
        setShowUncertainConfirm(false);
        setIsProcessingSave(false);
        return;
      }
      try {
        // 1. Override uncertain tags with nutritionist's decisions
        await applyDecisions(recipeId, resolved);

        // 2. Refetch recipe to update sidebar/list with clean tags
        await onAfterSave?.(recipeId);

        // 3. If the action was publish, do it now (badges are clean)
        if (pendingAction === 'publish') {
          await onPublish(recipeId);
        } else {
          onSavedAsDraft?.();
        }
      } finally {
        setShowUncertainConfirm(false);
        setIsProcessingSave(false);
        setPendingAction(null);
        pendingRecipeIdRef.current = null;
        pendingUncertainRef.current = [];
      }
    },
    [applyDecisions, onAfterSave, onPublish, onSavedAsDraft, pendingAction]
  );

  const handleUncertainCancel = useCallback(() => {
    setShowUncertainConfirm(false);
    setIsProcessingSave(false);
    setPendingAction(null);
    pendingRecipeIdRef.current = null;
    pendingUncertainRef.current = [];
  }, []);

  // Validation
  const canSave =
    form.title.trim().length >= 3 && !!form.difficulty && form.servings >= 1;
  const isAlreadyPublished = isEdit && recipe?.status === 'published';
  const canPublish =
    !isAlreadyPublished &&
    canSave &&
    ingredients.length > 0 &&
    steps.length > 0 &&
    !!form.image_url;

  const difficultyOptions = Object.entries(DIFFICULTY_LABELS).map(
    ([val, label]) => ({
      value: val,
      label,
    })
  );

  return (
    <div className='h-full flex flex-col bg-white'>
      {/* ─── Header ─── */}
      <div className='flex items-center justify-between px-6 h-[93px] flex-shrink-0 border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <h1 className='text-lg font-semibold text-gray-900'>
            {isEdit
              ? recipe?.title || 'Modifier la recette'
              : 'Nouvelle recette'}
          </h1>
          {isEdit && recipe && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                recipe.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {recipe.status === 'published' ? 'Publié' : 'Brouillon'}
            </span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={onBack}
            className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Retour
          </button>

          <button
            onClick={() => setShowPreview(true)}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            <Eye className='w-4 h-4' />
            Aperçu patient
          </button>

          {/* Save as draft — only when not already published */}
          {!isAlreadyPublished && (
            <button
              onClick={handleSave}
              disabled={isSaving || !canSave}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSaving ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Save className='w-4 h-4' />
              )}
              Enregistrer en brouillon
            </button>
          )}

          {/* Publish / Unpublish */}
          {isEdit && recipe?.status === 'published' ? (
            <>
              <button
                onClick={() => onPublish(recipe.id)}
                disabled={isPublishing}
                className='flex items-center gap-2 px-4 py-2 text-sm font-medium border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50'
              >
                {isPublishing ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <EyeOff className='w-4 h-4' />
                )}
                Dé-publier
              </button>
              {isDirty && (
                <button
                  onClick={handleSave}
                  disabled={isSaving || !canSave}
                  className='flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSaving ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <Save className='w-4 h-4' />
                  )}
                  Publier les changements
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleSaveAndPublish}
              disabled={isSaving || isPublishing || !canPublish}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSaving || isPublishing ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Send className='w-4 h-4' />
              )}
              Publier
            </button>
          )}
        </div>
      </div>

      {/* ─── Body: 2 columns ─── */}
      <div className='flex-1 overflow-y-auto'>
        <div className='max-w-7xl mx-auto px-6 py-6'>
          <div className='flex gap-8'>
            {/* ── Left column: Form ── */}
            <div className='flex-1 min-w-0 space-y-8'>
              {/* Section: Informations générales */}
              <section className='space-y-5'>
                <div>
                  <label className='text-sm font-medium text-gray-700 mb-1 block'>
                    Titre <span className='text-red-400'>*</span>
                  </label>
                  <input
                    type='text'
                    value={form.title}
                    onChange={e => handleFieldChange('title', e.target.value)}
                    placeholder='Ex: Bowl protéiné au poulet et quinoa'
                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                    maxLength={200}
                  />
                </div>

                <div className='grid grid-cols-4 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-gray-700 mb-1 block'>
                      <Clock className='w-3.5 h-3.5 inline mr-1' />
                      Préparation (min)
                    </label>
                    <input
                      type='number'
                      value={form.prep_time_minutes}
                      onChange={e =>
                        handleFieldChange(
                          'prep_time_minutes',
                          parseInt(e.target.value) || 0
                        )
                      }
                      min={0}
                      className='w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-700 mb-1 block'>
                      Cuisson (min)
                    </label>
                    <input
                      type='number'
                      value={form.cook_time_minutes}
                      onChange={e =>
                        handleFieldChange(
                          'cook_time_minutes',
                          parseInt(e.target.value) || 0
                        )
                      }
                      min={0}
                      className='w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-700 mb-1 block'>
                      <Users className='w-3.5 h-3.5 inline mr-1' />
                      Portions <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='number'
                      value={form.servings}
                      onChange={e =>
                        handleFieldChange(
                          'servings',
                          parseInt(e.target.value) || 1
                        )
                      }
                      min={1}
                      max={100}
                      className='w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-700 mb-1 block'>
                      Difficulté <span className='text-red-400'>*</span>
                    </label>
                    <CustomDropdown
                      value={form.difficulty}
                      options={difficultyOptions}
                      placeholder='Sélectionner...'
                      onChange={v =>
                        handleFieldChange('difficulty', v as RecipeDifficulty)
                      }
                      allowReset={false}
                    />
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className='text-sm font-medium text-gray-700 mb-1 block'>
                    Vignette <span className='text-red-400'>*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/jpeg,image/png,image/webp'
                    className='hidden'
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailUpload(file);
                      e.target.value = '';
                    }}
                  />
                  {form.image_url ? (
                    <div className='space-y-3'>
                      <div className='relative w-full max-w-lg aspect-video rounded-lg border border-gray-200 overflow-hidden'>
                        <img
                          src={form.image_url}
                          alt='Vignette'
                          className='w-full h-full object-cover'
                          onError={e => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      </div>
                      <div className='flex items-center gap-3'>
                        <button
                          type='button'
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingThumbnail}
                          className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          {isUploadingThumbnail ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : (
                            <Upload className='w-4 h-4' />
                          )}
                          Changer
                        </button>
                        <button
                          type='button'
                          onClick={() => handleFieldChange('image_url', '')}
                          className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors'
                        >
                          <Trash2 className='w-4 h-4' />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingThumbnail}
                      className='flex items-center justify-center gap-3 w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#1B998B] hover:bg-[#1B998B]/5 cursor-pointer transition-colors'
                    >
                      {isUploadingThumbnail ? (
                        <>
                          <Loader2 className='w-5 h-5 text-[#1B998B] animate-spin' />
                          <span className='text-sm text-gray-500'>
                            Upload en cours...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className='w-5 h-5 text-gray-400' />
                          <div className='text-left'>
                            <p className='text-sm font-medium text-gray-700'>
                              Cliquez pour ajouter une vignette
                            </p>
                            <p className='text-xs text-gray-400'>
                              JPEG, PNG ou WebP — max 5 Mo — format 16:9
                              recommandé
                            </p>
                          </div>
                        </>
                      )}
                    </button>
                  )}
                  {uploadError && (
                    <p className='mt-2 text-xs text-red-500'>{uploadError}</p>
                  )}
                </div>

                {/* Tips */}
                <div>
                  <label className='text-sm font-medium text-gray-700 mb-1 block'>
                    Astuces du chef
                  </label>
                  <textarea
                    value={form.tips}
                    onChange={e => handleFieldChange('tips', e.target.value)}
                    placeholder='Conseils, variantes, astuces de conservation...'
                    rows={3}
                    className='w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                    maxLength={2000}
                  />
                </div>
              </section>

              {/* Section: Tags */}
              {tagGroups.length > 0 && (
                <>
                  <hr className='border-gray-200' />
                  <section>
                    <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                      Tags & classifications
                    </h3>
                    <RecipeTagSelector
                      availableGroups={tagGroups}
                      selectedTagIds={form.tag_ids}
                      onChange={ids => handleFieldChange('tag_ids', ids)}
                    />
                  </section>
                </>
              )}

              <hr className='border-gray-200' />

              {/* Section: Ingrédients */}
              <section>
                <RecipeIngredientEditor
                  ingredients={ingredients}
                  onChange={setIngredients}
                  onFoodCreated={onFoodCreated}
                />
              </section>

              <hr className='border-gray-200' />

              {/* Section: Étapes */}
              <section className='pb-8'>
                <RecipeStepEditor steps={steps} onChange={setSteps} />
              </section>
            </div>

            {/* ── Right column: Sidebar (sticky) ── */}
            <div className='w-80 flex-shrink-0 hidden lg:block'>
              <div className='sticky top-6'>
                <RecipeFormSidebar
                  recipe={recipe}
                  servings={form.servings}
                  ingredientsCount={ingredients.length}
                  stepsCount={steps.length}
                  ciqualCount={ingredients.filter(i => i.food_id).length}
                  title={form.title}
                  imageUrl={form.image_url}
                  totalTime={totalTime}
                  totalWeightGrams={totalWeightGrams}
                  computedNutrition={computedNutrition}
                  realtimeAutoTags={realtimeAutoTags}
                  onOverrideBadges={() => setShowBadgeOverride(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Override Modal — rendered outside sticky sidebar to avoid z-index issues */}
      {showBadgeOverride && recipe?.id && (
        <AutoBadgeOverrideModal
          isOpen={showBadgeOverride}
          recipeId={recipe.id}
          currentAutoTags={realtimeAutoTags}
          onClose={() => setShowBadgeOverride(false)}
          onSaved={async () => {
            await onAfterSave?.(recipe.id);
            onBadgesOverridden?.();
          }}
        />
      )}

      {/* Uncertain Badges Confirmation Modal — shown after persist if uncertain tags exist */}
      {showUncertainConfirm && (
        <UncertainBadgesModal
          isOpen={showUncertainConfirm}
          uncertainTags={pendingUncertainRef.current}
          isProcessing={isProcessingSave}
          onClose={handleUncertainCancel}
          onConfirmed={handleUncertainResolved}
        />
      )}

      {/* Preview modal */}
      <RecipePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={form.title}
        imageUrl={form.image_url}
        difficulty={form.difficulty}
        prepTimeMinutes={form.prep_time_minutes}
        cookTimeMinutes={form.cook_time_minutes}
        servings={form.servings}
        tips={form.tips}
        ingredients={ingredients}
        steps={steps}
        tags={
          recipe?.tags.map(t => ({
            id: t.id,
            label: t.label,
            tagType: t.tagType,
          })) || []
        }
        autoTags={realtimeAutoTags}
      />
    </div>
  );
}
