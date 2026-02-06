'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type {
  DocumentType,
  NutritionistDocument,
} from '@/types/nutritionist-registration';
import {
  DOCUMENT_CONFIG,
  formatFileSize,
} from '@/types/nutritionist-registration';

export interface DocumentUploaderProps {
  /** Type de document à uploader */
  type: DocumentType;
  /** Document actuel (si déjà uploadé) */
  currentDocument?: NutritionistDocument | null;
  /** ID utilisateur pour le chemin de stockage */
  userId?: string;
  /** Callback après upload réussi */
  onUploadSuccess: (document: NutritionistDocument) => void;
  /** Callback en cas d'erreur */
  onUploadError?: (error: string) => void;
  /** Callback lors de la suppression */
  onDelete?: () => void;
  /** État de chargement externe */
  loading?: boolean;
  /** Classes CSS personnalisées */
  className?: string;
  /** Désactiver le composant */
  disabled?: boolean;
}

/**
 * Composant d'upload de documents pour l'inscription nutritionniste
 * Supporte PDF et images avec validation et prévisualisation
 *
 * @see AUTH-009 dans USER_STORIES.md
 */
export function DocumentUploader({
  type,
  currentDocument,
  userId,
  onUploadSuccess,
  onUploadError,
  onDelete,
  loading = false,
  className,
  disabled = false,
}: DocumentUploaderProps) {
  const config = DOCUMENT_CONFIG[type];
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<NutritionistDocument | null>(
    currentDocument || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Valide le fichier sélectionné
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // Vérifier le type MIME
      if (!config.acceptedTypes.includes(file.type)) {
        return `Type de fichier non supporté. Types autorisés: ${config.acceptedTypes
          .map(t => t.split('/')[1].toUpperCase())
          .join(', ')}`;
      }

      // Vérifier la taille
      if (file.size > config.maxSize) {
        return `Fichier trop volumineux. Taille maximale: ${formatFileSize(config.maxSize)}`;
      }

      return null;
    },
    [config]
  );

  /**
   * Télécharge le document vers Supabase Storage
   */
  const uploadDocument = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        // Valider le fichier
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          onUploadError?.(validationError);
          return;
        }

        // Générer le chemin du fichier
        const fileExtension = file.name.split('.').pop();
        const fileName = `${type}.${fileExtension}`;
        const filePath = userId ? `${userId}/${fileName}` : fileName;

        setUploadProgress(30);

        // Télécharger vers Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('nutritionist-documents')
          .upload(filePath, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Erreur de téléchargement: ${uploadError.message}`);
        }

        setUploadProgress(70);

        // Obtenir l'URL signée (documents privés)
        const { data: urlData, error: urlError } = await supabase.storage
          .from('nutritionist-documents')
          .createSignedUrl(filePath, 3600); // 1 heure

        if (urlError) {
          throw new Error(
            `Erreur lors de la génération de l'URL: ${urlError.message}`
          );
        }

        setUploadProgress(100);

        // Créer l'objet document
        const uploadedDocument: NutritionistDocument = {
          type,
          fileName: file.name,
          fileUrl: urlData.signedUrl,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date(),
        };

        setDocument(uploadedDocument);
        onUploadSuccess(uploadedDocument);
      } catch (err: any) {
        const errorMessage = err.message || 'Erreur lors du téléchargement';
        setError(errorMessage);
        onUploadError?.(errorMessage);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [type, userId, validateFile, onUploadSuccess, onUploadError]
  );

  /**
   * Gère le drop de fichiers
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled || isUploading || loading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        uploadDocument(files[0]);
      }
    },
    [disabled, isUploading, loading, uploadDocument]
  );

  /**
   * Gère la sélection de fichier
   */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        uploadDocument(files[0]);
      }
    },
    [uploadDocument]
  );

  /**
   * Supprime le document
   */
  const handleDelete = useCallback(() => {
    setDocument(null);
    setError(null);
    onDelete?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onDelete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && !loading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading, loading]);

  const isPdf = document?.mimeType === 'application/pdf';
  const isImage = document?.mimeType.startsWith('image/');

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      <div className='flex items-center justify-between mb-2'>
        <label className='block text-sm font-medium text-gray-700'>
          {config.label}
          {config.required && <span className='text-red-500 ml-1'>*</span>}
        </label>
        {document && (
          <span className='text-xs text-green-600 flex items-center gap-1'>
            <Check className='w-3 h-3' />
            Téléchargé
          </span>
        )}
      </div>

      {/* Description */}
      <p className='text-xs text-gray-500 mb-3'>{config.description}</p>

      {/* Zone de drop */}
      {!document ? (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200',
            'hover:border-[#1B998B] hover:bg-[#1B998B]/5',
            isDragOver && 'border-[#1B998B] bg-[#1B998B]/10',
            isUploading && 'pointer-events-none opacity-75',
            disabled && 'pointer-events-none opacity-50 bg-gray-50',
            error ? 'border-red-300 bg-red-50' : 'border-gray-300',
            'cursor-pointer'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type='file'
            accept={config.acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className='hidden'
            disabled={isUploading || loading || disabled}
          />

          <div className='space-y-3'>
            <div
              className={cn(
                'w-12 h-12 mx-auto rounded-full flex items-center justify-center',
                error ? 'bg-red-100' : 'bg-gray-100'
              )}
            >
              {error ? (
                <AlertCircle className='w-6 h-6 text-red-500' />
              ) : (
                <Upload className='w-6 h-6 text-gray-400' />
              )}
            </div>

            <div>
              <p className='text-sm text-gray-600'>
                {isUploading
                  ? 'Téléchargement en cours...'
                  : 'Glissez-déposez ou cliquez pour sélectionner'}
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                {config.acceptedTypes
                  .map(t => t.split('/')[1].toUpperCase())
                  .join(', ')}{' '}
                • Max {formatFileSize(config.maxSize)}
              </p>
            </div>
          </div>

          {/* Barre de progression */}
          {isUploading && (
            <div className='mt-4'>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-[#1B998B] h-2 rounded-full transition-all duration-300'
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className='text-xs text-gray-500 mt-1'>{uploadProgress}%</p>
            </div>
          )}
        </div>
      ) : (
        /* Document uploadé */
        <div className='border border-green-200 bg-green-50 rounded-xl p-4'>
          <div className='flex items-start gap-4'>
            {/* Icône ou aperçu */}
            <div className='flex-shrink-0'>
              {isPdf ? (
                <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center'>
                  <FileText className='w-6 h-6 text-red-600' />
                </div>
              ) : isImage ? (
                <img
                  src={document.fileUrl}
                  alt='Aperçu'
                  className='w-12 h-12 rounded-lg object-cover'
                />
              ) : (
                <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center'>
                  <Image className='w-6 h-6 text-gray-600' />
                </div>
              )}
            </div>

            {/* Informations */}
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-800 truncate'>
                {document.fileName}
              </p>
              <p className='text-xs text-gray-500'>
                {formatFileSize(document.fileSize)}
              </p>
            </div>

            {/* Bouton supprimer */}
            <button
              type='button'
              onClick={handleDelete}
              disabled={loading || disabled}
              className='p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
          <AlertCircle className='w-4 h-4' />
          {error}
        </p>
      )}
    </div>
  );
}

export default DocumentUploader;
