'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Plus,
  FileText,
  Archive,
  Trash2,
  BarChart3,
  Star,
  Video,
  BookOpen,
  GraduationCap,
  Headphones,
  X,
  Search,
  Library,
  Bookmark,
  Send,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock as ClockIcon,
  Eye as EyeIcon,
  Pencil,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useNutritionistContents,
  useCreateContent,
  useUpdateContent,
  useDeleteContent,
  usePublishContent,
  useArchiveContent,
  useUnpublishContent,
  useScheduleContent,
  useAutoSaveContent,
} from '@/hooks/useNutritionistContent';
import {
  useCustomCategories,
  useCreateCategory,
} from '@/hooks/useCustomContentCategories';
import { useFeaturedContents } from '@/hooks/useContentInteractions';
import {
  ContentForm,
  ContentFormData,
} from '@/components/nutritionist/content/ContentForm';
import { NutritionistContentCard } from '@/components/nutritionist/content/NutritionistContentCard';
import {
  EducationalContent,
  ContentType,
  ContentCategory,
  ContentStatus,
  CONTENT_TYPE_LABELS,
  CONTENT_STATUS_LABELS,
  CONTENT_CATEGORY_LABELS,
} from '@/types/educational-content';
import { ContentStatsPanel } from '@/components/nutritionist/content/ContentStatsPanel';
import { FeaturedModal } from '@/components/nutritionist/content/FeaturedModal';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

type View = 'list' | 'create' | 'edit';
type ContentTab =
  | 'all'
  | 'articles'
  | 'videos'
  | 'guides'
  | 'podcasts'
  | 'courses';
type SecondaryPanel = 'none' | 'stats';

const TYPE_TAB_MAP: Record<ContentTab, ContentType | ''> = {
  all: '',
  articles: 'article',
  videos: 'video',
  guides: 'guide',
  podcasts: 'podcast',
  courses: 'course',
};

const TABS_CONFIG: {
  id: ContentTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'all', label: 'Tout', icon: Library },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'videos', label: 'Vidéos', icon: Video },
  { id: 'guides', label: 'Guides', icon: BookOpen },
  { id: 'podcasts', label: 'Podcasts', icon: Headphones },
  { id: 'courses', label: 'Cours', icon: GraduationCap },
];

const STATUS_PILLS: { value: ContentStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'scheduled', label: 'Planifiés' },
  { value: 'published', label: 'Publiés' },
  { value: 'archived', label: 'Archivés' },
];

const STATUS_PILL_COLORS: Record<string, string> = {
  '': 'bg-[#1B998B] text-white',
  draft: 'bg-gray-700 text-white',
  scheduled: 'bg-amber-500 text-white',
  published: 'bg-green-600 text-white',
  archived: 'bg-yellow-600 text-white',
};

const CATEGORY_CONFIGS: {
  id: ContentCategory;
  label: string;
  bgColor: string;
  color: string;
}[] = [
  {
    id: 'nutrition_basics',
    label: 'Bases de la nutrition',
    bgColor: 'bg-blue-50',
    color: 'text-blue-700',
  },
  {
    id: 'healthy_recipes',
    label: 'Recettes saines',
    bgColor: 'bg-amber-50',
    color: 'text-amber-700',
  },
  {
    id: 'weight_management',
    label: 'Gestion du poids',
    bgColor: 'bg-purple-50',
    color: 'text-purple-700',
  },
  {
    id: 'sports_nutrition',
    label: 'Nutrition sportive',
    bgColor: 'bg-green-50',
    color: 'text-green-700',
  },
  {
    id: 'digestive_health',
    label: 'Santé digestive',
    bgColor: 'bg-red-50',
    color: 'text-red-700',
  },
  {
    id: 'mental_wellbeing',
    label: 'Bien-être mental',
    bgColor: 'bg-indigo-50',
    color: 'text-indigo-700',
  },
  {
    id: 'food_allergies',
    label: 'Allergies alimentaires',
    bgColor: 'bg-orange-50',
    color: 'text-orange-700',
  },
  {
    id: 'supplements',
    label: 'Compléments',
    bgColor: 'bg-cyan-50',
    color: 'text-cyan-700',
  },
  {
    id: 'meal_planning',
    label: 'Planification repas',
    bgColor: 'bg-teal-50',
    color: 'text-teal-700',
  },
  {
    id: 'lifestyle',
    label: 'Mode de vie',
    bgColor: 'bg-pink-50',
    color: 'text-pink-700',
  },
];

