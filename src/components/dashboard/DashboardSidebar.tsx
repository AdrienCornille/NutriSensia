'use client';

import React, { useMemo, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  UtensilsCrossed,
  ClipboardList,
  TrendingUp,
  FolderOpen,
  Calendar,
  ChefHat,
  Apple,
  MessageSquare,
  Star,
  HelpCircle,
  User,
  LogOut,
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
    href: '/dashboard/patient',
  },
  {
    id: 'repas',
    label: 'Repas',
    icon: <UtensilsCrossed className='w-5 h-5' />,
    href: '/dashboard/patient/repas',
  },
  {
    id: 'plan',
    label: 'Plan alimentaire',
    icon: <ClipboardList className='w-5 h-5' />,
    href: '/dashboard/patient/plan',
  },
  {
    id: 'suivi',
    label: 'Suivi',
    icon: <TrendingUp className='w-5 h-5' />,
    href: '/dashboard/patient/suivi',
  },
  {
    id: 'dossier',
    label: 'Mon dossier',
    icon: <FolderOpen className='w-5 h-5' />,
    href: '/dashboard/patient/dossier',
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: <Calendar className='w-5 h-5' />,
    href: '/dashboard/patient/agenda',
  },
  {
    id: 'recettes',
    label: 'Recettes',
    icon: <ChefHat className='w-5 h-5' />,
    href: '/dashboard/patient/recettes',
  },
  {
    id: 'aliments',
    label: 'Base aliments',
    icon: <Apple className='w-5 h-5' />,
    href: '/dashboard/patient/aliments',
  },
  {
    id: 'messagerie',
    label: 'Messagerie',
    icon: <MessageSquare className='w-5 h-5' />,
    href: '/dashboard/patient/messagerie',
  },
  {
    id: 'contenu',
    label: 'Contenu exclusif',
    icon: <Star className='w-5 h-5' />,
    href: '/dashboard/patient/contenu',
  },
];

const navItemsBottom: NavItem[] = [
  { id: 'aide', label: 'Aide', icon: <HelpCircle className='w-5 h-5' /> },
  {
    id: 'profil',
    label: 'Profil',
    icon: <User className='w-5 h-5' />,
    href: '/dashboard/patient/profil',
  },
];

// ==================== COMPONENT ====================

interface DashboardSidebarProps {
  unreadMessagesCount?: number;
}

export function DashboardSidebar({
  unreadMessagesCount = 0,
}: DashboardSidebarProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState('dashboard');

  // Navigation items with dynamic badge
  const navItems: NavItem[] = useMemo(() => {
    return baseNavItems.map(item => {
      if (item.id === 'messagerie' && unreadMessagesCount > 0) {
        return { ...item, badge: unreadMessagesCount };
      }
      return item as NavItem;
    });
  }, [unreadMessagesCount]);

  // Determine active nav based on pathname
  const currentActiveNav = useMemo(() => {
    if (pathname?.includes('/dashboard/patient/repas')) return 'repas';
    if (pathname?.includes('/dashboard/patient/plan')) return 'plan';
    if (pathname?.includes('/dashboard/patient/suivi')) return 'suivi';
    if (pathname?.includes('/dashboard/patient/dossier')) return 'dossier';
    if (pathname?.includes('/dashboard/patient/agenda')) return 'agenda';
    if (pathname?.includes('/dashboard/patient/messagerie'))
      return 'messagerie';
    if (pathname?.includes('/dashboard/patient/recettes')) return 'recettes';
    if (pathname?.includes('/dashboard/patient/aliments')) return 'aliments';
    if (pathname?.includes('/dashboard/patient/contenu')) return 'contenu';
    if (pathname?.includes('/dashboard/patient/profil')) return 'profil';
    if (
      pathname?.endsWith('/dashboard/patient') ||
      pathname?.endsWith('/dashboard/patient/')
    )
      return 'dashboard';
    return activeNav;
  }, [pathname, activeNav]);

  // User info
  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    'Utilisateur';
  const userEmail = user?.email || 'utilisateur@email.ch';
  const userInitials =
    firstName.charAt(0).toUpperCase() +
    (user?.user_metadata?.last_name?.charAt(0)?.toUpperCase() || 'U');

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
          <span className='font-semibold text-gray-800 text-lg'>
            NutriSensia
          </span>
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
          {/* Bouton déconnexion */}
          <li>
            <button
              onClick={handleSignOut}
              className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-600 hover:bg-red-50 hover:text-red-600'
            >
              <LogOut className='w-5 h-5' />
              <span className='text-sm'>Déconnexion</span>
            </button>
          </li>
        </ul>
      </div>

      {/* User info */}
      <div className='p-4 border-t border-gray-200'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium'>
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

export default DashboardSidebar;
