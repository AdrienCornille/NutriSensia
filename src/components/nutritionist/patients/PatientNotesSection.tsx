'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Lock, Check, Loader2, Plus, Pencil, Trash2, X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  usePatientNotes,
  useCreatePatientNote,
  useUpdatePatientNote,
  useDeletePatientNote,
  PatientNote,
} from '@/hooks/useNutritionistPatients';

interface PatientNotesSectionProps {
  patientId: string;
}

export function PatientNotesSection({ patientId }: PatientNotesSectionProps) {
  const { data: notes, isLoading } = usePatientNotes(patientId);
  const createMutation = useCreatePatientNote(patientId);
  const updateMutation = useUpdatePatientNote(patientId);
  const deleteMutation = useDeletePatientNote(patientId);

  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Auto-save for editing (debounce 1s)
  const editTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedEditRef = useRef('');
  const [editSaveStatus, setEditSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  useEffect(() => {
    return () => {
      if (editTimerRef.current) clearTimeout(editTimerRef.current);
    };
  }, []);

  const autoSaveEdit = useCallback(
    (noteId: string, content: string) => {
      if (content === lastSavedEditRef.current || content.trim() === '') return;
      setEditSaveStatus('saving');
      updateMutation.mutate(
        { noteId, content },
        {
          onSuccess: () => {
            lastSavedEditRef.current = content;
            setEditSaveStatus('saved');
            setTimeout(() => setEditSaveStatus('idle'), 2000);
          },
          onError: () => {
            setEditSaveStatus('error');
          },
        }
      );
    },
    [updateMutation]
  );

  const handleEditChange = (noteId: string, value: string) => {
    setEditContent(value);
    if (editTimerRef.current) clearTimeout(editTimerRef.current);
    editTimerRef.current = setTimeout(() => autoSaveEdit(noteId, value), 1000);
  };

  const handleCreate = () => {
    if (!newContent.trim()) return;
    createMutation.mutate(
      { content: newContent.trim() },
      {
        onSuccess: () => {
          setNewContent('');
          setIsAdding(false);
        },
      }
    );
  };

  const startEditing = (note: PatientNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
    lastSavedEditRef.current = note.content;
    setEditSaveStatus('idle');
  };

  const stopEditing = () => {
    if (editTimerRef.current) {
      clearTimeout(editTimerRef.current);
      if (
        editingId &&
        editContent !== lastSavedEditRef.current &&
        editContent.trim()
      ) {
        autoSaveEdit(editingId, editContent);
      }
    }
    setEditingId(null);
    setEditContent('');
    setEditSaveStatus('idle');
  };

  const handleDelete = (noteId: string) => {
    deleteMutation.mutate(noteId, {
      onSuccess: () => {
        setDeleteConfirmId(null);
        if (editingId === noteId) {
          setEditingId(null);
        }
      },
    });
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  const formatFullDate = (dateStr: string) => {
    return format(new Date(dateStr), "EEEE d MMMM yyyy 'à' HH:mm", {
      locale: fr,
    });
  };

  const notesCount = notes?.length ?? 0;

  return (
    <article className='fp-notes'>
      {/* Header */}
      <div className='fp-notes-head'>
        <b>Notes internes{notesCount > 0 ? ` · ${notesCount}` : ''}</b>
        {!isAdding && (
          <button
            type='button'
            onClick={() => setIsAdding(true)}
            className='fp-notes-add'
          >
            <Plus className='w-3 h-3' />
            Ajouter
          </button>
        )}
      </div>

      {/* Add note form */}
      {isAdding && (
        <div className='fp-notes-form'>
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder='Nouvelle note…'
            rows={3}
            maxLength={5000}
            autoFocus
          />
          <div className='fp-notes-form-actions'>
            <span className='fp-charcount'>{newContent.length}/5000</span>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => {
                  setIsAdding(false);
                  setNewContent('');
                }}
                className='fp-btn fp-btn-sm'
              >
                Annuler
              </button>
              <button
                type='button'
                onClick={handleCreate}
                disabled={!newContent.trim() || createMutation.isPending}
                className='fp-btn fp-btn-sm fp-btn-dark'
              >
                {createMutation.isPending ? (
                  <Loader2 className='w-3 h-3 animate-spin' />
                ) : (
                  <Check className='w-3 h-3' />
                )}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes list */}
      {isLoading ? (
        <div className='flex items-center justify-center py-4'>
          <Loader2
            className='w-4 h-4 animate-spin'
            style={{ color: 'var(--ns-ink-2)' }}
          />
        </div>
      ) : !notes || notes.length === 0 ? (
        <div className='fp-notes-empty'>aucune note pour ce patient…</div>
      ) : (
        <div
          className='space-y-1 max-h-80 overflow-y-auto pr-1'
          style={{ scrollbarWidth: 'thin' }}
        >
          {notes.map(note => (
            <div key={note.id} className='fp-note-item'>
              {editingId === note.id ? (
                /* Edit mode */
                <div>
                  <textarea
                    value={editContent}
                    onChange={e => handleEditChange(note.id, e.target.value)}
                    rows={3}
                    maxLength={5000}
                    autoFocus
                    className='w-full bg-transparent resize-y focus:outline-none'
                    style={{
                      fontFamily: 'var(--ns-font-script)',
                      fontSize: 20,
                      lineHeight: 1.25,
                      color: 'var(--ns-ink)',
                    }}
                  />
                  <div
                    className='flex items-center justify-between mt-1'
                    style={{
                      fontFamily: 'var(--ns-font-sans)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <div className='flex items-center gap-1.5'>
                      {editSaveStatus === 'saving' && (
                        <span
                          className='flex items-center gap-1'
                          style={{ color: 'var(--ns-ink-2)' }}
                        >
                          <Loader2 className='w-3 h-3 animate-spin' />
                          Enregistrement…
                        </span>
                      )}
                      {editSaveStatus === 'saved' && (
                        <span
                          className='flex items-center gap-1'
                          style={{ color: 'var(--ns-sage-700)' }}
                        >
                          <Check className='w-3 h-3' />
                          Sauvegardé
                        </span>
                      )}
                      {editSaveStatus === 'error' && (
                        <span style={{ color: 'var(--ns-coral)' }}>
                          Erreur de sauvegarde
                        </span>
                      )}
                    </div>
                    <button
                      type='button'
                      onClick={stopEditing}
                      className='fp-note-action'
                      style={{ padding: '2px 8px' }}
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              ) : (
                /* Read mode */
                <>
                  {note.content}
                  <span className='fp-note-meta'>
                    <span title={formatFullDate(note.created_at)}>
                      {formatTimestamp(note.created_at)}
                      {note.updated_at !== note.created_at && ' (modifiée)'}
                    </span>
                    <span className='fp-note-actions'>
                      <button
                        type='button'
                        onClick={() => startEditing(note)}
                        className='fp-note-action'
                        title='Modifier'
                      >
                        <Pencil className='w-3 h-3' />
                      </button>
                      {deleteConfirmId === note.id ? (
                        <>
                          <button
                            type='button'
                            onClick={() => handleDelete(note.id)}
                            disabled={deleteMutation.isPending}
                            className='fp-note-action'
                            style={{
                              background: 'var(--ns-coral)',
                              color: 'var(--ns-cream-50)',
                            }}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className='w-3 h-3 animate-spin' />
                            ) : (
                              'Supprimer'
                            )}
                          </button>
                          <button
                            type='button'
                            onClick={() => setDeleteConfirmId(null)}
                            className='fp-note-action'
                          >
                            <X className='w-3 h-3' />
                          </button>
                        </>
                      ) : (
                        <button
                          type='button'
                          onClick={() => setDeleteConfirmId(note.id)}
                          className='fp-note-action'
                          title='Supprimer'
                        >
                          <Trash2 className='w-3 h-3' />
                        </button>
                      )}
                    </span>
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className='fp-notes-foot'>
        <Lock className='w-3 h-3' />
        Non visible par le patient
      </div>
    </article>
  );
}
