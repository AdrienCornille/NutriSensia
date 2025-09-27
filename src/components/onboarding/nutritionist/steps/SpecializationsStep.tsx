/**
 * Étape des spécialisations pour l'onboarding des nutritionnistes
 * Collecte les domaines d'expertise et spécialisations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Plus, X, Star, BookOpen, Users } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { nutritionistExpertiseSchema } from '@/lib/onboarding-schemas';
import { NutritionistOnboardingData } from '@/types/onboarding';
import { z } from 'zod';

interface SpecializationsStepProps {
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

type SpecializationsFormData = z.infer<typeof nutritionistExpertiseSchema>;

/**
 * Spécialisations prédéfinies populaires
 */
const POPULAR_SPECIALIZATIONS = [
  'Nutrition sportive',
  'Nutrition pédiatrique',
  'Nutrition gériatrique',
  'Troubles alimentaires',
  'Diabète et métabolisme',
  'Nutrition clinique',
  'Perte de poids',
  'Nutrition végétarienne/végane',
  'Allergies alimentaires',
  'Nutrition préventive',
  'Nutrition oncologique',
  'Troubles digestifs',
  'Nutrition périnatale',
  'Micronutrition',
  'Nutrition comportementale',
];

/**
 * Certifications communes
 */
const COMMON_CERTIFICATIONS = [
  'Diplôme HES en nutrition et diététique',
  'Master en nutrition humaine',
  'Certification ASCA',
  'Certification RME',
  'Formation en nutrition sportive',
  'Formation en troubles alimentaires',
  'Certification en micronutrition',
  'Formation en nutrition clinique',
];

/**
 * Étape des spécialisations
 */
