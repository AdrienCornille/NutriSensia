import React, { useState } from 'react';

const NutriDashboardWireframe = () => {
  const [activeNav, setActiveNav] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
    { id: 'patients', label: 'Mes patients', icon: '👥', badge: null },
    { id: 'agenda', label: 'Agenda', icon: '📅', badge: 3 },
    { id: 'consultations', label: 'Mes consultations', icon: '📋' },
    { id: 'disponibilites', label: 'Mes disponibilites', icon: '🕐' },
    { id: 'messagerie', label: 'Messagerie', icon: '💬', badge: 5 },
  ];

  const navItemsBottom = [
    { id: 'parametres', label: 'Parametres', icon: '⚙' },
    { id: 'aide', label: 'Aide', icon: '?' },
    { id: 'profil', label: 'Profil', icon: '👤' },
  ];

  const todayAppointments = [
    {
      id: 1,
      time: '09:00',
      duration: '45 min',
      patient: 'Jean Dupont',
      initials: 'JD',
      type: 'Consultation de suivi',
      mode: 'visio',
      status: 'confirmed',
      isNext: true,
    },
    {
      id: 2,
      time: '10:30',
      duration: '30 min',
      patient: 'Marie Lambert',
      initials: 'ML',
      type: 'Consultation de suivi',
      mode: 'cabinet',
      status: 'confirmed',
      isNext: false,
    },
    {
      id: 3,
      time: '14:00',
      duration: '60 min',
      patient: 'Sophie Rochat',
      initials: 'SR',
      type: 'Premiere consultation',
      mode: 'cabinet',
      status: 'confirmed',
      isNext: false,
    },
  ];

  const pendingRequests = [
    {
      id: 1,
      patient: 'Lucas Favre',
      initials: 'LF',
      type: 'Consultation de suivi',
      date: '28 jan. 2026',
      time: '15:00',
      mode: 'visio',
      requestedAt: 'Il y a 2h',
    },
    {
      id: 2,
      patient: 'Amelie Blanc',
      initials: 'AB',
      type: 'Consultation approfondie',
      date: '30 jan. 2026',
      time: '09:30',
      mode: 'cabinet',
      requestedAt: 'Il y a 5h',
    },
    {
      id: 3,
      patient: 'Thomas Muller',
      initials: 'TM',
      type: 'Consultation urgente',
      date: '27 jan. 2026',
      time: '16:00',
      mode: 'visio',
      requestedAt: 'Hier',
    },
  ];

  const patientAlerts = [
    {
      id: 1,
      patient: 'Jean Dupont',
      initials: 'JD',
      type: 'change_report',
      message: 'Signalement : nouveau traitement medicamenteux',
      severity: 'high',
      time: 'Il y a 3h',
    },
    {
      id: 2,
      patient: 'Amelie Blanc',
      initials: 'AB',
      type: 'low_adherence',
      message: 'Adherence au plan : 35% cette semaine',
      severity: 'medium',
      time: 'Aujourd\'hui',
    },
    {
      id: 3,
      patient: 'Lucas Favre',
      initials: 'LF',
      type: 'no_logging',
      message: 'Pas d\'enregistrement de repas depuis 4 jours',
      severity: 'medium',
      time: 'Depuis le 22 jan.',
    },
    {
      id: 4,
      patient: 'Sophie Rochat',
      initials: 'SR',
      type: 'plan_modification',
      message: 'Demande de modification du plan en attente',
      severity: 'low',
      time: 'Hier',
    },
  ];

  const getAlertIcon = (type) => {
    const icons = {
      change_report: '🔴',
      low_adherence: '🟠',
      no_logging: '🟡',
      plan_modification: '🔵',
    };
    return icons[type] || '⚪';
  };

  const getAlertBorder = (severity) => {
    const colors = {
      high: 'border-l-red-500',
      medium: 'border-l-amber-500',
      low: 'border-l-blue-500',
    };
    return colors[severity] || 'border-l-gray-300';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">N</div>
            <div>
              <span className="font-semibold text-gray-800 text-lg">NutriSensia</span>
              <p className="text-xs text-emerald-600 font-medium">Espace Nutritionniste</p>
            </div>
          </div>
        </div>

        {/* Nav principale */}
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
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Nav secondaire */}
        <div className="p-4 border-t border-gray-200">
          <ul className="space-y-1">
            {navItemsBottom.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveNav(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50 transition-colors"
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
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Bonjour Lucie 👋</h1>
              <p className="text-sm text-gray-500 mt-1">Lundi 26 janvier 2026 &middot; 3 rendez-vous aujourd'hui</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">

          {/* Stats rapides */}
          <section className="mb-8">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">👥</span>
                  </div>
                  <span className="text-sm text-gray-500">Patients actifs</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">24</p>
                <p className="text-xs text-green-600 mt-1">+2 ce mois</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600">📅</span>
                  </div>
                  <span className="text-sm text-gray-500">RDV cette semaine</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">8</p>
                <p className="text-xs text-gray-500 mt-1">3 aujourd'hui</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">💬</span>
                  </div>
                  <span className="text-sm text-gray-500">Messages non lus</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">5</p>
                <p className="text-xs text-amber-600 mt-1">2 depuis hier</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600">🕐</span>
                  </div>
                  <span className="text-sm text-gray-500">Prochaine dispo</span>
                </div>
                <p className="text-xl font-bold text-gray-800">Mer 28 jan</p>
                <p className="text-xs text-gray-500 mt-1">09:00 - 12:00</p>
              </div>
            </div>
          </section>

          {/* Aujourd'hui */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Aujourd'hui</h2>

            <div className="grid grid-cols-3 gap-6">
              {/* RDV du jour */}
              <div className="col-span-2 bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Rendez-vous du jour</h3>
                  <span className="text-sm text-gray-500">{todayAppointments.length} consultations</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {todayAppointments.map((rdv) => (
                    <div
                      key={rdv.id}
                      className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        rdv.isNext ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      {/* Heure */}
                      <div className="w-16 text-center">
                        <p className="text-lg font-bold text-gray-800">{rdv.time}</p>
                        <p className="text-xs text-gray-500">{rdv.duration}</p>
                      </div>

                      {/* Separateur */}
                      <div className={`w-1 h-12 rounded-full ${rdv.isNext ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>

                      {/* Patient */}
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {rdv.initials}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{rdv.patient}</p>
                        <p className="text-sm text-gray-600">{rdv.type}</p>
                      </div>

                      {/* Mode + Actions */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          rdv.mode === 'visio' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {rdv.mode === 'visio' ? '📹 Visio' : '🏢 Cabinet'}
                        </span>
                        {rdv.isNext && rdv.mode === 'visio' && (
                          <button className="px-4 py-2 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                            Rejoindre
                          </button>
                        )}
                        {rdv.isNext && (
                          <span className="text-xs text-emerald-600 font-medium">← Prochain</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-100">
                  <button className="w-full py-2 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors">
                    Voir tout l'agenda →
                  </button>
                </div>
              </div>

              {/* Demandes en attente */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Demandes en attente</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    {pendingRequests.length}
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {req.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{req.patient}</p>
                          <p className="text-xs text-gray-500">{req.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{req.date} a {req.time}</span>
                        <span>{req.requestedAt}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 px-4 py-2 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                          Accepter
                        </button>
                        <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-100">
                  <button className="w-full py-2 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors">
                    Voir toutes les demandes →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Alertes patients */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Alertes patients</h2>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="divide-y divide-gray-100">
                {patientAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 flex items-center gap-4 border-l-4 ${getAlertBorder(alert.severity)} hover:bg-gray-50 cursor-pointer transition-colors`}
                  >
                    <span className="text-lg">{getAlertIcon(alert.type)}</span>
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {alert.initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{alert.patient}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Statistiques & Acces rapide */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Cette semaine</h2>

            <div className="grid grid-cols-4 gap-4">
              {/* Stats semaine */}
              <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">Consultations realisees</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">5</p>
                    <p className="text-xs text-green-600">+2 vs semaine derniere</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">Nouveaux patients</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">1</p>
                    <p className="text-xs text-gray-500">Sophie Rochat</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">Temps de reponse moyen</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">2.4h</p>
                    <p className="text-xs text-green-600">-30 min vs semaine derniere</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">Adherence moyenne patients</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">78%</p>
                    <p className="text-xs text-amber-600">-3% vs semaine derniere</p>
                  </div>
                </div>
              </div>

              {/* Acces rapide */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                {[
                  { icon: '👥', label: 'Mes patients', desc: '24 patients actifs', color: 'bg-blue-50 text-blue-600' },
                  { icon: '📋', label: 'Plans alimentaires', desc: '3 brouillons', color: 'bg-green-50 text-green-600' },
                  { icon: '🎓', label: 'Contenu educatif', desc: '12 articles', color: 'bg-purple-50 text-purple-600' },
                  { icon: '📊', label: 'Statistiques', desc: 'Vue globale', color: 'bg-amber-50 text-amber-600' },
                ].map((item, index) => (
                  <button key={index} className="bg-white rounded-xl p-6 border border-gray-200 text-left hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                      <span className="text-xl">{item.icon}</span>
                    </div>
                    <p className="font-medium text-gray-800">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default NutriDashboardWireframe;
