import React, { useState } from 'react';

const NutriProfileSettingsWireframe = () => {
  const [activeSection, setActiveSection] = useState('profil');
  const [visioEnabled, setVisioEnabled] = useState(true);
  const [acceptsNewPatients, setAcceptsNewPatients] = useState(true);

  const sections = [
    { id: 'profil', label: 'Profil professionnel', icon: '👤' },
    { id: 'cabinet', label: 'Cabinet', icon: '🏢' },
    { id: 'visio', label: 'Visioconference', icon: '📹' },
    { id: 'capacite', label: 'Capacite patients', icon: '👥' },
    { id: 'securite', label: 'Securite', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'affichage', label: 'Affichage', icon: '🎨' },
    { id: 'sessions', label: 'Sessions actives', icon: '💻' },
  ];

  const nutProfile = {
    firstName: 'Lucie',
    lastName: 'Martin',
    title: 'Dieteticienne-Nutritionniste',
    bio: 'Nutritionniste certifiee ASCA avec 8 ans d\'experience. Specialisee en perte de poids, nutrition sportive et alimentation anti-inflammatoire. Approche bienveillante et personnalisee.',
    asca: 'ASCA-2018-12345',
    rme: 'RME-67890',
    experience: 8,
    avatar: 'LM',
    memberSince: 'Janvier 2024',
  };

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'right-1' : 'left-1'}`} />
    </button>
  );

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
              <h1 className="text-xl font-semibold text-gray-800">Profil & Parametres</h1>
              <p className="text-sm text-gray-500">Gerez votre profil professionnel et vos preferences</p>
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
                    {nutProfile.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{nutProfile.firstName} {nutProfile.lastName}</p>
                    <p className="text-sm text-gray-500">Nutritionniste depuis {nutProfile.memberSince}</p>
                  </div>
                </div>
              </div>
              <nav className="p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
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
            {/* === PROFIL PROFESSIONNEL === */}
            {activeSection === 'profil' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Photo de profil</h2>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                      {nutProfile.avatar}
                    </div>
                    <div>
                      <div className="flex gap-3">
                        <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                          Changer la photo
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          Supprimer
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG. Max 2 Mo.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations personnelles</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prenom</label>
                      <input type="text" defaultValue={nutProfile.firstName} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input type="text" defaultValue={nutProfile.lastName} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre professionnel</label>
                      <input type="text" defaultValue={nutProfile.title} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                      <textarea
                        defaultValue={nutProfile.bio}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none h-24"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Certifications & Experience</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numero ASCA</label>
                      <input type="text" defaultValue={nutProfile.asca} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numero RME</label>
                      <input type="text" defaultValue={nutProfile.rme} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Annees d'experience</label>
                      <input type="number" defaultValue={nutProfile.experience} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Langues</label>
                      <div className="flex gap-2 mt-1">
                        {['Francais', 'Anglais', 'Allemand'].map((lang, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            i < 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {lang} {i < 2 ? '✓' : '+'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialisations</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {['Perte de poids', 'Nutrition sportive', 'Anti-inflammatoire', 'Diabete', 'Troubles alimentaires'].map((spec, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            i < 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200'
                          }`}>
                            {i < 3 ? `${spec} ✕` : `+ ${spec}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Sauvegarder
                  </button>
                </div>
              </>
            )}

            {/* === CABINET === */}
            {activeSection === 'cabinet' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations du cabinet</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom du cabinet</label>
                      <input type="text" defaultValue="Cabinet NutriSante" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                      <input type="text" defaultValue="Rue du Conseil 12" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                      <input type="text" defaultValue="2000" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <input type="text" defaultValue="Neuchatel" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                      <input type="text" defaultValue="Suisse" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50" disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telephone du cabinet</label>
                      <input type="text" defaultValue="+41 32 724 56 78" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Sauvegarder
                  </button>
                </div>
              </>
            )}

            {/* === VISIO === */}
            {activeSection === 'visio' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuration visioconference</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Visioconference activee</p>
                        <p className="text-sm text-gray-600">Permet aux patients de reserver des consultations en visio</p>
                      </div>
                      <Toggle enabled={visioEnabled} onChange={setVisioEnabled} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plateforme</label>
                      <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white">
                        <option>Jitsi (integre, gratuit)</option>
                        <option>Zoom</option>
                        <option>Google Meet</option>
                        <option>Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template de lien visio (optionnel)</label>
                      <input type="text" placeholder="https://meet.jit.si/nutrisensia-{room}" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                      <p className="text-xs text-gray-500 mt-1">Utilisez {'{room}'} pour l'identifiant unique de la salle</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Tester la connexion
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Sauvegarder
                  </button>
                </div>
              </>
            )}

            {/* === CAPACITE === */}
            {activeSection === 'capacite' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Capacite patients</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Accepter de nouveaux patients</p>
                        <p className="text-sm text-gray-600">Desactiver si vous ne prenez plus de nouveaux patients</p>
                      </div>
                      <Toggle enabled={acceptsNewPatients} onChange={setAcceptsNewPatients} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre maximum de patients</label>
                      <input type="number" defaultValue={50} className="w-32 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Occupation actuelle</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-gray-800">24</p>
                      <p className="text-sm text-gray-500">Patients actifs</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-gray-800">26</p>
                      <p className="text-sm text-gray-500">Places disponibles</p>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-emerald-700">Taux d'occupation</span>
                      <span className="text-sm font-semibold text-emerald-700">24 / 50</span>
                    </div>
                    <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '48%' }}></div>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">48% - 26 places disponibles</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Sauvegarder
                  </button>
                </div>
              </>
            )}

            {/* === SECURITE === */}
            {activeSection === 'securite' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Mot de passe</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700">Derniere modification</p>
                      <p className="text-sm text-gray-500">15 dec. 2025</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Changer le mot de passe
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Authentification a deux facteurs (2FA)</h2>
                      <p className="text-sm text-gray-500 mt-1">Ajoutez une couche de securite supplementaire</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Desactive
                    </span>
                  </div>
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-start gap-3">
                      <span className="text-amber-500">⚠️</span>
                      <p className="text-sm text-amber-700">Recommande pour la securite des donnees de vos patients</p>
                    </div>
                  </div>
                  <button className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Activer la 2FA
                  </button>
                </div>
              </>
            )}

            {/* === NOTIFICATIONS === */}
            {activeSection === 'notifications' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Notifications par email</h2>
                  <div className="divide-y divide-gray-100">
                    <NotificationToggle enabled={true} label="Nouvelle demande de RDV" />
                    <NotificationToggle enabled={true} label="Signalement de changement de sante" />
                    <NotificationToggle enabled={true} label="Demande modification plan alimentaire" />
                    <NotificationToggle enabled={true} label="Resume quotidien" />
                    <NotificationToggle enabled={false} label="Actualites NutriSensia" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Notifications push</h2>
                  <div className="divide-y divide-gray-100">
                    <NotificationToggle enabled={true} label="Nouveau message patient" />
                    <NotificationToggle enabled={true} label="Rappels de rendez-vous" />
                    <NotificationToggle enabled={true} label="Signalement de changement de sante" />
                    <NotificationToggle enabled={false} label="Demande modification plan alimentaire" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Heures calmes</h2>
                      <p className="text-sm text-gray-500">Pas de notifications push pendant ces heures</p>
                    </div>
                    <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-500 mb-1">De</label>
                      <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white">
                        <option>20:00</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-500 mb-1">A</label>
                      <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white">
                        <option>08:00</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Sauvegarder
                  </button>
                </div>
              </>
            )}

            {/* === AFFICHAGE === */}
            {activeSection === 'affichage' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Langue et region</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                      <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white">
                        <option>Francais</option>
                        <option>English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
                      <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white">
                        <option>Europe/Zurich (UTC+1)</option>
                        <option>Europe/Paris (UTC+1)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Premier jour de la semaine</label>
                      <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white">
                        <option>Lundi</option>
                        <option>Dimanche</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Apparence</h2>
                  <div className="flex gap-4">
                    <button className="flex-1 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-center">
                      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 mb-3" />
                      <p className="font-medium text-gray-800">Clair</p>
                    </button>
                    <button className="flex-1 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-center">
                      <div className="w-full h-16 bg-gray-800 rounded-lg mb-3" />
                      <p className="font-medium text-gray-800">Sombre</p>
                    </button>
                    <button className="flex-1 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-center">
                      <div className="w-full h-16 bg-gradient-to-b from-white to-gray-800 rounded-lg mb-3" />
                      <p className="font-medium text-gray-800">Systeme</p>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Sauvegarder
                  </button>
                </div>
              </>
            )}

            {/* === SESSIONS === */}
            {activeSection === 'sessions' && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Sessions actives</h2>
                  <div className="space-y-4">
                    {[
                      { device: 'MacBook Pro - Chrome', location: 'Neuchatel, Suisse', lastActive: 'Maintenant', current: true },
                      { device: 'iPhone 14 - Safari', location: 'Neuchatel, Suisse', lastActive: 'Il y a 2h', current: false },
                      { device: 'iPad - Safari', location: 'Berne, Suisse', lastActive: 'Hier', current: false },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{i === 0 ? '💻' : '📱'}</span>
                          <div>
                            <p className="font-medium text-gray-800">{session.device}</p>
                            <p className="text-sm text-gray-500">{session.location} &middot; {session.lastActive}</p>
                          </div>
                        </div>
                        {session.current ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Session actuelle</span>
                        ) : (
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">Deconnecter</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    Deconnecter toutes les autres sessions
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NutriProfileSettingsWireframe;
