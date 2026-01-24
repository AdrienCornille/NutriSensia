'use client';

import React from 'react';
import type { ReminderSettings as ReminderSettingsType } from '@/types/agenda';

interface ReminderSettingsProps {
  settings: ReminderSettingsType;
  onSettingChange: (settings: Partial<ReminderSettingsType>) => void;
}

export function ReminderSettings({ settings, onSettingChange }: ReminderSettingsProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4">Paramètres de rappel</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-xl">📧</span>
            <div>
              <p className="font-medium text-gray-800">Rappel par email</p>
              <p className="text-sm text-gray-500">24h avant le rendez-vous</p>
            </div>
          </div>
          <button
            onClick={() => onSettingChange({ emailDayBefore: !settings.emailDayBefore })}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              settings.emailDayBefore ? 'bg-[#1B998B]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                settings.emailDayBefore ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <div>
              <p className="font-medium text-gray-800">Rappel par notification</p>
              <p className="text-sm text-gray-500">1h avant le rendez-vous</p>
            </div>
          </div>
          <button
            onClick={() => onSettingChange({ pushHourBefore: !settings.pushHourBefore })}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              settings.pushHourBefore ? 'bg-[#1B998B]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                settings.pushHourBefore ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReminderSettings;
