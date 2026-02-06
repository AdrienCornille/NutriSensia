'use client';

import React from 'react';
import type { PatientDocument } from '@/types/dossier';
import { documentUploaderConfig } from '@/types/dossier';

interface DocumentItemProps {
  document: PatientDocument;
  onClick: (document: PatientDocument) => void;
}

export function DocumentItem({ document, onClick }: DocumentItemProps) {
  const uploaderConf = documentUploaderConfig[document.uploadedBy];

  return (
    <div
      onClick={() => onClick(document)}
      className='flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer'
    >
      <div className='flex items-center gap-4'>
        <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200'>
          <span className='text-2xl'>
            {document.type === 'pdf' ? '📕' : '🖼'}
          </span>
        </div>
        <div>
          <p className='font-medium text-gray-800'>{document.name}</p>
          <div className='flex items-center gap-2 mt-1'>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${uploaderConf.bgColor} ${uploaderConf.textColor}`}
            >
              {uploaderConf.label}
            </span>
            <span className='text-xs text-gray-500'>{document.category}</span>
            <span className='text-gray-300'>•</span>
            <span className='text-xs text-gray-500'>{document.size}</span>
          </div>
        </div>
      </div>
      <div className='flex items-center gap-3'>
        <span className='text-sm text-gray-500'>{document.uploadedAt}</span>
        <button
          onClick={e => {
            e.stopPropagation();
            // TODO: Implement download
          }}
          className='p-2 hover:bg-white rounded-lg text-gray-400'
        >
          📥
        </button>
      </div>
    </div>
  );
}

export default DocumentItem;
