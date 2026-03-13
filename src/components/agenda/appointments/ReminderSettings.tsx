'use client';

import React, { useState } from 'react';
import { Mail, Bell, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import {
  useReminderPreferences,
  useUpdateReminderPreferences,
} from '@/hooks/useReminderPreferences';

interface ReminderSettingsProps {
  onShowToast?: (type: 'success' | 'error', title: string, message?: string) => void;
}

const HOUR_OPTIONS = [1, 2, 3, 6, 12, 24, 48];

function HoursSelect({
  value,
  onChange,
  max = 48,
}: {
  value: number;
  onChange: (hours: number) => void;
  max?: number;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className='px-2 py-1 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
    >
      {HOUR_OPTIONS.filter(h => h <= max).map(h => (
        <option key={h} value={h}>
          {h}h avant
        </option>
      ))}
    </select>
  );
}

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`w-12 h-6 rounded-full relative transition-colors ${
        enabled ? 'bg-[#1B998B]' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
          enabled ? 'right-1' : 'left-1'
        }`}
      />
    </button>
  );
}

export function ReminderSettings({ onShowToast }: ReminderSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: preferences, isLoading, error: loadError } = useReminderPreferences();
  const updateMutation = useUpdateReminderPreferences();

  const handleToggle = async (
    field: 'email_enabled' | 'push_enabled',
    currentValue: boolean
  ) => {
    try {
      await updateMutation.mutateAsync({ [field]: !currentValue });
      onShowToast?.(
        'success',
        'Préférences mises à jour',
        !currentValue ? 'Rappel activé' : 'Rappel désactivé'
      );
    } catch (err) {
      onShowToast?.(
        'error',
        'Erreur',
        err instanceof Error ? err.message : 'Impossible de mettre à jour'
      );
    }
  };

  const handleHoursChange = async (
    field: 'email_hours_before' | 'push_hours_before',
    hours: number
  ) => {
    try {
      await updateMutation.mutateAsync({ [field]: hours });
      onShowToast?.('success', 'Délai de rappel mis à jour');
    } catch (err) {
      onShowToast?.(
        'error',
        'Erreur',
        err instanceof Error ? err.message : 'Impossible de mettre à jour'
      );
    }
  };

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl p-6 border border-gray-200'>
        <div className='flex items-center gap-2 text-gray-400'>
          <Loader2 className='w-4 h-4 animate-spin' />
          <span className='text-sm'>Chargement des préférences...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className='bg-white rounded-xl p-4 border border-gray-200'>
        <p className='text-sm text-red-500'>
          Erreur lors du chargement des préférences de rappel
        </p>
      </div>
    );
  }

  const emailEnabled = preferences?.email_enabled ?? true;
  const emailHours = preferences?.email_hours_before ?? 24;
  const pushEnabled = preferences?.push_enabled ?? true;
  const pushHours = preferences?.push_hours_before ?? 1;
  const isSaving = updateMutation.isPending;

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Header - clickable to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-[#1B998B]/10 rounded-lg flex items-center justify-center'>
            <Bell className='w-4 h-4 text-[#1B998B]' />
          </div>
          <div className='text-left'>
            <h3 className='font-semibold text-gray-800 text-sm'>
              Paramètres de rappel
            </h3>
            <p className='text-xs text-gray-500'>
              {emailEnabled && pushEnabled
                ? `Email ${emailHours}h + Notification ${pushHours}h avant`
                : emailEnabled
                  ? `Email ${emailHours}h avant`
                  : pushEnabled
                    ? `Notification ${pushHours}h avant`
                    : 'Aucun rappel activé'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className='w-5 h-5 text-gray-400' />
        ) : (
          <ChevronDown className='w-5 h-5 text-gray-400' />
        )}
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className='px-4 pb-4 space-y-3 border-t border-gray-100 pt-3'>
          {/* Email reminder */}
          <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-3'>
              <Mail className='w-5 h-5 text-gray-500' />
              <div>
                <p className='font-medium text-gray-800 text-sm'>
                  Rappel par email
                </p>
                {emailEnabled && (
                  <HoursSelect
                    value={emailHours}
                    onChange={h => handleHoursChange('email_hours_before', h)}
                    max={72}
                  />
                )}
              </div>
            </div>
            <Toggle
              enabled={emailEnabled}
              onChange={() => handleToggle('email_enabled', emailEnabled)}
              disabled={isSaving}
            />
          </div>

          {/* Push reminder */}
          <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-3'>
              <Bell className='w-5 h-5 text-gray-500' />
              <div>
                <p className='font-medium text-gray-800 text-sm'>
                  Rappel par notification
                </p>
                {pushEnabled && (
                  <HoursSelect
                    value={pushHours}
                    onChange={h => handleHoursChange('push_hours_before', h)}
                    max={48}
                  />
                )}
              </div>
            </div>
            <Toggle
              enabled={pushEnabled}
              onChange={() => handleToggle('push_enabled', pushEnabled)}
              disabled={isSaving}
            />
          </div>

          {/* Info */}
          <p className='text-xs text-gray-400 text-center mt-2'>
            Ces préférences s&apos;appliquent à tous vos futurs rendez-vous
          </p>
        </div>
      )}
    </div>
  );
}

export default ReminderSettings;
