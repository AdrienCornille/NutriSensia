/**
 * Tableau de bord de complétude du profil
 * 
 * Composant principal qui intègre tous les éléments du système de suivi :
 * - Carte de complétude avec progression circulaire
 * - Barre de progression détaillée par catégorie
 * - Guide d'onboarding interactif
 * - Paramètres de confidentialité
 * - Actions rapides pour améliorer le profil
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Eye, 
  BookOpen, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { ProfileCompletionCard } from './ProfileCompletionCard';
import { ProfileProgressBar } from './ProfileProgressBar';
import { ProfileOnboardingGuide } from './ProfileOnboardingGuide';
import { ProfilePrivacySettings } from './ProfilePrivacySettings';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import type { UserRole, ProfileData } from '@/lib/profile-completion';

interface ProfileCompletionDashboardProps {
  /** Données du profil utilisateur */
  profileData: Partial<ProfileData>;
  /** Rôle de l'utilisateur */
  role: UserRole;
  /** Callback pour naviguer vers l'édition du profil */
  onEditProfile?: () => void;
  /** Callback pour naviguer vers un champ spécifique */
  onEditField?: (fieldName: string) => void;
  /** Callback pour sauvegarder les paramètres de confidentialité */
  onSavePrivacySettings?: (settings: any) => Promise<void>;
  /** Affichage compact */
  compact?: boolean;
}

/**
 * Composant d'onglet
 */
const TabButton = ({ 
  active, 
  onClick, 
  icon: Icon, 
  label, 
  badge 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: any; 
  label: string; 
  badge?: string | number; 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
    {badge && (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
        active ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

/**
 * Section pliable
 */
const CollapsibleSection = ({ 
  title, 
  children, 
  defaultExpanded = true,
  icon: Icon
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultExpanded?: boolean;
  icon?: any;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-5 h-5 text-gray-600" />}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Composant principal du tableau de bord
 */
export const ProfileCompletionDashboard = ({
  profileData,
  role,
  onEditProfile,
  onEditField,
  onSavePrivacySettings,
  compact = false
}: ProfileCompletionDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'privacy'>('overview');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const { completion, progressToNextLevel } = useProfileCompletion({ 
    profileData, 
    role 
  });

  // Afficher une célébration quand le profil atteint un nouveau niveau
  useEffect(() => {
    if (completion && completion.percentage >= 90 && completion.level === 'excellent') {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [completion]);

  // Déterminer les badges pour les onglets
  const getTabBadge = (tab: string) => {
    if (!completion) return undefined;
    
    switch (tab) {
      case 'overview':
        return completion.percentage < 70 ? '!' : undefined;
      case 'progress':
        return completion.missingFields.critical.length > 0 
          ? completion.missingFields.critical.length 
          : undefined;
      case 'privacy':
        return undefined;
      default:
        return undefined;
    }
  };

  if (!completion) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Célébration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-lg shadow-lg max-w-sm"
          >
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h4 className="font-bold text-lg">Félicitations !</h4>
                <p className="text-sm opacity-90">
                  Votre profil est maintenant excellent ! 🎉
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* En-tête avec onglets */}
      {!compact && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Gestion du profil
              </h2>
              <p className="text-gray-600 mt-1">
                Optimisez votre profil pour une meilleure expérience
              </p>
            </div>
            
            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Guide d'aide</span>
            </button>
          </div>

          {/* Navigation par onglets */}
          <div className="flex space-x-2">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={TrendingUp}
              label="Vue d'ensemble"
              badge={getTabBadge('overview')}
            />
            <TabButton
              active={activeTab === 'progress'}
              onClick={() => setActiveTab('progress')}
              icon={TrendingUp}
              label="Progression détaillée"
              badge={getTabBadge('progress')}
            />
            <TabButton
              active={activeTab === 'privacy'}
              onClick={() => setActiveTab('privacy')}
              icon={Eye}
              label="Confidentialité"
              badge={getTabBadge('privacy')}
            />
          </div>
        </div>
      )}

      {/* Contenu selon l'onglet actif */}
      <AnimatePresence mode="wait">
        {(activeTab === 'overview' || compact) && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Carte de complétude principale */}
            <ProfileCompletionCard
              profileData={profileData}
              role={role}
              onEditProfile={onEditProfile}
              compact={compact}
            />

            {/* Sections détaillées pour la version complète */}
            {!compact && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progression vers le niveau suivant */}
                <CollapsibleSection
                  title={`Progression vers le niveau suivant (${progressToNextLevel.target}%)`}
                  icon={TrendingUp}
                  defaultExpanded={progressToNextLevel.remaining > 0}
                >
                  <div className="space-y-4">
                    <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNextLevel.percentage}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {progressToNextLevel.current}% actuel
                      </span>
                      <span className="text-gray-600">
                        {progressToNextLevel.remaining}% restant
                      </span>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Recommandations */}
                <CollapsibleSection
                  title="Recommandations"
                  icon={Sparkles}
                  defaultExpanded={completion.recommendations.length > 0}
                >
                  <div className="space-y-2">
                    {completion.recommendations.length > 0 ? (
                      completion.recommendations.map((recommendation, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-blue-800">{recommendation}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600 italic">
                        Aucune recommandation pour le moment. Votre profil est bien complété !
                      </p>
                    )}
                  </div>
                </CollapsibleSection>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'progress' && !compact && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ProfileProgressBar
              profileData={profileData}
              role={role}
              onNavigateToSection={onEditField}
            />
          </motion.div>
        )}

        {activeTab === 'privacy' && !compact && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ProfilePrivacySettings
              userRole={role}
              onSave={onSavePrivacySettings}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide d'onboarding */}
      <ProfileOnboardingGuide
        profileData={profileData}
        role={role}
        onEditField={onEditField}
        onComplete={() => {
          setShowOnboarding(false);
          // Rafraîchir les données si nécessaire
        }}
        onClose={() => setShowOnboarding(false)}
        autoShow={showOnboarding}
      />
    </div>
  );
};



