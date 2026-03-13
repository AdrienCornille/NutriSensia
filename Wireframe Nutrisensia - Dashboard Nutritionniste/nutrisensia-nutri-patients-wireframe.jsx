import React, { useState } from 'react';

const NutriPatientsWireframe = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  const [activeNav, setActiveNav] = useState('patients');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
    { id: 'patients', label: 'Mes patients', icon: '👥' },
    { id: 'agenda', label: 'Agenda', icon: '📅' },
    { id: 'messagerie', label: 'Messagerie', icon: '💬' },
    { id: 'plans', label: 'Plans alimentaires', icon: '📋' },
    { id: 'recettes', label: 'Recettes', icon: '👨‍🍳' },
    { id: 'aliments', label: 'Base aliments', icon: '🥗' },
    { id: 'contenu', label: 'Contenu', icon: '🎓' },
    { id: 'facturation', label: 'Facturation', icon: '💳' },
  ];

  const navItemsBottom = [
    { id: 'aide', label: 'Aide', icon: '?' },
    { id: 'profil', label: 'Profil', icon: '👤' },
  ];

  const patients = [
    {
      id: 1,
      firstName: 'Jean',
      lastName: 'Dupont',
      initials: 'JD',
      email: 'jean.dupont@email.ch',
      phone: '+41 79 123 45 67',
      age: 37,
      startDate: '15 dec. 2025',
      status: 'active',
      lastConsultation: '15 jan. 2026',
      nextConsultation: '24 jan. 2026',
      totalConsultations: 3,
      objective: 'Perte de poids',
      currentWeight: '82.4 kg',
      targetWeight: '75 kg',
      adherence: 85,
      alerts: ['message'],
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'Lambert',
      initials: 'ML',
      email: 'marie.lambert@email.ch',
      phone: '+41 79 234 56 78',
      age: 28,
      startDate: '20 nov. 2025',
      status: 'active',
      lastConsultation: '10 jan. 2026',
      nextConsultation: '28 jan. 2026',
      totalConsultations: 5,
      objective: 'Reeducation alimentaire',
      currentWeight: '65.2 kg',
      targetWeight: '62 kg',
      adherence: 92,
      alerts: [],
    },
    {
      id: 3,
      firstName: 'Lucas',
      lastName: 'Favre',
      initials: 'LF',
      email: 'lucas.favre@email.ch',
      phone: '+41 79 345 67 89',
      age: 45,
      startDate: '5 jan. 2026',
      status: 'active',
      lastConsultation: '5 jan. 2026',
      nextConsultation: null,
      totalConsultations: 1,
      objective: 'Gestion du diabete type 2',
      currentWeight: '96.8 kg',
      targetWeight: '88 kg',
      adherence: 45,
      alerts: ['no_logging', 'low_adherence'],
    },
    {
      id: 4,
      firstName: 'Amelie',
      lastName: 'Blanc',
      initials: 'AB',
      email: 'amelie.blanc@email.ch',
      phone: '+41 79 456 78 90',
      age: 32,
      startDate: '1 oct. 2025',
      status: 'active',
      lastConsultation: '12 jan. 2026',
      nextConsultation: '30 jan. 2026',
      totalConsultations: 8,
      objective: 'Prise de masse musculaire',
      currentWeight: '57.1 kg',
      targetWeight: '60 kg',
      adherence: 35,
      alerts: ['low_adherence', 'change_report'],
    },
    {
      id: 5,
      firstName: 'Sophie',
      lastName: 'Rochat',
      initials: 'SR',
      email: 'sophie.rochat@email.ch',
      phone: '+41 79 567 89 01',
      age: 41,
      startDate: '26 jan. 2026',
      status: 'new',
      lastConsultation: null,
      nextConsultation: '26 jan. 2026',
      totalConsultations: 0,
      objective: 'Alimentation anti-inflammatoire',
      currentWeight: '71.5 kg',
      targetWeight: '68 kg',
      adherence: null,
      alerts: ['new_patient'],
    },
    {
      id: 6,
      firstName: 'Pierre',
      lastName: 'Morel',
      initials: 'PM',
      email: 'pierre.morel@email.ch',
      phone: '+41 79 678 90 12',
      age: 55,
      startDate: '15 mai 2025',
      status: 'paused',
      lastConsultation: '1 nov. 2025',
      nextConsultation: null,
      totalConsultations: 12,
      objective: 'Perte de poids',
      currentWeight: '89.2 kg',
      targetWeight: '82 kg',
      adherence: null,
      alerts: [],
    },
  ];

  const getAdherenceBadge = (adherence) => {
    if (adherence === null) return <span className="text-xs text-gray-400">N/A</span>;
    if (adherence >= 75) return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">{adherence}%</span>;
    if (adherence >= 50) return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">{adherence}%</span>;
    return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">{adherence}%</span>;
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-700',
      new: 'bg-blue-100 text-blue-700',
      paused: 'bg-gray-100 text-gray-600',
      ended: 'bg-red-100 text-red-700',
    };
    const labels = {
      active: 'Actif',
      new: 'Nouveau',
      paused: 'En pause',
      ended: 'Termine',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getAlertIcons = (alerts) => {
    const iconMap = {
      message: { icon: '💬', title: 'Message non lu' },
      no_logging: { icon: '⚠️', title: 'Pas d\'enregistrement recent' },
      low_adherence: { icon: '📉', title: 'Adherence faible' },
      change_report: { icon: '🔴', title: 'Signalement a traiter' },
      new_patient: { icon: '🆕', title: 'Nouveau patient' },
    };
    return alerts.map((a) => iconMap[a]).filter(Boolean);
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = !searchQuery ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Mes patients</h1>
              <p className="text-sm text-gray-500 mt-1">{patients.filter(p => p.status === 'active' || p.status === 'new').length} patients actifs sur {patients.length} total</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Toggle vue */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium ${viewMode === 'cards' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium ${viewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Liste
                </button>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Rechercher un patient par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'active', label: 'Actifs' },
                { id: 'new', label: 'Nouveaux' },
                { id: 'paused', label: 'En pause' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === f.id
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-800">{patients.length}</p>
              <p className="text-sm text-gray-500">Total patients</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-800">{patients.filter(p => p.status === 'active').length}</p>
              <p className="text-sm text-gray-500">Actifs</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-800">{patients.filter(p => p.status === 'new').length}</p>
              <p className="text-sm text-gray-500">Nouveaux</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-800">{patients.filter(p => p.alerts.length > 0).length}</p>
              <p className="text-sm text-gray-500">Avec alertes</p>
            </div>
          </div>

          {/* Cards view */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-2 gap-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {patient.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-gray-500">{patient.age} ans &middot; Depuis {patient.startDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAlertIcons(patient.alerts).map((a, i) => (
                        <span key={i} title={a.title} className="text-sm">{a.icon}</span>
                      ))}
                      {getStatusBadge(patient.status)}
                    </div>
                  </div>

                  {/* Objectif */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Objectif</p>
                    <p className="text-sm font-medium text-gray-700">{patient.objective}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500">Poids actuel</p>
                      <p className="text-sm font-semibold text-gray-800">{patient.currentWeight}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500">Objectif</p>
                      <p className="text-sm font-semibold text-gray-800">{patient.targetWeight}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500">Adherence</p>
                      <div className="mt-0.5">{getAdherenceBadge(patient.adherence)}</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span>{patient.totalConsultations} consultation{patient.totalConsultations !== 1 ? 's' : ''}</span>
                    <span>
                      {patient.nextConsultation
                        ? `Prochain RDV : ${patient.nextConsultation}`
                        : 'Aucun RDV prevu'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List view */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase">
                <span className="col-span-3">Patient</span>
                <span className="col-span-2">Objectif</span>
                <span className="col-span-1">Statut</span>
                <span className="col-span-1 text-center">Adherence</span>
                <span className="col-span-2">Dernier RDV</span>
                <span className="col-span-2">Prochain RDV</span>
                <span className="col-span-1 text-center">Alertes</span>
              </div>

              {/* Table rows */}
              <div className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {patient.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-gray-500">{patient.age} ans</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">{patient.objective}</p>
                    </div>
                    <div className="col-span-1">
                      {getStatusBadge(patient.status)}
                    </div>
                    <div className="col-span-1 text-center">
                      {getAdherenceBadge(patient.adherence)}
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">{patient.lastConsultation || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">{patient.nextConsultation || '-'}</p>
                    </div>
                    <div className="col-span-1 flex justify-center gap-1">
                      {getAlertIcons(patient.alerts).map((a, i) => (
                        <span key={i} title={a.title} className="text-sm">{a.icon}</span>
                      ))}
                      {patient.alerts.length === 0 && <span className="text-gray-300">-</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredPatients.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <p className="text-sm text-gray-600">Aucun patient ne correspond a votre recherche</p>
            </div>
          )}
        </div>
      </main>

      {/* Patient Quick View Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {selectedPatient.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedPatient.age} ans &middot; {selectedPatient.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">Objectif</p>
                  <p className="text-sm font-medium text-gray-800">{selectedPatient.objective}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">Suivi depuis</p>
                  <p className="text-sm font-medium text-gray-800">{selectedPatient.startDate}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">Poids actuel → objectif</p>
                  <p className="text-sm font-medium text-gray-800">{selectedPatient.currentWeight} → {selectedPatient.targetWeight}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">Adherence au plan</p>
                  <div className="mt-1">{getAdherenceBadge(selectedPatient.adherence)}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Alertes</p>
                {selectedPatient.alerts.length > 0 ? (
                  <div className="space-y-1">
                    {getAlertIcons(selectedPatient.alerts).map((a, i) => (
                      <p key={i} className="text-sm text-gray-600">{a.icon} {a.title}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune alerte</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">
                Voir le dossier complet
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Envoyer un message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutriPatientsWireframe;
