'use client';

import React from 'react';
import { Library, FileText, Video, BookOpen, Mic, Bookmark } from 'lucide-react';
import type { ContentTab } from '@/types/content';

interface ContentTabsProps {
  activeTab: ContentTab;
  onTabChange: (tab: ContentTab) => void;
  savedCount: number;
}

const tabsConfig: { id: ContentTab; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Tout', icon: Library },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'videos', label: 'Vidéos', icon: Video },
  { id: 'guides', label: 'Guides', icon: BookOpen },
  { id: 'podcasts', label: 'Podcasts', icon: Mic },
  { id: 'saved', label: 'Sauvegardés', icon: Bookmark },
];

export function ContentTabs({ activeTab, onTabChange, savedCount }: ContentTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'saved' && savedCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ContentTabs;
