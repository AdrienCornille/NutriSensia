'use client';

import React from 'react';
import { Library, Search, Bookmark } from 'lucide-react';
import type { Content, ContentTab } from '@/types/content';
import { ContentCard } from './ContentCard';

interface ContentGridProps {
  contents: Content[];
  savedIds: string[];
  activeTab: ContentTab;
  searchQuery: string;
  onToggleSave: (contentId: string) => void;
  onContentClick: (content: Content) => void;
  onExploreAll?: () => void;
}

export function ContentGrid({
  contents,
  savedIds,
  activeTab,
  searchQuery,
  onToggleSave,
  onContentClick,
  onExploreAll,
}: ContentGridProps) {
  // Title based on context
  const getTitle = () => {
    if (searchQuery) {
      return `Résultats pour "${searchQuery}" (${contents.length})`;
    }
    if (activeTab === 'saved') {
      return `Contenu sauvegardé (${contents.length})`;
    }
    if (activeTab === 'all') {
      return 'Dernières publications';
    }
    const tabLabels: Record<string, string> = {
      articles: 'Articles',
      videos: 'Vidéos',
      guides: 'Guides',
      podcasts: 'Podcasts',
    };
    return `${tabLabels[activeTab] || 'Contenu'} (${contents.length})`;
  };

  if (contents.length === 0) {
    return (
      <div className="px-8 py-6">
        <h2 className="font-semibold text-gray-800 mb-4">{getTitle()}</h2>
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          {activeTab === 'saved' ? (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">Aucun contenu sauvegardé</p>
              <button
                onClick={onExploreAll}
                className="px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#1B998B]/90 transition-colors"
              >
                Explorer le contenu
              </button>
            </>
          ) : searchQuery ? (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Aucun contenu trouvé pour "{searchQuery}"</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Library className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Aucun contenu disponible</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <h2 className="font-semibold text-gray-800 mb-4">{getTitle()}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((content) => (
          <ContentCard
            key={content.id}
            content={content}
            isSaved={savedIds.includes(content.id)}
            onToggleSave={onToggleSave}
            onClick={() => onContentClick(content)}
          />
        ))}
      </div>

      {/* Load more button */}
      {contents.length >= 6 && (
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Charger plus de contenu
          </button>
        </div>
      )}
    </div>
  );
}

export default ContentGrid;
