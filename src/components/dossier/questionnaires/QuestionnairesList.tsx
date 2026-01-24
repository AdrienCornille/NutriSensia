'use client';

import React from 'react';
import { QuestionnaireItem } from './QuestionnaireItem';
import type { Questionnaire } from '@/types/dossier';

interface QuestionnairesListProps {
  questionnaires: Questionnaire[];
}

export function QuestionnairesList({ questionnaires }: QuestionnairesListProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="font-semibold text-gray-800 mb-4">Questionnaires de suivi</h2>
      <p className="text-sm text-gray-500 mb-6">
        Ces questionnaires sont remplis lors de vos consultations avec votre nutritionniste.
      </p>

      <div className="space-y-4">
        {questionnaires.map((questionnaire) => (
          <QuestionnaireItem key={questionnaire.id} questionnaire={questionnaire} />
        ))}
      </div>
    </div>
  );
}

export default QuestionnairesList;
