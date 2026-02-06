/**
 * Layout pour les pages onboarding
 * Force le rendu dynamique pour toutes les pages onboarding qui utilisent useAuth
 */

// Force dynamic rendering pour tout le dossier onboarding
export const dynamic = 'force-dynamic';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
