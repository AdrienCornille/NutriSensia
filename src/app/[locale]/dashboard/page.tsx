'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  UtensilsCrossed,
  TrendingUp,
  FolderOpen,
  Calendar,
  ChefHat,
  Apple,
  MessageSquare,
  Star,
  Bell,
  Droplets,
  Flame,
  Target,
  ArrowRight,
  Check,
  AlertCircle,
  CheckCircle2,
  Settings,
  Plus,
  Minus,
  Clock,
  X,
} from 'lucide-react';

/**
 * Page Dashboard utilisateur - Nouveau design avec sidebar
 *
 * DASH-001: Vue d'ensemble quotidienne
 * - Affichage calories consommées vs objectif
 * - Barres de progression pour protéines, glucides, lipides
 * - Indicateur visuel clair (vert/orange/rouge)
 * - Données mises à jour en temps réel
 *
 * DASH-002: Tracker d'hydratation
 * - Affichage visuel (jauge circulaire)
 * - Boutons d'ajout rapide (plusieurs quantités)
 * - Objectif personnalisable
 * - Historique des ajouts de la journée
 */

// ==================== TYPES ====================

// DASH-002: Type pour les entrées d'hydratation
interface WaterLogEntry {
  id: string;
  amount: number; // en ml
  timestamp: Date;
}

// DASH-002: Type pour les données d'hydratation
interface HydrationData {
  current: number; // en L
  target: number; // en L
  logs: WaterLogEntry[];
}

// DASH-003: Type pour les repas
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealEntry {
  id: string;
  type: MealType;
  label: string;
  icon: string;
  logged: boolean;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  time: string | null;
  description?: string;
}

// Type pour les données nutritionnelles
interface NutritionData {
  current: number;
  target: number;
  unit: string;
}

interface DailyNutrition {
  calories: NutritionData;
  proteins: NutritionData;
  carbs: NutritionData;
  fats: NutritionData;
  water: NutritionData;
  lastUpdated: Date;
}

// Type pour le statut de progression
type ProgressStatus = 'excellent' | 'good' | 'warning' | 'danger';

// DASH-004: Types pour la progression hebdomadaire
interface WeightEntry {
  date: Date;
  weight: number; // en kg
}

interface WeeklyComparison {
  label: string;
  currentWeek: number;
  previousWeek: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  isPositive: boolean; // true = la tendance est bonne pour cet indicateur
}

interface WeeklyProgress {
  streak: number; // jours consécutifs d'enregistrement
  weightHistory: WeightEntry[]; // 7 derniers jours de poids
  currentWeight: number;
  weightChange: number; // changement ce mois
  planAdherence: number; // pourcentage d'adhérence au plan
  comparisons: WeeklyComparison[];
}

// DASH-005: Types pour les rendez-vous
type AppointmentType = 'initial' | 'follow-up' | 'nutrition-plan' | 'check-in';
type AppointmentMode = 'visio' | 'cabinet' | 'phone';

interface Appointment {
  id: string;
  date: Date;
  endDate: Date;
  type: AppointmentType;
  mode: AppointmentMode;
  nutritionistName: string;
  nutritionistInitials: string;
  notes?: string;
}

interface NextAppointmentData {
  appointment: Appointment | null;
  hasUpcoming: boolean;
}

// DASH-006: Types pour les messages
interface Message {
  id: string;
  senderName: string;
  senderInitials: string;
  senderRole: 'nutritionist' | 'system';
  subject?: string;
  preview: string;
  isRead: boolean;
  timestamp: Date;
  isImportant?: boolean;
}

interface MessagesData {
  messages: Message[];
  unreadCount: number;
  hasNewMessages: boolean;
}

// DASH-007: Types pour les objectifs hebdomadaires
type ObjectiveCategory = 'nutrition' | 'hydration' | 'activity' | 'recipes' | 'tracking' | 'custom';

interface WeeklyObjective {
  id: string;
  label: string;
  description?: string;
  category: ObjectiveCategory;
  progress: number; // 0-100
  target: number;
  current: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  definedBy: {
    name: string;
    initials: string;
    role: 'nutritionist' | 'system' | 'user';
  };
}

interface WeeklyObjectivesData {
  objectives: WeeklyObjective[];
  weekStart: Date;
  weekEnd: Date;
  completedCount: number;
  totalCount: number;
}

// ==================== HELPERS ====================

/**
 * Détermine le statut de progression basé sur le pourcentage
 * - excellent: 90-100% (vert foncé)
 * - good: 70-89% (vert)
 * - warning: 50-69% (orange)
 * - danger: <50% ou >110% (rouge)
 */
function getProgressStatus(current: number, target: number): ProgressStatus {
  const percentage = (current / target) * 100;

  if (percentage > 110) return 'danger'; // Dépassement
  if (percentage >= 90) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'warning';
  return 'danger';
}

/**
 * Retourne les classes CSS basées sur le statut
 */
function getStatusColors(status: ProgressStatus) {
  switch (status) {
    case 'excellent':
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-600',
        bgLight: 'bg-emerald-50',
        border: 'border-emerald-200',
      };
    case 'good':
      return {
        bg: 'bg-[#1B998B]',
        text: 'text-[#1B998B]',
        bgLight: 'bg-[#1B998B]/10',
        border: 'border-[#1B998B]/30',
      };
    case 'warning':
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-600',
        bgLight: 'bg-amber-50',
        border: 'border-amber-200',
      };
    case 'danger':
      return {
        bg: 'bg-red-500',
        text: 'text-red-600',
        bgLight: 'bg-red-50',
        border: 'border-red-200',
      };
  }
}

/**
 * Retourne le label de statut
 */
function getStatusLabel(status: ProgressStatus): string {
  switch (status) {
    case 'excellent': return 'Excellent';
    case 'good': return 'En bonne voie';
    case 'warning': return 'Attention';
    case 'danger': return 'À améliorer';
  }
}

/**
 * Calcule le pourcentage de progression
 */
function getPercentage(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100);
}

/**
 * Formate un nombre avec séparateur de milliers
 */
function formatNumber(num: number): string {
  return num.toLocaleString('fr-CH');
}

/**
 * DASH-004: Génère un path SVG sparkline pour les données de poids
 * Optimisé pour maximiser l'amplitude visuelle même avec de petites variations
 * @param data - Tableau de valeurs de poids
 * @param width - Largeur du SVG
 * @param height - Hauteur du SVG
 * @param paddingY - Padding vertical en pixels (défaut: 8)
 * @returns Le path SVG sous forme de string
 */
