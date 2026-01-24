'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { exportDataCategories } from '@/types/profile';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (categories: string[]) => void;
}

export function ExportDataModal({ isOpen, onClose, onExport }: ExportDataModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    exportDataCategories.map((c) => c.id)
  );

  if (!isOpen) return null;

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleExport = () => {
    onExport(selectedCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Exporter mes données</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">Sélectionnez les données à exporter :</p>

        <div className="space-y-3 mb-6">
          {exportDataCategories.map((category) => (
            <label key={category.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleToggleCategory(category.id)}
                className="w-4 h-4 text-[#1B998B] rounded focus:ring-[#1B998B]"
              />
              <span className="text-gray-700">{category.label}</span>
            </label>
          ))}
        </div>

        <div className="p-4 bg-blue-50 rounded-lg mb-6">
          <p className="text-sm text-blue-700">
            📧 Un lien de téléchargement vous sera envoyé par email dans les 24h.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={selectedCategories.length === 0}
            className="flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Demander l'export
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportDataModal;
