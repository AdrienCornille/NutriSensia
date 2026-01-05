// Composants de formulaires d'authentification
export {
  SignUpForm,
  SignInForm,
  ResetPasswordForm,
  UpdatePasswordForm,
} from './AuthForms';

// Nouveau formulaire de connexion avec layout split
export { LoginForm } from './LoginForm';

// Formulaire de réinitialisation de mot de passe
export { ForgotPasswordForm } from './ForgotPasswordForm';

// Layout d'authentification split screen
export { AuthSplitLayout } from './AuthSplitLayout';

// Composants OAuth
export {
  GoogleOAuthButton,
  GitHubOAuthButton,
  AuthDivider,
  AuthNavigation,
} from './OAuthButtons';

// Composants de validation
export {
  PasswordStrengthIndicator,
  usePasswordValidation,
} from './PasswordStrengthIndicator';

// Composants d'authentification à deux facteurs (2FA)
export { MFAEnrollment } from './MFAEnrollment';

export { MFAVerification } from './MFAVerification';

export { MFAManagement } from './MFAManagement';

export { AuthCallback } from './AuthCallback';

export { MFASignInForm } from './MFASignInForm';

export { AuthGuard } from './AuthGuard';

export { MFAProtection } from './MFAProtection';
