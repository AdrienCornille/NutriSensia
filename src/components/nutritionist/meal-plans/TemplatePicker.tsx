'use client';

import React, { useState } from 'react';
import { X, Loader2, Copy, UtensilsCrossed, Calendar } from 'lucide-react';
import {
  useNutritionistTemplates,
  useDuplicateFromTemplate,
} from '@/hooks/useNutritionistMealPlans';

// ============================================================================
// Types
// ============================================================================

interface TemplatePickerProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function TemplatePicker({
  patientId,
  patientName,
  onClose,
  onSuccess,
}: TemplatePickerProps) {
  const { data: templates, isLoading } = useNutritionistTemplates();
  const duplicate = useDuplicateFromTemplate(patientId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleSelect(templateId: string, templateName: string) {
    setSelectedId(templateId);
    setName(`${templateName} - ${patientName}`);
    // Default dates: today + 7 days
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 7);
    setStartDate(today.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
  }

  async function handleDuplicate() {
    setError(null);
    if (!selectedId || !name.trim() || !startDate || !endDate) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    try {
      await duplicate.mutateAsync({
        template_plan_id: selectedId,
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la duplication');
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='p-5 border-b border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>
                Créer depuis un modèle
              </h3>
              <p className='text-xs text-gray-500 mt-0.5'>
                Choisissez un modèle à dupliquer pour {patientName}
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Template list */}
        <div className='flex-1 overflow-y-auto p-4 min-h-0'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
              <span className='ml-2 text-sm text-gray-500'>
                Chargement des modèles...
              </span>
            </div>
          ) : !templates || templates.length === 0 ? (
            <div className='text-center py-8'>
              <UtensilsCrossed className='w-8 h-8 text-gray-300 mx-auto mb-2' />
              <p className='text-sm text-gray-500'>Aucun modèle disponible</p>
              <p className='text-xs text-gray-400 mt-1'>
                Sauvegardez un plan existant comme modèle pour le réutiliser ici
              </p>
            </div>
          ) : (
            <div className='space-y-2'>
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelect(tpl.id, tpl.name)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedId === tpl.id
                      ? 'border-[#1B998B] bg-emerald-50/50 ring-1 ring-[#1B998B]'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium text-gray-800'>
                      {tpl.name}
                    </p>
                    <Copy className='w-4 h-4 text-gray-400' />
                  </div>
                  <div className='flex gap-3 mt-1 text-xs text-gray-500'>
                    <span>{tpl.days_count} jours</span>
                    <span>{tpl.meals_count} repas</span>
                    {tpl.objective && (
                      <span className='truncate'>{tpl.objective}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Config form (shown when template selected) */}
          {selectedId && (
            <div className='mt-4 pt-4 border-t border-gray-100 space-y-3'>
              <div>
                <label className='text-xs font-medium text-gray-600 mb-1 block'>
                  Nom du nouveau plan
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]'
                />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='text-xs font-medium text-gray-600 mb-1 block'>
                    <Calendar className='w-3 h-3 inline mr-1' />
                    Date de début
                  </label>
                  <input
                    type='date'
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]'
                  />
                </div>
                <div>
                  <label className='text-xs font-medium text-gray-600 mb-1 block'>
                    <Calendar className='w-3 h-3 inline mr-1' />
                    Date de fin
                  </label>
                  <input
                    type='date'
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]'
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className='px-4'>
            <p className='text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2'>
              {error}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className='p-4 border-t border-gray-100 flex justify-end gap-2'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={handleDuplicate}
            disabled={!selectedId || !name.trim() || !startDate || !endDate || duplicate.isPending}
            className='flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
          >
            {duplicate.isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Copy className='w-4 h-4' />
            )}
            Dupliquer
          </button>
        </div>
      </div>
    </div>
  );
}
