'use client';

import React, { useState } from 'react';
import type { MoodType, DigestionType, WellbeingEntry } from '@/types/suivi';
import { moodConfig, digestionConfig } from '@/types/suivi';

interface WellbeingFormProps {
  initialData?: WellbeingEntry | null;
  onSubmit: (data: Omit<WellbeingEntry, 'id' | 'date'>) => void;
}

export function WellbeingForm({ initialData, onSubmit }: WellbeingFormProps) {
  const [energy, setEnergy] = useState(initialData?.energy || 3);
  const [sleep, setSleep] = useState(initialData?.sleep?.toString() || '7.0');
  const [mood, setMood] = useState<MoodType>(initialData?.mood || 'neutral');
  const [digestion, setDigestion] = useState<DigestionType>(
    initialData?.digestion || 'normal'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      energy,
      sleep: parseFloat(sleep),
      mood,
      digestion,
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="font-semibold text-gray-800 mb-4">
        Comment vous sentez-vous aujourd&apos;hui ?
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          {/* Energy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Niveau d&apos;énergie
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEnergy(level)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    energy === level
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Épuisé</span>
              <span>Plein d&apos;énergie</span>
            </div>
          </div>

          {/* Sleep */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Heures de sommeil
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#1B998B]"
              />
              <span className="text-gray-500">heures</span>
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Humeur
            </label>
            <div className="flex gap-2">
              {(Object.entries(moodConfig) as [MoodType, { emoji: string; label: string }][]).map(
                ([key, { emoji, label }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMood(key)}
                    className={`flex-1 py-3 rounded-lg flex flex-col items-center transition-colors ${
                      mood === key
                        ? 'bg-[#1B998B]/10 border-2 border-[#1B998B]'
                        : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs text-gray-600 mt-1">{label}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Digestion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Digestion
            </label>
            <div className="flex flex-wrap gap-2">
              {digestionConfig.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDigestion(option.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    digestion === option.id
                      ? 'bg-[#1B998B]/10 text-[#1B998B] border-2 border-[#1B998B]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  {option.emoji} {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 py-3 bg-[#1B998B] text-white font-medium rounded-lg hover:bg-[#147569] transition-colors"
        >
          Enregistrer mon bien-être
        </button>
      </form>
    </div>
  );
}

export default WellbeingForm;
