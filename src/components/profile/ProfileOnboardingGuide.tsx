/**
 * Composant de guide d'onboarding pour le profil
 * 
 * Fournit une guidance étape par étape pour compléter le profil :
 * - Étapes personnalisées selon le rôle utilisateur
 * - Navigation guidée avec progression
 * - Conseils contextuels pour chaque étape
 * - Validation en temps réel des champs
 * - Célébration des accomplissements
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Star,
  Lightbulb,
  Target,
  Gift,
  ArrowRight
} from 'lucide-react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import type { UserRole, ProfileData } from '@/lib/profile-completion';

interface ProfileOnboardingGuideProps {
  /** Données du profil */
  profileData: Partial<ProfileData>;
  /** Rôle de l'utilisateur */
  role: UserRole;
  /** Callback pour naviguer vers l'édition d'un champ */
  onEditField?: (fieldName: string) => void;
  /** Callback quand l'onboarding est terminé */
  onComplete?: () => void;
  /** Callback pour fermer le guide */
  onClose?: () => void;
  /** Afficher automatiquement si le profil est incomplet */
  autoShow?: boolean;
}

/**
 * Interface pour une étape d'onboarding
 */
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
  tips: string[];
  reward?: string;
  isCompleted: boolean;
  isActive: boolean;
}

/**
 * Composant d'étape d'onboarding
 */
