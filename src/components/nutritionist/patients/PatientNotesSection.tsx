'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Lock,
  Check,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  StickyNote,
} from 'lucide-react';
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
    // Flush pending save
    if (editTimerRef.current) {
      clearTimeout(editTimerRef.current);
      if (editingId && editContent !== lastSavedEditRef.current && editContent.trim()) {
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

  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-amber-800">
            Notes internes
          </h3>
          {notes && notes.length > 0 && (
            <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
              {notes.length}
            </span>
          )}
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une note
          </button>
        )}
      </div>

      {/* Add note form */}
      {isAdding && (
        <div className="mb-4 bg-white rounded-lg border border-amber-200 p-3">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Nouvelle note..."
            rows={3}
            maxLength={5000}
            autoFocus
            className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 resize-y focus:outline-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {newContent.length}/5000
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewContent('');
                }}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={!newContent.trim() || createMutation.isPending}
                className="flex items-center gap-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-md transition-colors"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
        </div>
      ) : !notes || notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-amber-600/60">
          <StickyNote className="w-8 h-8 mb-2" />
          <p className="text-sm">Aucune note pour ce patient</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-lg border border-amber-100 p-3 group"
            >
              {editingId === note.id ? (
                /* Edit mode */
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => handleEditChange(note.id, e.target.value)}
                    rows={3}
                    maxLength={5000}
                    autoFocus
                    className="w-full bg-transparent text-sm text-gray-700 resize-y focus:outline-none"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5">
                      {editSaveStatus === 'saving' && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Enregistrement...
                        </span>
                      )}
                      {editSaveStatus === 'saved' && (
                        <span className="flex items-center gap-1 text-xs text-[#1B998B]">
                          <Check className="w-3 h-3" />
                          Sauvegardé
                        </span>
                      )}
                      {editSaveStatus === 'error' && (
                        <span className="text-xs text-red-600">
                          Erreur de sauvegarde
                        </span>
                      )}
                    </div>
                    <button
                      onClick={stopEditing}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              ) : (
                /* Read mode */
                <div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="text-xs text-gray-400"
                      title={formatFullDate(note.created_at)}
                    >
                      {formatTimestamp(note.created_at)}
                      {note.updated_at !== note.created_at && ' (modifiée)'}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirmId === note.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(note.id)}
                            disabled={deleteMutation.isPending}
                            className="text-xs text-red-600 hover:text-red-800 px-1.5 py-0.5 rounded"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Supprimer'
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-0.5 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(note.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-amber-600 mt-2">
        Non visible par le patient
      </p>
    </div>
  );
}
