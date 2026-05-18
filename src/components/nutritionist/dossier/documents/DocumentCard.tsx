'use client';

import React from 'react';
import { Download, Eye, Trash2, Loader2 } from 'lucide-react';
import type { DocumentDetail } from '@/types/nutritionist-dossier';

interface DocumentCardProps {
  document: DocumentDetail;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const CATEGORY_PREVIEW_CLASS: Record<string, string> = {
  Analyses: 'is-analyses',
  Plans: 'is-plans',
  Ressources: 'is-ressources',
  Autre: 'is-autre',
};

const CATEGORY_TAG_STYLE: Record<string, React.CSSProperties | undefined> = {
  Plans: {
    background: 'var(--ns-peps)',
    borderColor: 'var(--ns-ink)',
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function fileExtension(name: string, fallbackType?: string): string {
  const m = name.match(/\.([a-z0-9]+)$/i);
  if (m) return m[1].toUpperCase();
  if (fallbackType) return fallbackType.toUpperCase();
  return 'DOC';
}

function isPdfLike(doc: DocumentDetail): boolean {
  if (doc.file_type?.toLowerCase().includes('pdf')) return true;
  if (doc.mime_type?.toLowerCase().includes('pdf')) return true;
  if (doc.name.toLowerCase().endsWith('.pdf')) return true;
  return false;
}

function monogram(name: string): string {
  const cleaned = name.replace(/\.[^.]+$/, '').trim();
  if (!cleaned) return '?';
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

export function DocumentCard({
  document: doc,
  onDelete,
  isDeleting,
}: DocumentCardProps) {
  const previewClass =
    CATEGORY_PREVIEW_CLASS[doc.category] ?? CATEGORY_PREVIEW_CLASS.Autre;
  const tagStyle = CATEGORY_TAG_STYLE[doc.category];
  const isPdf = isPdfLike(doc);
  const isFromPatient = doc.uploader_type === 'patient';

  return (
    <article className='fp-doc-card'>
      <div className={`fp-doc-preview ${previewClass}`}>
        <span className='fp-doc-cat-tag' style={tagStyle}>
          {doc.category}
        </span>
        <span
          className={`fp-doc-source-tag ${isFromPatient ? 'is-patient' : ''}`}
        >
          {isFromPatient ? 'Patient' : 'Vous'}
        </span>
        {isPdf ? (
          <div className='fp-doc-preview-pdf'>
            <b>{fileExtension(doc.name, doc.file_type)}</b>
          </div>
        ) : (
          <span className='fp-doc-preview-glyph'>{monogram(doc.name)}</span>
        )}
      </div>

      <div className='fp-doc-body'>
        <div className='fp-doc-name' title={doc.name}>
          {doc.name}
        </div>
        <div className='fp-doc-meta'>
          <span>
            {fileExtension(doc.name, doc.file_type)}
            {doc.file_size ? ` · ${formatFileSize(doc.file_size)}` : ''}
          </span>
          <span className='dot' />
          <span>{formatDate(doc.created_at)}</span>
        </div>
      </div>

      <div className='fp-doc-foot'>
        {doc.file_url ? (
          <a
            href={doc.file_url}
            target='_blank'
            rel='noopener noreferrer'
            className='fp-btn'
          >
            <Eye className='w-3 h-3' />
            Aperçu
          </a>
        ) : (
          <button type='button' className='fp-btn' disabled>
            <Eye className='w-3 h-3' />
            Aperçu
          </button>
        )}
        {doc.file_url && (
          <a
            href={doc.file_url}
            download
            className='fp-btn fp-btn-icon'
            aria-label='Télécharger'
          >
            <Download className='w-3 h-3' />
          </a>
        )}
        <button
          type='button'
          className='fp-btn fp-btn-icon'
          onClick={() => {
            if (confirm('Supprimer ce document ?')) onDelete(doc.id);
          }}
          disabled={isDeleting}
          aria-label='Supprimer'
        >
          {isDeleting ? (
            <Loader2 className='w-3 h-3 animate-spin' />
          ) : (
            <Trash2 className='w-3 h-3' style={{ color: 'var(--ns-coral)' }} />
          )}
        </button>
      </div>
    </article>
  );
}
