'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ListFilterPills } from './ListFilterPills';
import { ListMealCard } from './ListMealCard';
import type { ListFilter, MealsListData } from '@/types/meals-history';

interface ListViewProps {
  data: MealsListData;
  filter: ListFilter;
  onFilterChange: (filter: ListFilter) => void;
  onLoadMore: () => void;
  onMealClick: (mealId: string) => void;
}

export function ListView({
  data,
  filter,
  onFilterChange,
  onLoadMore,
  onMealClick,
}: ListViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className='space-y-6'
    >
      {/* Filters */}
      <ListFilterPills activeFilter={filter} onFilterChange={onFilterChange} />

      {/* Grouped by date */}
      {data.groups.map(group => (
        <div key={group.label}>
          <h3 className='text-sm font-medium text-gray-500 mb-3'>
            {group.label}
          </h3>
          <div className='space-y-3'>
            {group.meals.map((meal, index) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ListMealCard
                  meal={meal}
                  onClick={() => onMealClick(meal.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {data.groups.length === 0 && (
        <div className='text-center py-12 px-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
            <span className='text-3xl'>🍽️</span>
          </div>
          <p className='text-lg font-medium text-gray-800 mb-2'>
            Aucun repas trouvé
          </p>
          <p className='text-sm text-gray-500'>
            {filter === 'all'
              ? 'Commencez à enregistrer vos repas pour suivre votre alimentation'
              : `Aucun ${filter === 'breakfast' ? 'petit-déjeuner' : filter === 'lunch' ? 'déjeuner' : filter === 'dinner' ? 'dîner' : 'collation'} enregistré`}
          </p>
        </div>
      )}

      {/* Load more */}
      {data.hasMore && (
        <div className='text-center pt-4'>
          <button
            onClick={onLoadMore}
            className='px-6 py-2 text-[#1B998B] font-medium hover:bg-[#1B998B]/10 rounded-lg transition-colors'
          >
            Charger plus de repas
          </button>
        </div>
      )}

      {/* Total count */}
      {data.totalCount > 0 && (
        <p className='text-center text-sm text-gray-400'>
          {data.totalCount} repas au total
        </p>
      )}
    </motion.div>
  );
}

export default ListView;
