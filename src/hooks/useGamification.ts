/**
 * React Query hooks pour le module Gamification (points, badges, streaks)
 */

import {
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

// ============================================================================
// TYPES
// ============================================================================

export interface GamificationPoints {
  total_points: number;
  level: number;
  next_level_points: number;
  points_to_next_level: number;
  points_this_week: number;
  points_this_month: number;
  rank: string;
  badges_count: number;
}

export interface BadgeCategory {
  slug: string;
  name: string;
  icon: string;
  color: string;
}

export interface UnlockedBadge {
  id: string;
  code: string;
  name: string;
  description: string;
  level: string;
  icon: string;
  emoji: string;
  image_url: string | null;
  color: string;
  points: number;
  category: BadgeCategory | null;
  unlocked_at: string;
  is_featured: boolean;
}

export interface LockedBadge {
  id: string;
  code: string;
  name: string;
  description: string;
  level: string;
  icon: string;
  emoji: string;
  image_url: string | null;
  color: string;
  points: number;
  category: BadgeCategory | null;
  progress: number;
  progress_data: any;
}

export interface BadgesResponse {
  badges: UnlockedBadge[];
  locked_badges: LockedBadge[];
  total_unlocked: number;
  total_available: number;
}

export interface StreakItem {
  id: string;
  type: string;
  current_count: number;
  longest_count: number;
  last_activity_date: string | null;
  streak_started_at: string | null;
  freeze_days_remaining: number;
  is_active: boolean;
}

export interface StreaksResponse {
  streaks: StreakItem[];
  primary_streak: {
    type: string;
    current_count: number;
    longest_count: number;
    is_active: boolean;
  };
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook pour récupérer les points et le niveau du patient
 */
export function useGamificationPoints(): UseQueryResult<GamificationPoints, Error> {
  return useQuery<GamificationPoints, Error>({
    queryKey: ['gamification', 'points'],
    queryFn: async () => {
      const response = await fetch('/api/protected/gamification', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des points');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour récupérer les badges du patient
 */
export function useBadges(): UseQueryResult<BadgesResponse, Error> {
  return useQuery<BadgesResponse, Error>({
    queryKey: ['gamification', 'badges'],
    queryFn: async () => {
      const response = await fetch('/api/protected/gamification/badges', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des badges');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer les streaks du patient
 */
export function useStreaks(): UseQueryResult<StreaksResponse, Error> {
  return useQuery<StreaksResponse, Error>({
    queryKey: ['gamification', 'streaks'],
    queryFn: async () => {
      const response = await fetch('/api/protected/gamification/streaks', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des streaks');
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
