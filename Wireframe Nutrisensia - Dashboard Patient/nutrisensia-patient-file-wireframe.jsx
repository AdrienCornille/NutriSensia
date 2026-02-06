import React, { useState } from 'react';

const PatientFileWireframe = () => {
  const [activeTab, setActiveTab] = useState('anamnese');
  const [expandedSection, setExpandedSection] = useState('habitudes');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const tabs = [
    { id: 'anamnese', label: 'Anamnèse', icon: '📋' },
    { id: 'questionnaires', label: 'Questionnaires', icon: '📝' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'consultations', label: 'Consultations', icon: '🗓' },
    { id: 'objectifs', label: 'Objectifs', icon: '🎯' },
  ];

  const anamneseData = {
    createdAt: '15 décembre 2025',
    updatedAt: null,
    nutritionist: 'Lucie Martin',
    sections: {
      identite: {
        label: 'Identité & Contact',
        icon: '👤',
        fields: [
          { label: 'Nom complet', value: 'Jean Dupont' },
          { label: 'Date de naissance', value: '12 mars 1988 (37 ans)' },
          { label: 'Sexe', value: 'Masculin' },
          { label: 'Profession', value: 'Ingénieur informatique' },
          { label: 'Situation familiale', value: 'Marié, 2 enfants' },
        ],
      },
      morphologie: {
        label: 'Données morphologiques',
        icon: '📏',
        fields: [
          { label: 'Taille', value: '178 cm' },
          { label: 'Poids initial', value: '82.0 kg' },
          { label: 'IMC initial', value: '25.9 (Surpoids léger)' },
          { label: 'Tour de taille initial', value: '89 cm' },
          { label: 'Masse grasse estimée', value: '24%' },
        ],
      },
      historique: {
        label: 'Historique pondéral',
        icon: '📊',
        fields: [
          { label: 'Poids minimum adulte', value: '72 kg (2015)' },
          { label: 'Poids maximum adulte', value: '85 kg (2023)' },
          { label: 'Variations notables', value: 'Prise de 8 kg après naissance du 2e enfant' },
          { label: 'Régimes antérieurs', value: 'Régime Dukan (2019) - abandonné après 2 mois, effet yoyo' },
        ],
      },
      sante: {
        label: 'Antécédents médicaux',
        icon: '🏥',
        fields: [
          { label: 'Pathologies', value: 'Aucune pathologie chronique déclarée' },
          { label: 'Allergies alimentaires', value: 'Aucune' },
          { label: 'Intolérances', value: 'Légère intolérance au lactose' },
          { label: 'Traitements en cours', value: 'Aucun' },
          { label: 'Compléments alimentaires', value: 'Vitamine D (octobre à mars)' },
          { label: 'Antécédents familiaux', value: 'Diabète type 2 (père), Hypertension (mère)' },
        ],
      },
      habitudes: {
        label: 'Habitudes alimentaires',
        icon: '🍽',
        fields: [
          { label: 'Nombre de repas/jour', value: '3 repas + 1 collation' },
          { label: 'Petit-déjeuner type', value: 'Café + tartines beurre/confiture, parfois sauté' },
          { label: 'Déjeuner type', value: 'Cantine entreprise, choix variable' },
          { label: 'Dîner type', value: 'Repas familial, cuisine maison' },
          { label: 'Grignotage', value: 'Fréquent en soirée (biscuits, fromage)' },
          { label: 'Consommation d\'alcool', value: '2-3 verres de vin/semaine' },
          { label: 'Hydratation', value: 'Insuffisante (~1L/jour)' },
          { label: 'Aliments détestés', value: 'Choux de Bruxelles, abats' },
        ],
      },
      lifestyle: {
        label: 'Mode de vie',
        icon: '🏃',
        fields: [
          { label: 'Activité professionnelle', value: 'Sédentaire (bureau)' },
          { label: 'Activité physique', value: 'Course à pied 1x/semaine, irrégulier' },
          { label: 'Temps d\'écran', value: '8-10h/jour (travail + loisirs)' },
          { label: 'Qualité du sommeil', value: 'Moyenne, coucher tardif (~23h30)' },
          { label: 'Niveau de stress', value: 'Modéré à élevé (charge de travail)' },
          { label: 'Tabac', value: 'Non-fumeur' },
        ],
      },
      motivation: {
        label: 'Motivation & Objectifs',
        icon: '💪',
        fields: [
          { label: 'Raison de consultation', value: 'Perte de poids, améliorer l\'énergie au quotidien' },
          { label: 'Objectif pondéral', value: 'Atteindre 75 kg' },
          { label: 'Motivation principale', value: 'Être en meilleure forme pour jouer avec ses enfants' },
          { label: 'Freins identifiés', value: 'Manque de temps, grignotage émotionnel le soir' },
          { label: 'Soutien entourage', value: 'Épouse motivée à adapter les repas familiaux' },
        ],
      },
    },
  };

  const questionnaires = [
    {
      id: 1,
      title: 'Questionnaire initial',
      type: 'Anamnèse',
      date: '15 décembre 2025',
      status: 'completed',
      consultationLinked: 'Première consultation',
    },
    {
      id: 2,
      title: 'Bilan 1 mois',
      type: 'Suivi',
      date: '15 janvier 2026',
      status: 'completed',
      consultationLinked: 'Consultation de suivi #1',
    },
    {
      id: 3,
      title: 'Questionnaire satisfaction',
      type: 'Feedback',
      date: null,
      status: 'pending',
      consultationLinked: null,
    },
  ];

  const documents = [
    {
      id: 1,
      name: 'Analyse sanguine - Décembre 2025',
      type: 'pdf',
      size: '245 Ko',
      uploadedAt: '14 décembre 2025',
      uploadedBy: 'patient',
      category: 'Analyses',
    },
    {
      id: 2,
      name: 'Plan alimentaire - Semaine 1-4',
      type: 'pdf',
      size: '180 Ko',
      uploadedAt: '15 décembre 2025',
      uploadedBy: 'nutritionist',
      category: 'Plans',
    },
    {
      id: 3,
      name: 'Guide des portions',
      type: 'pdf',
      size: '1.2 Mo',
      uploadedAt: '15 décembre 2025',
      uploadedBy: 'nutritionist',
      category: 'Ressources',
    },
    {
      id: 4,
      name: 'Analyse sanguine - Janvier 2026',
      type: 'pdf',
      size: '252 Ko',
      uploadedAt: '10 janvier 2026',
      uploadedBy: 'patient',
      category: 'Analyses',
    },
  ];

  const consultations = [
    {
      id: 1,
      date: '15 décembre 2025',
      type: 'Première consultation',
      duration: '60 min',
      mode: 'Cabinet',
      summary: 'Prise de connaissance, anamnèse complète, définition des objectifs. Mise en place du premier plan alimentaire.',
      keyPoints: [
        'Objectif: -7 kg sur 6 mois',
        'Priorité: réduire le grignotage du soir',
        'Augmenter l\'hydratation à 2L/jour',
        'Introduire un petit-déjeuner protéiné',
      ],
      nextSteps: 'Suivi dans 1 mois pour évaluer l\'adhérence au plan',
    },
    {
      id: 2,
      date: '15 janvier 2026',
      type: 'Consultation de suivi',
      duration: '30 min',
      mode: 'Visio',
      summary: 'Bon démarrage, perte de 1.6 kg. Grignotage réduit mais pas éliminé. Hydratation en amélioration.',
      keyPoints: [
        'Poids: 80.4 kg (-1.6 kg)',
        'Petit-déjeuner bien intégré',
        'Grignotage réduit à 3x/semaine',
        'Sommeil légèrement amélioré',
      ],
      nextSteps: 'Continuer le plan actuel, focus sur l\'activité physique',
    },
  ];

  const objectives = [
    {
      id: 1,
      title: 'Atteindre 75 kg',
      category: 'Poids',
      target: '75 kg',
      current: '78.4 kg',
      startValue: '82.0 kg',
      progress: 51,
      deadline: '15 juin 2026',
      status: 'on-track',
    },
    {
      id: 2,
      title: 'Hydratation quotidienne',
      category: 'Habitude',
      target: '2L / jour',
      current: '1.8L en moyenne',
      startValue: '1L / jour',
      progress: 80,
      deadline: null,
      status: 'on-track',
    },
    {
      id: 3,
      title: 'Éliminer le grignotage du soir',
      category: 'Comportement',
      target: '0x / semaine',
      current: '3x / semaine',
      startValue: '5-6x / semaine',
      progress: 50,
      deadline: null,
      status: 'in-progress',
    },
    {
      id: 4,
      title: 'Activité physique régulière',
      category: 'Habitude',
      target: '3 séances / semaine',
      current: '1-2 séances / semaine',
      startValue: '1 séance / semaine',
      progress: 40,
      deadline: null,
      status: 'needs-attention',
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      'on-track': 'bg-emerald-100 text-emerald-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'needs-attention': 'bg-amber-100 text-amber-700',
      'completed': 'bg-emerald-100 text-emerald-700',
      'pending': 'bg-gray-100 text-gray-600',
    };
    const labels = {
      'on-track': 'En bonne voie',
      'in-progress': 'En cours',
      'needs-attention': 'À améliorer',
      'completed': 'Complété',
      'pending': 'En attente',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

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
                <h1 className="text-lg font-semibold text-gray-800">Mon dossier</h1>
                <p className="text-sm text-gray-500">Votre historique et documents médicaux</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <span>📥</span>
              <span className="text-sm font-medium">Exporter mon dossier</span>
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
        {/* Anamnèse Tab */}
        {activeTab === 'anamnese' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Questionnaire d'anamnèse</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Rempli lors de votre première consultation avec {anamneseData.nutritionist}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Créé le</p>
                  <p className="font-medium text-gray-800">{anamneseData.createdAt}</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-start gap-3">
                  <span className="text-amber-500">ℹ️</span>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Document en lecture seule</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Ce document a été validé par votre nutritionniste. Si des informations ont changé, 
                      signalez-le via la messagerie.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Anamnèse sections */}
            <div className="space-y-4">
              {Object.entries(anamneseData.sections).map(([sectionId, section]) => {
                const isExpanded = expandedSection === sectionId;
                return (
                  <div key={sectionId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : sectionId)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <span className="text-xl">{section.icon}</span>
                        </div>
                        <span className="font-medium text-gray-800">{section.label}</span>
                      </div>
                      <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <div className="space-y-3">
                          {section.fields.map((field, index) => (
                            <div key={index} className="flex items-start justify-between p-3 bg-white rounded-lg">
                              <span className="text-sm text-gray-500">{field.label}</span>
                              <span className="text-sm font-medium text-gray-800 text-right max-w-md">
                                {field.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Signal change button */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">Une information a changé ?</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Nouveau traitement, allergie découverte, changement de situation...
                  </p>
                </div>
                <button className="px-4 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition-colors">
                  Signaler un changement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questionnaires Tab */}
        {activeTab === 'questionnaires' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Questionnaires de suivi</h2>
              <p className="text-sm text-gray-500 mb-6">
                Ces questionnaires sont remplis lors de vos consultations avec votre nutritionniste.
              </p>

              <div className="space-y-4">
                {questionnaires.map((q) => (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border ${
                      q.status === 'completed' ? 'border-gray-200 bg-white' : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          q.status === 'completed' ? 'bg-emerald-100' : 'bg-amber-100'
                        }`}>
                          <span className="text-xl">{q.status === 'completed' ? '✓' : '📝'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{q.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{q.type}</span>
                            {q.consultationLinked && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500">{q.consultationLinked}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {q.date && <span className="text-sm text-gray-500">{q.date}</span>}
                        {getStatusBadge(q.status)}
                        {q.status === 'completed' && (
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                            👁
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">Bon à savoir</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Les questionnaires de suivi sont remplis ensemble lors de vos consultations. 
                    Vous ne pouvez pas les modifier après validation, mais vous pouvez les consulter à tout moment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Upload zone */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Ajouter un document</h2>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📄</span>
                </div>
                <p className="font-medium text-gray-700">Glisser-déposer ou cliquer pour ajouter</p>
                <p className="text-sm text-gray-500 mt-1">PDF, images (max 10 Mo)</p>
              </div>
            </div>

            {/* Documents list */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Mes documents</h2>
                <div className="flex items-center gap-2">
                  <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option>Toutes les catégories</option>
                    <option>Analyses</option>
                    <option>Plans</option>
                    <option>Ressources</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowDocumentModal(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                        <span className="text-2xl">
                          {doc.type === 'pdf' ? '📕' : '🖼'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            doc.uploadedBy === 'nutritionist' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {doc.uploadedBy === 'nutritionist' ? 'Nutritionniste' : 'Vous'}
                          </span>
                          <span className="text-xs text-gray-500">{doc.category}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{doc.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{doc.uploadedAt}</span>
                      <button className="p-2 hover:bg-white rounded-lg text-gray-400">
                        📥
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Consultations Tab */}
        {activeTab === 'consultations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-6">Historique des consultations</h2>

              <div className="space-y-6">
                {consultations.map((consultation, index) => (
                  <div key={consultation.id} className="relative">
                    {/* Timeline connector */}
                    {index < consultations.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200" />
                    )}

                    <div className="flex gap-4">
                      {/* Timeline dot */}
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-600 font-bold">{index + 1}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-gray-50 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-800">{consultation.type}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500">{consultation.date}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-500">{consultation.duration}</span>
                              <span className="text-gray-300">•</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                consultation.mode === 'Cabinet' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {consultation.mode}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{consultation.summary}</p>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Points clés</p>
                          <ul className="space-y-1">
                            {consultation.keyPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="text-emerald-500 mt-0.5">✓</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-700">Prochaines étapes</p>
                          <p className="text-sm text-gray-600 mt-1">{consultation.nextSteps}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* No shared notes info */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Notes privées</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Votre nutritionniste peut prendre des notes privées pendant les consultations. 
                    Seuls les résumés et points clés partagés apparaissent ici.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Objectifs Tab */}
        {activeTab === 'objectifs' && (
          <div className="space-y-6">
            {/* Progress overview */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
              <h2 className="font-semibold text-lg mb-2">Votre progression globale</h2>
              <p className="text-emerald-100">
                Vous avez atteint <span className="font-bold text-white">51%</span> de votre objectif principal. Continuez ainsi !
              </p>
              <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '51%' }} />
              </div>
            </div>

            {/* Objectives list */}
            <div className="space-y-4">
              {objectives.map((objective) => (
                <div key={objective.id} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        objective.category === 'Poids' ? 'bg-blue-100' :
                        objective.category === 'Habitude' ? 'bg-emerald-100' :
                        'bg-purple-100'
                      }`}>
                        <span>
                          {objective.category === 'Poids' ? '⚖️' :
                           objective.category === 'Habitude' ? '🔄' : '🧠'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{objective.title}</h3>
                        <span className="text-xs text-gray-500">{objective.category}</span>
                      </div>
                    </div>
                    {getStatusBadge(objective.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Départ</p>
                      <p className="font-medium text-gray-700">{objective.startValue}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Actuel</p>
                      <p className="font-medium text-emerald-700">{objective.current}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Objectif</p>
                      <p className="font-medium text-blue-700">{objective.target}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progression</span>
                      <span className="font-medium text-gray-700">{objective.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          objective.status === 'on-track' ? 'bg-emerald-500' :
                          objective.status === 'in-progress' ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`}
                        style={{ width: `${objective.progress}%` }}
                      />
                    </div>
                  </div>

                  {objective.deadline && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                      <span>📅</span>
                      <span>Échéance: {objective.deadline}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Info about objectives */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">Objectifs définis ensemble</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Ces objectifs ont été définis avec votre nutritionniste lors de vos consultations. 
                    Ils sont ajustés en fonction de votre progression et de vos besoins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Détails du document</h3>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">📕</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{selectedDocument.name}</p>
                <p className="text-sm text-gray-500">{selectedDocument.size} • {selectedDocument.type.toUpperCase()}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Catégorie</span>
                <span className="text-sm font-medium text-gray-800">{selectedDocument.category}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Ajouté par</span>
                <span className="text-sm font-medium text-gray-800">
                  {selectedDocument.uploadedBy === 'nutritionist' ? 'Lucie Martin (Nutritionniste)' : 'Vous'}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Date d'ajout</span>
                <span className="text-sm font-medium text-gray-800">{selectedDocument.uploadedAt}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              <button className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                <span>📥</span>
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientFileWireframe;
