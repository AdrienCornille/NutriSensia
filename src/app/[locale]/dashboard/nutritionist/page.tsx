'use client';

import React, { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useNutritionistAppointments } from '@/hooks/useNutritionistAppointments';
import { HeroRibbon } from '@/components/nutritionist/dashboard/HeroRibbon';
import { TodayTimeline } from '@/components/nutritionist/dashboard/TodayTimeline';
import { TodoPanel } from '@/components/nutritionist/dashboard/TodoPanel';

export default function NutritionistDashboardPage() {
  const { user } = useAuth();
  const locale = useLocale();

  // Fetch confirmed appointments — broad enough to cover today + recent past
  const { data: upcoming } = useNutritionistAppointments('upcoming', 1, 50);
  const { data: past } = useNutritionistAppointments('past', 1, 20);

  const todayAppointments = useMemo(() => {
    const list = [
      ...(upcoming?.appointments ?? []),
      ...(past?.appointments ?? []),
    ];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const seen = new Set<string>();
    return list.filter(apt => {
      if (seen.has(apt.id)) return false;
      seen.add(apt.id);
      const start = new Date(apt.scheduled_at);
      return start >= todayStart && start < todayEnd;
    });
  }, [upcoming, past]);

  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    (locale === 'en' ? 'there' : 'à vous');

  return (
    <>
      <HeroRibbon firstName={firstName} todayAppointments={todayAppointments} />

      <div className='dp-grid'>
        <TodayTimeline appointments={todayAppointments} />
        <div className='dp-rightcol'>
          <TodoPanel />
        </div>
      </div>

      <footer className='dp-foot'>
        <span>
          NutriSensia Pro · v 2.4 ·{' '}
          {locale === 'en'
            ? 'end-to-end encrypted data'
            : 'données chiffrées de bout en bout'}
        </span>
        <span className='dp-foot-meta'>
          {locale === 'en'
            ? 'your tempo, their care…'
            : 'votre tempo, leur suivi…'}
        </span>
      </footer>
    </>
  );
}
