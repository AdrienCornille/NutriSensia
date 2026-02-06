/**
 * Page de démonstration du système de suivi de complétude du profil
 *
 * Cette page montre comment intégrer le système de suivi de complétude
 * dans l'application NutriSensia avec des données d'exemple.
 */

'use client';

import { useState } from 'react';
import { ProfileCompletionDashboard } from '@/components/profile';
import type { ProfileData, UserRole } from '@/lib/profile-completion';

// Données d'exemple pour un nutritionniste
const exampleNutritionistData: Partial<ProfileData> = {
  first_name: 'Marie',
  last_name: 'Dubois',
  phone: '+41 79 123 45 67',
  avatar_url: 'https://example.com/avatar.jpg',
  locale: 'fr-CH',
  timezone: 'Europe/Zurich',
  asca_number: 'ASCA-12345',
  specializations: ['Nutrition sportive', 'Troubles alimentaires'],
  bio: "Nutritionniste diplômée avec 10 ans d'expérience dans l'accompagnement personnalisé. Spécialisée dans la nutrition sportive et la gestion des troubles alimentaires.",
  consultation_rates: {
    initial_consultation: 120,
    follow_up_consultation: 80,
    group_session: 60,
    online_consultation: 70,
    currency: 'CHF',
  },
  practice_address: {
    street: 'Rue de la Santé 15',
    city: 'Genève',
    postal_code: '1201',
    country: 'Suisse',
    canton: 'GE',
  },
};

// Données d'exemple pour un patient
const examplePatientData: Partial<ProfileData> = {
  first_name: 'Jean',
  last_name: 'Martin',
  phone: '+41 78 987 65 43',
  locale: 'fr-CH',
  timezone: 'Europe/Zurich',
  date_of_birth: '1985-06-15',
  gender: 'male',
  height: 175,
  initial_weight: 80,
  target_weight: 75,
  activity_level: 'moderate',
  allergies: ['Arachides', 'Fruits de mer'],
  dietary_restrictions: ['Végétarien'],
  medical_conditions: [],
  medications: [],
};

export default function ProfileCompletionPage() {
  const [userRole, setUserRole] = useState<UserRole>('nutritionist');
  const [profileData, setProfileData] = useState<Partial<ProfileData>>(
    userRole === 'nutritionist' ? exampleNutritionistData : examplePatientData
  );

  // Simuler la sauvegarde des paramètres de confidentialité
  const handleSavePrivacySettings = async (settings: any) => {
    console.log('Sauvegarde des paramètres de confidentialité:', settings);
    // Ici, vous feriez un appel à votre API
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Simuler la navigation vers l'édition du profil
  const handleEditProfile = () => {
    console.log("Navigation vers l'édition du profil");
    // Ici, vous navigueriez vers la page d'édition
  };

  // Simuler la navigation vers un champ spécifique
  const handleEditField = (fieldName: string) => {
    console.log('Navigation vers le champ:', fieldName);
    // Ici, vous navigueriez vers le champ spécifique à éditer
  };

  // Changer de rôle pour la démonstration
  const switchRole = () => {
    const newRole = userRole === 'nutritionist' ? 'patient' : 'nutritionist';
    setUserRole(newRole);
    setProfileData(
      newRole === 'nutritionist' ? exampleNutritionistData : examplePatientData
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* En-tête de démonstration */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Système de Suivi de Complétude du Profil
              </h1>
              <p className='text-gray-600 mt-1'>
                Démonstration des fonctionnalités de suivi et guidance
              </p>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='text-sm text-gray-600'>
                Rôle actuel:{' '}
                <strong>
                  {userRole === 'nutritionist' ? 'Nutritionniste' : 'Patient'}
                </strong>
              </div>
              <button
                onClick={switchRole}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors'
              >
                Changer de rôle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <ProfileCompletionDashboard
          profileData={profileData}
          role={userRole}
          onEditProfile={handleEditProfile}
          onEditField={handleEditField}
          onSavePrivacySettings={handleSavePrivacySettings}
        />
      </div>

      {/* Section d'informations */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Fonctionnalités implémentées
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className='space-y-2'>
              <h3 className='font-medium text-gray-900'>
                Calcul de complétude
              </h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• Algorithme pondéré par importance</li>
                <li>• Calcul par catégorie</li>
                <li>• Niveaux de complétude</li>
                <li>• Recommandations personnalisées</li>
              </ul>
            </div>

            <div className='space-y-2'>
              <h3 className='font-medium text-gray-900'>
                Interface utilisateur
              </h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• Progression circulaire animée</li>
                <li>• Détail par catégorie</li>
                <li>• Guide d'onboarding interactif</li>
                <li>• Paramètres de confidentialité</li>
              </ul>
            </div>

            <div className='space-y-2'>
              <h3 className='font-medium text-gray-900'>Optimisations</h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• TanStack Query pour le cache</li>
                <li>• Hooks personnalisés réutilisables</li>
                <li>• Validation Zod intégrée</li>
                <li>• TypeScript complet</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
