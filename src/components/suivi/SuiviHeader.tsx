'use client';

import React from 'react';
import { Watch } from 'lucide-react';

interface SuiviHeaderProps {
  onConnectDevice?: () => void;
}

export function SuiviHeader({ onConnectDevice }: SuiviHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Mon suivi</h1>
          <p className="text-sm text-gray-500">Suivez votre progression</p>
        </div>
        <button
          onClick={onConnectDevice}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors"
        >
          <Watch className="w-4 h-4" />
          <span className="text-sm font-medium">Connecter un appareil</span>
        </button>
      </div>
    </header>
  );
}

export default SuiviHeader;
