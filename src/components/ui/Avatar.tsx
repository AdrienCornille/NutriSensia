'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props du composant Avatar
 */
export interface AvatarProps {
  /**
   * URL de l'image de profil
   */
  src?: string | null;
  /**
   * Nom de l'utilisateur pour les initiales
   */
  name?: string;
  /**
   * Email de l'utilisateur (fallback)
   */
  email?: string;
  /**
   * Taille de l'avatar
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Classes CSS personnalisées
   */
  className?: string;
  /**
   * État de chargement
   */
  loading?: boolean;
  /**
   * Callback en cas d'erreur de chargement d'image
   */
  onError?: () => void;
  /**
   * Callback au clic
   */
  onClick?: () => void;
  /**
   * Rendre l'avatar cliquable
   */
  clickable?: boolean;
}

/**
 * Composant Avatar pour afficher la photo de profil utilisateur
 *
 * @example
 * ```tsx
 * <Avatar
 *   src={user.avatar_url}
 *   name={user.full_name}
 *   size="lg"
 *   clickable
 *   onClick={() => console.log('Avatar cliqué')}
 * />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  email,
  size = 'md',
  className,
  loading = false,
  onError,
  onClick,
  clickable = false,
}) => {
  const [imageError, setImageError] = React.useState(false);

  // Tailles de l'avatar
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  /**
   * Génère les initiales à partir du nom
   */
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Génère un fallback à partir de l'email
   */
  const getEmailFallback = (email: string): string => {
    return email.charAt(0).toUpperCase();
  };

  /**
   * Gère l'erreur de chargement d'image
   */
  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  /**
   * Détermine le contenu à afficher
   */
  const getContent = () => {
    if (loading) {
      return (
        <div className='animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-full h-full' />
      );
    }

    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={name ? `Photo de profil de ${name}` : 'Photo de profil'}
          className='w-full h-full object-cover rounded-full'
          onError={handleImageError}
        />
      );
    }

    // Fallback avec initiales ou première lettre de l'email
    const fallbackText = name
      ? getInitials(name)
      : email
        ? getEmailFallback(email)
        : '?';

    return (
      <div className='w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center rounded-full'>
        {fallbackText}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'relative inline-block rounded-full overflow-hidden',
        sizeClasses[size],
        clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {getContent()}
    </div>
  );
};

export default Avatar;
