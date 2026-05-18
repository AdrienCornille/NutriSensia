'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, AlertCircle, FolderOpen } from 'lucide-react';
import {
  usePatientDocuments,
  useDeleteDocument,
} from '@/hooks/useNutritionistDossier';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentCard } from './DocumentCard';
import { DocumentUploadCard } from './DocumentUploadCard';

interface NutritionistDocumentsViewProps {
  patientId: string;
}

const FILTERS = ['all', 'Analyses', 'Plans', 'Ressources', 'Autre'] as const;
const FILTER_LABELS: Record<(typeof FILTERS)[number], string> = {
  all: 'Tous',
  Analyses: 'Analyses',
  Plans: 'Plans',
  Ressources: 'Ressources',
  Autre: 'Autre',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function NutritionistDocumentsView({
  patientId,
}: NutritionistDocumentsViewProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [categoryFilter, setCategoryFilter] =
    useState<(typeof FILTERS)[number]>('all');

  const { data: documents, isLoading, error } = usePatientDocuments(patientId);
  const deleteDocument = useDeleteDocument(patientId);

  const counts = useMemo(() => {
    const list = documents || [];
    const c: Record<string, number> = { all: list.length };
    for (const cat of FILTERS) {
      if (cat === 'all') continue;
      c[cat] = list.filter(d => d.category === cat).length;
    }
    return c;
  }, [documents]);

  const filteredDocs = useMemo(() => {
    const list = documents || [];
    if (categoryFilter === 'all') return list;
    return list.filter(d => d.category === categoryFilter);
  }, [documents, categoryFilter]);

  const myUploads = (documents || []).filter(
    d => d.uploader_type === 'nutritionist'
  ).length;
  const patientUploads = (documents || []).length - myUploads;
  const lastUpload = (documents || []).reduce<string | null>((acc, d) => {
    if (!acc) return d.created_at;
    return d.created_at > acc ? d.created_at : acc;
  }, null);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2
          className='w-6 h-6 animate-spin'
          style={{ color: 'var(--ns-peps-deep)' }}
        />
        <span className='ml-2 text-sm' style={{ color: 'var(--ns-ink-3)' }}>
          Chargement des documents…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='fp-card text-center'>
        <AlertCircle
          className='w-8 h-8 mx-auto mb-3'
          style={{ color: 'var(--ns-coral)' }}
        />
        <p
          className='font-serif text-lg mb-1'
          style={{ color: 'var(--ns-ink)' }}
        >
          Erreur de chargement
        </p>
        <p className='text-sm' style={{ color: 'var(--ns-ink-3)' }}>
          {error.message}
        </p>
      </div>
    );
  }

  const total = (documents || []).length;

  return (
    <div className='space-y-4'>
      {/* ─── Pane intro ─── */}
      <section className='fp-pane-intro'>
        <div>
          <h2 className='fp-pane-intro-title'>
            Documents <em>du patient</em>
          </h2>
          <div className='fp-pane-intro-meta'>
            <span>
              <b>{total}</b> fichier{total > 1 ? 's' : ''}
            </span>
            {total > 0 && (
              <>
                <span className='dot' />
                <span>
                  Vous : <b>{myUploads}</b>
                </span>
                <span className='dot' />
                <span>
                  Patient : <b>{patientUploads}</b>
                </span>
              </>
            )}
            {lastUpload && (
              <>
                <span className='dot' />
                <span>
                  Dernier upload · <b>{formatDate(lastUpload)}</b>
                </span>
              </>
            )}
          </div>
        </div>
        <div className='fp-pane-intro-actions'>
          <button
            type='button'
            className='fp-btn fp-btn-peps'
            onClick={() => setShowUploadModal(true)}
          >
            + Ajouter un document
          </button>
        </div>
      </section>

      {/* ─── Toolbar ─── */}
      <div className='fp-doc-toolbar'>
        <div className='fp-doc-filters'>
          {FILTERS.map(cat => (
            <button
              key={cat}
              type='button'
              onClick={() => setCategoryFilter(cat)}
              className={categoryFilter === cat ? 'is-active' : ''}
            >
              {FILTER_LABELS[cat]} <span className='cnt'>{counts[cat]}</span>
            </button>
          ))}
        </div>
        <span
          style={{
            fontFamily: 'var(--ns-font-serif)',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--ns-ink-3)',
          }}
        >
          Glisser-déposer pour ajouter · 10 Mo max par fichier
        </span>
      </div>

      {/* ─── Grid ─── */}
      {filteredDocs.length === 0 && categoryFilter !== 'all' ? (
        <div className='fp-card text-center' style={{ padding: '48px 32px' }}>
          <FolderOpen
            className='w-10 h-10 mx-auto mb-3'
            style={{ color: 'var(--ns-ink-4)' }}
          />
          <p
            className='font-serif text-lg mb-1'
            style={{ color: 'var(--ns-ink)' }}
          >
            Aucun document dans cette catégorie
          </p>
        </div>
      ) : (
        <div className='fp-doc-grid'>
          <DocumentUploadCard onClick={() => setShowUploadModal(true)} />
          {filteredDocs.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={id => deleteDocument.mutate(id)}
              isDeleting={
                deleteDocument.isPending &&
                (deleteDocument.variables as string | undefined) === doc.id
              }
            />
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
