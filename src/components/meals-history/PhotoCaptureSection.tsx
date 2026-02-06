'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Image as ImageIcon, RotateCcw } from 'lucide-react';

interface PhotoCaptureSectionProps {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
}

// Maximum dimensions for compressed image
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const COMPRESSION_QUALITY = 0.8;

/**
 * Compress an image file using canvas
 * Returns a base64 data URL
 */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG
        const compressedDataUrl = canvas.toDataURL(
          'image/jpeg',
          COMPRESSION_QUALITY
        );
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function PhotoCaptureSection({
  photoUrl,
  onPhotoChange,
}: PhotoCaptureSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image');
        return;
      }

      // Validate file size (max 20MB before compression)
      if (file.size > 20 * 1024 * 1024) {
        setError('Image trop volumineuse (max 20 Mo)');
        return;
      }

      setError(null);
      setIsProcessing(true);

      try {
        const compressedUrl = await compressImage(file);
        onPhotoChange(compressedUrl);
      } catch (err) {
        console.error('Error compressing image:', err);
        setError("Erreur lors du traitement de l'image");
      } finally {
        setIsProcessing(false);
        // Reset input
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
      }
    },
    [onPhotoChange]
  );

  const handleRemovePhoto = useCallback(() => {
    onPhotoChange(null);
    setError(null);
  }, [onPhotoChange]);

  const handleRetake = useCallback(() => {
    handleRemovePhoto();
    // Slight delay to allow state update before opening camera
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 100);
  }, [handleRemovePhoto]);

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <label className='block text-sm font-medium text-gray-700'>
          Photo du repas
          <span className='text-gray-400 font-normal ml-1'>(optionnel)</span>
        </label>
        {photoUrl && (
          <button
            onClick={handleRemovePhoto}
            className='text-xs text-red-500 hover:text-red-600 flex items-center gap-1'
          >
            <X className='w-3 h-3' />
            Supprimer
          </button>
        )}
      </div>

      <AnimatePresence mode='wait'>
        {!photoUrl ? (
          <motion.div
            key='capture-buttons'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='space-y-2'
          >
            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type='file'
              accept='image/*'
              capture='environment'
              onChange={handleFileSelect}
              className='hidden'
              id='photo-camera-input'
            />
            <input
              ref={galleryInputRef}
              type='file'
              accept='image/*'
              onChange={handleFileSelect}
              className='hidden'
              id='photo-gallery-input'
            />

            {/* Capture buttons */}
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => cameraInputRef.current?.click()}
                disabled={isProcessing}
                className='flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#1B998B] hover:text-[#1B998B] hover:bg-[#1B998B]/5 transition-colors disabled:opacity-50'
              >
                <Camera className='w-5 h-5' />
                <span className='text-sm font-medium'>Prendre une photo</span>
              </button>

              <button
                type='button'
                onClick={() => galleryInputRef.current?.click()}
                disabled={isProcessing}
                className='flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#1B998B] hover:text-[#1B998B] hover:bg-[#1B998B]/5 transition-colors disabled:opacity-50'
              >
                <Upload className='w-5 h-5' />
                <span className='text-sm font-medium'>Importer</span>
              </button>
            </div>

            {/* Processing indicator */}
            {isProcessing && (
              <div className='flex items-center justify-center gap-2 py-2 text-sm text-gray-500'>
                <div className='w-4 h-4 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
                Traitement en cours...
              </div>
            )}

            {/* Error message */}
            {error && (
              <p className='text-sm text-red-500 text-center'>{error}</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key='photo-preview'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='relative'
          >
            {/* Photo preview */}
            <div className='relative rounded-xl overflow-hidden border border-gray-200 shadow-sm'>
              <img
                src={photoUrl}
                alt='Aperçu du repas'
                className='w-full h-48 object-cover'
              />

              {/* Overlay with actions */}
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-3'>
                <button
                  type='button'
                  onClick={handleRetake}
                  className='flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-gray-700 rounded-lg text-sm font-medium hover:bg-white transition-colors'
                >
                  <RotateCcw className='w-4 h-4' />
                  Reprendre
                </button>
                <button
                  type='button'
                  onClick={handleRemovePhoto}
                  className='flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 text-white rounded-lg text-sm font-medium hover:bg-red-500 transition-colors'
                >
                  <X className='w-4 h-4' />
                  Supprimer
                </button>
              </div>

              {/* Photo badge */}
              <div className='absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/50 text-white rounded-full text-xs'>
                <ImageIcon className='w-3 h-3' />
                Photo ajoutée
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PhotoCaptureSection;
