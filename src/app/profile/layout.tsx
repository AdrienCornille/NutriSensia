/**
 * Layout pour les pages de profil
 * Force le rendu dynamique pour les pages qui utilisent QueryClient/AuthContext
 */

// Force dynamic rendering pour tout le dossier profile
export const dynamic = 'force-dynamic';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
