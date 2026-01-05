/**
 * Hooks personnalisés pour l'export et l'import de données
 *
 * Ces hooks fournissent une interface React pour :
 * - Exporter les données utilisateur
 * - Importer des données
 * - Gérer l'historique des exports
 * - Suivre le statut des opérations
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DataExportService,
  DataImportService,
  dataExportUtils,
  type ExportOptions,
  type ImportOptions,
  type ExportResult,
  type ExportHistoryEntry,
  type ExportSection,
  type UserRole,
} from '@/lib/data-export';
import { useAuth } from '@/contexts/AuthContext';

/**
 * État d'une opération d'export/import
 */
interface OperationState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  result: ExportResult | null;
}

/**
 * Hook principal pour l'export de données
 */
export const useDataExport = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [operationState, setOperationState] = useState<OperationState>({
    isLoading: false,
    progress: 0,
    error: null,
    result: null,
  });

  // Mutation pour exporter les données
  const exportMutation = useMutation({
    mutationFn: async (options: ExportOptions) => {
      if (!user?.id || !user?.user_metadata?.role) {
        throw new Error('Utilisateur non authentifié');
      }

      const exportService = dataExportUtils.createExportService(
        user.id,
        user.user_metadata.role as UserRole
      );

      return await exportService.exportUserData(options);
    },
    onMutate: () => {
      setOperationState({
        isLoading: true,
        progress: 0,
        error: null,
        result: null,
      });
    },
    onSuccess: result => {
      setOperationState({
        isLoading: false,
        progress: 100,
        error: null,
        result,
      });

      // Invalider le cache de l'historique pour le rafraîchir
      queryClient.invalidateQueries({ queryKey: ['export-history', user?.id] });
    },
    onError: (error: Error) => {
      setOperationState({
        isLoading: false,
        progress: 0,
        error: error.message,
        result: null,
      });
    },
  });

  // Fonction pour démarrer un export
  const startExport = useCallback(
    async (options: ExportOptions) => {
      // Valider les options avant de démarrer
      const errors = dataExportUtils.validateExportOptions(options);
      if (errors.length > 0) {
        setOperationState(prev => ({
          ...prev,
          error: errors.join(', '),
        }));
        return;
      }

      return exportMutation.mutate(options);
    },
    [exportMutation]
  );

  // Fonction pour télécharger un export
  const downloadExport = useCallback((result: ExportResult) => {
    if (!result.downloadUrl) {
      throw new Error('URL de téléchargement non disponible');
    }

    // Créer un lien de téléchargement temporaire
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = `nutrisensia_export_${result.exportId}.${result.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Réinitialiser l'état
  const resetState = useCallback(() => {
    setOperationState({
      isLoading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  return {
    // État
    isExporting: operationState.isLoading,
    progress: operationState.progress,
    error: operationState.error,
    result: operationState.result,

    // Actions
    startExport,
    downloadExport,
    resetState,

    // Utilitaires
    isSuccess: !!operationState.result && !operationState.error,
  };
};

/**
 * Hook pour l'import de données
 */
export const useDataImport = () => {
  const { user } = useAuth();
  const [operationState, setOperationState] = useState<OperationState>({
    isLoading: false,
    progress: 0,
    error: null,
    result: null,
  });

  // Mutation pour importer les données
  const importMutation = useMutation({
    mutationFn: async ({
      fileContent,
      options,
    }: {
      fileContent: string;
      options: ImportOptions;
    }) => {
      if (!user?.id || !user?.user_metadata?.role) {
        throw new Error('Utilisateur non authentifié');
      }

      const importService = dataExportUtils.createImportService(
        user.id,
        user.user_metadata.role as UserRole
      );

      await importService.importUserData(fileContent, options);
      return { success: true };
    },
    onMutate: () => {
      setOperationState({
        isLoading: true,
        progress: 0,
        error: null,
        result: null,
      });
    },
    onSuccess: () => {
      setOperationState({
        isLoading: false,
        progress: 100,
        error: null,
        result: { success: true } as any,
      });
    },
    onError: (error: Error) => {
      setOperationState({
        isLoading: false,
        progress: 0,
        error: error.message,
        result: null,
      });
    },
  });

  // Fonction pour démarrer un import
  const startImport = useCallback(
    async (file: File, options: ImportOptions) => {
      try {
        const fileContent = await file.text();
        return importMutation.mutate({ fileContent, options });
      } catch (error) {
        setOperationState(prev => ({
          ...prev,
          error: `Erreur lors de la lecture du fichier: ${error.message}`,
        }));
      }
    },
    [importMutation]
  );

  // Réinitialiser l'état
  const resetState = useCallback(() => {
    setOperationState({
      isLoading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  return {
    // État
    isImporting: operationState.isLoading,
    progress: operationState.progress,
    error: operationState.error,
    result: operationState.result,

    // Actions
    startImport,
    resetState,

    // Utilitaires
    isSuccess: !!operationState.result && !operationState.error,
  };
};

/**
 * Hook pour récupérer l'historique des exports
 */
export const useExportHistory = () => {
  const { user } = useAuth();

  return useQuery<ExportHistoryEntry[]>({
    queryKey: ['export-history', user?.id],
    queryFn: async () => {
      if (!user?.id || !user?.user_metadata?.role) {
        throw new Error('Utilisateur non authentifié');
      }

      const exportService = dataExportUtils.createExportService(
        user.id,
        user.user_metadata.role as UserRole
      );

      return await exportService.getExportHistory();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook pour les sections d'export disponibles
 */
export const useAvailableExportSections = () => {
  const { user } = useAuth();

  const availableSections = user?.user_metadata?.role
    ? dataExportUtils.getAvailableSections(user.user_metadata.role as UserRole)
    : [];

  // Informations détaillées sur chaque section
  const sectionDetails: Record<
    ExportSection,
    { label: string; description: string; icon: string }
  > = {
    profile: {
      label: 'Profil de base',
      description: 'Nom, email, informations personnelles',
      icon: '👤',
    },
    professional: {
      label: 'Informations professionnelles',
      description: 'Certifications, spécialisations, tarifs',
      icon: '💼',
    },
    medical: {
      label: 'Informations médicales',
      description: 'Santé, allergies, conditions médicales',
      icon: '🏥',
    },
    preferences: {
      label: 'Préférences',
      description: 'Langue, fuseau horaire, notifications',
      icon: '⚙️',
    },
    activity: {
      label: "Historique d'activité",
      description: 'Connexions, actions, utilisation',
      icon: '📊',
    },
    files: {
      label: 'Fichiers',
      description: 'Photos de profil, documents uploadés',
      icon: '📁',
    },
    privacy: {
      label: 'Paramètres de confidentialité',
      description: 'Visibilité, permissions, partage',
      icon: '🔒',
    },
    subscription: {
      label: 'Abonnement',
      description: 'Plan, facturation, crédits',
      icon: '💳',
    },
    audit: {
      label: "Logs d'audit",
      description: 'Historique des modifications, sécurité',
      icon: '🔍',
    },
  };

  return {
    availableSections,
    sectionDetails,
    getSectionInfo: (section: ExportSection) => sectionDetails[section],
  };
};

/**
 * Hook pour valider les fichiers d'import
 */
export const useImportValidation = () => {
  const validateFile = useCallback(
    (file: File): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push('Le fichier ne peut pas dépasser 10MB');
      }

      // Vérifier le type
      const allowedTypes = ['application/json', 'text/csv', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        errors.push('Type de fichier non supporté. Utilisez JSON ou CSV.');
      }

      // Vérifier l'extension
      const allowedExtensions = ['.json', '.csv', '.txt'];
      const hasValidExtension = allowedExtensions.some(ext =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        errors.push(
          'Extension de fichier non supportée. Utilisez .json, .csv ou .txt'
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    []
  );

  const validateImportData = useCallback(
    async (
      fileContent: string,
      format: 'json' | 'csv'
    ): Promise<{ isValid: boolean; errors: string[] }> => {
      const errors: string[] = [];

      try {
        if (format === 'json') {
          const data = JSON.parse(fileContent);

          // Vérifications basiques de structure
          if (!data || typeof data !== 'object') {
            errors.push('Structure JSON invalide');
          }

          // Vérifier la présence de métadonnées d'export
          if (!data._metadata) {
            errors.push("Métadonnées d'export manquantes");
          } else if (!data._metadata.export_version) {
            errors.push("Version d'export non spécifiée");
          }
        } else if (format === 'csv') {
          // Validation basique CSV
          if (!fileContent.includes('Section,Field,Value,Type')) {
            errors.push('En-tête CSV manquant ou incorrect');
          }
        }
      } catch (error) {
        errors.push(`Erreur de parsing: ${error.message}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    []
  );

  return {
    validateFile,
    validateImportData,
  };
};

