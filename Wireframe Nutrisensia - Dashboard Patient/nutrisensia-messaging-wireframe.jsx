import React, { useState, useRef, useEffect } from 'react';

const MessagingWireframe = () => {
  const [messageInput, setMessageInput] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);

  const nutritionist = {
    name: 'Lucie Martin',
    title: 'Nutritionniste diplômée',
    avatar: 'LM',
    status: 'online', // online, offline, away
    responseTime: 'Répond généralement en quelques heures',
  };

  const messages = [
    {
      id: 1,
      type: 'system',
      content: 'Conversation démarrée le 15 décembre 2025',
      timestamp: '15 déc. 2025',
    },
    {
      id: 2,
      sender: 'nutritionist',
      content: 'Bonjour Jean ! Bienvenue sur NutriSensia. Je suis ravie de vous accompagner dans votre parcours. N\'hésitez pas à me poser vos questions ici, je vous répondrai dans les meilleurs délais.',
      timestamp: '15 déc. 2025, 10:30',
      read: true,
    },
    {
      id: 3,
      sender: 'patient',
      content: 'Bonjour Lucie, merci pour la consultation d\'hier ! J\'ai une question concernant le petit-déjeuner : est-ce que je peux remplacer les flocons d\'avoine par du muesli ?',
      timestamp: '16 déc. 2025, 08:15',
      read: true,
    },
    {
      id: 4,
      sender: 'nutritionist',
      content: 'Bonjour Jean ! Oui, vous pouvez remplacer par du muesli, mais attention à bien choisir un muesli sans sucres ajoutés. Vérifiez que la liste des ingrédients ne contienne pas de "sucre", "sirop de glucose" ou "miel" dans les premiers ingrédients. Je vous recommande le muesli bio de la marque Familia, disponible chez Migros.',
      timestamp: '16 déc. 2025, 11:42',
      read: true,
    },
    {
      id: 5,
      sender: 'patient',
      content: 'Parfait, merci pour la recommandation ! Je vais essayer celui-là.',
      timestamp: '16 déc. 2025, 12:05',
      read: true,
    },
    {
      id: 6,
      type: 'system',
      content: 'Nouvelle semaine de suivi',
      timestamp: '6 jan. 2026',
    },
    {
      id: 7,
      sender: 'patient',
      content: 'Bonjour Lucie, j\'ai une question sur les collations. Le plan prévoit un yaourt grec + amandes, mais je n\'aime pas trop les amandes. Par quoi puis-je les remplacer ?',
      timestamp: '6 jan. 2026, 16:20',
      read: true,
    },
    {
      id: 8,
      sender: 'nutritionist',
      content: 'Bonjour Jean ! Pas de problème, vous pouvez remplacer les amandes par :\n\n• Des noix de cajou (même quantité)\n• Des noisettes\n• Des graines de courge\n• Un carré de chocolat noir 85%\n\nL\'important est de garder cette source de bons lipides pour la satiété. Dites-moi ce que vous préférez et j\'ajusterai votre plan !',
      timestamp: '6 jan. 2026, 18:05',
      read: true,
    },
    {
      id: 9,
      sender: 'patient',
      content: 'Super, je vais partir sur les noix de cajou alors ! Merci 🙏',
      timestamp: '6 jan. 2026, 18:30',
      read: true,
    },
    {
      id: 10,
      type: 'plan-modification',
      content: 'Demande de modification du plan alimentaire',
      detail: 'Remplacement des amandes par des noix de cajou dans la collation',
      status: 'approved',
      timestamp: '7 jan. 2026, 09:00',
    },
    {
      id: 11,
      sender: 'nutritionist',
      content: 'C\'est noté ! J\'ai mis à jour votre plan alimentaire avec les noix de cajou. Vous pouvez voir la modification dans l\'onglet "Plan alimentaire". Bonne continuation ! 💪',
      timestamp: '7 jan. 2026, 09:15',
      read: true,
    },
    {
      id: 12,
      type: 'system',
      content: 'Aujourd\'hui',
      timestamp: "Aujourd'hui",
    },
    {
      id: 13,
      sender: 'patient',
      content: 'Bonjour ! J\'ai une question sur l\'hydratation. Est-ce que le thé compte dans les 2L d\'eau par jour ?',
      timestamp: '10:30',
      read: true,
    },
    {
      id: 14,
      sender: 'nutritionist',
      content: 'Bonjour Jean ! Oui, le thé (et les tisanes) comptent dans votre hydratation quotidienne. Par contre, limitez le café à 2-3 tasses car la caféine a un léger effet diurétique. L\'idéal reste de boire au moins 1L d\'eau pure en plus de vos autres boissons.',
      timestamp: '11:15',
      read: true,
    },
    {
      id: 15,
      sender: 'patient',
      type: 'image',
      content: 'photo_repas.jpg',
      imageUrl: null,
      caption: 'Mon déjeuner d\'aujourd\'hui, est-ce que les proportions vous semblent bonnes ?',
      timestamp: '12:45',
      read: true,
    },
    {
      id: 16,
      sender: 'nutritionist',
      content: 'Excellent choix ! Les proportions sont parfaites 👏 Belle assiette équilibrée avec des légumes, des protéines et des féculents. Continuez comme ça !',
      timestamp: '14:20',
      read: false,
    },
  ];

  const quickReplies = [
    'Merci beaucoup !',
    'J\'ai une question...',
    'Puis-je modifier mon plan ?',
    'À quelle heure puis-je vous appeler ?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-amber-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'En ligne';
      case 'away': return 'Absent';
      default: return 'Hors ligne';
    }
  };

  const renderMessage = (message) => {
    // System message
    if (message.type === 'system') {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
            {message.content}
          </span>
        </div>
      );
    }

    // Plan modification message
    if (message.type === 'plan-modification') {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <div className={`px-4 py-3 rounded-xl max-w-md ${
            message.status === 'approved' 
              ? 'bg-emerald-50 border border-emerald-200' 
              : message.status === 'pending'
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{message.status === 'approved' ? '✅' : message.status === 'pending' ? '⏳' : '❌'}</span>
              <span className={`text-sm font-medium ${
                message.status === 'approved' ? 'text-emerald-700' : 
                message.status === 'pending' ? 'text-amber-700' : 'text-red-700'
              }`}>
                {message.content}
              </span>
            </div>
            <p className="text-sm text-gray-600">{message.detail}</p>
            <p className="text-xs text-gray-400 mt-2">{message.timestamp}</p>
          </div>
        </div>
      );
    }

    const isPatient = message.sender === 'patient';

    return (
      <div
        key={message.id}
        className={`flex ${isPatient ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-end gap-2 max-w-[70%] ${isPatient ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          {!isPatient && (
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {nutritionist.avatar}
            </div>
          )}

          {/* Message bubble */}
          <div>
            {/* Image message */}
            {message.type === 'image' ? (
              <div className={`rounded-2xl overflow-hidden ${
                isPatient ? 'bg-emerald-500' : 'bg-white border border-gray-200'
              }`}>
                <div 
                  className="w-64 h-48 bg-gray-200 flex items-center justify-center cursor-pointer hover:opacity-90"
                  onClick={() => {
                    setSelectedImage(message);
                    setShowImagePreview(true);
                  }}
                >
                  <div className="text-center">
                    <span className="text-4xl">🍽</span>
                    <p className="text-sm text-gray-500 mt-2">Photo du repas</p>
                  </div>
                </div>
                {message.caption && (
                  <p className={`px-4 py-2 text-sm ${isPatient ? 'text-white' : 'text-gray-800'}`}>
                    {message.caption}
                  </p>
                )}
              </div>
            ) : (
              /* Text message */
              <div
                className={`px-4 py-3 rounded-2xl ${
                  isPatient
                    ? 'bg-emerald-500 text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            )}

            {/* Timestamp & read status */}
            <div className={`flex items-center gap-1 mt-1 ${isPatient ? 'justify-end' : 'justify-start'}`}>
              <span className="text-xs text-gray-400">{message.timestamp}</span>
              {isPatient && (
                <span className="text-xs">
                  {message.read ? (
                    <span className="text-emerald-500">✓✓</span>
                  ) : (
                    <span className="text-gray-400">✓</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                ← Retour
              </button>
              
              {/* Nutritionist info */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium">
                    {nutritionist.avatar}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(nutritionist.status)} rounded-full border-2 border-white`} />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-800">{nutritionist.name}</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{nutritionist.title}</span>
                    <span className="text-gray-300">•</span>
                    <span className={`text-sm ${
                      nutritionist.status === 'online' ? 'text-emerald-600' : 'text-gray-500'
                    }`}>
                      {getStatusText(nutritionist.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Appel vidéo">
                📹
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Informations">
                ℹ️
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Response time banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-2">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-blue-700 text-center">
            💬 {nutritionist.responseTime}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Security notice */}
          <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-start gap-3">
              <span className="text-emerald-500 text-xl">🔒</span>
              <div>
                <p className="text-sm font-medium text-emerald-800">Messagerie sécurisée</p>
                <p className="text-sm text-emerald-700 mt-1">
                  Vos échanges sont confidentiels et protégés. Cette messagerie est réservée aux questions liées à votre suivi nutritionnel.
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-1">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Quick replies */}
      <div className="bg-white border-t border-gray-100 px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => setMessageInput(reply)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full whitespace-nowrap hover:bg-gray-200 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            {/* Attachment button */}
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-3 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                📎
              </button>

              {/* Attachment menu */}
              {showAttachMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <span className="text-xl">📷</span>
                    <span>Photo</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <span className="text-xl">📄</span>
                    <span>Document</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <span className="text-xl">🍽</span>
                    <span>Photo de repas</span>
                  </button>
                </div>
              )}
            </div>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Écrivez votre message..."
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>

            {/* Send button */}
            <button
              disabled={!messageInput.trim()}
              className={`p-3 rounded-full transition-colors ${
                messageInput.trim()
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Character count for long messages */}
          {messageInput.length > 200 && (
            <p className="text-xs text-gray-400 mt-2 text-right">
              {messageInput.length} / 1000 caractères
            </p>
          )}
        </div>
      </div>

      {/* Image preview modal */}
      {showImagePreview && selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <div className="text-white">
                <p className="font-medium">Photo partagée</p>
                <p className="text-sm text-gray-400">{selectedImage.timestamp}</p>
              </div>
              <button
                onClick={() => setShowImagePreview(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl">🍽</span>
                  <p className="text-white mt-4">Aperçu de la photo</p>
                </div>
              </div>
            </div>

            {selectedImage.caption && (
              <p className="text-white mt-4">{selectedImage.caption}</p>
            )}

            <div className="flex justify-center gap-4 mt-6">
              <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                📥 Télécharger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Typing indicator (hidden by default, shown when nutritionist is typing) */}
      {false && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2">
          <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-gray-500">Lucie écrit...</span>
          </div>
        </div>
      )}

      {/* Emergency notice */}
      <div className="fixed bottom-32 right-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium text-gray-800">Urgence médicale ?</p>
              <p className="text-xs text-gray-500 mt-1">
                Cette messagerie n'est pas adaptée aux urgences. Contactez votre médecin ou le 144.
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingWireframe;
