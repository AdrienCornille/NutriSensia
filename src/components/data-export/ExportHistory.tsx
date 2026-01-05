/**
 * Composant d'historique des exports de données
 *
 * Affiche :
 * - Liste des exports précédents
 * - Statut de chaque export
 * - Liens de téléchargement actifs
 * - Informations d'audit et conformité RGPD
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Calendar,
  Clock,
  FileText,
  Shield,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
} from 'lucide-react';
import { useExportHistory, useDownloadManager } from '@/hooks/useDataExport';
import type { ExportHistoryEntry } from '@/lib/data-export';

interface ExportHistoryProps {
  /** Nombre d'entrées à afficher par page */
  pageSize?: number;
  /** Affichage compact */
  compact?: boolean;
}

/**
 * Badge de statut d'export
 */
const StatusBadge = ({ status }: { status: ExportHistoryEntry['status'] }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'En attente',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    processing: {
      icon: RefreshCw,
      label: 'En cours',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    completed: {
      icon: CheckCircle,
      label: 'Terminé',
      color: 'bg-green-100 text-green-800 border-green-200',
    },
    failed: {
      icon: XCircle,
      label: 'Échec',
      color: 'bg-red-100 text-red-800 border-red-200',
    },
    expired: {
      icon: AlertTriangle,
      label: 'Expiré',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      <Icon className='w-3 h-3 mr-1' />
      {config.label}
    </span>
  );
};

/**
 * Carte d'entrée d'historique
 */
const HistoryEntryCard = ({
  entry,
  onDownload,
  onDelete,
}: {
  entry: ExportHistoryEntry;
  onDownload?: (entry: ExportHistoryEntry) => void;
  onDelete?: (entry: ExportHistoryEntry) => void;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const isExpired = entry.status === 'expired' || new Date() > entry.expiresAt;
  const canDownload = entry.status === 'completed' && !isExpired;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${Math.round(size * 10) / 10} ${units[unitIndex]}`;
  };

  return (
    <motion.div
      layout
      className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center space-x-3 mb-2'>
            <div className='flex items-center space-x-2'>
              <FileText className='w-4 h-4 text-gray-600' />
              <span className='font-medium text-gray-900'>
                Export {entry.format.toUpperCase()}
              </span>
            </div>
            <StatusBadge status={entry.status} />
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3'>
            <div className='flex items-center space-x-2'>
              <Calendar className='w-4 h-4' />
              <span>Créé le {formatDate(entry.requestedAt)}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Clock className='w-4 h-4' />
              <span>
                Expire le {formatDate(entry.expiresAt)}
                {isExpired && (
                  <span className='text-red-600 ml-1'>(Expiré)</span>
                )}
              </span>
            </div>
          </div>

          <div className='flex items-center space-x-4 text-sm text-gray-600'>
            <span>Sections: {entry.sections.length}</span>
            <span>Taille: {formatFileSize(entry.fileSize)}</span>
            <span>Téléchargements: {entry.downloadCount}</span>
          </div>
        </div>

        <div className='flex items-center space-x-2 ml-4'>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className='p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100'
            title='Voir les détails'
          >
            <Eye className='w-4 h-4' />
          </button>

          {canDownload && onDownload && (
            <button
              onClick={() => onDownload(entry)}
              className='p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50'
              title='Télécharger'
            >
              <Download className='w-4 h-4' />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(entry)}
              className='p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50'
              title='Supprimer'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>

      {/* Détails étendus */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='mt-4 pt-4 border-t border-gray-200'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>
                  Informations techniques
                </h4>
                <div className='space-y-1 text-gray-600'>
                  <div>
                    ID Export:{' '}
                    <code className='bg-gray-100 px-1 rounded'>
                      {entry.exportId}
                    </code>
                  </div>
                  <div>Format: {entry.format}</div>
                  {entry.lastDownloadAt && (
                    <div>
                      Dernier téléchargement: {formatDate(entry.lastDownloadAt)}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className='font-medium text-gray-900 mb-2'>
                  Sections exportées
                </h4>
                <div className='flex flex-wrap gap-1'>
                  {entry.sections.map(section => (
                    <span
                      key={section}
                      className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded'
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className='font-medium text-gray-900 mb-2'>
                  Sécurité et audit
                </h4>
                <div className='space-y-1 text-gray-600'>
                  <div className='flex items-center space-x-2'>
                    <Shield className='w-4 h-4' />
                    <span>IP: {entry.ipAddress}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Lock className='w-4 h-4' />
                    <span>
                      Chiffré:{' '}
                      {entry.sections.includes('encrypted' as any)
                        ? 'Oui'
                        : 'Non'}
                    </span>
                  </div>
                </div>
              </div>

              {entry.error && (
                <div>
                  <h4 className='font-medium text-red-900 mb-2'>Erreur</h4>
                  <p className='text-red-700 text-sm bg-red-50 p-2 rounded'>
                    {entry.error}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Composant principal de l'historique des exports
 */
export const ExportHistory = ({
  pageSize = 10,
  compact = false,
}: ExportHistoryProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'size'>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: history, isLoading, error, refetch } = useExportHistory();
  const { trackDownload } = useDownloadManager();

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg border p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-4 bg-gray-200 rounded w-1/4'></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='h-20 bg-gray-200 rounded'></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-lg border p-6'>
        <div className='text-center'>
          <XCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Erreur de chargement
          </h3>
          <p className='text-gray-600 mb-4'>
            Impossible de charger l'historique des exports
          </p>
          <button
            onClick={() => refetch()}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const filteredHistory =
    history?.filter(
      entry => filterStatus === 'all' || entry.status === filterStatus
    ) || [];

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return (
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        );
      case 'status':
        return a.status.localeCompare(b.status);
      case 'size':
        return (b.fileSize || 0) - (a.fileSize || 0);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedHistory.length / pageSize);
  const paginatedHistory = sortedHistory.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDownload = (entry: ExportHistoryEntry) => {
    // En réalité, il faudrait régénérer l'URL de téléchargement
    const filename = `nutrisensia_export_${entry.exportId}.${entry.format}`;
    trackDownload(entry.exportId, '#', filename);
  };

  const handleDelete = (entry: ExportHistoryEntry) => {
    // Implémenter la suppression
    console.log("Supprimer l'export:", entry.exportId);
  };

  if (!history || history.length === 0) {
    return (
      <div className='bg-white rounded-lg border p-6'>
        <div className='text-center'>
          <FileText className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Aucun export trouvé
          </h3>
          <p className='text-gray-600'>
            Vous n'avez pas encore créé d'export de données.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg border'>
      {/* En-tête */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              Historique des exports
            </h3>
            <p className='text-gray-600 text-sm mt-1'>
              {filteredHistory.length} export
              {filteredHistory.length > 1 ? 's' : ''} trouvé
              {filteredHistory.length > 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className='p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100'
            title='Actualiser'
          >
            <RefreshCw className='w-4 h-4' />
          </button>
        </div>

        {/* Filtres et tri */}
        <div className='flex items-center space-x-4 mt-4'>
          <div className='flex items-center space-x-2'>
            <label className='text-sm font-medium text-gray-700'>Statut:</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className='text-sm border border-gray-300 rounded px-2 py-1'
            >
              <option value='all'>Tous</option>
              <option value='completed'>Terminés</option>
              <option value='pending'>En attente</option>
              <option value='failed'>Échecs</option>
              <option value='expired'>Expirés</option>
            </select>
          </div>

          <div className='flex items-center space-x-2'>
            <label className='text-sm font-medium text-gray-700'>
              Trier par:
            </label>
            <select
              value={sortBy}
              onChange={e =>
                setSortBy(e.target.value as 'date' | 'status' | 'size')
              }
              className='text-sm border border-gray-300 rounded px-2 py-1'
            >
              <option value='date'>Date</option>
              <option value='status'>Statut</option>
              <option value='size'>Taille</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des exports */}
      <div className='p-6'>
        <div className='space-y-4'>
          <AnimatePresence>
            {paginatedHistory.map(entry => (
              <HistoryEntryCard
                key={entry.id}
                entry={entry}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between mt-6 pt-4 border-t border-gray-200'>
            <div className='text-sm text-gray-600'>
              Page {currentPage} sur {totalPages}
            </div>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className='px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Précédent
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className='px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Informations RGPD */}
      <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg'>
        <div className='flex items-start space-x-2'>
          <Shield className='w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0' />
          <div>
            <h4 className='text-sm font-medium text-gray-900'>
              Conformité RGPD
            </h4>
            <p className='text-xs text-gray-600 mt-1'>
              Vos exports sont conservés 7 jours puis automatiquement supprimés.
              Vous pouvez télécharger vos données à tout moment pendant cette
              période.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
