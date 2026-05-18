'use client';

import {
  AuthEditorialPane,
  AuthSplitLayout,
  ForgotPasswordForm,
} from '@/components/auth';

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      editorial={
        <AuthEditorialPane namespace='Auth.ForgotPassword' variant='reset' />
      }
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}