function generateSparklinePath(
  data: number[],
  width: number,
  height: number,
  paddingY: number = 8
): string {
  if (data.length < 2) return '';

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.1; // Petite valeur par défaut pour éviter division par zéro

  const paddingX = 8;
  const effectiveHeight = height - paddingY * 2;
  const effectiveWidth = width - paddingX * 2;

  // Calculer les points avec une meilleure utilisation de l'espace vertical
  const points = data.map((value, index) => {
    const x = paddingX + (index / (data.length - 1)) * effectiveWidth;
    // Normaliser la valeur entre 0 et 1, puis mapper sur la hauteur disponible
    const normalizedY = (max - value) / range;
    const y = paddingY + normalizedY * effectiveHeight;
    return { x, y };
  });

  // Créer le path avec des courbes de Bézier cubiques pour un effet plus lisse
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    // Points de contrôle pour une courbe plus douce
    const cp1x = prev.x + (curr.x - prev.x) * 0.5;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) * 0.5;
    const cp2y = curr.y;
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
  }

  return path;
}

/**
 * DASH-004: Génère le path pour l'aire sous la courbe (pour le gradient)
 */
function generateSparklineAreaPath(
  data: number[],
  width: number,
  height: number,
  paddingY: number = 8
): string {
  const linePath = generateSparklinePath(data, width, height, paddingY);
  if (!linePath) return '';

  const paddingX = 8;
  const effectiveWidth = width - paddingX * 2;

  // Fermer le path pour créer une aire
  const lastX = paddingX + effectiveWidth;
  const firstX = paddingX;

  return `${linePath} L ${lastX.toFixed(2)} ${height} L ${firstX.toFixed(2)} ${height} Z`;
}

/**
 * DASH-004: Calcule le delta et le format pour l'affichage
 */
function formatDelta(current: number, previous: number, unit: string): string {
  const delta = current - previous;
  const sign = delta >= 0 ? '+' : '';

  if (unit === 'L') {
    return `${sign}${delta.toFixed(1)}${unit}`;
  }

  return `${sign}${Math.round(delta)}${unit ? ' ' + unit : ''}`;
}

/**
 * DASH-005: Calcule le nombre de jours jusqu'à une date
 */
function getDaysUntil(date: Date): number {
  const now = new Date();
  const target = new Date(date);
  // Réinitialiser les heures pour comparer uniquement les jours
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * DASH-005: Formate le compte à rebours en texte lisible
 */
function formatCountdown(date: Date): string {
  const days = getDaysUntil(date);

  if (days < 0) return 'Passé';
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';
  if (days < 7) return `Dans ${days} jours`;
  if (days < 14) return 'La semaine prochaine';
  return `Dans ${Math.ceil(days / 7)} semaines`;
}

/**
 * DASH-005: Retourne le label du type de rendez-vous
 */
function getAppointmentTypeLabel(type: AppointmentType): string {
  switch (type) {
    case 'initial': return 'Consultation initiale';
    case 'follow-up': return 'Consultation de suivi';
    case 'nutrition-plan': return 'Révision du plan';
    case 'check-in': return 'Point rapide';
  }
}

/**
 * DASH-005: Retourne le label et la couleur du mode de RDV
 */
function getAppointmentModeInfo(mode: AppointmentMode): { label: string; color: string; icon: string } {
  switch (mode) {
    case 'visio':
      return { label: 'En visio', color: 'text-blue-600 bg-blue-50', icon: '📹' };
    case 'cabinet':
      return { label: 'Au cabinet', color: 'text-purple-600 bg-purple-50', icon: '🏥' };
    case 'phone':
      return { label: 'Par téléphone', color: 'text-amber-600 bg-amber-50', icon: '📞' };
  }
}

/**
 * DASH-006: Formate le timestamp en temps relatif
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/**
 * DASH-007: Calcule le temps restant jusqu'à une date limite
 */
function getTimeRemaining(endDate: Date): { days: number; hours: number; text: string; isUrgent: boolean } {
  const now = new Date();
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Fin de journée

  const diffMs = end.getTime() - now.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let text = '';
  let isUrgent = false;

  if (diffMs <= 0) {
    text = 'Terminé';
  } else if (days === 0) {
    text = hours <= 1 ? 'Dernière heure !' : `${hours}h restantes`;
    isUrgent = true;
  } else if (days === 1) {
    text = 'Demain';
    isUrgent = true;
  } else if (days < 3) {
    text = `${days}j restants`;
    isUrgent = true;
  } else {
    text = `${days}j restants`;
  }

  return { days, hours, text, isUrgent };
}

/**
 * DASH-007: Retourne l'icône et les couleurs pour une catégorie d'objectif
 */
function getObjectiveCategoryInfo(category: ObjectiveCategory): {
  icon: string;
  bgColor: string;
  textColor: string;
  label: string;
} {
  switch (category) {
    case 'nutrition':
      return { icon: '🍎', bgColor: 'bg-green-100', textColor: 'text-green-600', label: 'Nutrition' };
    case 'hydration':
      return { icon: '💧', bgColor: 'bg-blue-100', textColor: 'text-blue-600', label: 'Hydratation' };
    case 'activity':
      return { icon: '🏃', bgColor: 'bg-orange-100', textColor: 'text-orange-600', label: 'Activité' };
    case 'recipes':
      return { icon: '👨‍🍳', bgColor: 'bg-purple-100', textColor: 'text-purple-600', label: 'Recettes' };
    case 'tracking':
      return { icon: '📊', bgColor: 'bg-indigo-100', textColor: 'text-indigo-600', label: 'Suivi' };
    case 'custom':
    default:
      return { icon: '🎯', bgColor: 'bg-gray-100', textColor: 'text-gray-600', label: 'Personnalisé' };
  }
}



// ==================== MOCK DATA ====================
// Ces données seront remplacées par des appels API en temps réel

// Données nutritionnelles du jour (simulées)
const mockDailyNutrition: DailyNutrition = {
  calories: { current: 1420, target: 2100, unit: 'kcal' },
  proteins: { current: 86, target: 120, unit: 'g' },
  carbs: { current: 162, target: 250, unit: 'g' },
  fats: { current: 41, target: 70, unit: 'g' },
  water: { current: 1.4, target: 2, unit: 'L' },
  lastUpdated: new Date(),
};

// DASH-002: Données d'hydratation mockées avec historique
const mockHydrationData: HydrationData = {
  current: 1.4,
  target: 2,
  logs: [
    { id: '1', amount: 250, timestamp: new Date(new Date().setHours(7, 30)) },
    { id: '2', amount: 500, timestamp: new Date(new Date().setHours(9, 15)) },
    { id: '3', amount: 250, timestamp: new Date(new Date().setHours(11, 0)) },
    { id: '4', amount: 400, timestamp: new Date(new Date().setHours(13, 45)) },
  ],
};

// DASH-002: Options de quantités d'eau prédéfinies
const waterAmountOptions = [
  { amount: 150, label: '150ml', icon: '🥤' },
  { amount: 250, label: '250ml', icon: '🥛' },
  { amount: 500, label: '500ml', icon: '🍶' },
];

// DASH-003: Données mockées pour les repas avec plus de détails
const mockMeals: MealEntry[] = [
  {
    id: '1',
    type: 'breakfast',
    label: 'Petit-déjeuner',
    icon: '🌅',
    logged: true,
    calories: 450,
    proteins: 22,
    carbs: 58,
    fats: 15,
    time: '08:30',
    description: 'Porridge aux fruits, café',
  },
  {
    id: '2',
    type: 'lunch',
    label: 'Déjeuner',
    icon: '☀️',
    logged: true,
    calories: 680,
    proteins: 42,
    carbs: 65,
    fats: 28,
    time: '12:45',
    description: 'Poulet grillé, riz, légumes',
  },
  {
    id: '3',
    type: 'dinner',
    label: 'Dîner',
    icon: '🌙',
    logged: false,
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0,
    time: null,
  },
  {
    id: '4',
    type: 'snack',
    label: 'Collation',
    icon: '🍎',
    logged: false,
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0,
    time: null,
  },
];

// DASH-003: Options rapides pour l'enregistrement de repas
const quickMealOptions = [
  { label: 'Scanner code-barres', icon: '📷', action: 'scan' },
  { label: 'Rechercher aliment', icon: '🔍', action: 'search' },
  { label: 'Repas favoris', icon: '⭐', action: 'favorites' },
  { label: 'Repas récents', icon: '🕒', action: 'recent' },
];

// DASH-004: Données mockées pour la progression hebdomadaire
const mockWeeklyProgress: WeeklyProgress = {
  streak: 12,
  weightHistory: [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), weight: 72.8 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), weight: 72.6 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), weight: 72.5 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), weight: 72.4 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), weight: 72.2 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), weight: 72.3 },
    { date: new Date(), weight: 72.0 },
  ],
  currentWeight: 72.0,
  weightChange: -1.2,
  planAdherence: 85,
  comparisons: [
    {
      label: 'Calories moyennes',
      currentWeek: 1850,
      previousWeek: 1920,
      unit: 'kcal',
      trend: 'down',
      isPositive: true, // moins de calories = positif pour perte de poids
    },
    {
      label: 'Protéines moyennes',
      currentWeek: 95,
      previousWeek: 88,
      unit: 'g',
      trend: 'up',
      isPositive: true, // plus de protéines = positif
    },
    {
      label: 'Hydratation moyenne',
      currentWeek: 1.8,
      previousWeek: 1.5,
      unit: 'L',
      trend: 'up',
      isPositive: true, // plus d'eau = positif
    },
    {
      label: 'Repas enregistrés',
      currentWeek: 24,
      previousWeek: 21,
      unit: '',
      trend: 'up',
      isPositive: true, // plus d'enregistrements = positif
    },
  ],
};

