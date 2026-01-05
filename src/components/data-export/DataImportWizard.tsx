/**
 * Assistant d'import de données
 *
 * Interface pour importer des données depuis un export précédent :
 * - Upload et validation de fichier
 * - Prévisualisation des données
 * - Configuration des options d'import
 * - Gestion des conflits
 * - Suivi du processus d'import
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  RefreshCw,
  Shield,
  Database,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDataImport, useImportValidation } from '@/hooks/useDataExport';
import type { ImportOptions } from '@/lib/data-export';

interface DataImportWizardProps {
  /** Callback quand l'import est terminé */
  onComplete?: () => void;
  /** Callback pour fermer l'assistant */
  onClose?: () => void;
  /** Affichage compact */
  compact?: boolean;
}

/**
 * Étapes de l'assistant d'import
 */
type ImportStep =
  | 'upload'
  | 'preview'
  | 'options'
  | 'confirmation'
  | 'progress'
  | 'result';

/**
 * Composant de zone de drop pour fichier
 */
const FileDropZone = ({
  onFileSelect,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  onFileSelect: (file: File) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        isDragOver
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      }`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Upload className='w-12 h-12 text-gray-400 mx-auto mb-4' />
      <h3 className='text-lg font-medium text-gray-900 mb-2'>
        Glissez votre fichier d'export ici
      </h3>
      <p className='text-gray-600 mb-4'>
        ou cliquez pour sélectionner un fichier
      </p>
      <p className='text-sm text-gray-500'>
        Formats supportés: JSON, CSV (max 10MB)
      </p>

      <input
        ref={fileInputRef}
        type='file'
        accept='.json,.csv,.txt'
        onChange={handleFileInput}
        className='hidden'
      />
    </div>
  );
};

/**
 * Composant de prévisualisation des données
 */
const DataPreview = ({
  data,
  format,
}: {
  data: any;
  format: 'json' | 'csv';
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['profile'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (Array.isArray(value)) return `[${value.length} élément(s)]`;
    if (typeof value === 'object') return '{objet}';
    return String(value);
  };

  const sections = Object.keys(data).filter(key => key !== '_metadata');
  const metadata = data._metadata;

  return (
    <div className='space-y-6'>
      <h3 className='text-lg font-semibold text-gray-900'>
        Prévisualisation des données
      </h3>

      {/* Métadonnées */}
      {metadata && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h4 className='font-medium text-blue-900 mb-2'>
            Informations d'export
          </h4>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-blue-700'>Version:</span>
              <span className='ml-2'>{metadata.export_version}</span>
            </div>
            <div>
              <span className='text-blue-700'>Exporté le:</span>
              <span className='ml-2'>
                {new Date(metadata.exported_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div>
              <span className='text-blue-700'>Rôle utilisateur:</span>
              <span className='ml-2'>{metadata.user_role}</span>
            </div>
            <div>
              <span className='text-blue-700'>Conforme RGPD:</span>
              <span className='ml-2'>
                {metadata.gdpr_compliant ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sections de données */}
      <div className='space-y-3'>
        {sections.map(section => {
          const isExpanded = expandedSections.has(section);
          const sectionData = data[section];

          if (!sectionData) return null;

          return (
            <div key={section} className='border border-gray-200 rounded-lg'>
              <button
                onClick={() => toggleSection(section)}
                className='w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50'
              >
                <div className='flex items-center space-x-3'>
                  <Database className='w-4 h-4 text-gray-600' />
                  <span className='font-medium text-gray-900 capitalize'>
                    {section}
                  </span>
                  <span className='text-sm text-gray-500'>
                    (
                    {typeof sectionData === 'object'
                      ? Object.keys(sectionData).length
                      : 1}{' '}
                    champ{Object.keys(sectionData).length > 1 ? 's' : ''})
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className='w-4 h-4 text-gray-400' />
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className='border-t border-gray-200'
                  >
                    <div className='p-4 bg-gray-50'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
                        {Object.entries(sectionData).map(([key, value]) => (
                          <div key={key} className='flex justify-between'>
                            <span className='text-gray-600 font-medium'>
                              {key}:
                            </span>
                            <span className='text-gray-900 truncate ml-2'>
                              {renderValue(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {sections.length === 0 && (
        <div className='text-center py-8'>
          <XCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h4 className='text-lg font-medium text-gray-900 mb-2'>
            Aucune donnée trouvée
          </h4>
          <p className='text-gray-600'>
            Le fichier ne contient pas de données valides à importer.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Composant des options d'import
 */
const ImportOptionsConfig = ({
  options,
  onOptionsChange,
}: {
  options: ImportOptions;
  onOptionsChange: (options: ImportOptions) => void;
}) => {
  const updateOption = <K extends keyof ImportOptions>(
    key: K,
    value: ImportOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className='space-y-6'>
      <h3 className='text-lg font-semibold text-gray-900'>Options d'import</h3>

      {/* Stratégie de conflit */}
      <div className='bg-white border border-gray-200 rounded-lg p-4'>
        <h4 className='font-medium text-gray-900 mb-3'>Gestion des conflits</h4>
        <p className='text-sm text-gray-600 mb-4'>
          Que faire si des données existent déjà ?
        </p>

        <div className='space-y-3'>
          {[
            {
              value: 'overwrite' as const,
              label: 'Remplacer',
              description: 'Remplace toutes les données existantes',
              icon: RefreshCw,
              color: 'text-red-600',
            },
            {
              value: 'merge' as const,
              label: 'Fusionner',
              description: 'Combine les données existantes avec les nouvelles',
              icon: Database,
              color: 'text-blue-600',
            },
            {
              value: 'skip' as const,
              label: 'Ignorer',
              description:
                'Garde les données existantes, importe seulement les nouvelles',
              icon: Shield,
              color: 'text-green-600',
            },
          ].map(strategy => {
            const Icon = strategy.icon;
            const isSelected = options.conflictStrategy === strategy.value;

            return (
              <motion.div
                key={strategy.value}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => updateOption('conflictStrategy', strategy.value)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className='flex items-center space-x-3'>
                  <Icon className={`w-5 h-5 ${strategy.color}`} />
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <span className='font-medium text-gray-900'>
                        {strategy.label}
                      </span>
                      {isSelected && (
                        <CheckCircle className='w-4 h-4 text-blue-600' />
                      )}
                    </div>
                    <p className='text-sm text-gray-600 mt-1'>
                      {strategy.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Options de sécurité */}
      <div className='bg-white border border-gray-200 rounded-lg p-4'>
        <h4 className='font-medium text-gray-900 mb-3'>Options de sécurité</h4>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <span className='font-medium text-gray-900'>
                Valider les données
              </span>
              <p className='text-sm text-gray-600'>
                Vérifier la cohérence avant import
              </p>
            </div>
            <button
              onClick={() => updateOption('validate', !options.validate)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                options.validate ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  options.validate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <span className='font-medium text-gray-900'>
                Créer une sauvegarde
              </span>
              <p className='text-sm text-gray-600'>
                Sauvegarder vos données actuelles avant import
              </p>
            </div>
            <button
              onClick={() =>
                updateOption('createBackup', !options.createBackup)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                options.createBackup ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  options.createBackup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
        <div className='flex items-start space-x-2'>
          <AlertTriangle className='w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0' />
          <div>
            <h4 className='text-sm font-medium text-yellow-800'>Attention</h4>
            <p className='text-sm text-yellow-700 mt-1'>
              L'import de données peut modifier vos informations existantes. Il
              est recommandé de créer une sauvegarde avant de procéder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant principal de l'assistant d'import
 */
export const DataImportWizard = ({
  onComplete,
  onClose,
  compact = false,
}: DataImportWizardProps) => {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    format: 'json',
    conflictStrategy: 'merge',
    validate: true,
    createBackup: true,
  });

  const { validateFile, validateImportData } = useImportValidation();
  const { startImport, isImporting, progress, error, isSuccess, resetState } =
    useDataImport();

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileSelect = async (file: File) => {
    const validation = validateFile(file);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setSelectedFile(file);
    setValidationErrors([]);

    try {
      const content = await file.text();
      setFileContent(content);

      // Déterminer le format
      const format = file.name.endsWith('.csv') ? 'csv' : 'json';
      setImportOptions(prev => ({ ...prev, format }));

      // Valider et parser les données
      const dataValidation = await validateImportData(content, format);

      if (!dataValidation.isValid) {
        setValidationErrors(dataValidation.errors);
        return;
      }

      if (format === 'json') {
        const parsed = JSON.parse(content);
        setParsedData(parsed);
        setCurrentStep('preview');
      } else {
        // Pour CSV, on pourrait implémenter un parser plus sophistiqué
        setCurrentStep('options');
      }
    } catch (error) {
      setValidationErrors([
        `Erreur lors de la lecture du fichier: ${error.message}`,
      ]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'preview':
        setCurrentStep('options');
        break;
      case 'options':
        setCurrentStep('confirmation');
        break;
      case 'confirmation':
        handleStartImport();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'preview':
        setCurrentStep('upload');
        break;
      case 'options':
        setCurrentStep('preview');
        break;
      case 'confirmation':
        setCurrentStep('options');
        break;
      case 'result':
        resetState();
        setCurrentStep('upload');
        break;
    }
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;

    setCurrentStep('progress');
    await startImport(selectedFile, importOptions);
    setCurrentStep('result');
  };

  const steps = ['upload', 'preview', 'options', 'confirmation'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div
      className={`bg-white rounded-lg shadow-xl ${compact ? 'max-w-2xl' : 'max-w-4xl'} mx-auto`}
    >
      {/* En-tête */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Import de données
            </h2>
            <p className='text-gray-600 text-sm mt-1'>
              Restaurez vos données depuis un export précédent
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
            >
              ×
            </button>
          )}
        </div>

        {/* Indicateur de progression */}
        {currentStepIndex >= 0 && (
          <div className='flex items-center mt-4 space-x-2'>
            {steps.map((step, index) => (
              <div key={step} className='flex items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className='w-4 h-4' />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-1 mx-2 ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className='px-6 py-6 min-h-96'>
        <AnimatePresence mode='wait'>
          {currentStep === 'upload' && (
            <motion.div
              key='upload'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='space-y-6'
            >
              <h3 className='text-lg font-semibold text-gray-900'>
                Sélectionnez votre fichier d'export
              </h3>

              <FileDropZone
                onFileSelect={handleFileSelect}
                isDragOver={isDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />

              {validationErrors.length > 0 && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <XCircle className='w-5 h-5 text-red-600' />
                    <h4 className='font-medium text-red-800'>
                      Erreurs de validation
                    </h4>
                  </div>
                  <ul className='list-disc list-inside text-sm text-red-700 space-y-1'>
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {currentStep === 'preview' && parsedData && (
            <motion.div
              key='preview'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DataPreview data={parsedData} format={importOptions.format} />
            </motion.div>
          )}

          {currentStep === 'options' && (
            <motion.div
              key='options'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ImportOptionsConfig
                options={importOptions}
                onOptionsChange={setImportOptions}
              />
            </motion.div>
          )}

          {currentStep === 'confirmation' && (
            <motion.div
              key='confirmation'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='space-y-6'
            >
              <h3 className='text-lg font-semibold text-gray-900'>
                Confirmer l'import
              </h3>

              <div className='bg-gray-50 rounded-lg p-6 space-y-4'>
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    Fichier sélectionné
                  </h4>
                  <p className='text-gray-600'>{selectedFile?.name}</p>
                </div>

                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    Stratégie de conflit
                  </h4>
                  <p className='text-gray-600 capitalize'>
                    {importOptions.conflictStrategy}
                  </p>
                </div>

                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>Options</h4>
                  <div className='space-y-1 text-sm text-gray-600'>
                    <div>
                      Validation:{' '}
                      {importOptions.validate ? 'Activée' : 'Désactivée'}
                    </div>
                    <div>
                      Sauvegarde: {importOptions.createBackup ? 'Oui' : 'Non'}
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <div className='flex items-start space-x-2'>
                  <AlertTriangle className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <h4 className='text-sm font-medium text-red-800'>
                      Attention
                    </h4>
                    <p className='text-sm text-red-700 mt-1'>
                      Cette opération va modifier vos données actuelles.
                      Assurez-vous que c'est bien ce que vous souhaitez faire.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'progress' && (
            <motion.div
              key='progress'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='space-y-6 text-center'
            >
              <h3 className='text-lg font-semibold text-gray-900'>
                Import en cours...
              </h3>

              <div className='flex items-center justify-center'>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className='w-12 h-12 text-blue-600' />
                </motion.div>
              </div>

              <p className='text-gray-600'>
                Importation de vos données en cours...
              </p>
            </motion.div>
          )}

          {currentStep === 'result' && (
            <motion.div
              key='result'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='space-y-6 text-center'
            >
              {isSuccess ? (
                <>
                  <CheckCircle className='w-16 h-16 text-green-600 mx-auto' />
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Import réussi !
                  </h3>
                  <p className='text-gray-600'>
                    Vos données ont été importées avec succès.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className='w-16 h-16 text-red-600 mx-auto' />
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Erreur d'import
                  </h3>
                  <p className='text-gray-600'>
                    {error || "Une erreur est survenue lors de l'import."}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      {currentStep !== 'progress' && currentStep !== 'result' && (
        <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
          <button
            onClick={handleBack}
            disabled={currentStep === 'upload'}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 'upload'
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className='w-4 h-4' />
            <span>Précédent</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedFile || validationErrors.length > 0}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedFile && validationErrors.length === 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>
              {currentStep === 'confirmation' ? "Démarrer l'import" : 'Suivant'}
            </span>
            {currentStep !== 'confirmation' && (
              <ChevronRight className='w-4 h-4' />
            )}
          </button>
        </div>
      )}

      {currentStep === 'result' && (
        <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-center'>
          <button
            onClick={
              onComplete ||
              (() => {
                resetState();
                setCurrentStep('upload');
                setSelectedFile(null);
                setParsedData(null);
                setValidationErrors([]);
              })
            }
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium'
          >
            {isSuccess ? 'Terminer' : 'Réessayer'}
          </button>
        </div>
      )}
    </div>
  );
};
