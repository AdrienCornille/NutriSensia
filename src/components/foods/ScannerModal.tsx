'use client';

import React from 'react';
import { X, Camera, Upload } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScannerModal({ isOpen, onClose }: ScannerModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4'>
      <div className='max-w-md w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-white'>
            Scanner un code-barres
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-white/10 rounded-lg text-white'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Camera viewfinder placeholder */}
        <div className='bg-gray-800 rounded-2xl aspect-square flex items-center justify-center relative overflow-hidden'>
          {/* Scan area overlay */}
          <div className='absolute inset-12 border-2 border-white/50 rounded-xl'>
            <div className='absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg' />
            <div className='absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg' />
            <div className='absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg' />
            <div className='absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg' />
          </div>

          {/* Scanning line animation */}
          <div className='absolute inset-12 overflow-hidden'>
            <div
              className='h-0.5 bg-emerald-500 w-full animate-pulse'
              style={{ marginTop: '50%' }}
            />
          </div>

          <div className='text-center text-white'>
            <Camera className='w-16 h-16 mx-auto text-white/50' />
            <p className='mt-4'>Placez le code-barres dans le cadre</p>
          </div>
        </div>

        <div className='mt-6 text-center'>
          <p className='text-gray-400 text-sm'>
            Scannez le code-barres d'un produit pour trouver ses informations
            nutritionnelles
          </p>
        </div>

        <div className='mt-6 flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors'
          >
            Annuler
          </button>
          <button className='flex-1 py-3 bg-white text-gray-800 font-medium rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2'>
            <Upload className='w-5 h-5' />
            Importer une image
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScannerModal;
