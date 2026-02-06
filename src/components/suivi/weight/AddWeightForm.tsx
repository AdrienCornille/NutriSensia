'use client';

import React, { useState, useMemo } from 'react';
import {
  Lightbulb,
  Loader2,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';

interface AddWeightFormProps {
  defaultValue?: number;
  lastWeight?: number;
  isLoading?: boolean;
  onSubmit: (weight: number, date: Date) => void;
}

interface ValidationError {
  weight?: string;
  date?: string;
}

const MIN_WEIGHT = 30;
const MAX_WEIGHT = 300;

export function AddWeightForm({
  defaultValue,
  lastWeight,
  isLoading = false,
  onSubmit,
}: AddWeightFormProps) {
  const [weight, setWeight] = useState(defaultValue?.toString() || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<ValidationError>({});
  const [touched, setTouched] = useState({ weight: false, date: false });

  // Calculate variation preview
  const variationPreview = useMemo(() => {
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || !lastWeight) return null;

    const diff = weightValue - lastWeight;
    const absDiff = Math.abs(diff);

    if (absDiff < 0.05) {
      return { direction: 'stable' as const, value: 0, formatted: 'Stable' };
    }

    return {
      direction: diff > 0 ? ('up' as const) : ('down' as const),
      value: absDiff,
      formatted: `${diff > 0 ? '+' : '-'}${absDiff.toFixed(1)} kg`,
    };
  }, [weight, lastWeight]);

  const validate = (): boolean => {
    const newErrors: ValidationError = {};
    const weightValue = parseFloat(weight);

    // Validate weight
    if (!weight.trim()) {
      newErrors.weight = 'Le poids est requis';
    } else if (isNaN(weightValue)) {
      newErrors.weight = 'Veuillez entrer un nombre valide';
    } else if (weightValue < MIN_WEIGHT) {
      newErrors.weight = `Le poids doit être supérieur à ${MIN_WEIGHT} kg`;
    } else if (weightValue > MAX_WEIGHT) {
      newErrors.weight = `Le poids doit être inférieur à ${MAX_WEIGHT} kg`;
    }

    // Validate date
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (!date) {
      newErrors.date = 'La date est requise';
    } else if (selectedDate > today) {
      newErrors.date = 'La date ne peut pas être dans le futur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ weight: true, date: true });

    if (validate()) {
      const weightValue = parseFloat(weight);
      onSubmit(weightValue, new Date(date));
    }
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);
    if (touched.weight) {
      // Re-validate on change if field was touched
      const weightValue = parseFloat(value);
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, weight: 'Le poids est requis' }));
      } else if (isNaN(weightValue)) {
        setErrors(prev => ({
          ...prev,
          weight: 'Veuillez entrer un nombre valide',
        }));
      } else if (weightValue < MIN_WEIGHT || weightValue > MAX_WEIGHT) {
        setErrors(prev => ({
          ...prev,
          weight: `Le poids doit être entre ${MIN_WEIGHT} et ${MAX_WEIGHT} kg`,
        }));
      } else {
        setErrors(prev => ({ ...prev, weight: undefined }));
      }
    }
  };

  const handleWeightBlur = () => {
    setTouched(prev => ({ ...prev, weight: true }));
    validate();
  };

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h2 className='font-semibold text-gray-800 mb-4'>Ajouter une pesée</h2>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Weight input */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Poids (kg)
          </label>
          <input
            type='number'
            step='0.1'
            min={MIN_WEIGHT}
            max={MAX_WEIGHT}
            value={weight}
            onChange={e => handleWeightChange(e.target.value)}
            onBlur={handleWeightBlur}
            disabled={isLoading}
            className={`w-full px-4 py-3 border rounded-lg text-lg font-medium focus:outline-none focus:ring-2 transition-colors ${
              errors.weight && touched.weight
                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-200 focus:ring-emerald-500'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder='Ex: 78.4'
          />
          {errors.weight && touched.weight && (
            <p className='text-sm text-red-600 mt-1'>{errors.weight}</p>
          )}
        </div>

        {/* Variation preview */}
        {variationPreview && weight && !errors.weight && (
          <div
            className={`p-3 rounded-lg flex items-center gap-2 ${
              variationPreview.direction === 'down'
                ? 'bg-emerald-50 text-emerald-700'
                : variationPreview.direction === 'up'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-gray-50 text-gray-600'
            }`}
          >
            {variationPreview.direction === 'down' && (
              <TrendingDown className='w-4 h-4' />
            )}
            {variationPreview.direction === 'up' && (
              <TrendingUp className='w-4 h-4' />
            )}
            {variationPreview.direction === 'stable' && (
              <Minus className='w-4 h-4' />
            )}
            <span className='text-sm font-medium'>
              {variationPreview.formatted} vs dernière pesée ({lastWeight} kg)
            </span>
          </div>
        )}

        {/* Date input */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Date
          </label>
          <input
            type='date'
            value={date}
            onChange={e => setDate(e.target.value)}
            disabled={isLoading}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.date && touched.date
                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-200 focus:ring-emerald-500'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.date && touched.date && (
            <p className='text-sm text-red-600 mt-1'>{errors.date}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type='submit'
          disabled={isLoading || (touched.weight && !!errors.weight)}
          className={`w-full py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            isLoading || (touched.weight && !!errors.weight)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className='w-5 h-5 animate-spin' />
              Enregistrement...
            </>
          ) : (
            'Enregistrer'
          )}
        </button>
      </form>

      {/* Connected device tip */}
      <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
        <div className='flex items-start gap-3'>
          <Lightbulb className='w-5 h-5 text-blue-500 mt-0.5' />
          <div>
            <p className='text-sm font-medium text-blue-800'>
              Balance connectée
            </p>
            <p className='text-xs text-blue-600 mt-1'>
              Synchronisez votre balance pour un suivi automatique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddWeightForm;
