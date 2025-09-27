/**
 * Étape de bienvenue pour l'onboarding des patients
 * Présente la plateforme et ses bénéfices pour les patients
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Target, 
  TrendingUp, 
  Users, 
  Calendar, 
  BookOpen,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WizardTip } from '../../WizardLayout';
import { PatientOnboardingData } from '@/types/onboarding';

interface WelcomeStepProps {
  /** Données actuelles */
  data: Partial<PatientOnboardingData>;
  /** Nom de l'utilisateur */
  userName?: string;
  /** Callback de mise à jour des données */
  onDataChange: (data: Partial<PatientOnboardingData>) => void;
  /** Callback pour passer à l'étape suivante */
  onNext: () => void;
  /** État de soumission */
  isSubmitting?: boolean;
}

/**
 * Bénéfices clés de la plateforme pour les patients
 */
const PLATFORM_BENEFITS = [
  {
    icon: <Target className="h-6 w-6" />,
    title: 'Objectifs personnalisés',
    description: 'Plans nutritionnels adaptés à vos besoins spécifiques',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Suivi de vos progrès',
    description: 'Visualisez votre évolution avec des graphiques détaillés',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Accompagnement expert',
    description: 'Nutritionnistes diplômés disponibles pour vous guider',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: 'Consultations flexibles',
    description: 'Rendez-vous en ligne ou en cabinet selon vos préférences',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Ressources éducatives',
    description: 'Accès à une bibliothèque de recettes et conseils',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Approche holistique',
    description: 'Prise en compte de votre bien-être global',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
];

/**
 * Témoignages de patients
 */
const TESTIMONIALS = [
  {
    name: 'Marie L.',
    comment: 'J\'ai perdu 8kg en 3 mois grâce au suivi personnalisé !',
    rating: 5,
  },
  {
    name: 'Thomas R.',
    comment: 'Les recettes sont délicieuses et faciles à préparer.',
    rating: 5,
  },
  {
    name: 'Sophie M.',
    comment: 'Mon nutritionniste m\'aide vraiment à atteindre mes objectifs.',
    rating: 5,
  },
];

/**
 * Statistiques de succès
 */
const SUCCESS_STATS = [
  { value: '92%', label: 'de patients satisfaits' },
  { value: '2.5kg', label: 'perte de poids moyenne/mois' },
  { value: '6 mois', label: 'durée moyenne d\'accompagnement' },
  { value: '24/7', label: 'support disponible' },
];

/**
 * Étape de bienvenue pour les patients
 */
export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  data,
  userName = 'Patient',
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
    <div className="space-y-8">
      {/* En-tête de bienvenue */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-6">
          <Heart className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue dans votre parcours santé, {userName}
        </h1>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Nous sommes ravis de vous accompagner vers une alimentation plus saine 
          et un mode de vie équilibré. Ensemble, atteignons vos objectifs !
        </p>
      </motion.div>

      {/* Statistiques de succès */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {SUCCESS_STATS.map((stat, index) => (
          <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Bénéfices de la plateforme */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          Ce que NutriSensia vous apporte
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {PLATFORM_BENEFITS.map((benefit, index) => (
            <motion.div
              key={index}
              className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            >
              <div className={`p-3 rounded-full ${benefit.bgColor}`}>
                <div className={benefit.color}>
                  {benefit.icon}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Témoignages */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          Ce que disent nos patients
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
            >
              <div className="flex items-center mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-sm text-gray-600 mb-2 italic">
                "{testimonial.comment}"
              </p>
              
              <p className="text-sm font-medium text-gray-900">
                {testimonial.name}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Informations sur le processus d'onboarding */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <WizardTip type="info" title="Votre parcours d'inscription">
          <p>
            L'inscription prend environ <strong>15 minutes</strong> et nous permet 
            de créer votre profil nutritionnel personnalisé.
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <p>✓ Informations personnelles et objectifs</p>
            <p>✓ Profil santé et habitudes alimentaires</p>
            <p>✓ Style de vie et préférences</p>
            <p>✓ Découverte des fonctionnalités</p>
          </div>
          <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
            💡 Votre progression est automatiquement sauvegardée
          </div>
        </WizardTip>
      </motion.div>

      {/* Bouton pour commencer */}
      <motion.div
        className="flex justify-center pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <Button
          onClick={handleContinue}
          disabled={isSubmitting}
          size="lg"
          className="flex items-center space-x-2 px-8 py-3"
        >
          <span>Commencer mon parcours</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Message d'encouragement */}
      <motion.div
        className="text-center text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.6 }}
      >
        <p>
          🌟 Prêt à transformer vos habitudes alimentaires ? 
          Commençons cette aventure ensemble !
        </p>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;

