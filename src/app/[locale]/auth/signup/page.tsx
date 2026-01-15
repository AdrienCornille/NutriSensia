'use client';

import { AuthSplitLayout, SignupForm } from '@/components/auth';

/**
 * Page d'inscription NutriSensia
 * Layout split : 1/4 formulaire + 3/4 image
 */
export default function SignupPage() {
  return (
    <AuthSplitLayout
      imageSrc='/images/hero-healthy-plate.jpg'
      imageAlt='Assiette saine et équilibrée - NutriSensia'
    >
      <SignupForm redirectTo='/auth/confirm' />
    </AuthSplitLayout>
  );
}
