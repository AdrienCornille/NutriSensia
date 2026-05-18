'use client';

import React, { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Bell, MessageSquare, Plus, Search } from 'lucide-react';

interface DashboardTopBarProps {
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
}

export function DashboardTopBar({
  unreadMessagesCount = 0,
  unreadNotificationsCount = 0,
}: DashboardTopBarProps) {
  const locale = useLocale();

  const { dateLabel, weekLabel } = useMemo(() => {
    const now = new Date();
    const lang = locale === 'en' ? 'en-US' : 'fr-FR';
    const dateLabel = new Intl.DateTimeFormat(lang, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(now);
    const weekNumber = getISOWeek(now);
    const year = now.getFullYear();
    const weekPrefix = locale === 'en' ? 'Week' : 'Semaine';
    const weekLabel = `${weekPrefix} ${weekNumber} · ${year}`;
    return { dateLabel, weekLabel };
  }, [locale]);

  return (
    <div className='dp-top'>
      <div className='dp-top-date'>
        <b>{dateLabel}</b>
        <span>{weekLabel}</span>
      </div>

      <div className='dp-search'>
        <span className='dp-search-ico' aria-hidden='true'>
          <Search className='w-4 h-4' strokeWidth={1.8} />
        </span>
        <input
          type='text'
          placeholder={
            locale === 'en'
              ? 'Search a patient, consultation, note…'
              : 'Chercher un patient, une consultation, une note…'
          }
        />
      </div>

      <div className='dp-top-actions'>
        <Link
          href={'/dashboard/nutritionist/notifications' as any}
          className='dp-iconbtn'
          aria-label='Notifications'
        >
          <Bell className='w-[18px] h-[18px]' strokeWidth={1.8} />
          {unreadNotificationsCount > 0 ? <span className='dp-dot' /> : null}
        </Link>
        <Link
          href={'/dashboard/nutritionist/messagerie' as any}
          className='dp-iconbtn'
          aria-label='Messagerie'
        >
          <MessageSquare className='w-[18px] h-[18px]' strokeWidth={1.8} />
          {unreadMessagesCount > 0 ? <span className='dp-dot' /> : null}
        </Link>
        <Link href={'/dashboard/nutritionist/agenda' as any} className='dp-cta'>
          <Plus className='w-[14px] h-[14px]' strokeWidth={2.2} />
          {locale === 'en' ? 'New consultation' : 'Nouvelle consultation'}
        </Link>
      </div>
    </div>
  );
}

// ISO 8601 week number
function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default DashboardTopBar;
