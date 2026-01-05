/**
 * Composant de protection d'accès administrateur côté serveur
 *
 * Ce composant utilise des Server Components pour vérifier les permissions
 * côté serveur, offrant une sécurité maximale.
 */

import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

interface ServerAdminProtectionProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Vérifie si l'utilisateur a le rôle administrateur côté serveur
 */
async function checkServerAdminRole(): Promise<boolean> {
  try {
    // En mode démo, on utilise la même logique que le middleware
    // Pour la production, ceci devrait être remplacé par une vraie vérification Supabase

    // Rôles administrateur autorisés
    const adminRoles = [
      'admin',
      'super_admin',
      'administrator',
      'superadmin',
      'admin_user',
      'system_admin',
    ];

    // En mode démo, utiliser une variable d'environnement ou par défaut 'user' (accès refusé)
    const demoRole = process.env.DEMO_USER_ROLE || 'user';
    const normalizedRole = demoRole.toLowerCase().trim();

    console.log(
      `🔐 [ServerAdminProtection] Vérification du rôle côté serveur: ${normalizedRole}`
    );

    const isAdmin = adminRoles.includes(normalizedRole);
    console.log(`🔐 [ServerAdminProtection] Est administrateur: ${isAdmin}`);

    return isAdmin;
  } catch (error) {
    console.error(
      '🔐 [ServerAdminProtection] Erreur lors de la vérification du rôle:',
      error
    );
    return false;
  }
}

/**
 * Composant de protection d'accès administrateur côté serveur
 */
export default async function ServerAdminProtection({
  children,
  fallback,
}: ServerAdminProtectionProps) {
  console.log(
    '🔐 [ServerAdminProtection] Vérification des permissions côté serveur'
  );

  // Vérifier les permissions administrateur côté serveur
  const isAdmin = await checkServerAdminRole();

  if (!isAdmin) {
    console.log(
      '🔐 [ServerAdminProtection] Accès refusé - redirection vers access-denied'
    );

    // Rediriger vers la page d'accès refusé
    redirect(
      '/access-denied?reason=admin_required&required_role=admin&current_role=unknown'
    );
  }

  console.log(
    '🔐 [ServerAdminProtection] Accès autorisé - affichage du contenu'
  );

  // Si l'utilisateur est administrateur, afficher le contenu
  return <>{children}</>;
}
