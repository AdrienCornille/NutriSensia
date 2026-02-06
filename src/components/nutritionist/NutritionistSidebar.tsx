'use client';

import React, { useMemo, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Settings,
  HelpCircle,
  User,
  LogOut,
  ClipboardList,
} from 'lucide-react';

// ==================== TYPES ====================

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  href?: string;
}

// ==================== NAV ITEMS ====================

const baseNavItems: Omit<NavItem, 'badge'>[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className='w-5 h-5' />,
    href: '/dashboard/nutritionist',
  },
  {
    id: 'patients',
    label: 'Mes patients',
    icon: <Users className='w-5 h-5' />,
    href: '/dashboard/nutritionist/patients',
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: <Calendar className='w-5 h-5' />,
    href: '/dashboard/nutritionist/agenda',
  },
  {
    id: 'consultations',
    label: 'Mes consultations',
    icon: <ClipboardList className='w-5 h-5' />,
    href: '/dashboard/nutritionist/parametres/types-consultation',
  },
  {
    id: 'disponibilites',
    label: 'Mes disponibilités',
    icon: <Clock className='w-5 h-5' />,
    href: '/dashboard/nutritionist/disponibilites',
  },
  {
    id: 'messagerie',
    label: 'Messagerie',
    icon: <MessageSquare className='w-5 h-5' />,
    href: '/dashboard/nutritionist/messagerie',
  },
];

const navItemsBottom: NavItem[] = [
  {
    id: 'parametres',
    label: 'Parametres',
    icon: <Settings className='w-5 h-5' />,
    href: '/dashboard/nutritionist/parametres',
  },
  { id: 'aide', label: 'Aide', icon: <HelpCircle className='w-5 h-5' /> },
  {
    id: 'profil',
    label: 'Profil',
    icon: <User className='w-5 h-5' />,
    href: '/dashboard/nutritionist/profil',
  },
];

// ==================== COMPONENT ====================

interface NutritionistSidebarProps {
  unreadMessagesCount?: number;
  pendingAppointmentsCount?: number;
}

export function NutritionistSidebar({
  unreadMessagesCount = 0,
  pendingAppointmentsCount = 0,
}: NutritionistSidebarProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState('dashboard');

  // Navigation items with dynamic badge
  const navItems: NavItem[] = useMemo(() => {
    return baseNavItems.map(item => {
      if (item.id === 'messagerie' && unreadMessagesCount > 0) {
        return { ...item, badge: unreadMessagesCount };
      }
      if (item.id === 'agenda' && pendingAppointmentsCount > 0) {
        return { ...item, badge: pendingAppointmentsCount };
      }
      return item as NavItem;
    });
  }, [unreadMessagesCount, pendingAppointmentsCount]);

  // Determine active nav based on pathname
  const currentActiveNav = useMemo(() => {
    if (pathname?.includes('/dashboard/nutritionist/patients'))
      return 'patients';
    if (pathname?.includes('/dashboard/nutritionist/agenda')) return 'agenda';
    if (pathname?.includes('/dashboard/nutritionist/disponibilites'))
      return 'disponibilites';
    if (pathname?.includes('/dashboard/nutritionist/parametres/types-consultation'))
      return 'consultations';
    if (pathname?.includes('/dashboard/nutritionist/messagerie'))
      return 'messagerie';
    if (pathname?.includes('/dashboard/nutritionist/parametres'))
      return 'parametres';
    if (pathname?.includes('/dashboard/nutritionist/profil')) return 'profil';
    if (
      pathname?.endsWith('/dashboard/nutritionist') ||
      pathname?.endsWith('/dashboard/nutritionist/')
    )
      return 'dashboard';
    return activeNav;
  }, [pathname, activeNav]);

  // User info
  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    'Nutritionniste';
  const userEmail = user?.email || 'nutritionniste@email.ch';
  const userInitials =
    firstName.charAt(0).toUpperCase() +
    (user?.user_metadata?.last_name?.charAt(0)?.toUpperCase() || 'N');

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isActive = (itemId: string) => currentActiveNav === itemId;

  return (
    <aside className='w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20'>
      {/* Logo */}
      <div className='p-6 border-b border-gray-200'>
        <Link href='/' className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-[#1B998B] rounded-lg flex items-center justify-center'>
            <img
              src='/images/logo-icon-white.png'
              alt='NutriSensia'
              className='w-6 h-6'
              onError={e => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerHTML =
                    '<span class="text-white font-bold text-lg">N</span>';
                }
              }}
            />
          </div>
          <div>
            <span className='font-semibold text-gray-800 text-lg block'>
              NutriSensia
            </span>
            <span className='text-xs text-[#1B998B]'>
              Espace Nutritionniste
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation principale */}
      <nav className='flex-1 p-4 overflow-y-auto'>
        <ul className='space-y-1'>
          {navItems.map(item => (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive(item.id)
                      ? 'bg-[#1B998B]/10 text-[#1B998B] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className='text-sm'>{item.label}</span>
                  {item.badge && (
                    <span className='ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full'>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive(item.id)
                      ? 'bg-[#1B998B]/10 text-[#1B998B] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className='text-sm'>{item.label}</span>
                  {item.badge && (
                    <span className='ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full'>
                      {item.badge}
                    </span>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Navigation secondaire */}
      <div className='p-4 border-t border-gray-200'>
        <ul className='space-y-1'>
          {navItemsBottom.map(item => (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive(item.id)
                      ? 'bg-[#1B998B]/10 text-[#1B998B] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className='text-sm'>{item.label}</span>
                </Link>
              ) : (
                <button
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive(item.id)
                      ? 'bg-[#1B998B]/10 text-[#1B998B] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className='text-sm'>{item.label}</span>
                </button>
              )}
            </li>
          ))}
          {/* Bouton deconnexion */}
          <li>
            <button
              onClick={handleSignOut}
              className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-600 hover:bg-red-50 hover:text-red-600'
            >
              <LogOut className='w-5 h-5' />
              <span className='text-sm'>Deconnexion</span>
            </button>
          </li>
        </ul>
      </div>

      {/* User info */}
      <div className='p-4 border-t border-gray-200'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-[#1B998B]/20 rounded-full flex items-center justify-center text-[#1B998B] font-medium'>
            {userInitials}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-gray-800 truncate'>
              {firstName}
            </p>
            <p className='text-xs text-gray-500 truncate'>{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default NutritionistSidebar;
