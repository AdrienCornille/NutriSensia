'use client';

import {
  AuthEditorialPane,
  AuthSplitLayout,
  SignupForm,
} from '@/components/auth';

export default function SignupPage() {
  return (
    <AuthSplitLayout editorial={<AuthEditorialPane namespace='Auth.Signup' />}>
      <SignupForm redirectTo='/auth/confirm' />
    </AuthSplitLayout>
  );
}