// DASH-007: Données mockées pour les objectifs hebdomadaires
const getWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Lundi
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche
  endOfWeek.setHours(23, 59, 59, 999);
  return { startOfWeek, endOfWeek };
};

const { startOfWeek, endOfWeek } = getWeekDates();

const mockWeeklyObjectivesData: WeeklyObjectivesData = {
  weekStart: startOfWeek,
  weekEnd: endOfWeek,
  completedCount: 1,
  totalCount: 4,
  objectives: [
    {
      id: 'obj-001',
      label: 'Enregistrer tous les repas',
      description: 'Notez chaque repas pour un suivi précis',
      category: 'tracking',
      progress: 85,
      target: 28, // 4 repas x 7 jours
      current: 24,
      unit: 'repas',
      startDate: startOfWeek,
      endDate: endOfWeek,
      isCompleted: false,
      definedBy: {
        name: 'Lucie Martin',
        initials: 'LM',
        role: 'nutritionist',
      },
    },
    {
      id: 'obj-002',
      label: "Atteindre 2L d'eau/jour",
      description: 'Hydratation quotidienne optimale',
      category: 'hydration',
      progress: 100,
      target: 14, // 2L x 7 jours
      current: 14,
      unit: 'L',
      startDate: startOfWeek,
      endDate: endOfWeek,
      isCompleted: true,
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hier
      definedBy: {
        name: 'Lucie Martin',
        initials: 'LM',
        role: 'nutritionist',
      },
    },
    {
      id: 'obj-003',
      label: "3 séances d'activité",
      description: 'Maintenir une activité physique régulière',
      category: 'activity',
      progress: 66,
      target: 3,
      current: 2,
      unit: 'séances',
      startDate: startOfWeek,
      endDate: endOfWeek,
      isCompleted: false,
      definedBy: {
        name: 'Lucie Martin',
        initials: 'LM',
        role: 'nutritionist',
      },
    },
    {
      id: 'obj-004',
      label: 'Essayer 2 nouvelles recettes',
      description: 'Diversifier votre alimentation',
      category: 'recipes',
      progress: 50,
      target: 2,
      current: 1,
      unit: 'recettes',
      startDate: startOfWeek,
      endDate: endOfWeek,
      isCompleted: false,
      definedBy: {
        name: 'NutriSensia',
        initials: 'NS',
        role: 'system',
      },
    },
  ],
};

// DASH-005: Données mockées pour le prochain rendez-vous
// Pour tester différents scénarios, modifier hasUpcoming à false
const mockNextAppointment: NextAppointmentData = {
  hasUpcoming: true,
  appointment: {
    id: 'rdv-001',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Dans 6 jours
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // +45 min
    type: 'follow-up',
    mode: 'visio',
    nutritionistName: 'Lucie Martin',
    nutritionistInitials: 'LM',
    notes: 'Discussion sur les objectifs du mois',
  },
};

// Alternative: pas de RDV planifié (pour tester)
// const mockNextAppointment: NextAppointmentData = {
//   hasUpcoming: false,
//   appointment: null,
// };

// DASH-006: Données mockées pour les messages
const mockMessagesData: MessagesData = {
  unreadCount: 3,
  hasNewMessages: true,
  messages: [
    {
      id: 'msg-001',
      senderName: 'Lucie Martin',
      senderInitials: 'LM',
      senderRole: 'nutritionist',
      subject: 'Ajustement de votre plan',
      preview: "J'ai ajusté votre plan pour la semaine prochaine avec plus de protéines le matin...",
      isRead: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
      isImportant: true,
    },
    {
      id: 'msg-002',
      senderName: 'Lucie Martin',
      senderInitials: 'LM',
      senderRole: 'nutritionist',
      preview: "N'oubliez pas de noter votre poids ce week-end pour le suivi !",
      isRead: false,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // Il y a 5h
    },
    {
      id: 'msg-003',
      senderName: 'NutriSensia',
      senderInitials: 'NS',
      senderRole: 'system',
      subject: 'Rappel de rendez-vous',
      preview: 'Votre prochain rendez-vous est dans 6 jours. Préparez vos questions !',
      isRead: false,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hier
    },
    {
      id: 'msg-004',
      senderName: 'Lucie Martin',
      senderInitials: 'LM',
      senderRole: 'nutritionist',
      preview: 'Bravo pour votre régularité cette semaine !',
      isRead: true,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
    },
  ],
};

