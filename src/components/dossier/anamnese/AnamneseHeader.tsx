'use client';

import React from 'react';
import type { AnamneseData } from '@/types/dossier';

interface AnamneseHeaderProps {
  data: AnamneseData;
}

export function AnamneseHeader({ data }: AnamneseHeaderProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Questionnaire d&apos;anamnèse</h2>
          <p className="text-sm text-gray-500 mt-1">
            Rempli lors de votre première consultation avec {data.nutritionist}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Créé le</p>
          <p className="font-medium text-gray-800">{data.createdAt}</p>
        </div>
      </div>
    </div>
  );
}

export default AnamneseHeader;
