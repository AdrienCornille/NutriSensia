'use client';

import React, { useCallback, useMemo } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const SVG_BASE = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const SMALL_SVG = { ...SVG_BASE, width: 16, height: 16 } as const;

const ICONS = {
  dashboard: (
    <svg {...SVG_BASE} aria-hidden='true'>
      <path d='M3 12 12 3l9 9' />
      <path d='M5 10v10h14V10' />
      <path d='M10 20v-6h4v6' />
    </svg>
  ),
  patients: (
    <svg {...SVG_BASE} aria-hidden='true'>
      <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
      <circle cx='9' cy='7' r='4' />
      <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
      <path d='M16 3.13a4 4 0 0 1 0 7.75' />
    </svg>
  ),
  calendar: (
    <svg {...SVG_BASE} aria-hidden='true'>
      <rect x='3' y='4' width='18' height='18' rx='2' />
      <path d='M16 2v4M8 2v4M3 10h18' />
    </svg>
  ),
  doc: (
    <svg {...SVG_BASE} aria-hidden='true'>
      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
      <path d='M14 2v6h6M9 13h6M9 17h6M9 9h2' />
    </svg>
  ),
  clock: (
    <svg {...SVG_BASE} aria-hidden='true'>
      <circle cx='12' cy='12' r='9' />
      <path d='M12 7v5l3 2' />
    </svg>
  ),
  message: (
    <svg {...SVG_BASE} aria-hidden='true'>
      <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
    </svg>
  ),
  bell: (
    <svg {...SVG_BASE} aria-hidden='true'>
      <path d='M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' />
      <path d='M13.73 21a2 2 0 0 1-3.46 0' />
    </svg>
  ),
  book: (
    <svg {...SVG_BASE} aria-hidden='true'>
      <path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' />
      <path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' />
    </svg>
  ),
  recipe: (
    <svg {...SVG_BASE} aria-hidden='true'>
      <path d='M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z' />
      <path d='M6 17h12' />
    </svg>
  ),
  settings: (
    <svg {...SMALL_SVG} aria-hidden='true'>
      <circle cx='12' cy='12' r='3' />
      <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
    </svg>
  ),
  user: (
    <svg {...SMALL_SVG} aria-hidden='true'>
      <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
      <circle cx='12' cy='7' r='4' />
    </svg>
  ),
  logout: (
    <svg {...SMALL_SVG} aria-hidden='true'>
      <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
      <polyline points='16 17 21 12 16 7' />
      <line x1='21' y1='12' x2='9' y2='12' />
    </svg>
  ),
};

const cabinetItems: Omit<NavItem, 'badge'>[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: ICONS.dashboard,
    href: '/dashboard/nutritionist',
  },
  {
    id: 'patients',
    label: 'Mes patients',
    icon: ICONS.patients,
    href: '/dashboard/nutritionist/patients',
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: ICONS.calendar,
    href: '/dashboard/nutritionist/agenda',
  },
  {
    id: 'consultations',
    label: 'Consultations',
    icon: ICONS.doc,
    href: '/dashboard/nutritionist/parametres/types-consultation',
  },
  {
    id: 'disponibilites',
    label: 'Disponibilités',
    icon: ICONS.clock,
    href: '/dashboard/nutritionist/disponibilites',
  },
  {
    id: 'messagerie',
    label: 'Messagerie',
    icon: ICONS.message,
    href: '/dashboard/nutritionist/messagerie',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: ICONS.bell,
    href: '/dashboard/nutritionist/notifications',
  },
];

const contenusItems: Omit<NavItem, 'badge'>[] = [
  {
    id: 'contenu',
    label: 'Contenu éducatif',
    icon: ICONS.book,
    href: '/dashboard/nutritionist/contenu',
  },
  {
    id: 'recettes',
    label: 'Recettes',
    icon: ICONS.recipe,
    href: '/dashboard/nutritionist/recettes',
  },
];

const footerItems: Omit<NavItem, 'badge'>[] = [
  {
    id: 'parametres',
    label: 'Paramètres',
    icon: ICONS.settings,
    href: '/dashboard/nutritionist/parametres',
  },
  {
    id: 'profil',
    label: 'Profil',
    icon: ICONS.user,
    href: '/dashboard/nutritionist/profil',
  },
];

interface NutritionistSidebarProps {
  unreadMessagesCount?: number;
  pendingAppointmentsCount?: number;
  unreadNotificationsCount?: number;
}

