'use client';

import {
  AuthSplitLayout,
  CompleteProfileForm,
  AuthGuard,
} from '@/components/auth';

/**
 * Page de complétion du profil pour les utilisateurs OAuth
 * Affichée après une inscription Google pour collecter la raison de consultation
 * Layout split : 1/4 formulaire + 3/4 image
 */
export default function CompleteProfilePage() {
  return (
    <AuthGuard>
      <AuthSplitLayout
        imageSrc='/images/hero-healthy-plate.jpg'
        imageAlt='Assiette saine et équilibrée - NutriSensia'
      >
        <CompleteProfileForm />
      </AuthSplitLayout>
    </AuthGuard>
  );
}
