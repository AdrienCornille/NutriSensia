/**
 * Page du tableau de bord de sécurité pour les administrateurs
 * Route protégée - accès admin uniquement
 */

import { Metadata } from 'next';
import SecurityDashboard from '@/components/security/SecurityDashboard';

// Force dynamic rendering - cette page utilise useAuth qui nécessite AuthProvider
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tableau de bord sécurité | NutriSensia Admin',
  description: 'Monitoring et alertes de sécurité en temps réel',
  robots: 'noindex, nofollow', // Ne pas indexer les pages admin
};

export default function SecurityPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <SecurityDashboard />
    </div>
  );
}
