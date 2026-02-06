'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { EditableField } from '@/types/profile';

interface EditFieldModalProps {
  isOpen: boolean;
  field: EditableField | null;
  onClose: () => void;
  onSave: (key: string, value: string) => void;
}

export function EditFieldModal({
  isOpen,
  field,
  onClose,
  onSave,
}: EditFieldModalProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (field) {
      setValue(field.value);
    }
  }, [field]);

  if (!isOpen || !field) return null;

  const handleSave = () => {
    onSave(field.key, value);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-md w-full p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Modifier {field.label.toLowerCase()}
          </h3>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        <input
          type={field.type || 'text'}
          value={value}
          onChange={e => setValue(e.target.value)}
          className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 mb-6'
          placeholder={field.label}
        />

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors'
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditFieldModal;
