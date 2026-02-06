/**
 * Page d'onboarding pour les nutritionnistes
 * Point d'entrée pour l'assistant d'onboarding des professionnels
 * Dernière mise à jour: 2025-01-15 - Correction boucle infinie
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedNutritionistWrapper } from '@/components/onboarding/enhanced';
import { NutritionistOnboardingData } from '@/types/onboarding';
import { supabase } from '@/lib/supabase';
import { useNotification } from '@/components/ui/Notification';

// Force dynamic rendering - cette page utilise useAuth qui nécessite AuthProvider
export const dynamic = 'force-dynamic';

/**
 * Page d'onboarding des nutritionnistes
 */
export default function NutritionistOnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showError, showSuccess } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<
    Partial<NutritionistOnboardingData>
  >({});
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Vérifier l'authentification et le rôle
  useEffect(() => {
    const checkUserAccess = async () => {
      // Attendre que l'authentification soit chargée
      if (authLoading || hasLoadedInitialData) {
        return;
      }

      if (!user) {
        // Rediriger vers la connexion si pas d'utilisateur
        router.push('/auth/signin?redirect=/onboarding/nutritionist');
        return;
      }

      // Vérifier que l'utilisateur est bien un nutritionniste
      const userRole = user.user_metadata?.role;
      if (userRole !== 'nutritionist') {
        router.push('/dashboard');
        return;
      }

      // Charger les données existantes depuis la table profiles uniquement
      // Éviter les tables nutritionist_profiles et nutritionists qui causent des erreurs 406
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.warn('Erreur lors du chargement du profil:', profileError);
        }

        // NOUVEAU: Charger les données complètes du nutritionniste
        const { data: nutritionistData, error: checkError } = await supabase
          .from('nutritionists')
          .select('*')
          .eq('id', user.id)
          .single();

        let nutritionistInfo: any = {};

        if (checkError && checkError.code === 'PGRST116') {
          // L'entrée n'existe pas, la créer avec des données par défaut
          const { data: newNutritionist, error: createError } = await supabase
            .from('nutritionists')
            .insert({
              id: user.id,
              first_name: profile?.first_name || '',
              last_name: profile?.last_name || '',
              phone: profile?.phone || '',
              locale: profile?.locale || 'fr-CH',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_active: true,
              verified: false,
              max_patients: 100,
            })
            .select()
            .single();

          if (!createError) {
            nutritionistInfo = newNutritionist || {};
          }
        } else if (!checkError && nutritionistData) {
          nutritionistInfo = nutritionistData;
        }

        // Initialiser avec les données combinées (profiles + nutritionists)
        const initialData: Partial<NutritionistOnboardingData> = {
          // Informations personnelles (priorité aux données nutritionniste si disponibles)
          firstName: nutritionistInfo.first_name || profile?.first_name || '',
          lastName: nutritionistInfo.last_name || profile?.last_name || '',
          phone: nutritionistInfo.phone || profile?.phone || '',
          locale: nutritionistInfo.locale || profile?.locale || 'fr-CH',
          avatar_url: nutritionistInfo.avatar_url || profile?.avatar_url || '',

          // Données professionnelles depuis nutritionists
          ascaNumber: nutritionistInfo.asca_number || '',
          rmeNumber: nutritionistInfo.rme_number || '',
          eanCode: nutritionistInfo.ean_code || '',
          specializations: nutritionistInfo.specializations || [],
          bio: nutritionistInfo.bio || '',
          yearsOfExperience: nutritionistInfo.years_of_experience || undefined,
          certifications: nutritionistInfo.certifications || [],
          continuingEducation: nutritionistInfo.continuing_education || false,
          consultationRates: nutritionistInfo.consultation_rates || {
            initial: 22500,
            follow_up: 15000,
            express: 7500,
          },
          consultationTypes: nutritionistInfo.consultation_types || [
            'initial',
            'suivi',
            'express',
          ],
          practiceAddress: nutritionistInfo.practice_address || {
            street: '',
            postal_code: '',
            city: '',
            canton: '',
            country: 'CH',
          },
          maxPatients: nutritionistInfo.max_patients || 100,

          // Consentements légaux (RGPD)
          termsAccepted: nutritionistInfo.terms_accepted || false,
          privacyPolicyAccepted:
            nutritionistInfo.privacy_policy_accepted || false,
          marketingConsent: nutritionistInfo.marketing_consent || false,
        };

        console.log('📋 Données de consentement chargées:', {
          termsAccepted: nutritionistInfo.terms_accepted,
          privacyPolicyAccepted: nutritionistInfo.privacy_policy_accepted,
          marketingConsent: nutritionistInfo.marketing_consent,
        });

        setInitialData(initialData);
      } catch (error) {
        // En cas d'erreur, initialiser avec des valeurs par défaut
        setInitialData({
          firstName: '',
          lastName: '',
          phone: '',
          locale: 'fr-CH',
          specializations: [],
          consultationRates: {
            initial: 22500,
            follow_up: 15000,
            express: 7500,
          },
          practiceAddress: {
            street: '',
            postal_code: '',
            city: '',
            canton: '',
            country: 'CH',
          },
          maxPatients: 100,
        });
      }

      setIsLoading(false);
      setHasLoadedInitialData(true);
    };

    checkUserAccess();
  }, [user, router, authLoading, hasLoadedInitialData]);

  /**
   * Gérer la completion de l'onboarding - NOUVELLE ARCHITECTURE
   */
  const handleOnboardingComplete = useCallback(
    async (data: NutritionistOnboardingData) => {
      try {
        // Étape 1: Mettre à jour seulement le timestamp dans la table profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('id', user!.id);

        if (profileError) {
          throw profileError;
        }

        // Étape 2: Marquer l'onboarding comme terminé (100%) dans la table nutritionists
        const { error: nutritionistError } = await supabase
          .from('nutritionists')
          .update({
            onboarding_completed: 100, // INTEGER (0-100), 100 = terminé
            onboarding_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user!.id);

        if (nutritionistError) {
          throw nutritionistError;
        }
        showSuccess(
          'Onboarding terminé !',
          'Votre profil professionnel a été créé avec succès. Un administrateur va vérifier vos informations. Vous pouvez continuer à modifier votre profil si nécessaire.'
        );
      } catch (error) {
        showError(
          'Erreur de sauvegarde',
          'Une erreur est survenue lors de la finalisation. Veuillez réessayer.'
        );
        throw error;
      }
    },
    [user, showSuccess, showError, router]
  );

  /**
   * Sauvegarder la progression de l'onboarding (à chaque étape) - NOUVELLE ARCHITECTURE
   */
  const handleProgressSave = useCallback(
    async (data: Partial<NutritionistOnboardingData>) => {
      try {
        if (!user) {
          return;
        }

        // Récupérer les données existantes pour comparaison
        const { data: existingData, error: fetchError } = await supabase
          .from('nutritionists')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          return;
        }

        // Sauvegarder directement dans la table nutritionists (nouvelle architecture)
        const nutritionistUpdate: any = {};
        let hasAnyData = false;

        // Fonction helper pour vérifier si un champ a été modifié
        const hasFieldChanged = (fieldName: string, newValue: any) => {
          if (existingData && existingData[fieldName] !== undefined) {
            return existingData[fieldName] !== newValue;
          }
          return newValue !== undefined && newValue !== null && newValue !== '';
        };

        // Informations personnelles - ne sauvegarder que si modifiées
        if (data.firstName && hasFieldChanged('first_name', data.firstName)) {
          nutritionistUpdate.first_name = data.firstName;
          hasAnyData = true;
        }
        if (data.lastName && hasFieldChanged('last_name', data.lastName)) {
          nutritionistUpdate.last_name = data.lastName;
          hasAnyData = true;
        }
        if (data.phone && hasFieldChanged('phone', data.phone)) {
          nutritionistUpdate.phone = data.phone;
          hasAnyData = true;
        }
        if (data.locale && hasFieldChanged('locale', data.locale)) {
          nutritionistUpdate.locale = data.locale;
          hasAnyData = true;
        }
        if (
          data.avatar_url !== undefined &&
          hasFieldChanged('avatar_url', data.avatar_url)
        ) {
          nutritionistUpdate.avatar_url = data.avatar_url;
          hasAnyData = true;
        }

        // Données professionnelles - TOUJOURS vérifier l'unicité même si pas modifiées
        if (data.ascaNumber && data.ascaNumber.trim() !== '') {
          // Vérifier l'unicité du numéro ASCA avant de l'ajouter
          try {
            const { data: ascaResults, error: ascaError } = await supabase
              .from('nutritionists')
              .select('id')
              .eq('asca_number', data.ascaNumber)
              .neq('id', user.id); // Exclure l'utilisateur actuel

            // Si on trouve des résultats, c'est qu'il existe déjà
            if (ascaResults && ascaResults.length > 0) {
              showError(
                'Numéro ASCA déjà utilisé',
                'Ce numéro ASCA est déjà utilisé par un autre nutritionniste. Veuillez vérifier votre numéro.'
              );
              const error = new Error('Numéro ASCA déjà utilisé');
              error.name = 'ASCA_DUPLICATE';
              throw error;
            }

            // Si l'erreur n'est pas "pas trouvé", c'est un vrai problème
            if (ascaError && ascaError.code !== 'PGRST116') {
              // On continue quand même pour ne pas bloquer l'utilisateur
            }
          } catch (error) {
            // Si c'est notre erreur de doublon, la relancer
            if (error instanceof Error && error.name === 'ASCA_DUPLICATE') {
              throw error;
            }
            // Sinon, ignorer l'erreur et continuer
          }

          // Ajouter à la mise à jour seulement si modifié
          if (hasFieldChanged('asca_number', data.ascaNumber)) {
            nutritionistUpdate.asca_number = data.ascaNumber;
            hasAnyData = true;
          }
        }
        if (data.rmeNumber && data.rmeNumber.trim() !== '') {
          // Vérifier l'unicité du numéro RME avant de l'ajouter
          try {
            const { data: rmeResults, error: rmeError } = await supabase
              .from('nutritionists')
              .select('id')
              .eq('rme_number', data.rmeNumber)
              .neq('id', user.id); // Exclure l'utilisateur actuel

            // Si on trouve des résultats, c'est qu'il existe déjà
            if (rmeResults && rmeResults.length > 0) {
              showError(
                'Numéro RME déjà utilisé',
                'Ce numéro RME est déjà utilisé par un autre nutritionniste. Veuillez vérifier votre numéro.'
              );
              const error = new Error('Numéro RME déjà utilisé');
              error.name = 'RME_DUPLICATE';
              throw error;
            }

            // Si l'erreur n'est pas "pas trouvé", c'est un vrai problème
            if (rmeError && rmeError.code !== 'PGRST116') {
              // On continue quand même pour ne pas bloquer l'utilisateur
            }
          } catch (error) {
            // Si c'est notre erreur de doublon, la relancer
            if (error instanceof Error && error.name === 'RME_DUPLICATE') {
              throw error;
            }
            // Sinon, ignorer l'erreur et continuer
          }

          // Ajouter à la mise à jour seulement si modifié
          if (hasFieldChanged('rme_number', data.rmeNumber)) {
            nutritionistUpdate.rme_number = data.rmeNumber;
            hasAnyData = true;
          }
        }
        if (data.eanCode && data.eanCode.trim() !== '') {
          // Vérifier l'unicité du code EAN avant de l'ajouter
          try {
            const { data: eanResults, error: eanError } = await supabase
              .from('nutritionists')
              .select('id')
              .eq('ean_code', data.eanCode)
              .neq('id', user.id); // Exclure l'utilisateur actuel

            // Si on trouve des résultats, c'est qu'il existe déjà
            if (eanResults && eanResults.length > 0) {
              showError(
                'Code EAN déjà utilisé',
                'Ce code EAN est déjà utilisé par un autre nutritionniste. Veuillez vérifier votre code.'
              );
              const error = new Error('Code EAN déjà utilisé');
              error.name = 'EAN_DUPLICATE';
              throw error;
            }

            // Si l'erreur n'est pas "pas trouvé", c'est un vrai problème
            if (eanError && eanError.code !== 'PGRST116') {
              // On continue quand même pour ne pas bloquer l'utilisateur
            }
          } catch (error) {
            // Si c'est notre erreur de doublon, la relancer
            if (error instanceof Error && error.name === 'EAN_DUPLICATE') {
              throw error;
            }
            // Sinon, ignorer l'erreur et continuer
          }

          // Ajouter à la mise à jour seulement si modifié
          if (hasFieldChanged('ean_code', data.eanCode)) {
            nutritionistUpdate.ean_code = data.eanCode;
            hasAnyData = true;
          }
        }
        if (
          data.specializations &&
          hasFieldChanged('specializations', data.specializations)
        ) {
          nutritionistUpdate.specializations = data.specializations;
          hasAnyData = true;
        }
        if (data.bio && hasFieldChanged('bio', data.bio)) {
          nutritionistUpdate.bio = data.bio;
          hasAnyData = true;
        }
        if (
          data.yearsOfExperience !== undefined &&
          hasFieldChanged('years_of_experience', data.yearsOfExperience)
        ) {
          nutritionistUpdate.years_of_experience = data.yearsOfExperience;
          hasAnyData = true;
        }
        if (
          data.certifications &&
          hasFieldChanged('certifications', data.certifications)
        ) {
          nutritionistUpdate.certifications = data.certifications;
          hasAnyData = true;
        }
        if (
          data.continuingEducation !== undefined &&
          hasFieldChanged('continuing_education', data.continuingEducation)
        ) {
          nutritionistUpdate.continuing_education = data.continuingEducation;
          hasAnyData = true;
        }
        if (
          data.consultationRates &&
          hasFieldChanged('consultation_rates', data.consultationRates)
        ) {
          nutritionistUpdate.consultation_rates = data.consultationRates;
          hasAnyData = true;
        }
        if (
          data.consultationTypes &&
          hasFieldChanged('consultation_types', data.consultationTypes)
        ) {
          nutritionistUpdate.consultation_types = data.consultationTypes;
          hasAnyData = true;
        }
        if (
          data.practiceAddress &&
          hasFieldChanged('practice_address', data.practiceAddress)
        ) {
          nutritionistUpdate.practice_address = data.practiceAddress;
          hasAnyData = true;
        }
        if (
          data.maxPatients !== undefined &&
          hasFieldChanged('max_patients', data.maxPatients)
        ) {
          nutritionistUpdate.max_patients = data.maxPatients;
          hasAnyData = true;
        }

        // Gestion des consentements légaux (RGPD) - TOUJOURS sauvegarder avec nouvel horodatage
        if (data.termsAccepted !== undefined) {
          nutritionistUpdate.terms_accepted = data.termsAccepted;
          if (data.termsAccepted) {
            nutritionistUpdate.terms_accepted_at = new Date().toISOString();
          }
          hasAnyData = true;
          console.log('💾 Sauvegarde termsAccepted:', data.termsAccepted);
        }
        if (data.privacyPolicyAccepted !== undefined) {
          nutritionistUpdate.privacy_policy_accepted =
            data.privacyPolicyAccepted;
          if (data.privacyPolicyAccepted) {
            nutritionistUpdate.privacy_policy_accepted_at =
              new Date().toISOString();
          }
          hasAnyData = true;
          console.log(
            '💾 Sauvegarde privacyPolicyAccepted:',
            data.privacyPolicyAccepted
          );
        }
        if (data.marketingConsent !== undefined) {
          nutritionistUpdate.marketing_consent = data.marketingConsent;
          nutritionistUpdate.marketing_consent_at = new Date().toISOString(); // Toujours enregistrer la date du choix
          hasAnyData = true;
          console.log('💾 Sauvegarde marketingConsent:', data.marketingConsent);
        }

        // Sauvegarder seulement s'il y a des données
        if (hasAnyData) {
          nutritionistUpdate.id = user.id;
          nutritionistUpdate.updated_at = new Date().toISOString();

          // Mettre à jour les données d'onboarding
          nutritionistUpdate.onboarding_data = data;

          // Valeurs par défaut pour la création
          if (!nutritionistUpdate.verified) nutritionistUpdate.verified = false;
          if (!nutritionistUpdate.is_active)
            nutritionistUpdate.is_active = true;
          if (!nutritionistUpdate.profile_public)
            nutritionistUpdate.profile_public = false;
          if (!nutritionistUpdate.allow_contact)
            nutritionistUpdate.allow_contact = true;
          if (!nutritionistUpdate.notification_preferences) {
            nutritionistUpdate.notification_preferences = {
              email: true,
              push: true,
              sms: false,
            };
          }

          // Vérifier d'abord si l'entrée existe
          const { data: existingNutritionist, error: checkError } =
            await supabase
              .from('nutritionists')
              .select('id')
              .eq('id', user.id)
              .single();

          let nutritionistError = null;

          if (checkError && checkError.code === 'PGRST116') {
            // L'entrée n'existe pas, la créer
            console.log(
              '🆕 Création nouveau nutritionniste avec données:',
              nutritionistUpdate
            );
            const { error: insertError } = await supabase
              .from('nutritionists')
              .insert(nutritionistUpdate);
            nutritionistError = insertError;
            if (!insertError) {
              console.log('✅ Nutritionniste créé avec succès');
            }
          } else if (!checkError) {
            // L'entrée existe, la mettre à jour
            console.log(
              '🔄 Mise à jour nutritionniste avec données:',
              nutritionistUpdate
            );
            const { error: updateError } = await supabase
              .from('nutritionists')
              .update(nutritionistUpdate)
              .eq('id', user.id);
            nutritionistError = updateError;
            if (!updateError) {
              console.log('✅ Nutritionniste mis à jour avec succès');
            }
          } else {
            // Autre erreur lors de la vérification
            nutritionistError = checkError;
          }

          if (nutritionistError) {
            // Gestion spécifique des erreurs de contraintes d'unicité
            if (nutritionistError.code === '23505') {
              // Afficher un message d'erreur plus explicite à l'utilisateur
              if (nutritionistError.message.includes('rme_number')) {
                showError(
                  'Numéro RME déjà utilisé',
                  'Ce numéro RME est déjà utilisé par un autre nutritionniste. Veuillez vérifier votre numéro.'
                );
              } else if (nutritionistError.message.includes('asca_number')) {
                showError(
                  'Numéro ASCA déjà utilisé',
                  'Ce numéro ASCA est déjà utilisé par un autre nutritionniste. Veuillez vérifier votre numéro.'
                );
              } else if (nutritionistError.message.includes('ean_code')) {
                showError(
                  'Code EAN déjà utilisé',
                  'Ce code EAN est déjà utilisé par un autre nutritionniste. Veuillez vérifier votre code.'
                );
              } else {
                showError(
                  'Données déjà utilisées',
                  'Certaines de vos données professionnelles sont déjà utilisées par un autre nutritionniste.'
                );
              }

              // IMPORTANT: Lancer une exception pour empêcher la progression
              throw new Error(
                `Contrainte d'unicité violée: ${nutritionistError.message}`
              );
            } else {
              // Pour les autres erreurs, lancer une exception générique
              throw new Error(
                `Erreur de sauvegarde: ${nutritionistError.message}`
              );
            }
          }
        }
      } catch (error) {
        // Les erreurs sont gérées par les composants parents
      }
    },
    [user]
  );

  /**
   * Gérer la fermeture de l'onboarding
   */
  const handleOnboardingClose = useCallback(() => {
    // Confirmer avant de fermer
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir quitter l'onboarding ? Votre progression sera sauvegardée."
      )
    ) {
      router.push('/dashboard');
    }
  }, [router]);

  // Affichage de chargement
  if (isLoading || authLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Vérification d'accès échouée
  if (!user) {
    return null; // La redirection est en cours
  }

  return (
    <AnimatedNutritionistWrapper
      key={`animated-wizard-${user.id}`} // Clé stable basée seulement sur l'ID utilisateur
      userId={user.id}
      onComplete={handleOnboardingComplete}
      onClose={handleOnboardingClose}
      onProgressSave={handleProgressSave}
      initialData={hasLoadedInitialData ? initialData : {}} // Ne passer les données que si elles sont chargées
    />
  );
}
