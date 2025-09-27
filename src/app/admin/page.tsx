/**
 * Page d'index pour la section admin
 * 
 * Redirige automatiquement vers le dashboard admin
 */

import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  // Rediriger vers le dashboard admin
  redirect('/admin/dashboard');
}
