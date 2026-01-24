/**
 * Mock data pour le Centre de Notifications
 */

import type { Notification } from '@/types/notifications';

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'Nouveau message de Lucie Martin',
    description: 'Excellent choix ! Les proportions sont parfaites...',
    timestamp: 'Il y a 2 heures',
    read: false,
    icon: '💬',
    action: { label: 'Voir le message', link: '/dashboard/messagerie' },
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Rappel : Consultation demain',
    description: 'Votre consultation de suivi avec Lucie Martin est prévue demain à 14h00',
    timestamp: 'Il y a 3 heures',
    read: false,
    icon: '📅',
    action: { label: 'Voir le rendez-vous', link: '/dashboard/agenda' },
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Félicitations ! Streak de 7 jours',
    description: 'Vous avez enregistré vos repas pendant 7 jours consécutifs. Continuez ainsi !',
    timestamp: 'Il y a 5 heures',
    read: false,
    icon: '🏆',
    action: null,
  },
  {
    id: '4',
    type: 'plan',
    title: 'Plan alimentaire mis à jour',
    description:
      'Lucie Martin a modifié votre plan alimentaire. Les noix de cajou remplacent les amandes.',
    timestamp: 'Hier à 09:15',
    read: true,
    icon: '🍽',
    action: { label: 'Voir le plan', link: '/dashboard/plan-alimentaire' },
  },
  {
    id: '5',
    type: 'reminder',
    title: "N'oubliez pas de vous peser",
    description: 'Votre dernière pesée date de 5 jours. Pensez à enregistrer votre poids.',
    timestamp: 'Hier à 08:00',
    read: true,
    icon: '⚖️',
    action: { label: 'Enregistrer mon poids', link: '/dashboard/suivi' },
  },
  {
    id: '6',
    type: 'content',
    title: 'Nouveau contenu disponible',
    description: 'Article : "Comment maintenir sa motivation sur le long terme"',
    timestamp: 'Il y a 2 jours',
    read: true,
    icon: '📚',
    action: { label: "Lire l'article", link: '/dashboard/contenu' },
  },
  {
    id: '7',
    type: 'hydration',
    title: 'Rappel hydratation',
    description: "Vous n'avez enregistré que 0.5L aujourd'hui. Objectif : 2L",
    timestamp: 'Il y a 2 jours',
    read: true,
    icon: '💧',
    action: { label: "Ajouter de l'eau", link: '/dashboard/suivi?tab=hydratation' },
  },
  {
    id: '8',
    type: 'message',
    title: 'Nouveau message de Lucie Martin',
    description: 'Bonjour Jean ! Oui, le thé compte dans votre hydratation...',
    timestamp: 'Il y a 3 jours',
    read: true,
    icon: '💬',
    action: { label: 'Voir le message', link: '/dashboard/messagerie' },
  },
  {
    id: '9',
    type: 'appointment',
    title: 'Consultation terminée',
    description:
      'Votre consultation du 15 janvier avec Lucie Martin est terminée. Le résumé est disponible.',
    timestamp: 'Il y a 3 jours',
    read: true,
    icon: '✅',
    action: { label: 'Voir le résumé', link: '/dashboard/dossier?tab=consultations' },
  },
  {
    id: '10',
    type: 'achievement',
    title: 'Objectif atteint : -3 kg',
    description: 'Vous avez atteint 43% de votre objectif de perte de poids. Bravo !',
    timestamp: 'Il y a 5 jours',
    read: true,
    icon: '🎯',
    action: null,
  },
  {
    id: '11',
    type: 'system',
    title: 'Bienvenue sur NutriSensia !',
    description:
      'Votre compte a été créé avec succès. Commencez par explorer votre tableau de bord.',
    timestamp: '15 décembre 2025',
    read: true,
    icon: '👋',
    action: null,
  },
];

/**
 * Récupère toutes les notifications
 */
export function getNotifications(): Notification[] {
  return [...mockNotifications];
}

/**
 * Marque une notification comme lue
 */
export function markNotificationAsRead(id: string): Notification | null {
  const notification = mockNotifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
    return notification;
  }
  return null;
}

/**
 * Marque toutes les notifications comme lues
 */
export function markAllNotificationsAsRead(): void {
  mockNotifications.forEach((n) => {
    n.read = true;
  });
}

/**
 * Supprime une notification
 */
export function deleteNotification(id: string): boolean {
  const index = mockNotifications.findIndex((n) => n.id === id);
  if (index !== -1) {
    mockNotifications.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Efface toutes les notifications
 */
export function clearAllNotifications(): void {
  mockNotifications.length = 0;
}
