/**
 * Étape de formation à la plateforme pour l'onboarding des nutritionnistes
 * Tour guidé des fonctionnalités professionnelles
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Play,
  CheckCircle,
  Calendar,
  Users,
  BarChart3,
  FileText,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WizardTip } from '../../WizardLayout';
import { NutritionistOnboardingData } from '@/types/onboarding';

interface PlatformTrainingStepProps {
  /** Données actuelles */
  data: Partial<NutritionistOnboardingData>;
  /** Callback de mise à jour des données */
  onDataChange: (data: Partial<NutritionistOnboardingData>) => void;
  /** Callback pour passer à l'étape suivante */
  onNext: (stepData?: Partial<NutritionistOnboardingData>) => void;
  /** Callback pour revenir à l'étape précédente */
  onPrevious: () => void;
  /** État de soumission */
  isSubmitting?: boolean;
}

/**
 * Modules de formation disponibles
 */
const TRAINING_MODULES = [
  {
    id: 'dashboard',
    title: 'Tableau de bord',
    description: "Vue d'ensemble de votre activité et indicateurs clés",
    icon: <BarChart3 className='h-6 w-6' />,
    duration: '5 min',
    features: [
      'Statistiques de consultation',
      'Revenus mensuels',
      'Nouveaux patients',
      'Taux de satisfaction',
    ],
    completed: false,
  },
  {
    id: 'patients',
    title: 'Gestion des patients',
    description: 'Organiser et suivre tous vos patients efficacement',
    icon: <Users className='h-6 w-6' />,
    duration: '8 min',
    features: [
      'Dossiers patients complets',
      'Historique des consultations',
      'Notes et observations',
      'Documents partagés',
    ],
    completed: false,
  },
  {
    id: 'appointments',
    title: 'Agenda et rendez-vous',
    description: 'Gérer votre planning et vos consultations',
    icon: <Calendar className='h-6 w-6' />,
    duration: '6 min',
    features: [
      'Calendrier intuitif',
      'Réservation en ligne',
      'Rappels automatiques',
      'Consultations vidéo',
    ],
    completed: false,
  },
  {
    id: 'plans',
    title: 'Plans nutritionnels',
    description: 'Créer et personnaliser des plans pour vos patients',
    icon: <FileText className='h-6 w-6' />,
    duration: '10 min',
    features: [
      'Modèles personnalisables',
      'Base de données alimentaire',
      'Calculs nutritionnels',
      'Export PDF/impression',
    ],
    completed: false,
  },
  {
    id: 'communication',
    title: 'Communication',
    description: 'Rester en contact avec vos patients',
    icon: <MessageSquare className='h-6 w-6' />,
    duration: '4 min',
    features: [
      'Messagerie sécurisée',
      'Notifications push',
      'Partage de documents',
      'Suivi des progrès',
    ],
    completed: false,
  },
  {
    id: 'settings',
    title: 'Paramètres et configuration',
    description: 'Personnaliser votre espace professionnel',
    icon: <Settings className='h-6 w-6' />,
    duration: '3 min',
    features: [
      'Profil professionnel',
      'Tarifs et facturation',
      'Notifications',
      'Sécurité et confidentialité',
    ],
    completed: false,
  },
];

/**
 * Étape de formation à la plateforme
 */
