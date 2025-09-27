/**
 * Étape des identifiants professionnels pour l'onboarding des nutritionnistes
 * Collecte les numéros ASCA, RME et autres certifications
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Shield, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { nutritionistCredentialsSchema } from '@/lib/onboarding-schemas';
import { NutritionistOnboardingData } from '@/types/onboarding';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

interface CredentialsStepProps {
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
  /** ID de l'utilisateur actuel */
  userId?: string;
}

type CredentialsFormData = z.infer<typeof nutritionistCredentialsSchema>;

/**
 * Informations sur les différents types d'identifiants
 */
const CREDENTIAL_INFO = {
  asca: {
    name: 'ASCA',
    description: 'Association Suisse des Thérapeutes Complémentaires',
    format: 'A123456',
    example: 'A123456',
    benefits: [
      'Reconnaissance par les assurances complémentaires',
      'Réseau professionnel établi',
      'Formation continue certifiée',
    ],
  },
  rme: {
    name: 'RME',
    description: 'Registre de Médecine Empirique',
    format: '1234567 (7 chiffres)',
    example: '1234567',
    benefits: [
      'Remboursement par certaines assurances',
      'Reconnaissance officielle',
      'Standards de qualité élevés',
    ],
  },
  ean: {
    name: 'EAN',
    description: 'Code de facturation pour les prestations',
    format: '1234567890123 (13 chiffres)',
    example: '1234567890123',
    benefits: [
      'Facturation électronique simplifiée',
      'Traçabilité des prestations',
      'Intégration avec les systèmes de santé',
    ],
  },
};

/**
 * Étape des identifiants professionnels
 */
