'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  usePatientContents,
  usePatientFeaturedContents,
  useToggleSave,
  usePatientSavedContents,
  usePatientCustomCategories,
} from '@/hooks/usePatientContent';
import {
  EducationalContent,
  ContentType,
  ContentCategory,
} from '@/types/educational-content';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  ContentHeader,
  ContentTabs,
  ContentCategoryFilter,
  ContentFeatured,
  ContentGrid,
  ContentModal,
  VideoPlayerModal,
} from '@/components/content';
// ContentProgressCourses removed — courses now in dedicated tab
import { ContentCard } from '@/components/content/ContentCard';
import CoursePlayerLayout from '@/components/patient/course/CoursePlayerLayout';
import { Bookmark } from 'lucide-react';

type ContentTab =
  | 'all'
  | 'articles'
  | 'videos'
  | 'guides'
  | 'podcasts'
  | 'courses';
type SavedFilter = '' | 'article' | 'video' | 'guide' | 'podcast' | 'course';

type CourseView = { type: 'none' } | { type: 'playing'; contentId: string };

const TAB_TYPE_MAP: Record<ContentTab, ContentType | undefined> = {
  all: undefined,
  articles: 'article',
  videos: 'video',
  guides: 'guide',
  podcasts: 'podcast',
  courses: 'course',
};

const SAVED_FILTER_OPTIONS: { value: SavedFilter; label: string }[] = [
  { value: '', label: 'Tous' },
  { value: 'article', label: 'Articles' },
  { value: 'video', label: 'Vidéos' },
  { value: 'guide', label: 'Guides' },
  { value: 'podcast', label: 'Podcasts' },
  { value: 'course', label: 'Cours' },
];

