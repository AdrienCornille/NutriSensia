/**
 * Page d'administration pour la démonstration des tests A/B
 *
 * Cette page permet de tester et visualiser le système A/B Testing
 * en mode développement.
 * PROTECTION : Accessible uniquement aux administrateurs
 */

import { Metadata } from 'next';
import ABTestingDemoClient from './ABTestingDemoClient';

// Force dynamic rendering - cette page utilise useAuth qui nécessite AuthProvider
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Démonstration A/B Testing - NutriSensia Admin',
  description:
    'Interface de test et démonstration du système A/B Testing pour les administrateurs',
  robots: 'noindex, nofollow', // Empêcher l'indexation en production
};

export default function ABTestingDemoPage() {
  return <ABTestingDemoClient />;
}