export const CredentialsStep: React.FC<CredentialsStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isSubmitting = false,
  userId,
}) => {
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    ascaNumber?: string;
    rmeNumber?: string;
    eanCode?: string;
  }>({});

  // Configuration du formulaire avec validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<CredentialsFormData>({
    resolver: zodResolver(nutritionistCredentialsSchema),
    defaultValues: {
      ascaNumber: data.ascaNumber || '',
      rmeNumber: data.rmeNumber || '',
      eanCode: data.eanCode || '',
    },
    mode: 'onChange',
  });

  // Surveiller les changements pour la sauvegarde automatique
  const watchedFields = watch();

  useEffect(() => {
    if (isDirty) {
      // Effacer l'erreur précédente quand l'utilisateur modifie les champs
      if (submitError) {
        setSubmitError(null);
      }
      
      // Mettre à jour les données localement seulement (pas de sauvegarde automatique)
      onDataChange({
        ...data,
        ...watchedFields,
      });
    }
  }, [watchedFields, isDirty, data, onDataChange, submitError]);

  // Effacer l'erreur quand l'utilisateur change les valeurs des champs
  useEffect(() => {
    if (submitError) {
      setSubmitError(null);
    }
  }, [watchedFields.ascaNumber, watchedFields.rmeNumber, watchedFields.eanCode]);

  /**
   * Vérifier l'unicité d'un identifiant professionnel
   */
  const checkUniqueness = async (field: string, value: string) => {
    if (!value || !value.trim() || !userId) return;

    try {
      const { data: results, error } = await supabase
        .from('nutritionists')
        .select('id')
        .eq(field, value)
        .neq('id', userId);

      // Si on trouve des résultats, c'est qu'il existe déjà
      if (results && results.length > 0) {
        // Mapper les noms de champs de la base de données vers les noms des champs du formulaire
        const fieldMap: Record<string, string> = {
          'asca_number': 'ascaNumber',
          'rme_number': 'rmeNumber', 
          'ean_code': 'eanCode'
        };
        
        const formFieldName = fieldMap[field] || field;
        
        setValidationErrors(prev => ({
          ...prev,
          [formFieldName]: `Ce ${field === 'asca_number' ? 'numéro ASCA' : field === 'rme_number' ? 'numéro RME' : 'code EAN'} est déjà utilisé par un autre nutritionniste.`
        }));
      } else {
        // Effacer l'erreur si elle existe
        const fieldMap: Record<string, string> = {
          'asca_number': 'ascaNumber',
          'rme_number': 'rmeNumber', 
          'ean_code': 'eanCode'
        };
        
        const formFieldName = fieldMap[field] || field;
        
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[formFieldName as keyof typeof newErrors];
          return newErrors;
        });
      }
    } catch (error) {
      // Ignorer les erreurs de requête (comme PGRST116 pour "pas trouvé" ou 406)
      console.log(`Vérification d'unicité pour ${field}:`, error);
    }
  };

  // Vérifier l'unicité avec un délai pour éviter trop de requêtes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedFields.ascaNumber) {
        checkUniqueness('asca_number', watchedFields.ascaNumber);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedFields.ascaNumber, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedFields.rmeNumber) {
        checkUniqueness('rme_number', watchedFields.rmeNumber);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedFields.rmeNumber, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedFields.eanCode) {
        checkUniqueness('ean_code', watchedFields.eanCode);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedFields.eanCode, userId]);

  /**
   * Soumettre le formulaire et passer à l'étape suivante
   */
  const onSubmit = async (formData: CredentialsFormData) => {
    try {
      // Réinitialiser l'erreur précédente
      setSubmitError(null);
      
      const updatedData = {
        ...data,
        ...formData,
      };
      console.log(`🚀 [CredentialsStep] Soumission avec données:`, formData);
      console.log(`📤 [CredentialsStep] Données complètes transmises:`, updatedData);
      
      // Mettre à jour les données localement
      onDataChange(updatedData);
      
      // Passer à l'étape suivante avec les données (peut lever une exception)
      await onNext(updatedData);
    } catch (error) {
      console.error(`❌ [CredentialsStep] Erreur lors de la soumission:`, error);
      
      // Afficher l'erreur à l'utilisateur avec des messages spécifiques
      if (error instanceof Error) {
        switch (error.name) {
          case 'ASCA_DUPLICATE':
            setSubmitError('Ce numéro ASCA est déjà utilisé par un autre nutritionniste. Veuillez vérifier votre numéro.');
            break;
          case 'RME_DUPLICATE':
            setSubmitError('Ce numéro RME est déjà utilisé par un autre nutritionniste. Veuillez vérifier votre numéro.');
            break;
          case 'EAN_DUPLICATE':
            setSubmitError('Ce code EAN est déjà utilisé par un autre nutritionniste. Veuillez vérifier votre code.');
            break;
          default:
            setSubmitError(error.message || 'Une erreur est survenue lors de la sauvegarde');
        }
      } else {
        setSubmitError('Une erreur est survenue lors de la sauvegarde');
      }
      
      // IMPORTANT: Ne pas re-lancer l'erreur ici pour que le formulaire reste sur la même page
      // L'utilisateur doit corriger l'erreur avant de pouvoir continuer
      return; // Arrêter l'exécution ici sans re-lancer l'erreur
    }
  };

  /**
   * Gérer les erreurs de soumission du formulaire
   */
  const onError = (errors: any) => {
    console.error(`❌ [CredentialsStep] Erreurs de validation:`, errors);
  };

  /**
   * Formater le numéro ASCA
   */
  const formatAscaNumber = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length <= 7) {
      return cleaned.replace(/^([A-Z])(.*)/, '$1$2');
    }
    return value;
  };

  /**
   * Formater le numéro RME
   */
  const formatRmeNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 7);
  };

  /**
   * Formater le code EAN
   */
  const formatEanCode = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 13);
  };

  /**
   * Vérifier si au moins un identifiant est renseigné
   */
  const hasAnyCredential = watchedFields.ascaNumber || watchedFields.rmeNumber || watchedFields.eanCode;
  
  /**
   * Calculer si il y a des erreurs d'unicité
   */
  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  
  /**
   * Le bouton doit être désactivé s'il y a des erreurs d'unicité ou de soumission
   */
  const isSubmitDisabled = isSubmitting || hasValidationErrors || !!submitError;

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <motion.form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Titre de l'étape */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Identifiants professionnels
          </h1>
          <p className="text-gray-600 text-lg">
            Numéros ASCA, RME et autres certifications
          </p>
        </div>
        {/* Numéro ASCA */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              <Shield className="inline h-4 w-4 mr-1" />
              Numéro ASCA
            </label>
            <button
              type="button"
              onClick={() => setShowInfo(showInfo === 'asca' ? null : 'asca')}
              className="text-blue-600 hover:text-blue-800"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          
          <Input
            {...register('ascaNumber')}
            type="text"
            placeholder={CREDENTIAL_INFO.asca.example}
            onChange={(e) => {
              const formatted = formatAscaNumber(e.target.value);
              setValue('ascaNumber', formatted, { shouldValidate: true });
            }}
            className={errors.ascaNumber ? 'border-red-300' : ''}
          />
          
          {errors.ascaNumber && (
            <p className="mt-1 text-sm text-red-600">
              {errors.ascaNumber.message}
            </p>
          )}
          
          {validationErrors.ascaNumber && (
            <motion.div
              className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800 font-medium mb-1">
                    Numéro ASCA non disponible
                  </p>
                  <p className="text-sm text-red-700">
                    {validationErrors.ascaNumber}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {showInfo === 'asca' && (
            <motion.div
              className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4 className="font-medium text-blue-900 mb-2">
                {CREDENTIAL_INFO.asca.name}
              </h4>
              <p className="text-sm text-blue-800 mb-2">
                {CREDENTIAL_INFO.asca.description}
              </p>
              <p className="text-sm text-blue-700 mb-2">
                <strong>Format :</strong> {CREDENTIAL_INFO.asca.format}
              </p>
              <div className="text-sm text-blue-700">
                <strong>Avantages :</strong>
                <ul className="mt-1 space-y-1">
                  {CREDENTIAL_INFO.asca.benefits.map((benefit, index) => (
                    <li key={index}>• {benefit}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Numéro RME */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              <Shield className="inline h-4 w-4 mr-1" />
              Numéro RME
            </label>
            <button
              type="button"
              onClick={() => setShowInfo(showInfo === 'rme' ? null : 'rme')}
              className="text-blue-600 hover:text-blue-800"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          
          <Input
            {...register('rmeNumber')}
            type="text"
            placeholder={CREDENTIAL_INFO.rme.example}
            onChange={(e) => {
              const formatted = formatRmeNumber(e.target.value);
              setValue('rmeNumber', formatted, { shouldValidate: true });
            }}
            className={errors.rmeNumber ? 'border-red-300' : ''}
          />
          
          {errors.rmeNumber && (
            <p className="mt-1 text-sm text-red-600">
              {errors.rmeNumber.message}
            </p>
          )}
          
          {validationErrors.rmeNumber && (
            <motion.div
              className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800 font-medium mb-1">
                    Numéro RME non disponible
                  </p>
                  <p className="text-sm text-red-700">
                    {validationErrors.rmeNumber}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {showInfo === 'rme' && (
            <motion.div
              className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4 className="font-medium text-blue-900 mb-2">
                {CREDENTIAL_INFO.rme.name}
              </h4>
              <p className="text-sm text-blue-800 mb-2">
                {CREDENTIAL_INFO.rme.description}
              </p>
              <p className="text-sm text-blue-700 mb-2">
                <strong>Format :</strong> {CREDENTIAL_INFO.rme.format}
              </p>
              <div className="text-sm text-blue-700">
                <strong>Avantages :</strong>
                <ul className="mt-1 space-y-1">
                  {CREDENTIAL_INFO.rme.benefits.map((benefit, index) => (
                    <li key={index}>• {benefit}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Code EAN */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              <Shield className="inline h-4 w-4 mr-1" />
              Code EAN
            </label>
            <button
              type="button"
              onClick={() => setShowInfo(showInfo === 'ean' ? null : 'ean')}
              className="text-blue-600 hover:text-blue-800"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          
          <Input
            {...register('eanCode')}
            type="text"
            placeholder={CREDENTIAL_INFO.ean.example}
            onChange={(e) => {
              const formatted = formatEanCode(e.target.value);
              setValue('eanCode', formatted, { shouldValidate: true });
            }}
            className={errors.eanCode ? 'border-red-300' : ''}
          />
          
          {errors.eanCode && (
            <p className="mt-1 text-sm text-red-600">
              {errors.eanCode.message}
            </p>
          )}
          
          {validationErrors.eanCode && (
            <motion.div
              className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800 font-medium mb-1">
                    Code EAN non disponible
                  </p>
                  <p className="text-sm text-red-700">
                    {validationErrors.eanCode}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {showInfo === 'ean' && (
            <motion.div
              className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4 className="font-medium text-blue-900 mb-2">
                {CREDENTIAL_INFO.ean.name}
              </h4>
              <p className="text-sm text-blue-800 mb-2">
                {CREDENTIAL_INFO.ean.description}
              </p>
              <p className="text-sm text-blue-700 mb-2">
                <strong>Format :</strong> {CREDENTIAL_INFO.ean.format}
              </p>
              <div className="text-sm text-blue-700">
                <strong>Avantages :</strong>
                <ul className="mt-1 space-y-1">
                  {CREDENTIAL_INFO.ean.benefits.map((benefit, index) => (
                    <li key={index}>• {benefit}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Affichage des erreurs de soumission */}
        {submitError && (
          <motion.div
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium mb-1">
                  Impossible de sauvegarder
                </p>
                <p className="text-sm text-red-700">
                  {submitError}
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
            disabled={isSubmitDisabled}
            className="flex items-center space-x-2"
          >
            <span>
              {isSubmitting ? 'Enregistrement...' : hasValidationErrors || submitError ? 'Corrigez les erreurs pour continuer' : 'Continuer'}
            </span>
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default CredentialsStep;
