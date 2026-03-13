'use client';

import React, { useState } from 'react';
import {
  Loader2,
  AlertCircle,
  FileText,
  Upload,
  Trash2,
  Download,
  FolderOpen,
} from 'lucide-react';
import {
  usePatientDocuments,
  useDeleteDocument,
} from '@/hooks/useNutritionistDossier';
import { DocumentUploadModal } from './DocumentUploadModal';

interface NutritionistDocumentsViewProps {
  patientId: string;
}

const categoryColors: Record<string, string> = {
  Analyses: 'bg-blue-100 text-blue-700',
  Plans: 'bg-green-100 text-green-700',
  Ressources: 'bg-purple-100 text-purple-700',
  Autre: 'bg-gray-100 text-gray-600',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function NutritionistDocumentsView({
  patientId,
}: NutritionistDocumentsViewProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: documents, isLoading, error } = usePatientDocuments(patientId);
  const deleteDocument = useDeleteDocument(patientId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        <span className='ml-2 text-sm text-gray-500'>
          Chargement des documents...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
        <AlertCircle className='w-8 h-8 text-red-500 mx-auto mb-3' />
        <p className='text-gray-800 font-medium mb-1'>Erreur de chargement</p>
        <p className='text-sm text-gray-500'>{error.message}</p>
      </div>
    );
  }

  const filteredDocs =
    categoryFilter === 'all'
      ? documents || []
      : (documents || []).filter(d => d.category === categoryFilter);

  const categories = ['all', 'Analyses', 'Plans', 'Ressources', 'Autre'];

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-800'>Documents</h3>
            <p className='text-sm text-gray-500 mt-1'>
              {(documents || []).length} document
              {(documents || []).length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium'
          >
            <Upload className='w-4 h-4' />
            Ajouter un document
          </button>
        </div>

        {/* Category filter */}
        <div className='flex gap-2 mt-4'>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'Tous' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents list */}
      {filteredDocs.length === 0 ? (
        <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
          <FolderOpen className='w-12 h-12 text-gray-300 mx-auto mb-3' />
          <p className='text-gray-800 font-medium mb-1'>Aucun document</p>
          <p className='text-sm text-gray-500'>
            {categoryFilter !== 'all'
              ? 'Aucun document dans cette catégorie.'
              : 'Ajoutez le premier document pour ce patient.'}
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className='bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between'
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
                  <FileText className='w-5 h-5 text-gray-400' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-800'>
                    {doc.name}
                  </p>
                  <div className='flex items-center gap-2 mt-0.5'>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        categoryColors[doc.category] || categoryColors.Autre
                      }`}
                    >
                      {doc.category}
                    </span>
                    <span className='text-xs text-gray-400'>
                      {formatDate(doc.created_at)}
                    </span>
                    {doc.file_size && (
                      <span className='text-xs text-gray-400'>
                        {formatFileSize(doc.file_size)}
                      </span>
                    )}
                    <span className='text-xs text-gray-400'>
                      par{' '}
                      {doc.uploader_type === 'nutritionist'
                        ? 'vous'
                        : 'le patient'}
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-1'>
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-2 text-gray-400 hover:text-[#1B998B] transition-colors'
                    title='Télécharger'
                  >
                    <Download className='w-4 h-4' />
                  </a>
                )}
                <button
                  onClick={() => {
                    if (confirm('Supprimer ce document ?')) {
                      deleteDocument.mutate(doc.id);
                    }
                  }}
                  disabled={deleteDocument.isPending}
                  className='p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50'
                  title='Supprimer'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          patientId={patientId}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}
