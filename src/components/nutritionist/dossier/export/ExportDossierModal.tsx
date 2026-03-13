'use client';

import React, { useState } from 'react';
import { X, Download, Loader2, CheckCircle } from 'lucide-react';

interface ExportDossierModalProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
}

const exportSections = [
  { id: 'anamnese', label: 'Anamnèse', default: true },
  { id: 'questionnaires', label: 'Questionnaires', default: true },
  { id: 'documents', label: 'Documents (métadonnées)', default: true },
  { id: 'objectives', label: 'Objectifs', default: true },
  { id: 'consultations', label: 'Consultations', default: true },
  { id: 'change_reports', label: 'Signalements', default: false },
];

export function ExportDossierModal({
  patientId,
  patientName,
  onClose,
}: ExportDossierModalProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>(
    exportSections.filter(s => s.default).map(s => s.id)
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  function toggleSection(sectionId: string) {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/protected/nutritionist/patients/${patientId}/dossier/export`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Erreur export');
      }

      const data = await response.json();

      // Download as JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dossier-${patientName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setExported(true);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-md mx-4'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Exporter le dossier
          </h3>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-gray-700 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          <p className='text-sm text-gray-500'>
            Sélectionnez les sections à inclure dans l&apos;export JSON du
            dossier de {patientName}.
          </p>

          <div className='space-y-2'>
            {exportSections.map(section => (
              <label
                key={section.id}
                className='flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer'
              >
                <input
                  type='checkbox'
                  checked={selectedSections.includes(section.id)}
                  onChange={() => toggleSection(section.id)}
                  className='rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
                />
                <span className='text-sm text-gray-700'>{section.label}</span>
              </label>
            ))}
          </div>

          {exported && (
            <div className='flex items-center gap-2 p-3 bg-green-50 rounded-lg'>
              <CheckCircle className='w-4 h-4 text-green-600' />
              <span className='text-sm text-green-700'>
                Export téléchargé avec succès
              </span>
            </div>
          )}

          <div className='flex justify-end gap-3 pt-2'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Fermer
            </button>
            <button
              onClick={handleExport}
              disabled={selectedSections.length === 0 || isExporting}
              className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
            >
              {isExporting ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Download className='w-4 h-4' />
              )}
              Exporter (JSON)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
