'use client';

import React from 'react';
import type { Questionnaire } from '@/types/dossier';
import { statusConfig } from '@/types/dossier';

interface QuestionnaireItemProps {
  questionnaire: Questionnaire;
}

export function QuestionnaireItem({ questionnaire }: QuestionnaireItemProps) {
  const statusConf = statusConfig[questionnaire.status];

  return (
    <div
      className={`p-4 rounded-xl border ${
        questionnaire.status === 'completed'
          ? 'border-gray-200 bg-white'
          : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              questionnaire.status === 'completed' ? 'bg-emerald-100' : 'bg-amber-100'
            }`}
          >
            <span className="text-xl">{questionnaire.status === 'completed' ? '✓' : '📝'}</span>
          </div>
          <div>
            <p className="font-medium text-gray-800">{questionnaire.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{questionnaire.type}</span>
              {questionnaire.consultationLinked && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{questionnaire.consultationLinked}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {questionnaire.date && (
            <span className="text-sm text-gray-500">{questionnaire.date}</span>
          )}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusConf.bgColor} ${statusConf.textColor}`}
          >
            {statusConf.label}
          </span>
          {questionnaire.status === 'completed' && (
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">👁</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionnaireItem;
