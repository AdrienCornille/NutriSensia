import React, { useState } from 'react';

const MealLoggingWireframe = () => {
  const [step, setStep] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState('dejeuner');
  const [selectedFoods, setSelectedFoods] = useState([
    { id: 1, name: 'Blanc de poulet grillé', quantity: 150, unit: 'g', calories: 248, protein: 46.5, carbs: 0, fat: 5.4 },
    { id: 2, name: 'Riz basmati cuit', quantity: 180, unit: 'g', calories: 234, protein: 4.3, carbs: 51.5, fat: 0.5 },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPortionModal, setShowPortionModal] = useState(false);

  const mealTypes = [
    { id: 'petit-dejeuner', label: 'Petit-déjeuner', icon: '🌅', time: '7:00 - 9:00' },
    { id: 'dejeuner', label: 'Déjeuner', icon: '☀️', time: '12:00 - 14:00' },
    { id: 'diner', label: 'Dîner', icon: '🌙', time: '19:00 - 21:00' },
    { id: 'collation', label: 'Collation', icon: '🍎', time: 'À tout moment' },
  ];

  const recentFoods = [
    { id: 3, name: 'Salade verte', emoji: '🥗' },
    { id: 4, name: 'Œufs brouillés', emoji: '🥚' },
    { id: 5, name: 'Pain complet', emoji: '🍞' },
    { id: 6, name: 'Yaourt nature', emoji: '🥛' },
  ];

  const searchResults = [
    { id: 7, name: 'Brocoli cuit à la vapeur', brand: null, calories: 35, per: '100g' },
    { id: 8, name: 'Brocoli surgelé', brand: 'Migros', calories: 32, per: '100g' },
    { id: 9, name: 'Brocoli cru', brand: null, calories: 34, per: '100g' },
  ];

  const standardPortions = [
    { label: '1 portion', grams: 150 },
    { label: '1/2 portion', grams: 75 },
    { label: '1 poignée', grams: 30 },
    { label: '1 c. à soupe', grams: 15 },
  ];

  const totalNutrition = selectedFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Plan targets for lunch
  const planTarget = { calories: 650, protein: 40, carbs: 70, fat: 20 };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              ← Retour
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Enregistrer un repas</h1>
              <p className="text-sm text-gray-500">Samedi 17 janvier 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Étape {step}/3</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-1 rounded-full ${s <= step ? 'bg-emerald-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Step 1: Meal Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Quel repas souhaitez-vous enregistrer ?</h2>
              <div className="grid grid-cols-2 gap-4">
                {mealTypes.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedMeal === meal.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{meal.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{meal.label}</p>
                        <p className="text-sm text-gray-500">{meal.time}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duplicate previous meal option */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Ou dupliquer un repas précédent</h2>
              <div className="space-y-3">
                <button className="w-full p-4 rounded-lg border border-gray-200 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">☀️</span>
                      <div>
                        <p className="font-medium text-gray-800">Déjeuner d'hier</p>
                        <p className="text-sm text-gray-500">Poulet grillé, riz, salade • 542 kcal</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 text-sm font-medium">Dupliquer</span>
                  </div>
                </button>
                <button className="w-full p-4 rounded-lg border border-gray-200 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🌅</span>
                      <div>
                        <p className="font-medium text-gray-800">Petit-déjeuner d'aujourd'hui</p>
                        <p className="text-sm text-gray-500">Œufs, pain complet, avocat • 385 kcal</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 text-sm font-medium">Dupliquer</span>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Step 2: Add Foods */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Search bar */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Rechercher un aliment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
                <button className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <span>📷</span>
                  <span className="text-sm font-medium text-gray-700">Scanner</span>
                </button>
              </div>

              {/* Search results */}
              {searchQuery && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 mb-3">Résultats pour "{searchQuery}"</p>
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => setShowPortionModal(true)}
                        className="w-full p-3 rounded-lg border border-gray-100 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{result.name}</p>
                          {result.brand && <p className="text-xs text-gray-500">{result.brand}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">{result.calories} kcal</p>
                          <p className="text-xs text-gray-500">pour {result.per}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent & Favorites */}
            {!searchQuery && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="font-semibold text-gray-800 mb-4">Récents & Favoris</h2>
                <div className="grid grid-cols-4 gap-3">
                  {recentFoods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setShowPortionModal(true)}
                      className="p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-center"
                    >
                      <span className="text-2xl">{food.emoji}</span>
                      <p className="text-sm text-gray-700 mt-2 truncate">{food.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected foods */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Aliments ajoutés</h2>
                <span className="text-sm text-gray-500">{selectedFoods.length} aliment(s)</span>
              </div>

              {selectedFoods.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-4xl">🍽</span>
                  <p className="mt-2">Aucun aliment ajouté</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFoods.map((food) => (
                    <div key={food.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{food.name}</p>
                          <p className="text-sm text-gray-500">{food.quantity} {food.unit}</p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="font-medium text-gray-800">{food.calories} kcal</p>
                          <p className="text-xs text-gray-500">
                            P: {food.protein}g • G: {food.carbs}g • L: {food.fat}g
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-400">✏️</button>
                          <button className="p-2 hover:bg-red-100 rounded-lg text-red-400">🗑</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Running total vs plan */}
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <h3 className="font-semibold text-gray-800 mb-4">Total vs Plan ({mealTypes.find(m => m.id === selectedMeal)?.label})</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Calories</span>
                    <span className={totalNutrition.calories > planTarget.calories ? 'text-amber-600' : 'text-emerald-600'}>
                      {Math.round((totalNutrition.calories / planTarget.calories) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${totalNutrition.calories > planTarget.calories ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{width: `${Math.min((totalNutrition.calories / planTarget.calories) * 100, 100)}%`}}
                    />
                  </div>
                  <p className="text-sm mt-1 font-medium">{totalNutrition.calories} / {planTarget.calories}</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Protéines</span>
                    <span className="text-emerald-600">{Math.round((totalNutrition.protein / planTarget.protein) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{width: `${Math.min((totalNutrition.protein / planTarget.protein) * 100, 100)}%`}}
                    />
                  </div>
                  <p className="text-sm mt-1 font-medium">{totalNutrition.protein}g / {planTarget.protein}g</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Glucides</span>
                    <span className="text-emerald-600">{Math.round((totalNutrition.carbs / planTarget.carbs) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{width: `${Math.min((totalNutrition.carbs / planTarget.carbs) * 100, 100)}%`}}
                    />
                  </div>
                  <p className="text-sm mt-1 font-medium">{totalNutrition.carbs}g / {planTarget.carbs}g</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Lipides</span>
                    <span className="text-emerald-600">{Math.round((totalNutrition.fat / planTarget.fat) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full"
                      style={{width: `${Math.min((totalNutrition.fat / planTarget.fat) * 100, 100)}%`}}
                    />
                  </div>
                  <p className="text-sm mt-1 font-medium">{totalNutrition.fat}g / {planTarget.fat}g</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Photo & Notes */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Photo upload */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Photo du repas (optionnel)</h2>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📷</span>
                </div>
                <p className="font-medium text-gray-700">Ajouter une photo</p>
                <p className="text-sm text-gray-500 mt-1">Glisser-déposer ou cliquer pour parcourir</p>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Notes (optionnel)</h2>
              <textarea
                placeholder="Contexte du repas, ressenti, observations..."
                className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none h-24"
              />
            </div>

            {/* Meal context */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Contexte (optionnel)</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '🏠', label: 'À la maison' },
                  { icon: '🏢', label: 'Au travail' },
                  { icon: '🍽', label: 'Restaurant' },
                  { icon: '👨‍👩‍👧', label: 'En famille' },
                  { icon: '👥', label: 'Entre amis' },
                  { icon: '🧘', label: 'Seul(e)' },
                ].map((context) => (
                  <button
                    key={context.label}
                    className="p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                  >
                    <span className="text-xl">{context.icon}</span>
                    <p className="text-sm text-gray-700 mt-1">{context.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <h3 className="font-semibold text-gray-800 mb-4">Récapitulatif</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{mealTypes.find(m => m.id === selectedMeal)?.label}</p>
                  <p className="text-sm text-gray-500">{selectedFoods.length} aliment(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">{totalNutrition.calories} kcal</p>
                  <p className="text-sm text-gray-500">
                    P: {totalNutrition.protein}g • G: {totalNutrition.carbs}g • L: {totalNutrition.fat}g
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFoods.map((food) => (
                  <span key={food.id} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">
                    {food.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => alert('Repas enregistré !')}
                className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                <span>✓</span>
                Enregistrer le repas
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Portion Modal */}
      {showPortionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Brocoli cuit à la vapeur</h3>
              <button 
                onClick={() => setShowPortionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                ✕
              </button>
            </div>

            {/* Quantity input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  defaultValue="150"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-medium"
                />
                <select className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option>grammes</option>
                  <option>ml</option>
                  <option>unité(s)</option>
                </select>
              </div>
            </div>

            {/* Standard portions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Portions standards</label>
              <div className="grid grid-cols-2 gap-2">
                {standardPortions.map((portion) => (
                  <button
                    key={portion.label}
                    className="p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left"
                  >
                    <p className="font-medium text-gray-800">{portion.label}</p>
                    <p className="text-sm text-gray-500">{portion.grams}g</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Pour 150g</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-800">52</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">4.2g</p>
                  <p className="text-xs text-gray-500">Prot.</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-600">7.2g</p>
                  <p className="text-xs text-gray-500">Gluc.</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-rose-600">0.6g</p>
                  <p className="text-xs text-gray-500">Lip.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPortionModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowPortionModal(false)}
                className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealLoggingWireframe;
