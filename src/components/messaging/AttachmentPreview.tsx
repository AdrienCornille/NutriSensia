'use client';

import React, { useMemo } from 'react';
import { X, FileText, Image as ImageIcon } from 'lucide-react';

interface AttachmentPreviewProps {
  file: File;
  fileType: 'image' | 'document';
  onRemove: () => void;
}

export function AttachmentPreview({
  file,
  fileType,
  onRemove,
}: AttachmentPreviewProps) {
  const previewUrl = useMemo(() => {
    if (fileType === 'image') {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file, fileType]);

  // Clean up object URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fileSize = useMemo(() => {
    if (file.size < 1024) return `${file.size} o`;
    if (file.size < 1024 * 1024) return `${(file.size / 1024).toFixed(0)} Ko`;
    return `${(file.size / (1024 * 1024)).toFixed(1)} Mo`;
  }, [file.size]);

  return (
    <div className='px-4 py-2 bg-gray-50 border-t border-gray-100'>
      <div className='flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-2'>
        {/* Thumbnail */}
        {fileType === 'image' && previewUrl ? (
          <img
            src={previewUrl}
            alt={file.name}
            className='w-12 h-12 rounded-lg object-cover flex-shrink-0'
          />
        ) : (
          <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0'>
            <FileText className='w-6 h-6 text-gray-400' />
          </div>
        )}

        {/* File info */}
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-gray-700 truncate'>
            {file.name}
          </p>
          <p className='text-xs text-gray-400'>{fileSize}</p>
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className='p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0'
          aria-label='Retirer la pièce jointe'
        >
          <X className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}

export default AttachmentPreview;
