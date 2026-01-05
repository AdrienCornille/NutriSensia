/**
 * Composant de barre de progression détaillée du profil
 *
 * Affiche une barre de progression avec détails par catégorie :
 * - Progression globale avec animation
 * - Détail par catégorie (basique, professionnel, médical, etc.)
 * - Indicateurs visuels pour chaque section
 * - Actions rapides pour compléter les sections manquantes
 */

'use client';

import { motion } from 'framer-motion';
import {
  User,
  Briefcase,
  Heart,
  Phone,
  Settings,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import type { UserRole, ProfileData } from '@/lib/profile-completion';

interface ProfileProgressBarProps {
  /** Données du profil */
  profileData: Partial<ProfileData>;
  /** Rôle de l'utilisateur */
  role: UserRole;
  /** Callback pour naviguer vers une section spécifique */
  onNavigateToSection?: (category: string) => void;
  /** Affichage vertical ou horizontal */
  orientation?: 'horizontal' | 'vertical';
  /** Classe CSS personnalisée */
  className?: string;
}

/**
 * Configuration des catégories avec icônes et couleurs
 */
const categoryConfig = {
  basic: {
    icon: User,
    label: 'Informations de base',
    color: 'blue',
    description: 'Nom, prénom, photo de profil',
  },
  professional: {
    icon: Briefcase,
    label: 'Informations professionnelles',
    color: 'purple',
    description: 'Certifications, spécialisations, tarifs',
  },
  medical: {
    icon: Heart,
    label: 'Informations médicales',
    color: 'red',
    description: 'Santé, allergies, conditions médicales',
  },
  contact: {
    icon: Phone,
    label: 'Coordonnées',
    color: 'green',
    description: "Téléphone, adresse, contact d'urgence",
  },
  preferences: {
    icon: Settings,
    label: 'Préférences',
    color: 'gray',
    description: 'Langue, fuseau horaire, notifications',
  },
};

/**
 * Composant de barre de progression simple
 */
const ProgressBar = ({
  percentage,
  color = 'blue',
  height = 'h-2',
  animated = true,
}: {
  percentage: number;
  color?: string;
  height?: string;
  animated?: boolean;
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    gray: 'bg-gray-500',
  };

  return (
    <div
      className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}
    >
      <motion.div
        className={`${height} ${colorClasses[color as keyof typeof colorClasses]} rounded-full`}
        initial={{ width: animated ? 0 : `${percentage}%` }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: animated ? 1 : 0, ease: 'easeOut' }}
      />
    </div>
  );
};

/**
 * Composant d'élément de catégorie
 */
const CategoryItem = ({
  category,
  percentage,
  config,
  onNavigate,
  index,
}: {
  category: string;
  percentage: number;
  config: (typeof categoryConfig)[keyof typeof categoryConfig];
  onNavigate?: (category: string) => void;
  index: number;
}) => {
  const Icon = config.icon;
  const isComplete = percentage >= 100;

  return (
    <motion.div
      className={`p-4 rounded-lg border transition-all duration-200 ${
        onNavigate
          ? 'hover:shadow-md hover:border-gray-300 cursor-pointer'
          : 'border-gray-200'
      } ${isComplete ? 'bg-green-50 border-green-200' : 'bg-white'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onNavigate?.(category)}
    >
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center space-x-3'>
          <div
            className={`p-2 rounded-lg ${
              isComplete
                ? 'bg-green-100 text-green-600'
                : `bg-${config.color}-100 text-${config.color}-600`
            }`}
          >
            {isComplete ? (
              <Check className='w-5 h-5' />
            ) : (
              <Icon className='w-5 h-5' />
            )}
          </div>
          <div>
            <h4 className='font-medium text-gray-900'>{config.label}</h4>
            <p className='text-sm text-gray-500'>{config.description}</p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <span
            className={`text-sm font-medium ${
              isComplete ? 'text-green-600' : 'text-gray-600'
            }`}
          >
            {percentage}%
          </span>
          {onNavigate && <ChevronRight className='w-4 h-4 text-gray-400' />}
        </div>
      </div>

      <ProgressBar
        percentage={percentage}
        color={isComplete ? 'green' : config.color}
        height='h-2'
      />
    </motion.div>
  );
};

/**
 * Composant principal de la barre de progression
 */
export const ProfileProgressBar = ({
  profileData,
  role,
  onNavigateToSection,
  orientation = 'vertical',
  className = '',
}: ProfileProgressBarProps) => {
  const { completion, isLoading } = useProfileCompletion({ profileData, role });

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className='animate-pulse'>
            <div className='h-4 bg-gray-200 rounded w-1/3 mb-2'></div>
            <div className='h-2 bg-gray-200 rounded'></div>
          </div>
        ))}
      </div>
    );
  }

  if (!completion) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Settings className='w-12 h-12 mx-auto mb-2 opacity-50' />
        <p>Aucune donnée de progression disponible</p>
      </div>
    );
  }

  const { percentage: globalPercentage, categoryBreakdown } = completion;

  // Filtrer les catégories pertinentes selon le rôle
  const relevantCategories = Object.entries(categoryBreakdown).filter(
    ([category, percentage]) => {
      if (role === 'nutritionist' && category === 'medical') return false;
      if (role === 'patient' && category === 'professional') return false;
      return (
        percentage > 0 ||
        Object.keys(profileData).some(
          key => categoryConfig[category as keyof typeof categoryConfig]
        )
      );
    }
  );

  return (
    <div className={`${className}`}>
      {/* Progression globale */}
      <motion.div
        className='mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Progression globale
          </h3>
          <span className='text-2xl font-bold text-blue-600'>
            {globalPercentage}%
          </span>
        </div>

        <ProgressBar percentage={globalPercentage} color='blue' height='h-3' />

        <p className='text-sm text-gray-600 mt-2'>
          {globalPercentage < 50
            ? "Votre profil a besoin d'être complété"
            : globalPercentage < 80
              ? 'Bon travail ! Continuez à améliorer votre profil'
              : 'Excellent ! Votre profil est bien détaillé'}
        </p>
      </motion.div>

      {/* Progression par catégorie */}
      <div
        className={`space-y-4 ${
          orientation === 'horizontal'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
            : 'space-y-4'
        }`}
      >
        {relevantCategories.map(([category, percentage], index) => (
          <CategoryItem
            key={category}
            category={category}
            percentage={percentage}
            config={categoryConfig[category as keyof typeof categoryConfig]}
            onNavigate={onNavigateToSection}
            index={index}
          />
        ))}
      </div>

      {/* Résumé des actions */}
      <motion.div
        className='mt-6 p-4 bg-gray-50 rounded-lg'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h4 className='font-medium text-gray-900 mb-2'>Actions recommandées</h4>
        <div className='space-y-1'>
          {relevantCategories
            .filter(([_, percentage]) => percentage < 100)
            .slice(0, 3)
            .map(([category, percentage]) => {
              const config =
                categoryConfig[category as keyof typeof categoryConfig];
              return (
                <div
                  key={category}
                  className='flex items-center justify-between text-sm'
                >
                  <span className='text-gray-600'>
                    Compléter {config.label.toLowerCase()}
                  </span>
                  <span className='text-gray-500'>
                    {100 - percentage}% restant
                  </span>
                </div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
};
