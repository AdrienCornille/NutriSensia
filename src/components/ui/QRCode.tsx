'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Composant QR Code simple utilisant la librairie qrcode
 */
export const QRCodeComponent: React.FC<QRCodeProps> = ({ 
  value, 
  size = 200, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      console.log('🔲 Génération QR Code pour:', {
        value: value.substring(0, 100) + '...',
        size,
        canvas: !!canvasRef.current
      });
      
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('❌ Erreur génération QR Code:', error);
        } else {
          console.log('✅ QR Code généré avec succès');
        }
      });
    } else {
      console.log('⚠️ QR Code non généré:', {
        hasCanvas: !!canvasRef.current,
        hasValue: !!value,
        valueType: typeof value
      });
    }
  }, [value, size]);

  if (!value) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef}
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};