type ConfirmAction = {
  type: 'publish' | 'unpublish' | 'archive' | 'delete' | 'schedule';
  content: EducationalContent;
};

export default function ContentPage() {
  const [view, setView] = useState<View>('list');
  const [activeTab, setActiveTab] = useState<ContentTab>('all');
  const [secondaryPanel, setSecondaryPanel] = useState<SecondaryPanel>('none');
  const [editingContent, setEditingContent] =
    useState<EducationalContent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [createType, setCreateType] = useState<ContentType>('article');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirmation modals
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [notifyPatients, setNotifyPatients] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [schedCalMonth, setSchedCalMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [schedHour, setSchedHour] = useState('09');
  const [schedMinute, setSchedMinute] = useState('00');

  // Data
  const typeFilter = TYPE_TAB_MAP[activeTab];
  const { data, isLoading } = useNutritionistContents({
    type: typeFilter || undefined,
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
    search: search || undefined,
    page,
    limit: 20,
  });

  // Featured contents
  const { data: featuredContents } = useFeaturedContents();

  // Custom categories
  const { data: customCategories } = useCustomCategories();
  const createCategoryMutation = useCreateCategory();

  // Mutations
  const createMutation = useCreateContent();
  const updateMutation = useUpdateContent();
  const deleteMutation = useDeleteContent();
  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();
  const unpublishMutation = useUnpublishContent();
  const scheduleMutation = useScheduleContent();
  const autoSaveMutation = useAutoSaveContent();

  const contents = data?.contents || [];
  const pagination = data?.pagination;

  // Handlers
  const handleCreate = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const TYPE_DEFAULT_TITLES: Record<ContentType, string> = {
    article: 'Nouvel article',
    video: 'Nouvelle vidéo',
    guide: 'Nouveau guide',
    course: 'Nouveau cours',
    podcast: 'Nouveau podcast',
  };

  const handleSelectContentType = useCallback(
    async (type: ContentType) => {
      setShowCreateModal(false);
      try {
        const created = await createMutation.mutateAsync({
          type,
          category: 'other',
          title: TYPE_DEFAULT_TITLES[type] || 'Nouveau contenu',
          summary: '',
          body: '',
          tags: [],
          key_points: [],
        });
        setEditingContent(created);
        setView('edit');
      } catch {
        // Silent fail
      }
    },
    [createMutation]
  );

  const handleEdit = useCallback((content: EducationalContent) => {
    setEditingContent(content);
    setView('edit');
  }, []);

  const handleBack = useCallback(() => {
    setView('list');
    setEditingContent(null);
  }, []);

  const handleSave = useCallback(
    async (formData: ContentFormData) => {
      if (view === 'create') {
        const created = await createMutation.mutateAsync(formData);
        if (formData.type === 'course') {
          setEditingContent(created);
          setView('edit');
          return created;
        }
      } else if (editingContent) {
        await updateMutation.mutateAsync({
          contentId: editingContent.id,
          data: formData,
        });
        if (formData.type === 'course') {
          return editingContent;
        }
      }
      setView('list');
      setEditingContent(null);
    },
    [view, editingContent, createMutation, updateMutation]
  );

  const handlePublish = useCallback(
    async (formData: ContentFormData) => {
      if (view === 'create') {
        const created = await createMutation.mutateAsync(formData);
        await publishMutation.mutateAsync(created.id);
      } else if (editingContent) {
        await updateMutation.mutateAsync({
          contentId: editingContent.id,
          data: { ...formData, status: 'published' },
        });
      }
      setView('list');
      setEditingContent(null);
    },
    [view, editingContent, createMutation, updateMutation, publishMutation]
  );

  const handleScheduleFromForm = useCallback(
    async (formData: ContentFormData, scheduledAt: string) => {
      if (view === 'create') {
        const created = await createMutation.mutateAsync(formData);
        await scheduleMutation.mutateAsync({
          contentId: created.id,
          scheduledAt,
        });
      } else if (editingContent) {
        await updateMutation.mutateAsync({
          contentId: editingContent.id,
          data: formData,
        });
        await scheduleMutation.mutateAsync({
          contentId: editingContent.id,
          scheduledAt,
        });
      }
      setView('list');
      setEditingContent(null);
    },
    [view, editingContent, createMutation, updateMutation, scheduleMutation]
  );

  const editingContentRef = useRef(editingContent);
  useEffect(() => {
    editingContentRef.current = editingContent;
  }, [editingContent]);

  const handleAutoSave = useCallback(
    async (formData: ContentFormData) => {
      const content = editingContentRef.current;
      if (!content) return;
      try {
        await autoSaveMutation.mutateAsync({
          contentId: content.id,
          data: formData,
        });
      } catch {
        // Silent fail for auto-save
      }
    },
    [autoSaveMutation]
  );

  const handleDelete = useCallback(
    async (content: EducationalContent) => {
      await deleteMutation.mutateAsync(content.id);
    },
    [deleteMutation]
  );

  // Confirmation handlers
  const openConfirm = (action: ConfirmAction) => {
    setConfirmAction(action);
    setNotifyPatients(false);
    if (action.type === 'schedule') {
      setScheduledDate('');
      setSchedCalMonth(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      );
      setSchedHour('09');
      setSchedMinute('00');
    }
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    switch (confirmAction.type) {
      case 'publish':
        publishMutation.mutateAsync(confirmAction.content.id);
        break;
      case 'unpublish':
        unpublishMutation.mutateAsync(confirmAction.content.id);
        break;
      case 'archive':
        archiveMutation.mutateAsync(confirmAction.content.id);
        break;
      case 'delete':
        deleteMutation.mutateAsync(confirmAction.content.id);
        break;
      case 'schedule':
        if (scheduledDate) {
          scheduleMutation.mutateAsync({
            contentId: confirmAction.content.id,
            scheduledAt: new Date(scheduledDate).toISOString(),
          });
        }
        break;
    }
    setConfirmAction(null);
  };

  // Bulk actions
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkArchive = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Archiver ${selectedIds.size} contenu${selectedIds.size > 1 ? 's' : ''} ?`
      )
    )
      return;
    for (const id of selectedIds) {
      await archiveMutation.mutateAsync(id);
    }
    setSelectedIds(new Set());
  }, [selectedIds, archiveMutation]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Supprimer définitivement ${selectedIds.size} contenu${selectedIds.size > 1 ? 's' : ''} ?`
      )
    )
      return;
    for (const id of selectedIds) {
      await deleteMutation.mutateAsync(id);
    }
    setSelectedIds(new Set());
  }, [selectedIds, deleteMutation]);

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    publishMutation.isPending ||
    scheduleMutation.isPending;

  // Grid title
  const getGridTitle = () => {
    if (search)
      return `Résultats pour "${search}" (${pagination?.total || contents.length})`;
    if (activeTab !== 'all') {
      const tabLabel = TABS_CONFIG.find(t => t.id === activeTab)?.label || '';
      return `${tabLabel} (${pagination?.total || contents.length})`;
    }
    return `Dernières publications (${pagination?.total || contents.length})`;
  };

  // ==================== RENDER ====================

  // Form view (create or edit)
  if (view === 'create' || view === 'edit') {
    return (
      <ContentForm
        key={editingContent?.id || `new-${createType}`}
        content={view === 'edit' ? editingContent : null}
        initialType={view === 'create' ? createType : undefined}
        onSave={handleSave}
        onPublish={handlePublish}
        onUnpublish={
          editingContent
            ? async () => {
                await unpublishMutation.mutateAsync(editingContent.id);
                handleBack();
              }
            : undefined
        }
        onSchedule={handleScheduleFromForm}
        onAutoSave={view === 'edit' ? handleAutoSave : undefined}
        onBack={handleBack}
        isSaving={isSaving}
        customCategories={(customCategories || []).map(c => ({
          id: c.id,
          name: c.name,
          color: c.color,
        }))}
        onCreateCategory={name => createCategoryMutation.mutate({ name })}
      />
    );
  }

  // Secondary panels
  if (secondaryPanel === 'stats') {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='bg-white border-b border-gray-200 px-8'>
          <div className='flex items-center justify-between h-[93px]'>
            <button
              onClick={() => setSecondaryPanel('none')}
              className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors'
            >
              <ChevronLeft className='w-4 h-4' />
              Retour au contenu
            </button>
            <h1 className='text-lg font-semibold text-gray-900'>
              Statistiques
            </h1>
            <div className='w-24' />
          </div>
        </div>
        <div className='px-8 py-6'>
          <ContentStatsPanel />
        </div>
      </div>
    );
  }

  // ==================== Main content view ====================
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* ─── Header ─── */}
      <div className='bg-white border-b border-gray-200 px-8'>
        <div className='flex items-center justify-between w-full h-[93px]'>
          <h1 className='text-xl font-semibold text-gray-900'>
            Contenu éducatif
          </h1>
          <div className='flex items-center gap-2'>
            {/* Bulk actions */}
            {selectedIds.size > 0 && (
              <div className='flex items-center gap-2 mr-2'>
                <span className='text-sm text-gray-600'>
                  {selectedIds.size} sélectionné
                  {selectedIds.size > 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleBulkArchive}
                  className='flex items-center gap-1.5 px-3 py-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors'
                >
                  <Archive className='w-4 h-4' />
                  Archiver
                </button>
                <button
                  onClick={handleBulkDelete}
                  className='flex items-center gap-1.5 px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'
                >
                  <Trash2 className='w-4 h-4' />
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className='text-sm text-gray-500 hover:text-gray-700 underline'
                >
                  Annuler
                </button>
              </div>
            )}

            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Rechercher...'
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className='w-48 pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-all'
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className='absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full'
                >
                  <X className='w-3.5 h-3.5 text-gray-400' />
                </button>
              )}
            </div>

            {/* Secondary panel buttons */}
            <button
              onClick={() => setSecondaryPanel('stats')}
              className='flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
            >
              <BarChart3 className='w-4 h-4' />
              <span className='hidden sm:inline'>Stats</span>
            </button>
            <button
              onClick={() => setShowFeaturedModal(true)}
              className='flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
            >
              <Star className='w-4 h-4' />
              <span className='hidden sm:inline'>Mis en avant</span>
            </button>

            {/* Create button */}
            <button
              onClick={handleCreate}
              className='flex items-center gap-2 px-4 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors text-sm font-medium'
            >
              <Plus className='w-4 h-4' />
              Nouveau contenu
            </button>
          </div>
        </div>
      </div>

      {/* ─── Type Tabs ─── */}
      <div className='bg-white border-b border-gray-200 px-4 py-4'>
        <div className='flex gap-1 bg-gray-100 p-1 rounded-xl'>
          {TABS_CONFIG.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className='w-4 h-4' />
                <span className='hidden sm:inline'>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Status Filter Pills ─── */}
      <div className='bg-white px-8 py-3 border-b border-gray-100'>
        <div className='flex flex-wrap gap-2'>
          {STATUS_PILLS.map(pill => {
            const isActive = statusFilter === pill.value;
            return (
              <button
                key={pill.value}
                onClick={() => {
                  setStatusFilter(pill.value as ContentStatus | '');
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? STATUS_PILL_COLORS[pill.value]
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Category Filter ─── */}
      {activeTab === 'all' && !search && (
        <div className='bg-white px-8 py-4 border-b border-gray-100'>
          <h3 className='font-semibold text-gray-800 mb-3'>
            Explorer par thème
          </h3>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => {
                setCategoryFilter('');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                categoryFilter === ''
                  ? 'bg-[#1B998B] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous les thèmes
            </button>
            {CATEGORY_CONFIGS.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryFilter(cat.id);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-[#1B998B] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
            {/* Custom categories */}
            {(customCategories || []).map(cat => (
              <button
                key={`custom-${cat.id}`}
                onClick={() => {
                  setCategoryFilter(`custom:${cat.id}`);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  categoryFilter === `custom:${cat.id}`
                    ? 'bg-[#1B998B] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Featured Preview ─── */}
      {activeTab === 'all' &&
        !search &&
        featuredContents &&
        featuredContents.length > 0 && (
          <div className='px-8 pt-6'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-semibold text-gray-800 flex items-center gap-2'>
                <Star className='w-4 h-4 text-amber-500' />
                Mis en avant ({featuredContents.length}/3)
              </h3>
              <button
                onClick={() => setShowFeaturedModal(true)}
                className='flex items-center gap-1.5 text-xs text-[#1B998B] hover:underline font-medium'
              >
                <Pencil className='w-3.5 h-3.5' />
                Gérer
              </button>
            </div>
            <div
              className={`grid gap-4 ${featuredContents.length === 1 ? 'grid-cols-1' : featuredContents.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}
            >
              {featuredContents.map((fc, idx) => {
                const isNew =
                  fc.publishedAt &&
                  Date.now() - new Date(fc.publishedAt).getTime() <
                    7 * 24 * 60 * 60 * 1000;
                const readingLabel = fc.durationSeconds
                  ? `${Math.round(fc.durationSeconds / 60)} min`
                  : fc.readingTimeMinutes
                    ? `${fc.readingTimeMinutes} min`
                    : null;
                const TYPE_EMOJIS: Record<string, string> = {
                  article: '📝',
                  video: '🎬',
                  guide: '📖',
                  podcast: '🎙',
                  course: '🎓',
                };

                return (
                  <div
                    key={fc.id}
                    onClick={() => handleEdit(fc)}
                    className={`relative rounded-2xl p-8 min-h-[200px] text-white cursor-pointer hover:shadow-xl transition-shadow overflow-hidden ${
                      idx === 0
                        ? 'bg-gradient-to-r from-[#1B998B] to-teal-500'
                        : idx === 1
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-500'
                          : 'bg-gradient-to-r from-emerald-600 to-green-500'
                    }`}
                  >
                    {/* Background pattern */}
                    <div className='absolute inset-0 opacity-10'>
                      <div className='absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2' />
                      <div className='absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2' />
                    </div>

                    <div className='relative flex flex-col justify-between h-full'>
                      <div>
                        <div className='flex items-center gap-2 mb-3'>
                          <span className='px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1'>
                            <Sparkles className='w-4 h-4' />À la une
                          </span>
                          {isNew && (
                            <span className='px-3 py-1 bg-amber-400 text-amber-900 rounded-full text-sm font-medium'>
                              Nouveau
                            </span>
                          )}
                        </div>

                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-bold text-xl leading-snug line-clamp-2 mb-2'>
                              {fc.title}
                            </h4>
                            {fc.summary && (
                              <p className='text-white/70 text-sm line-clamp-2 mb-4'>
                                {fc.summary}
                              </p>
                            )}
                          </div>
                          <span className='text-5xl flex-shrink-0 opacity-50'>
                            {TYPE_EMOJIS[fc.type] || '📄'}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-4 text-sm text-white/60'>
                        {readingLabel && (
                          <span className='flex items-center gap-1'>
                            <ClockIcon className='w-4 h-4' />
                            {readingLabel}
                          </span>
                        )}
                        {fc.viewCount > 0 && (
                          <span className='flex items-center gap-1'>
                            <EyeIcon className='w-4 h-4' />
                            {fc.viewCount} vues
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Empty featured CTA */}
      {activeTab === 'all' &&
        !search &&
        (!featuredContents || featuredContents.length === 0) && (
          <div className='px-8 pt-6'>
            <button
              onClick={() => setShowFeaturedModal(true)}
              className='w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 flex items-center justify-center gap-3 text-gray-400 hover:border-[#1B998B]/30 hover:text-[#1B998B] transition-colors group'
            >
              <Star className='w-5 h-5 group-hover:text-amber-500 transition-colors' />
              <span className='text-sm font-medium'>
                Mettre en avant jusqu&apos;à 3 contenus pour vos patients
              </span>
            </button>
          </div>
        )}

      {/* ─── Content Grid ─── */}
      <div className='px-8 py-6'>
        <h2 className='font-semibold text-gray-800 mb-4'>{getGridTitle()}</h2>

        {isLoading ? (
          <div className='flex items-center justify-center py-16'>
            <div className='w-6 h-6 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
          </div>
        ) : contents.length === 0 ? (
          <div className='bg-white rounded-xl p-12 text-center border border-gray-200'>
            {search ? (
              <>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Search className='w-8 h-8 text-gray-400' />
                </div>
                <p className='text-gray-500'>
                  Aucun contenu trouvé pour &quot;{search}&quot;
                </p>
              </>
            ) : (
              <>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Library className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className='text-lg font-medium text-gray-600 mb-2'>
                  Aucun contenu pour le moment
                </h3>
                <p className='text-sm text-gray-400 mb-6'>
                  Créez votre premier article ou guide pour vos patients.
                </p>
                <button
                  onClick={handleCreate}
                  className='inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors text-sm'
                >
                  <Plus className='w-4 h-4' />
                  Créer mon premier contenu
                </button>
              </>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {contents.map(content => (
              <NutritionistContentCard
                key={content.id}
                content={content}
                onEdit={handleEdit}
                onPublish={c => openConfirm({ type: 'publish', content: c })}
                onArchive={c => openConfirm({ type: 'archive', content: c })}
                onUnpublish={c =>
                  openConfirm({ type: 'unpublish', content: c })
                }
                onSchedule={c => openConfirm({ type: 'schedule', content: c })}
                onDelete={c => openConfirm({ type: 'delete', content: c })}
                isSelected={selectedIds.has(content.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className='flex items-center justify-between mt-6'>
            <p className='text-sm text-gray-500'>
              {pagination.total} contenu{pagination.total > 1 ? 's' : ''}
            </p>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className='px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50'
              >
                Précédent
              </button>
              <span className='text-sm text-gray-600'>
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage(p => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page >= pagination.totalPages}
                className='px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50'
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Create Content Type Modal ─── */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className='bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-5'>
                <h3 className='text-base font-semibold text-gray-900'>
                  Créer un nouveau contenu
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  <X className='w-5 h-5 text-gray-400' />
                </button>
              </div>

              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                {[
                  {
                    type: 'article' as ContentType,
                    icon: FileText,
                    title: 'Article',
                    description:
                      'Rédigez un article avec du texte riche, des images et des liens.',
                    color: 'text-blue-600 bg-blue-50',
                  },
                  {
                    type: 'video' as ContentType,
                    icon: Video,
                    title: 'Vidéo',
                    description:
                      'Partagez une vidéo YouTube ou Vimeo avec vos patients.',
                    color: 'text-purple-600 bg-purple-50',
                  },
                  {
                    type: 'guide' as ContentType,
                    icon: BookOpen,
                    title: 'Guide PDF',
                    description:
                      'Créez un guide téléchargeable pour vos patients.',
                    color: 'text-orange-600 bg-orange-50',
                  },
                  {
                    type: 'podcast' as ContentType,
                    icon: Headphones,
                    title: 'Podcast',
                    description:
                      'Partagez un épisode de podcast avec vos patients.',
                    color: 'text-pink-600 bg-pink-50',
                  },
                  {
                    type: 'course' as ContentType,
                    icon: GraduationCap,
                    title: 'Cours',
                    description:
                      'Créez un cours structuré avec chapitres, sections et quiz.',
                    color: 'text-[#1B998B] bg-[#1B998B]/10',
                  },
                ].map(({ type: t, icon: Icon, title, description, color }) => (
                  <button
                    key={t}
                    onClick={() => handleSelectContentType(t)}
                    className='flex flex-col items-start gap-3 p-4 border border-gray-200 rounded-xl text-left hover:border-[#1B998B]/40 hover:bg-gray-50 transition-all group'
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
                    >
                      <Icon className='w-5 h-5' />
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-gray-900 group-hover:text-[#1B998B] transition-colors'>
                        {title}
                      </p>
                      <p className='text-xs text-gray-400 mt-0.5 leading-relaxed'>
                        {description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Featured Modal ─── */}
      <AnimatePresence>
        {showFeaturedModal && (
          <FeaturedModal
            isOpen={showFeaturedModal}
            onClose={() => setShowFeaturedModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── Confirmation Modals ─── */}
      <AnimatePresence>
        {confirmAction &&
          (() => {
            // Schedule modal
            if (confirmAction.type === 'schedule') {
              return (
                <ScheduleModal
                  key='schedule-modal'
                  content={confirmAction.content}
                  notifyPatients={notifyPatients}
                  setNotifyPatients={setNotifyPatients}
                  scheduledDate={scheduledDate}
                  setScheduledDate={setScheduledDate}
                  calMonth={schedCalMonth}
                  setCalMonth={setSchedCalMonth}
                  schedHour={schedHour}
                  setSchedHour={setSchedHour}
                  schedMinute={schedMinute}
                  setSchedMinute={setSchedMinute}
                  onConfirm={handleConfirm}
                  onCancel={() => setConfirmAction(null)}
                />
              );
            }

            // Publish modal
            if (confirmAction.type === 'publish') {
              return (
                <motion.div
                  key='publish-modal'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
                  onClick={() => setConfirmAction(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'
                    onClick={e => e.stopPropagation()}
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-xl flex items-center justify-center bg-[#1B998B]/10 text-[#1B998B]'>
                          <Send className='w-5 h-5' />
                        </div>
                        <h3 className='text-base font-semibold text-gray-900'>
                          Publier ce contenu
                        </h3>
                      </div>
                      <button
                        onClick={() => setConfirmAction(null)}
                        className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
                      >
                        <X className='w-5 h-5 text-gray-400' />
                      </button>
                    </div>

                    <p className='text-sm font-medium text-gray-800 truncate mb-1'>
                      « {confirmAction.content.title} »
                    </p>
                    <p className='text-sm text-gray-500 mb-5'>
                      Le contenu sera immédiatement visible par vos patients.
                    </p>

                    <div className='mb-6'>
                      <label className='flex items-center gap-3 cursor-pointer group'>
                        <button
                          type='button'
                          role='checkbox'
                          aria-checked={notifyPatients}
                          onClick={() => setNotifyPatients(!notifyPatients)}
                          className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                            notifyPatients
                              ? 'bg-[#1B998B] border-[#1B998B]'
                              : 'border-gray-300 group-hover:border-[#1B998B]/50'
                          }`}
                        >
                          {notifyPatients && (
                            <svg
                              className='w-3 h-3 text-white'
                              viewBox='0 0 12 12'
                              fill='none'
                            >
                              <path
                                d='M2 6l3 3 5-5'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          )}
                        </button>
                        <span className='text-sm text-gray-600'>
                          Notifier mes patients lors de la publication
                        </span>
                      </label>
                    </div>

                    <div className='flex justify-end gap-2'>
                      <button
                        onClick={() => setConfirmAction(null)}
                        className='px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleConfirm}
                        className='flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors'
                      >
                        <Send className='w-4 h-4' />
                        Publier maintenant
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            }

            // Generic confirmation (unpublish, archive, delete)
            const configs: Record<
              string,
              {
                title: string;
                message: string;
                confirmLabel: string;
                confirmClass: string;
                icon: typeof Send;
                iconClass: string;
              }
            > = {
              unpublish: {
                title: 'Remettre en brouillon',
                message:
                  'En remettant ce contenu en brouillon, il ne sera plus accessible à vos patients.',
                confirmLabel: 'Remettre en brouillon',
                confirmClass: 'bg-orange-500 text-white hover:bg-orange-600',
                icon: RotateCcw,
                iconClass: 'text-orange-600 bg-orange-50',
              },
              archive: {
                title: 'Archiver ce contenu',
                message:
                  'Le contenu sera archivé et ne sera plus visible par vos patients. Vous pourrez le restaurer à tout moment.',
                confirmLabel: 'Archiver',
                confirmClass: 'bg-amber-500 text-white hover:bg-amber-600',
                icon: Archive,
                iconClass: 'text-amber-600 bg-amber-50',
              },
              delete: {
                title: 'Supprimer ce contenu',
                message:
                  'Cette action est irréversible. Le contenu et toutes ses données seront définitivement supprimés.',
                confirmLabel: 'Supprimer',
                confirmClass: 'bg-red-500 text-white hover:bg-red-600',
                icon: Trash2,
                iconClass: 'text-red-500 bg-red-50',
              },
            };

            const config = configs[confirmAction.type];
            if (!config) return null;
            const Icon = config.icon;

            return (
              <motion.div
                key='confirm-modal'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
                onClick={() => setConfirmAction(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'
                  onClick={e => e.stopPropagation()}
                >
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.iconClass}`}
                      >
                        <Icon className='w-5 h-5' />
                      </div>
                      <h3 className='text-base font-semibold text-gray-900'>
                        {config.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => setConfirmAction(null)}
                      className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
                    >
                      <X className='w-5 h-5 text-gray-400' />
                    </button>
                  </div>

                  <p className='text-sm font-medium text-gray-800 truncate mb-1'>
                    « {confirmAction.content.title} »
                  </p>
                  <p className='text-sm text-gray-500 mb-6'>{config.message}</p>

                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={() => setConfirmAction(null)}
                      className='px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleConfirm}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${config.confirmClass}`}
                    >
                      <Icon className='w-4 h-4' />
                      {config.confirmLabel}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </div>
  );
}

// ─── Schedule Modal ───

function ScheduleModal({
  content,
  notifyPatients,
  setNotifyPatients,
  scheduledDate,
  setScheduledDate,
  calMonth,
  setCalMonth,
  schedHour,
  setSchedHour,
  schedMinute,
  setSchedMinute,
  onConfirm,
  onCancel,
}: {
  content: EducationalContent;
  notifyPatients: boolean;
  setNotifyPatients: (v: boolean) => void;
  scheduledDate: string;
  setScheduledDate: (v: string) => void;
  calMonth: Date;
  setCalMonth: (v: Date) => void;
  schedHour: string;
  setSchedHour: (v: string) => void;
  schedMinute: string;
  setSchedMinute: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedDate = scheduledDate ? new Date(scheduledDate) : null;
  const daysInMonthCount = new Date(
    calMonth.getFullYear(),
    calMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDow = new Date(
    calMonth.getFullYear(),
    calMonth.getMonth(),
    1
  ).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const isSelected = (day: number) => {
    if (!parsedDate) return false;
    return (
      parsedDate.getFullYear() === calMonth.getFullYear() &&
      parsedDate.getMonth() === calMonth.getMonth() &&
      parsedDate.getDate() === day
    );
  };

  const isToday = (day: number) => {
    const d = new Date();
    return (
      d.getFullYear() === calMonth.getFullYear() &&
      d.getMonth() === calMonth.getMonth() &&
      d.getDate() === day
    );
  };

  const isPast = (day: number) => {
    const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const selectDay = (day: number) => {
    const d = new Date(
      calMonth.getFullYear(),
      calMonth.getMonth(),
      day,
      parseInt(schedHour),
      parseInt(schedMinute)
    );
    setScheduledDate(d.toISOString().slice(0, 16));
  };

  const changeMonth = (dir: number) => {
    setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + dir, 1));
  };

  const updateTime = (h: string, m: string) => {
    if (parsedDate) {
      const d = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
        parseInt(h),
        parseInt(m)
      );
      setScheduledDate(d.toISOString().slice(0, 16));
    }
    setSchedHour(h);
    setSchedMinute(m);
  };

  return (
    <motion.div
      key='schedule-modal'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center justify-between mb-5'>
          <h3 className='text-base font-semibold text-gray-900'>
            Planifier la publication
          </h3>
          <button
            onClick={onCancel}
            className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5 text-gray-400' />
          </button>
        </div>

        <p className='text-sm font-medium text-gray-800 truncate mb-4'>
          « {content.title} »
        </p>

        {/* Calendar */}
        <div className='mb-5'>
          <div className='flex items-center justify-between mb-3'>
            <button
              onClick={() => changeMonth(-1)}
              className='p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors'
            >
              <ChevronLeft className='w-4 h-4' />
            </button>
            <span className='text-sm font-medium text-gray-700'>
              {monthNames[calMonth.getMonth()]} {calMonth.getFullYear()}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className='p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors'
            >
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>

          <div className='grid grid-cols-7 gap-1 mb-1'>
            {weekDays.map(d => (
              <div
                key={d}
                className='text-center text-xs font-medium text-gray-400 py-1'
              >
                {d}
              </div>
            ))}
          </div>

          <div className='grid grid-cols-7 gap-1'>
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`e-${i}`} className='aspect-square' />
            ))}
            {Array.from({ length: daysInMonthCount }).map((_, i) => {
              const day = i + 1;
              const past = isPast(day);
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <button
                  key={day}
                  type='button'
                  disabled={past}
                  onClick={() => selectDay(day)}
                  className={`aspect-square rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
                    past
                      ? 'text-gray-200 cursor-not-allowed'
                      : sel
                        ? 'bg-[#1B998B] text-white shadow-sm'
                        : tod
                          ? 'bg-[#1B998B]/10 text-[#1B998B] font-bold hover:bg-[#1B998B]/20'
                          : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time picker */}
        <div className='mb-5'>
          <label className='block text-xs font-medium text-gray-600 mb-2'>
            Heure de publication
          </label>
          <div className='flex items-center gap-2'>
            <CustomDropdown
              value={schedHour}
              onChange={v => updateTime(v, schedMinute)}
              options={Array.from({ length: 24 }).map((_, h) => ({
                value: String(h).padStart(2, '0'),
                label: `${String(h).padStart(2, '0')}h`,
              }))}
              placeholder='Heure'
              allowReset={false}
              className='flex-1'
            />
            <span className='text-gray-400 font-medium'>:</span>
            <CustomDropdown
              value={schedMinute}
              onChange={v => updateTime(schedHour, v)}
              options={['00', '15', '30', '45'].map(m => ({
                value: m,
                label: `${m} min`,
              }))}
              placeholder='Minutes'
              allowReset={false}
              className='flex-1'
            />
          </div>
        </div>

        {/* Notify */}
        <div className='mb-6'>
          <label className='flex items-center gap-3 cursor-pointer group'>
            <button
              type='button'
              role='checkbox'
              aria-checked={notifyPatients}
              onClick={() => setNotifyPatients(!notifyPatients)}
              className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                notifyPatients
                  ? 'bg-[#1B998B] border-[#1B998B]'
                  : 'border-gray-300 group-hover:border-[#1B998B]/50'
              }`}
            >
              {notifyPatients && (
                <svg
                  className='w-3 h-3 text-white'
                  viewBox='0 0 12 12'
                  fill='none'
                >
                  <path
                    d='M2 6l3 3 5-5'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
            </button>
            <span className='text-sm text-gray-600'>
              Notifier mes patients lors de la publication
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-2'>
          <button
            onClick={onCancel}
            className='px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={!scheduledDate}
            className='flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50 transition-colors'
          >
            <Calendar className='w-4 h-4' />
            Planifier
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
