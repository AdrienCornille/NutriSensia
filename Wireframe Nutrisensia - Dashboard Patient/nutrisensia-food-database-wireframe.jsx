import React, { useState } from 'react';

const FoodDatabaseWireframe = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const categories = [
    { id: 'all', label: 'Tout', emoji: '🍽', count: 2847 },
    { id: 'fruits', label: 'Fruits', emoji: '🍎', count: 156 },
    { id: 'legumes', label: 'Légumes', emoji: '🥬', count: 203 },
    { id: 'viandes', label: 'Viandes', emoji: '🥩', count: 124 },
    { id: 'poissons', label: 'Poissons', emoji: '🐟', count: 89 },
    { id: 'feculents', label: 'Féculents', emoji: '🍚', count: 167 },
    { id: 'produits-laitiers', label: 'Produits laitiers', emoji: '🥛', count: 134 },
    { id: 'oeufs', label: 'Œufs', emoji: '🥚', count: 23 },
    { id: 'legumineuses', label: 'Légumineuses', emoji: '🫘', count: 45 },
    { id: 'noix-graines', label: 'Noix & Graines', emoji: '🥜', count: 67 },
    { id: 'huiles', label: 'Huiles & Graisses', emoji: '🫒', count: 42 },
    { id: 'boissons', label: 'Boissons', emoji: '🥤', count: 98 },
    { id: 'snacks', label: 'Snacks', emoji: '🍿', count: 156 },
    { id: 'plats-prepares', label: 'Plats préparés', emoji: '🍱', count: 234 },
  ];

  const foods = [
    {
      id: 1,
      name: 'Blanc de poulet',
      category: 'viandes',
      image: '🍗',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      per: '100g',
      isFavorite: true,
      brand: null,
      portions: [
        { label: '100g', grams: 100 },
        { label: '1 filet (150g)', grams: 150 },
        { label: '1 escalope (120g)', grams: 120 },
      ],
      micronutrients: {
        sodium: 74,
        potassium: 256,
        vitaminB6: 0.6,
        vitaminB12: 0.3,
        iron: 1,
        zinc: 1,
      },
    },
    {
      id: 2,
      name: 'Riz basmati complet',
      category: 'feculents',
      image: '🍚',
      calories: 130,
      protein: 2.4,
      carbs: 28.7,
      fat: 0.3,
      fiber: 0.4,
      per: '100g cuit',
      isFavorite: true,
      brand: null,
      portions: [
        { label: '100g cuit', grams: 100 },
        { label: '1 portion (180g)', grams: 180 },
        { label: '50g cru (~150g cuit)', grams: 150 },
      ],
    },
    {
      id: 3,
      name: 'Brocoli',
      category: 'legumes',
      image: '🥦',
      calories: 35,
      protein: 2.8,
      carbs: 7.2,
      fat: 0.4,
      fiber: 2.6,
      per: '100g',
      isFavorite: false,
      brand: null,
      portions: [
        { label: '100g', grams: 100 },
        { label: '1 tête moyenne (300g)', grams: 300 },
        { label: '1 portion (150g)', grams: 150 },
      ],
    },
    {
      id: 4,
      name: 'Yaourt grec nature 0%',
      category: 'produits-laitiers',
      image: '🥛',
      calories: 59,
      protein: 10.3,
      carbs: 3.6,
      fat: 0.7,
      fiber: 0,
      per: '100g',
      isFavorite: true,
      brand: 'FAGE',
      portions: [
        { label: '100g', grams: 100 },
        { label: '1 pot (150g)', grams: 150 },
        { label: '1 pot (170g)', grams: 170 },
      ],
    },
    {
      id: 5,
      name: 'Flocons d\'avoine',
      category: 'feculents',
      image: '🥣',
      calories: 379,
      protein: 13.2,
      carbs: 67.7,
      fat: 6.5,
      fiber: 10.1,
      per: '100g',
      isFavorite: true,
      brand: null,
      portions: [
        { label: '100g', grams: 100 },
        { label: '1 portion (40g)', grams: 40 },
        { label: '1 portion (60g)', grams: 60 },
      ],
    },
    {
      id: 6,
      name: 'Saumon atlantique',
      category: 'poissons',
      image: '🐟',
      calories: 208,
      protein: 20,
      carbs: 0,
      fat: 13,
      fiber: 0,
      per: '100g',
      isFavorite: false,
      brand: null,
      portions: [
        { label: '100g', grams: 100 },
        { label: '1 pavé (150g)', grams: 150 },
        { label: '1 filet (200g)', grams: 200 },
      ],
    },
    {
      id: 7,
      name: 'Amandes',
      category: 'noix-graines',
      image: '🥜',
      calories: 579,
      protein: 21.2,
      carbs: 21.7,
      fat: 49.4,
      fiber: 12.2,
      per: '100g',
      isFavorite: true,
      brand: null,
      portions: [
        { label: '100g', grams: 100 },
        { label: '1 poignée (20g)', grams: 20 },
        { label: '10 amandes (~12g)', grams: 12 },
      ],
    },
    {
      id: 8,
      name: 'Banane',
      category: 'fruits',
      image: '🍌',
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
      fiber: 2.6,
      per: '100g',
      isFavorite: false,
      brand: null,
      portions: [
        { label: '100g', grams: 100 },
        { label: '1 petite (90g)', grams: 90 },
        { label: '1 moyenne (120g)', grams: 120 },
        { label: '1 grande (150g)', grams: 150 },
      ],
    },
    {
      id: 9,
      name: 'Huile d\'olive extra vierge',
      category: 'huiles',
      image: '🫒',
      calories: 884,
      protein: 0,
      carbs: 0,
      fat: 100,
      fiber: 0,
      per: '100ml',
      isFavorite: false,
      brand: null,
      portions: [
        { label: '100ml', grams: 100 },
        { label: '1 c. à soupe (15ml)', grams: 15 },
        { label: '1 c. à café (5ml)', grams: 5 },
      ],
    },
    {
      id: 10,
      name: 'Œuf entier',
      category: 'oeufs',
      image: '🥚',
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
      fiber: 0,
      per: '100g',
      isFavorite: true,
      brand: null,
      portions: [
        { label: '100g', grams: 100 },
        { label: '1 œuf moyen (50g)', grams: 50 },
        { label: '1 œuf large (60g)', grams: 60 },
      ],
    },
    {
      id: 11,
      name: 'Muesli croustillant chocolat',
      category: 'feculents',
      image: '🥣',
      calories: 456,
      protein: 9.2,
      carbs: 64,
      fat: 17,
      fiber: 6.8,
      per: '100g',
      isFavorite: false,
      brand: 'Migros Bio',
      portions: [
        { label: '100g', grams: 100 },
        { label: '1 portion (45g)', grams: 45 },
      ],
    },
    {
      id: 12,
      name: 'Lentilles corail',
      category: 'legumineuses',
      image: '🫘',
      calories: 116,
      protein: 9,
      carbs: 20,
      fat: 0.4,
      fiber: 3.8,
      per: '100g cuit',
      isFavorite: false,
      brand: null,
      portions: [
        { label: '100g cuit', grams: 100 },
        { label: '1 portion (150g)', grams: 150 },
        { label: '50g cru (~125g cuit)', grams: 125 },
      ],
    },
  ];

  const recentSearches = [
    'poulet', 'quinoa', 'avocat', 'fromage blanc'
  ];

  const favoritesFoods = foods.filter(f => f.isFavorite);

  const filteredFoods = foods.filter((food) => {
    const matchesCategory = activeCategory === 'all' || food.category === activeCategory;
    const matchesSearch = !searchQuery || 
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const openFoodDetail = (food) => {
    setSelectedFood(food);
    setShowFoodDetail(true);
  };

  const toggleFavorite = (foodId, e) => {
    e.stopPropagation();
    // Toggle favorite logic
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                ← Retour
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Base d'aliments</h1>
                <p className="text-sm text-gray-500">2 847 aliments disponibles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  ▦
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher un aliment, une marque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => setShowScannerModal(true)}
              className="px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <span>📷</span>
              <span className="font-medium">Scanner</span>
            </button>
          </div>

          {/* Recent searches */}
          {!searchQuery && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-500">Récents:</span>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar - Categories */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-32">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Catégories</h2>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      activeCategory === cat.id ? 'bg-emerald-50 text-emerald-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>{cat.emoji}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Favorites quick access */}
            <div className="bg-white rounded-xl border border-gray-200 mt-4 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Mes favoris</h3>
              <div className="space-y-2">
                {favoritesFoods.slice(0, 5).map((food) => (
                  <button
                    key={food.id}
                    onClick={() => openFoodDetail(food)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <span>{food.image}</span>
                    <span className="text-sm text-gray-700 truncate">{food.name}</span>
                  </button>
                ))}
              </div>
              {favoritesFoods.length > 5 && (
                <button className="w-full mt-2 text-sm text-emerald-600 font-medium hover:underline">
                  Voir tous ({favoritesFoods.length})
                </button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                {searchQuery 
                  ? `Résultats pour "${searchQuery}" (${filteredFoods.length})`
                  : activeCategory === 'all'
                  ? `Tous les aliments (${filteredFoods.length})`
                  : `${categories.find(c => c.id === activeCategory)?.label} (${filteredFoods.length})`
                }
              </h2>
              <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                <option>Trier par nom (A-Z)</option>
                <option>Trier par calories (↑)</option>
                <option>Trier par calories (↓)</option>
                <option>Trier par protéines (↓)</option>
              </select>
            </div>

            {/* Foods grid/list */}
            {filteredFoods.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <span className="text-5xl">🔍</span>
                <p className="text-gray-500 mt-4">Aucun aliment trouvé</p>
                <p className="text-sm text-gray-400 mt-2">Essayez avec d'autres termes ou scannez un code-barres</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-3 gap-4">
                {filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => openFoodDetail(food)}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{food.image}</span>
                      </div>
                      <button
                        onClick={(e) => toggleFavorite(food.id, e)}
                        className={`p-1 rounded-full transition-colors ${
                          food.isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
                        }`}
                      >
                        {food.isFavorite ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <h3 className="font-medium text-gray-800 group-hover:text-emerald-600 transition-colors">
                      {food.name}
                    </h3>
                    {food.brand && (
                      <p className="text-xs text-gray-500 mt-0.5">{food.brand}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">pour {food.per}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-gray-800">{food.calories}</p>
                        <p className="text-xs text-gray-500">kcal</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-blue-600">{food.protein}g</p>
                        <p className="text-xs text-gray-500">prot.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Aliment</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Calories</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Protéines</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Glucides</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Lipides</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Fibres</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">⭐</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFoods.map((food) => (
                      <tr
                        key={food.id}
                        onClick={() => openFoodDetail(food)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{food.image}</span>
                            <div>
                              <p className="font-medium text-gray-800">{food.name}</p>
                              <p className="text-xs text-gray-500">
                                {food.brand ? `${food.brand} • ` : ''}pour {food.per}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800">{food.calories}</td>
                        <td className="px-4 py-3 text-right text-blue-600">{food.protein}g</td>
                        <td className="px-4 py-3 text-right text-amber-600">{food.carbs}g</td>
                        <td className="px-4 py-3 text-right text-rose-600">{food.fat}g</td>
                        <td className="px-4 py-3 text-right text-gray-500">{food.fiber}g</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={(e) => toggleFavorite(food.id, e)}>
                            {food.isFavorite ? '❤️' : '🤍'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Load more */}
            {filteredFoods.length >= 12 && (
              <div className="mt-6 text-center">
                <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Charger plus d'aliments
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Food Detail Modal */}
      {showFoodDetail && selectedFood && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-4xl">{selectedFood.image}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedFood.name}</h2>
                    {selectedFood.brand && (
                      <p className="text-sm text-gray-500">{selectedFood.brand}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">pour {selectedFood.per}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFoodDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
              {/* Macros */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-800">{selectedFood.calories}</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedFood.protein}g</p>
                  <p className="text-xs text-gray-500">Protéines</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{selectedFood.carbs}g</p>
                  <p className="text-xs text-gray-500">Glucides</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-rose-600">{selectedFood.fat}g</p>
                  <p className="text-xs text-gray-500">Lipides</p>
                </div>
              </div>

              {/* Additional info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Fibres</span>
                  <span className="font-medium text-gray-800">{selectedFood.fiber}g</span>
                </div>
                {selectedFood.micronutrients && (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Sodium</span>
                      <span className="font-medium text-gray-800">{selectedFood.micronutrients.sodium}mg</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Potassium</span>
                      <span className="font-medium text-gray-800">{selectedFood.micronutrients.potassium}mg</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Fer</span>
                      <span className="font-medium text-gray-800">{selectedFood.micronutrients.iron}mg</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Zinc</span>
                      <span className="font-medium text-gray-800">{selectedFood.micronutrients.zinc}mg</span>
                    </div>
                  </>
                )}
              </div>

              {/* Standard portions */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Portions standards</h3>
                <div className="space-y-2">
                  {selectedFood.portions.map((portion, index) => {
                    const multiplier = portion.grams / 100;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{portion.label}</p>
                          <p className="text-sm text-gray-500">{portion.grams}g</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">{Math.round(selectedFood.calories * multiplier)} kcal</p>
                          <p className="text-xs text-gray-500">
                            P: {(selectedFood.protein * multiplier).toFixed(1)}g • 
                            G: {(selectedFood.carbs * multiplier).toFixed(1)}g • 
                            L: {(selectedFood.fat * multiplier).toFixed(1)}g
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={(e) => toggleFavorite(selectedFood.id, e)}
                className={`px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  selectedFood.isFavorite
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedFood.isFavorite ? '❤️ Favori' : '🤍 Ajouter aux favoris'}
              </button>
              <button className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors">
                Ajouter à mon repas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Scanner un code-barres</h2>
              <button
                onClick={() => setShowScannerModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-white"
              >
                ✕
              </button>
            </div>

            {/* Camera viewfinder placeholder */}
            <div className="bg-gray-800 rounded-2xl aspect-square flex items-center justify-center relative overflow-hidden">
              {/* Scan area overlay */}
              <div className="absolute inset-12 border-2 border-white/50 rounded-xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
              </div>
              
              {/* Scanning line animation */}
              <div className="absolute inset-12 overflow-hidden">
                <div className="h-0.5 bg-emerald-500 w-full animate-pulse" style={{ marginTop: '50%' }} />
              </div>

              <div className="text-center text-white">
                <span className="text-5xl">📷</span>
                <p className="mt-4">Placez le code-barres dans le cadre</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Scannez le code-barres d'un produit pour trouver ses informations nutritionnelles
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowScannerModal(false)}
                className="flex-1 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
              >
                Annuler
              </button>
              <button className="flex-1 py-3 bg-white text-gray-800 font-medium rounded-xl hover:bg-gray-100 transition-colors">
                📁 Importer une image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDatabaseWireframe;
