/**
 * Dashboard principal pour les administrateurs
 * 
 * Cette page centralise l'accès à toutes les fonctionnalités admin
 * PROTECTION : Accessible uniquement aux administrateurs
 */

import { Metadata } from 'next';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard Administrateur - NutriSensia',
  description: 'Tableau de bord principal pour les administrateurs de NutriSensia',
  robots: 'noindex, nofollow',
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
