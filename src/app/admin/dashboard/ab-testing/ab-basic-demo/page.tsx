/**
 * Page d'administration pour la démonstration basique des tests A/B
 * 
 * Version ultra-simplifiée sans dépendances complexes
 * PROTECTION : Accessible uniquement aux administrateurs
 */

import { Metadata } from 'next';
import BasicABDemoClient from './BasicABDemoClient';

export const metadata: Metadata = {
  title: 'Démonstration A/B Testing Basique - NutriSensia Admin',
  description: 'Interface de test basique du système A/B Testing pour les administrateurs',
  robots: 'noindex, nofollow',
};

export default function BasicABDemoPage() {
  return <BasicABDemoClient />;
}