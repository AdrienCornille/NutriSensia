'use client';

import React, { useCallback, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MealPhotoUploadProps {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  isUploading?: boolean;
}

export function MealPhotoUpload({
  photoUrl,
  onPhotoChange,
  isUploading = false,
}: MealPhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFileSelect(file);
      }
    },
    []
  );

  const handleFileSelect = useCallback((file: File) => {
    // In production, upload to Supabase Storage
    // For now, create a local URL preview
    const url = URL.createObjectURL(file);
    onPhotoChange(url);
  }, [onPhotoChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleRemove = useCallback(() => {
    onPhotoChange(null);
  }, [onPhotoChange]);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="font-semibold text-gray-800 mb-4">
        Photo du repas (optionnel)
      </h2>

      <AnimatePresence mode="wait">
        {photoUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={photoUrl}
                alt="Aperçu du repas"
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                aria-label="Supprimer la photo"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.label
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-all
              ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              disabled={isUploading}
            />
            <div
              className={`
                w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                ${isDragOver ? 'bg-emerald-100' : 'bg-gray-100'}
              `}
            >
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera
                  className={`w-8 h-8 ${isDragOver ? 'text-emerald-600' : 'text-gray-400'}`}
                />
              )}
            </div>
            <p className="font-medium text-gray-700">
              {isUploading ? 'Téléchargement...' : 'Ajouter une photo'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Glisser-déposer ou cliquer pour parcourir
            </p>
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MealPhotoUpload;