export default function ContenuPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [courseView, setCourseView] = useState<CourseView>({ type: 'none' });
  const [showSavedView, setShowSavedView] = useState(false);
  const [savedFilter, setSavedFilter] = useState<SavedFilter>('');

  // Content/video modal state
  const [showContentModal, setShowContentModal] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedContent, setSelectedContent] =
    useState<EducationalContent | null>(null);

  // Real data hooks
  const { data: featuredContents } = usePatientFeaturedContents();
  const primaryFeatured =
    featuredContents && featuredContents.length > 0
      ? featuredContents[0]
      : null;
  const { data: customCategories } = usePatientCustomCategories();

  const typeFilter = TAB_TYPE_MAP[activeTab];
  const categoryFilter = activeCategory === 'all' ? undefined : activeCategory;

  const { data: contentsData, isLoading } = usePatientContents({
    type: typeFilter,
    category: categoryFilter as ContentCategory | undefined,
    search: searchQuery || undefined,
    limit: 50,
  });

  const { data: savedContents } = usePatientSavedContents();
  const toggleSaveMutation = useToggleSave();

  // Saved IDs
  const savedIds = useMemo(() => {
    return (savedContents || []).map(c => c.id);
  }, [savedContents]);

  // Filtered saved contents
  const filteredSavedContents = useMemo(() => {
    const items = savedContents || [];
    if (!savedFilter) return items;
    return items.filter(c => c.type === savedFilter);
  }, [savedContents, savedFilter]);

  // Contents to display
  const displayContents = contentsData?.contents || [];

  // Handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleTabChange = useCallback((tab: ContentTab) => {
    setActiveTab(tab);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  const handleToggleSave = useCallback(
    (contentId: string) => {
      toggleSaveMutation.mutate(contentId);
    },
    [toggleSaveMutation]
  );

  const handleContentClick = useCallback(
    (content: EducationalContent) => {
      if (searchQuery && !recentSearches.includes(searchQuery)) {
        setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
      }

      if (content.type === 'course') {
        setCourseView({ type: 'playing', contentId: content.id });
        return;
      }

      if (content.type === 'video') {
        setSelectedContent(content);
        setShowVideoPlayer(true);
      } else {
        setSelectedContent(content);
        setShowContentModal(true);
      }
    },
    [searchQuery, recentSearches]
  );

  const handleCloseContentModal = useCallback(() => {
    setShowContentModal(false);
    setSelectedContent(null);
  }, []);

  const handleCloseVideoPlayer = useCallback(() => {
    setShowVideoPlayer(false);
    setSelectedContent(null);
  }, []);

  const handleExploreAll = useCallback(() => {
    setActiveTab('all');
  }, []);

  const handleRecentSearchClick = useCallback((term: string) => {
    setSearchQuery(term);
  }, []);

  // Check if selected content is saved
  const isSelectedContentSaved = selectedContent
    ? savedIds.includes(selectedContent.id)
    : false;

  // Show sections only on "all" tab without search
  const showFeatured = activeTab === 'all' && !searchQuery;
  const showCategoryFilter = activeTab === 'all' && !searchQuery;

  // Course player
  if (courseView.type === 'playing') {
    return (
      <div className='flex h-screen flex-col'>
        <DashboardHeader />
        <div className='flex-1 overflow-hidden'>
          <CoursePlayerLayout
            contentId={courseView.contentId}
            onBack={() => setCourseView({ type: 'none' })}
          />
        </div>
      </div>
    );
  }

  // ==================== Saved view ====================
  if (showSavedView) {
    return (
      <div className='min-h-screen'>
        <DashboardHeader />

        {/* Saved header */}
        <div className='bg-white px-8 py-6 border-b border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                <Bookmark className='w-6 h-6 text-[#1B998B]' />
                Contenu sauvegardé
              </h1>
              <p className='text-gray-500 mt-1'>
                {filteredSavedContents.length} contenu
                {filteredSavedContents.length > 1 ? 's' : ''} sauvegardé
                {filteredSavedContents.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowSavedView(false)}
              className='flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Retour
            </button>
          </div>

          {/* Type filter pills */}
          <div className='flex flex-wrap gap-2 mt-4'>
            {SAVED_FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSavedFilter(opt.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  savedFilter === opt.value
                    ? 'bg-[#1B998B] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Saved contents grid */}
        {filteredSavedContents.length === 0 ? (
          <div className='px-8 py-6'>
            <div className='bg-white rounded-xl p-12 text-center border border-gray-200'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Bookmark className='w-8 h-8 text-gray-400' />
              </div>
              <p className='text-gray-500 mb-4'>
                {savedFilter
                  ? 'Aucun contenu sauvegardé de ce type'
                  : 'Aucun contenu sauvegardé'}
              </p>
              <button
                onClick={() => setShowSavedView(false)}
                className='px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#1B998B]/90 transition-colors'
              >
                Explorer le contenu
              </button>
            </div>
          </div>
        ) : (
          <div className='px-8 py-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredSavedContents.map(content => (
                <div key={content.id}>
                  <ContentCard
                    content={content}
                    isSaved={true}
                    onToggleSave={handleToggleSave}
                    onClick={() => handleContentClick(content)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <ContentModal
          isOpen={showContentModal}
          content={selectedContent}
          isSaved={isSelectedContentSaved}
          onClose={handleCloseContentModal}
          onToggleSave={handleToggleSave}
        />

        <VideoPlayerModal
          isOpen={showVideoPlayer}
          content={selectedContent}
          isSaved={isSelectedContentSaved}
          onClose={handleCloseVideoPlayer}
          onToggleSave={handleToggleSave}
        />
      </div>
    );
  }

  // ==================== Main content view ====================
  return (
    <div className='min-h-screen'>
      <DashboardHeader />

      <ContentHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        recentSearches={recentSearches}
        onRecentSearchClick={handleRecentSearchClick}
        savedCount={savedIds.length}
        onSavedClick={() => setShowSavedView(true)}
      />

      <ContentTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        coursesCount={
          (contentsData?.contents || []).filter(c => c.type === 'course')
            .length || undefined
        }
      />

      {showFeatured && primaryFeatured && (
        <ContentFeatured
          content={primaryFeatured}
          onClick={() => handleContentClick(primaryFeatured)}
        />
      )}

      {showCategoryFilter && (
        <ContentCategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          customCategories={customCategories || []}
        />
      )}

      {isLoading ? (
        <div className='flex items-center justify-center py-16'>
          <div className='w-6 h-6 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
        </div>
      ) : (
        <ContentGrid
          contents={displayContents}
          savedIds={savedIds}
          activeTab={activeTab}
          searchQuery={searchQuery}
          onToggleSave={handleToggleSave}
          onContentClick={handleContentClick}
          onExploreAll={handleExploreAll}
        />
      )}

      <ContentModal
        isOpen={showContentModal}
        content={selectedContent}
        isSaved={isSelectedContentSaved}
        onClose={handleCloseContentModal}
        onToggleSave={handleToggleSave}
      />

      <VideoPlayerModal
        isOpen={showVideoPlayer}
        content={selectedContent}
        isSaved={isSelectedContentSaved}
        onClose={handleCloseVideoPlayer}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}
