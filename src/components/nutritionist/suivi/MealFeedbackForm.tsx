'use client';

import React, { useState } from 'react';
import { useAddMealFeedback } from '@/hooks/useNutritionistSuivi';
import { feedbackTypeConfig } from '@/types/nutritionist-suivi';
import type { FeedbackType } from '@/types/nutritionist-suivi';

interface MealFeedbackFormProps {
  patientId: string;
  mealId: string;
  onSuccess?: () => void;
}

const feedbackTypeOptions: { value: FeedbackType; label: string; icon: string }[] = [
  { value: 'general', label: feedbackTypeConfig.general.label, icon: feedbackTypeConfig.general.icon },
  { value: 'positive', label: feedbackTypeConfig.positive.label, icon: feedbackTypeConfig.positive.icon },
  { value: 'warning', label: feedbackTypeConfig.warning.label, icon: feedbackTypeConfig.warning.icon },
  { value: 'suggestion', label: feedbackTypeConfig.suggestion.label, icon: feedbackTypeConfig.suggestion.icon },
];

export function MealFeedbackForm({ patientId, mealId, onSuccess }: MealFeedbackFormProps) {
  const [comment, setComment] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');

  const addFeedback = useAddMealFeedback(patientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) return;

    try {
      await addFeedback.mutateAsync({
        mealId,
        comment: comment.trim(),
        feedback_type: feedbackType,
      });
      setComment('');
      setFeedbackType('general');
      onSuccess?.();
    } catch {
      // Error handled by React Query
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2">
        <select
          value={feedbackType}
          onChange={e => setFeedbackType(e.target.value as FeedbackType)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1B998B]"
        >
          {feedbackTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.icon} {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-start gap-2">
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          rows={2}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#1B998B] placeholder:text-gray-400"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!comment.trim() || addFeedback.isPending}
          className="px-3 py-2 bg-[#1B998B] text-white text-xs font-medium rounded-lg hover:bg-[#178578] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {addFeedback.isPending ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>

      {addFeedback.isError && (
        <p className="text-xs text-red-500">
          Erreur : {addFeedback.error?.message || 'Impossible d\'envoyer le feedback.'}
        </p>
      )}
    </form>
  );
}

export default MealFeedbackForm;
