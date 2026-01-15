'use client';

import { AuthSplitLayout, LoginForm } from '@/components/auth';

/**
 * Page de connexion NutriSensia
 * Layout split : 1/4 formulaire + 3/4 image
 */
export default function LoginPage() {
  return (
    <AuthSplitLayout
      imageSrc='/images/hero-healthy-plate.jpg'
      imageAlt='Assiette saine et équilibrée - NutriSensia'
    >
      <LoginForm redirectTo='/dashboard' />
    </AuthSplitLayout>
  );
}
