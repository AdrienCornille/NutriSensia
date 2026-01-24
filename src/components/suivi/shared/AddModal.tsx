'use client';

import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import type { AddModalType, MeasurementType, ActivityType, Intensity } from '@/types/suivi';
import { measurementOptions, activityOptions } from '@/data/mock-suivi';
import { intensityConfig, calculateActivityCalories, activityTypeConfig } from '@/types/suivi';

interface AddModalProps {
  isOpen: boolean;
  type: AddModalType;
  onClose: () => void;
  onSubmitMeasurement?: (type: MeasurementType, value: number) => void;
  onSubmitActivity?: (type: ActivityType, duration: number, intensity: Intensity, calories: number) => void;
}

export function AddModal({
  isOpen,
  type,
  onClose,
  onSubmitMeasurement,
  onSubmitActivity,
}: AddModalProps) {
  // Measurement state
  const [selectedMeasurementType, setSelectedMeasurementType] = useState<MeasurementType>('taille');
  const [measurementValue, setMeasurementValue] = useState('');

  // Activity state
  const [activityDuration, setActivityDuration] = useState('');
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>('moderate');
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | null>(null);

  if (!isOpen || !type) return null;

  const handleMeasurementSubmit = () => {
    const value = parseFloat(measurementValue);
    if (!isNaN(value) && value > 0 && onSubmitMeasurement) {
      onSubmitMeasurement(selectedMeasurementType, value);
      setMeasurementValue('');
      onClose();
    }
  };

  const handleActivitySubmit = () => {
    const duration = parseInt(activityDuration, 10);
    if (!isNaN(duration) && duration > 0 && selectedActivityType && onSubmitActivity) {
      const calories = calculateActivityCalories(selectedActivityType, duration, selectedIntensity);
      onSubmitActivity(selectedActivityType, duration, selectedIntensity, calories);
      setActivityDuration('');
      setSelectedActivityType(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {type === 'measurement' ? 'Nouvelle mesure' : 'Nouvelle activité'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {type === 'measurement' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de mesure
              </label>
              <select
                value={selectedMeasurementType}
                onChange={(e) => setSelectedMeasurementType(e.target.value as MeasurementType)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B] bg-white"
              >
                {measurementOptions.map((option) => (
                  <option key={option.type} value={option.type}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valeur (cm)
              </label>
              <input
                type="number"
                value={measurementValue}
                onChange={(e) => setMeasurementValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]"
                placeholder="Ex: 85"
              />
            </div>
          </div>
        )}

        {type === 'activity' && (
          <div className="space-y-4">
            {!selectedActivityType ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type d&apos;activité
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {activityOptions.map((activity) => (
                    <button
                      key={activity.type}
                      onClick={() => setSelectedActivityType(activity.type)}
                      className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-center"
                    >
                      <span className="text-xl">{activity.icon}</span>
                      <p className="text-xs font-medium text-gray-700 mt-1">
                        {activity.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setSelectedActivityType(null)}
                    className="text-sm text-[#1B998B] hover:underline"
                  >
                    &larr; Changer
                  </button>
                  <span className="text-gray-600">
                    {activityOptions.find((a) => a.type === selectedActivityType)?.icon}{' '}
                    {activityOptions.find((a) => a.type === selectedActivityType)?.label}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (minutes)
                  </label>
                  <input
                    type="number"
                    value={activityDuration}
                    onChange={(e) => setActivityDuration(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]"
                    placeholder="Ex: 45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensité
                  </label>
                  <div className="flex gap-2">
                    {(Object.entries(intensityConfig) as [Intensity, { label: string }][]).map(
                      ([key, { label }]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedIntensity(key)}
                          className={`flex-1 py-3 rounded-lg border transition-colors ${
                            selectedIntensity === key
                              ? 'border-[#1B998B] bg-[#1B998B]/10 text-[#1B998B]'
                              : 'border-gray-200 hover:border-[#1B998B]/50 hover:bg-[#1B998B]/5'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* BIO-007: Estimation des calories en temps réel */}
                {activityDuration && parseInt(activityDuration, 10) > 0 && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔥</span>
                        <div>
                          <p className="text-sm font-medium text-amber-800">Calories estimées</p>
                          <p className="text-xs text-amber-600">
                            {activityTypeConfig[selectedActivityType].label} • {activityDuration} min • {intensityConfig[selectedIntensity].label}
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-amber-700">
                        {calculateActivityCalories(selectedActivityType, parseInt(activityDuration, 10), selectedIntensity)}
                        <span className="text-sm font-normal ml-1">kcal</span>
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={
              type === 'measurement' ? handleMeasurementSubmit : handleActivitySubmit
            }
            disabled={
              type === 'measurement'
                ? !measurementValue
                : !activityDuration || !selectedActivityType
            }
            className="flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#147569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddModal;
