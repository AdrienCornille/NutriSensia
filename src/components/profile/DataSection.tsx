'use client';

import React from 'react';
import type { DataStats } from '@/types/profile';

interface DataSectionProps {
  dataStats: DataStats;
  onExportData: () => void;
  onDeleteAccount: () => void;
}

export function DataSection({ dataStats, onExportData, onDeleteAccount }: DataSectionProps) {
  return (
    <div className="space-y-6">
      {/* Data summary */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Résumé de vos données</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{dataStats.totalMeals}</p>
            <p className="text-sm text-gray-500">Repas enregistrés</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{dataStats.totalWeightEntries}</p>
            <p className="text-sm text-gray-500">Pesées enregistrées</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{dataStats.totalMessages}</p>
            <p className="text-sm text-gray-500">Messages échangés</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-800">{dataStats.accountCreated}</p>
            <p className="text-sm text-gray-500">Date de création</p>
          </div>
        </div>
      </div>

      {/* Export data */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-2">Exporter mes données</h2>
        <p className="text-sm text-gray-500 mb-4">
          Téléchargez une copie de toutes vos données (RGPD)
        </p>
        <button
          onClick={onExportData}
          className="px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors"
        >
          📥 Exporter mes données
        </button>
      </div>

      {/* Delete account */}
      <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
        <h2 className="font-semibold text-red-600 mb-2">Supprimer mon compte</h2>
        <p className="text-sm text-gray-500 mb-4">
          Cette action est irréversible. Toutes vos données seront supprimées.
        </p>
        <button
          onClick={onDeleteAccount}
          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          Supprimer mon compte
        </button>
      </div>

      {/* Legal links */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Informations légales</h2>
        <div className="space-y-3">
          <a
            href="#"
            className="flex items-center justify-between py-2 text-gray-700 hover:text-[#1B998B] transition-colors"
          >
            <span>Conditions générales d'utilisation</span>
            <span>→</span>
          </a>
          <a
            href="#"
            className="flex items-center justify-between py-2 text-gray-700 hover:text-[#1B998B] transition-colors"
          >
            <span>Politique de confidentialité</span>
            <span>→</span>
          </a>
          <a
            href="#"
            className="flex items-center justify-between py-2 text-gray-700 hover:text-[#1B998B] transition-colors"
          >
            <span>Gestion des cookies</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default DataSection;
