/**
 * Layout pour la page access-denied
 * Force le rendu dynamique
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AccessDeniedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
