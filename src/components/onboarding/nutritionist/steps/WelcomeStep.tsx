/**
 * Étape de bienvenue pour l'onboarding des nutritionnistes
 * Présente la plateforme et ses avantages pour les professionnels
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  Calendar, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NutritionistOnboardingData } from '@/types/onboarding';
import { NutritionistWelcomeIllustration } from '../../illustrations';
import { staggerContainer, staggerItem, AnimatedButton } from '../../animations';

interface WelcomeStepProps {
  /** Données actuelles */
  data: Partial<NutritionistOnboardingData>;
  /** Nom de l'utilisateur */
  userName?: string;
  /** Callback de mise à jour des données */
  onDataChange: (data: Partial<NutritionistOnboardingData>) => void;
  /** Callback pour passer à l'étape suivante */
  onNext: (stepData?: Partial<NutritionistOnboardingData>) => void;
  /** État de soumission */
  isSubmitting?: boolean;
}

/**
 * Fonctionnalités clés de la plateforme pour les nutritionnistes
 * Utilise les couleurs du design system NutriSensia
 */
const PLATFORM_FEATURES = [
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Gestion des patients',
    description: 'Organisez et suivez tous vos patients en un seul endroit',
    color: 'text-primary',
    bgColor: 'bg-secondary-pale',
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: 'Planification des consultations',
    description: 'Gérez votre agenda et vos rendez-vous facilement',
    color: 'text-secondary',
    bgColor: 'bg-background-accent',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Suivi des progrès',
    description: 'Visualisez l\'évolution de vos patients avec des graphiques',
    color: 'text-accent-teal',
    bgColor: 'bg-secondary-pale',
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Plans nutritionnels',
    description: 'Créez des plans personnalisés et adaptés',
    color: 'text-primary-dark',
    bgColor: 'bg-background-accent',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Sécurité des données',
    description: 'Conformité RGPD et sécurité maximale',
    color: 'text-functional-info',
    bgColor: 'bg-secondary-pale',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Automatisation',
    description: 'Automatisez les tâches répétitives pour gagner du temps',
    color: 'text-accent-orange',
    bgColor: 'bg-background-accent',
  },
];

/**
 * Statistiques de la plateforme
 */
const PLATFORM_STATS = [
  { value: '500+', label: 'Nutritionnistes actifs' },
  { value: '10,000+', label: 'Patients suivis' },
  { value: '95%', label: 'Satisfaction client' },
  { value: '24/7', label: 'Support disponible' },
];

/**
 * Étape de bienvenue
 */
export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  data,
  userName = 'Nutritionniste',
  onDataChange,
  onNext,
  isSubmitting = false,
}) => {
  
  const handleContinue = () => {
    // Marquer l'étape de bienvenue comme vue
    onDataChange({
      ...data,
      welcomeViewed: true,
      onboardingStartedAt: new Date().toISOString(),
    });
    
    onNext();
  };

  return (
    <div className="space-y-32dp">
      {/* En-tête de bienvenue */}
      <motion.div
        className="text-center space-y-16dp"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue sur NutriSensia, {userName}
        </h1>
        
        <p className="text-body-large text-neutral-medium dark:text-neutral-medium max-w-4xl mx-auto">
          Nous sommes ravis de vous accueillir parmi notre communauté de professionnels 
          de la nutrition. NutriSensia va transformer votre pratique professionnelle.
        </p>
      </motion.div>

      {/* Statistiques de la plateforme */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-16dp"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {PLATFORM_STATS.map((stat, index) => (
          <div key={index} className="text-center p-16dp bg-background-primary dark:bg-background-secondary rounded-12dp shadow-card-primary border border-neutral-border dark:border-neutral-border">
            <div className="text-h3 font-bold text-primary dark:text-primary">{stat.value}</div>
            <div className="text-body-small text-neutral-medium dark:text-neutral-medium">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Fonctionnalités clés */}
      <motion.div
        className="space-y-24dp"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-h2 font-semibold text-neutral-dark dark:text-neutral-light text-center">
          Ce que NutriSensia vous offre
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16dp">
          {PLATFORM_FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-start space-x-16dp p-16dp bg-background-primary dark:bg-background-secondary rounded-12dp shadow-card-primary border border-neutral-border dark:border-neutral-border hover:shadow-card-dashboard transition-shadow duration-standard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            >
              <div className={`p-12dp rounded-12dp ${feature.bgColor}`}>
                <div className={feature.color}>
                  {feature.icon}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-h4 font-medium text-neutral-dark dark:text-neutral-light mb-4dp">
                  {feature.title}
                </h3>
                <p className="text-body-small text-neutral-medium dark:text-neutral-medium">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Conseil pour l'onboarding */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
      </motion.div>

      {/* Bouton pour commencer */}
      <motion.div
        className="flex justify-center pt-24dp"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <Button
          onClick={handleContinue}
          disabled={isSubmitting}
          variant="primary"
          size="lg"
          className="flex items-center space-x-8dp px-32dp py-12dp"
        >
          <span>Commencer la configuration</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Message d'encouragement */}
      <motion.div
        className="text-center text-body-small text-neutral-medium dark:text-neutral-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <p>
          🚀 Prêt à révolutionner votre pratique nutritionnelle ? 
          Commençons ensemble ce voyage !
        </p>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;