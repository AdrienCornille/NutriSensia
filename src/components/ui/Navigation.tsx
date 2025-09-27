'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props pour un élément de navigation
 */
export interface NavigationItem {
  /**
   * Identifiant unique de l'élément
   */
  id: string;
  /**
   * Label affiché
   */
  label: string;
  /**
   * Icône de l'élément
   */
  icon?: React.ReactNode;
  /**
   * URL de destination
   */
  href?: string;
  /**
   * Élément actif
   */
  active?: boolean;
  /**
   * Élément désactivé
   */
  disabled?: boolean;
  /**
   * Sous-éléments
   */
  children?: NavigationItem[];
  /**
   * Fonction de clic personnalisée
   */
  onClick?: () => void;
}

/**
 * Props du composant Sidebar
 */
export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Éléments de navigation
   */
  items: NavigationItem[];
  /**
   * Élément actif
   */
  activeItem?: string;
  /**
   * Fonction appelée lors du clic sur un élément
   */
  onItemClick?: (item: NavigationItem) => void;
  /**
   * Afficher les icônes uniquement (mode compact)
   */
  compact?: boolean;
  /**
   * Largeur de la sidebar
   */
  width?: 'sm' | 'md' | 'lg';
}

/**
 * Props du composant Tabs
 */
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Onglets disponibles
   */
  tabs: NavigationItem[];
  /**
   * Onglet actif
   */
  activeTab?: string;
  /**
   * Fonction appelée lors du changement d'onglet
   */
  onTabChange?: (tab: NavigationItem) => void;
  /**
   * Orientation des onglets
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Taille des onglets
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant Sidebar selon le design system NutriSensia
 *
 * @example
 * ```tsx
 * <Sidebar
 *   items={[
 *     { id: 'dashboard', label: 'Tableau de bord', icon: <DashboardIcon /> },
 *     { id: 'patients', label: 'Patients', icon: <PatientsIcon /> },
 *   ]}
 *   activeItem="dashboard"
 *   onItemClick={(item) => console.log(item)}
 * />
 * ```
 */
