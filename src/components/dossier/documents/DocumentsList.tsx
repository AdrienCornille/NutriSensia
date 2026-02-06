'use client';

import React from 'react';
import { DocumentItem } from './DocumentItem';
import type { PatientDocument, DocumentCategory } from '@/types/dossier';
import { filterDocumentsByCategory } from '@/types/dossier';
import { documentCategories } from '@/data/mock-dossier';

interface DocumentsListProps {
  documents: PatientDocument[];
  filter: DocumentCategory | 'all';
  onFilterChange: (filter: DocumentCategory | 'all') => void;
  onDocumentClick: (document: PatientDocument) => void;
}

export function DocumentsList({
  documents,
  filter,
  onFilterChange,
  onDocumentClick,
}: DocumentsListProps) {
  const filteredDocuments = filterDocumentsByCategory(documents, filter);

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='font-semibold text-gray-800'>Mes documents</h2>
        <select
          value={filter}
          onChange={e => {
            const value = e.target.value;
            onFilterChange(
              value === 'Toutes les catégories'
                ? 'all'
                : (value as DocumentCategory)
            );
          }}
          className='px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B] bg-white'
        >
          {documentCategories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className='space-y-3'>
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map(doc => (
            <DocumentItem
              key={doc.id}
              document={doc}
              onClick={onDocumentClick}
            />
          ))
        ) : (
          <p className='text-center text-gray-500 py-8'>
            Aucun document dans cette catégorie
          </p>
        )}
      </div>
    </div>
  );
}

export default DocumentsList;
