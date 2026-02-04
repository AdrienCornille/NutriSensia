'use client';

import React, { useState } from 'react';
import { X, CheckCircle, CalendarPlus, Calendar, Clock, Video, Building2, Phone } from 'lucide-react';
import type { Appointment } from '@/types/agenda';
import { formatDateParts } from '@/types/agenda';

interface BookingSuccessModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}

const modeIcons: Record<string, React.ReactNode> = {
  visio: <Video className="w-4 h-4" />,
  cabinet: <Building2 className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
};

const modeLabels: Record<string, string> = {
  visio: 'Visioconférence',
  cabinet: 'Au cabinet',
  phone: 'Téléphone',
};

export function BookingSuccessModal({ isOpen, appointment, onClose }: BookingSuccessModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !appointment) return null;

  const dateParts = formatDateParts(appointment.date);

  const handleAddToCalendar = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/protected/appointments/${appointment.id}/ics`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const filename =
        response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ||
        `nutrisensia-rdv-${appointment.id}.ics`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au calendrier:', error);
      alert('Erreur lors du téléchargement du fichier calendrier');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Rendez-vous confirmé !</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success message */}
        <p className="text-gray-600 mb-6">
          Votre rendez-vous a été réservé avec succès. Vous recevrez un email de confirmation.
        </p>

        {/* Appointment summary */}
        <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
          <div className="flex items-start gap-4">
            {/* Date block */}
            <div className="w-14 h-14 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm">
              <span className="text-xs text-emerald-600 font-medium">{dateParts.month}</span>
              <span className="text-xl font-bold text-gray-800">{dateParts.day}</span>
            </div>

            {/* Details */}
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{appointment.typeName}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {appointment.time}
                </span>
                <span className="text-gray-300">•</span>
                <span>{appointment.duration} min</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white text-emerald-700">
                  {modeIcons[appointment.mode]}
                  {modeLabels[appointment.mode]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleAddToCalendar}
            disabled={isDownloading}
            className="w-full py-3 bg-blue-50 text-blue-700 font-medium rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CalendarPlus className="w-4 h-4" />
            {isDownloading ? 'Téléchargement...' : 'Ajouter à mon calendrier'}
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Voir mes rendez-vous
          </button>
        </div>

        {/* Info text */}
        <p className="text-xs text-center text-gray-500 mt-4">
          Le fichier .ics fonctionne avec Google Calendar, Apple Calendar, Outlook et autres.
        </p>
      </div>
    </div>
  );
}

export default BookingSuccessModal;
