'use client';

import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  useContentVersions,
  useRestoreVersion,
} from '@/hooks/useContentInteractions';
import { ContentVersion } from '@/types/educational-content';

interface VersionHistoryProps {
  contentId: string;
}

export function VersionHistory({ contentId }: VersionHistoryProps) {
  const { data: versions, isLoading } = useContentVersions(contentId);
  const restoreMutation = useRestoreVersion();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <div className='text-center py-8'>
        <History className='w-10 h-10 text-gray-300 mx-auto mb-2' />
        <p className='text-sm text-gray-500'>Aucune version enregistrée</p>
        <p className='text-xs text-gray-400 mt-1'>
          Une version est créée à chaque publication
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {versions.map(version => (
        <div
          key={version.id}
          className='border border-gray-200 rounded-lg overflow-hidden'
        >
          {/* Header */}
          <button
            onClick={() =>
              setExpandedId(expandedId === version.id ? null : version.id)
            }
            className='flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors'
          >
            <span className='w-7 h-7 rounded-full bg-[#1B998B]/10 text-[#1B998B] text-xs font-semibold flex items-center justify-center'>
              v{version.versionNumber}
            </span>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {version.changeSummary || version.title}
              </p>
              <p className='text-xs text-gray-400 flex items-center gap-1'>
                <Clock className='w-3 h-3' />
                {new Date(version.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {expandedId === version.id ? (
              <ChevronUp className='w-4 h-4 text-gray-400' />
            ) : (
              <ChevronDown className='w-4 h-4 text-gray-400' />
            )}
          </button>

          {/* Expanded content */}
          {expandedId === version.id && (
            <div className='px-4 pb-4 border-t border-gray-100'>
              <div className='mt-3 space-y-3'>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1'>
                    Titre
                  </p>
                  <p className='text-sm text-gray-700'>{version.title}</p>
                </div>
                {version.summary && (
                  <div>
                    <p className='text-xs font-medium text-gray-500 mb-1'>
                      Résumé
                    </p>
                    <p className='text-sm text-gray-700'>{version.summary}</p>
                  </div>
                )}
                {version.body && (
                  <div>
                    <p className='text-xs font-medium text-gray-500 mb-1'>
                      Contenu (aperçu)
                    </p>
                    <div className='text-sm text-gray-600 max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3 prose prose-sm'>
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            version.body.length > 500
                              ? version.body.slice(0, 500) + '...'
                              : version.body,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Restore button */}
                {confirmRestoreId === version.id ? (
                  <div className='flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200'>
                    <p className='flex-1 text-sm text-amber-800'>
                      Restaurer cette version ? Le contenu actuel sera écrasé.
                    </p>
                    <button
                      onClick={() => setConfirmRestoreId(null)}
                      className='px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-white'
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        restoreMutation.mutate({
                          contentId,
                          versionId: version.id,
                        });
                        setConfirmRestoreId(null);
                      }}
                      disabled={restoreMutation.isPending}
                      className='px-3 py-1.5 text-xs text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50'
                    >
                      {restoreMutation.isPending
                        ? 'Restauration...'
                        : 'Confirmer'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRestoreId(version.id)}
                    className='flex items-center gap-2 text-sm text-[#1B998B] hover:underline'
                  >
                    <RotateCcw className='w-4 h-4' />
                    Restaurer cette version
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