export const NutritionistSidebar = React.memo(function NutritionistSidebar({
  unreadMessagesCount = 0,
  pendingAppointmentsCount = 0,
  unreadNotificationsCount = 0,
}: NutritionistSidebarProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const enrichedCabinet: NavItem[] = useMemo(() => {
    return cabinetItems.map(item => {
      const badge =
        item.id === 'messagerie' && unreadMessagesCount > 0
          ? unreadMessagesCount
          : item.id === 'agenda' && pendingAppointmentsCount > 0
            ? pendingAppointmentsCount
            : item.id === 'notifications' && unreadNotificationsCount > 0
              ? unreadNotificationsCount
              : undefined;
      return { ...item, badge };
    });
  }, [unreadMessagesCount, pendingAppointmentsCount, unreadNotificationsCount]);

  const currentActiveId = useMemo(() => {
    if (
      pathname?.endsWith('/dashboard/nutritionist') ||
      pathname?.endsWith('/dashboard/nutritionist/')
    )
      return 'dashboard';
    if (pathname?.includes('/dashboard/nutritionist/patients'))
      return 'patients';
    if (pathname?.includes('/dashboard/nutritionist/agenda')) return 'agenda';
    if (
      pathname?.includes(
        '/dashboard/nutritionist/parametres/types-consultation'
      )
    )
      return 'consultations';
    if (pathname?.includes('/dashboard/nutritionist/disponibilites'))
      return 'disponibilites';
    if (pathname?.includes('/dashboard/nutritionist/messagerie'))
      return 'messagerie';
    if (pathname?.includes('/dashboard/nutritionist/notifications'))
      return 'notifications';
    if (pathname?.includes('/dashboard/nutritionist/contenu')) return 'contenu';
    if (pathname?.includes('/dashboard/nutritionist/recettes'))
      return 'recettes';
    if (pathname?.includes('/dashboard/nutritionist/profil')) return 'profil';
    if (pathname?.includes('/dashboard/nutritionist/parametres'))
      return 'parametres';
    return '';
  }, [pathname]);

  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    'Nutritionniste';
  const lastName = user?.user_metadata?.last_name || '';
  const displayName = lastName ? `${firstName} ${lastName}` : firstName;
  const userInitials =
    firstName.charAt(0).toUpperCase() +
    (lastName.charAt(0)?.toUpperCase() || 'N');

  const handleSignOut = useCallback(async () => {
    await signOut();
    window.location.href = '/';
  }, [signOut]);

  const renderLink = (item: NavItem) => {
    const active = currentActiveId === item.id;
    return (
      <Link
        key={item.id}
        href={item.href as any}
        className={active ? 'is-active' : ''}
        aria-current={active ? 'page' : undefined}
      >
        <span className='dp-ico' aria-hidden='true'>
          {item.icon}
        </span>
        <span className='dp-side-label'>{item.label}</span>
        {item.badge != null && <span className='dp-badge'>{item.badge}</span>}
      </Link>
    );
  };

  return (
    <aside className='dp-side'>
      <Link href='/' className='dp-side-brand'>
        <span className='dp-side-brand-mark'>N</span>
        <span className='dp-side-brand-name'>
          <b>NutriSensia</b>
          <span>Espace Pro</span>
        </span>
      </Link>

      <div className='dp-side-section'>Cabinet</div>
      <nav className='dp-nav'>{enrichedCabinet.map(renderLink)}</nav>

      <div className='dp-side-section'>Contenus</div>
      <nav className='dp-nav'>
        {contenusItems.map(item => renderLink(item as NavItem))}
      </nav>

      <div className='dp-side-foot'>
        <nav className='dp-nav'>
          {footerItems.map(item => renderLink(item as NavItem))}
          <button
            type='button'
            onClick={handleSignOut}
            className='dp-nav-signout'
            aria-label='Se déconnecter'
          >
            <span className='dp-ico' aria-hidden='true'>
              {ICONS.logout}
            </span>
            <span className='dp-side-label'>Déconnexion</span>
          </button>
        </nav>

        <Link
          href={'/dashboard/nutritionist/profil' as any}
          className='dp-user'
        >
          <span className='dp-user-avatar' aria-hidden='true'>
            {userInitials}
          </span>
          <div className='dp-user-meta'>
            <b>{displayName}</b>
            <span>Nutritionniste</span>
          </div>
        </Link>
      </div>
    </aside>
  );
});

export default NutritionistSidebar;
