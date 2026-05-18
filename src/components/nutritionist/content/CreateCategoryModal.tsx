'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Tag, Loader2 } from 'lucide-react';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  isCreating?: boolean;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  onCreate,
  isCreating = false,
}: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Le nom de la catégorie est requis');
      return;
    }
    if (trimmed.length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return;
    }
    if (trimmed.length > 50) {
      setError('Le nom ne peut pas dépasser 50 caractères');
      return;
    }
    setError('');
    onCreate(trimmed);
  };

  return (
    <div
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden flex flex-col'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-5 border-b border-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-[#1B998B]/10 flex items-center justify-center'>
              <Tag className='w-4.5 h-4.5 text-[#1B998B]' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-gray-900'>
                Nouvelle catégorie
              </h2>
              <p className='text-xs text-gray-500'>
                Créez une catégorie personnalisée pour vos contenus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className='p-5'>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Nom de la catégorie
            </label>
            <input
              ref={inputRef}
              type='text'
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder='ex : Alimentation anti-inflammatoire'
              maxLength={50}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B] transition-colors ${
                error
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                  : 'border-gray-200'
              }`}
            />
            {error && <p className='mt-1.5 text-xs text-red-500'>{error}</p>}
            <p className='mt-1.5 text-xs text-gray-400'>
              {name.length}/50 caractères
            </p>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors'
            >
              Annuler
            </button>
            <button
              type='submit'
              disabled={!name.trim() || isCreating}
              className='px-4 py-2.5 text-sm font-medium text-white bg-[#1B998B] rounded-xl hover:bg-[#147569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {isCreating ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Création...
                </>
              ) : (
                'Créer la catégorie'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
