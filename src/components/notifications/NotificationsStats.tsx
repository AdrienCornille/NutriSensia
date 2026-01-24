'use client';

import React from 'react';

interface NotificationsStatsProps {
  messages: number;
  achievements: number;
  reminders: number;
}

export function NotificationsStats({ messages, achievements, reminders }: NotificationsStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
        <p className="text-2xl font-bold text-gray-800">{messages}</p>
        <p className="text-sm text-gray-500">Messages</p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
        <p className="text-2xl font-bold text-gray-800">{achievements}</p>
        <p className="text-sm text-gray-500">Récompenses</p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
        <p className="text-2xl font-bold text-gray-800">{reminders}</p>
        <p className="text-sm text-gray-500">Rappels</p>
      </div>
    </div>
  );
}

export default NotificationsStats;
