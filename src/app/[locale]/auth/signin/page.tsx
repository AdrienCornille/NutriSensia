'use client';

import {
  AuthEditorialPane,
  AuthSplitLayout,
  LoginForm,
} from '@/components/auth';

export default function LoginPage() {
  return (
    <AuthSplitLayout editorial={<AuthEditorialPane namespace='Auth.Login' />}>
      <LoginForm redirectTo='/dashboard' />
    </AuthSplitLayout>
  );
}
