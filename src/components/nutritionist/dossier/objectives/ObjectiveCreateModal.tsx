'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreateObjective } from '@/hooks/useNutritionistDossier';

interface ObjectiveCreateModalProps {
  patientId: string;
  onClose: () => void;
}

const CATEGORIES = [
  'Poids',
  'Habitude',
  'Comportement',
  'Activité physique',
  'Hydratation',
  'Sommeil',
  'Autre',
];

export function ObjectiveCreateModal({
  patientId,
  onClose,
}: ObjectiveCreateModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Habitude');
  const [targetValue, setTargetValue] = useState('');
  const [targetUnit, setTargetUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState(3);

  const createObjective = useCreateObjective(patientId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createObjective.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        target_value: targetValue.trim() || undefined,
        target_unit: targetUnit.trim() || undefined,
        deadline: deadline || undefined,
        priority,
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
      aria-labelledby='obj-create-title'
    >
      <div className='fp-modal-card' onClick={e => e.stopPropagation()}>
        <div className='fp-modal-head'>
          <div>
            <h3 className='fp-modal-title' id='obj-create-title'>
              Nouvel <em>objectif</em>
            </h3>
            <p className='fp-modal-sub'>
              Co-construit avec le patient · révisé en consultation.
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
              <label htmlFor='obj-title'>Titre *</label>
              <input
                id='obj-title'
                type='text'
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='ex: Perdre 3 kg en 2 mois'
                required
              />
            </div>

            <div className='fp-modal-field'>
              <label htmlFor='obj-description'>Description</label>
              <textarea
                id='obj-description'
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Détails sur cet objectif…'
                rows={3}
              />
            </div>

            <div className='fp-modal-field-row'>
              <div className='fp-modal-field' style={{ marginBottom: 0 }}>
                <label htmlFor='obj-category'>Catégorie *</label>
                <select
                  id='obj-category'
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

              <div className='fp-modal-field' style={{ marginBottom: 0 }}>
                <label htmlFor='obj-priority'>Priorité</label>
                <select
                  id='obj-priority'
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                >
                  <option value={1}>1 — Très haute</option>
                  <option value={2}>2 — Haute</option>
                  <option value={3}>3 — Moyenne</option>
                  <option value={4}>4 — Basse</option>
                  <option value={5}>5 — Très basse</option>
                </select>
              </div>
            </div>

            <div className='fp-modal-field-row'>
              <div className='fp-modal-field' style={{ marginBottom: 0 }}>
                <label htmlFor='obj-target'>Valeur cible</label>
                <input
                  id='obj-target'
                  type='text'
                  value={targetValue}
                  onChange={e => setTargetValue(e.target.value)}
                  placeholder='ex: 70'
                />
              </div>
              <div className='fp-modal-field' style={{ marginBottom: 0 }}>
                <label htmlFor='obj-unit'>Unité</label>
                <input
                  id='obj-unit'
                  type='text'
                  value={targetUnit}
                  onChange={e => setTargetUnit(e.target.value)}
                  placeholder='ex: kg'
                />
              </div>
            </div>

            <div className='fp-modal-field'>
              <label htmlFor='obj-deadline'>Échéance</label>
              <input
                id='obj-deadline'
                type='date'
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
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
                disabled={!title.trim() || createObjective.isPending}
              >
                {createObjective.isPending && (
                  <Loader2 className='w-3 h-3 animate-spin' />
                )}
                Créer l&apos;objectif
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
