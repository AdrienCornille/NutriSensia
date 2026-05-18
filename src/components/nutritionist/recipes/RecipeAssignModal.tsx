'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { X, Search, Check, Users, Loader2, Send } from 'lucide-react';

interface PatientOption {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
}

interface RecipeAssignModalProps {
  isOpen: boolean;
  recipeTitle: string;
  onClose: () => void;
  onAssign: (patientIds: string[], note: string | null) => Promise<void>;
  isSubmitting: boolean;
}

export function RecipeAssignModal({
  isOpen,
  recipeTitle,
  onClose,
  onAssign,
  isSubmitting,
}: RecipeAssignModalProps) {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [note, setNote] = useState('');

  // Fetch patients on open
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingPatients(true);
    fetch('/api/protected/nutritionist/patients?status=active&limit=100', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(json => {
        const list = (json.data?.patients || []).map(
          (p: Record<string, unknown>) => ({
            id: p.id,
            first_name: p.first_name || '',
            last_name: p.last_name || '',
            email: p.email || '',
            avatar_url: p.avatar_url || null,
          })
        );
        setPatients(list);
      })
      .catch(() => setPatients([]))
      .finally(() => setIsLoadingPatients(false));
  }, [isOpen]);

  const filteredPatients = searchQuery
    ? patients.filter(p =>
        `${p.first_name} ${p.last_name} ${p.email}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : patients;

  const togglePatient = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAssign = useCallback(async () => {
    await onAssign(Array.from(selectedIds), note || null);
    setSelectedIds(new Set());
    setNote('');
    onClose();
  }, [selectedIds, note, onAssign, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />
      <div className='relative bg-white rounded-2xl max-w-md w-full mx-4 shadow-xl max-h-[85vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-100'>
          <div>
            <h3 className='font-semibold text-gray-900 flex items-center gap-2'>
              <Send className='w-4 h-4 text-[#1B998B]' />
              Recommander
            </h3>
            <p className='text-xs text-gray-500 mt-0.5 truncate max-w-[280px]'>
              {recipeTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-full'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Search */}
        <div className='px-4 pt-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Rechercher un patient...'
              className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
            />
          </div>
          <p className='text-xs text-gray-500 mt-2'>
            {selectedIds.size} patient{selectedIds.size !== 1 ? 's' : ''}{' '}
            sélectionné{selectedIds.size !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Patient list */}
        <div className='flex-1 overflow-y-auto px-4 py-2 space-y-1 min-h-0'>
          {isLoadingPatients ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='w-6 h-6 animate-spin text-gray-400' />
            </div>
          ) : filteredPatients.length === 0 ? (
            <p className='text-sm text-gray-500 text-center py-8'>
              Aucun patient trouvé
            </p>
          ) : (
            filteredPatients.map(patient => {
              const isSelected = selectedIds.has(patient.id);
              const initials =
                `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`.toUpperCase();
              return (
                <button
                  key={patient.id}
                  onClick={() => togglePatient(patient.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-[#1B998B]/10 border border-[#1B998B]/30'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className='w-9 h-9 rounded-full bg-[#1B998B]/20 flex items-center justify-center text-xs font-medium text-[#1B998B] flex-shrink-0'>
                    {patient.avatar_url ? (
                      <img
                        src={patient.avatar_url}
                        alt=''
                        className='w-full h-full rounded-full object-cover'
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className='flex-1 text-left min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className='text-xs text-gray-500 truncate'>
                      {patient.email}
                    </p>
                  </div>
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-[#1B998B] text-white'
                        : 'border-2 border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className='w-3 h-3' />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Note + Submit */}
        <div className='p-4 border-t border-gray-100 space-y-3'>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder='Message personnalisé (optionnel)...'
            rows={2}
            maxLength={500}
            className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B998B] resize-none'
          />
          <button
            onClick={handleAssign}
            disabled={selectedIds.size === 0 || isSubmitting}
            className='w-full py-2.5 bg-[#1B998B] text-white rounded-lg font-medium hover:bg-[#158a7d] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm'
          >
            {isSubmitting ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Users className='w-4 h-4' />
            )}
            Recommander à {selectedIds.size} patient
            {selectedIds.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
