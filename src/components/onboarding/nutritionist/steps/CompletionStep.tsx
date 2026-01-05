/**
 * Étape de finalisation pour l'onboarding des nutritionnistes
 * Révision des informations et finalisation du profil
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  User,
  FileCheck,
  Building,
  Award,
  DollarSign,
  Heart,
  Sparkles,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WizardTip } from '../../WizardLayout';
import { NutritionistOnboardingData } from '@/types/onboarding';

interface CompletionStepProps {
  /** Données actuelles */
  data: Partial<NutritionistOnboardingData>;
  /** Callback de mise à jour des données */
  onDataChange: (data: Partial<NutritionistOnboardingData>) => void;
  /** Callback pour finaliser l'onboarding */
  onComplete: () => void;
  /** Callback pour revenir à l'étape précédente */
  onPrevious: () => void;
  /** État de soumission */
  isSubmitting?: boolean;
}

/**
 * Résumé des sections complétées
 */
interface SectionSummary {
  icon: React.ReactNode;
  title: string;
  status: 'completed' | 'partial' | 'missing';
  items: string[];
}

/**
 * Étape de finalisation
 */
export const CompletionStep: React.FC<CompletionStepProps> = ({
  data,
  onDataChange,
  onComplete,
  onPrevious,
  isSubmitting = false,
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(
    data.termsAccepted || false
  );
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(
    data.privacyPolicyAccepted || false
  );
  const [marketingConsent, setMarketingConsent] = useState(
    data.marketingConsent || false
  );
  const [isSavingConsent, setIsSavingConsent] = useState(false);

  // Synchroniser les states locaux quand les données changent
  useEffect(() => {
    console.log('🔄 Synchronisation états consentement avec données:', {
      termsAccepted: data.termsAccepted,
      privacyPolicyAccepted: data.privacyPolicyAccepted,
      marketingConsent: data.marketingConsent,
    });

    setAcceptedTerms(data.termsAccepted || false);
    setAcceptedPrivacy(data.privacyPolicyAccepted || false);
    setMarketingConsent(data.marketingConsent || false);
  }, [data.termsAccepted, data.privacyPolicyAccepted, data.marketingConsent]);

  const canComplete = acceptedTerms && acceptedPrivacy;

  // Fonction pour sauvegarder automatiquement les consentements
  const saveConsentChange = async (consentType: string, value: boolean) => {
    setIsSavingConsent(true);
    try {
      const updatedData = {
        ...data,
        [consentType]: value,
      };

      // Sauvegarder immédiatement en base de données
      await onDataChange(updatedData);
      console.log(`✅ Consentement ${consentType} sauvegardé:`, value);

      // Petit délai pour que l'utilisateur voie l'indicateur
      setTimeout(() => setIsSavingConsent(false), 500);
    } catch (error) {
      console.error(
        `❌ Erreur lors de la sauvegarde du consentement ${consentType}:`,
        error
      );
      setIsSavingConsent(false);
    }
  };

  // Gestionnaires avec sauvegarde automatique
  const handleTermsChange = async (checked: boolean) => {
    setAcceptedTerms(checked);
    await saveConsentChange('termsAccepted', checked);
  };

  const handlePrivacyChange = async (checked: boolean) => {
    setAcceptedPrivacy(checked);
    await saveConsentChange('privacyPolicyAccepted', checked);
  };

  const handleMarketingChange = async (checked: boolean) => {
    setMarketingConsent(checked);
    await saveConsentChange('marketingConsent', checked);
  };

  const handleComplete = async () => {
    if (!canComplete) return;

    try {
      // Finaliser l'onboarding avec toutes les données collectées
      const completionData = {
        ...data,
        termsAccepted: acceptedTerms,
        privacyPolicyAccepted: acceptedPrivacy,
        marketingConsent: marketingConsent,
        completed: true,
        completedAt: new Date().toISOString(),
      };

      await onDataChange(completionData);
      await onComplete();
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      // L'erreur sera gérée par le composant parent
    }
  };

  /**
   * Générer le résumé des sections
   */
  const generateSectionSummary = (): SectionSummary[] => {
    const sections: SectionSummary[] = [];

    // Informations personnelles
    const personalComplete = data.firstName && data.lastName;
    sections.push({
      icon: <User className='h-5 w-5' />,
      title: 'Informations personnelles',
      status: personalComplete ? 'completed' : 'missing',
      items: [
        data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : 'Nom non renseigné',
        data.phone ? `Tél: ${data.phone}` : 'Téléphone non renseigné',
        data.locale ? `Langue: ${data.locale}` : 'Langue par défaut',
      ].filter(Boolean),
    });

    // Identifiants professionnels
    const credentialsItems = [];
    if (data.ascaNumber) credentialsItems.push(`ASCA: ${data.ascaNumber}`);
    if (data.rmeNumber) credentialsItems.push(`RME: ${data.rmeNumber}`);
    if (data.eanCode) credentialsItems.push(`EAN: ${data.eanCode}`);

    sections.push({
      icon: <FileCheck className='h-5 w-5' />,
      title: 'Identifiants professionnels',
      status: credentialsItems.length > 0 ? 'completed' : 'partial',
      items:
        credentialsItems.length > 0
          ? credentialsItems
          : ['Aucun identifiant configuré (optionnel)'],
    });

    // Détails du cabinet
    const practiceComplete =
      data.practiceAddress?.street && data.practiceAddress?.city;
    sections.push({
      icon: <Building className='h-5 w-5' />,
      title: 'Cabinet',
      status: practiceComplete ? 'completed' : 'missing',
      items: practiceComplete
        ? [
            `${data.practiceAddress!.street}`,
            `${data.practiceAddress!.postal_code} ${data.practiceAddress!.city}`,
            `Types: ${data.consultationTypes?.join(', ') || 'Non définis'}`,
            `Langues: ${data.availableLanguages?.join(', ') || 'Non définies'}`,
          ]
        : ['Adresse du cabinet non renseignée'],
    });

    // Spécialisations
    const specializationsComplete =
      data.specializations && data.specializations.length > 0;
    sections.push({
      icon: <Award className='h-5 w-5' />,
      title: 'Spécialisations',
      status: specializationsComplete ? 'completed' : 'missing',
      items: specializationsComplete
        ? data.specializations!
        : ['Aucune spécialisation définie'],
    });

    // Tarifs
    const ratesComplete = data.consultationRates;
    sections.push({
      icon: <DollarSign className='h-5 w-5' />,
      title: 'Tarifs',
      status: ratesComplete ? 'completed' : 'missing',
      items: ratesComplete
        ? [
            `Initial: CHF ${(ratesComplete.initial / 100).toFixed(2)}`,
            `Suivi: CHF ${(ratesComplete.follow_up / 100).toFixed(2)}`,
            `Express: CHF ${(ratesComplete.express / 100).toFixed(2)}`,
          ]
        : ['Tarifs non configurés'],
    });

    return sections;
  };

  const sections = generateSectionSummary();
  const completedSections = sections.filter(
    s => s.status === 'completed'
  ).length;
  const totalSections = sections.length;
  const completionRate = Math.round((completedSections / totalSections) * 100);

  return (
    <div className='space-y-8'>
      {/* En-tête de félicitations */}
      <motion.div
        className='text-center space-y-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className='text-3xl font-bold text-gray-900'>
          Récapitulatif de votre profil
        </h1>

        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Avant de finaliser votre inscription, voici un récapitulatif de toutes
          les informations que vous avez saisies lors de votre onboarding.
        </p>
      </motion.div>

      {/* Résumé des sections */}
      <motion.div
        className='space-y-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className='text-xl font-semibold text-gray-900'>
          Informations enregistrées
        </h2>

        <div className='grid gap-4'>
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              className={`p-4 rounded-lg border-2 ${
                section.status === 'completed'
                  ? 'border-green-200 bg-green-50'
                  : section.status === 'partial'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-red-200 bg-red-50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
            >
              <div className='flex items-start space-x-3'>
                <div
                  className={`p-2 rounded-full ${
                    section.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : section.status === 'partial'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600'
                  }`}
                >
                  {section.icon}
                </div>

                <div className='flex-1'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <h3 className='font-medium text-gray-900'>
                      {section.title}
                    </h3>
                    {section.status === 'completed' && (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    )}
                  </div>

                  <ul className='space-y-1'>
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className='text-sm text-gray-600'>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Consentements */}
      <motion.div
        className='space-y-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Conditions d'utilisation
          </h2>
          {isSavingConsent && (
            <div className='flex items-center text-sm text-green-600'>
              <div className='animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full mr-2'></div>
              Sauvegarde...
            </div>
          )}
        </div>

        <div className='space-y-4 p-4 bg-gray-50 rounded-lg'>
          <label className='flex items-start space-x-3'>
            <input
              type='checkbox'
              checked={acceptedTerms}
              onChange={e => handleTermsChange(e.target.checked)}
              className='mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            />
            <span className='text-sm text-gray-700'>
              J'accepte les{' '}
              <a
                href='/terms'
                className='text-blue-600 hover:underline'
                target='_blank'
              >
                conditions d'utilisation
              </a>{' '}
              de NutriSensia *
            </span>
          </label>

          <label className='flex items-start space-x-3'>
            <input
              type='checkbox'
              checked={acceptedPrivacy}
              onChange={e => handlePrivacyChange(e.target.checked)}
              className='mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            />
            <span className='text-sm text-gray-700'>
              J'accepte la{' '}
              <a
                href='/privacy'
                className='text-blue-600 hover:underline'
                target='_blank'
              >
                politique de confidentialité
              </a>{' '}
              *
            </span>
          </label>

          <label className='flex items-start space-x-3'>
            <input
              type='checkbox'
              checked={marketingConsent}
              onChange={e => handleMarketingChange(e.target.checked)}
              className='mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            />
            <span className='text-sm text-gray-700'>
              J'accepte de recevoir des communications marketing de NutriSensia
              (optionnel)
            </span>
          </label>
        </div>
      </motion.div>

      {/* Prochaines étapes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      ></motion.div>

      {/* Boutons de navigation */}
      <motion.div
        className='flex justify-between pt-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <Button
          type='button'
          variant='secondary'
          onClick={onPrevious}
          disabled={isSubmitting}
        >
          Retour
        </Button>

        <Button
          onClick={handleComplete}
          disabled={!canComplete || isSubmitting}
          size='lg'
          className='flex items-center space-x-2 px-8'
        >
          <span>
            {isSubmitting ? 'Finalisation...' : 'Finaliser mon profil'}
          </span>
          <ArrowRight className='h-5 w-5' />
        </Button>
      </motion.div>

      {/* Message d'encouragement */}
      {canComplete && (
        <motion.div
          className='text-center text-sm text-gray-500 pt-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <p>🚀 Vous êtes prêt à commencer votre aventure avec NutriSensia !</p>
        </motion.div>
      )}

      {/* Avertissement si conditions non acceptées */}
      {(!acceptedTerms || !acceptedPrivacy) && (
        <motion.div
          className='p-4 bg-amber-50 border border-amber-200 rounded-lg'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className='text-sm text-amber-800'>
            Vous devez accepter les conditions d'utilisation et la politique de
            confidentialité pour finaliser votre profil.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CompletionStep;