export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      items,
      activeItem,
      onItemClick,
      compact = false,
      width = 'md',
      ...props
    },
    ref
  ) => {
    // Classes de base pour la sidebar
    const baseClasses = [
      'bg-primary-white',
      'border-r border-neutral-border',
      'transition-all duration-standard ease-out',
    ];

    // Classes pour la largeur
    const widthClasses = {
      sm: ['w-200dp'],
      md: ['w-240dp'],
      lg: ['w-280dp'],
    };

    // Classes pour le mode compact
    const compactClasses = compact ? ['w-72dp'] : [];

    // Combinaison de toutes les classes
    const sidebarClasses = cn(
      baseClasses,
      compact ? compactClasses : widthClasses[width],
      className
    );

    const handleItemClick = (item: NavigationItem) => {
      if (item.disabled) return;
      onItemClick?.(item);
      item.onClick?.();
    };

    return (
      <div ref={ref} className={sidebarClasses} {...props}>
        <nav className='p-16dp space-y-8dp'>
          {items.map(item => {
            const isActive = activeItem === item.id || item.active;
            const isDisabled = item.disabled;

            return (
              <div key={item.id}>
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={isDisabled}
                  className={cn(
                    'w-full flex items-center',
                    'px-16dp py-12dp',
                    'rounded-8dp',
                    'transition-all duration-standard ease-out',
                    'focus:outline-none focus:shadow-focus',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    {
                      'bg-primary text-white': isActive,
                      'text-neutral-dark hover:bg-secondary-pale':
                        !isActive && !isDisabled,
                      'text-neutral-medium': isDisabled,
                    }
                  )}
                >
                  {/* Icône */}
                  {item.icon && (
                    <span
                      className={cn(
                        'flex-shrink-0',
                        compact ? 'w-6 h-6' : 'w-5 h-5 mr-12dp'
                      )}
                    >
                      {item.icon}
                    </span>
                  )}

                  {/* Label (masqué en mode compact) */}
                  {!compact && (
                    <span className='text-body font-medium truncate'>
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip en mode compact */}
                  {compact && (
                    <div className='absolute left-full ml-8dp px-8dp py-4dp bg-neutral-dark text-white text-caption rounded-4dp opacity-0 group-hover:opacity-100 transition-opacity duration-standard pointer-events-none whitespace-nowrap'>
                      {item.label}
                    </div>
                  )}
                </button>

                {/* Sous-éléments */}
                {item.children && !compact && (
                  <div className='ml-24dp mt-8dp space-y-4dp'>
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => handleItemClick(child)}
                        disabled={child.disabled}
                        className={cn(
                          'w-full flex items-center',
                          'px-12dp py-8dp',
                          'rounded-6dp',
                          'text-body-small',
                          'transition-all duration-standard ease-out',
                          'focus:outline-none focus:shadow-focus',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          {
                            'bg-secondary-pale text-primary':
                              activeItem === child.id || child.active,
                            'text-neutral-medium hover:bg-neutral-light':
                              activeItem !== child.id &&
                              !child.active &&
                              !child.disabled,
                            'text-neutral-light': child.disabled,
                          }
                        )}
                      >
                        {child.icon && (
                          <span className='w-4 h-4 mr-8dp flex-shrink-0'>
                            {child.icon}
                          </span>
                        )}
                        <span className='truncate'>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    );
  }
);

Sidebar.displayName = 'Sidebar';

/**
 * Composant Tabs selon le design system NutriSensia
 *
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: 'overview', label: 'Vue d\'ensemble' },
 *     { id: 'details', label: 'Détails' },
 *   ]}
 *   activeTab="overview"
 *   onTabChange={(tab) => console.log(tab)}
 * />
 * ```
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      tabs,
      activeTab,
      onTabChange,
      orientation = 'horizontal',
      size = 'md',
      ...props
    },
    ref
  ) => {
    // Classes de base pour les tabs
    const baseClasses = [
      'border-b border-neutral-border',
      orientation === 'vertical' && 'border-b-0 border-r',
    ];

    // Classes pour l'orientation
    const orientationClasses = {
      horizontal: ['flex'],
      vertical: ['flex flex-col'],
    };

    // Classes pour la taille
    const sizeClasses = {
      sm: ['h-40dp'],
      md: ['h-48dp'],
      lg: ['h-56dp'],
    };

    // Combinaison de toutes les classes
    const tabsClasses = cn(
      baseClasses,
      orientationClasses[orientation],
      className
    );

    const handleTabClick = (tab: NavigationItem) => {
      if (tab.disabled) return;
      onTabChange?.(tab);
      tab.onClick?.();
    };

    return (
      <div ref={ref} className={tabsClasses} {...props}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id || tab.active;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              disabled={isDisabled}
              className={cn(
                'flex items-center justify-center',
                'px-24dp',
                sizeClasses[size],
                'text-body font-medium',
                'transition-all duration-standard ease-out',
                'focus:outline-none focus:shadow-focus',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'relative',
                {
                  'text-primary border-b-2 border-primary':
                    isActive && orientation === 'horizontal',
                  'text-primary border-r-2 border-primary':
                    isActive && orientation === 'vertical',
                  'text-neutral-medium hover:text-neutral-dark hover:bg-neutral-light':
                    !isActive && !isDisabled,
                  'text-neutral-light': isDisabled,
                }
              )}
            >
              {/* Icône */}
              {tab.icon && (
                <span className='w-5 h-5 mr-8dp flex-shrink-0'>{tab.icon}</span>
              )}

              {/* Label */}
              <span className='truncate'>{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

/**
 * Composant TabPanel pour afficher le contenu des onglets
 */
export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * ID de l'onglet associé
   */
  tabId: string;
  /**
   * Onglet actif
   */
  activeTab?: string;
  /**
   * Contenu du panel
   */
  children: React.ReactNode;
}

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ className, tabId, activeTab, children, ...props }, ref) => {
    const isActive = activeTab === tabId;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        className={cn('p-24dp', className)}
        role='tabpanel'
        aria-labelledby={`tab-${tabId}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabPanel.displayName = 'TabPanel';
