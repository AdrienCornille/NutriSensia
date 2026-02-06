import React, { useState } from 'react';

const RecipesWireframe = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    difficulty: [],
    time: [],
    diet: [],
  });
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);

  const tabs = [
    { id: 'discover', label: 'Découvrir', icon: '🔍' },
    { id: 'favorites', label: 'Favoris', icon: '❤️' },
    { id: 'recommended', label: 'Pour vous', icon: '✨' },
    { id: 'shopping', label: 'Liste de courses', icon: '🛒' },
  ];

  const categories = [
    { id: 'petit-dejeuner', label: 'Petit-déjeuner', emoji: '🌅' },
    { id: 'dejeuner', label: 'Déjeuner', emoji: '☀️' },
    { id: 'diner', label: 'Dîner', emoji: '🌙' },
    { id: 'collation', label: 'Collation', emoji: '🍎' },
    { id: 'dessert', label: 'Dessert', emoji: '🍰' },
    { id: 'boisson', label: 'Boisson', emoji: '🥤' },
  ];

  const filters = {
    difficulty: ['Facile', 'Moyen', 'Difficile'],
    time: ['< 15 min', '15-30 min', '30-60 min', '> 1h'],
    diet: ['Sans gluten', 'Sans lactose', 'Végétarien', 'Végan', 'Pauvre en sel', 'Riche en protéines'],
  };

  const recipes = [
    {
      id: 1,
      title: 'Bowl protéiné au poulet',
      image: '🥗',
      category: 'dejeuner',
      time: '25 min',
      difficulty: 'Facile',
      calories: 520,
      protein: 42,
      carbs: 45,
      fat: 18,
      rating: 4.8,
      reviews: 124,
      isFavorite: true,
      isRecommended: true,
      tags: ['Riche en protéines', 'Équilibré'],
      ingredients: [
        { name: 'Blanc de poulet', quantity: '150g' },
        { name: 'Riz complet', quantity: '80g (cru)' },
        { name: 'Avocat', quantity: '1/2' },
        { name: 'Tomates cerises', quantity: '100g' },
        { name: 'Concombre', quantity: '100g' },
        { name: 'Sauce soja', quantity: '1 c. à soupe' },
        { name: 'Huile de sésame', quantity: '1 c. à café' },
        { name: 'Graines de sésame', quantity: '1 c. à soupe' },
      ],
      steps: [
        'Cuire le riz complet selon les instructions du paquet.',
        'Griller le poulet dans une poêle avec un peu d\'huile d\'olive, assaisonner.',
        'Couper l\'avocat, les tomates et le concombre en morceaux.',
        'Assembler le bowl : riz au fond, puis poulet, légumes autour.',
        'Arroser de sauce soja et huile de sésame, parsemer de graines.',
      ],
      tips: 'Vous pouvez préparer le riz et le poulet à l\'avance pour un meal prep efficace.',
    },
    {
      id: 2,
      title: 'Overnight oats chocolat-banane',
      image: '🥣',
      category: 'petit-dejeuner',
      time: '10 min + repos',
      difficulty: 'Facile',
      calories: 385,
      protein: 14,
      carbs: 52,
      fat: 12,
      rating: 4.9,
      reviews: 89,
      isFavorite: true,
      isRecommended: true,
      tags: ['Préparation rapide', 'Sans cuisson'],
    },
    {
      id: 3,
      title: 'Saumon grillé et légumes rôtis',
      image: '🐟',
      category: 'diner',
      time: '35 min',
      difficulty: 'Moyen',
      calories: 480,
      protein: 38,
      carbs: 25,
      fat: 24,
      rating: 4.7,
      reviews: 56,
      isFavorite: false,
      isRecommended: true,
      tags: ['Oméga-3', 'Sans gluten'],
    },
    {
      id: 4,
      title: 'Smoothie vert énergisant',
      image: '🥬',
      category: 'collation',
      time: '5 min',
      difficulty: 'Facile',
      calories: 180,
      protein: 6,
      carbs: 32,
      fat: 4,
      rating: 4.5,
      reviews: 78,
      isFavorite: false,
      isRecommended: false,
      tags: ['Détox', 'Vitamines'],
    },
    {
      id: 5,
      title: 'Salade quinoa-feta-grenade',
      image: '🥙',
      category: 'dejeuner',
      time: '20 min',
      difficulty: 'Facile',
      calories: 420,
      protein: 18,
      carbs: 48,
      fat: 16,
      rating: 4.6,
      reviews: 92,
      isFavorite: true,
      isRecommended: false,
      tags: ['Végétarien', 'Frais'],
    },
    {
      id: 6,
      title: 'Poulet tikka masala léger',
      image: '🍛',
      category: 'diner',
      time: '45 min',
      difficulty: 'Moyen',
      calories: 450,
      protein: 35,
      carbs: 38,
      fat: 14,
      rating: 4.8,
      reviews: 134,
      isFavorite: false,
      isRecommended: true,
      tags: ['Épicé', 'Comfort food'],
    },
    {
      id: 7,
      title: 'Energy balls cacao-amande',
      image: '🍫',
      category: 'collation',
      time: '15 min',
      difficulty: 'Facile',
      calories: 95,
      protein: 3,
      carbs: 10,
      fat: 5,
      rating: 4.7,
      reviews: 67,
      isFavorite: true,
      isRecommended: false,
      tags: ['Sans sucre ajouté', 'Healthy'],
    },
    {
      id: 8,
      title: 'Omelette aux légumes',
      image: '🍳',
      category: 'petit-dejeuner',
      time: '15 min',
      difficulty: 'Facile',
      calories: 320,
      protein: 22,
      carbs: 8,
      fat: 22,
      rating: 4.4,
      reviews: 45,
      isFavorite: false,
      isRecommended: true,
      tags: ['Riche en protéines', 'Low carb'],
    },
  ];

  const shoppingList = {
    fromPlan: [
      { category: 'Protéines', items: [
        { name: 'Blanc de poulet', quantity: '450g', checked: false },
        { name: 'Filet de saumon', quantity: '300g', checked: false },
        { name: 'Œufs', quantity: '12', checked: true },
      ]},
      { category: 'Féculents', items: [
        { name: 'Riz basmati complet', quantity: '500g', checked: false },
        { name: 'Flocons d\'avoine', quantity: '400g', checked: true },
        { name: 'Quinoa', quantity: '300g', checked: false },
      ]},
      { category: 'Fruits & Légumes', items: [
        { name: 'Brocoli', quantity: '2 têtes', checked: false },
        { name: 'Bananes', quantity: '6', checked: false },
        { name: 'Avocat', quantity: '3', checked: false },
        { name: 'Tomates cerises', quantity: '500g', checked: false },
        { name: 'Haricots verts', quantity: '400g', checked: true },
      ]},
      { category: 'Produits laitiers', items: [
        { name: 'Yaourt grec nature', quantity: '4 pots', checked: false },
        { name: 'Lait demi-écrémé', quantity: '1L', checked: true },
      ]},
      { category: 'Autres', items: [
        { name: 'Amandes', quantity: '200g', checked: false },
        { name: 'Miel', quantity: '1 pot', checked: true },
        { name: 'Huile d\'olive', quantity: '1 bouteille', checked: false },
      ]},
    ],
    weekRange: 'Semaine du 13 au 19 janvier',
  };

  const filteredRecipes = recipes.filter((recipe) => {
    if (activeTab === 'favorites') return recipe.isFavorite;
    if (activeTab === 'recommended') return recipe.isRecommended;
    if (searchQuery) {
      return recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  const openRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const toggleFavorite = (recipeId, e) => {
    e.stopPropagation();
    // Toggle favorite logic here
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
                <h1 className="text-lg font-semibold text-gray-800">Recettes</h1>
                <p className="text-sm text-gray-500">{recipes.length} recettes disponibles</p>
              </div>
            </div>
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
                {tab.id === 'favorites' && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                    {recipes.filter(r => r.isFavorite).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Discover Tab */}
        {(activeTab === 'discover' || activeTab === 'favorites' || activeTab === 'recommended') && (
          <div className="space-y-6">
            {/* Search and filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Rechercher une recette, un ingrédient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-xl flex items-center gap-2 transition-colors ${
                  showFilters ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>🎛</span>
                <span className="font-medium">Filtres</span>
                {Object.values(selectedFilters).flat().length > 0 && (
                  <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {Object.values(selectedFilters).flat().length}
                  </span>
                )}
              </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Filtres</h3>
                  <button className="text-sm text-emerald-600 font-medium hover:underline">
                    Réinitialiser
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Difficulty */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Difficulté</p>
                    <div className="space-y-2">
                      {filters.difficulty.map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-emerald-500 rounded" />
                          <span className="text-sm text-gray-600">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Temps de préparation</p>
                    <div className="space-y-2">
                      {filters.time.map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-emerald-500 rounded" />
                          <span className="text-sm text-gray-600">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Diet */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Régime alimentaire</p>
                    <div className="space-y-2">
                      {filters.diet.map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-emerald-500 rounded" />
                          <span className="text-sm text-gray-600">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categories (only in discover) */}
            {activeTab === 'discover' && !searchQuery && (
              <div>
                <h2 className="font-semibold text-gray-800 mb-4">Catégories</h2>
                <div className="grid grid-cols-6 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className="p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-center"
                    >
                      <span className="text-3xl">{cat.emoji}</span>
                      <p className="text-sm font-medium text-gray-700 mt-2">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recipes grid */}
            <div>
              {activeTab === 'favorites' && (
                <h2 className="font-semibold text-gray-800 mb-4">
                  Vos recettes favorites ({recipes.filter(r => r.isFavorite).length})
                </h2>
              )}
              {activeTab === 'recommended' && (
                <h2 className="font-semibold text-gray-800 mb-4">
                  Recettes recommandées pour vous
                </h2>
              )}
              {activeTab === 'discover' && !searchQuery && (
                <h2 className="font-semibold text-gray-800 mb-4">Toutes les recettes</h2>
              )}
              {searchQuery && (
                <h2 className="font-semibold text-gray-800 mb-4">
                  Résultats pour "{searchQuery}" ({filteredRecipes.length})
                </h2>
              )}

              {filteredRecipes.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <span className="text-5xl">🍽</span>
                  <p className="text-gray-500 mt-4">Aucune recette trouvée</p>
                  {activeTab === 'favorites' && (
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                    >
                      Découvrir des recettes
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => openRecipe(recipe)}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      {/* Image */}
                      <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center relative">
                        <span className="text-6xl">{recipe.image}</span>
                        
                        {/* Favorite button */}
                        <button
                          onClick={(e) => toggleFavorite(recipe.id, e)}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            recipe.isFavorite
                              ? 'bg-red-500 text-white'
                              : 'bg-white/80 text-gray-400 hover:text-red-500'
                          }`}
                        >
                          {recipe.isFavorite ? '❤️' : '🤍'}
                        </button>

                        {/* Recommended badge */}
                        {recipe.isRecommended && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                            ✨ Recommandé
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                          {recipe.title}
                        </h3>
                        
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          <span>⏱ {recipe.time}</span>
                          <span>•</span>
                          <span>{recipe.difficulty}</span>
                        </div>

                        {/* Macros */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {recipe.calories} kcal
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            P: {recipe.protein}g
                          </span>
                          <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
                            G: {recipe.carbs}g
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-3">
                          <span className="text-amber-400">★</span>
                          <span className="text-sm font-medium text-gray-700">{recipe.rating}</span>
                          <span className="text-sm text-gray-400">({recipe.reviews} avis)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shopping List Tab */}
        {activeTab === 'shopping' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">Liste de courses</h2>
                  <p className="text-emerald-100 mt-1">{shoppingList.weekRange}</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                    📤 Partager
                  </button>
                  <button className="px-4 py-2 bg-white text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-colors">
                    🔄 Régénérer
                  </button>
                </div>
              </div>
            </div>

            {/* Shopping list content */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {shoppingList.fromPlan.map((category, index) => (
                <div key={category.category} className={index > 0 ? 'border-t border-gray-100' : ''}>
                  <div className="px-6 py-3 bg-gray-50">
                    <h3 className="font-medium text-gray-700">{category.category}</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="px-6 py-3 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            defaultChecked={item.checked}
                            className="w-5 h-5 text-emerald-500 rounded"
                          />
                          <span className={`${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Add custom item */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Ajouter un article</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Nom de l'article"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Quantité"
                  className="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                  Ajouter
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">Progression</span>
                <span className="text-sm text-gray-500">
                  {shoppingList.fromPlan.reduce((acc, cat) => acc + cat.items.filter(i => i.checked).length, 0)} / {shoppingList.fromPlan.reduce((acc, cat) => acc + cat.items.length, 0)} articles
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ 
                    width: `${(shoppingList.fromPlan.reduce((acc, cat) => acc + cat.items.filter(i => i.checked).length, 0) / shoppingList.fromPlan.reduce((acc, cat) => acc + cat.items.length, 0)) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Recipe Detail Modal */}
      {showRecipeModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Recipe header image */}
            <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center relative">
              <span className="text-8xl">{selectedRecipe.image}</span>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                ✕
              </button>
              <button
                onClick={(e) => toggleFavorite(selectedRecipe.id, e)}
                className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  selectedRecipe.isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-400 hover:text-red-500'
                }`}
              >
                {selectedRecipe.isFavorite ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
              {/* Title & meta */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedRecipe.title}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★</span>
                    <span className="font-medium">{selectedRecipe.rating}</span>
                    <span className="text-gray-400">({selectedRecipe.reviews} avis)</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600">⏱ {selectedRecipe.time}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600">{selectedRecipe.difficulty}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {selectedRecipe.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Nutrition */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">{selectedRecipe.calories}</p>
                  <p className="text-sm text-gray-500">kcal</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedRecipe.protein}g</p>
                  <p className="text-sm text-gray-500">Protéines</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">{selectedRecipe.carbs}g</p>
                  <p className="text-sm text-gray-500">Glucides</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-rose-600">{selectedRecipe.fat}g</p>
                  <p className="text-sm text-gray-500">Lipides</p>
                </div>
              </div>

              {/* Ingredients */}
              {selectedRecipe.ingredients && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Ingrédients</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ing, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{ing.name}</span>
                          <span className="text-gray-500">{ing.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Steps */}
              {selectedRecipe.steps && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Préparation</h3>
                  <div className="space-y-3">
                    {selectedRecipe.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 font-medium">{index + 1}</span>
                        </div>
                        <p className="text-gray-700 pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {selectedRecipe.tips && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                      <p className="font-medium text-amber-800">Astuce</p>
                      <p className="text-sm text-amber-700 mt-1">{selectedRecipe.tips}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <span>🛒</span>
                Ajouter à ma liste
              </button>
              <button className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                <span>📋</span>
                Ajouter à mon plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesWireframe;
