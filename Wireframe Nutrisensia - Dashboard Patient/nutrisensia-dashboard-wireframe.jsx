import React, { useState } from 'react';

const NutriSensiaDashboardWireframe = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
    { id: 'repas', label: 'Repas', icon: '🍽' },
    { id: 'plan', label: 'Plan alimentaire', icon: '📋' },
    { id: 'suivi', label: 'Suivi', icon: '📊' },
    { id: 'dossier', label: 'Mon dossier', icon: '📁' },
    { id: 'agenda', label: 'Agenda', icon: '📅' },
    { id: 'recettes', label: 'Recettes', icon: '👨‍🍳' },
    { id: 'aliments', label: 'Base aliments', icon: '🥗' },
    { id: 'messagerie', label: 'Messagerie', icon: '💬' },
    { id: 'contenu', label: 'Contenu exclusif', icon: '🎓' },
  ];

  const navItemsBottom = [
    { id: 'aide', label: 'Aide', icon: '?' },
    { id: 'profil', label: 'Profil', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
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
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">2</span>
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
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">JD</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">Jean Dupont</p>
              <p className="text-xs text-gray-500 truncate">jean.dupont@email.ch</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Bonjour Jean 👋</h1>
              <p className="text-gray-500 text-sm mt-1">Samedi 17 janvier 2026</p>
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
        <div className="flex-1 p-8 overflow-auto">
          {/* Zone primaire - Usage quotidien */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Aujourd'hui</h2>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Résumé calories/macros */}
              <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-800">Résumé nutritionnel</h3>
                  <span className="text-sm text-gray-500">vs plan alimentaire</span>
                </div>
                
                {/* Calories */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-gray-600">Calories</span>
                    <span className="text-sm font-medium">1,420 / 2,100 kcal</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{width: '68%'}}></div>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">Protéines</span>
                      <span className="text-xs font-medium text-blue-600">72%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{width: '72%'}}></div>
                    </div>
                    <p className="text-sm font-medium mt-2">86 / 120g</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">Glucides</span>
                      <span className="text-xs font-medium text-amber-600">65%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    <p className="text-sm font-medium mt-2">162 / 250g</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">Lipides</span>
                      <span className="text-xs font-medium text-rose-600">58%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{width: '58%'}}></div>
                    </div>
                    <p className="text-sm font-medium mt-2">41 / 70g</p>
                  </div>
                </div>
              </div>

              {/* Hydratation */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Hydratation</h3>
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                      <circle cx="64" cy="64" r="56" stroke="#3B82F6" strokeWidth="12" fill="none" 
                        strokeDasharray="352" strokeDashoffset="105" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">1.4L</span>
                      <span className="text-xs text-gray-500">/ 2L</span>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                    + Ajouter 250ml
                  </button>
                </div>
              </div>
            </div>

            {/* Quick actions - Enregistrement repas */}
            <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Enregistrer un repas</h3>
              <div className="grid grid-cols-4 gap-4">
                {['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'].map((meal, index) => {
                  const isLogged = index < 2;
                  return (
                    <button
                      key={meal}
                      className={`p-4 rounded-lg border-2 border-dashed transition-all ${
                        isLogged 
                          ? 'border-emerald-200 bg-emerald-50' 
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{meal}</span>
                        {isLogged && <span className="text-emerald-500">✓</span>}
                      </div>
                      <p className="text-xs text-gray-500 text-left">
                        {isLogged ? 'Enregistré' : 'Ajouter'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Zone secondaire - Usage hebdomadaire */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Cette semaine</h2>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Progression */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Progression</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-bold">🔥</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">12 jours consécutifs</p>
                      <p className="text-xs text-gray-500">Streak d'enregistrement</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">📉</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">-1.2 kg ce mois</p>
                      <p className="text-xs text-gray-500">Tendance positive</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 font-bold">🎯</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">85% d'adhérence</p>
                      <p className="text-xs text-gray-500">Plan alimentaire</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prochain RDV */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Prochain rendez-vous</h3>
                <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center border border-emerald-200">
                      <span className="text-xs text-emerald-600 font-medium">JAN</span>
                      <span className="text-lg font-bold text-gray-800">24</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Consultation de suivi</p>
                      <p className="text-sm text-gray-500">14:00 - 14:45</p>
                      <p className="text-xs text-emerald-600 mt-1">En visio</p>
                    </div>
                  </div>
                </div>
                <button className="w-full py-2 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors">
                  Voir tous les RDV →
                </button>
              </div>

              {/* Messages */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Messages</h3>
                  <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">2 non lus</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium">LM</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">Lucie Martin</p>
                      <p className="text-xs text-gray-600 truncate">J'ai ajusté votre plan pour...</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 2h</p>
                    </div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                  </div>
                </div>
                <button className="w-full py-2 mt-3 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors">
                  Ouvrir la messagerie →
                </button>
              </div>
            </div>

            {/* Objectifs de la semaine */}
            <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Objectifs de la semaine</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Enregistrer tous les repas', progress: 85, done: false },
                  { label: 'Atteindre 2L d\'eau/jour', progress: 100, done: true },
                  { label: '3 séances d\'activité', progress: 66, done: false },
                  { label: 'Essayer 2 nouvelles recettes', progress: 50, done: false },
                ].map((objective, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${objective.done ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">{objective.progress}%</span>
                      {objective.done && <span className="text-emerald-500">✓</span>}
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full rounded-full ${objective.done ? 'bg-emerald-500' : 'bg-emerald-400'}`} 
                        style={{width: `${objective.progress}%`}}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-700">{objective.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Zone tertiaire - Accès rapide */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Accès rapide</h2>
            
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: '👨‍🍳', label: 'Recettes', desc: '124 recettes', color: 'bg-orange-50 text-orange-600' },
                { icon: '🥗', label: 'Base aliments', desc: 'Rechercher', color: 'bg-green-50 text-green-600' },
                { icon: '🎓', label: 'Contenu exclusif', desc: '3 nouveaux', color: 'bg-purple-50 text-purple-600' },
                { icon: '📁', label: 'Mon dossier', desc: 'Anamnèse, objectifs', color: 'bg-blue-50 text-blue-600' },
              ].map((item, index) => (
                <button key={index} className="bg-white rounded-xl p-5 border border-gray-200 text-left hover:border-emerald-300 transition-colors">
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default NutriSensiaDashboardWireframe;
