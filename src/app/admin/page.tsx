/**
 * Page d'index pour la section admin
 *
 * Redirige automatiquement vers le dashboard admin
 */

import { redirect } from 'next/navigation';

// Force dynamic rendering - cette page utilise useAuth qui nécessite AuthProvider
export const dynamic = 'force-dynamic';

export default function AdminIndexPage() {
  // Rediriger vers le dashboard admin
  redirect('/admin/dashboard');
}
