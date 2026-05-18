'use client';

import React from 'react';
import { Eye, Heart, Bookmark, MessageCircle, TrendingUp } from 'lucide-react';
import { useContentStats } from '@/hooks/useContentInteractions';

export function ContentStatsPanel() {
  const { data: stats, isLoading } = useContentStats();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='w-6 h-6 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Vues totales',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Likes',
      value: stats.totalLikes,
      icon: Heart,
      color: 'text-red-500 bg-red-50',
    },
    {
      label: 'Sauvegardes',
      value: stats.totalSaves,
      icon: Bookmark,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Commentaires',
      value: stats.totalComments,
      icon: MessageCircle,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Stat cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map(stat => (
          <div
            key={stat.label}
            className='bg-white rounded-xl border border-gray-200 p-4'
          >
            <div className='flex items-center gap-3'>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className='w-5 h-5' />
              </div>
              <div>
                <p className='text-2xl font-semibold text-gray-900'>
                  {stat.value.toLocaleString('fr-FR')}
                </p>
                <p className='text-xs text-gray-500'>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Most popular */}
      {stats.mostPopular && stats.mostPopular.length > 0 && (
        <div className='bg-white rounded-xl border border-gray-200 p-5'>
          <h3 className='text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2'>
            <TrendingUp className='w-4 h-4 text-[#1B998B]' />
            Contenus les plus populaires
          </h3>
          <div className='space-y-2'>
            {stats.mostPopular.map((item, i) => (
              <div key={item.id} className='flex items-center gap-3 py-2'>
                <span className='w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600'>
                  {i + 1}
                </span>
                <span className='flex-1 text-sm text-gray-700 truncate'>
                  {item.title}
                </span>
                <span className='text-xs text-gray-400 flex items-center gap-1'>
                  <Eye className='w-3.5 h-3.5' />
                  {item.viewCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Views over time */}
      {stats.viewsOverTime && stats.viewsOverTime.length > 0 && (
        <div className='bg-white rounded-xl border border-gray-200 p-5'>
          <h3 className='text-sm font-semibold text-gray-900 mb-3'>
            Vues des 30 derniers jours
          </h3>
          <div className='flex items-end gap-1 h-32'>
            {stats.viewsOverTime.map(day => {
              const maxViews = Math.max(
                ...stats.viewsOverTime.map(d => d.views),
                1
              );
              const height = Math.max(4, (day.views / maxViews) * 100);
              return (
                <div
                  key={day.date}
                  className='flex-1 flex flex-col items-center justify-end'
                  title={`${new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}: ${day.views} vues`}
                >
                  <div
                    className='w-full bg-[#1B998B]/20 hover:bg-[#1B998B]/40 rounded-t transition-colors'
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className='flex justify-between mt-1'>
            <span className='text-xs text-gray-400'>Il y a 30j</span>
            <span className='text-xs text-gray-400'>Aujourd&apos;hui</span>
          </div>
        </div>
      )}
    </div>
  );
}
