'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Star, Loader2, User } from 'lucide-react';
import type { RecipeReview } from '@/hooks/usePatientRecipes';

interface RecipeRatingProps {
  recipeId: string;
  currentRating: number | null;
  currentComment: string | null;
  averageRating: number;
  ratingCount: number;
  onRate: (
    recipeId: string,
    rating: number,
    comment: string | null
  ) => Promise<void>;
  isSubmitting?: boolean;
  reviews?: RecipeReview[];
  isLoadingReviews?: boolean;
}

function Stars({
  count,
  size = 'w-3.5 h-3.5',
}: {
  count: number;
  size?: string;
}) {
  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${size} ${
            star <= count ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Il y a ${diffD}j`;
  if (diffD < 30) return `Il y a ${Math.floor(diffD / 7)} sem.`;
  return date.toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function RecipeRating({
  recipeId,
  currentRating,
  currentComment,
  averageRating,
  ratingCount,
  onRate,
  isSubmitting = false,
  reviews = [],
  isLoadingReviews = false,
}: RecipeRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(
    currentRating
  );
  const [comment, setComment] = useState(currentComment || '');
  const [showComment, setShowComment] = useState(false);

  // Sync local state when props change (e.g. after data fetch)
  useEffect(() => {
    setSelectedRating(currentRating);
  }, [currentRating]);

  useEffect(() => {
    setComment(currentComment || '');
  }, [currentComment]);

  const handleStarClick = useCallback(
    async (star: number) => {
      setSelectedRating(star);
      if (!showComment) {
        await onRate(recipeId, star, comment || null);
      }
    },
    [recipeId, comment, showComment, onRate]
  );

  const handleSubmitWithComment = useCallback(async () => {
    if (selectedRating) {
      await onRate(recipeId, selectedRating, comment || null);
      setShowComment(false);
    }
  }, [recipeId, selectedRating, comment, onRate]);

  const displayRating = hovered || selectedRating || 0;

  // Reviews without the current user's (shown separately)
  const otherReviews = reviews.filter(r => !r.isOwn);

  return (
    <div>
      {/* ── Summary + Your rating ── */}
      <div className='flex flex-col sm:flex-row sm:items-start gap-6'>
        {/* Average summary */}
        <div className='flex flex-col items-center sm:min-w-[140px]'>
          <span className='text-4xl font-bold text-gray-800'>
            {ratingCount > 0 ? averageRating.toFixed(1) : '—'}
          </span>
          <Stars count={Math.round(averageRating)} size='w-4 h-4' />
          <span className='text-xs text-gray-400 mt-1'>
            {ratingCount} {ratingCount > 1 ? 'avis' : 'avis'}
          </span>
        </div>

        {/* Your rating form */}
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-700 mb-2'>Votre note</p>
          <div className='flex items-center gap-1'>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleStarClick(star)}
                disabled={isSubmitting}
                className='p-0.5 transition-transform hover:scale-110 disabled:opacity-50'
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= displayRating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200 hover:text-amber-200'
                  }`}
                />
              </button>
            ))}
            {isSubmitting && (
              <Loader2 className='w-4 h-4 animate-spin text-gray-400 ml-2' />
            )}
            {selectedRating && !showComment && (
              <button
                onClick={() => setShowComment(true)}
                className='ml-3 text-xs text-[#1B998B] hover:underline font-medium'
              >
                + Ajouter un commentaire
              </button>
            )}
          </div>

          {/* Comment input */}
          {showComment && (
            <div className='mt-3 space-y-2'>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder='Partagez votre expérience avec cette recette...'
                rows={3}
                maxLength={1000}
                className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] resize-none'
              />
              <div className='flex items-center gap-2 justify-end'>
                <button
                  onClick={() => setShowComment(false)}
                  className='px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700'
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitWithComment}
                  disabled={!selectedRating || isSubmitting}
                  className='px-4 py-1.5 text-xs bg-[#1B998B] text-white rounded-lg hover:bg-[#1B998B]/90 disabled:opacity-50 flex items-center gap-1 font-medium'
                >
                  {isSubmitting && <Loader2 className='w-3 h-3 animate-spin' />}
                  Publier
                </button>
              </div>
            </div>
          )}

          {/* Current user's existing comment */}
          {currentComment && !showComment && (
            <div className='mt-3 bg-[#1B998B]/5 rounded-lg px-3 py-2 border border-[#1B998B]/10'>
              <p className='text-sm text-gray-600 italic'>
                &quot;{currentComment}&quot;
              </p>
              <button
                onClick={() => setShowComment(true)}
                className='text-[10px] text-[#1B998B] hover:underline mt-1'
              >
                Modifier
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews list ── */}
      {(otherReviews.length > 0 || isLoadingReviews) && (
        <div className='mt-6 pt-6 border-t border-gray-100'>
          <h3 className='text-sm font-semibold text-gray-800 mb-4'>
            Avis des patients ({otherReviews.length})
          </h3>

          {isLoadingReviews ? (
            <div className='flex items-center justify-center py-6'>
              <Loader2 className='w-5 h-5 animate-spin text-gray-300' />
            </div>
          ) : (
            <div className='space-y-4'>
              {otherReviews.map(review => (
                <div key={review.id} className='flex gap-3'>
                  {/* Avatar */}
                  <div className='w-9 h-9 rounded-full bg-[#1B998B]/10 flex items-center justify-center flex-shrink-0'>
                    <User className='w-4 h-4 text-[#1B998B]' />
                  </div>

                  <div className='flex-1 min-w-0'>
                    {/* Author + date */}
                    <div className='flex items-center justify-between gap-2'>
                      <span className='text-sm font-medium text-gray-800'>
                        {review.author}
                      </span>
                      <span className='text-[10px] text-gray-400 whitespace-nowrap'>
                        {timeAgo(review.createdAt)}
                      </span>
                    </div>

                    {/* Stars */}
                    <Stars count={review.rating} size='w-3 h-3' />

                    {/* Comment */}
                    {review.comment && (
                      <p className='text-sm text-gray-600 mt-1 leading-relaxed'>
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RecipeRating;
