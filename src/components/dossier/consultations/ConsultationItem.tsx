'use client';

import React from 'react';
import type { Consultation } from '@/types/dossier';
import { consultationModeConfig } from '@/types/dossier';

interface ConsultationItemProps {
  consultation: Consultation;
  index: number;
  isLast: boolean;
}

export function ConsultationItem({ consultation, index, isLast }: ConsultationItemProps) {
  const modeConf = consultationModeConfig[consultation.mode];

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200" />
      )}

      <div className="flex gap-4">
        {/* Timeline dot */}
        <div className="relative z-10">
          <div className="w-12 h-12 bg-[#1B998B]/10 rounded-full flex items-center justify-center">
            <span className="text-[#1B998B] font-bold">{index + 1}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-50 rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">{consultation.type}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">{consultation.date}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{consultation.duration}</span>
                <span className="text-gray-300">•</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${modeConf.bgColor} ${modeConf.textColor}`}
                >
                  {consultation.mode}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">{consultation.summary}</p>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Points clés</p>
            <ul className="space-y-1">
              {consultation.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-[#1B998B] mt-0.5">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700">Prochaines étapes</p>
            <p className="text-sm text-gray-600 mt-1">{consultation.nextSteps}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsultationItem;
