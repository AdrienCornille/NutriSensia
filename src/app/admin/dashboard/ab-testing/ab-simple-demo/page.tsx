/**
 * Page d'administration pour la démonstration simplifiée des tests A/B
 *
 * Cette page utilise un composant simplifié pour tester
 * les fonctionnalités de base sans dépendances complexes.
 * PROTECTION : Accessible uniquement aux administrateurs
 */

import { Metadata } from 'next';
import SimpleABDemoClient from './SimpleABDemoClient';

export const metadata: Metadata = {
  title: 'Démonstration A/B Testing Simple - NutriSensia Admin',
  description:
    'Interface de test simplifiée du système A/B Testing pour les administrateurs',
  robots: 'noindex, nofollow',
};

export default function SimpleABDemoPage() {
  return <SimpleABDemoClient />;
}
