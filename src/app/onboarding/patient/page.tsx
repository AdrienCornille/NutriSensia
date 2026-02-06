/**
 * Page d'onboarding pour les patients
 * Point d'entrée pour l'assistant d'onboarding des patients
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PatientOnboardingWizardSimple } from '@/components/onboarding/patient/PatientOnboardingWizardSimple';
import { PatientOnboardingData } from '@/types/onboarding';
import { supabase } from '@/lib/supabase';
import { useNotification } from '@/components/ui/Notification';

// Force dynamic rendering - cette page utilise useAuth qui nécessite AuthProvider
export const dynamic = 'force-dynamic';

/**
 * Page d'onboarding des patients
 */
export default function PatientOnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showError, showSuccess } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<
    Partial<PatientOnboardingData>
  >({});

  // Vérifier l'authentification et le rôle
  useEffect(() => {
    const checkUserAccess = async () => {
      console.log(
        '🔍 [PatientOnboarding] Vérification accès - authLoading:',
        authLoading,
        'user:',
        !!user
      );

      // Attendre que l'authentification soit chargée
      if (authLoading) {
        console.log(
          "⏳ [PatientOnboarding] En attente du chargement de l'authentification..."
        );
        return;
      }

      if (!user) {
        console.log(
          '🚫 [PatientOnboarding] Aucun utilisateur connecté - redirection vers signin'
        );
        // Rediriger vers la connexion si pas d'utilisateur
        router.push('/auth/signin?redirect=/onboarding/patient');
        return;
      }

      // Vérifier que l'utilisateur est bien un patient
      const userRole = user.user_metadata?.role;
      console.log('🔍 Rôle utilisateur détecté:', userRole);

      if (userRole !== 'patient') {
        console.log('🚫 Accès refusé - Rôle incorrect:', userRole);
        showError(
          'Accès non autorisé',
          `Cette page est réservée aux patients. Votre rôle actuel est: ${userRole}`
        );

        // Rediriger vers la page d'onboarding appropriée selon le rôle
        if (userRole === 'nutritionist') {
          router.push('/onboarding/nutritionist');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      // Charger les données existantes si disponibles
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          // Pré-remplir les données si elles existent
          setInitialData({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            phone: profile.phone || '',
            timezone: profile.timezone || 'Europe/Zurich',
            locale: profile.locale || 'fr',
            // Ajouter d'autres champs selon les données disponibles
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        // Continuer avec des données vides si erreur
      }

      setIsLoading(false);
    };

    checkUserAccess();
  }, [user, router, authLoading, showError]); // showError est maintenant stable

  /**
   * Gérer la completion de l'onboarding
   */
  const handleOnboardingComplete = async (data: PatientOnboardingData) => {
    try {
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Sauvegarder les données dans la base
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          timezone: data.timezone,
          locale: data.locale,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          height_cm: data.height,
          weight_kg: data.currentWeight,
          activity_level: data.activityLevel,
          dietary_restrictions: data.dietaryRestrictions,
          allergies: data.allergies,
          goals: data.primaryGoals,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Marquer l'onboarding comme terminé
      const { error: onboardingError } = await supabase
        .from('profiles')
        .update({
          onboarding_status: 'completed',
          onboarding_completed: true,
          completed_at: new Date().toISOString(),
          onboarding_data: data,
        })
        .eq('id', user.id);

      if (onboardingError) throw onboardingError;

      showSuccess(
        'Onboarding terminé !',
        'Votre profil a été configuré avec succès.'
      );

      // Rediriger vers le tableau de bord patient
      router.push('/dashboard/patient');
    } catch (error) {
      console.error("Erreur lors de la finalisation de l'onboarding:", error);
      showError(
        'Erreur de sauvegarde',
        'Une erreur est survenue. Veuillez réessayer.'
      );
      throw error;
    }
  };

  /**
   * Gérer la fermeture de l'onboarding
   */
  const handleClose = () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir quitter l'onboarding ? Votre progression sera sauvegardée."
      )
    ) {
      router.push('/dashboard');
    }
  };

  // Affichage de chargement
  if (isLoading || authLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-teal-100'>
      <PatientOnboardingWizardSimple
        onComplete={handleOnboardingComplete}
        initialData={initialData}
      />
    </div>
  );
}
