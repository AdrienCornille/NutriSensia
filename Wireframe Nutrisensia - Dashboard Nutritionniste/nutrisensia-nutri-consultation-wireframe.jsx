import React, { useState } from 'react';

const NutriConsultationWireframe = () => {
  const [activeNav, setActiveNav] = useState('consultations');
  const [activeView, setActiveView] = useState('create');
  const [showDocModal, setShowDocModal] = useState(false);

  const patient = {
    firstName: 'Jean',
    lastName: 'Dupont',
    initials: 'JD',
  };

  const appointment = {
    date: '24 janvier 2026',
    time: '14:00',
    duration: '45 min',
    type: 'Consultation de suivi',
    mode: 'visio',
  };

  // Donnees pre-consultation
  const preConsultData = {
    lastConsultation: {
      date: '15 jan. 2026',
      summary: 'Bon demarrage, -1.6 kg en 1 mois. Grignotage en baisse.',
      nextSteps: 'Augmenter l\'hydratation a 1.5L minimum. Continuer le plan actuel.',
      privateNotes: 'Patient motive mais stresse par le travail.',
    },
    objectives: [
      { title: 'Atteindre 80 kg', progress: 54, status: 'on_track' },
      { title: 'Boire 2L/jour', progress: 40, status: 'needs_attention' },
      { title: '3 seances sport/sem', progress: 67, status: 'in_progress' },
    ],
    weightChange: '-0.8 kg depuis derniere consultation',
    adherence: '85% cette semaine',
    changeReports: [
      { type: 'Medicament', message: 'Nouveau traitement prescrit par medecin' },
    ],
    unreadMessages: 2,
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'consultations', label: 'Consultations', icon: '📋' },
    { id: 'agenda', label: 'Agenda', icon: '📅' },
    { id: 'plans', label: 'Plans alimentaires', icon: '🍽' },
    { id: 'messagerie', label: 'Messagerie', icon: '💬' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'statistiques', label: 'Statistiques', icon: '📊' },
  ];

  const navItemsBottom = [
    { id: 'aide', label: 'Aide', icon: '?' },
    { id: 'profil', label: 'Profil', icon: '👤' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">N</div>
            <span className="font-semibold text-gray-800 text-lg">NutriSensia</span>
          </div>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeNav === item.id
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  {item.id === 'messagerie' && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Navigation secondaire */}
        <div className="p-4 border-t border-gray-200">
          <ul className="space-y-1">
            {navItemsBottom.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeNav === item.id
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium">LM</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">Lucie Martin</p>
              <p className="text-xs text-gray-500 truncate">Nutritionniste ASCA</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">← Retour</button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Compte-rendu de consultation</h1>
                <p className="text-sm text-gray-600">
                  {patient.firstName} {patient.lastName} &middot; {appointment.date} &middot; {appointment.time}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                appointment.mode === 'visio' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {appointment.mode === 'visio' ? '📹 Visio' : '🏢 Cabinet'} &middot; {appointment.duration}
              </span>
            </div>
          </div>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveView('prep')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'prep' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Preparation
            </button>
            <button
              onClick={() => setActiveView('create')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'create' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 Compte-rendu
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* === VUE PREPARATION === */}
          {activeView === 'prep' && (
            <div className="space-y-6">
              {/* Alertes */}
              {preConsultData.changeReports.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">⚠️ Signalements a traiter</h3>
                  {preConsultData.changeReports.map((report, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-red-100">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">{report.type}</span>
                      <p className="text-sm text-gray-600 mt-1">{report.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {/* Derniere consultation */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-4">Derniere consultation</h3>
                  <p className="text-xs text-gray-500 mb-2">{preConsultData.lastConsultation.date}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Resume</p>
                      <p className="text-sm text-gray-600">{preConsultData.lastConsultation.summary}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Prochaines etapes definies</p>
                      <p className="text-sm text-gray-600">{preConsultData.lastConsultation.nextSteps}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <p className="text-xs font-semibold text-red-400 mb-1">🔒 Notes privees</p>
                      <p className="text-xs text-gray-600 italic">{preConsultData.lastConsultation.privateNotes}</p>
                    </div>
                  </div>
                </div>

                {/* Objectifs */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-4">Objectifs en cours</h3>
                  <div className="space-y-4">
                    {preConsultData.objectives.map((obj, i) => {
                      const colors = {
                        on_track: { bar: 'bg-green-500', text: 'text-green-600' },
                        in_progress: { bar: 'bg-blue-500', text: 'text-blue-600' },
                        needs_attention: { bar: 'bg-amber-500', text: 'text-amber-600' },
                      };
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-700">{obj.title}</p>
                            <span className={`text-xs font-medium ${colors[obj.status].text}`}>{obj.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${colors[obj.status].bar}`} style={{ width: `${obj.progress}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Indicateurs cles */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">Evolution poids</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">-0.8</p>
                  <p className="text-xs text-gray-500 mt-1">kg depuis derniere consultation</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">Adherence plan</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">85%</p>
                  <p className="text-xs text-gray-500 mt-1">cette semaine</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">Messages echanges</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{preConsultData.unreadMessages}</p>
                  <p className="text-xs text-gray-500 mt-1">non lus</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">Signalements</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{preConsultData.changeReports.length}</p>
                  <p className="text-xs text-gray-500 mt-1">a traiter</p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setActiveView('create')}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                >
                  Commencer le compte-rendu →
                </button>
              </div>
            </div>
          )}

          {/* === VUE CREATION COMPTE-RENDU === */}
          {activeView === 'create' && (
            <div className="space-y-6">
              {/* Infos auto-remplies */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-emerald-600 font-medium">Patient :</span>
                    <span className="text-emerald-700 ml-1">{patient.firstName} {patient.lastName}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600 font-medium">Date :</span>
                    <span className="text-emerald-700 ml-1">{appointment.date}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600 font-medium">Duree :</span>
                    <span className="text-emerald-700 ml-1">{appointment.duration}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600 font-medium">Type :</span>
                    <span className="text-emerald-700 ml-1">{appointment.type}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600 font-medium">Mode :</span>
                    <span className="text-emerald-700 ml-1">{appointment.mode === 'visio' ? 'Visio' : 'Cabinet'}</span>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-6">
                  {/* Resume */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume de la consultation *
                    </label>
                    <textarea
                      placeholder="Decrivez les points abordes, les progres observes et les ajustements decides..."
                      className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none h-32 text-sm"
                      defaultValue="Deuxieme consultation de suivi. Bonne progression : -0.8 kg depuis la derniere seance. Le patient respecte bien le plan alimentaire (adherence 85%). Le grignotage du soir a significativement diminue. Nouveau traitement medicamenteux a prendre en compte."
                    />
                  </div>

                  {/* Points cles */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points cles
                    </label>
                    <div className="space-y-2">
                      {[
                        'Poids : 82.4 kg (-0.8 kg en 2 semaines)',
                        'Grignotage soir reduit de 70%',
                        'Hydratation : 1.4L/jour (objectif 2L non atteint)',
                        'Nouveau medicament : verifier interactions avec plan',
                      ].map((point, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-emerald-500">•</span>
                          <input
                            type="text"
                            defaultValue={point}
                            className="flex-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                          />
                          <button className="p-1 text-gray-400 hover:text-red-500">✕</button>
                        </div>
                      ))}
                      <button className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700 mt-1">
                        + Ajouter un point cle
                      </button>
                    </div>
                  </div>

                  {/* Prochaines etapes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prochaines etapes
                    </label>
                    <textarea
                      placeholder="Definissez les actions et objectifs pour la periode a venir..."
                      className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none h-24 text-sm"
                      defaultValue="1. Augmenter hydratation a 1.5L minimum (objectif intermediaire)
2. Verifier compatibilite nouveau medicament avec plan
3. Maintenir la reduction du grignotage
4. Prochaine consultation dans 2 semaines"
                    />
                  </div>

                  {/* Notes privees */}
                  <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                    <label className="flex items-center gap-2 text-sm font-medium text-red-700 mb-2">
                      🔒 Notes privees
                      <span className="text-xs font-normal text-red-500">(non visibles par le patient)</span>
                    </label>
                    <textarea
                      placeholder="Notes confidentielles sur le patient..."
                      className="w-full p-4 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none h-20 text-sm bg-white"
                      defaultValue="Stress professionnel en augmentation. Le patient mentionne des insomnies. A surveiller car risque de rechute grignotage. Envisager d'aborder la gestion du stress a la prochaine seance."
                    />
                  </div>

                  {/* Documents attaches */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documents attaches
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1 p-4 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-emerald-300 cursor-pointer transition-colors">
                        <button
                          onClick={() => setShowDocModal(true)}
                          className="text-sm text-gray-600"
                        >
                          📎 Joindre un document (PDF, image)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  Sauvegarder en brouillon
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveView('prep')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Voir la preparation
                  </button>
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">
                    Enregistrer le compte-rendu
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Document Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Joindre un document</h3>
              <button onClick={() => setShowDocModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">✕</button>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-4 hover:border-emerald-300 cursor-pointer transition-colors">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📄</span>
              </div>
              <p className="text-sm font-medium text-gray-800">Glissez un fichier ici</p>
              <p className="text-xs text-gray-500 mt-1">ou cliquez pour parcourir (PDF, images, max 10 Mo)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
                <option>Analyses</option>
                <option>Plans</option>
                <option>Ressources</option>
                <option>Autre</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
              <input
                type="text"
                placeholder="Description du document..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDocModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Annuler
              </button>
              <button className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">
                Joindre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutriConsultationWireframe;
