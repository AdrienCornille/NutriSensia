'use client';

import React from 'react';
import { Upload } from 'lucide-react';

interface DocumentUploadCardProps {
  onClick: () => void;
}

/**
 * Dashed card placed first in the document grid — opens the upload modal.
 * Visually echoes the drop-zone pattern from the design without yet
 * supporting drag-and-drop (Supabase Storage upload TBD).
 */
export function DocumentUploadCard({ onClick }: DocumentUploadCardProps) {
  return (
    <button
      type='button'
      className='fp-doc-card is-upload'
      onClick={onClick}
      aria-label='Ajouter un document'
    >
      <span className='icon' aria-hidden='true'>
        <Upload className='w-4 h-4' />
      </span>
      <b>Glisser un fichier</b>
      <em>ou cliquer pour parcourir</em>
    </button>
  );
}
