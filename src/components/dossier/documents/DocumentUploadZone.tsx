'use client';

import React from 'react';

interface DocumentUploadZoneProps {
  onUpload?: (files: FileList) => void;
}

export function DocumentUploadZone({ onUpload }: DocumentUploadZoneProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && onUpload) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,image/*';
    input.multiple = true;
    input.onchange = e => {
      const files = (e.target as HTMLInputElement).files;
      if (files && onUpload) {
        onUpload(files);
      }
    };
    input.click();
  };

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h2 className='font-semibold text-gray-800 mb-4'>Ajouter un document</h2>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className='border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#1B998B] hover:bg-[#1B998B]/5 transition-all cursor-pointer'
      >
        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <span className='text-3xl'>📄</span>
        </div>
        <p className='font-medium text-gray-700'>
          Glisser-déposer ou cliquer pour ajouter
        </p>
        <p className='text-sm text-gray-500 mt-1'>PDF, images (max 10 Mo)</p>
      </div>
    </div>
  );
}

export default DocumentUploadZone;
