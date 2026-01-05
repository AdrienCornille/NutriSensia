/**
 * Tableau de bord de portabilité des données
 *
 * Interface principale pour la gestion des exports/imports conformes au RGPD :
 * - Vue d'ensemble des droits RGPD
 * - Assistant d'export de données
 * - Assistant d'import de données
 * - Historique des opérations
 * - Informations de conformité
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Upload,
  History,
  Shield,
  FileText,
  Database,
  Lock,
  Calendar,
  Info,
  CheckCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { DataExportWizard } from './DataExportWizard';
import { DataImportWizard } from './DataImportWizard';
import { ExportHistory } from './ExportHistory';
import { useExportHistory } from '@/hooks/useDataExport';

interface DataPortabilityDashboardProps {
  /** Callback pour fermer le tableau de bord */
  onClose?: () => void;
  /** Vue initiale à afficher */
  initialView?: 'overview' | 'export' | 'import' | 'history';
}

/**
 * Composant de statistiques rapides
 */
const QuickStats = () => {
  const { data: history } = useExportHistory();

  const stats = {
    totalExports: history?.length || 0,
    completedExports:
      history?.filter(h => h.status === 'completed').length || 0,
    activeDownloads:
      history?.filter(h => h.status === 'completed' && new Date() < h.expiresAt)
        .length || 0,
    dataSize: history?.reduce((sum, h) => sum + (h.fileSize || 0), 0) || 0,
  };

  const formatSize = (bytes: number) => {
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
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <FileText className='w-5 h-5 text-blue-600' />
          </div>
          <div>
            <div className='text-2xl font-bold text-blue-900'>
              {stats.totalExports}
            </div>
            <div className='text-sm text-blue-700'>Exports totaux</div>
          </div>
        </div>
      </div>

      <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-green-100 rounded-lg'>
            <CheckCircle className='w-5 h-5 text-green-600' />
          </div>
          <div>
            <div className='text-2xl font-bold text-green-900'>
              {stats.completedExports}
            </div>
            <div className='text-sm text-green-700'>Exports réussis</div>
          </div>
        </div>
      </div>

      <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-orange-100 rounded-lg'>
            <Download className='w-5 h-5 text-orange-600' />
          </div>
          <div>
            <div className='text-2xl font-bold text-orange-900'>
              {stats.activeDownloads}
            </div>
            <div className='text-sm text-orange-700'>
              Téléchargements actifs
            </div>
          </div>
        </div>
      </div>

      <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-purple-100 rounded-lg'>
            <Database className='w-5 h-5 text-purple-600' />
          </div>
          <div>
            <div className='text-2xl font-bold text-purple-900'>
              {formatSize(stats.dataSize)}
            </div>
            <div className='text-sm text-purple-700'>Données exportées</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant d'information RGPD
 */
const GDPRInfo = () => {
  return (
    <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6'>
      <div className='flex items-start space-x-4'>
        <div className='p-3 bg-blue-100 rounded-lg'>
          <Shield className='w-8 h-8 text-blue-600' />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-blue-900 mb-2'>
            Vos droits selon le RGPD
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <h4 className='font-medium text-blue-800 mb-2'>
                Droit à la portabilité
              </h4>
              <ul className='space-y-1 text-blue-700'>
                <li>• Recevoir vos données dans un format structuré</li>
                <li>• Transférer vos données à un autre service</li>
                <li>• Format lisible par machine (JSON, CSV)</li>
              </ul>
            </div>
            <div>
              <h4 className='font-medium text-blue-800 mb-2'>
                Sécurité et confidentialité
              </h4>
              <ul className='space-y-1 text-blue-700'>
                <li>• Chiffrement optionnel de vos exports</li>
                <li>• Liens de téléchargement temporaires</li>
                <li>• Suppression automatique après 7 jours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant de carte d'action rapide
 */
const ActionCard = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
  color = 'blue',
  disabled = false,
}: {
  icon: any;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  disabled?: boolean;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
  };

  const buttonClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  return (
    <motion.div
      className={`${colorClasses[color]} border rounded-lg p-6 ${disabled ? 'opacity-50' : ''}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      <div className='flex items-start space-x-4'>
        <div className={`p-3 bg-white rounded-lg shadow-sm`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold mb-2'>{title}</h3>
          <p className='text-sm mb-4 opacity-80'>{description}</p>
          <button
            onClick={onClick}
            disabled={disabled}
            className={`${buttonClasses[color]} text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Composant principal du tableau de bord
 */
export const DataPortabilityDashboard = ({
  onClose,
  initialView = 'overview',
}: DataPortabilityDashboardProps) => {
  const [currentView, setCurrentView] = useState<
    'overview' | 'export' | 'import' | 'history'
  >(initialView);

  const renderContent = () => {
    switch (currentView) {
      case 'export':
        return (
          <DataExportWizard
            onComplete={() => setCurrentView('history')}
            onClose={() => setCurrentView('overview')}
          />
        );

      case 'import':
        return (
          <DataImportWizard
            onComplete={() => setCurrentView('overview')}
            onClose={() => setCurrentView('overview')}
          />
        );

      case 'history':
        return <ExportHistory />;

      default:
        return (
          <div className='space-y-8'>
            {/* Informations RGPD */}
            <GDPRInfo />

            {/* Statistiques rapides */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Aperçu de votre activité
              </h3>
              <QuickStats />
            </div>

            {/* Actions rapides */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Actions disponibles
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <ActionCard
                  icon={Download}
                  title='Exporter mes données'
                  description='Téléchargez toutes vos données personnelles dans un format structuré, conforme au RGPD.'
                  buttonText="Démarrer l'export"
                  onClick={() => setCurrentView('export')}
                  color='blue'
                />

                <ActionCard
                  icon={Upload}
                  title='Importer des données'
                  description='Restaurez vos données depuis un export précédent ou migrez depuis un autre service.'
                  buttonText="Démarrer l'import"
                  onClick={() => setCurrentView('import')}
                  color='green'
                />

                <ActionCard
                  icon={History}
                  title='Historique des exports'
                  description="Consultez l'historique de vos exports et téléchargez les fichiers encore disponibles."
                  buttonText="Voir l'historique"
                  onClick={() => setCurrentView('history')}
                  color='purple'
                />

                <ActionCard
                  icon={Settings}
                  title='Paramètres de données'
                  description="Configurez vos préférences pour l'export et l'import de données."
                  buttonText='Configurer'
                  onClick={() => {
                    /* Implémenter les paramètres */
                  }}
                  color='orange'
                  disabled={true}
                />
              </div>
            </div>

            {/* Informations légales */}
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
              <div className='flex items-start space-x-3'>
                <Info className='w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0' />
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    Informations importantes
                  </h4>
                  <div className='text-sm text-gray-700 space-y-2'>
                    <p>
                      <strong>Rétention des données :</strong> Les fichiers
                      d'export sont conservés 7 jours puis automatiquement
                      supprimés pour garantir votre sécurité.
                    </p>
                    <p>
                      <strong>Chiffrement :</strong> Vous pouvez choisir de
                      chiffrer vos exports avec un mot de passe pour une
                      sécurité renforcée.
                    </p>
                    <p>
                      <strong>Conformité :</strong> Tous nos processus
                      respectent les exigences du RGPD en matière de portabilité
                      des données.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* En-tête */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Portabilité des données
              </h1>
              <p className='text-gray-600 mt-1'>
                Exportez, importez et gérez vos données personnelles
              </p>
            </div>

            {/* Navigation */}
            <div className='flex items-center space-x-4'>
              {currentView !== 'overview' && (
                <button
                  onClick={() => setCurrentView('overview')}
                  className='text-gray-600 hover:text-gray-800 font-medium'
                >
                  ← Retour à l'aperçu
                </button>
              )}

              {onClose && (
                <button
                  onClick={onClose}
                  className='text-gray-400 hover:text-gray-600'
                >
                  Fermer
                </button>
              )}
            </div>
          </div>

          {/* Navigation par onglets */}
          {currentView === 'overview' && (
            <div className='flex space-x-8 mt-6 border-b border-gray-200'>
              {[
                { key: 'overview', label: 'Aperçu', icon: Database },
                { key: 'export', label: 'Export', icon: Download },
                { key: 'import', label: 'Import', icon: Upload },
                { key: 'history', label: 'Historique', icon: History },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setCurrentView(tab.key as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      currentView === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className='w-4 h-4' />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer avec informations légales */}
      <div className='bg-white border-t border-gray-200 mt-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='text-center text-sm text-gray-600'>
            <p>
              Cette fonctionnalité respecte les exigences du{' '}
              <strong>
                Règlement Général sur la Protection des Données (RGPD)
              </strong>
              .
            </p>
            <p className='mt-1'>
              Pour toute question concernant vos données, contactez-nous à{' '}
              <a
                href='mailto:privacy@nutrisensia.com'
                className='text-blue-600 hover:text-blue-700'
              >
                privacy@nutrisensia.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
