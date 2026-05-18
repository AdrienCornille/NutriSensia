'use client';

import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { useUploadDocument } from '@/hooks/useNutritionistDossier';

interface DocumentUploadModalProps {
  patientId: string;
  onClose: () => void;
}

const CATEGORIES = ['Analyses', 'Plans', 'Ressources', 'Autre'] as const;

export function DocumentUploadModal({
  patientId,
  onClose,
}: DocumentUploadModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Autre');
  const [description, setDescription] = useState('');

  const uploadDocument = useUploadDocument(patientId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await uploadDocument.mutateAsync({
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        file_url: '', // TBD : Supabase Storage upload
        file_type: 'pdf',
      });
      onClose();
    } catch {
      // handled by React Query
    }
  }

  return (
    <div
      className='fp-modal is-open'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='doc-upload-title'
    >
      <div className='fp-modal-card' onClick={e => e.stopPropagation()}>
        <div className='fp-modal-head'>
          <div>
            <h3 className='fp-modal-title' id='doc-upload-title'>
              Ajouter un <em>document</em>
            </h3>
            <p className='fp-modal-sub'>
              PDF, image ou autre fichier · partagé avec le patient.
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

        <form onSubmit={handleSubmit}>
          <div className='fp-modal-body'>
            <div className='fp-modal-field'>
              <label htmlFor='doc-name'>Nom du document *</label>
              <input
                id='doc-name'
                type='text'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='ex: Analyse sanguine mars 2026'
                required
              />
            </div>

            <div className='fp-modal-field'>
              <label htmlFor='doc-category'>Catégorie</label>
              <select
                id='doc-category'
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className='fp-modal-field'>
              <label htmlFor='doc-description'>Description</label>
              <textarea
                id='doc-description'
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Description optionnelle…'
                rows={3}
              />
            </div>

            <div className='fp-modal-drop'>
              <Upload
                className='w-8 h-8 mx-auto mb-2'
                style={{ color: 'var(--ns-ink-4)' }}
              />
              <b>Glisser-déposer un fichier</b>
              <span>Intégration Supabase Storage à venir</span>
            </div>
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
              * champs obligatoires
            </span>
            <div className='fp-modal-foot-actions'>
              <button type='button' className='fp-btn' onClick={onClose}>
                Annuler
              </button>
              <button
                type='submit'
                className='fp-btn fp-btn-peps'
                disabled={!name.trim() || uploadDocument.isPending}
              >
                {uploadDocument.isPending && (
                  <Loader2 className='w-3 h-3 animate-spin' />
                )}
                Ajouter
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
