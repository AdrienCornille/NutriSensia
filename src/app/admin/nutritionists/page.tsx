/**
 * Page admin de gestion des nutritionnistes
 *
 * Permet de voir, filtrer et valider les demandes d'inscription
 * PROTECTION : Accessible uniquement aux administrateurs
 *
 * @see AUTH-010 dans USER_STORIES.md
 */

import { Metadata } from 'next';
import NutritionistsClient from './NutritionistsClient';

// Force dynamic rendering - cette page utilise useAuth qui nécessite AuthProvider
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gestion des Nutritionnistes - Admin NutriSensia',
  description:
    "Validez et gérez les demandes d'inscription des nutritionnistes",
  robots: 'noindex, nofollow',
};

export default function AdminNutritionistsPage() {
  return <NutritionistsClient />;
}
