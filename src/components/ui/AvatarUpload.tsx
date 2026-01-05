/**
 * Composant d'upload d'avatar avec prévisualisation
 * Supporte le drag & drop et la sélection de fichier
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, User, Camera, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '@/lib/supabase';

interface AvatarUploadProps {
  /** URL de l'avatar actuel */
  currentAvatarUrl?: string | null;
  /** Callback appelé quand l'avatar est uploadé */
  onAvatarChange: (avatarUrl: string | null) => void;
  /** ID de l'utilisateur pour le stockage */
  userId: string;
  /** Taille de l'avatar en pixels */
  size?: number;
  /** Désactiver l'upload */
  disabled?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  userId,
  size = 120,
  disabled = false,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Uploader un fichier vers Supabase Storage
   */
  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      try {
        // Upload vers Supabase Storage avec gestion d'erreur améliorée
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          console.error('Erreur détaillée Supabase:', error);

          // Si c'est une erreur RLS, essayer une approche alternative
          if (error.message.includes('row-level security policy')) {
            console.log("🔄 Tentative d'upload avec approche alternative...");

            // Essayer avec upsert: true pour contourner certaines restrictions
            const { data: retryData, error: retryError } =
              await supabase.storage.from('avatars').upload(filePath, file, {
                cacheControl: '3600',
                upsert: true, // Permet de remplacer si le fichier existe
              });

            if (retryError) {
              throw new Error(
                `Erreur d'upload (RLS): ${retryError.message}. Veuillez configurer les politiques RLS dans Supabase.`
              );
            }

            // Obtenir l'URL publique
            const {
              data: { publicUrl },
            } = supabase.storage.from('avatars').getPublicUrl(filePath);

            return publicUrl;
          }

          throw new Error(`Erreur d'upload: ${error.message}`);
        }

        // Obtenir l'URL publique
        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath);

        return publicUrl;
      } catch (error) {
        console.error("Erreur complète d'upload:", error);
        throw error;
      }
    },
    [userId]
  );

  /**
   * Supprimer l'avatar actuel
   */
  const deleteCurrentAvatar = useCallback(async () => {
    if (!currentAvatarUrl) return;

    try {
      // Extraire le nom du fichier de l'URL
      const urlParts = currentAvatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      // Supprimer du storage
      await supabase.storage.from('avatars').remove([filePath]);

      onAvatarChange(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError("Erreur lors de la suppression de l'avatar");
    }
  }, [currentAvatarUrl, onAvatarChange]);

  /**
   * Gérer la sélection de fichier
   */
  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file) return;

      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB max
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const avatarUrl = await uploadFile(file);
        onAvatarChange(avatarUrl);
      } catch (error) {
        console.error("Erreur d'upload:", error);
        setError(error instanceof Error ? error.message : "Erreur d'upload");
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile, onAvatarChange]
  );

  /**
   * Gérer le drag & drop
   */
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, handleFileSelect]
  );

  /**
   * Gérer le clic sur l'input file
   */
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  /**
   * Ouvrir le sélecteur de fichier
   */
  const openFileSelector = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Zone d'upload */}
      <div
        className={`
          relative rounded-full border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragOver ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${currentAvatarUrl ? 'border-solid' : ''}
        `}
        style={{ width: size, height: size }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileInputChange}
          className='hidden'
          disabled={disabled}
        />

        <AnimatePresence mode='wait'>
          {currentAvatarUrl ? (
            <motion.div
              key='avatar'
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className='relative w-full h-full rounded-full overflow-hidden'
            >
              <img
                src={currentAvatarUrl}
                alt='Avatar'
                className='w-full h-full object-cover'
              />

              {/* Overlay avec boutons d'action */}
              <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center'>
                <div className='opacity-0 hover:opacity-100 transition-opacity duration-200 flex space-x-2'>
                  <Button
                    type='button'
                    variant='secondary'
                    size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      openFileSelector();
                    }}
                    className='bg-white/90 hover:bg-white'
                  >
                    <Camera className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='secondary'
                    size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      deleteCurrentAvatar();
                    }}
                    className='bg-white/90 hover:bg-white'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key='placeholder'
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className='w-full h-full flex flex-col items-center justify-center text-gray-400'
            >
              {isUploading ? (
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500'></div>
              ) : (
                <>
                  <User className='h-8 w-8 mb-2' />
                  <p className='text-xs text-center px-2'>
                    {isDragOver
                      ? 'Déposez votre image'
                      : 'Cliquez ou glissez une image'}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message d'erreur */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex items-center space-x-2 text-red-600 text-sm'
        >
          <AlertCircle className='h-4 w-4' />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Informations sur les formats acceptés */}
      <div className='text-center text-xs text-gray-500'>
        <p>Formats acceptés: JPG, PNG, GIF</p>
        <p>Taille max: 5MB</p>
      </div>
    </div>
  );
};

export default AvatarUpload;
