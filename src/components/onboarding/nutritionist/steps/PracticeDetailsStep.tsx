/**
 * Étape des détails du cabinet pour l'onboarding des nutritionnistes
 * Collecte l'adresse du cabinet et les informations pratiques
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Building, MapPin, Phone, Globe, Clock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { practiceDetailsSchema } from '@/lib/onboarding-schemas';
import { NutritionistOnboardingData } from '@/types/onboarding';
import { z } from 'zod';

interface PracticeDetailsStepProps {
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

type PracticeDetailsFormData = z.infer<typeof practiceDetailsSchema>;

/**
 * Cantons suisses avec leurs codes
 */
const SWISS_CANTONS = [
  { code: 'AG', name: 'Argovie' },
  { code: 'AI', name: 'Appenzell Rhodes-Intérieures' },
  { code: 'AR', name: 'Appenzell Rhodes-Extérieures' },
  { code: 'BE', name: 'Berne' },
  { code: 'BL', name: 'Bâle-Campagne' },
  { code: 'BS', name: 'Bâle-Ville' },
  { code: 'FR', name: 'Fribourg' },
  { code: 'GE', name: 'Genève' },
  { code: 'GL', name: 'Glaris' },
  { code: 'GR', name: 'Grisons' },
  { code: 'JU', name: 'Jura' },
  { code: 'LU', name: 'Lucerne' },
  { code: 'NE', name: 'Neuchâtel' },
  { code: 'NW', name: 'Nidwald' },
  { code: 'OW', name: 'Obwald' },
  { code: 'SG', name: 'Saint-Gall' },
  { code: 'SH', name: 'Schaffhouse' },
  { code: 'SO', name: 'Soleure' },
  { code: 'SZ', name: 'Schwyz' },
  { code: 'TG', name: 'Thurgovie' },
  { code: 'TI', name: 'Tessin' },
  { code: 'UR', name: 'Uri' },
  { code: 'VD', name: 'Vaud' },
  { code: 'VS', name: 'Valais' },
  { code: 'ZG', name: 'Zoug' },
  { code: 'ZH', name: 'Zurich' },
];

/**
 * Types de consultation disponibles
 */
const CONSULTATION_TYPES = [
  { 
    id: 'in-person', 
    label: 'En présentiel', 
    description: 'Consultations dans votre cabinet',
    icon: <Building className="h-4 w-4" />
  },
  { 
    id: 'video', 
    label: 'Visioconférence', 
    description: 'Consultations en ligne par vidéo',
    icon: <Globe className="h-4 w-4" />
  },
  { 
    id: 'phone', 
    label: 'Téléphone', 
    description: 'Consultations par appel téléphonique',
    icon: <Phone className="h-4 w-4" />
  },
];

/**
 * Langues disponibles pour les consultations
 */
const CONSULTATION_LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Allemand' },
  { code: 'it', name: 'Italien' },
  { code: 'en', name: 'Anglais' },
  { code: 'es', name: 'Espagnol' },
];

/**
 * Étape des détails du cabinet
 */