export const PlatformTrainingStep: React.FC<PlatformTrainingStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
}) => {
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>(
    data.completedTrainingModules || []
  );
  const [isSkipping, setIsSkipping] = useState(false);

  /**
   * Démarrer un module de formation
   */
  const startModule = (moduleId: string) => {
    setCurrentModule(moduleId);
  };

  /**
   * Marquer un module comme terminé
   */
  const completeModule = (moduleId: string) => {
    const updatedCompleted = [...completedModules, moduleId];
    setCompletedModules(updatedCompleted);
    setCurrentModule(null);

    // Sauvegarder la progression
    onDataChange({
      ...data,
      completedTrainingModules: updatedCompleted,
      platformTrainingCompleted:
        updatedCompleted.length === TRAINING_MODULES.length,
    });
  };

  /**
   * Passer la formation
   */
  const skipTraining = () => {
    setIsSkipping(true);
    onDataChange({
      ...data,
      platformTrainingCompleted: false,
      trainingSkipped: true,
      trainingSkippedAt: new Date().toISOString(),
    });

    setTimeout(() => {
      onNext();
    }, 1000);
  };

  /**
   * Continuer avec la formation complétée
   */
  const continueWithTraining = () => {
    onDataChange({
      ...data,
      platformTrainingCompleted: true,
      trainingCompletedAt: new Date().toISOString(),
    });
    onNext();
  };

  const totalModules = TRAINING_MODULES.length;
  const completedCount = completedModules.length;
  const progressPercentage = Math.round((completedCount / totalModules) * 100);
  const allCompleted = completedCount === totalModules;

  // Vue détaillée d'un module
  if (currentModule) {
    const trainingModule = TRAINING_MODULES.find(m => m.id === currentModule);
    if (!trainingModule) return null;

    return (
      <motion.div
        className='space-y-6'
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* En-tête du module */}
        <div className='text-center space-y-2'>
          <div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
            <div className='text-blue-600'>{module.icon}</div>
          </div>

          <h2 className='text-xl font-semibold text-gray-900'>
            {module.title}
          </h2>

          <p className='text-gray-600'>{module.description}</p>

          <div className='text-sm text-blue-600'>
            Durée estimée : {module.duration}
          </div>
        </div>

        {/* Contenu du module */}
        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h3 className='font-medium text-gray-900 mb-4'>
            Ce que vous allez apprendre :
          </h3>

          <ul className='space-y-3'>
            {module.features.map((feature, index) => (
              <motion.li
                key={index}
                className='flex items-start space-x-3'
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <CheckCircle className='h-5 w-5 text-green-600 mt-0.5 flex-shrink-0' />
                <span className='text-gray-700'>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Simulation d'une vidéo/contenu interactif */}
        <div className='bg-gray-900 rounded-lg aspect-video flex items-center justify-center'>
          <div className='text-center text-white space-y-4'>
            <Play className='h-16 w-16 mx-auto text-white/80' />
            <p className='text-lg'>Contenu de formation interactif</p>
            <p className='text-sm text-white/60'>
              Dans un vrai environnement, ceci serait une vidéo ou un tutoriel
              interactif
            </p>
          </div>
        </div>

        {/* Actions du module */}
        <div className='flex justify-between'>
          <Button variant='secondary' onClick={() => setCurrentModule(null)}>
            <ChevronLeft className='h-4 w-4 mr-1' />
            Retour aux modules
          </Button>

          <Button
            onClick={() => completeModule(module.id)}
            className='flex items-center space-x-2'
          >
            <CheckCircle className='h-4 w-4' />
            <span>Marquer comme terminé</span>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Introduction */}
      <motion.div
        className='text-center space-y-2'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className='text-3xl font-bold text-gray-900'>
          Formation à la plateforme
        </h1>

        <p className='text-gray-600'>
          Découvrez toutes les fonctionnalités de NutriSensia pour optimiser
          votre pratique professionnelle.
        </p>
      </motion.div>

      {/* Progression globale */}
      <motion.div
        className='bg-white rounded-lg p-6 shadow-sm border'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Votre progression
          </h3>
          <div className='text-2xl font-bold text-indigo-600'>
            {progressPercentage}%
          </div>
        </div>

        <div className='w-full bg-gray-200 rounded-full h-3 mb-4'>
          <motion.div
            className='bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full'
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>

        <p className='text-sm text-gray-600'>
          {completedCount} sur {totalModules} modules terminés
        </p>
      </motion.div>

      {/* Modules de formation */}
      <motion.div
        className='space-y-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className='text-lg font-semibold text-gray-900'>
          Modules de formation
        </h3>

        <div className='grid gap-4'>
          {TRAINING_MODULES.map((module, index) => {
            const isCompleted = completedModules.includes(module.id);

            return (
              <motion.div
                key={module.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isCompleted
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                onClick={() => !isCompleted && startModule(module.id)}
              >
                <div className='flex items-start space-x-4'>
                  <div
                    className={`p-3 rounded-full ${
                      isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className='h-6 w-6' />
                    ) : (
                      module.icon
                    )}
                  </div>

                  <div className='flex-1'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='font-medium text-gray-900'>
                        {module.title}
                      </h4>
                      <div className='flex items-center space-x-2 text-sm text-gray-500'>
                        <span>{module.duration}</span>
                        {!isCompleted && <ChevronRight className='h-4 w-4' />}
                      </div>
                    </div>

                    <p className='text-sm text-gray-600 mb-3'>
                      {module.description}
                    </p>

                    <div className='flex flex-wrap gap-1'>
                      {module.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className='inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded'
                        >
                          {feature}
                        </span>
                      ))}
                      {module.features.length > 3 && (
                        <span className='inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded'>
                          +{module.features.length - 3} autres
                        </span>
                      )}
                    </div>

                    {isCompleted && (
                      <div className='mt-2 text-sm text-green-600 font-medium'>
                        ✓ Module terminé
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Conseil sur la formation */}
      <WizardTip type='info' title='Formation optionnelle mais recommandée'>
        <p>
          Cette formation vous aidera à tirer le maximum de NutriSensia dès le
          début. Vous pouvez la passer maintenant et y revenir plus tard depuis
          votre tableau de bord.
        </p>
        <div className='mt-2 flex items-center space-x-1 text-sm'>
          <ExternalLink className='h-3 w-3' />
          <span>Accessible à tout moment dans "Aide & Formation"</span>
        </div>
      </WizardTip>

      {/* Message de félicitations si tout est terminé */}
      {allCompleted && (
        <motion.div
          className='p-4 bg-green-50 border border-green-200 rounded-lg text-center'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CheckCircle className='h-8 w-8 text-green-600 mx-auto mb-2' />
          <h3 className='font-medium text-green-900 mb-1'>Félicitations !</h3>
          <p className='text-sm text-green-700'>
            Vous avez terminé tous les modules de formation. Vous êtes
            maintenant prêt à utiliser NutriSensia efficacement !
          </p>
        </motion.div>
      )}

      {/* Boutons de navigation */}
      <div className='flex justify-between pt-6'>
        <Button
          type='button'
          variant='secondary'
          onClick={onPrevious}
          disabled={isSubmitting || isSkipping}
        >
          Retour
        </Button>

        <div className='flex space-x-3'>
          <Button
            type='button'
            variant='secondary'
            onClick={skipTraining}
            disabled={isSubmitting || isSkipping}
          >
            {isSkipping ? 'Passage en cours...' : 'Passer la formation'}
          </Button>

          <Button
            onClick={allCompleted ? continueWithTraining : skipTraining}
            disabled={isSubmitting || isSkipping}
            className='flex items-center space-x-2'
          >
            <span>{allCompleted ? 'Continuer' : 'Terminer plus tard'}</span>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Temps total estimé */}
      <div className='text-center text-sm text-gray-500'>
        Temps total de formation : ~36 minutes
      </div>
    </div>
  );
};

export default PlatformTrainingStep;
