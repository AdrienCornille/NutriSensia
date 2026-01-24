'use client';

import React, { useReducer, useEffect, useState } from 'react';
import {
  contentReducer,
  contentInitialState,
  filterContent,
  type ContentTab,
  type ContentCategory,
  type Content,
} from '@/types/content';
import {
  mockContents,
  featuredContent,
  progressCourses,
  defaultSavedIds,
} from '@/data/mock-content';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  ContentHeader,
  ContentTabs,
  ContentCategoryFilter,
  ContentFeatured,
  ContentProgressCourses,
  ContentGrid,
  ContentModal,
  VideoPlayerModal,
} from '@/components/content';

const STORAGE_KEY = 'nutrisensia-content-saved';

export default function ContenuPage() {
  const [state, dispatch] = useReducer(contentReducer, {
    ...contentInitialState,
    savedIds: defaultSavedIds,
  });

  const [recentSearches, setRecentSearches] = useState<string[]>([
    'nutrition',
    'recettes',
    'motivation',
  ]);

  // Load saved IDs from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const savedIds = JSON.parse(savedData);
      dispatch({ type: 'LOAD_SAVED_IDS', payload: savedIds });
    }
  }, []);

  // Save to localStorage when savedIds changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedIds));
  }, [state.savedIds]);

  // Filter contents
  const filteredContents = filterContent(
    mockContents,
    state.activeTab,
    state.activeCategory,
    state.searchQuery,
    state.savedIds
  );


  // Handlers
  const handleSearchChange = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const handleTabChange = (tab: ContentTab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  const handleCategoryChange = (category: ContentCategory) => {
    dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: category });
  };

  const handleToggleSave = (contentId: string) => {
    dispatch({ type: 'TOGGLE_SAVE', payload: contentId });
  };

  const handleContentClick = (content: Content) => {
    // Add to recent searches if there was a search query
    if (state.searchQuery && !recentSearches.includes(state.searchQuery)) {
      setRecentSearches((prev) => [state.searchQuery, ...prev.slice(0, 4)]);
    }

    if (content.type === 'video') {
      dispatch({ type: 'OPEN_VIDEO_PLAYER', payload: content });
    } else {
      dispatch({ type: 'OPEN_CONTENT_MODAL', payload: content });
    }
  };

  const handleFeaturedClick = () => {
    dispatch({ type: 'OPEN_CONTENT_MODAL', payload: featuredContent });
  };

  const handleCloseContentModal = () => {
    dispatch({ type: 'CLOSE_CONTENT_MODAL' });
  };

  const handleCloseVideoPlayer = () => {
    dispatch({ type: 'CLOSE_VIDEO_PLAYER' });
  };

  const handleExploreAll = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'all' });
  };

  const handleRecentSearchClick = (term: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: term });
  };

  const handleContinueCourse = (courseId: string) => {
    // TODO: Navigate to course page
    console.log('Continue course:', courseId);
  };

  // Check if selected content is saved
  const isSelectedContentSaved = state.selectedContent
    ? state.savedIds.includes(state.selectedContent.id)
    : false;

  // Show featured and courses only on "all" tab without search
  const showFeatured = state.activeTab === 'all' && !state.searchQuery;
  const showProgressCourses = state.activeTab === 'all' && !state.searchQuery;
  const showCategoryFilter = state.activeTab === 'all' && !state.searchQuery;

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <ContentHeader
        searchQuery={state.searchQuery}
        onSearchChange={handleSearchChange}
        recentSearches={recentSearches}
        onRecentSearchClick={handleRecentSearchClick}
      />

      <ContentTabs
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
        savedCount={state.savedIds.length}
      />

      {showFeatured && <ContentFeatured content={featuredContent} onClick={handleFeaturedClick} />}

      {showProgressCourses && (
        <ContentProgressCourses courses={progressCourses} onContinue={handleContinueCourse} />
      )}

      {showCategoryFilter && (
        <ContentCategoryFilter
          activeCategory={state.activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      <ContentGrid
        contents={filteredContents}
        savedIds={state.savedIds}
        activeTab={state.activeTab}
        searchQuery={state.searchQuery}
        onToggleSave={handleToggleSave}
        onContentClick={handleContentClick}
        onExploreAll={handleExploreAll}
      />

      <ContentModal
        isOpen={state.showContentModal}
        content={state.selectedContent}
        isSaved={isSelectedContentSaved}
        onClose={handleCloseContentModal}
        onToggleSave={handleToggleSave}
      />

      <VideoPlayerModal
        isOpen={state.showVideoPlayer}
        content={state.selectedContent}
        isSaved={isSelectedContentSaved}
        onClose={handleCloseVideoPlayer}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}
