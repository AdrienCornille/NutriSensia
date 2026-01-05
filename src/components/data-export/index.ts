/**
 * Point d'entrée pour tous les composants d'export et d'import de données
 *
 * Ce fichier exporte tous les composants, hooks et utilitaires
 * liés à la portabilité des données et à la conformité RGPD.
 */

// Composants principaux
export { DataExportWizard } from './DataExportWizard';
export { DataImportWizard } from './DataImportWizard';
export { ExportHistory } from './ExportHistory';
export { DataPortabilityDashboard } from './DataPortabilityDashboard';

// Hooks
export {
  useDataExport,
  useDataImport,
  useExportHistory,
  useAvailableExportSections,
  useImportValidation,
  useDownloadManager,
} from '@/hooks/useDataExport';

// Types et utilitaires
export type {
  ExportOptions,
  ImportOptions,
  ExportResult,
  ExportHistoryEntry,
  ExportSection,
} from '@/lib/data-export';

export {
  DataExportService,
  DataImportService,
  dataExportUtils,
} from '@/lib/data-export';