/**
 * Hook pour la gestion des téléchargements
 */
export const useDownloadManager = () => {
  const [downloads, setDownloads] = useState<
    Map<string, { progress: number; status: string }>
  >(new Map());

  const trackDownload = useCallback(
    (exportId: string, url: string, filename: string) => {
      setDownloads(
        prev => new Map(prev.set(exportId, { progress: 0, status: 'starting' }))
      );

      // Simuler le suivi de progression (en réalité, difficile avec les téléchargements directs)
      const progressInterval = setInterval(() => {
        setDownloads(prev => {
          const current = prev.get(exportId);
          if (current && current.progress < 90) {
            return new Map(
              prev.set(exportId, {
                progress: current.progress + 10,
                status: 'downloading',
              })
            );
          }
          return prev;
        });
      }, 200);

      // Démarrer le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Marquer comme terminé après un délai
      setTimeout(() => {
        clearInterval(progressInterval);
        setDownloads(
          prev =>
            new Map(prev.set(exportId, { progress: 100, status: 'completed' }))
        );

        // Nettoyer après 5 secondes
        setTimeout(() => {
          setDownloads(prev => {
            const newMap = new Map(prev);
            newMap.delete(exportId);
            return newMap;
          });
        }, 5000);
      }, 2000);
    },
    []
  );

  const getDownloadStatus = useCallback(
    (exportId: string) => {
      return downloads.get(exportId) || null;
    },
    [downloads]
  );

  return {
    trackDownload,
    getDownloadStatus,
    activeDownloads: Array.from(downloads.entries()),
  };
};
