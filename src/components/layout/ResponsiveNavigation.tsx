import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveSidebarProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'default' | 'compact' | 'overlay';
  width?: 'sm' | 'md' | 'lg';
}

/**
 * Sidebar responsive avec différentes variantes
 *
 * @param variant - Type de sidebar
 *   - default: Sidebar fixe 240dp (desktop)
 *   - compact: Sidebar réduite pour économiser l'espace
 *   - overlay: Sidebar en overlay sur mobile
 *
 * @param width - Largeur de la sidebar
 *   - sm: 200dp
 *   - md: 240dp (spécification design system)
 *   - lg: 280dp
 */
export function ResponsiveSidebar({
  children,
  className,
  isOpen = true,
  onClose,
  variant = 'default',
  width = 'md',
}: ResponsiveSidebarProps) {
  const widthClasses = {
    sm: 'w-200dp',
    md: 'w-240dp',
    lg: 'w-280dp',
  };

  const variantClasses = {
    default:
      'fixed left-0 top-0 h-full bg-background-primary border-r border-neutral-border z-40',
    compact:
      'fixed left-0 top-0 h-full bg-background-primary border-r border-neutral-border z-40 w-64dp',
    overlay:
      'fixed left-0 top-0 h-full bg-background-primary border-r border-neutral-border z-50 shadow-xl',
  };

  const mobileClasses = 'lg:translate-x-0 lg:static lg:shadow-none';
  const overlayClasses = variant === 'overlay' ? 'lg:hidden' : '';

  return (
    <>
      {/* Overlay pour mobile */}
      {variant === 'overlay' && isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          variantClasses[variant],
          widthClasses[width],
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          mobileClasses,
          overlayClasses,
          className
        )}
      >
        <div className='flex flex-col h-full'>{children}</div>
      </aside>
    </>
  );
}

export interface ResponsiveTabsProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Onglets responsive avec orientation adaptative
 *
 * @param orientation - Orientation des onglets
 *   - horizontal: Onglets horizontaux (desktop)
 *   - vertical: Onglets verticaux (mobile)
 *
 * @param variant - Style des onglets
 *   - default: Style standard avec bordure inférieure
 *   - pills: Style en pilules
 *   - underline: Style avec soulignement
 *
 * @param size - Taille des onglets
 *   - sm: 40dp de hauteur
 *   - md: 48dp de hauteur (spécification design system)
 *   - lg: 56dp de hauteur
 */
export function ResponsiveTabs({
  children,
  className,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
}: ResponsiveTabsProps) {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };

  const variantClasses = {
    default: 'border-b border-neutral-border',
    pills: 'space-x-8dp',
    underline: 'border-b border-neutral-border',
  };

  const sizeClasses = {
    sm: 'h-40dp',
    md: 'h-48dp',
    lg: 'h-56dp',
  };

  return (
    <div
      className={cn(
        'flex',
        orientationClasses[orientation],
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      role='tablist'
    >
      {children}
    </div>
  );
}

export interface ResponsiveTabProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * Onglet individuel pour ResponsiveTabs
 */
export function ResponsiveTab({
  children,
  className,
  isActive = false,
  onClick,
  disabled = false,
  icon,
}: ResponsiveTabProps) {
  return (
    <button
      className={cn(
        'flex items-center justify-center px-16dp py-12dp text-body font-medium transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'text-primary border-b-2 border-primary bg-background-accent'
          : 'text-neutral-medium hover:text-neutral-dark hover:bg-background-secondary',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      role='tab'
      aria-selected={isActive}
    >
      {icon && <span className='mr-8dp'>{icon}</span>}
      {children}
    </button>
  );
}

export interface MobileNavigationProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  variant?: 'bottom' | 'top' | 'drawer';
}

/**
 * Navigation mobile avec différentes variantes
 *
 * @param variant - Type de navigation mobile
 *   - bottom: Navigation en bas d'écran (72dp de hauteur)
 *   - top: Navigation en haut d'écran
 *   - drawer: Navigation en tiroir latéral
 */
export function MobileNavigation({
  children,
  className,
  isOpen = false,
  onToggle,
  variant = 'bottom',
}: MobileNavigationProps) {
  const variantClasses = {
    bottom:
      'fixed bottom-0 left-0 right-0 h-72dp bg-background-primary border-t border-neutral-border z-50',
    top: 'fixed top-0 left-0 right-0 h-72dp bg-background-primary border-b border-neutral-border z-50',
    drawer:
      'fixed top-0 right-0 h-full w-280dp bg-background-primary border-l border-neutral-border z-50 transform transition-transform duration-300',
  };

  const drawerClasses =
    variant === 'drawer'
      ? cn(
          'transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )
      : '';

  return (
    <>
      {/* Overlay pour drawer */}
      {variant === 'drawer' && isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40'
          onClick={onToggle}
        />
      )}

      <nav
        className={cn(
          variantClasses[variant],
          drawerClasses,
          'lg:hidden',
          className
        )}
      >
        <div className='flex items-center justify-center h-full'>
          {children}
        </div>
      </nav>
    </>
  );
}

// Export par défaut supprimé car ResponsiveNavigation n'est pas défini
// Les composants individuels sont exportés nommément
