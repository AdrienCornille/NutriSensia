import React, { useState } from 'react';

const BiometricTrackingWireframe = () => {
  const [activeTab, setActiveTab] = useState('poids');
  const [timeRange, setTimeRange] = useState('1M');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState(null);

  const tabs = [
    { id: 'poids', label: 'Poids', icon: '⚖️' },
    { id: 'mensurations', label: 'Mensurations', icon: '📏' },
    { id: 'bien-etre', label: 'Bien-être', icon: '🌟' },
    { id: 'activite', label: 'Activité', icon: '🏃' },
    { id: 'hydratation', label: 'Hydratation', icon: '💧' },
  ];

  const timeRanges = ['1S', '1M', '3M', '6M', '1A', 'Tout'];

  const weightData = {
    current: 78.4,
    initial: 82.0,
    goal: 75.0,
    change: -3.6,
    changePercent: -4.4,
    trend: 'down',
    history: [
      { date: '17 Jan', value: 78.4 },
      { date: '15 Jan', value: 78.6 },
      { date: '12 Jan', value: 78.9 },
      { date: '10 Jan', value: 79.1 },
      { date: '8 Jan', value: 79.0 },
      { date: '5 Jan', value: 79.4 },
      { date: '3 Jan', value: 79.8 },
      { date: '1 Jan', value: 80.0 },
    ],
  };

  const mensurationsData = [
    { label: 'Tour de poitrine', current: 98, initial: 100, unit: 'cm', change: -2 },
    { label: 'Tour de taille', current: 84, initial: 89, unit: 'cm', change: -5 },
    { label: 'Tour de hanches', current: 96, initial: 98, unit: 'cm', change: -2 },
    { label: 'Tour de cuisse', current: 56, initial: 58, unit: 'cm', change: -2 },
    { label: 'Tour de bras', current: 32, initial: 31, unit: 'cm', change: +1 },
  ];

  const wellbeingData = {
    today: {
      energy: 4,
      sleep: 7.5,
      mood: 'good',
      digestion: 'normal',
    },
    history: [
      { date: '17 Jan', energy: 4, sleep: 7.5, mood: 'good' },
      { date: '16 Jan', energy: 3, sleep: 6.0, mood: 'neutral' },
      { date: '15 Jan', energy: 5, sleep: 8.0, mood: 'great' },
      { date: '14 Jan', energy: 4, sleep: 7.0, mood: 'good' },
      { date: '13 Jan', energy: 2, sleep: 5.5, mood: 'low' },
    ],
  };

  const activityData = {
    thisWeek: {
      sessions: 3,
      totalMinutes: 150,
      calories: 620,
    },
    activities: [
      { date: '17 Jan', type: 'Course à pied', duration: 45, intensity: 'moderate', calories: 380 },
      { date: '15 Jan', type: 'Musculation', duration: 60, intensity: 'high', calories: 320 },
      { date: '13 Jan', type: 'Yoga', duration: 45, intensity: 'low', calories: 120 },
    ],
  };

  const hydrationData = {
    today: 1.4,
    goal: 2.0,
    weekAverage: 1.8,
    history: [
      { date: 'Lun', value: 2.0, goal: 2.0 },
      { date: 'Mar', value: 1.8, goal: 2.0 },
      { date: 'Mer', value: 2.2, goal: 2.0 },
      { date: 'Jeu', value: 1.5, goal: 2.0 },
      { date: 'Ven', value: 1.4, goal: 2.0 },
      { date: 'Sam', value: null, goal: 2.0 },
      { date: 'Dim', value: null, goal: 2.0 },
    ],
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const moodEmojis = {
    great: { emoji: '😄', label: 'Excellent' },
    good: { emoji: '🙂', label: 'Bien' },
    neutral: { emoji: '😐', label: 'Neutre' },
    low: { emoji: '😔', label: 'Bas' },
    bad: { emoji: '😢', label: 'Difficile' },
  };

  const digestionOptions = [
    { id: 'normal', label: 'Normal', emoji: '✓' },
    { id: 'bloating', label: 'Ballonnements', emoji: '🎈' },
    { id: 'constipation', label: 'Constipation', emoji: '⏸' },
    { id: 'diarrhea', label: 'Diarrhée', emoji: '⚡' },
    { id: 'cramps', label: 'Crampes', emoji: '💫' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                ← Retour
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Mon suivi</h1>
                <p className="text-sm text-gray-500">Suivez votre progression</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              <span>🔗</span>
              <span className="text-sm font-medium">Connecter un appareil</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Weight Tab */}
        {activeTab === 'poids' && (
          <div className="space-y-6">
            {/* Weight summary cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Poids actuel</p>
                <p className="text-3xl font-bold text-gray-800">{weightData.current} <span className="text-lg font-normal text-gray-400">kg</span></p>
                <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                  <span>↓</span> {Math.abs(weightData.change)} kg depuis le début
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Objectif</p>
                <p className="text-3xl font-bold text-emerald-600">{weightData.goal} <span className="text-lg font-normal text-gray-400">kg</span></p>
                <p className="text-sm text-gray-500 mt-2">
                  Encore {(weightData.current - weightData.goal).toFixed(1)} kg
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Progression</p>
                <p className="text-3xl font-bold text-blue-600">{Math.round(((weightData.initial - weightData.current) / (weightData.initial - weightData.goal)) * 100)}%</p>
                <div className="h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.round(((weightData.initial - weightData.current) / (weightData.initial - weightData.goal)) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Tendance</p>
                <p className="text-3xl font-bold text-emerald-600">-0.4 <span className="text-lg font-normal text-gray-400">kg/sem</span></p>
                <p className="text-sm text-gray-500 mt-2">
                  Rythme idéal 👍
                </p>
              </div>
            </div>

            {/* Weight chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-800">Évolution du poids</h2>
                <div className="flex items-center gap-2">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        timeRange === range
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart placeholder */}
              <div className="relative h-64 bg-gray-50 rounded-lg overflow-hidden">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-4 text-xs text-gray-400">
                  <span>82 kg</span>
                  <span>80 kg</span>
                  <span>78 kg</span>
                  <span>76 kg</span>
                  <span>74 kg</span>
                </div>
                
                {/* Chart area */}
                <div className="ml-12 h-full relative">
                  {/* Goal line */}
                  <div className="absolute w-full border-t-2 border-dashed border-emerald-300" style={{ bottom: '20%' }}>
                    <span className="absolute right-0 -top-5 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Objectif: 75 kg</span>
                  </div>
                  
                  {/* Simulated line chart */}
                  <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <path
                      d="M 0 20 Q 50 25, 100 40 T 200 60 T 300 75 T 400 85"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 0 20 Q 50 25, 100 40 T 200 60 T 300 75 T 400 85 L 400 200 L 0 200 Z"
                      fill="url(#gradient)"
                      opacity="0.2"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Data points */}
                    <circle cx="400" cy="85" r="6" fill="#10B981" />
                    <circle cx="400" cy="85" r="10" fill="#10B981" opacity="0.3" />
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-12 right-0 flex justify-between px-4 py-2 text-xs text-gray-400">
                  <span>1 Jan</span>
                  <span>5 Jan</span>
                  <span>10 Jan</span>
                  <span>15 Jan</span>
                  <span>17 Jan</span>
                </div>
              </div>
            </div>

            {/* Recent entries + Add */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="font-semibold text-gray-800 mb-4">Dernières pesées</h2>
                <div className="space-y-3">
                  {weightData.history.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-600">⚖️</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{entry.value} kg</p>
                          <p className="text-sm text-gray-500">{entry.date} 2026</p>
                        </div>
                      </div>
                      {index > 0 && (
                        <span className={`text-sm font-medium ${
                          entry.value < weightData.history[index - 1]?.value 
                            ? 'text-emerald-600' 
                            : entry.value > weightData.history[index - 1]?.value
                            ? 'text-amber-600'
                            : 'text-gray-400'
                        }`}>
                          {entry.value < weightData.history[index - 1]?.value ? '↓' : entry.value > weightData.history[index - 1]?.value ? '↑' : '='} 
                          {Math.abs(entry.value - weightData.history[index - 1]?.value).toFixed(1)} kg
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="font-semibold text-gray-800 mb-4">Ajouter une pesée</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue="78.4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      defaultValue="2026-01-17"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button className="w-full py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                    Enregistrer
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500">💡</span>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Balance connectée</p>
                      <p className="text-xs text-blue-600 mt-1">Synchronisez votre balance pour un suivi automatique.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensurations Tab */}
        {activeTab === 'mensurations' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
              <h2 className="font-semibold text-lg mb-2">Évolution globale</h2>
              <p className="text-emerald-100">
                Vous avez perdu <span className="font-bold text-white">10 cm</span> au total depuis le début de votre suivi.
              </p>
            </div>

            {/* Mensurations grid */}
            <div className="grid grid-cols-2 gap-4">
              {mensurationsData.map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {item.current} <span className="text-base font-normal text-gray-400">{item.unit}</span>
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      item.change < 0 ? 'bg-emerald-100 text-emerald-700' : 
                      item.change > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.change > 0 ? '+' : ''}{item.change} {item.unit}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Départ: {item.initial} {item.unit}</span>
                      <span>Actuel: {item.current} {item.unit}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.change < 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.abs(item.change) * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add new measurement */}
              <button
                onClick={() => openAddModal('mensuration')}
                className="bg-white rounded-xl p-5 border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-emerald-600"
              >
                <span className="text-3xl mb-2">+</span>
                <span className="font-medium">Ajouter une mesure</span>
              </button>
            </div>
          </div>
        )}

        {/* Wellbeing Tab */}
        {activeTab === 'bien-etre' && (
          <div className="space-y-6">
            {/* Today's wellbeing */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Comment vous sentez-vous aujourd'hui ?</h2>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Energy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Niveau d'énergie</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          wellbeingData.today.energy === level
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Épuisé</span>
                    <span>Plein d'énergie</span>
                  </div>
                </div>

                {/* Sleep */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Heures de sommeil</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.5"
                      defaultValue={wellbeingData.today.sleep}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-gray-500">heures</span>
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Humeur</label>
                  <div className="flex gap-2">
                    {Object.entries(moodEmojis).map(([key, { emoji, label }]) => (
                      <button
                        key={key}
                        className={`flex-1 py-3 rounded-lg flex flex-col items-center transition-colors ${
                          wellbeingData.today.mood === key
                            ? 'bg-emerald-100 border-2 border-emerald-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-xs text-gray-600 mt-1">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Digestion */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Digestion</label>
                  <div className="flex flex-wrap gap-2">
                    {digestionOptions.map((option) => (
                      <button
                        key={option.id}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          wellbeingData.today.digestion === option.id
                            ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option.emoji} {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                Enregistrer mon bien-être
              </button>
            </div>

            {/* Wellbeing history */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Historique</h2>
              <div className="space-y-3">
                {wellbeingData.history.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-800">{entry.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Énergie</p>
                        <p className="font-medium text-amber-600">{entry.energy}/5</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Sommeil</p>
                        <p className="font-medium text-blue-600">{entry.sleep}h</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Humeur</p>
                        <p className="text-2xl">{moodEmojis[entry.mood]?.emoji}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correlations insight */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">Observation</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Votre niveau d'énergie semble meilleur les jours où vous dormez plus de 7 heures. 
                    Essayez de maintenir ce rythme de sommeil !
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activite' && (
          <div className="space-y-6">
            {/* Weekly summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500">Séances cette semaine</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{activityData.thisWeek.sessions}</p>
                <p className="text-sm text-emerald-600 mt-2">Objectif: 4 séances</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500">Temps total</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{activityData.thisWeek.totalMinutes} <span className="text-lg font-normal">min</span></p>
                <p className="text-sm text-gray-500 mt-2">2h 30min</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500">Calories brûlées</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{activityData.thisWeek.calories}</p>
                <p className="text-sm text-gray-500 mt-2">kcal estimées</p>
              </div>
            </div>

            {/* Add activity */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Enregistrer une activité</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '🏃', label: 'Course', color: 'bg-orange-50 text-orange-600' },
                  { icon: '🚴', label: 'Vélo', color: 'bg-blue-50 text-blue-600' },
                  { icon: '🏋️', label: 'Musculation', color: 'bg-purple-50 text-purple-600' },
                  { icon: '🏊', label: 'Natation', color: 'bg-cyan-50 text-cyan-600' },
                  { icon: '🧘', label: 'Yoga', color: 'bg-pink-50 text-pink-600' },
                  { icon: '➕', label: 'Autre', color: 'bg-gray-50 text-gray-600' },
                ].map((activity) => (
                  <button
                    key={activity.label}
                    onClick={() => openAddModal('activity')}
                    className={`p-4 rounded-xl ${activity.color} hover:opacity-80 transition-opacity`}
                  >
                    <span className="text-2xl">{activity.icon}</span>
                    <p className="text-sm font-medium mt-2">{activity.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity history */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Activités récentes</h2>
              <div className="space-y-3">
                {activityData.activities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                        <span className="text-xl">
                          {activity.type === 'Course à pied' ? '🏃' : activity.type === 'Musculation' ? '🏋️' : '🧘'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{activity.type}</p>
                        <p className="text-sm text-gray-500">{activity.date} 2026</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Durée</p>
                        <p className="font-medium text-gray-800">{activity.duration} min</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Intensité</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.intensity === 'high' ? 'bg-red-100 text-red-700' :
                          activity.intensity === 'moderate' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {activity.intensity === 'high' ? 'Haute' : activity.intensity === 'moderate' ? 'Modérée' : 'Basse'}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Calories</p>
                        <p className="font-medium text-amber-600">{activity.calories}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hydration Tab */}
        {activeTab === 'hydratation' && (
          <div className="space-y-6">
            {/* Today's hydration */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-800">Aujourd'hui</h2>
                <span className="text-sm text-gray-500">Objectif: {hydrationData.goal}L</span>
              </div>
              
              <div className="flex items-center gap-8">
                {/* Visual glass */}
                <div className="relative w-32 h-48 bg-gray-100 rounded-b-3xl rounded-t-lg overflow-hidden border-4 border-gray-200">
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                    style={{ height: `${(hydrationData.today / hydrationData.goal) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">{hydrationData.today}L</p>
                      <p className="text-sm text-gray-500">/ {hydrationData.goal}L</p>
                    </div>
                  </div>
                </div>

                {/* Quick add buttons */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-3">Ajouter rapidement</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { amount: 250, label: '1 verre', icon: '🥛' },
                      { amount: 500, label: '1 bouteille', icon: '🧴' },
                      { amount: 330, label: '1 canette', icon: '🥫' },
                      { amount: 150, label: '1 tasse', icon: '☕' },
                    ].map((item) => (
                      <button
                        key={item.amount}
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div className="text-left">
                          <p className="text-sm font-medium text-blue-800">{item.label}</p>
                          <p className="text-xs text-blue-600">{item.amount} ml</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <input
                      type="number"
                      placeholder="Quantité personnalisée"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600">
                      + ml
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Cette semaine</h2>
              <div className="flex items-end justify-between gap-2 h-40">
                {hydrationData.history.map((day, index) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '120px' }}>
                      {day.value !== null && (
                        <div
                          className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                            day.value >= day.goal ? 'bg-blue-500' : 'bg-blue-300'
                          }`}
                          style={{ height: `${(day.value / 2.5) * 100}%` }}
                        />
                      )}
                      {/* Goal line */}
                      <div 
                        className="absolute w-full border-t-2 border-dashed border-blue-400"
                        style={{ bottom: `${(day.goal / 2.5) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{day.date}</p>
                    <p className="text-xs font-medium text-gray-700">
                      {day.value !== null ? `${day.value}L` : '-'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-gray-600">Objectif atteint</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-300 rounded" />
                  <span className="text-gray-600">En dessous</span>
                </div>
              </div>
            </div>

            {/* Weekly stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500">Moyenne cette semaine</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{hydrationData.weekAverage}L <span className="text-base font-normal text-gray-400">/ jour</span></p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500">Jours avec objectif atteint</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">3 <span className="text-base font-normal text-gray-400">/ 5 jours</span></p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {modalType === 'mensuration' ? 'Nouvelle mesure' : 'Nouvelle activité'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                ✕
              </button>
            </div>

            {modalType === 'mensuration' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de mesure</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option>Tour de poitrine</option>
                    <option>Tour de taille</option>
                    <option>Tour de hanches</option>
                    <option>Tour de cuisse</option>
                    <option>Tour de bras</option>
                    <option>Tour de mollet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valeur (cm)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durée (minutes)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intensité</label>
                  <div className="flex gap-2">
                    {['Basse', 'Modérée', 'Haute'].map((level) => (
                      <button
                        key={level}
                        className="flex-1 py-3 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiometricTrackingWireframe;
