import React, { useState } from 'react';

const MealsHistoryWireframe = () => {
  const [viewMode, setViewMode] = useState('day'); // day, week, list
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [expandedMeal, setExpandedMeal] = useState(null);

  // Sample data
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i <= 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };
  
  const dates = generateDates();

  const dailyGoals = { calories: 2100, protein: 140, carbs: 230, fat: 70 };

  const mealsData = {
    breakfast: {
      type: 'Petit-déjeuner',
      time: '07:30',
      logged: true,
      photo: true,
      items: [
        { name: 'Flocons d\'avoine', quantity: '60g', calories: 228, protein: 8, carbs: 40, fat: 4 },
        { name: 'Lait d\'amande', quantity: '200ml', calories: 26, protein: 1, carbs: 0, fat: 2 },
        { name: 'Banane', quantity: '1 moyenne', calories: 105, protein: 1, carbs: 27, fat: 0 },
        { name: 'Beurre de cacahuète', quantity: '15g', calories: 94, protein: 4, carbs: 3, fat: 8 },
      ],
      totals: { calories: 453, protein: 14, carbs: 70, fat: 14 }
    },
    lunch: {
      type: 'Déjeuner',
      time: '12:30',
      logged: true,
      photo: true,
      items: [
        { name: 'Blanc de poulet grillé', quantity: '150g', calories: 248, protein: 46, carbs: 0, fat: 5 },
        { name: 'Riz basmati', quantity: '180g cuit', calories: 234, protein: 5, carbs: 52, fat: 0 },
        { name: 'Brocoli vapeur', quantity: '150g', calories: 52, protein: 4, carbs: 10, fat: 1 },
        { name: 'Huile d\'olive', quantity: '10ml', calories: 88, protein: 0, carbs: 0, fat: 10 },
      ],
      totals: { calories: 622, protein: 55, carbs: 62, fat: 16 }
    },
    dinner: {
      type: 'Dîner',
      time: null,
      logged: false,
      photo: false,
      items: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    },
    snack: {
      type: 'Collation',
      time: '16:00',
      logged: true,
      photo: false,
      items: [
        { name: 'Yaourt grec 0%', quantity: '170g', calories: 100, protein: 17, carbs: 6, fat: 0 },
        { name: 'Myrtilles', quantity: '80g', calories: 46, protein: 1, carbs: 12, fat: 0 },
      ],
      totals: { calories: 146, protein: 18, carbs: 18, fat: 0 }
    }
  };

  const weekMealsData = {
    0: { breakfast: true, lunch: true, dinner: true, snack: true, calories: 2050 },
    1: { breakfast: true, lunch: true, dinner: true, snack: false, calories: 1890 },
    2: { breakfast: true, lunch: true, dinner: true, snack: true, calories: 2120 },
    3: { breakfast: true, lunch: true, dinner: false, snack: true, calories: 1221 }, // today partial
    4: { breakfast: false, lunch: false, dinner: false, snack: false, calories: 0 },
    5: { breakfast: false, lunch: false, dinner: false, snack: false, calories: 0 },
    6: { breakfast: false, lunch: false, dinner: false, snack: false, calories: 0 },
  };

  const recentMealsList = [
    { id: 1, type: 'Collation', date: 'Aujourd\'hui', time: '16:00', items: ['Yaourt grec 0%', 'Myrtilles'], calories: 146, photo: false },
    { id: 2, type: 'Déjeuner', date: 'Aujourd\'hui', time: '12:30', items: ['Poulet grillé', 'Riz basmati', 'Brocoli'], calories: 622, photo: true },
    { id: 3, type: 'Petit-déjeuner', date: 'Aujourd\'hui', time: '07:30', items: ['Flocons d\'avoine', 'Banane', 'Lait d\'amande'], calories: 453, photo: true },
    { id: 4, type: 'Dîner', date: 'Hier', time: '19:30', items: ['Saumon', 'Quinoa', 'Asperges'], calories: 580, photo: true },
    { id: 5, type: 'Collation', date: 'Hier', time: '16:00', items: ['Amandes', 'Pomme'], calories: 195, photo: false },
    { id: 6, type: 'Déjeuner', date: 'Hier', time: '12:15', items: ['Salade César', 'Pain complet'], calories: 520, photo: true },
    { id: 7, type: 'Petit-déjeuner', date: 'Hier', time: '08:00', items: ['Œufs brouillés', 'Toast', 'Avocat'], calories: 420, photo: false },
    { id: 8, type: 'Dîner', date: 'Avant-hier', time: '20:00', items: ['Pâtes complètes', 'Sauce tomate', 'Parmesan'], calories: 650, photo: true },
  ];

  const currentTotals = {
    calories: mealsData.breakfast.totals.calories + mealsData.lunch.totals.calories + mealsData.snack.totals.calories,
    protein: mealsData.breakfast.totals.protein + mealsData.lunch.totals.protein + mealsData.snack.totals.protein,
    carbs: mealsData.breakfast.totals.carbs + mealsData.lunch.totals.carbs + mealsData.snack.totals.carbs,
    fat: mealsData.breakfast.totals.fat + mealsData.lunch.totals.fat + mealsData.snack.totals.fat,
  };

  const formatDate = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Aujourd\'hui';
    if (isYesterday) return 'Hier';
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const isToday = (date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date) => date.toDateString() === selectedDate.toDateString();

  const getMealTypeIcon = (type) => {
    switch(type) {
      case 'Petit-déjeuner': return '🌅';
      case 'Déjeuner': return '☀️';
      case 'Dîner': return '🌙';
      case 'Collation': return '🍎';
      default: return '🍽';
    }
  };

  const getMealTypeColor = (type) => {
    switch(type) {
      case 'Petit-déjeuner': return 'bg-amber-100 text-amber-700';
      case 'Déjeuner': return 'bg-orange-100 text-orange-700';
      case 'Dîner': return 'bg-indigo-100 text-indigo-700';
      case 'Collation': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const openAddDrawer = (mealType = null) => {
    setSelectedMealType(mealType);
    setShowAddDrawer(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Mes repas</h1>
              <p className="text-sm text-gray-500">Suivez et enregistrez votre alimentation</p>
            </div>
            <button
              onClick={() => openAddDrawer()}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <span className="text-lg">+</span>
              Ajouter un repas
            </button>
          </div>

          {/* View toggle + Date navigation */}
          <div className="flex items-center justify-between">
            {/* View mode toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'day', label: 'Jour' },
                { id: 'week', label: 'Semaine' },
                { id: 'list', label: 'Liste' },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setViewMode(view.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === view.id
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>

            {/* Date navigation */}
            {viewMode !== 'list' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-3 py-1.5 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Aujourd'hui
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Date selector strip (Day & Week views) */}
      {viewMode !== 'list' && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                ←
              </button>
              <div className="flex-1 flex gap-1 overflow-x-auto pb-1">
                {dates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all ${
                      isSelected(date)
                        ? 'bg-emerald-500 text-white'
                        : isToday(date)
                        ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span className="text-xs font-medium">
                      {weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                    </span>
                    <span className={`text-lg font-semibold ${isSelected(date) ? '' : ''}`}>
                      {date.getDate()}
                    </span>
                    {isToday(date) && !isSelected(date) && (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                →
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1">
            {/* Day View */}
            {viewMode === 'day' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-800">{formatDate(selectedDate)}</h2>
                  <span className="text-sm text-gray-500">
                    {currentTotals.calories} / {dailyGoals.calories} kcal
                  </span>
                </div>

                {Object.entries(mealsData).map(([key, meal]) => (
                  <div
                    key={key}
                    className={`bg-white rounded-xl border transition-all ${
                      meal.logged ? 'border-gray-200' : 'border-dashed border-gray-300'
                    }`}
                  >
                    {/* Meal header */}
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => meal.logged && setExpandedMeal(expandedMeal === key ? null : key)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getMealTypeColor(meal.type)}`}>
                          <span className="text-xl">{getMealTypeIcon(meal.type)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-800">{meal.type}</h3>
                            {meal.logged && meal.photo && (
                              <span className="text-gray-400 text-sm">📷</span>
                            )}
                          </div>
                          {meal.logged ? (
                            <p className="text-sm text-gray-500">
                              {meal.time} • {meal.items.length} aliments
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">Non enregistré</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {meal.logged ? (
                          <>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800">{meal.totals.calories} kcal</p>
                              <p className="text-xs text-gray-500">
                                P: {meal.totals.protein}g • G: {meal.totals.carbs}g • L: {meal.totals.fat}g
                              </p>
                            </div>
                            <span className={`text-gray-400 transition-transform ${expandedMeal === key ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddDrawer(meal.type);
                            }}
                            className="px-4 py-2 text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            + Ajouter
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded content */}
                    {meal.logged && expandedMeal === key && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        {/* Photo if available */}
                        {meal.photo && (
                          <div className="mt-4 mb-4">
                            <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                              <span className="text-4xl">📸</span>
                            </div>
                          </div>
                        )}

                        {/* Items list */}
                        <div className="mt-4 space-y-2">
                          {meal.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                            >
                              <div>
                                <p className="text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-700">{item.calories} kcal</p>
                                <p className="text-xs text-gray-400">
                                  P: {item.protein}g • G: {item.carbs}g • L: {item.fat}g
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 py-2 text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors">
                            ✏️ Modifier
                          </button>
                          <button className="flex-1 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                            🗑 Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Week header */}
                <div className="grid grid-cols-8 border-b border-gray-200">
                  <div className="p-3 bg-gray-50" />
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                    <div
                      key={day}
                      className={`p-3 text-center border-l border-gray-200 ${
                        index === 3 ? 'bg-emerald-50' : 'bg-gray-50'
                      }`}
                    >
                      <p className="text-xs text-gray-500">{day}</p>
                      <p className={`font-semibold ${index === 3 ? 'text-emerald-600' : 'text-gray-800'}`}>
                        {13 + index}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Meal rows */}
                {[
                  { key: 'breakfast', label: 'Petit-déj.', icon: '🌅' },
                  { key: 'lunch', label: 'Déjeuner', icon: '☀️' },
                  { key: 'dinner', label: 'Dîner', icon: '🌙' },
                  { key: 'snack', label: 'Collation', icon: '🍎' },
                ].map((mealType) => (
                  <div key={mealType.key} className="grid grid-cols-8 border-b border-gray-100 last:border-0">
                    <div className="p-3 bg-gray-50 flex items-center gap-2">
                      <span>{mealType.icon}</span>
                      <span className="text-sm text-gray-600">{mealType.label}</span>
                    </div>
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                      const hasData = weekMealsData[dayIndex]?.[mealType.key];
                      const isCurrentDay = dayIndex === 3;
                      return (
                        <div
                          key={dayIndex}
                          className={`p-2 border-l border-gray-100 flex items-center justify-center ${
                            isCurrentDay ? 'bg-emerald-50/50' : ''
                          }`}
                        >
                          {hasData ? (
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-emerald-200 transition-colors">
                              <span className="text-emerald-600">✓</span>
                            </div>
                          ) : dayIndex <= 3 ? (
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                              <span className="text-gray-400 text-lg">+</span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-200" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Totals row */}
                <div className="grid grid-cols-8 bg-gray-50 border-t border-gray-200">
                  <div className="p-3 text-sm font-medium text-gray-600">Total</div>
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                    const cals = weekMealsData[dayIndex]?.calories || 0;
                    const percentage = Math.round((cals / dailyGoals.calories) * 100);
                    return (
                      <div key={dayIndex} className={`p-3 border-l border-gray-200 text-center ${dayIndex === 3 ? 'bg-emerald-50' : ''}`}>
                        <p className={`font-semibold text-sm ${cals > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                          {cals > 0 ? `${cals}` : '-'}
                        </p>
                        {cals > 0 && (
                          <p className={`text-xs ${percentage >= 90 && percentage <= 110 ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {percentage}%
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Filtrer :</span>
                  {['Tous', 'Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'].map((filter) => (
                    <button
                      key={filter}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filter === 'Tous'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Grouped by date */}
                {['Aujourd\'hui', 'Hier', 'Avant-hier'].map((dateGroup) => {
                  const mealsForDate = recentMealsList.filter(m => m.date === dateGroup);
                  if (mealsForDate.length === 0) return null;
                  
                  return (
                    <div key={dateGroup}>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">{dateGroup}</h3>
                      <div className="space-y-3">
                        {mealsForDate.map((meal) => (
                          <div
                            key={meal.id}
                            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              {/* Photo or icon */}
                              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                                meal.photo ? 'bg-gray-100' : getMealTypeColor(meal.type)
                              }`}>
                                {meal.photo ? (
                                  <span className="text-2xl">📸</span>
                                ) : (
                                  <span className="text-2xl">{getMealTypeIcon(meal.type)}</span>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMealTypeColor(meal.type)}`}>
                                    {meal.type}
                                  </span>
                                  <span className="text-sm text-gray-400">{meal.time}</span>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-1">
                                  {meal.items.join(', ')}
                                </p>
                              </div>

                              {/* Calories */}
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">{meal.calories} kcal</p>
                              </div>

                              {/* Arrow */}
                              <span className="text-gray-300">→</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Load more */}
                <div className="text-center pt-4">
                  <button className="px-6 py-2 text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors">
                    Charger plus de repas
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Desktop only */}
          <aside className="w-80 flex-shrink-0 hidden lg:block">
            {/* Daily summary card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-32">
              <h3 className="font-semibold text-gray-800 mb-4">Résumé du jour</h3>

              {/* Calories */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-semibold text-gray-800">
                    {currentTotals.calories} / {dailyGoals.calories}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min((currentTotals.calories / dailyGoals.calories) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Reste {dailyGoals.calories - currentTotals.calories} kcal
                </p>
              </div>

              {/* Macros */}
              <div className="space-y-4">
                {[
                  { label: 'Protéines', value: currentTotals.protein, goal: dailyGoals.protein, color: 'bg-blue-500', unit: 'g' },
                  { label: 'Glucides', value: currentTotals.carbs, goal: dailyGoals.carbs, color: 'bg-amber-500', unit: 'g' },
                  { label: 'Lipides', value: currentTotals.fat, goal: dailyGoals.fat, color: 'bg-rose-500', unit: 'g' },
                ].map((macro) => (
                  <div key={macro.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{macro.label}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {macro.value} / {macro.goal}{macro.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${macro.color} rounded-full transition-all`}
                        style={{ width: `${Math.min((macro.value / macro.goal) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison with plan */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">vs Plan alimentaire</h4>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold">92%</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Bonne adhérence</p>
                    <p className="text-xs text-emerald-600">Léger écart sur les glucides</p>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <button className="w-full py-2.5 text-center text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors">
                  📋 Voir mon plan du jour
                </button>
                <button className="w-full py-2.5 text-center text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                  📊 Statistiques détaillées
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Add Meal Drawer */}
      {showAddDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddDrawer(false)}
          />

          {/* Drawer */}
          <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto">
            {/* Drawer header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Ajouter un repas</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedDate)}</p>
              </div>
              <button
                onClick={() => setShowAddDrawer(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                ✕
              </button>
            </div>

            {/* Meal type selection */}
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Type de repas</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'Petit-déjeuner', icon: '🌅', time: '06:00 - 10:00' },
                  { type: 'Déjeuner', icon: '☀️', time: '11:00 - 14:00' },
                  { type: 'Dîner', icon: '🌙', time: '18:00 - 21:00' },
                  { type: 'Collation', icon: '🍎', time: 'À tout moment' },
                ].map((meal) => (
                  <button
                    key={meal.type}
                    onClick={() => setSelectedMealType(meal.type)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedMealType === meal.type
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{meal.icon}</span>
                    <p className="font-medium text-gray-800 mt-2">{meal.type}</p>
                    <p className="text-xs text-gray-500">{meal.time}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            {selectedMealType && (
              <div className="px-6 pb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Ajouter des aliments</h3>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Rechercher un aliment..."
                    className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>

                {/* Quick add */}
                <div className="flex gap-2 mb-4">
                  <button className="flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                    📷 Scan code-barres
                  </button>
                  <button className="flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                    ⭐ Favoris
                  </button>
                </div>

                {/* Recent foods */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Récents</p>
                  <div className="space-y-2">
                    {['Flocons d\'avoine', 'Blanc de poulet', 'Riz basmati', 'Yaourt grec'].map((food) => (
                      <button
                        key={food}
                        className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <span className="text-gray-700">{food}</span>
                        <span className="text-emerald-500 font-medium">+ Ajouter</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddDrawer(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600">
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealsHistoryWireframe;
