import React, { useState } from 'react';

const AgendaWireframe = () => {
  const [activeView, setActiveView] = useState('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [showRdvDetailModal, setShowRdvDetailModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);

  const upcomingAppointments = [
    {
      id: 1,
      date: '24 janvier 2026',
      time: '14:00',
      duration: '45 min',
      type: 'Consultation de suivi',
      mode: 'visio',
      status: 'confirmed',
      nutritionist: 'Lucie Martin',
      notes: 'Bilan du premier mois, ajustement du plan si nécessaire',
      visioLink: 'https://meet.nutrisensia.ch/abc123',
      reminderSent: true,
    },
    {
      id: 2,
      date: '21 février 2026',
      time: '10:30',
      duration: '30 min',
      type: 'Consultation de suivi',
      mode: 'cabinet',
      status: 'confirmed',
      nutritionist: 'Lucie Martin',
      notes: null,
      address: 'Rue du Conseil 12, 2000 Neuchâtel',
      reminderSent: false,
    },
  ];

  const pastAppointments = [
    {
      id: 3,
      date: '15 janvier 2026',
      time: '14:00',
      duration: '30 min',
      type: 'Consultation de suivi',
      mode: 'visio',
      status: 'completed',
      nutritionist: 'Lucie Martin',
      summary: 'Bon démarrage, -1.6 kg. Ajustement léger du plan.',
    },
    {
      id: 4,
      date: '15 décembre 2025',
      time: '09:00',
      duration: '60 min',
      type: 'Première consultation',
      mode: 'cabinet',
      status: 'completed',
      nutritionist: 'Lucie Martin',
      summary: 'Anamnèse complète, définition des objectifs, mise en place du plan initial.',
    },
  ];

  const consultationTypes = [
    {
      id: 'suivi',
      name: 'Consultation de suivi',
      duration: '30 min',
      description: 'Point régulier sur votre progression',
      price: '80 CHF',
    },
    {
      id: 'suivi-approfondi',
      name: 'Consultation approfondie',
      duration: '45 min',
      description: 'Bilan détaillé et ajustements du plan',
      price: '110 CHF',
    },
    {
      id: 'urgence',
      name: 'Consultation urgente',
      duration: '20 min',
      description: 'Question urgente ou problème ponctuel',
      price: '50 CHF',
    },
  ];

  const availableDates = [
    { date: '24 Jan', day: 'Ven', available: true, slots: 3 },
    { date: '25 Jan', day: 'Sam', available: false, slots: 0 },
    { date: '26 Jan', day: 'Dim', available: false, slots: 0 },
    { date: '27 Jan', day: 'Lun', available: true, slots: 5 },
    { date: '28 Jan', day: 'Mar', available: true, slots: 2 },
    { date: '29 Jan', day: 'Mer', available: true, slots: 4 },
    { date: '30 Jan', day: 'Jeu', available: true, slots: 1 },
  ];

  const availableSlots = [
    { time: '09:00', available: true },
    { time: '09:30', available: false },
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: false },
    { time: '14:00', available: true },
    { time: '14:30', available: false },
    { time: '15:00', available: true },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      completed: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels = {
      confirmed: 'Confirmé',
      pending: 'En attente',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getModeBadge = (mode) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        mode === 'visio' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
      }`}>
        {mode === 'visio' ? '📹 Visio' : '🏢 Cabinet'}
      </span>
    );
  };

  const openRdvDetail = (rdv) => {
    setSelectedRdv(rdv);
    setShowRdvDetailModal(true);
  };

  const startBooking = () => {
    setBookingStep(1);
    setSelectedType(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setShowBookingModal(true);
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
                <h1 className="text-lg font-semibold text-gray-800">Mes rendez-vous</h1>
                <p className="text-sm text-gray-500">Gérez vos consultations avec votre nutritionniste</p>
              </div>
            </div>
            <button
              onClick={startBooking}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <span>+</span>
              <span className="font-medium">Prendre rendez-vous</span>
            </button>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveView('upcoming')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'upcoming'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              À venir
            </button>
            <button
              onClick={() => setActiveView('past')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'past'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Passés
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Upcoming appointments */}
        {activeView === 'upcoming' && (
          <div className="space-y-6">
            {/* Next appointment highlight */}
            {upcomingAppointments.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Prochain rendez-vous</p>
                    <h2 className="text-2xl font-bold mt-1">{upcomingAppointments[0].date}</h2>
                    <p className="text-emerald-100 mt-1">
                      {upcomingAppointments[0].time} • {upcomingAppointments[0].duration} • {upcomingAppointments[0].type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      upcomingAppointments[0].mode === 'visio' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white/20 text-white'
                    }`}>
                      {upcomingAppointments[0].mode === 'visio' ? '📹 Visio' : '🏢 Cabinet'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {upcomingAppointments[0].mode === 'visio' && (
                    <button className="px-4 py-2 bg-white text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-colors">
                      Rejoindre la visio
                    </button>
                  )}
                  <button 
                    onClick={() => openRdvDetail(upcomingAppointments[0])}
                    className="px-4 py-2 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Voir les détails
                  </button>
                </div>

                {/* Countdown */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-emerald-100 text-sm">
                    ⏰ Dans 7 jours • Rappel envoyé par email
                  </p>
                </div>
              </div>
            )}

            {/* Upcoming list */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Tous les rendez-vous à venir</h2>
              </div>
              
              {upcomingAppointments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📅</span>
                  </div>
                  <p className="text-gray-500">Aucun rendez-vous à venir</p>
                  <button
                    onClick={startBooking}
                    className="mt-4 px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Prendre rendez-vous
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {upcomingAppointments.map((rdv) => (
                    <div
                      key={rdv.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => openRdvDetail(rdv)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-xs text-emerald-600 font-medium">
                              {rdv.date.split(' ')[1].toUpperCase()}
                            </span>
                            <span className="text-xl font-bold text-gray-800">
                              {rdv.date.split(' ')[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{rdv.type}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500">{rdv.time}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-500">{rdv.duration}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getModeBadge(rdv.mode)}
                          {getStatusBadge(rdv.status)}
                          <span className="text-gray-400">→</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reminder settings */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Paramètres de rappel</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📧</span>
                    <div>
                      <p className="font-medium text-gray-800">Rappel par email</p>
                      <p className="text-sm text-gray-500">24h avant le rendez-vous</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔔</span>
                    <div>
                      <p className="font-medium text-gray-800">Rappel par notification</p>
                      <p className="text-sm text-gray-500">1h avant le rendez-vous</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Past appointments */}
        {activeView === 'past' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Rendez-vous passés</h2>
              </div>

              {pastAppointments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📋</span>
                  </div>
                  <p className="text-gray-500">Aucun rendez-vous passé</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pastAppointments.map((rdv) => (
                    <div
                      key={rdv.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => openRdvDetail(rdv)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-500 font-medium">
                              {rdv.date.split(' ')[1].toUpperCase()}
                            </span>
                            <span className="text-xl font-bold text-gray-600">
                              {rdv.date.split(' ')[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{rdv.type}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500">{rdv.time}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-500">{rdv.duration}</span>
                            </div>
                            {rdv.summary && (
                              <p className="text-sm text-gray-500 mt-2 max-w-md">
                                {rdv.summary}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getModeBadge(rdv.mode)}
                          {getStatusBadge(rdv.status)}
                          <span className="text-gray-400">→</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500">Total consultations</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{pastAppointments.length}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500">Première consultation</p>
                <p className="text-lg font-bold text-gray-800 mt-1">15 déc. 2025</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-500">Durée totale de suivi</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">1 <span className="text-lg font-normal text-gray-400">mois</span></p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Prendre rendez-vous</h3>
                  <p className="text-sm text-gray-500 mt-1">Étape {bookingStep} sur 3</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                  ✕
                </button>
              </div>
              
              {/* Progress bar */}
              <div className="flex gap-2 mt-4">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-1 rounded-full ${
                      step <= bookingStep ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Modal content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Step 1: Choose type */}
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800 mb-4">Quel type de consultation ?</h4>
                  {consultationTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedType?.id === type.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{type.name}</p>
                          <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                          <p className="text-sm text-gray-400 mt-2">⏱ {type.duration}</p>
                        </div>
                        <span className="font-semibold text-emerald-600">{type.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Choose date & time */}
              {bookingStep === 2 && (
                <div className="space-y-6">
                  {/* Date selection */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">Choisissez une date</h4>
                    <div className="flex items-center gap-2 mb-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                        ←
                      </button>
                      <span className="text-sm font-medium text-gray-600">Janvier 2026</span>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                        →
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {availableDates.map((date, index) => (
                        <button
                          key={index}
                          disabled={!date.available}
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-xl text-center transition-all ${
                            !date.available
                              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                              : selectedDate?.date === date.date
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-50 hover:bg-emerald-50 text-gray-700'
                          }`}
                        >
                          <p className="text-xs">{date.day}</p>
                          <p className="font-bold">{date.date.split(' ')[0]}</p>
                          {date.available && (
                            <p className={`text-xs mt-1 ${
                              selectedDate?.date === date.date ? 'text-emerald-100' : 'text-emerald-600'
                            }`}>
                              {date.slots} dispo
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time selection */}
                  {selectedDate && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-4">Choisissez un horaire</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot)}
                            className={`p-3 rounded-lg text-center transition-all ${
                              !slot.available
                                ? 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                : selectedTime?.time === slot.time
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-50 hover:bg-emerald-50 text-gray-700'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode selection */}
                  {selectedTime && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-4">Mode de consultation</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-left">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📹</span>
                            <div>
                              <p className="font-medium text-gray-800">Visioconférence</p>
                              <p className="text-sm text-gray-500">Depuis chez vous</p>
                            </div>
                          </div>
                        </button>
                        <button className="p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-300 text-left">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🏢</span>
                            <div>
                              <p className="font-medium text-gray-800">Au cabinet</p>
                              <p className="text-sm text-gray-500">Neuchâtel</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Confirmation */}
              {bookingStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                    <h4 className="font-semibold text-emerald-800 mb-4">Récapitulatif de votre réservation</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium text-gray-800">{selectedType?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium text-gray-800">{selectedDate?.date} janvier 2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heure</span>
                        <span className="font-medium text-gray-800">{selectedTime?.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durée</span>
                        <span className="font-medium text-gray-800">{selectedType?.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mode</span>
                        <span className="font-medium text-gray-800">📹 Visioconférence</span>
                      </div>
                      <div className="border-t border-emerald-200 pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-800">Total</span>
                          <span className="font-bold text-emerald-600">{selectedType?.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes for nutritionist */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message pour votre nutritionniste (optionnel)
                    </label>
                    <textarea
                      placeholder="Y a-t-il quelque chose de particulier à aborder lors de cette consultation ?"
                      className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24"
                    />
                  </div>

                  {/* Reminder preferences */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-500 rounded" />
                      <span className="text-sm text-gray-700">Recevoir un rappel par email 24h avant</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              {bookingStep > 1 && (
                <button
                  onClick={() => setBookingStep(bookingStep - 1)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Retour
                </button>
              )}
              {bookingStep < 3 ? (
                <button
                  onClick={() => setBookingStep(bookingStep + 1)}
                  disabled={(bookingStep === 1 && !selectedType) || (bookingStep === 2 && (!selectedDate || !selectedTime))}
                  className={`flex-1 py-3 font-medium rounded-xl transition-colors ${
                    (bookingStep === 1 && !selectedType) || (bookingStep === 2 && (!selectedDate || !selectedTime))
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  Continuer
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    alert('Rendez-vous confirmé !');
                  }}
                  className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  Confirmer le rendez-vous
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RDV Detail Modal */}
      {showRdvDetailModal && selectedRdv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Détails du rendez-vous</h3>
              <button
                onClick={() => setShowRdvDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                ✕
              </button>
            </div>

            {/* Date display */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex flex-col items-center justify-center">
                <span className="text-xs text-emerald-600 font-medium">
                  {selectedRdv.date.split(' ')[1].toUpperCase()}
                </span>
                <span className="text-2xl font-bold text-gray-800">
                  {selectedRdv.date.split(' ')[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{selectedRdv.type}</p>
                <p className="text-gray-500">{selectedRdv.time} • {selectedRdv.duration}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Statut</span>
                {getStatusBadge(selectedRdv.status)}
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Mode</span>
                {getModeBadge(selectedRdv.mode)}
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Nutritionniste</span>
                <span className="text-sm font-medium text-gray-800">{selectedRdv.nutritionist}</span>
              </div>
              {selectedRdv.mode === 'cabinet' && selectedRdv.address && (
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Adresse</span>
                  <span className="text-sm font-medium text-gray-800 text-right">{selectedRdv.address}</span>
                </div>
              )}
              {selectedRdv.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500 block mb-1">Notes</span>
                  <span className="text-sm text-gray-800">{selectedRdv.notes}</span>
                </div>
              )}
              {selectedRdv.summary && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-sm text-emerald-700 font-medium block mb-1">Résumé</span>
                  <span className="text-sm text-emerald-800">{selectedRdv.summary}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {selectedRdv.status === 'confirmed' && selectedRdv.mode === 'visio' && (
                <button className="w-full py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                  <span>📹</span>
                  Rejoindre la visio
                </button>
              )}
              {selectedRdv.status === 'confirmed' && (
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
                    Modifier
                  </button>
                  <button className="flex-1 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors">
                    Annuler
                  </button>
                </div>
              )}
              {selectedRdv.status === 'completed' && (
                <button 
                  onClick={() => setShowRdvDetailModal(false)}
                  className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaWireframe;
