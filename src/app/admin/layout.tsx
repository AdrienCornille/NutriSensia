/**
 * Layout pour les pages admin
 * Force le rendu dynamique pour toutes les pages admin qui utilisent useAuth
 */

// Force dynamic rendering pour tout le dossier admin
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