const OnboardingStepCard = ({
  step,
  onEditField,
  onNext,
  onPrevious,
  isFirst,
  isLast
}: {
  step: OnboardingStep;
  onEditField?: (fieldName: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirst: boolean;
  isLast: boolean;
}) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg border p-6 max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {/* En-tête de l'étape */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-full ${
          step.isCompleted 
            ? 'bg-green-100 text-green-600' 
            : 'bg-blue-100 text-blue-600'
        }`}>
          {step.isCompleted ? (
            <Check className="w-5 h-5" />
          ) : (
            <Target className="w-5 h-5" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
          <p className="text-sm text-gray-600">{step.description}</p>
        </div>
      </div>

      {/* Champs à compléter */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-900">Informations à renseigner :</h4>
        <div className="space-y-2">
          {step.fields.map((field, index) => (
            <motion.button
              key={field}
              onClick={() => onEditField?.(field)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Conseils */}
      {step.tips.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Conseils utiles</h4>
              <ul className="space-y-1">
                {step.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-yellow-700">
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Récompense */}
      {step.reward && step.isCompleted && (
        <motion.div
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Félicitations !</h4>
              <p className="text-sm text-green-700">{step.reward}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isFirst
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Précédent</span>
        </button>

        <button
          onClick={onNext}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            step.isCompleted
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <span>{isLast ? 'Terminer' : 'Suivant'}</span>
          {!isLast && <ChevronRight className="w-4 h-4" />}
          {isLast && <Star className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Composant principal du guide d'onboarding
 */
export const ProfileOnboardingGuide = ({
  profileData,
  role,
  onEditField,
  onComplete,
  onClose,
  autoShow = true
}: ProfileOnboardingGuideProps) => {
  const { completion } = useProfileCompletion({ profileData, role });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Générer les étapes d'onboarding basées sur le rôle et les données manquantes
  const generateSteps = (): OnboardingStep[] => {
    if (!completion) return [];

    const steps: OnboardingStep[] = [];
    
    // Étape 1: Informations de base (toujours présente)
    const basicFields = ['first_name', 'last_name', 'avatar_url'];
    const basicCompleted = basicFields.every(field => 
      completion.missingFields.critical.concat(completion.missingFields.important, completion.missingFields.optional)
        .find(f => f.name === field) === undefined
    );

    steps.push({
      id: 'basic',
      title: 'Informations personnelles',
      description: 'Commençons par les informations de base',
      fields: basicFields,
      tips: [
        'Utilisez votre vrai nom pour établir la confiance',
        'Une photo de profil professionnelle est recommandée',
        'Ces informations sont visibles par vos contacts'
      ],
      reward: 'Profil de base créé ! Vous êtes maintenant identifiable.',
      isCompleted: basicCompleted,
      isActive: currentStepIndex === 0
    });

    // Étapes spécifiques au rôle
    if (role === 'nutritionist') {
      // Étape 2: Certifications professionnelles
      const profFields = ['asca_number', 'rme_number', 'specializations'];
      const profCompleted = profFields.some(field => 
        completion.missingFields.critical.concat(completion.missingFields.important)
          .find(f => f.name === field) === undefined
      );

      steps.push({
        id: 'professional',
        title: 'Certifications professionnelles',
        description: 'Validez votre expertise professionnelle',
        fields: profFields,
        tips: [
          'Au moins un numéro de certification est requis',
          'Les spécialisations aident les patients à vous trouver',
          'Ces informations rassurent vos futurs patients'
        ],
        reward: 'Crédibilité professionnelle établie !',
        isCompleted: profCompleted,
        isActive: currentStepIndex === 1
      });

      // Étape 3: Informations de contact
      const contactFields = ['phone', 'practice_address'];
      const contactCompleted = contactFields.every(field => 
        completion.missingFields.critical.concat(completion.missingFields.important)
          .find(f => f.name === field) === undefined
      );

      steps.push({
        id: 'contact',
        title: 'Coordonnées professionnelles',
        description: 'Permettez aux patients de vous contacter',
        fields: contactFields,
        tips: [
          'L\'adresse du cabinet est essentielle pour les consultations',
          'Un numéro de téléphone facilite les urgences',
          'Vérifiez que vos coordonnées sont à jour'
        ],
        reward: 'Les patients peuvent maintenant vous trouver !',
        isCompleted: contactCompleted,
        isActive: currentStepIndex === 2
      });
    } else {
      // Étapes pour les patients
      // Étape 2: Informations médicales critiques
      const medicalFields = ['allergies', 'height', 'initial_weight'];
      const medicalCompleted = medicalFields.every(field => 
        completion.missingFields.critical.find(f => f.name === field) === undefined
      );

      steps.push({
        id: 'medical',
        title: 'Informations médicales essentielles',
        description: 'Sécurisez votre suivi nutritionnel',
        fields: medicalFields,
        tips: [
          'Les allergies sont cruciales pour votre sécurité',
          'Votre taille et poids permettent de calculer vos besoins',
          'Ces informations restent confidentielles'
        ],
        reward: 'Suivi nutritionnel sécurisé activé !',
        isCompleted: medicalCompleted,
        isActive: currentStepIndex === 1
      });

      // Étape 3: Objectifs et préférences
      const goalsFields = ['target_weight', 'activity_level', 'dietary_restrictions'];
      const goalsCompleted = goalsFields.every(field => 
        completion.missingFields.important.find(f => f.name === field) === undefined
      );

      steps.push({
        id: 'goals',
        title: 'Objectifs et préférences',
        description: 'Personnalisez votre parcours nutritionnel',
        fields: goalsFields,
        tips: [
          'Définissez un objectif de poids réaliste',
          'Votre niveau d\'activité influence vos besoins',
          'Les restrictions alimentaires guident vos menus'
        ],
        reward: 'Plan nutritionnel personnalisé disponible !',
        isCompleted: goalsCompleted,
        isActive: currentStepIndex === 2
      });
    }

    return steps;
  };

  const steps = generateSteps();
  const currentStep = steps[currentStepIndex];

  // Déterminer si le guide doit être affiché automatiquement
  useEffect(() => {
    if (autoShow && completion && completion.percentage < 70) {
      setIsVisible(true);
    }
  }, [autoShow, completion]);

  // Gestion de la navigation
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Onboarding terminé
      setIsVisible(false);
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible || !completion || !currentStep) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div className="relative">
          {/* Bouton de fermeture */}
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 rotate-45" />
          </button>

          {/* Indicateur de progression */}
          <div className="mb-4 flex justify-center">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStepIndex
                      ? 'bg-blue-600'
                      : index < currentStepIndex
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Carte de l'étape actuelle */}
          <OnboardingStepCard
            step={currentStep}
            onEditField={onEditField}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={currentStepIndex === 0}
            isLast={currentStepIndex === steps.length - 1}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};



