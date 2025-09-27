'use client';

import React, { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { supabase } from '@/lib/supabase';

/**
 * Props du composant ImageUpload
 */
export interface ImageUploadProps {
  /**
   * URL de l'image actuelle (optionnel)
   */
  currentImageUrl?: string | null;
  /**
   * Nom du bucket Supabase Storage
   */
  bucketName?: string;
  /**
   * Chemin dans le bucket (optionnel)
   */
  path?: string;
  /**
   * Types MIME autorisés
   */
  acceptedTypes?: string[];
  /**
   * Taille maximale du fichier en bytes
   */
  maxFileSize?: number;
  /**
   * Largeur maximale pour le redimensionnement
   */
  maxWidth?: number;
  /**
   * Hauteur maximale pour le redimensionnement
   */
  maxHeight?: number;
  /**
   * Qualité de l'image (0-100)
   */
  quality?: number;
  /**
   * Callback appelé après un téléchargement réussi
   */
  onUploadSuccess?: (url: string) => void;
  /**
   * Callback appelé en cas d'erreur
   */
  onUploadError?: (error: string) => void;
  /**
   * État de chargement
   */
  loading?: boolean;
  /**
   * Classes CSS personnalisées
   */
  className?: string;
  /**
   * Texte personnalisé pour la zone de drop
   */
  dropText?: string;
  /**
   * Afficher le bouton de suppression
   */
  showDeleteButton?: boolean;
  /**
   * Callback appelé lors de la suppression
   */
  onDelete?: () => void;
}

/**
 * Composant de téléchargement d'image avec drag-and-drop et optimisation
 *
 * @example
 * ```tsx
 * <ImageUpload
 *   currentImageUrl={user.avatar_url}
 *   bucketName="avatars"
 *   path={`users/${userId}`}
 *   onUploadSuccess={(url) => console.log('Image téléchargée:', url)}
 *   onUploadError={(error) => console.error('Erreur:', error)}
 * />
 * ```
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  bucketName = 'avatars',
  path = '',
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  maxWidth = 800,
  maxHeight = 800,
  quality = 80,
  onUploadSuccess,
  onUploadError,
  loading = false,
  className,
  dropText = 'Glissez-déposez une image ici ou cliquez pour sélectionner',
  showDeleteButton = true,
  onDelete,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Redimensionne une image en utilisant Canvas
   */
  const resizeImage = useCallback(
    (file: File): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calculer les nouvelles dimensions
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          // Configurer le canvas
          canvas.width = width;
          canvas.height = height;

          // Dessiner l'image redimensionnée
          ctx?.drawImage(img, 0, 0, width, height);

          // Convertir en blob
          canvas.toBlob(
            blob => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Erreur lors de la conversion de l'image"));
              }
            },
            file.type,
            quality / 100
          );
        };

        img.onerror = () =>
          reject(new Error("Erreur lors du chargement de l'image"));
        img.src = URL.createObjectURL(file);
      });
    },
    [maxWidth, maxHeight, quality]
  );

  /**
   * Valide le fichier sélectionné
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // Vérifier le type MIME
      if (!acceptedTypes.includes(file.type)) {
        return `Type de fichier non supporté. Types autorisés: ${acceptedTypes.join(', ')}`;
      }

      // Vérifier la taille
      if (file.size > maxFileSize) {
        return `Fichier trop volumineux. Taille maximale: ${Math.round(maxFileSize / 1024 / 1024)}MB`;
      }

      return null;
    },
    [acceptedTypes, maxFileSize]
  );

  /**
   * Télécharge l'image vers Supabase Storage
   */
  const uploadImage = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);

        // Valider le fichier
        const validationError = validateFile(file);
        if (validationError) {
          onUploadError?.(validationError);
          return;
        }

        // Redimensionner l'image
        const resizedBlob = await resizeImage(file);

        // Générer un nom de fichier unique
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        const filePath = path ? `${path}/${fileName}` : fileName;

        // Télécharger vers Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, resizedBlob, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          throw new Error(`Erreur de téléchargement: ${error.message}`);
        }

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        const imageUrl = urlData.publicUrl;

        // Mettre à jour la prévisualisation
        setPreviewUrl(imageUrl);
        setUploadProgress(100);

        // Appeler le callback de succès
        onUploadSuccess?.(imageUrl);
      } catch (error: any) {
        console.error('Erreur lors du téléchargement:', error);
        onUploadError?.(error.message || 'Erreur lors du téléchargement');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [
      bucketName,
      path,
      validateFile,
      resizeImage,
      onUploadSuccess,
      onUploadError,
    ]
  );

  /**
   * Gère le drop de fichiers
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        uploadImage(files[0]);
      }
    },
    [uploadImage]
  );

  /**
   * Gère la sélection de fichier via l'input
   */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        uploadImage(files[0]);
      }
    },
    [uploadImage]
  );

  /**
   * Supprime l'image actuelle
   */
  const handleDelete = useCallback(() => {
    setPreviewUrl(null);
    onDelete?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onDelete]);

  /**
   * Gère les événements de drag
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  /**
   * Ouvre le sélecteur de fichier
   */
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn('w-full', className)}>
      {/* Zone de drop */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer',
          'hover:border-primary hover:bg-primary/5',
          isDragOver && 'border-primary bg-primary/10',
          isUploading && 'pointer-events-none opacity-75',
          previewUrl ? 'border-green-500 bg-green-50' : 'border-gray-300'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type='file'
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className='hidden'
          disabled={isUploading || loading}
        />

        {/* Prévisualisation de l'image */}
        {previewUrl && (
          <div className='mb-4'>
            <img
              src={previewUrl}
              alt='Aperçu'
              className='mx-auto max-w-full max-h-48 rounded-lg shadow-sm'
            />
          </div>
        )}

        {/* Icône et texte */}
        <div className='space-y-2'>
          {!previewUrl && <div className='text-4xl text-gray-400 mb-2'>📷</div>}
          <p className='text-sm text-gray-600'>
            {isUploading ? 'Téléchargement en cours...' : dropText}
          </p>
          <p className='text-xs text-gray-500'>
            {acceptedTypes
              .map(type => type.split('/')[1])
              .join(', ')
              .toUpperCase()}{' '}
            • Max {Math.round(maxFileSize / 1024 / 1024)}MB
          </p>
        </div>

        {/* Barre de progression */}
        {isUploading && (
          <div className='mt-4'>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-primary h-2 rounded-full transition-all duration-300'
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className='text-xs text-gray-500 mt-1'>
              {uploadProgress}% terminé
            </p>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className='flex gap-2 mt-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleClick}
          disabled={isUploading || loading}
          className='flex-1'
        >
          {previewUrl ? "Changer l'image" : 'Sélectionner une image'}
        </Button>

        {showDeleteButton && previewUrl && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleDelete}
            disabled={isUploading || loading}
            className='text-red-600 hover:text-red-700 hover:bg-red-50'
          >
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