export const PracticeDetailsStep: React.FC<PracticeDetailsStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
}) => {

  // Configuration du formulaire avec validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<PracticeDetailsFormData>({
    resolver: zodResolver(practiceDetailsSchema),
    defaultValues: {
      practiceAddress: data.practiceAddress || {
        street: '',
        postal_code: '',
        city: '',
        canton: '',
        country: 'CH',
      },
      consultationRates: data.consultationRates || {
        initial: 22500, // CHF 225.00
        follow_up: 15000, // CHF 150.00
        express: 7500, // CHF 75.00
      },
      maxPatients: data.maxPatients || 100,
      consultationTypes: data.consultationTypes || ['in-person'],
      availableLanguages: data.availableLanguages || ['fr'],
    },
    mode: 'onChange',
  });

  // Surveiller les changements pour la sauvegarde automatique
  const watchedFields = watch();

  useEffect(() => {
    if (isDirty) {
      // Mettre à jour les données localement seulement (pas de sauvegarde automatique)
      onDataChange({
        ...data,
        ...watchedFields,
      });
    }
  }, [watchedFields, isDirty, data, onDataChange]);

  /**
   * Soumettre le formulaire et passer à l'étape suivante
   */
  const onSubmit = (formData: PracticeDetailsFormData) => {
    const updatedData = {
      ...data,
      ...formData,
    };
    console.log(`🚀 [PracticeDetailsStep] Soumission avec données:`, formData);
    
    // Mettre à jour les données localement
    onDataChange(updatedData);
    
    // Passer à l'étape suivante avec les données
    onNext(updatedData);
  };

  /**
   * Formater le code postal
   */
  const formatPostalCode = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 4);
  };

  /**
   * Formater les tarifs en centimes
   */
  const formatRate = (value: string) => {
    const numValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    return isNaN(numValue) ? 0 : Math.round(numValue * 100);
  };

  /**
   * Afficher les tarifs en CHF
   */
  const displayRate = (centimes: number) => {
    return (centimes / 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Titre de l'étape */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Détails de votre cabinet
          </h1>
          <p className="text-gray-600 text-lg">
            Adresse du cabinet et informations pratiques
          </p>
        </div>
        {/* Adresse du cabinet */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Adresse du cabinet
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rue et numéro *
            </label>
            <Input
              {...register('practiceAddress.street')}
              type="text"
              placeholder="Rue de la Paix 123"
              className={errors.practiceAddress?.street ? 'border-red-300' : ''}
            />
            {errors.practiceAddress?.street && (
              <p className="mt-1 text-sm text-red-600">
                {errors.practiceAddress.street.message}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal *
              </label>
              <Input
                {...register('practiceAddress.postal_code')}
                type="text"
                placeholder="1000"
                maxLength={4}
                onChange={(e) => {
                  const formatted = formatPostalCode(e.target.value);
                  setValue('practiceAddress.postal_code', formatted, { shouldValidate: true });
                }}
                className={errors.practiceAddress?.postal_code ? 'border-red-300' : ''}
              />
              {errors.practiceAddress?.postal_code && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.practiceAddress.postal_code.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <Input
                {...register('practiceAddress.city')}
                type="text"
                placeholder="Lausanne"
                className={errors.practiceAddress?.city ? 'border-red-300' : ''}
              />
              {errors.practiceAddress?.city && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.practiceAddress.city.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canton *
              </label>
              <select
                {...register('practiceAddress.canton')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.practiceAddress?.canton ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner</option>
                {SWISS_CANTONS.map((canton) => (
                  <option key={canton.code} value={canton.code}>
                    {canton.name} ({canton.code})
                  </option>
                ))}
              </select>
              {errors.practiceAddress?.canton && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.practiceAddress.canton.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Types de consultation */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Types de consultation
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {CONSULTATION_TYPES.map((type) => (
              <label
                key={type.id}
                className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  watchedFields.consultationTypes?.includes(type.id as any)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  value={type.id}
                  {...register('consultationTypes')}
                  className="sr-only"
                />
                <div className="text-blue-600 mb-2">
                  {type.icon}
                </div>
                <span className="font-medium text-gray-900">{type.label}</span>
                <span className="text-sm text-gray-500 text-center mt-1">
                  {type.description}
                </span>
              </label>
            ))}
          </div>
          {errors.consultationTypes && (
            <p className="text-sm text-red-600">
              {errors.consultationTypes.message}
            </p>
          )}
        </div>

        {/* Langues disponibles */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Langues de consultation
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {CONSULTATION_LANGUAGES.map((lang) => (
              <label
                key={lang.code}
                className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                  watchedFields.availableLanguages?.includes(lang.code)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  value={lang.code}
                  {...register('availableLanguages')}
                  className="sr-only"
                />
                <span className="font-medium text-gray-900">{lang.name}</span>
              </label>
            ))}
          </div>
          {errors.availableLanguages && (
            <p className="text-sm text-red-600">
              {errors.availableLanguages.message}
            </p>
          )}
        </div>

        {/* Nombre maximum de patients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre maximum de patients
          </label>
          <Input
            {...register('maxPatients', { valueAsNumber: true })}
            type="number"
            min="1"
            max="500"
            placeholder="100"
            className={errors.maxPatients ? 'border-red-300' : ''}
          />
          {errors.maxPatients && (
            <p className="mt-1 text-sm text-red-600">
              {errors.maxPatients.message}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Vous pourrez modifier cette limite plus tard dans vos paramètres
          </p>
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onPrevious}
            disabled={isSubmitting}
          >
            Retour
          </Button>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="flex items-center space-x-2"
          >
            <span>
              {isSubmitting ? 'Enregistrement...' : 'Continuer'}
            </span>
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default PracticeDetailsStep;
