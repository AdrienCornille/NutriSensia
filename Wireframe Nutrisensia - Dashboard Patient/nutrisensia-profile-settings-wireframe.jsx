import React, { useState } from 'react';

const ProfileSettingsWireframe = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const sections = [
    { id: 'profile', label: 'Informations personnelles', icon: '👤' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'integrations', label: 'Appareils connectés', icon: '📱' },
    { id: 'preferences', label: 'Préférences', icon: '⚙️' },
    { id: 'data', label: 'Mes données', icon: '📊' },
  ];

  const userProfile = {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.ch',
    phone: '+41 79 123 45 67',
    birthDate: '12 mars 1988',
    gender: 'Masculin',
    address: 'Rue de la Gare 15, 2000 Neuchâtel',
    avatar: 'JD',
    memberSince: 'Décembre 2025',
  };

  const securitySettings = {
    twoFactorEnabled: false,
    lastPasswordChange: '15 décembre 2025',
  };

  const notificationSettings = {
    email: {
      appointments: true,
      messages: true,
      weeklyReport: true,
      newContent: false,
      marketing: false,
    },
    push: {
      appointments: true,
      messages: true,
      mealReminders: true,
      hydrationReminders: true,
      weightReminders: false,
      streakAlerts: true,
    },
  };

  const connectedDevices = [
    { id: 1, name: 'Apple Health', icon: '🍎', status: 'connected', lastSync: 'Il y a 2 heures', dataTypes: ['Activité', 'Sommeil'] },
    { id: 2, name: 'Withings Scale', icon: '⚖️', status: 'connected', lastSync: 'Il y a 1 jour', dataTypes: ['Poids', 'Masse grasse'] },
    { id: 3, name: 'Google Fit', icon: '🏃', status: 'disconnected', lastSync: null, dataTypes: [] },
    { id: 4, name: 'Fitbit', icon: '⌚', status: 'disconnected', lastSync: null, dataTypes: [] },
  ];

  const dataStats = {
    totalMeals: 156,
    totalWeightEntries: 24,
    totalMessages: 32,
    accountCreated: '15 décembre 2025',
  };

  const openEditModal = (field) => {
    setEditField(field);
    setShowEditModal(true);
  };

  const NotificationToggle = ({ enabled, label }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-700">{label}</span>
      <button className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">← Retour</button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Profil & Paramètres</h1>
              <p className="text-sm text-gray-500">Gérez votre compte et vos préférences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {userProfile.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{userProfile.firstName} {userProfile.lastName}</p>
                    <p className="text-sm text-gray-500">Patient depuis {userProfile.memberSince}</p>
                  </div>
                </div>
              </div>
              <nav className="p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-4">Photo de profil</h2>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                      {userProfile.avatar}
                    </div>
                    <div>
                      <div className="flex gap-3">
                        <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">Changer la photo</button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Supprimer</button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">JPG, PNG ou GIF. Max 2 Mo.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-4">Informations personnelles</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'firstName', label: 'Prénom', value: userProfile.firstName },
                      { key: 'lastName', label: 'Nom', value: userProfile.lastName },
                      { key: 'email', label: 'Email', value: userProfile.email },
                      { key: 'phone', label: 'Téléphone', value: userProfile.phone },
                      { key: 'birthDate', label: 'Date de naissance', value: userProfile.birthDate },
                      { key: 'gender', label: 'Sexe', value: userProfile.gender },
                      { key: 'address', label: 'Adresse', value: userProfile.address },
                    ].map((field) => (
                      <div key={field.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm text-gray-500">{field.label}</p>
                          <p className="font-medium text-gray-800">{field.value}</p>
                        </div>
                        <button onClick={() => openEditModal(field)} className="px-3 py-1 text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-medium">
                          Modifier
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-4">Mot de passe</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700">Dernière modification</p>
                      <p className="text-sm text-gray-500">{securitySettings.lastPasswordChange}</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Changer le mot de passe</button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-800">Authentification à deux facteurs (2FA)</h2>
                      <p className="text-sm text-gray-500 mt-1">Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${securitySettings.twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {securitySettings.twoFactorEnabled ? 'Activé' : 'Désactivé'}
                    </span>
                  </div>
                  {!securitySettings.twoFactorEnabled && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex items-start gap-3">
                        <span className="text-amber-500">⚠️</span>
                        <p className="text-sm text-amber-700">Recommandé pour la sécurité de vos données de santé</p>
                      </div>
                    </div>
                  )}
                  <button onClick={() => setShow2FAModal(true)} className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                    Activer la 2FA
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-4">Sessions actives</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">💻</span>
                        <div>
                          <p className="font-medium text-gray-800">MacBook Pro - Chrome</p>
                          <p className="text-sm text-gray-500">Neuchâtel • Actif maintenant</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">Session actuelle</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">📱</span>
                        <div>
                          <p className="font-medium text-gray-800">iPhone 14 - Safari</p>
                          <p className="text-sm text-gray-500">Neuchâtel • Il y a 3 heures</p>
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">Déconnecter</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-4">Notifications par email</h2>
                  <div className="divide-y divide-gray-100">
                    <NotificationToggle enabled={notificationSettings.email.appointments} label="Rappels de rendez-vous" />
                    <NotificationToggle enabled={notificationSettings.email.messages} label="Nouveaux messages" />
                    <NotificationToggle enabled={notificationSettings.email.weeklyReport} label="Rapport hebdomadaire" />
                    <NotificationToggle enabled={notificationSettings.email.newContent} label="Nouveau contenu exclusif" />
                    <NotificationToggle enabled={notificationSettings.email.marketing} label="Actualités NutriSensia" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-4">Notifications push</h2>
                  <div className="divide-y divide-gray-100">
                    <NotificationToggle enabled={notificationSettings.push.appointments} label="Rappels de rendez-vous" />
                    <NotificationToggle enabled={notificationSettings.push.messages} label="Nouveaux messages" />
                    <NotificationToggle enabled={notificationSettings.push.mealReminders} label="Rappels de repas" />
                    <NotificationToggle enabled={notificationSettings.push.hydrationReminders} label="Rappels d'hydratation" />
                    <NotificationToggle enabled={notificationSettings.push.weightReminders} label="Rappels de pesée" />
                    <NotificationToggle enabled={notificationSettings.push.streakAlerts} label="Alertes de streak" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-semibold text-gray-800">Heures calmes</h2>
                      <p className="text-sm text-gray-500">Désactiver les notifications pendant certaines heures</p>
                    </div>
                    <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-500 mb-1">De</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white">
                        <option>22:00</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-500 mb-1">À</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white">
                        <option>07:00</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Integrations Section */}
            {activeSection === 'integrations' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-2">Appareils et applications connectés</h2>
                  <p className="text-sm text-gray-500 mb-6">Synchronisez automatiquement vos données de santé</p>
                  <div className="space-y-4">
                    {connectedDevices.map((device) => (
                      <div key={device.id} className={`p-4 rounded-xl border ${device.status === 'connected' ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${device.status === 'connected' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                              <span className="text-2xl">{device.icon}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{device.name}</p>
                              {device.status === 'connected' ? (
                                <div>
                                  <p className="text-sm text-emerald-600">✓ Connecté • Synchro: {device.lastSync}</p>
                                  <div className="flex gap-2 mt-1">
                                    {device.dataTypes.map((type) => (
                                      <span key={type} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">{type}</span>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Non connecté</p>
                              )}
                            </div>
                          </div>
                          {device.status === 'connected' ? (
                            <div className="flex gap-2">
                              <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">🔄 Synchro</button>
                              <button className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">Déconnecter</button>
                            </div>
                          ) : (
                            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">Connecter</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h3 className="font-semibold text-blue-800">Pourquoi connecter vos appareils ?</h3>
                      <ul className="mt-2 space-y-1 text-sm text-blue-700">
                        <li>• Synchronisation automatique du poids</li>
                        <li>• Import des activités sportives</li>
                        <li>• Suivi du sommeil</li>
                        <li>• Données plus complètes pour votre nutritionniste</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-4">Langue et région</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Langue</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                        <option>🇫🇷 Français</option>
                        <option>🇩🇪 Deutsch</option>
                        <option>🇮🇹 Italiano</option>
                        <option>🇬🇧 English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Fuseau horaire</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                        <option>Europe/Zurich (UTC+1)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Premier jour de la semaine</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                        <option>Lundi</option>
                        <option>Dimanche</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-4">Unités de mesure</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Poids</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                        <option>Kilogrammes (kg)</option>
                        <option>Livres (lb)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Taille</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                        <option>Centimètres (cm)</option>
                        <option>Pieds / Pouces</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Liquides</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white">
                        <option>Litres (L)</option>
                        <option>Onces (oz)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-4">Apparence</h2>
                  <div className="flex gap-4">
                    <button className="flex-1 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-center">
                      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 mb-3" />
                      <p className="font-medium text-gray-800">☀️ Clair</p>
                    </button>
                    <button className="flex-1 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-center">
                      <div className="w-full h-16 bg-gray-800 rounded-lg mb-3" />
                      <p className="font-medium text-gray-800">🌙 Sombre</p>
                    </button>
                    <button className="flex-1 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-center">
                      <div className="w-full h-16 bg-gradient-to-b from-white to-gray-800 rounded-lg mb-3" />
                      <p className="font-medium text-gray-800">💻 Système</p>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Data Section */}
            {activeSection === 'data' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-4">Résumé de vos données</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800">{dataStats.totalMeals}</p>
                      <p className="text-sm text-gray-500">Repas enregistrés</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800">{dataStats.totalWeightEntries}</p>
                      <p className="text-sm text-gray-500">Pesées enregistrées</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800">{dataStats.totalMessages}</p>
                      <p className="text-sm text-gray-500">Messages échangés</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-800">{dataStats.accountCreated}</p>
                      <p className="text-sm text-gray-500">Date de création</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-2">Exporter mes données</h2>
                  <p className="text-sm text-gray-500 mb-4">Téléchargez une copie de toutes vos données (RGPD)</p>
                  <button onClick={() => setShowExportModal(true)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                    📥 Exporter mes données
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 border border-red-200">
                  <h2 className="font-semibold text-red-600 mb-2">Supprimer mon compte</h2>
                  <p className="text-sm text-gray-500 mb-4">Cette action est irréversible. Toutes vos données seront supprimées.</p>
                  <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100">
                    Supprimer mon compte
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="font-semibold text-gray-800 mb-4">Informations légales</h2>
                  <div className="space-y-3">
                    <a href="#" className="flex items-center justify-between py-2 text-gray-700 hover:text-emerald-600">
                      <span>Conditions générales d'utilisation</span>
                      <span>→</span>
                    </a>
                    <a href="#" className="flex items-center justify-between py-2 text-gray-700 hover:text-emerald-600">
                      <span>Politique de confidentialité</span>
                      <span>→</span>
                    </a>
                    <a href="#" className="flex items-center justify-between py-2 text-gray-700 hover:text-emerald-600">
                      <span>Gestion des cookies</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && editField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Modifier {editField.label.toLowerCase()}</h3>
            <input type="text" defaultValue={editField.value} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-6" />
            <div className="flex gap-3">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200">Annuler</button>
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Activer la 2FA</h3>
            <div className="text-center mb-6">
              <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto flex items-center justify-center mb-4">
                <span className="text-6xl">📱</span>
              </div>
              <p className="text-sm text-gray-600">Scannez ce QR code avec votre application d'authentification</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Code de vérification</label>
              <input type="text" placeholder="000000" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-2xl tracking-widest" maxLength={6} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShow2FAModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200">Annuler</button>
              <button onClick={() => setShow2FAModal(false)} className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600">Activer</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Exporter mes données</h3>
            <p className="text-gray-600 mb-4">Sélectionnez les données à exporter :</p>
            <div className="space-y-3 mb-6">
              {['Informations personnelles', 'Historique des repas', 'Données de suivi', 'Messages', 'Documents'].map((item) => (
                <label key={item} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-500 rounded" />
                  <span className="text-gray-700">{item}</span>
                </label>
              ))}
            </div>
            <div className="p-4 bg-blue-50 rounded-lg mb-6">
              <p className="text-sm text-blue-700">📧 Un lien de téléchargement vous sera envoyé par email dans les 24h.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowExportModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200">Annuler</button>
              <button onClick={() => setShowExportModal(false)} className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600">Demander l'export</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Supprimer votre compte ?</h3>
              <p className="text-gray-500 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg mb-6">
              <p className="text-sm text-red-700"><strong>Vous perdrez :</strong></p>
              <ul className="text-sm text-red-600 mt-2 space-y-1">
                <li>• Votre historique de repas et suivi</li>
                <li>• Vos messages avec votre nutritionniste</li>
                <li>• Vos documents et questionnaires</li>
              </ul>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tapez "SUPPRIMER" pour confirmer</label>
              <input type="text" placeholder="SUPPRIMER" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200">Annuler</button>
              <button className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettingsWireframe;