// Accès rapide
const quickAccess = [
  { icon: <ChefHat className="w-6 h-6" />, label: 'Recettes', desc: '124 recettes', color: 'bg-orange-50 text-orange-600' },
  { icon: <Apple className="w-6 h-6" />, label: 'Base aliments', desc: 'Rechercher', color: 'bg-green-50 text-green-600' },
  { icon: <Star className="w-6 h-6" />, label: 'Contenu exclusif', desc: '3 nouveaux', color: 'bg-purple-50 text-purple-600' },
  { icon: <FolderOpen className="w-6 h-6" />, label: 'Mon dossier', desc: 'Anamnèse, objectifs', color: 'bg-blue-50 text-blue-600' },
];

function DashboardContent() {
  const { user } = useAuth();

  // DASH-006: État pour les messages (sera remplacé par un hook de fetch temps réel)
  const [messagesData, setMessagesData] = useState<MessagesData>(mockMessagesData);

  // État des données nutritionnelles (sera remplacé par un hook de fetch)
  // TODO: Remplacer par useQuery ou useSWR pour les mises à jour temps réel
  const [nutrition, setNutrition] = useState<DailyNutrition>(mockDailyNutrition);

  // DASH-002: État pour l'hydratation
  const [hydration, setHydration] = useState<HydrationData>(mockHydrationData);
  const [showWaterSettings, setShowWaterSettings] = useState(false);
  const [tempWaterTarget, setTempWaterTarget] = useState(mockHydrationData.target);

  // DASH-002: Ajouter de l'eau
  const addWater = (amountMl: number) => {
    const newEntry: WaterLogEntry = {
      id: Date.now().toString(),
      amount: amountMl,
      timestamp: new Date(),
    };

    setHydration(prev => ({
      ...prev,
      current: Math.round((prev.current + amountMl / 1000) * 100) / 100,
      logs: [...prev.logs, newEntry],
    }));

    // Mettre à jour aussi nutrition.water pour la cohérence
    setNutrition(prev => ({
      ...prev,
      water: {
        ...prev.water,
        current: Math.round((prev.water.current + amountMl / 1000) * 100) / 100,
      },
      lastUpdated: new Date(),
    }));
  };

  // DASH-002: Supprimer une entrée d'eau
  const removeWaterEntry = (entryId: string) => {
    const entry = hydration.logs.find(log => log.id === entryId);
    if (!entry) return;

    setHydration(prev => ({
      ...prev,
      current: Math.max(0, Math.round((prev.current - entry.amount / 1000) * 100) / 100),
      logs: prev.logs.filter(log => log.id !== entryId),
    }));

    setNutrition(prev => ({
      ...prev,
      water: {
        ...prev.water,
        current: Math.max(0, Math.round((prev.water.current - entry.amount / 1000) * 100) / 100),
      },
      lastUpdated: new Date(),
    }));
  };

  // DASH-002: Sauvegarder le nouvel objectif d'hydratation
  const saveWaterTarget = () => {
    setHydration(prev => ({
      ...prev,
      target: tempWaterTarget,
    }));
    setNutrition(prev => ({
      ...prev,
      water: {
        ...prev.water,
        target: tempWaterTarget,
      },
    }));
    setShowWaterSettings(false);
  };

  // DASH-003: État pour les repas
  const [meals, setMeals] = useState<MealEntry[]>(mockMeals);
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealEntry | null>(null);

  // DASH-003: Ouvrir le modal d'enregistrement de repas
  const openMealModal = (meal: MealEntry) => {
    setSelectedMeal(meal);
    setShowMealModal(true);
  };

  // DASH-003: Fermer le modal
  const closeMealModal = () => {
    setShowMealModal(false);
    setSelectedMeal(null);
  };

  // DASH-003: Enregistrer un repas rapidement (simulation)
  const logMealQuickly = (mealId: string, quickOption: string) => {
    // Simuler l'enregistrement d'un repas
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Valeurs simulées basées sur l'option choisie
    const quickValues = {
      scan: { calories: 350, proteins: 15, carbs: 40, fats: 12 },
      search: { calories: 400, proteins: 20, carbs: 45, fats: 15 },
      favorites: { calories: 500, proteins: 25, carbs: 55, fats: 18 },
      recent: { calories: 450, proteins: 22, carbs: 50, fats: 16 },
    };

    const values = quickValues[quickOption as keyof typeof quickValues] || quickValues.search;

    setMeals(prev => prev.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          logged: true,
          calories: values.calories,
          proteins: values.proteins,
          carbs: values.carbs,
          fats: values.fats,
          time: timeString,
          description: `Repas enregistré via ${quickOption}`,
        };
      }
      return meal;
    }));

    // Mettre à jour les totaux nutritionnels
    setNutrition(prev => ({
      ...prev,
      calories: {
        ...prev.calories,
        current: prev.calories.current + values.calories,
      },
      proteins: {
        ...prev.proteins,
        current: prev.proteins.current + values.proteins,
      },
      carbs: {
        ...prev.carbs,
        current: prev.carbs.current + values.carbs,
      },
      fats: {
        ...prev.fats,
        current: prev.fats.current + values.fats,
      },
      lastUpdated: new Date(),
    }));

    closeMealModal();
  };

  // DASH-003: Supprimer/annuler un repas enregistré
  const removeMealLog = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal || !meal.logged) return;

    // Soustraire les valeurs nutritionnelles
    setNutrition(prev => ({
      ...prev,
      calories: {
        ...prev.calories,
        current: Math.max(0, prev.calories.current - meal.calories),
      },
      proteins: {
        ...prev.proteins,
        current: Math.max(0, prev.proteins.current - meal.proteins),
      },
      carbs: {
        ...prev.carbs,
        current: Math.max(0, prev.carbs.current - meal.carbs),
      },
      fats: {
        ...prev.fats,
        current: Math.max(0, prev.fats.current - meal.fats),
      },
      lastUpdated: new Date(),
    }));

    // Réinitialiser le repas
    setMeals(prev => prev.map(m => {
      if (m.id === mealId) {
        return {
          ...m,
          logged: false,
          calories: 0,
          proteins: 0,
          carbs: 0,
          fats: 0,
          time: null,
          description: undefined,
        };
      }
      return m;
    }));
  };

  // Extraire le prénom de l'utilisateur
  const firstName = user?.user_metadata?.first_name ||
                    user?.user_metadata?.full_name?.split(' ')[0] ||
                    'Jean';

  // Date formatée
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Bonjour {firstName} 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1 capitalize">{formattedDate}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Zone primaire - Aujourd'hui */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Aujourd'hui
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {/* Résumé calories/macros - DASH-001 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="col-span-2 bg-white rounded-xl p-6 border border-gray-200"
              >
                {/* Header avec statut global */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-800">Résumé nutritionnel</h3>
                    {(() => {
                      const caloriesStatus = getProgressStatus(nutrition.calories.current, nutrition.calories.target);
                      const colors = getStatusColors(caloriesStatus);
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.bgLight} ${colors.text}`}>
                          {caloriesStatus === 'excellent' || caloriesStatus === 'good' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {getStatusLabel(caloriesStatus)}
                        </span>
                      );
                    })()}
                  </div>
                  <span className="text-xs text-gray-400">
                    Mis à jour à {nutrition.lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Calories - Indicateur principal */}
                {(() => {
                  const status = getProgressStatus(nutrition.calories.current, nutrition.calories.target);
                  const colors = getStatusColors(status);
                  const percentage = getPercentage(nutrition.calories.current, nutrition.calories.target);
                  return (
                    <div className="mb-6">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Calories</span>
                          <span className={`text-xs font-semibold ${colors.text}`}>{percentage}%</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {formatNumber(nutrition.calories.current)} / {formatNumber(nutrition.calories.target)} {nutrition.calories.unit}
                        </span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-full ${colors.bg} rounded-full relative`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </motion.div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Il vous reste {formatNumber(nutrition.calories.target - nutrition.calories.current)} kcal pour atteindre votre objectif
                      </p>
                    </div>
                  );
                })()}

                {/* Macros avec indicateurs dynamiques */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Protéines */}
                  {(() => {
                    const status = getProgressStatus(nutrition.proteins.current, nutrition.proteins.target);
                    const colors = getStatusColors(status);
                    const percentage = getPercentage(nutrition.proteins.current, nutrition.proteins.target);
                    return (
                      <div className={`rounded-lg p-4 border ${colors.border} ${colors.bgLight}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-600">Protéines</span>
                          <span className={`text-xs font-semibold ${colors.text}`}>{percentage}%</span>
                        </div>
                        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className={`h-full ${colors.bg} rounded-full`}
                          />
                        </div>
                        <p className="text-sm font-medium mt-2 text-gray-800">
                          {nutrition.proteins.current} / {nutrition.proteins.target}{nutrition.proteins.unit}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Glucides */}
                  {(() => {
                    const status = getProgressStatus(nutrition.carbs.current, nutrition.carbs.target);
                    const colors = getStatusColors(status);
                    const percentage = getPercentage(nutrition.carbs.current, nutrition.carbs.target);
                    return (
                      <div className={`rounded-lg p-4 border ${colors.border} ${colors.bgLight}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-600">Glucides</span>
                          <span className={`text-xs font-semibold ${colors.text}`}>{percentage}%</span>
                        </div>
                        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className={`h-full ${colors.bg} rounded-full`}
                          />
                        </div>
                        <p className="text-sm font-medium mt-2 text-gray-800">
                          {nutrition.carbs.current} / {nutrition.carbs.target}{nutrition.carbs.unit}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Lipides */}
                  {(() => {
                    const status = getProgressStatus(nutrition.fats.current, nutrition.fats.target);
                    const colors = getStatusColors(status);
                    const percentage = getPercentage(nutrition.fats.current, nutrition.fats.target);
                    return (
                      <div className={`rounded-lg p-4 border ${colors.border} ${colors.bgLight}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-600">Lipides</span>
                          <span className={`text-xs font-semibold ${colors.text}`}>{percentage}%</span>
                        </div>
                        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className={`h-full ${colors.bg} rounded-full`}
                          />
                        </div>
                        <p className="text-sm font-medium mt-2 text-gray-800">
                          {nutrition.fats.current} / {nutrition.fats.target}{nutrition.fats.unit}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>

              {/* Hydratation - DASH-002 avec historique et objectif personnalisable */}
              {(() => {
                const waterStatus = getProgressStatus(hydration.current, hydration.target);
                const waterColors = getStatusColors(waterStatus);
                const waterPercentage = getPercentage(hydration.current, hydration.target);
                // Calcul du strokeDashoffset: 352 (circonférence) - (352 * percentage / 100)
                const strokeDashoffset = 352 - (352 * waterPercentage / 100);

                // Mapping des couleurs CSS pour le SVG
                const svgStrokeColor = waterStatus === 'excellent' ? '#10B981'
                  : waterStatus === 'good' ? '#1B998B'
                  : waterStatus === 'warning' ? '#F59E0B'
                  : '#EF4444';

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className={`bg-white rounded-xl p-6 border ${waterColors.border} flex flex-col`}
                  >
                    {/* Header avec bouton paramètres */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Hydratation</h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${waterColors.bgLight} ${waterColors.text}`}>
                          {waterPercentage}%
                        </span>
                        <button
                          onClick={() => {
                            setTempWaterTarget(hydration.target);
                            setShowWaterSettings(!showWaterSettings);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Modifier l'objectif"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Modal de paramètres d'objectif */}
                    {showWaterSettings && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">Objectif quotidien</span>
                          <button
                            onClick={() => setShowWaterSettings(false)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTempWaterTarget(Math.max(0.5, tempWaterTarget - 0.25))}
                            className="p-1 bg-white rounded border border-gray-200 hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <div className="flex-1 text-center">
                            <span className="text-lg font-bold text-gray-800">{tempWaterTarget}L</span>
                          </div>
                          <button
                            onClick={() => setTempWaterTarget(Math.min(5, tempWaterTarget + 0.25))}
                            className="p-1 bg-white rounded border border-gray-200 hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <button
                          onClick={saveWaterTarget}
                          className="w-full mt-2 py-1.5 bg-[#1B998B] text-white text-xs font-medium rounded-lg hover:bg-[#147569] transition-colors"
                        >
                          Enregistrer
                        </button>
                      </motion.div>
                    )}

                    {/* Jauge circulaire */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-28 h-28 mb-3">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="56" cy="56" r="48" stroke="#E5E7EB" strokeWidth="10" fill="none" />
                          <motion.circle
                            cx="56" cy="56" r="48"
                            stroke={svgStrokeColor}
                            strokeWidth="10"
                            fill="none"
                            strokeDasharray="302"
                            initial={{ strokeDashoffset: 302 }}
                            animate={{ strokeDashoffset: 302 - (302 * waterPercentage / 100) }}
                            transition={{ duration: 1, delay: 0.3 }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <Droplets className={`w-4 h-4 ${waterColors.text} mb-0.5`} />
                          <span className="text-xl font-bold text-gray-800">{hydration.current}L</span>
                          <span className="text-xs text-gray-500">/ {hydration.target}L</span>
                        </div>
                      </div>
                      <p className={`text-xs ${waterColors.text} font-medium mb-3`}>
                        {getStatusLabel(waterStatus)}
                      </p>

                      {/* Boutons d'ajout rapide */}
                      <div className="w-full grid grid-cols-3 gap-2 mb-3">
                        {waterAmountOptions.map((option) => (
                          <button
                            key={option.amount}
                            onClick={() => addWater(option.amount)}
                            className={`py-2 px-1 ${waterColors.bgLight} ${waterColors.text} rounded-lg text-xs font-medium hover:opacity-80 transition-all hover:scale-105 active:scale-95`}
                          >
                            <span className="block text-sm">{option.icon}</span>
                            <span>+{option.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Historique des ajouts */}
                      {hydration.logs.length > 0 && (
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Aujourd'hui
                            </span>
                            <span className="text-xs text-gray-400">{hydration.logs.length} ajout{hydration.logs.length > 1 ? 's' : ''}</span>
                          </div>
                          <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {[...hydration.logs].reverse().map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded-lg group"
                              >
                                <div className="flex items-center gap-2">
                                  <Droplets className="w-3 h-3 text-blue-400" />
                                  <span className="text-xs font-medium text-gray-700">+{entry.amount}ml</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">
                                    {entry.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <button
                                    onClick={() => removeWaterEntry(entry.id)}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                                    title="Supprimer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()}
            </div>

            {/* DASH-003: Enregistrement rapide des repas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Enregistrer un repas</h3>
                <span className="text-xs text-gray-400">
                  {meals.filter(m => m.logged).length}/{meals.length} enregistrés
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {meals.map((meal) => (
                  <motion.button
                    key={meal.id}
                    onClick={() => openMealModal(meal)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
                      meal.logged
                        ? 'border-[#1B998B]/40 bg-gradient-to-br from-[#1B998B]/5 to-[#1B998B]/10'
                        : 'border-dashed border-gray-200 hover:border-[#1B998B]/50 hover:bg-[#1B998B]/5'
                    }`}
                  >
                    {/* Icône du repas */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{meal.icon}</span>
                      {meal.logged ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-[#1B998B]" />
                        </div>
                      ) : (
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#1B998B] transition-colors" />
                      )}
                    </div>

                    {/* Label du repas */}
                    <p className="text-sm font-medium text-gray-800 mb-1">{meal.label}</p>

                    {/* Détails si enregistré */}
                    {meal.logged ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{meal.time}</span>
                          <span className="mx-1">•</span>
                          <span className="font-medium text-[#1B998B]">{meal.calories} kcal</span>
                        </div>
                        {meal.description && (
                          <p className="text-xs text-gray-400 truncate">{meal.description}</p>
                        )}
                        {/* Bouton pour supprimer */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMealLog(meal.id);
                          }}
                          className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                          title="Supprimer l'enregistrement"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Cliquez pour ajouter
                      </p>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* DASH-003: Modal d'enregistrement rapide */}
            {showMealModal && selectedMeal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={closeMealModal}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header du modal */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedMeal.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{selectedMeal.label}</h3>
                        <p className="text-xs text-gray-500">
                          {selectedMeal.logged ? 'Modifier ou supprimer' : 'Choisissez une option'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeMealModal}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Options d'enregistrement rapide */}
                  {!selectedMeal.logged && (
                    <div className="space-y-3 mb-6">
                      <p className="text-sm font-medium text-gray-700">Ajouter rapidement</p>
                      <div className="grid grid-cols-2 gap-3">
                        {quickMealOptions.map((option) => (
                          <button
                            key={option.action}
                            onClick={() => logMealQuickly(selectedMeal.id, option.action)}
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#1B998B]/50 hover:bg-[#1B998B]/5 transition-all text-left"
                          >
                            <span className="text-xl">{option.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Affichage si repas déjà enregistré */}
                  {selectedMeal.logged && (
                    <div className="mb-6">
                      <div className="p-4 bg-[#1B998B]/5 rounded-xl border border-[#1B998B]/20 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Enregistré à {selectedMeal.time}</span>
                          <span className="text-lg font-bold text-[#1B998B]">{selectedMeal.calories} kcal</span>
                        </div>
                        {selectedMeal.description && (
                          <p className="text-sm text-gray-600 mb-3">{selectedMeal.description}</p>
                        )}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white rounded-lg p-2">
                            <p className="text-xs text-gray-500">Protéines</p>
                            <p className="text-sm font-semibold text-gray-800">{selectedMeal.proteins}g</p>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <p className="text-xs text-gray-500">Glucides</p>
                            <p className="text-sm font-semibold text-gray-800">{selectedMeal.carbs}g</p>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <p className="text-xs text-gray-500">Lipides</p>
                            <p className="text-sm font-semibold text-gray-800">{selectedMeal.fats}g</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          removeMealLog(selectedMeal.id);
                          closeMealModal();
                        }}
                        className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Supprimer cet enregistrement
                      </button>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex gap-3">
                    <button
                      onClick={closeMealModal}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    {!selectedMeal.logged && (
                      <button
                        onClick={() => {
                          // TODO: Ouvrir la page complète d'enregistrement
                          console.log('Ouvrir page complète');
                          closeMealModal();
                        }}
                        className="flex-1 py-3 bg-[#1B998B] text-white rounded-xl text-sm font-medium hover:bg-[#147569] transition-colors flex items-center justify-center gap-2"
                      >
                        <UtensilsCrossed className="w-4 h-4" />
                        Enregistrement détaillé
                      </button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </section>

          {/* Zone secondaire - Cette semaine */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Cette semaine
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {/* DASH-004: Progression avec sparkline et comparaisons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Progression</h3>
                  <span className="text-xs text-gray-400">Cette semaine</span>
                </div>

                {/* Streak d'enregistrement */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-800">{mockWeeklyProgress.streak} jours</p>
                    <p className="text-xs text-gray-500">Streak d'enregistrement</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                      🔥 Record !
                    </span>
                  </div>
                </div>

                {/* Tendance du poids avec mini graphique sparkline */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Poids</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-800">{mockWeeklyProgress.currentWeight} kg</span>
                      <span className={`ml-2 text-sm font-medium ${mockWeeklyProgress.weightChange < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {mockWeeklyProgress.weightChange > 0 ? '+' : ''}{mockWeeklyProgress.weightChange} kg
                      </span>
                    </div>
                  </div>

                  {/* Mini graphique sparkline - Design amélioré */}
                  <div className="mt-3 mb-1">
                    {/* Conteneur du graphique avec hauteur suffisante */}
                    <div className="h-16 w-full relative bg-gradient-to-b from-[#1B998B]/5 to-transparent rounded-lg overflow-hidden">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 200 64"
                        preserveAspectRatio="none"
                      >
                        {/* Définitions des gradients */}
                        <defs>
                          <linearGradient id="weightAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1B998B" stopOpacity="0.25" />
                            <stop offset="50%" stopColor="#1B998B" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#1B998B" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="weightLineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#1B998B" stopOpacity="0.6" />
                            <stop offset="50%" stopColor="#1B998B" stopOpacity="1" />
                            <stop offset="100%" stopColor="#1B998B" stopOpacity="1" />
                          </linearGradient>
                        </defs>

                        {/* Lignes de grille horizontales subtiles */}
                        <line x1="0" y1="16" x2="200" y2="16" stroke="#E5E7EB" strokeWidth="0.5" strokeOpacity="0.5" />
                        <line x1="0" y1="32" x2="200" y2="32" stroke="#E5E7EB" strokeWidth="0.5" strokeOpacity="0.5" />
                        <line x1="0" y1="48" x2="200" y2="48" stroke="#E5E7EB" strokeWidth="0.5" strokeOpacity="0.5" />

                        {/* Aire sous la courbe avec gradient */}
                        <motion.path
                          d={generateSparklineAreaPath(mockWeeklyProgress.weightHistory.map(w => w.weight), 200, 64, 6)}
                          fill="url(#weightAreaGradient)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        />

                        {/* Courbe du poids - ligne principale */}
                        <motion.path
                          d={generateSparklinePath(mockWeeklyProgress.weightHistory.map(w => w.weight), 200, 64, 6)}
                          fill="none"
                          stroke="url(#weightLineGradient)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />

                        {/* Point final (dernier jour) avec effet glow */}
                        {(() => {
                          const data = mockWeeklyProgress.weightHistory.map(w => w.weight);
                          const min = Math.min(...data);
                          const max = Math.max(...data);
                          const range = max - min || 0.1;
                          const lastIndex = data.length - 1;
                          const x = 8 + (lastIndex / (data.length - 1)) * 184;
                          const y = 6 + ((max - data[lastIndex]) / range) * 52;
                          return (
                            <>
                              {/* Glow effect */}
                              <motion.circle
                                cx={x}
                                cy={y}
                                r="8"
                                fill="#1B998B"
                                opacity="0.2"
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
                              />
                              {/* Point principal */}
                              <motion.circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#1B998B"
                                stroke="#fff"
                                strokeWidth="2"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 1.2 }}
                              />
                            </>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Légende des jours */}
                    <div className="flex justify-between text-[10px] text-gray-400 px-1 mt-1">
                      <span>Lun</span>
                      <span>Mar</span>
                      <span>Mer</span>
                      <span>Jeu</span>
                      <span>Ven</span>
                      <span>Sam</span>
                      <span className="font-medium text-[#1B998B]">Auj.</span>
                    </div>
                  </div>
                </div>

                {/* Adhérence au plan avec barre de progression */}
                {(() => {
                  const adherenceStatus = getProgressStatus(mockWeeklyProgress.planAdherence, 100);
                  const adherenceColors = getStatusColors(adherenceStatus);
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 ${adherenceColors.bgLight} rounded-lg flex items-center justify-center`}>
                            <Target className={`w-4 h-4 ${adherenceColors.text}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Adhérence au plan</span>
                        </div>
                        <span className={`text-lg font-bold ${adherenceColors.text}`}>{mockWeeklyProgress.planAdherence}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${mockWeeklyProgress.planAdherence}%` }}
                          transition={{ duration: 0.8, delay: 0.6 }}
                          className={`h-full ${adherenceColors.bg} rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })()}
              </motion.div>

              {/* DASH-005: Prochain RDV avec compte à rebours */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Prochain rendez-vous</h3>
                  {mockNextAppointment.hasUpcoming && mockNextAppointment.appointment && (
                    <span className="inline-flex items-center px-2 py-1 bg-[#1B998B]/10 text-[#1B998B] text-xs font-medium rounded-full">
                      {formatCountdown(mockNextAppointment.appointment.date)}
                    </span>
                  )}
                </div>

                {mockNextAppointment.hasUpcoming && mockNextAppointment.appointment ? (
                  <>
                    {/* Carte du rendez-vous */}
                    <div className="bg-gradient-to-br from-[#1B998B]/5 to-[#1B998B]/10 rounded-xl p-4 mb-4 border border-[#1B998B]/10">
                      <div className="flex items-start gap-4">
                        {/* Date stylisée */}
                        <div className="w-14 h-14 bg-white rounded-xl flex flex-col items-center justify-center border border-[#1B998B]/20 shadow-sm">
                          <span className="text-[10px] text-[#1B998B] font-semibold uppercase">
                            {mockNextAppointment.appointment.date.toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                          <span className="text-xl font-bold text-gray-800">
                            {mockNextAppointment.appointment.date.getDate()}
                          </span>
                        </div>

                        {/* Détails */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 mb-1">
                            {getAppointmentTypeLabel(mockNextAppointment.appointment.type)}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {mockNextAppointment.appointment.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {mockNextAppointment.appointment.endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>

                          {/* Mode du RDV */}
                          {(() => {
                            const modeInfo = getAppointmentModeInfo(mockNextAppointment.appointment!.mode);
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${modeInfo.color}`}>
                                <span>{modeInfo.icon}</span>
                                {modeInfo.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Nutritionniste */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1B998B]/10">
                        <div className="w-6 h-6 bg-[#1B998B] rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                          {mockNextAppointment.appointment.nutritionistInitials}
                        </div>
                        <span className="text-xs text-gray-600">
                          avec <span className="font-medium text-gray-800">{mockNextAppointment.appointment.nutritionistName}</span>
                        </span>
                      </div>
                    </div>

                    {/* Lien vers l'agenda */}
                    <button
                      onClick={() => {}}
                      className="w-full py-2.5 text-sm text-[#1B998B] font-medium hover:bg-[#1B998B]/5 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-4 h-4" />
                      Voir l'agenda complet
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  /* Aucun RDV planifié */
                  <div className="text-center py-6">
                    <div className="w-14 h-14 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Aucun rendez-vous planifié
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Prenez rendez-vous avec votre nutritionniste
                    </p>
                    <button
                      onClick={() => {}}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white text-sm font-medium rounded-lg hover:bg-[#147569] transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Prendre rendez-vous
                    </button>
                  </div>
                )}
              </motion.div>

              {/* DASH-006: Messages avec badge dynamique */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Messages</h3>
                  {messagesData.unreadCount > 0 && (
                    <motion.span
                      key={messagesData.unreadCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      {messagesData.unreadCount} non lu{messagesData.unreadCount > 1 ? 's' : ''}
                    </motion.span>
                  )}
                </div>

                {/* Liste des messages récents (max 2) */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {messagesData.messages.slice(0, 2).map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        !message.isRead
                          ? 'bg-[#1B998B]/5 hover:bg-[#1B998B]/10'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => {}}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${
                        message.senderRole === 'nutritionist' ? 'bg-[#1B998B]' : 'bg-blue-500'
                      }`}>
                        {message.senderInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${!message.isRead ? 'font-semibold text-gray-800' : 'font-medium text-gray-600'}`}>
                            {message.senderName}
                          </p>
                          {message.isImportant && (
                            <span className="text-amber-500 text-xs">★</span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${!message.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                          {message.preview}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formatRelativeTime(message.timestamp)}
                        </p>
                      </div>
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-[#1B998B] rounded-full mt-2 flex-shrink-0"></div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Afficher le nombre de messages restants si > 2 */}
                {messagesData.messages.length > 2 && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    + {messagesData.messages.length - 2} autre{messagesData.messages.length - 2 > 1 ? 's' : ''} message{messagesData.messages.length - 2 > 1 ? 's' : ''}
                  </p>
                )}

                <button
                  onClick={() => {}}
                  className="w-full py-2.5 mt-3 text-sm text-[#1B998B] font-medium hover:bg-[#1B998B]/5 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ouvrir la messagerie
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>

            {/* DASH-007: Objectifs de la semaine - avec indicateurs dynamiques et célébration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-6 bg-white rounded-xl p-6 border border-gray-200"
            >
              {/* Header avec progression globale et temps restant */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-800">Objectifs de la semaine</h3>
                  <span className="inline-flex items-center px-2 py-0.5 bg-[#1B998B]/10 text-[#1B998B] text-xs font-medium rounded-full">
                    {mockWeeklyObjectivesData.completedCount}/{mockWeeklyObjectivesData.totalCount} atteints
                  </span>
                </div>
                {(() => {
                  const timeLeft = getTimeRemaining(mockWeeklyObjectivesData.weekEnd);
                  return (
                    <span className={`text-xs font-medium flex items-center gap-1 ${
                      timeLeft.isUrgent ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {timeLeft.text}
                    </span>
                  );
                })()}
              </div>

              {/* Grille des objectifs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {mockWeeklyObjectivesData.objectives.map((objective, index) => {
                  const objStatus = getProgressStatus(objective.progress, 100);
                  const objColors = getStatusColors(objStatus);
                  const categoryInfo = getObjectiveCategoryInfo(objective.category);
                  const timeLeft = getTimeRemaining(objective.endDate);

                  return (
                    <motion.div
                      key={objective.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className={`relative p-4 rounded-xl border-2 transition-all group ${
                        objective.isCompleted
                          ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50'
                          : `${objColors.border} ${objColors.bgLight}`
                      }`}
                    >
                      {/* Animation de célébration pour objectif atteint */}
                      {objective.isCompleted && (
                        <>
                          {/* Particules de célébration */}
                          <motion.div
                            className="absolute -top-1 -right-1"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.8 + index * 0.1 }}
                          >
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </motion.div>
                          {/* Effet de brillance */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-xl"
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ duration: 1.5, delay: 1 + index * 0.1, ease: 'easeInOut' }}
                          />
                        </>
                      )}

                      {/* Icône de catégorie et temps restant */}
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-8 h-8 rounded-lg ${categoryInfo.bgColor} flex items-center justify-center`}>
                          <span className="text-sm">{categoryInfo.icon}</span>
                        </div>
                        {!objective.isCompleted && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            timeLeft.isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {timeLeft.text}
                          </span>
                        )}
                        {objective.isCompleted && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            Atteint !
                          </span>
                        )}
                      </div>

                      {/* Label et description */}
                      <p className={`text-sm font-medium mb-1 ${
                        objective.isCompleted ? 'text-emerald-800' : 'text-gray-800'
                      }`}>
                        {objective.label}
                      </p>
                      {objective.description && (
                        <p className="text-[10px] text-gray-500 mb-3 line-clamp-1">
                          {objective.description}
                        </p>
                      )}

                      {/* Barre de progression */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${
                            objective.isCompleted ? 'text-emerald-600' : objColors.text
                          }`}>
                            {objective.progress}%
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {objective.current}/{objective.target} {objective.unit}
                          </span>
                        </div>
                        <div className="h-2 bg-white/70 rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${objective.progress}%` }}
                            transition={{ duration: 0.8, delay: 0.8 + index * 0.1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              objective.isCompleted
                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                : objColors.bg
                            }`}
                          />
                        </div>
                      </div>

                      {/* Défini par */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200/50">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium text-white ${
                          objective.definedBy.role === 'nutritionist' ? 'bg-[#1B998B]' : 'bg-blue-500'
                        }`}>
                          {objective.definedBy.initials}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {objective.definedBy.role === 'nutritionist' ? 'Défini par' : 'Suggéré par'} {objective.definedBy.name}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Encouragement si tous les objectifs sont atteints */}
              {mockWeeklyObjectivesData.completedCount === mockWeeklyObjectivesData.totalCount && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-[#1B998B]/10 rounded-xl border border-emerald-200 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl">🎉</span>
                    <span className="font-semibold text-emerald-800">Félicitations !</span>
                    <span className="text-2xl">🎉</span>
                  </div>
                  <p className="text-sm text-emerald-700">
                    Vous avez atteint tous vos objectifs cette semaine. Continuez ainsi !
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* DASH-004: Comparaison avec la semaine précédente */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="mt-6 bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Comparaison avec la semaine dernière</h3>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Vue hebdomadaire
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {mockWeeklyProgress.comparisons.map((comparison, index) => {
                  const delta = comparison.currentWeek - comparison.previousWeek;
                  const deltaPercent = comparison.previousWeek > 0
                    ? Math.round((delta / comparison.previousWeek) * 100)
                    : 0;

                  // Déterminer si la tendance est positive ou négative
                  const isPositiveTrend = (comparison.trend === 'up' && comparison.isPositive) ||
                                          (comparison.trend === 'down' && comparison.isPositive);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                      className={`p-4 rounded-xl border ${
                        isPositiveTrend ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'
                      }`}
                    >
                      {/* Label */}
                      <p className="text-xs font-medium text-gray-500 mb-2">{comparison.label}</p>

                      {/* Valeur actuelle */}
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-xl font-bold text-gray-800">
                          {comparison.unit === 'L' ? comparison.currentWeek.toFixed(1) : comparison.currentWeek}
                        </span>
                        {comparison.unit && (
                          <span className="text-sm text-gray-500">{comparison.unit}</span>
                        )}
                      </div>

                      {/* Delta avec la semaine précédente */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center text-xs font-medium ${
                          isPositiveTrend ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {comparison.trend === 'up' ? (
                            <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          ) : comparison.trend === 'down' ? (
                            <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                            </svg>
                          )}
                          {formatDelta(comparison.currentWeek, comparison.previousWeek, comparison.unit)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ({deltaPercent >= 0 ? '+' : ''}{deltaPercent}%)
                        </span>
                      </div>

                      {/* Valeur semaine précédente */}
                      <p className="text-[10px] text-gray-400 mt-1">
                        Sem. précédente: {comparison.unit === 'L' ? comparison.previousWeek.toFixed(1) : comparison.previousWeek}{comparison.unit}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>

          {/* Zone tertiaire - Accès rapide */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Accès rapide
            </h2>

            <div className="grid grid-cols-4 gap-4">
              {quickAccess.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  className="bg-white rounded-xl p-5 border border-gray-200 text-left hover:border-[#1B998B]/50 hover:shadow-md transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                    {item.icon}
                  </div>
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </motion.button>
              ))}
            </div>
          </section>
        </div>
      </main>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
