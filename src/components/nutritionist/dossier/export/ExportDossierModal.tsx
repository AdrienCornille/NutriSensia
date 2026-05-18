'use client';

import React, { useState } from 'react';
import { X, Download, Loader2, CheckCircle } from 'lucide-react';

interface ExportDossierModalProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
}

const EXPORT_SECTIONS = [
  {
    id: 'anamnese',
    label: 'Anamnèse',
    description: 'sections + champs · version courante',
    default: true,
  },
  {
    id: 'questionnaires',
    label: 'Questionnaires',
    description: 'envoyés + réponses du patient',
    default: true,
  },
  {
    id: 'documents',
    label: 'Documents',
    description: 'métadonnées · fichiers non inclus',
    default: true,
  },
  {
    id: 'objectives',
    label: 'Objectifs',
    description: 'actifs · terminés · en pause',
    default: true,
  },
  {
    id: 'consultations',
    label: 'Consultations',
    description: 'comptes-rendus finalisés',
    default: true,
  },
  {
    id: 'change_reports',
    label: 'Signalements de changement',
    description: 'modifications remontées par le patient',
    default: false,
  },
];

type ExportFormat = 'json' | 'pdf';

export function ExportDossierModal({
  patientId,
  patientName,
  onClose,
}: ExportDossierModalProps) {
  const [format, setFormat] = useState<ExportFormat>('json');
  const [selectedSections, setSelectedSections] = useState<string[]>(
    EXPORT_SECTIONS.filter(s => s.default).map(s => s.id)
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
    if (format !== 'json') return; // PDF disabled
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

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dossier-${patientName
        .replace(/\s+/g, '-')
        .toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setExported(true);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  }

  const timestamp = new Date().toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className='fp-modal is-open'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='export-title'
    >
      <div className='fp-modal-card' onClick={e => e.stopPropagation()}>
        <div className='fp-modal-head'>
          <div>
            <h3 className='fp-modal-title' id='export-title'>
              Exporter <em>le dossier</em>
            </h3>
            <p className='fp-modal-sub'>
              Choisissez le format et les sections à inclure pour le dossier de{' '}
              {patientName}.
            </p>
          </div>
          <button
            type='button'
            className='fp-modal-close'
            onClick={onClose}
            aria-label='Fermer'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        </div>

        <div className='fp-modal-body'>
          <label
            className='fp-form-label'
            style={{ marginBottom: 10, display: 'block' }}
          >
            Format de l&apos;export
          </label>
          <div className='fp-modal-format-row'>
            <button
              type='button'
              className={`fp-modal-format ${format === 'json' ? 'is-active' : ''}`}
              onClick={() => setFormat('json')}
            >
              <b>JSON</b>
              <span>
                Données structurées, lisibles par d&apos;autres outils.
              </span>
              <span
                className='fp-modal-format-tag'
                style={{
                  background: 'var(--ns-sage-100)',
                  color: 'var(--ns-sage-700)',
                }}
              >
                Disponible
              </span>
            </button>
            <button
              type='button'
              className='fp-modal-format is-disabled'
              disabled
              title='PDF prévu mais non implémenté'
            >
              <b>PDF</b>
              <span>Mise en page éditoriale, prête à imprimer.</span>
              <span className='fp-modal-format-tag'>Bientôt</span>
            </button>
          </div>

          <label
            className='fp-form-label'
            style={{ marginBottom: 10, display: 'block' }}
          >
            Sections à inclure
          </label>
          <ul className='fp-modal-list'>
            {EXPORT_SECTIONS.map(section => (
              <li key={section.id}>
                <label className='fp-modal-check'>
                  <input
                    type='checkbox'
                    checked={selectedSections.includes(section.id)}
                    onChange={() => toggleSection(section.id)}
                  />
                  <span className='fp-modal-check-box' />
                  <b>{section.label}</b>
                  <span>{section.description}</span>
                </label>
              </li>
            ))}
          </ul>

          {exported && (
            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                background: 'var(--ns-sage-100)',
                border: '1.5px solid var(--ns-sage-600)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--ns-font-sans)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ns-sage-700)',
              }}
            >
              <CheckCircle className='w-4 h-4' />
              Export téléchargé avec succès
            </div>
          )}
        </div>

        <div className='fp-modal-foot'>
          <span
            style={{
              fontFamily: 'var(--ns-font-serif)',
              fontStyle: 'italic',
              fontSize: 13,
              color: 'var(--ns-ink-3)',
            }}
          >
            Horodaté · {timestamp}
          </span>
          <div className='fp-modal-foot-actions'>
            <button type='button' className='fp-btn' onClick={onClose}>
              Annuler
            </button>
            <button
              type='button'
              className='fp-btn fp-btn-peps'
              onClick={handleExport}
              disabled={
                selectedSections.length === 0 ||
                isExporting ||
                format !== 'json'
              }
            >
              {isExporting ? (
                <Loader2 className='w-3 h-3 animate-spin' />
              ) : (
                <Download className='w-3 h-3' />
              )}
              Exporter en {format.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
