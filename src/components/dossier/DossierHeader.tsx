'use client';

import React from 'react';

interface DossierHeaderProps {
  onExport?: () => void;
}

export function DossierHeader({ onExport }: DossierHeaderProps) {
  return (
    <div className='bg-white border-b border-gray-200 px-8 py-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-lg font-semibold text-gray-800'>Mon dossier</h1>
          <p className='text-sm text-gray-500'>
            Votre historique et documents médicaux
          </p>
        </div>
        <button
          onClick={onExport}
          className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
        >
          <span>📥</span>
          <span className='text-sm font-medium'>Exporter mon dossier</span>
        </button>
      </div>
    </div>
  );
}

export default DossierHeader;
