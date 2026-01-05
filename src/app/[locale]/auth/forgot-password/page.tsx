'use client';

import { AuthSplitLayout, ForgotPasswordForm } from '@/components/auth';

/**
 * Page de réinitialisation de mot de passe NutriSensia
 * Layout split : 1/4 formulaire + 3/4 image (salade)
 */
export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      imageSrc='/images/hero-salad.jpg'
      imageAlt='Salade fraîche et colorée - NutriSensia'
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}
