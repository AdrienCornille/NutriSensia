// Composants de formulaires d'authentification
export {
  SignUpForm,
  SignInForm,
  ResetPasswordForm,
  UpdatePasswordForm,
} from './AuthForms';

// Nouveau formulaire de connexion avec layout split
export { LoginForm } from './LoginForm';

// Nouveau formulaire d'inscription avec layout split
export { SignupForm } from './SignupForm';

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

// Composants d'authentification
export { AuthCallback } from './AuthCallback';

export { AuthGuard } from './AuthGuard';
