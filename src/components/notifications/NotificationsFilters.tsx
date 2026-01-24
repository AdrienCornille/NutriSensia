'use client';

import React from 'react';
import type { NotificationFilter, NotificationFilterConfig } from '@/types/notifications';

interface NotificationsFiltersProps {
  filters: NotificationFilterConfig[];
  activeFilter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
}

export function NotificationsFilters({
  filters,
  activeFilter,
  onFilterChange,
}: NotificationsFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeFilter === filter.id
              ? 'bg-[#1B998B] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {filter.label}
          {filter.count > 0 && (
            <span
              className={`ml-1.5 ${
                activeFilter === filter.id ? 'text-white/70' : 'text-gray-400'
              }`}
            >
              {filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default NotificationsFilters;
