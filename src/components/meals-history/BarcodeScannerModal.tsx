'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import type { FoodItem } from '@/types/meals';
import { getFoodByBarcode } from '@/data/mock-foods';
import { FoodSearchItem } from './FoodSearchItem';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodFound: (food: FoodItem) => void;
}

type ScannerState =
  | 'initializing'
  | 'scanning'
  | 'found'
  | 'not_found'
  | 'error';

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onFoodFound,
}: BarcodeScannerModalProps) {
  const [scannerState, setScannerState] =
    useState<ScannerState>('initializing');
  const [foundFood, setFoundFood] = useState<FoodItem | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeScan = useCallback((barcode: string) => {
    setScannedBarcode(barcode);
    const food = getFoodByBarcode(barcode);

    if (food) {
      setFoundFood(food);
      setScannerState('found');
    } else {
      setScannerState('not_found');
    }
  }, []);

  const initScanner = useCallback(async () => {
    if (!scannerRef.current || !isOpen) return;

    try {
      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import('html5-qrcode');

      const html5QrCode = new Html5Qrcode('barcode-scanner');
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.5,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText: string) => {
          // Stop scanner after successful scan
          html5QrCode.stop().catch(console.error);
          handleBarcodeScan(decodedText);
        },
        () => {
          // Ignore scan errors (no barcode found in frame)
        }
      );

      setScannerState('scanning');
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setCameraAvailable(false);
      setErrorMessage("Caméra non disponible. Utilisez l'import d'image.");
      setScannerState('error');
    }
  }, [isOpen, handleBarcodeScan]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const scanner = html5QrCodeRef.current as {
          stop: () => Promise<void>;
          clear: () => void;
        };
        await scanner.stop();
        scanner.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      html5QrCodeRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setScannerState('initializing');
      setFoundFood(null);
      setScannedBarcode('');
      setErrorMessage('');

      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initScanner();
      }, 100);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, initScanner, stopScanner]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const handleRetry = () => {
    setFoundFood(null);
    setScannedBarcode('');
    setScannerState('initializing');
    initScanner();
  };

  const handleAddFood = (food: FoodItem) => {
    onFoodFound(food);
    handleClose();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setScannerState('initializing');
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('barcode-scanner-file');

      const result = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      handleBarcodeScan(result);
    } catch (err) {
      console.error('File scan error:', err);
      setErrorMessage("Aucun code-barres détecté dans l'image");
      setScannerState('not_found');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute inset-0 bg-black/70'
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden'
          >
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-[#1B998B]/10 rounded-xl flex items-center justify-center'>
                  <Camera className='w-5 h-5 text-[#1B998B]' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-gray-800'>
                    Scanner un code-barres
                  </h2>
                  <p className='text-sm text-gray-500'>
                    Pointez vers le code-barres du produit
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Content */}
            <div className='p-6'>
              {/* Scanner view */}
              {(scannerState === 'initializing' ||
                scannerState === 'scanning') && (
                <div className='space-y-4'>
                  <div
                    id='barcode-scanner'
                    ref={scannerRef}
                    className='w-full aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden relative'
                  >
                    {scannerState === 'initializing' && (
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='text-center text-white'>
                          <Loader2 className='w-8 h-8 animate-spin mx-auto mb-2' />
                          <p className='text-sm'>
                            Initialisation de la caméra...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload fallback */}
                  <div className='text-center'>
                    <p className='text-sm text-gray-500 mb-2'>
                      Ou importez une image du code-barres
                    </p>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleFileUpload}
                      className='hidden'
                      id='barcode-file-input'
                    />
                    <label
                      htmlFor='barcode-file-input'
                      className='inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors'
                    >
                      <Upload className='w-4 h-4' />
                      Importer une image
                    </label>
                  </div>
                </div>
              )}

              {/* Hidden div for file scanning */}
              <div id='barcode-scanner-file' className='hidden' />

              {/* Found state */}
              {scannerState === 'found' && foundFood && (
                <div className='space-y-4'>
                  <div className='flex items-center gap-3 p-3 bg-green-50 rounded-xl'>
                    <CheckCircle className='w-6 h-6 text-green-500' />
                    <div>
                      <p className='text-sm font-medium text-green-700'>
                        Produit trouvé !
                      </p>
                      <p className='text-xs text-green-600'>
                        Code : {scannedBarcode}
                      </p>
                    </div>
                  </div>

                  <FoodSearchItem food={foundFood} onAdd={handleAddFood} />

                  <button
                    onClick={handleRetry}
                    className='w-full py-2 text-[#1B998B] font-medium hover:bg-[#1B998B]/10 rounded-lg transition-colors'
                  >
                    Scanner un autre produit
                  </button>
                </div>
              )}

              {/* Not found state */}
              {scannerState === 'not_found' && (
                <div className='space-y-4'>
                  <div className='flex items-center gap-3 p-3 bg-amber-50 rounded-xl'>
                    <AlertCircle className='w-6 h-6 text-amber-500' />
                    <div>
                      <p className='text-sm font-medium text-amber-700'>
                        Produit non trouvé
                      </p>
                      <p className='text-xs text-amber-600'>
                        Code : {scannedBarcode}
                      </p>
                    </div>
                  </div>

                  <p className='text-sm text-gray-500 text-center'>
                    Ce produit n&apos;est pas dans notre base de données. Vous
                    pouvez le rechercher manuellement.
                  </p>

                  <div className='flex gap-2'>
                    <button
                      onClick={handleRetry}
                      className='flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors'
                    >
                      Réessayer
                    </button>
                    <button
                      onClick={handleClose}
                      className='flex-1 py-2.5 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#147569] transition-colors'
                    >
                      Rechercher
                    </button>
                  </div>
                </div>
              )}

              {/* Error state */}
              {scannerState === 'error' && (
                <div className='space-y-4'>
                  <div className='flex items-center gap-3 p-3 bg-red-50 rounded-xl'>
                    <AlertCircle className='w-6 h-6 text-red-500' />
                    <div>
                      <p className='text-sm font-medium text-red-700'>Erreur</p>
                      <p className='text-xs text-red-600'>{errorMessage}</p>
                    </div>
                  </div>

                  {!cameraAvailable && (
                    <div className='space-y-3'>
                      <p className='text-sm text-gray-500 text-center'>
                        Importez une photo du code-barres à la place
                      </p>
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        onChange={handleFileUpload}
                        className='hidden'
                        id='barcode-file-input-error'
                      />
                      <label
                        htmlFor='barcode-file-input-error'
                        className='flex items-center justify-center gap-2 w-full py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#147569] cursor-pointer transition-colors'
                      >
                        <Upload className='w-4 h-4' />
                        Importer une image
                      </label>
                    </div>
                  )}

                  <button
                    onClick={handleClose}
                    className='w-full py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default BarcodeScannerModal;
