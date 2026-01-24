'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import type { MessageAttachment } from '@/types/messaging';

interface ImagePreviewModalProps {
  isOpen: boolean;
  image: MessageAttachment | null;
  onClose: () => void;
}

export function ImagePreviewModal({ isOpen, image, onClose }: ImagePreviewModalProps) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Check if Web Share API is available
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  if (!isOpen || !image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title: image.name,
          url: image.url,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-white text-sm font-medium truncate max-w-[60%]">
          {image.name}
        </div>

        <div className="flex items-center gap-2">
          {canShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
              aria-label="Partager"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
            aria-label="Télécharger"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="max-w-[90vw] max-h-[80vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url}
          alt={image.name}
          className="max-w-full max-h-[75vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
}

export default ImagePreviewModal;
