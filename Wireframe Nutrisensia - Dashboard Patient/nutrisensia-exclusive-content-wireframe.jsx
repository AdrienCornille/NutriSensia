import React, { useState } from 'react';

const ExclusiveContentWireframe = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const tabs = [
    { id: 'all', label: 'Tout', icon: '📚' },
    { id: 'articles', label: 'Articles', icon: '📝' },
    { id: 'videos', label: 'Vidéos', icon: '🎬' },
    { id: 'guides', label: 'Guides', icon: '📖' },
    { id: 'podcasts', label: 'Podcasts', icon: '🎙' },
    { id: 'saved', label: 'Sauvegardés', icon: '🔖' },
  ];

  const categories = [
    { id: 'nutrition-basics', label: 'Bases de la nutrition', color: 'bg-blue-100 text-blue-700' },
    { id: 'recipes-tips', label: 'Astuces cuisine', color: 'bg-amber-100 text-amber-700' },
    { id: 'psychology', label: 'Psychologie alimentaire', color: 'bg-purple-100 text-purple-700' },
    { id: 'sport', label: 'Sport & nutrition', color: 'bg-green-100 text-green-700' },
    { id: 'health', label: 'Santé', color: 'bg-red-100 text-red-700' },
    { id: 'lifestyle', label: 'Mode de vie', color: 'bg-teal-100 text-teal-700' },
  ];

  const featuredContent = {
    id: 'featured-1',
    type: 'article',
    title: 'Comment maintenir sa motivation sur le long terme',
    description: 'Découvrez les stratégies scientifiquement prouvées pour rester motivé dans votre parcours nutritionnel, même quand la routine s\'installe.',
    image: '🧠',
    category: 'psychology',
    author: 'Lucie Martin',
    readTime: '8 min',
    date: '15 janvier 2026',
    isNew: true,
    isSaved: false,
  };

  const contents = [
    {
      id: 1,
      type: 'video',
      title: 'Meal prep du dimanche : organiser sa semaine',
      description: 'Apprenez à préparer vos repas de la semaine en 2 heures chrono.',
      image: '🎬',
      category: 'recipes-tips',
      author: 'Lucie Martin',
      duration: '18 min',
      date: '12 janvier 2026',
      isNew: true,
      isSaved: true,
      views: 1243,
    },
    {
      id: 2,
      type: 'article',
      title: 'Comprendre les macronutriments',
      description: 'Protéines, glucides, lipides : tout ce que vous devez savoir pour équilibrer votre assiette.',
      image: '📊',
      category: 'nutrition-basics',
      author: 'Lucie Martin',
      readTime: '12 min',
      date: '10 janvier 2026',
      isNew: false,
      isSaved: false,
      views: 2891,
    },
    {
      id: 3,
      type: 'guide',
      title: 'Guide complet : Lire les étiquettes nutritionnelles',
      description: 'Ne vous faites plus avoir par le marketing. Apprenez à décrypter les étiquettes comme un pro.',
      image: '🏷',
      category: 'nutrition-basics',
      author: 'Lucie Martin',
      readTime: '15 min',
      date: '8 janvier 2026',
      isNew: false,
      isSaved: true,
      pages: 12,
      downloadable: true,
    },
    {
      id: 4,
      type: 'podcast',
      title: 'Épisode 5 : Gérer les fêtes sans culpabiliser',
      description: 'Comment profiter des repas de fête tout en maintenant ses objectifs.',
      image: '🎙',
      category: 'psychology',
      author: 'Lucie Martin',
      duration: '32 min',
      date: '5 janvier 2026',
      isNew: false,
      isSaved: false,
      listens: 567,
    },
    {
      id: 5,
      type: 'video',
      title: '5 recettes healthy en moins de 15 minutes',
      description: 'Des idées de repas rapides pour les soirs de semaine chargés.',
      image: '⏱',
      category: 'recipes-tips',
      author: 'Lucie Martin',
      duration: '12 min',
      date: '3 janvier 2026',
      isNew: false,
      isSaved: false,
      views: 3421,
    },
    {
      id: 6,
      type: 'article',
      title: 'L\'importance du sommeil dans la perte de poids',
      description: 'Pourquoi dormir suffisamment est aussi important que bien manger.',
      image: '😴',
      category: 'health',
      author: 'Lucie Martin',
      readTime: '6 min',
      date: '1 janvier 2026',
      isNew: false,
      isSaved: true,
      views: 1876,
    },
    {
      id: 7,
      type: 'guide',
      title: 'Nutrition et sport : adapter son alimentation',
      description: 'Comment manger avant, pendant et après l\'effort selon votre activité.',
      image: '🏃',
      category: 'sport',
      author: 'Lucie Martin',
      readTime: '20 min',
      date: '28 décembre 2025',
      isNew: false,
      isSaved: false,
      pages: 18,
      downloadable: true,
    },
    {
      id: 8,
      type: 'article',
      title: 'Hydratation : combien d\'eau boire vraiment ?',
      description: 'Démêlez le vrai du faux sur les besoins en eau et les signes de déshydratation.',
      image: '💧',
      category: 'nutrition-basics',
      author: 'Lucie Martin',
      readTime: '5 min',
      date: '25 décembre 2025',
      isNew: false,
      isSaved: false,
      views: 2134,
    },
  ];

  const progressCourses = [
    {
      id: 'course-1',
      title: 'Les fondamentaux de la nutrition',
      modules: 8,
      completedModules: 5,
      image: '🎓',
    },
    {
      id: 'course-2',
      title: 'Maîtriser ses envies',
      modules: 6,
      completedModules: 2,
      image: '🧘',
    },
  ];

  const filteredContents = contents.filter((content) => {
    if (activeTab === 'saved') return content.isSaved;
    if (activeTab !== 'all' && activeTab !== 'saved') {
      const typeMap = {
        articles: 'article',
        videos: 'video',
        guides: 'guide',
        podcasts: 'podcast',
      };
      if (content.type !== typeMap[activeTab]) return false;
    }
    if (searchQuery) {
      return content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             content.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return '🎬';
      case 'article': return '📝';
      case 'guide': return '📖';
      case 'podcast': return '🎙';
      default: return '📄';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'video': return 'Vidéo';
      case 'article': return 'Article';
      case 'guide': return 'Guide';
      case 'podcast': return 'Podcast';
      default: return 'Contenu';
    }
  };

  const getCategoryStyle = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : 'bg-gray-100 text-gray-700';
  };

  const getCategoryLabel = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.label : categoryId;
  };

  const openContent = (content) => {
    setSelectedContent(content);
    if (content.type === 'video') {
      setShowVideoPlayer(true);
    } else {
      setShowContentModal(true);
    }
  };

  const toggleSave = (contentId, e) => {
    e.stopPropagation();
    // Toggle save logic
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
                <h1 className="text-lg font-semibold text-gray-800">Contenu exclusif</h1>
                <p className="text-sm text-gray-500">Ressources réservées aux patients NutriSensia</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'saved' && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                    {contents.filter(c => c.isSaved).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Featured content */}
        {activeTab === 'all' && !searchQuery && (
          <div className="mb-8">
            <div
              onClick={() => openContent(featuredContent)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white cursor-pointer hover:shadow-xl transition-shadow relative overflow-hidden"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative flex items-start justify-between">
                <div className="flex-1 max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-white/20 rounded-full text-sm">✨ À la une</span>
                    {featuredContent.isNew && (
                      <span className="px-2 py-1 bg-amber-400 text-amber-900 rounded-full text-sm font-medium">Nouveau</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{featuredContent.title}</h2>
                  <p className="text-emerald-100 mb-4">{featuredContent.description}</p>
                  <div className="flex items-center gap-4 text-sm text-emerald-100">
                    <span>{getTypeIcon(featuredContent.type)} {getTypeLabel(featuredContent.type)}</span>
                    <span>•</span>
                    <span>⏱ {featuredContent.readTime}</span>
                    <span>•</span>
                    <span>Par {featuredContent.author}</span>
                  </div>
                </div>
                <div className="text-8xl opacity-50">{featuredContent.image}</div>
              </div>
            </div>
          </div>
        )}

        {/* Progress courses */}
        {activeTab === 'all' && !searchQuery && progressCourses.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-gray-800 mb-4">Continuer votre apprentissage</h2>
            <div className="grid grid-cols-2 gap-4">
              {progressCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <span className="text-3xl">{course.image}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{course.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {course.completedModules} / {course.modules} modules complétés
                      </p>
                      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(course.completedModules / course.modules) * 100}%` }}
                        />
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition-colors">
                      Continuer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories filter */}
        {activeTab === 'all' && !searchQuery && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">Explorer par thème</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors hover:opacity-80 ${cat.color}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content grid */}
        <div>
          {activeTab !== 'all' && (
            <h2 className="font-semibold text-gray-800 mb-4">
              {activeTab === 'saved' 
                ? `Contenu sauvegardé (${filteredContents.length})`
                : `${tabs.find(t => t.id === activeTab)?.label} (${filteredContents.length})`
              }
            </h2>
          )}
          {activeTab === 'all' && !searchQuery && (
            <h2 className="font-semibold text-gray-800 mb-4">Dernières publications</h2>
          )}
          {searchQuery && (
            <h2 className="font-semibold text-gray-800 mb-4">
              Résultats pour "{searchQuery}" ({filteredContents.length})
            </h2>
          )}

          {filteredContents.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <span className="text-5xl">📚</span>
              <p className="text-gray-500 mt-4">Aucun contenu trouvé</p>
              {activeTab === 'saved' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  Explorer le contenu
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filteredContents.map((content) => (
                <div
                  key={content.id}
                  onClick={() => openContent(content)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    <span className="text-6xl opacity-50">{content.image}</span>
                    
                    {/* Type badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1">
                      <span>{getTypeIcon(content.type)}</span>
                      <span>{getTypeLabel(content.type)}</span>
                    </div>

                    {/* Save button */}
                    <button
                      onClick={(e) => toggleSave(content.id, e)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        content.isSaved
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/90 text-gray-400 hover:text-emerald-500'
                      }`}
                    >
                      {content.isSaved ? '🔖' : '🔖'}
                    </button>

                    {/* New badge */}
                    {content.isNew && (
                      <div className="absolute bottom-3 left-3 px-2 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-medium">
                        Nouveau
                      </div>
                    )}

                    {/* Play button for videos */}
                    {content.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-2xl ml-1">▶️</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryStyle(content.category)}`}>
                        {getCategoryLabel(content.category)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {content.title}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {content.description}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>
                          {content.type === 'video' || content.type === 'podcast' 
                            ? `⏱ ${content.duration}`
                            : content.type === 'guide'
                            ? `📄 ${content.pages} pages`
                            : `⏱ ${content.readTime}`
                          }
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{content.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load more */}
          {filteredContents.length >= 6 && (
            <div className="mt-8 text-center">
              <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Charger plus de contenu
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Article/Guide Modal */}
      {showContentModal && selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Header image */}
            <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center relative">
              <span className="text-8xl opacity-50">{selectedContent.image}</span>
              <button
                onClick={() => setShowContentModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                ✕
              </button>
              <button
                onClick={(e) => toggleSave(selectedContent.id, e)}
                className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  selectedContent.isSaved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/90 text-gray-400 hover:text-emerald-500'
                }`}
              >
                🔖
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-12rem)]">
              {/* Meta */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryStyle(selectedContent.category)}`}>
                  {getCategoryLabel(selectedContent.category)}
                </span>
                {selectedContent.isNew && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    Nouveau
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedContent.title}</h2>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    LM
                  </div>
                  <span>{selectedContent.author}</span>
                </div>
                <span>•</span>
                <span>{selectedContent.date}</span>
                <span>•</span>
                <span>
                  {selectedContent.type === 'guide' 
                    ? `${selectedContent.pages} pages`
                    : selectedContent.readTime
                  }
                </span>
                {selectedContent.views && (
                  <>
                    <span>•</span>
                    <span>{selectedContent.views.toLocaleString()} lectures</span>
                  </>
                )}
              </div>

              {/* Article content placeholder */}
              <div className="prose prose-emerald max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {selectedContent.description}
                </p>
                
                <div className="my-8 p-6 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 text-center">
                    [Contenu de l'article...]
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Points clés à retenir</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span className="text-gray-600">Premier point important de l'article</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span className="text-gray-600">Deuxième point important de l'article</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span className="text-gray-600">Troisième point important de l'article</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  📤 Partager
                </button>
                {selectedContent.downloadable && (
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    📥 Télécharger PDF
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowContentModal(false)}
                className="px-6 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showVideoPlayer && selectedContent && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedContent.title}</h2>
                <p className="text-gray-400 mt-1">{selectedContent.duration} • Par {selectedContent.author}</p>
              </div>
              <button
                onClick={() => setShowVideoPlayer(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-white"
              >
                ✕
              </button>
            </div>

            {/* Video player placeholder */}
            <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/20 transition-colors">
                  <span className="text-4xl ml-2">▶️</span>
                </div>
                <p className="text-white">Cliquez pour lire la vidéo</p>
              </div>

              {/* Video controls placeholder */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-4">
                  <button className="text-white">⏸</button>
                  <div className="flex-1 h-1 bg-white/30 rounded-full">
                    <div className="w-1/3 h-full bg-emerald-500 rounded-full" />
                  </div>
                  <span className="text-white text-sm">6:12 / 18:00</span>
                  <button className="text-white">🔊</button>
                  <button className="text-white">⛶</button>
                </div>
              </div>
            </div>

            {/* Video info */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => toggleSave(selectedContent.id, e)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    selectedContent.isSaved
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  🔖 {selectedContent.isSaved ? 'Sauvegardé' : 'Sauvegarder'}
                </button>
                <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                  📤 Partager
                </button>
              </div>
              <span className="text-gray-400 text-sm">
                {selectedContent.views?.toLocaleString()} vues
              </span>
            </div>

            {/* Description */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <p className="text-gray-300">{selectedContent.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExclusiveContentWireframe;
