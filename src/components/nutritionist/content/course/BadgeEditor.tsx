'use client';

import React, { useState, useEffect } from 'react';
import { Award, Save, Loader2, Star } from 'lucide-react';
import { useCourseBadge, useUpsertBadge } from '@/hooks/useCourseBuilder';

interface BadgeEditorProps {
  courseId: string;
}

export function BadgeEditor({ courseId }: BadgeEditorProps) {
  const { data: badge, isLoading } = useCourseBadge(courseId);
  const upsertMutation = useUpsertBadge();

  const [badgeName, setBadgeName] = useState('');
  const [badgeIcon, setBadgeIcon] = useState('');
  const [pointsAwarded, setPointsAwarded] = useState(0);

  useEffect(() => {
    if (badge) {
      setBadgeName(badge.badge_name || '');
      setBadgeIcon(badge.badge_icon || '');
      setPointsAwarded(badge.points_awarded ?? 0);
    }
  }, [badge]);

  const handleSave = () => {
    if (!badgeName.trim() || !badgeIcon.trim()) return;
    upsertMutation.mutate({
      courseId,
      data: {
        badge_name: badgeName.trim(),
        badge_icon: badgeIcon.trim(),
        points_awarded: pointsAwarded || undefined,
      },
    });
  };

  const hasBadge = badge && badge.badge_name;
  const hasChanges =
    badgeName !== (badge?.badge_name || '') ||
    badgeIcon !== (badge?.badge_icon || '') ||
    pointsAwarded !== (badge?.points_awarded ?? 0);

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center justify-center py-12'>
          <div className='w-6 h-6 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-5'>
      <div className='flex items-center gap-2'>
        <Award className='w-5 h-5 text-primary' />
        <h3 className='text-lg font-semibold text-gray-900'>
          Badge de compl&eacute;tion
        </h3>
      </div>

      {!hasBadge && !badgeName && (
        <div className='text-center py-6 text-gray-500 text-sm'>
          <Award className='w-8 h-8 mx-auto mb-2 text-gray-300' />
          Aucun badge configur&eacute;. Ajoutez un badge pour r&eacute;compenser
          les patients qui terminent ce cours.
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Form fields */}
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Nom du badge
            </label>
            <input
              type='text'
              value={badgeName}
              onChange={e => setBadgeName(e.target.value)}
              placeholder='Ex : Expert Nutrition'
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Ic&ocirc;ne (emoji)
            </label>
            <div className='flex items-center gap-3'>
              <input
                type='text'
                value={badgeIcon}
                onChange={e => setBadgeIcon(e.target.value)}
                placeholder='Ex : 🏆'
                className='w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
              />
              {badgeIcon && (
                <span
                  className='text-3xl'
                  role='img'
                  aria-label='Aper&ccedil;u du badge'
                >
                  {badgeIcon}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Points attribu&eacute;s
            </label>
            <input
              type='number'
              min={0}
              value={pointsAwarded}
              onChange={e => setPointsAwarded(Number(e.target.value))}
              placeholder='0'
              className='w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
            />
            <p className='text-xs text-gray-400 mt-1'>
              Nombre de points ajout&eacute;s au score du patient
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={
              !badgeName.trim() ||
              !badgeIcon.trim() ||
              upsertMutation.isPending ||
              !hasChanges
            }
            className='flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {upsertMutation.isPending ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <Save className='w-3.5 h-3.5' />
            )}
            Enregistrer
          </button>

          {upsertMutation.isSuccess && (
            <p className='text-xs text-green-600'>
              Badge enregistr&eacute; avec succ&egrave;s.
            </p>
          )}
        </div>

        {/* Badge preview */}
        {(badgeName || badgeIcon) && (
          <div>
            <p className='text-sm font-medium text-gray-500 mb-3'>
              Aper&ccedil;u
            </p>
            <div className='flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-[#1B998B]/5 to-[#1B998B]/10 rounded-xl border border-[#1B998B]/20'>
              <div className='w-20 h-20 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100'>
                <span className='text-4xl'>{badgeIcon || '🏅'}</span>
              </div>
              <span className='text-sm font-semibold text-gray-900'>
                {badgeName || 'Nom du badge'}
              </span>
              {pointsAwarded > 0 && (
                <span className='inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full'>
                  <Star className='w-3 h-3' />+{pointsAwarded} points
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
