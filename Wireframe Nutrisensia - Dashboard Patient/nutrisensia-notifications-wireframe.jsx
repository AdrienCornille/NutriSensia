import React, { useState } from 'react';

const NotificationsCenterWireframe = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'message',
      title: 'Nouveau message de Lucie Martin',
      description: 'Excellent choix ! Les proportions sont parfaites 👏...',
      timestamp: 'Il y a 2 heures',
      read: false,
      icon: '💬',
      action: { label: 'Voir le message', link: '/messagerie' },
    },
    {
      id: 2,
      type: 'appointment',
      title: 'Rappel : Consultation demain',
      description: 'Votre consultation de suivi avec Lucie Martin est prévue demain à 14h00',
      timestamp: 'Il y a 3 heures',
      read: false,
      icon: '📅',
      action: { label: 'Voir le rendez-vous', link: '/agenda' },
    },
    {
      id: 3,
      type: 'achievement',
      title: '🎉 Félicitations ! Streak de 7 jours',
      description: 'Vous avez enregistré vos repas pendant 7 jours consécutifs. Continuez ainsi !',
      timestamp: 'Il y a 5 heures',
      read: false,
      icon: '🏆',
      action: null,
    },
    {
      id: 4,
      type: 'plan',
      title: 'Plan alimentaire mis à jour',
      description: 'Lucie Martin a modifié votre plan alimentaire. Les noix de cajou remplacent les amandes.',
      timestamp: 'Hier à 09:15',
      read: true,
      icon: '🍽',
      action: { label: 'Voir le plan', link: '/plan-alimentaire' },
    },
    {
      id: 5,
      type: 'reminder',
      title: 'N\'oubliez pas de vous peser',
      description: 'Votre dernière pesée date de 5 jours. Pensez à enregistrer votre poids.',
      timestamp: 'Hier à 08:00',
      read: true,
      icon: '⚖️',
      action: { label: 'Enregistrer mon poids', link: '/suivi' },
    },
    {
      id: 6,
      type: 'content',
      title: 'Nouveau contenu disponible',
      description: 'Article : "Comment maintenir sa motivation sur le long terme"',
      timestamp: 'Il y a 2 jours',
      read: true,
      icon: '📚',
      action: { label: 'Lire l\'article', link: '/contenu' },
    },
    {
      id: 7,
      type: 'hydration',
      title: 'Rappel hydratation',
      description: 'Vous n\'avez enregistré que 0.5L aujourd\'hui. Objectif : 2L',
      timestamp: 'Il y a 2 jours',
      read: true,
      icon: '💧',
      action: { label: 'Ajouter de l\'eau', link: '/suivi' },
    },
    {
      id: 8,
      type: 'message',
      title: 'Nouveau message de Lucie Martin',
      description: 'Bonjour Jean ! Oui, le thé compte dans votre hydratation...',
      timestamp: 'Il y a 3 jours',
      read: true,
      icon: '💬',
      action: { label: 'Voir le message', link: '/messagerie' },
    },
    {
      id: 9,
      type: 'appointment',
      title: 'Consultation terminée',
      description: 'Votre consultation du 15 janvier avec Lucie Martin est terminée. Le résumé est disponible.',
      timestamp: 'Il y a 3 jours',
      read: true,
      icon: '✅',
      action: { label: 'Voir le résumé', link: '/dossier' },
    },
    {
      id: 10,
      type: 'achievement',
      title: '🎯 Objectif atteint : -3 kg',
      description: 'Vous avez atteint 43% de votre objectif de perte de poids. Bravo !',
      timestamp: 'Il y a 5 jours',
      read: true,
      icon: '🎯',
      action: null,
    },
    {
      id: 11,
      type: 'system',
      title: 'Bienvenue sur NutriSensia !',
      description: 'Votre compte a été créé avec succès. Commencez par explorer votre tableau de bord.',
      timestamp: '15 décembre 2025',
      read: true,
      icon: '👋',
      action: null,
    },
  ]);

  const filters = [
    { id: 'all', label: 'Toutes', count: notifications.length },
    { id: 'unread', label: 'Non lues', count: notifications.filter(n => !n.read).length },
    { id: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
    { id: 'appointment', label: 'Rendez-vous', count: notifications.filter(n => n.type === 'appointment').length },
    { id: 'reminder', label: 'Rappels', count: notifications.filter(n => ['reminder', 'hydration'].includes(n.type)).length },
    { id: 'achievement', label: 'Récompenses', count: notifications.filter(n => n.type === 'achievement').length },
  ];

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notif.read;
    if (activeFilter === 'reminder') return ['reminder', 'hydration'].includes(notif.type);
    return notif.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-600';
      case 'appointment': return 'bg-purple-100 text-purple-600';
      case 'achievement': return 'bg-amber-100 text-amber-600';
      case 'plan': return 'bg-emerald-100 text-emerald-600';
      case 'reminder': return 'bg-orange-100 text-orange-600';
      case 'hydration': return 'bg-cyan-100 text-cyan-600';
      case 'content': return 'bg-pink-100 text-pink-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const groupNotificationsByDate = (notifs) => {
    const today = [];
    const yesterday = [];
    const thisWeek = [];
    const older = [];

    notifs.forEach(notif => {
      if (notif.timestamp.includes('heure') || notif.timestamp.includes('minute')) {
        today.push(notif);
      } else if (notif.timestamp.includes('Hier')) {
        yesterday.push(notif);
      } else if (notif.timestamp.includes('jour')) {
        thisWeek.push(notif);
      } else {
        older.push(notif);
      }
    });

    return { today, yesterday, thisWeek, older };
  };

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  const NotificationItem = ({ notification }) => (
    <div
      className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
        notification.read 
          ? 'bg-white border-gray-200' 
          : 'bg-emerald-50/50 border-emerald-200'
      }`}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
          <span className="text-xl">{notification.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`font-medium ${notification.read ? 'text-gray-800' : 'text-gray-900'}`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {notification.description}
              </p>
            </div>
            
            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">{notification.timestamp}</span>
            
            <div className="flex items-center gap-2">
              {notification.action && (
                <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
                  {notification.action.label}
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationGroup = ({ title, notifications }) => {
    if (notifications.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-3">{title}</h3>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                ← Retour
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-800">Notifications</h1>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">Restez informé de votre suivi</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="px-3 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Tout marquer comme lu
                </button>
              )}
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Paramètres">
                ⚙️
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className={`ml-1.5 ${
                    activeFilter === filter.id ? 'text-emerald-100' : 'text-gray-400'
                  }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {/* Empty state */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔔</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              {activeFilter === 'all' ? 'Aucune notification' : 'Aucune notification dans cette catégorie'}
            </h3>
            <p className="text-gray-500">
              {activeFilter === 'all' 
                ? 'Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.'
                : 'Essayez un autre filtre ou revenez plus tard.'}
            </p>
            {activeFilter !== 'all' && (
              <button 
                onClick={() => setActiveFilter('all')}
                className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                Voir toutes les notifications
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Notification groups */}
            <NotificationGroup title="Aujourd'hui" notifications={groupedNotifications.today} />
            <NotificationGroup title="Hier" notifications={groupedNotifications.yesterday} />
            <NotificationGroup title="Cette semaine" notifications={groupedNotifications.thisWeek} />
            <NotificationGroup title="Plus ancien" notifications={groupedNotifications.older} />

            {/* Clear all */}
            {notifications.length > 0 && (
              <div className="mt-8 text-center">
                <button 
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Effacer toutes les notifications
                </button>
              </div>
            )}
          </>
        )}

        {/* Notification preferences link */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">⚙️</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Gérer mes préférences</p>
                <p className="text-sm text-gray-500">Choisissez quelles notifications recevoir</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Paramètres
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-800">{notifications.filter(n => n.type === 'message').length}</p>
            <p className="text-sm text-gray-500">Messages</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-800">{notifications.filter(n => n.type === 'achievement').length}</p>
            <p className="text-sm text-gray-500">Récompenses</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-800">{notifications.filter(n => ['reminder', 'hydration'].includes(n.type)).length}</p>
            <p className="text-sm text-gray-500">Rappels</p>
          </div>
        </div>
      </main>

      {/* Push notification preview (floating) */}
      <div className="fixed bottom-6 right-6 max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-pulse">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span>🍽</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800 text-sm">NutriSensia</p>
                  <span className="text-xs text-gray-400">maintenant</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  N'oubliez pas d'enregistrer votre déjeuner ! 🥗
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-t border-gray-100">
            <button className="flex-1 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              Ignorer
            </button>
            <button className="flex-1 py-3 text-sm text-emerald-600 font-medium hover:bg-emerald-50 transition-colors border-l border-gray-100">
              Enregistrer
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">Aperçu d'une notification push</p>
      </div>
    </div>
  );
};

export default NotificationsCenterWireframe;
