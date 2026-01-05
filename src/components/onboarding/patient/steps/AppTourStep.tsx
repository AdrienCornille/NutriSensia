/**
 * Étape du tour de l'application pour l'onboarding des patients
 * Présente les fonctionnalités principales et configure les préférences
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Bell,
  Mail,
  MessageSquare,
  Settings,
  Play,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { WizardTip } from '../../WizardLayout';
import { PatientOnboardingData } from '@/types/onboarding';
import { appTourSchema } from '@/lib/onboarding-schemas';

interface AppTourStepProps {
  data: Partial<PatientOnboardingData>;
  onDataChange: (data: Partial<PatientOnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
}

const APP_FEATURES = [
  {
    icon: <Smartphone className='h-6 w-6' />,
    title: 'Tableau de bord personnalisé',
    description: 'Suivez vos progrès et consultez vos statistiques',
    demo: '📊 Graphiques de progression, objectifs atteints',
  },
  {
    icon: <MessageSquare className='h-6 w-6' />,
    title: 'Chat avec votre nutritionniste',
    description: 'Communication directe et sécurisée',
    demo: '💬 Messages instantanés, conseils personnalisés',
  },
  {
    icon: <Settings className='h-6 w-6' />,
    title: 'Journal alimentaire',
    description: 'Enregistrez vos repas facilement',
    demo: '📝 Photos de repas, analyse nutritionnelle',
  },
  {
    icon: <Bell className='h-6 w-6' />,
    title: 'Rappels intelligents',
    description: 'Ne manquez jamais vos objectifs',
    demo: '⏰ Rappels repas, hydratation, rendez-vous',
  },
];

export const AppTourStep: React.FC<AppTourStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
}) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: zodResolver(appTourSchema),
    defaultValues: {
      appTourCompleted: data.appTourCompleted || false,
      notificationPreferences: {
        email: data.notificationPreferences?.email ?? true,
        push: data.notificationPreferences?.push ?? true,
        sms: data.notificationPreferences?.sms ?? false,
      },
      communicationPreferences: {
        preferredLanguage:
          data.communicationPreferences?.preferredLanguage || 'fr',
        preferredContactMethod:
          data.communicationPreferences?.preferredContactMethod || 'app',
        reminderFrequency:
          data.communicationPreferences?.reminderFrequency || 'weekly',
      },
      privacySettings: {
        shareDataForResearch:
          data.privacySettings?.shareDataForResearch ?? false,
        allowMarketingEmails:
          data.privacySettings?.allowMarketingEmails ?? false,
        profileVisibility:
          data.privacySettings?.profileVisibility || 'nutritionist-only',
      },
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Pas de useEffect automatique pour éviter les boucles infinies
  // Les données seront mises à jour lors de la soumission

  const nextFeature = () => {
    setCurrentFeature(prev => (prev + 1) % APP_FEATURES.length);
  };

  const prevFeature = () => {
    setCurrentFeature(
      prev => (prev - 1 + APP_FEATURES.length) % APP_FEATURES.length
    );
  };

  const onSubmit = (formData: any) => {
    onDataChange({
      ...data,
      ...formData,
      appTourCompleted: true,
    });
    onNext();
  };

  const feature = APP_FEATURES[currentFeature];

  return (
    <div className='space-y-6'>
      <motion.div
        className='text-center space-y-2'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className='mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4'>
          <Smartphone className='h-8 w-8 text-white' />
        </div>
        <h1 className='text-3xl font-bold text-gray-900'>
          Découvrez NutriSensia
        </h1>
        <p className='text-gray-600'>
          Explorez les fonctionnalités qui vous accompagneront
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Tour des fonctionnalités */}
        <div className='bg-white rounded-lg border p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Fonctionnalité {currentFeature + 1} sur {APP_FEATURES.length}
            </h3>
            <div className='flex space-x-2'>
              <Button
                type='button'
                variant='secondary'
                onClick={prevFeature}
                disabled={currentFeature === 0}
              >
                ←
              </Button>
              <Button
                type='button'
                variant='secondary'
                onClick={nextFeature}
                disabled={currentFeature === APP_FEATURES.length - 1}
              >
                →
              </Button>
            </div>
          </div>

          <motion.div
            key={currentFeature}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className='space-y-4'
          >
            <div className='flex items-center space-x-3'>
              <div className='p-3 bg-blue-100 rounded-full text-blue-600'>
                {feature.icon}
              </div>
              <div>
                <h4 className='font-semibold text-gray-900'>{feature.title}</h4>
                <p className='text-gray-600'>{feature.description}</p>
              </div>
            </div>

            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-sm text-gray-700'>{feature.demo}</p>
            </div>
          </motion.div>

          <div className='flex justify-center mt-4 space-x-2'>
            {APP_FEATURES.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentFeature ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Préférences de notifications */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
            <Bell className='h-5 w-5 mr-2' />
            Préférences de notifications
          </h3>

          <div className='space-y-3'>
            <label className='flex items-center space-x-3'>
              <input
                type='checkbox'
                {...register('notificationPreferences.email')}
                className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
              />
              <span className='text-sm font-medium text-gray-700'>
                Notifications par email
              </span>
            </label>

            <label className='flex items-center space-x-3'>
              <input
                type='checkbox'
                {...register('notificationPreferences.push')}
                className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
              />
              <span className='text-sm font-medium text-gray-700'>
                Notifications push
              </span>
            </label>

            <label className='flex items-center space-x-3'>
              <input
                type='checkbox'
                {...register('notificationPreferences.sms')}
                className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
              />
              <span className='text-sm font-medium text-gray-700'>
                Notifications SMS
              </span>
            </label>
          </div>
        </div>

        {/* Fréquence des rappels */}
        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Fréquence des rappels
          </h3>
          <select
            {...register('communicationPreferences.reminderFrequency')}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500'
          >
            <option value='none'>Aucun rappel</option>
            <option value='daily'>Quotidien</option>
            <option value='weekly'>Hebdomadaire</option>
            <option value='bi-weekly'>Bi-hebdomadaire</option>
          </select>
        </div>

        {/* Paramètres de confidentialité */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Paramètres de confidentialité
          </h3>

          <div className='space-y-3'>
            <label className='flex items-center space-x-3'>
              <input
                type='checkbox'
                {...register('privacySettings.shareDataForResearch')}
                className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
              />
              <span className='text-sm font-medium text-gray-700'>
                Partager mes données anonymisées pour la recherche
              </span>
            </label>

            <label className='flex items-center space-x-3'>
              <input
                type='checkbox'
                {...register('privacySettings.allowMarketingEmails')}
                className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
              />
              <span className='text-sm font-medium text-gray-700'>
                Recevoir des emails promotionnels
              </span>
            </label>
          </div>
        </div>

        <WizardTip type='tip' title='Personnalisez votre expérience'>
          <p className='text-sm'>
            Vous pourrez modifier tous ces paramètres à tout moment depuis les
            réglages de votre profil.
          </p>
        </WizardTip>

        <div className='flex justify-between pt-6'>
          <Button
            type='button'
            variant='secondary'
            onClick={onPrevious}
            disabled={isSubmitting}
          >
            Retour
          </Button>
          <Button
            type='submit'
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            Continuer
          </Button>
        </div>
      </motion.form>

      <div className='mt-8 text-center text-sm text-gray-500'>
        <p>Étape 8 sur 9 • Dernière étape !</p>
        <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
          <motion.div
            className='bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full'
            initial={{ width: '77%' }}
            animate={{ width: '88%' }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default AppTourStep;
