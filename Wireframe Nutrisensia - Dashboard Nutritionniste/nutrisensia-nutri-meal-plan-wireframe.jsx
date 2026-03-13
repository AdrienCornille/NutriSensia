import React, { useState } from 'react';

const NutriMealPlanWireframe = () => {
  const [activeDay, setActiveDay] = useState('lundi');
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [planStatus, setPlanStatus] = useState('draft');

  const days = [
    { id: 'lundi', label: 'Lun', full: 'Lundi' },
    { id: 'mardi', label: 'Mar', full: 'Mardi' },
    { id: 'mercredi', label: 'Mer', full: 'Mercredi' },
    { id: 'jeudi', label: 'Jeu', full: 'Jeudi' },
    { id: 'vendredi', label: 'Ven', full: 'Vendredi' },
    { id: 'samedi', label: 'Sam', full: 'Samedi' },
    { id: 'dimanche', label: 'Dim', full: 'Dimanche' },
  ];

  const dailyTargets = {
    calories: 2100,
    protein: 120,
    carbs: 250,
    fat: 70,
    fiber: 30,
  };

  const meals = {
    'petit-dejeuner': {
      type: 'Petit-dejeuner',
      time: '07:30',
      icon: '🌅',
      foods: [
        { id: 1, name: 'Flocons d\'avoine', quantity: '60g', calories: 228, protein: 8, carbs: 42, fat: 4 },
        { id: 2, name: 'Lait d\'amande', quantity: '200ml', calories: 26, protein: 0.8, carbs: 0.2, fat: 2.2 },
        { id: 3, name: 'Banane', quantity: '1 moyenne (120g)', calories: 107, protein: 1.3, carbs: 27, fat: 0.4 },
        { id: 4, name: 'Miel', quantity: '1 c.s. (15g)', calories: 46, protein: 0, carbs: 12.4, fat: 0 },
      ],
      totalCalories: 407,
    },
    'dejeuner': {
      type: 'Dejeuner',
      time: '12:30',
      icon: '☀️',
      foods: [
        { id: 5, name: 'Blanc de poulet', quantity: '150g', calories: 248, protein: 46.5, carbs: 0, fat: 5.4 },
        { id: 6, name: 'Riz basmati', quantity: '80g (cru)', calories: 280, protein: 6.4, carbs: 64, fat: 0.6 },
        { id: 7, name: 'Brocoli', quantity: '150g', calories: 51, protein: 4.2, carbs: 6, fat: 0.6 },
        { id: 8, name: 'Huile d\'olive', quantity: '1 c.s. (10ml)', calories: 88, protein: 0, carbs: 0, fat: 10 },
      ],
      totalCalories: 667,
    },
    'collation': {
      type: 'Collation',
      time: '16:00',
      icon: '🍎',
      foods: [
        { id: 9, name: 'Yaourt grec nature', quantity: '150g', calories: 88, protein: 15, carbs: 5.7, fat: 0.9 },
        { id: 10, name: 'Amandes', quantity: '20g', calories: 116, protein: 4.2, carbs: 1.2, fat: 10 },
      ],
      totalCalories: 204,
    },
    'diner': {
      type: 'Diner',
      time: '19:00',
      icon: '🌙',
      foods: [
        { id: 11, name: 'Saumon frais', quantity: '150g', calories: 312, protein: 31.5, carbs: 0, fat: 20 },
        { id: 12, name: 'Quinoa', quantity: '60g (cru)', calories: 216, protein: 8.4, carbs: 38, fat: 3.6 },
        { id: 13, name: 'Haricots verts', quantity: '150g', calories: 47, protein: 2.7, carbs: 7, fat: 0.3 },
        { id: 14, name: 'Citron (jus)', quantity: '1/2 citron', calories: 8, protein: 0.2, carbs: 2, fat: 0 },
      ],
      totalCalories: 583,
    },
  };

  const totalDay = Object.values(meals).reduce((acc, meal) => {
    meal.foods.forEach(f => {
      acc.calories += f.calories;
      acc.protein += f.protein;
      acc.carbs += f.carbs;
      acc.fat += f.fat;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const modificationRequests = [
    {
      id: 1,
      patient: 'Jean Dupont',
      date: '22 jan. 2026',
      message: 'Est-ce que je peux remplacer le riz par des pates le mardi et jeudi ? Je n\'aime pas trop le riz tous les jours.',
      status: 'pending',
    },
  ];

  const searchResults = [
    { id: 101, name: 'Poulet, blanc, cuit', calories: 165, protein: 31, carbs: 0, fat: 3.6, source: 'ciqual' },
    { id: 102, name: 'Poulet, cuisse, cuit', calories: 209, protein: 26, carbs: 0, fat: 11, source: 'ciqual' },
    { id: 103, name: 'Poulet, entier, roti', calories: 190, protein: 29, carbs: 0, fat: 7.4, source: 'ciqual' },
    { id: 104, name: 'Poulet fermier, bio', calories: 172, protein: 30, carbs: 0, fat: 5.1, source: 'ciqual' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                ← Retour
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-gray-800">Plan alimentaire - Jean Dupont</h1>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    planStatus === 'draft' ? 'bg-amber-100 text-amber-700' :
                    planStatus === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {planStatus === 'draft' ? 'Brouillon' : planStatus === 'active' ? 'Actif' : 'Archive'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Objectif : Perte de poids progressive -5kg &middot; 20 jan. - 16 fev. 2026</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                Dupliquer comme template
              </button>
              {planStatus === 'draft' && (
                <button
                  onClick={() => setPlanStatus('active')}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  Publier le plan
                </button>
              )}
            </div>
          </div>

          {/* Jours - Tab style from patient dashboard */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeDay === day.id
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {day.full}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        {/* Main - Repas */}
        <div className="flex-1 space-y-4">
          {/* Demandes de modification */}
          {modificationRequests.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-amber-600">📝 Demande de modification en attente</span>
              </div>
              {modificationRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-lg p-3 border border-amber-200">
                  <p className="text-sm text-gray-600 mb-2">"{req.message}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{req.patient} &middot; {req.date}</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                        Approuver
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Repas de la journee */}
          {Object.entries(meals).map(([key, meal]) => (
            <div key={key} className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <span className="text-xl">{meal.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{meal.type}</h3>
                    <p className="text-xs text-gray-500">{meal.time} &middot; {meal.totalCalories} kcal</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedMealType(key); setShowFoodSearch(true); }}
                  className="px-4 py-2 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  + Ajouter un aliment
                </button>
              </div>

              <div className="divide-y divide-gray-50">
                {meal.foods.map((food) => (
                  <div key={food.id} className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50 group">
                    <div className="w-6 text-center text-gray-400 cursor-grab">⠿</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{food.name}</p>
                      <p className="text-xs text-gray-500">{food.quantity}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="w-16 text-right text-gray-600">{food.calories} kcal</span>
                      <span className="w-12 text-right text-blue-600">{food.protein}g P</span>
                      <span className="w-12 text-right text-amber-600">{food.carbs}g G</span>
                      <span className="w-12 text-right text-rose-600">{food.fat}g L</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setShowAlternativeModal(true)}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-400 text-xs"
                        title="Ajouter alternatives"
                      >
                        🔄
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 text-xs" title="Modifier">
                        ✏️
                      </button>
                      <button className="p-1.5 hover:bg-red-50 rounded text-gray-400 text-xs" title="Supprimer">
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar - Totaux nutritionnels */}
        <div className="w-72 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-28">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Totaux du jour</h3>

            {/* Calories */}
            <div className="mb-5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-gray-600">Calories</span>
                <span className="text-sm font-medium text-gray-800">
                  {totalDay.calories} / {dailyTargets.calories} kcal
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    totalDay.calories <= dailyTargets.calories ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((totalDay.calories / dailyTargets.calories) * 100, 100)}%` }}
                ></div>
              </div>
              <p className={`text-xs mt-1 ${totalDay.calories <= dailyTargets.calories ? 'text-emerald-600' : 'text-red-600'}`}>
                {totalDay.calories <= dailyTargets.calories
                  ? `Reste ${dailyTargets.calories - totalDay.calories} kcal`
                  : `Depasse de ${totalDay.calories - dailyTargets.calories} kcal`}
              </p>
            </div>

            {/* Macros */}
            <div className="space-y-3">
              {[
                { label: 'Proteines', value: Math.round(totalDay.protein), target: dailyTargets.protein, unit: 'g', color: 'blue' },
                { label: 'Glucides', value: Math.round(totalDay.carbs), target: dailyTargets.carbs, unit: 'g', color: 'amber' },
                { label: 'Lipides', value: Math.round(totalDay.fat), target: dailyTargets.fat, unit: 'g', color: 'rose' },
              ].map((macro) => (
                <div key={macro.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">{macro.label}</span>
                    <span className="text-xs font-medium text-gray-800">{macro.value} / {macro.target}{macro.unit}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-${macro.color}-500`}
                      style={{ width: `${Math.min((macro.value / macro.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Repartition par repas */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Repartition</h4>
              {Object.values(meals).map((meal, i) => {
                const pct = Math.round((meal.totalCalories / totalDay.calories) * 100);
                return (
                  <div key={i} className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">{meal.icon} {meal.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vue semaine */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Vue semaine</h4>
              <div className="flex gap-1">
                {days.map((day) => {
                  const isActive = day.id === activeDay;
                  const isCompleted = ['lundi', 'mardi', 'mercredi'].includes(day.id);
                  return (
                    <button
                      key={day.id}
                      onClick={() => setActiveDay(day.id)}
                      className={`flex-1 py-2 rounded text-xs font-medium transition-colors ${
                        isActive ? 'bg-emerald-500 text-white' :
                        isCompleted ? 'bg-emerald-50 text-emerald-700' :
                        'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">3/7 jours completes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Food Search Modal */}
      {showFoodSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Ajouter un aliment</h3>
                <button onClick={() => setShowFoodSearch(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">✕</button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Rechercher un aliment (base CIQUAL)..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  defaultValue="poulet"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <p className="text-xs text-gray-500 mb-3">{searchResults.length} resultats pour "poulet"</p>
              <div className="space-y-2">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    className="w-full p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-left transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{food.name}</p>
                        <p className="text-xs text-gray-500">Pour 100g &middot; Source: {food.source.toUpperCase()}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{food.calories} kcal</span>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="text-blue-600">P: {food.protein}g</span>
                      <span className="text-amber-600">G: {food.carbs}g</span>
                      <span className="text-rose-600">L: {food.fat}g</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">Quantite</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      defaultValue="150"
                      className="w-20 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                    <select className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-700">
                      <option>grammes</option>
                      <option>1 filet (~180g)</option>
                      <option>1 portion (~150g)</option>
                    </select>
                  </div>
                </div>
                <button className="self-end px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Modal */}
      {showAlternativeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Alternatives</h3>
                <button onClick={() => setShowAlternativeModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">✕</button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Blanc de poulet (150g) - 248 kcal</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase">Alternatives suggerees</p>
              {[
                { name: 'Dinde, blanc, cuit', quantity: '155g', calories: 245, diff: '-1%' },
                { name: 'Thon au naturel', quantity: '140g', calories: 252, diff: '+2%' },
                { name: 'Tofu ferme', quantity: '200g', calories: 240, diff: '-3%' },
              ].map((alt, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{alt.name}</p>
                    <p className="text-xs text-gray-500">{alt.quantity} &middot; {alt.calories} kcal</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-600">{alt.diff}</span>
                    <button className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full hover:bg-emerald-100 transition-colors">
                      Ajouter
                    </button>
                  </div>
                </div>
              ))}

              <button className="w-full py-2 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors mt-2">
                + Rechercher une autre alternative
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={() => setShowAlternativeModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutriMealPlanWireframe;
