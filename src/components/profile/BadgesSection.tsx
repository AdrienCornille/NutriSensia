'use client';

import React, { useState, useEffect } from 'react';
import { BadgeCollection, StreakCard, CelebrationModal } from '@/components/gamification';
import type { Badge, StreakData, CelebrationData } from '@/types/gamification';
import { getBadges, getStreakData } from '@/data/mock-gamification';

export function BadgesSection() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load gamification data
    const loadData = () => {
      setBadges(getBadges());
      setStreak(getStreakData());
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    if (badge.unlockedAt) {
      setCelebration({
        type: 'badge_unlock',
        title: badge.name,
        message: badge.description,
        badge,
        confetti: false,
      });
    }
  };

  const handleCloseCelebration = () => {
    setCelebration(null);
    setSelectedBadge(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B998B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streak Card */}
      {streak && (
        <StreakCard streak={streak} variant="large" showBestStreak />
      )}

      {/* Badge Collection */}
      <BadgeCollection
        badges={badges}
        onBadgeClick={handleBadgeClick}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        celebration={celebration}
        onClose={handleCloseCelebration}
      />
    </div>
  );
}

export default BadgesSection;