export const SpecializationsStep: React.FC<SpecializationsStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
}) => {
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [customCertification, setCustomCertification] = useState('');

  // Configuration du formulaire avec validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<SpecializationsFormData>({
    resolver: zodResolver(nutritionistExpertiseSchema),
    defaultValues: {
      specializations: data.specializations || [],
      bio: data.bio || '',
      yearsOfExperience: data.yearsOfExperience || undefined,
      certifications: data.certifications || [],
      continuingEducation: data.continuingEducation || false,
      platformTrainingCompleted: data.platformTrainingCompleted || false,
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
  const onSubmit = (formData: SpecializationsFormData) => {
    onDataChange({
      ...data,
      ...formData,
    });
    onNext();
  };

  /**
   * Ajouter une spécialisation
   */
  const addSpecialization = (specialization: string) => {
    const current = watchedFields.specializations || [];
    if (!current.includes(specialization) && current.length < 10) {
      setValue('specializations', [...current, specialization], { shouldValidate: true });
    }
  };

  /**
   * Supprimer une spécialisation
   */
  const removeSpecialization = (specialization: string) => {
    const current = watchedFields.specializations || [];
    setValue('specializations', current.filter(s => s !== specialization), { shouldValidate: true });
  };

  /**
   * Ajouter une spécialisation personnalisée
   */
  const addCustomSpecialization = () => {
    if (customSpecialization.trim() && customSpecialization.length >= 2) {
      addSpecialization(customSpecialization.trim());
      setCustomSpecialization('');
    }
  };

  /**
   * Ajouter une certification
   */
  const addCertification = (certification: string) => {
    const current = watchedFields.certifications || [];
    if (!current.includes(certification)) {
      setValue('certifications', [...current, certification], { shouldValidate: true });
    }
  };

  /**
   * Supprimer une certification
   */
  const removeCertification = (certification: string) => {
    const current = watchedFields.certifications || [];
    setValue('certifications', current.filter(c => c !== certification), { shouldValidate: true });
  };

  /**
   * Ajouter une certification personnalisée
   */
  const addCustomCertification = () => {
    if (customCertification.trim() && customCertification.length >= 2) {
      addCertification(customCertification.trim());
      setCustomCertification('');
    }
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
            Vos spécialisations
          </h1>
          <p className="text-gray-600 text-lg">
            Vos domaines d'expertise et spécialisations
          </p>
        </div>
        {/* Spécialisations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Domaines de spécialisation
          </h3>
          
          {/* Spécialisations sélectionnées */}
          {watchedFields.specializations && watchedFields.specializations.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Sélectionnées :</p>
              <div className="flex flex-wrap gap-2">
                {watchedFields.specializations.map((spec, index) => (
                  <motion.span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(spec)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          
          {/* Spécialisations populaires */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Spécialisations populaires :</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {POPULAR_SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => addSpecialization(spec)}
                  disabled={watchedFields.specializations?.includes(spec) || 
                           (watchedFields.specializations?.length || 0) >= 10}
                  className={`p-2 text-sm text-left rounded-lg border transition-all ${
                    watchedFields.specializations?.includes(spec)
                      ? 'border-purple-500 bg-purple-50 text-purple-700 cursor-not-allowed'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
          
          {/* Ajouter une spécialisation personnalisée */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Ajouter une spécialisation :</p>
            <div className="flex space-x-2">
              <Input
                value={customSpecialization}
                onChange={(e) => setCustomSpecialization(e.target.value)}
                placeholder="Ex: Nutrition anti-inflammatoire"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSpecialization();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addCustomSpecialization}
                disabled={!customSpecialization.trim() || customSpecialization.length < 2}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {errors.specializations && (
            <p className="text-sm text-red-600">
              {errors.specializations.message}
            </p>
          )}
          
          <p className="text-xs text-gray-500">
            Maximum 10 spécialisations. Choisissez celles qui vous représentent le mieux.
          </p>
        </div>

        {/* Biographie professionnelle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BookOpen className="inline h-4 w-4 mr-1" />
            Biographie professionnelle
          </label>
          <textarea
            {...register('bio')}
            rows={4}
            placeholder="Décrivez votre approche, votre philosophie et ce qui vous distingue en tant que nutritionniste..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.bio ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">
              {errors.bio.message}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Cette description sera visible par vos patients potentiels.
          </p>
        </div>

        {/* Années d'expérience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline h-4 w-4 mr-1" />
            Années d'expérience (optionnel)
          </label>
          <Input
            {...register('yearsOfExperience', { valueAsNumber: true })}
            type="number"
            min="0"
            max="50"
            placeholder="5"
            className={errors.yearsOfExperience ? 'border-red-300' : ''}
          />
          {errors.yearsOfExperience && (
            <p className="mt-1 text-sm text-red-600">
              {errors.yearsOfExperience.message}
            </p>
          )}
        </div>

        {/* Certifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Certifications et formations
          </h3>
          
          {/* Certifications sélectionnées */}
          {watchedFields.certifications && watchedFields.certifications.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Vos certifications :</p>
              <div className="space-y-2">
                {watchedFields.certifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-sm text-blue-900">{cert}</span>
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Certifications communes */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Certifications communes :</p>
            <div className="grid gap-2">
              {COMMON_CERTIFICATIONS.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => addCertification(cert)}
                  disabled={watchedFields.certifications?.includes(cert)}
                  className={`p-2 text-sm text-left rounded-lg border transition-all ${
                    watchedFields.certifications?.includes(cert)
                      ? 'border-blue-500 bg-blue-50 text-blue-700 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {cert}
                </button>
              ))}
            </div>
          </div>
          
          {/* Ajouter une certification personnalisée */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Ajouter une certification :</p>
            <div className="flex space-x-2">
              <Input
                value={customCertification}
                onChange={(e) => setCustomCertification(e.target.value)}
                placeholder="Ex: Formation en nutrition fonctionnelle"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomCertification();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addCustomCertification}
                disabled={!customCertification.trim() || customCertification.length < 2}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Formation continue */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Engagement professionnel
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('continuingEducation')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Je m'engage à suivre une formation continue régulière
              </span>
            </label>
          </div>
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

export default SpecializationsStep;
