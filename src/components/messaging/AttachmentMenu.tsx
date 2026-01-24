'use client';

import React, { useRef } from 'react';
import { Camera, Image, FileText, X } from 'lucide-react';
import type { AttachmentType } from '@/types/messaging';

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: File, type: 'image' | 'document') => void;
}

const attachmentOptions: {
  type: AttachmentType;
  icon: React.ReactNode;
  label: string;
  accept: string;
  fileType: 'image' | 'document';
}[] = [
  {
    type: 'photo',
    icon: <Image className="w-6 h-6" />,
    label: 'Galerie',
    accept: 'image/*',
    fileType: 'image',
  },
  {
    type: 'camera',
    icon: <Camera className="w-6 h-6" />,
    label: 'Appareil photo',
    accept: 'image/*;capture=camera',
    fileType: 'image',
  },
  {
    type: 'document',
    icon: <FileText className="w-6 h-6" />,
    label: 'Document',
    accept: '.pdf,.doc,.docx,.txt,.xls,.xlsx',
    fileType: 'document',
  },
];

export function AttachmentMenu({ isOpen, onClose, onSelectFile }: AttachmentMenuProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: 'image' | 'document'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelectFile(file, fileType);
      onClose();
    }
    // Reset input
    event.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu */}
      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-1 p-1">
          {attachmentOptions.map((option) => (
            <div key={option.type}>
              <button
                onClick={() => fileInputRefs.current[option.type]?.click()}
                className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-100 transition-colors min-w-[72px]"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                  {option.icon}
                </div>
                <span className="text-xs text-gray-600">{option.label}</span>
              </button>
              <input
                ref={(el) => { fileInputRefs.current[option.type] = el; }}
                type="file"
                accept={option.accept}
                onChange={(e) => handleFileChange(e, option.fileType)}
                className="hidden"
                aria-label={option.label}
              />
            </div>
          ))}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full ml-1"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </>
  );
}

export default AttachmentMenu;
