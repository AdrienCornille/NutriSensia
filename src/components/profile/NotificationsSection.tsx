'use client';

import React from 'react';
import type { NotificationSettings, EmailNotificationSettings, PushNotificationSettings } from '@/types/profile';
import { quietHoursOptions } from '@/types/profile';
import { getEmailNotificationLabels, getPushNotificationLabels } from '@/data/mock-profile';
import { NotificationToggle } from './NotificationToggle';

interface NotificationsSectionProps {
  notificationSettings: NotificationSettings;
  onToggleEmail: (key: keyof EmailNotificationSettings) => void;
  onTogglePush: (key: keyof PushNotificationSettings) => void;
  onToggleQuietHours: () => void;
  onUpdateQuietHours: (startTime?: string, endTime?: string) => void;
}

export function NotificationsSection({
  notificationSettings,
  onToggleEmail,
  onTogglePush,
  onToggleQuietHours,
  onUpdateQuietHours,
}: NotificationsSectionProps) {
  const emailLabels = getEmailNotificationLabels();
  const pushLabels = getPushNotificationLabels();

  return (
    <div className="space-y-6">
      {/* Email notifications */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Notifications par email</h2>
        <div className="divide-y divide-gray-100">
          {(Object.keys(notificationSettings.email) as Array<keyof EmailNotificationSettings>).map(
            (key) => (
              <NotificationToggle
                key={key}
                enabled={notificationSettings.email[key]}
                label={emailLabels[key]}
                onToggle={() => onToggleEmail(key)}
              />
            )
          )}
        </div>
      </div>

      {/* Push notifications */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Notifications push</h2>
        <div className="divide-y divide-gray-100">
          {(Object.keys(notificationSettings.push) as Array<keyof PushNotificationSettings>).map(
            (key) => (
              <NotificationToggle
                key={key}
                enabled={notificationSettings.push[key]}
                label={pushLabels[key]}
                onToggle={() => onTogglePush(key)}
              />
            )
          )}
        </div>
      </div>

      {/* Quiet hours */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">Heures calmes</h2>
            <p className="text-sm text-gray-500">
              Désactiver les notifications pendant certaines heures
            </p>
          </div>
          <button
            onClick={onToggleQuietHours}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              notificationSettings.quietHours.enabled ? 'bg-[#1B998B]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                notificationSettings.quietHours.enabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
        {notificationSettings.quietHours.enabled && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-500 mb-1">De</label>
              <select
                value={notificationSettings.quietHours.startTime}
                onChange={(e) => onUpdateQuietHours(e.target.value, undefined)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20"
              >
                {quietHoursOptions.map((time) => (
                  <option key={`start-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-500 mb-1">À</label>
              <select
                value={notificationSettings.quietHours.endTime}
                onChange={(e) => onUpdateQuietHours(undefined, e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20"
              >
                {quietHoursOptions.map((time) => (
                  <option key={`end-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsSection;
