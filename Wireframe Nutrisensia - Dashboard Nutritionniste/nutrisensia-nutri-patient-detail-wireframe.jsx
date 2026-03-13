import React, { useState } from 'react';

const NutriPatientDetailWireframe = () => {
  const [activeTab, setActiveTab] = useState('synthese');
  const [expandedSection, setExpandedSection] = useState('identite');

  const patient = {
    firstName: 'Jean',
    lastName: 'Dupont',
    initials: 'JD',
    age: 37,
    email: 'jean.dupont@email.ch',
    phone: '+41 79 123 45 67',
    startDate: '15 dec. 2025',
    status: 'active',
    objective: 'Perte de poids progressive -5kg',
    currentWeight: 82.4,
    targetWeight: 75,
    startWeight: 85.2,
    height: 178,
    bmi: 26.0,
    adherence: 85,
    streak: 12,
  };

  const tabs = [
    { id: 'synthese', label: 'Synthese', icon: '📊' },
    { id: 'dossier', label: 'Dossier', icon: '📁' },
    { id: 'plan', label: 'Plan alimentaire', icon: '🍽' },
    { id: 'suivi', label: 'Suivi', icon: '📈' },
    { id: 'consultations', label: 'Consultations', icon: '📋' },
    { id: 'messages', label: 'Messages', icon: '💬' },
  ];

  const anamneSections = [
    {
      id: 'identite',
      label: 'Identite & Contact',
      icon: '👤',
      fields: [
        { label: 'Nom complet', value: 'Jean Dupont' },
        { label: 'Date de naissance', value: '12 mars 1988 (37 ans)' },
        { label: 'Situation familiale', value: 'Marie, 2 enfants' },
        { label: 'Profession', value: 'Ingenieur informatique' },
        { label: 'Email', value: 'jean.dupont@email.ch' },
        { label: 'Telephone', value: '+41 79 123 45 67' },
      ],
    },
    {
      id: 'morphologie',
      label: 'Donnees morphologiques',
      icon: '📐',
      fields: [
        { label: 'Taille', value: '178 cm' },
        { label: 'Poids initial', value: '85.2 kg' },
        { label: 'IMC initial', value: '26.9 (Surpoids leger)' },
        { label: 'Tour de taille', value: '94 cm' },
        { label: 'Tour de hanches', value: '98 cm' },
      ],
    },
    {
      id: 'sante',
      label: 'Historique medical',
      icon: '🏥',
      fields: [
        { label: 'Pathologies', value: 'Aucune' },
        { label: 'Allergies', value: 'Arachides' },
        { label: 'Intolerances', value: 'Lactose (legere)' },
        { label: 'Medicaments', value: 'Aucun' },
        { label: 'Complements', value: 'Vitamine D (hiver)' },
        { label: 'Antecedents familiaux', value: 'Diabete type 2 (pere)' },
      ],
    },
    {
      id: 'habitudes',
      label: 'Habitudes alimentaires',
      icon: '🍽',
      fields: [
        { label: 'Repas par jour', value: '3 + 1 collation' },
        { label: 'Grignotage', value: 'Frequent (soir, devant la TV)' },
        { label: 'Hydratation', value: '~1L/jour (insuffisant)' },
        { label: 'Alcool', value: 'Occasionnel (week-end)' },
        { label: 'Aliments detestes', value: 'Choux de Bruxelles, foie' },
      ],
    },
    {
      id: 'lifestyle',
      label: 'Mode de vie',
      icon: '🏃',
      fields: [
        { label: 'Activite professionnelle', value: 'Sedentaire (bureau)' },
        { label: 'Sport', value: 'Course a pied 2x/semaine' },
        { label: 'Sommeil', value: '6-7h (insuffisant)' },
        { label: 'Stress', value: 'Modere (travail)' },
        { label: 'Tabac', value: 'Non-fumeur' },
      ],
    },
    {
      id: 'motivation',
      label: 'Motivation & Objectifs',
      icon: '🎯',
      fields: [
        { label: 'Raison de consultation', value: 'Perte de poids pour la sante' },
        { label: 'Objectif poids', value: '75 kg (-10 kg)' },
        { label: 'Motivation', value: 'Sante, energie, exemple pour les enfants' },
        { label: 'Freins identifies', value: 'Grignotage le soir, manque de temps cuisine' },
        { label: 'Soutien familial', value: 'Epouse motivee, cuisine ensemble' },
      ],
    },
  ];

  const objectives = [
    { id: 1, title: 'Atteindre 80 kg', category: 'Poids', current: 82.4, target: 80, start: 85.2, status: 'on_track', progress: 54 },
    { id: 2, title: 'Enregistrer tous les repas', category: 'Habitude', current: 85, target: 100, start: 0, status: 'in_progress', progress: 85 },
    { id: 3, title: 'Boire 2L d\'eau par jour', category: 'Habitude', current: 1.4, target: 2, start: 1, status: 'needs_attention', progress: 40 },
    { id: 4, title: '3 seances de sport/semaine', category: 'Activite', current: 2, target: 3, start: 2, status: 'in_progress', progress: 67 },
  ];

  const recentMeals = [
    { date: 'Aujourd\'hui', meals: ['Petit-dej: Porridge, banane, miel', 'Dejeuner: Poulet, riz, brocoli'], total: 1420 },
    { date: 'Hier', meals: ['Petit-dej: Tartines, confiture', 'Dejeuner: Salade composee', 'Diner: Pates bolognaise'], total: 2050 },
    { date: 'Avant-hier', meals: ['Petit-dej: Smoothie', 'Dejeuner: Sandwich', 'Diner: Saumon, quinoa'], total: 1890 },
  ];

  const consultations = [
    {
      id: 1,
      date: '15 jan. 2026',
      type: 'Consultation de suivi',
      duration: '30 min',
      mode: 'visio',
      summary: 'Bon demarrage, -1.6 kg en 1 mois. Grignotage en baisse. Hydratation a ameliorer.',
      keyPoints: ['Objectif -2kg atteint', 'Grignotage reduit de 50%', 'Hydratation encore insuffisante'],
      nextSteps: 'Augmenter l\'hydratation a 1.5L minimum. Continuer le plan actuel.',
      privateNotes: 'Patient motive mais stresse par le travail. Surveiller le grignotage compensatoire.',
    },
    {
      id: 2,
      date: '15 dec. 2025',
      type: 'Premiere consultation',
      duration: '60 min',
      mode: 'cabinet',
      summary: 'Anamnese complete. Objectif: -10kg progressif. Plan initial mis en place.',
      keyPoints: ['IMC 26.9 - surpoids leger', 'Alimentation desequilibree', 'Bonne motivation'],
      nextSteps: 'Commencer le plan alimentaire. S\'hydrater davantage.',
      privateNotes: 'Premier contact positif. Le patient semble tres motive.',
    },
  ];

  const weightData = [85.2, 84.8, 84.5, 84.1, 83.7, 83.2, 82.8, 82.4];
  const weightDates = ['15/12', '22/12', '29/12', '05/01', '12/01', '15/01', '19/01', '25/01'];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Header patient */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4 mb-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              ← Retour
            </button>
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {patient.initials}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-gray-800">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Actif</span>
                </div>
                <p className="text-sm text-gray-600">
                  {patient.age} ans &middot; Suivi depuis {patient.startDate} &middot; {patient.objective}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                💬 Message
              </button>
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
                📋 Nouveau compte-rendu
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* === TAB SYNTHESE === */}
          {activeTab === 'synthese' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">Poids actuel</p>
                  <p className="text-3xl font-bold text-gray-800">{patient.currentWeight}</p>
                  <p className="text-sm text-gray-500">kg</p>
                  <p className="text-xs text-emerald-600 mt-1">-2.8 kg depuis le debut</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">Objectif</p>
                  <p className="text-3xl font-bold text-gray-800">{patient.targetWeight}</p>
                  <p className="text-sm text-gray-500">kg</p>
                  <p className="text-xs text-gray-500 mt-1">Reste -7.4 kg</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">IMC</p>
                  <p className="text-3xl font-bold text-gray-800">{patient.bmi}</p>
                  <p className="text-sm text-gray-500">&nbsp;</p>
                  <p className="text-xs text-amber-700 mt-1">Surpoids leger</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">Adherence plan</p>
                  <p className="text-3xl font-bold text-gray-800">{patient.adherence}%</p>
                  <p className="text-sm text-gray-500">&nbsp;</p>
                  <p className="text-xs text-emerald-600 mt-1">Bonne adherence</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">Streak</p>
                  <p className="text-3xl font-bold text-gray-800">{patient.streak}j</p>
                  <p className="text-sm text-gray-500">&nbsp;</p>
                  <p className="text-xs text-gray-500 mt-1">Jours consecutifs</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Evolution poids mini */}
                <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolution du poids</h3>
                  <div className="h-48 flex items-end gap-2 px-4">
                    {weightData.map((w, i) => {
                      const min = Math.min(...weightData) - 1;
                      const max = Math.max(...weightData) + 1;
                      const height = ((w - min) / (max - min)) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-medium text-gray-700">{w}</span>
                          <div
                            className={`w-full rounded-t-md ${i === weightData.length - 1 ? 'bg-emerald-500' : 'bg-emerald-200'}`}
                            style={{ height: `${height}%` }}
                          ></div>
                          <span className="text-xs text-gray-500">{weightDates[i]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Objectif : {patient.targetWeight} kg</span>
                    <span>Tendance : -0.7 kg/semaine</span>
                  </div>
                </div>

                {/* Objectifs en cours */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Objectifs en cours</h3>
                  <div className="space-y-4">
                    {objectives.map((obj) => {
                      const statusColors = {
                        on_track: 'text-emerald-600',
                        in_progress: 'text-blue-600',
                        needs_attention: 'text-amber-600',
                      };
                      return (
                        <div key={obj.id}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-700">{obj.title}</p>
                            <span className={`text-xs font-medium ${statusColors[obj.status]}`}>{obj.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                obj.status === 'on_track' ? 'bg-emerald-500' :
                                obj.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${obj.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{obj.category}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Repas recents + Derniere consultation */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Repas recents</h3>
                  <div className="space-y-4">
                    {recentMeals.map((day, i) => (
                      <div key={i} className="border-l-2 border-emerald-200 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-800">{day.date}</p>
                          <span className="text-sm font-medium text-gray-600">{day.total} kcal</span>
                        </div>
                        {day.meals.map((meal, j) => (
                          <p key={j} className="text-xs text-gray-500">{meal}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Derniere consultation</h3>
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-emerald-700">{consultations[0].date}</p>
                      <span className="text-xs text-emerald-600">{consultations[0].duration} &middot; {consultations[0].mode}</span>
                    </div>
                    <p className="text-sm text-emerald-700">{consultations[0].summary}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Prochaines etapes</p>
                    <p className="text-sm text-gray-600">{consultations[0].nextSteps}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-red-400 uppercase mb-1">🔒 Notes privees</p>
                    <p className="text-xs text-gray-500 italic">{consultations[0].privateNotes}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === TAB DOSSIER === */}
          {activeTab === 'dossier' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Anamnese</h2>
                  <p className="text-sm text-gray-600">Version 1 &middot; Creee le 15 dec. 2025</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Mettre a jour
                  </button>
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
                    + Ajouter un document
                  </button>
                </div>
              </div>

              {anamneSections.map((section) => (
                <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{section.icon}</span>
                      <span className="font-medium text-gray-800">{section.label}</span>
                      <span className="text-xs text-gray-500">{section.fields.length} champs</span>
                    </div>
                    <span className="text-gray-400">{expandedSection === section.id ? '▼' : '▶'}</span>
                  </button>

                  {expandedSection === section.id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-3">
                        {section.fields.map((field, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-500">{field.label}</p>
                            <p className="text-sm font-medium text-gray-800">{field.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* === TAB SUIVI === */}
          {activeTab === 'suivi' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Poids', value: `${patient.currentWeight} kg`, sub: '-2.8 kg total', icon: '⚖️' },
                  { label: 'Hydratation moy.', value: '1.4 L/jour', sub: 'Objectif: 2L', icon: '💧' },
                  { label: 'Energie moy.', value: '3.8/5', sub: 'Cette semaine', icon: '⚡' },
                  { label: 'Sport', value: '2x/semaine', sub: 'Objectif: 3x', icon: '🏃' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{stat.icon}</span>
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Graphique poids detaille */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Evolution du poids</h3>
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                    {['1 sem', '1 mois', '3 mois', 'Tout'].map((period) => (
                      <button key={period} className="px-6 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700">
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-48 flex items-end gap-3 px-4 border-b border-gray-100 pb-4">
                  {weightData.map((w, i) => {
                    const min = 74;
                    const max = 86;
                    const height = ((w - min) / (max - min)) * 100;
                    const targetHeight = ((patient.targetWeight - min) / (max - min)) * 100;
                    return (
                      <div key={i} className="flex-1 relative">
                        <div className="absolute bottom-0 w-full border-b-2 border-dashed border-emerald-300" style={{ bottom: `${targetHeight}%` }}></div>
                        <div className="flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-xs font-medium text-gray-700">{w}</span>
                          <div
                            className={`w-3 h-3 rounded-full ${i === weightData.length - 1 ? 'bg-emerald-500' : 'bg-emerald-300'}`}
                            style={{ marginBottom: `${height}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-4">
                  {weightDates.map((d) => <span key={d}>{d}</span>)}
                </div>
              </div>

              {/* Bien-etre */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Bien-etre (7 derniers jours)</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Energie', values: [4, 3, 4, 5, 3, 4, 4], unit: '/5' },
                      { label: 'Sommeil', values: [7, 6.5, 7, 8, 6, 7, 7.5], unit: 'h' },
                      { label: 'Humeur', values: ['😊', '😐', '😊', '😄', '😐', '😊', '😊'], unit: '' },
                    ].map((metric, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-20">{metric.label}</span>
                        <div className="flex gap-2 flex-1">
                          {metric.values.map((v, j) => (
                            <div key={j} className="flex-1 text-center">
                              <span className="text-sm">{v}{metric.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 text-xs text-gray-500 pl-24">
                      {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                        <span key={d} className="flex-1 text-center">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Activite physique (cette semaine)</h3>
                  <div className="space-y-3">
                    {[
                      { day: 'Lundi', activity: 'Course a pied', duration: '45 min', calories: 420, intensity: 'Modere' },
                      { day: 'Mercredi', activity: 'Course a pied', duration: '30 min', calories: 290, intensity: 'Intense' },
                    ].map((act, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{act.day} - {act.activity}</p>
                          <p className="text-xs text-gray-500">{act.duration} &middot; {act.intensity}</p>
                        </div>
                        <span className="text-sm font-medium text-amber-700">{act.calories} kcal</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 text-center pt-2">2/3 seances cette semaine</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === TAB CONSULTATIONS === */}
          {activeTab === 'consultations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Historique des consultations</h2>
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
                  + Nouveau compte-rendu
                </button>
              </div>

              {consultations.map((consult) => (
                <div key={consult.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-50 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-xs text-emerald-600 font-medium">{consult.date.split(' ')[1]?.toUpperCase()}</span>
                        <span className="text-xl font-bold text-gray-800">{consult.date.split(' ')[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{consult.type}</p>
                        <p className="text-sm text-gray-600">{consult.duration} &middot; {consult.mode === 'visio' ? '📹 Visio' : '🏢 Cabinet'}</p>
                      </div>
                    </div>
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">Modifier</button>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Resume</p>
                    <p className="text-sm text-gray-600">{consult.summary}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Points cles</p>
                    <ul className="space-y-1">
                      {consult.keyPoints.map((point, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Prochaines etapes</p>
                    <p className="text-sm text-gray-600">{consult.nextSteps}</p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <p className="text-xs font-semibold text-red-400 uppercase mb-1">🔒 Notes privees (non visibles par le patient)</p>
                    <p className="text-sm text-red-800 italic">{consult.privateNotes}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === TAB PLAN === */}
          {activeTab === 'plan' && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍽</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Plan alimentaire</h3>
              <p className="text-sm text-gray-600 mb-4">Voir le wireframe dedie : nutrisensia-nutri-meal-plan-wireframe.jsx</p>
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                Creer un plan alimentaire
              </button>
            </div>
          )}

          {/* === TAB MESSAGES === */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Messagerie</h3>
              <p className="text-sm text-gray-600 mb-4">La messagerie est deja implementee et fonctionnelle.</p>
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                Ouvrir la conversation avec Jean
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NutriPatientDetailWireframe;
