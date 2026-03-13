'use client';

import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { useUploadDocument } from '@/hooks/useNutritionistDossier';

interface DocumentUploadModalProps {
  patientId: string;
  onClose: () => void;
}

const categories = ['Analyses', 'Plans', 'Ressources', 'Autre'] as const;

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
        file_url: '', // Would be set after actual file upload to Supabase Storage
        file_type: 'pdf',
      });
      onClose();
    } catch {
      // error handled by React Query
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-md mx-4'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Ajouter un document
          </h3>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-gray-700 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Nom du document *
            </label>
            <input
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='ex: Analyse sanguine mars 2026'
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Catégorie
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Description optionnelle...'
              rows={3}
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B] resize-none'
            />
          </div>

          {/* File upload zone placeholder */}
          <div className='border-2 border-dashed border-gray-200 rounded-lg p-6 text-center'>
            <Upload className='w-8 h-8 text-gray-300 mx-auto mb-2' />
            <p className='text-sm text-gray-500'>
              Zone d&apos;upload de fichier
            </p>
            <p className='text-xs text-gray-400 mt-1'>
              (Intégration Supabase Storage à venir)
            </p>
          </div>

          <div className='flex justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Annuler
            </button>
            <button
              type='submit'
              disabled={!name.trim() || uploadDocument.isPending}
              className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium disabled:opacity-50'
            >
              {uploadDocument.isPending && (
                <Loader2 className='w-4 h-4 animate-spin' />
              )}
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
