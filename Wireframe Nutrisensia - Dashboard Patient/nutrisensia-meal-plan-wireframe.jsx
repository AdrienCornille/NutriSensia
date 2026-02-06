import React, { useState } from 'react';

const MealPlanWireframe = () => {
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'
  const [selectedDay, setSelectedDay] = useState(3); // Index of selected day (Wednesday)
  const [expandedMeal, setExpandedMeal] = useState('dejeuner');
  const [showNutrientDetail, setShowNutrientDetail] = useState(false);

  const weekDays = [
    { short: 'Lun', full: 'Lundi', date: '13', isToday: false },
    { short: 'Mar', full: 'Mardi', date: '14', isToday: false },
    { short: 'Mer', full: 'Mercredi', date: '15', isToday: false },
    { short: 'Jeu', full: 'Jeudi', date: '16', isToday: false },
    { short: 'Ven', full: 'Vendredi', date: '17', isToday: true },
    { short: 'Sam', full: 'Samedi', date: '18', isToday: false },
    { short: 'Dim', full: 'Dimanche', date: '19', isToday: false },
  ];

  const dailyTargets = {
    calories: 2100,
    protein: 120,
    carbs: 250,
    fat: 70,
    fiber: 30,
    sodium: 2300,
  };

  const meals = {
    'petit-dejeuner': {
      label: 'Petit-déjeuner',
      icon: '🌅',
      time: '7:00 - 9:00',
      targetCalories: 450,
      foods: [
        { name: 'Flocons d\'avoine', quantity: '60g', calories: 230, protein: 8, carbs: 40, fat: 4 },
        { name: 'Lait demi-écrémé', quantity: '200ml', calories: 92, protein: 6.4, carbs: 9.6, fat: 3.2 },
        { name: 'Banane', quantity: '1 moyenne', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
        { name: 'Miel', quantity: '1 c. à soupe', calories: 64, protein: 0, carbs: 17, fat: 0 },
      ],
    },
    'dejeuner': {
      label: 'Déjeuner',
      icon: '☀️',
      time: '12:00 - 14:00',
      targetCalories: 650,
      foods: [
        { name: 'Blanc de poulet grillé', quantity: '150g', calories: 248, protein: 46.5, carbs: 0, fat: 5.4 },
        { name: 'Riz basmati complet', quantity: '180g cuit', calories: 234, protein: 4.3, carbs: 51.5, fat: 0.5 },
        { name: 'Brocoli vapeur', quantity: '150g', calories: 52, protein: 4.2, carbs: 7.2, fat: 0.6 },
        { name: 'Huile d\'olive', quantity: '1 c. à soupe', calories: 119, protein: 0, carbs: 0, fat: 13.5 },
      ],
    },
    'collation': {
      label: 'Collation',
      icon: '🍎',
      time: '16:00 - 17:00',
      targetCalories: 200,
      foods: [
        { name: 'Yaourt grec nature', quantity: '150g', calories: 90, protein: 15, carbs: 4.5, fat: 0.8 },
        { name: 'Amandes', quantity: '20g', calories: 116, protein: 4.2, carbs: 2.2, fat: 10 },
      ],
    },
    'diner': {
      label: 'Dîner',
      icon: '🌙',
      time: '19:00 - 21:00',
      targetCalories: 600,
      foods: [
        { name: 'Filet de saumon', quantity: '150g', calories: 280, protein: 30, carbs: 0, fat: 18 },
        { name: 'Quinoa', quantity: '150g cuit', calories: 180, protein: 6, carbs: 32, fat: 2.7 },
        { name: 'Haricots verts', quantity: '150g', calories: 47, protein: 2.7, carbs: 7.5, fat: 0.3 },
        { name: 'Citron (jus)', quantity: '1/2', calories: 6, protein: 0.1, carbs: 1.5, fat: 0 },
      ],
    },
  };

  const weeklyMeals = weekDays.map((day, index) => ({
    ...day,
    meals: {
      'petit-dejeuner': { summary: 'Flocons d\'avoine, banane', calories: 491 },
      'dejeuner': { summary: 'Poulet, riz, légumes', calories: 653 },
      'collation': { summary: 'Yaourt, amandes', calories: 206 },
      'diner': { summary: 'Saumon, quinoa', calories: 513 },
    },
    totalCalories: index === 4 ? 1863 : 1800 + Math.floor(Math.random() * 300),
  }));

  const calculateMealTotal = (foods) => {
    return foods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const micronutrients = [
    { name: 'Fibres', value: 32, target: 30, unit: 'g', status: 'good' },
    { name: 'Sodium', value: 1850, target: 2300, unit: 'mg', status: 'good' },
    { name: 'Vitamine C', value: 95, target: 90, unit: 'mg', status: 'good' },
    { name: 'Calcium', value: 780, target: 1000, unit: 'mg', status: 'warning' },
    { name: 'Fer', value: 14, target: 18, unit: 'mg', status: 'warning' },
    { name: 'Vitamine D', value: 8, target: 15, unit: 'µg', status: 'low' },
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
                <h1 className="text-lg font-semibold text-gray-800">Mon plan alimentaire</h1>
                <p className="text-sm text-gray-500">Semaine du 13 au 19 janvier 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'day' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Jour
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'week' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Semaine
                </button>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                📥
              </button>
            </div>
          </div>

          {/* Day selector (visible in day view) */}
          {viewMode === 'day' && (
            <div className="flex gap-2">
              {weekDays.map((day, index) => (
                <button
                  key={day.short}
                  onClick={() => setSelectedDay(index)}
                  className={`flex-1 py-3 rounded-xl text-center transition-all ${
                    selectedDay === index
                      ? 'bg-emerald-500 text-white'
                      : day.isToday
                      ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <p className="text-xs font-medium">{day.short}</p>
                  <p className="text-lg font-bold">{day.date}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Day View */}
        {viewMode === 'day' && (
          <div className="space-y-6">
            {/* Daily summary */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">
                  Objectifs du {weekDays[selectedDay].full.toLowerCase()} {weekDays[selectedDay].date} janvier
                </h2>
                <button
                  onClick={() => setShowNutrientDetail(!showNutrientDetail)}
                  className="text-sm text-emerald-600 font-medium hover:underline"
                >
                  {showNutrientDetail ? 'Masquer détails' : 'Voir micronutriments'}
                </button>
              </div>

              {/* Macro targets */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-gray-800">{dailyTargets.calories}</p>
                  <p className="text-sm text-gray-500">kcal</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{dailyTargets.protein}g</p>
                  <p className="text-sm text-gray-500">Protéines</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-amber-600">{dailyTargets.carbs}g</p>
                  <p className="text-sm text-gray-500">Glucides</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-rose-600">{dailyTargets.fat}g</p>
                  <p className="text-sm text-gray-500">Lipides</p>
                </div>
              </div>

              {/* Micronutrients detail */}
              {showNutrientDetail && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Micronutriments</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {micronutrients.map((nutrient) => (
                      <div key={nutrient.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{nutrient.name}</p>
                          <p className="text-xs text-gray-500">{nutrient.target} {nutrient.unit}/jour</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          nutrient.status === 'good' ? 'bg-emerald-100 text-emerald-700' :
                          nutrient.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {nutrient.value} {nutrient.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Meals */}
            <div className="space-y-4">
              {Object.entries(meals).map(([mealId, meal]) => {
                const mealTotal = calculateMealTotal(meal.foods);
                const isExpanded = expandedMeal === mealId;

                return (
                  <div key={mealId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Meal header */}
                    <button
                      onClick={() => setExpandedMeal(isExpanded ? null : mealId)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">{meal.icon}</span>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">{meal.label}</p>
                          <p className="text-sm text-gray-500">{meal.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{mealTotal.calories} kcal</p>
                          <p className="text-xs text-gray-500">
                            P: {mealTotal.protein.toFixed(0)}g • G: {mealTotal.carbs.toFixed(0)}g • L: {mealTotal.fat.toFixed(0)}g
                          </p>
                        </div>
                        <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* Meal details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <div className="space-y-3">
                          {meal.foods.map((food, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{food.name}</p>
                                <p className="text-sm text-gray-500">{food.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-700">{food.calories} kcal</p>
                                <p className="text-xs text-gray-400">
                                  P: {food.protein}g • G: {food.carbs}g • L: {food.fat}g
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Alternatives suggestion */}
                        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                          <div className="flex items-start gap-3">
                            <span className="text-lg">💡</span>
                            <div>
                              <p className="text-sm font-medium text-emerald-800">Alternatives possibles</p>
                              <p className="text-sm text-emerald-700 mt-1">
                                Vous pouvez remplacer le riz par des pâtes complètes ou du boulgour pour varier.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Request modification */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">Un aliment ne vous convient pas ?</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Signalez-le à votre nutritionniste pour ajuster votre plan.
                  </p>
                </div>
                <button className="px-4 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition-colors">
                  Demander une modification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="space-y-6">
            {/* Weekly overview */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Vue d'ensemble de la semaine</h2>
              <div className="grid grid-cols-7 gap-3">
                {weeklyMeals.map((day, index) => (
                  <div
                    key={day.short}
                    className={`p-3 rounded-xl text-center ${
                      day.isToday ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-gray-50'
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-500">{day.short}</p>
                    <p className="text-lg font-bold text-gray-800">{day.date}</p>
                    <p className={`text-sm font-medium mt-2 ${
                      day.totalCalories > dailyTargets.calories ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {day.totalCalories}
                    </p>
                    <p className="text-xs text-gray-400">kcal</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly meal grid */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-32">Repas</th>
                      {weekDays.map((day) => (
                        <th
                          key={day.short}
                          className={`px-3 py-3 text-center text-sm font-medium ${
                            day.isToday ? 'text-emerald-700 bg-emerald-50' : 'text-gray-500'
                          }`}
                        >
                          {day.short} {day.date}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(meals).map(([mealId, meal]) => (
                      <tr key={mealId} className="border-b border-gray-100">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span>{meal.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{meal.label}</span>
                          </div>
                        </td>
                        {weeklyMeals.map((day, dayIndex) => (
                          <td
                            key={day.short}
                            className={`px-3 py-4 ${day.isToday ? 'bg-emerald-50/50' : ''}`}
                          >
                            <button
                              onClick={() => {
                                setSelectedDay(dayIndex);
                                setViewMode('day');
                                setExpandedMeal(mealId);
                              }}
                              className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {day.meals[mealId].summary}
                              </p>
                              <p className="text-xs font-medium text-gray-800 mt-1">
                                {day.meals[mealId].calories} kcal
                              </p>
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Total</td>
                      {weeklyMeals.map((day) => (
                        <td
                          key={day.short}
                          className={`px-3 py-3 text-center ${day.isToday ? 'bg-emerald-50' : ''}`}
                        >
                          <p className={`text-sm font-bold ${
                            day.totalCalories > dailyTargets.calories ? 'text-amber-600' : 'text-gray-800'
                          }`}>
                            {day.totalCalories}
                          </p>
                          <p className="text-xs text-gray-500">/ {dailyTargets.calories}</p>
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Shopping list CTA */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Liste de courses</h3>
                  <p className="text-emerald-100 mt-1">
                    Générez automatiquement votre liste de courses pour la semaine.
                  </p>
                </div>
                <button className="px-5 py-3 bg-white text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2">
                  <span>🛒</span>
                  Générer la liste
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plan info */}
        <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 font-bold">LM</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Plan créé par Lucie Martin</p>
              <p className="text-sm text-gray-500 mt-1">
                Dernière mise à jour : 10 janvier 2026
              </p>
              <p className="text-sm text-gray-600 mt-3">
                <span className="font-medium">Objectif :</span> Rééquilibrage alimentaire avec maintien de la masse musculaire. 
                Focus sur les protéines et les fibres.
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full">
                ✓ Plan actif
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MealPlanWireframe;
