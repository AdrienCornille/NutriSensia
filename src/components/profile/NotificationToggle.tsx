'use client';

import React from 'react';

interface NotificationToggleProps {
  enabled: boolean;
  label: string;
  onToggle: () => void;
}

export function NotificationToggle({ enabled, label, onToggle }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-700">{label}</span>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-colors ${
          enabled ? 'bg-[#1B998B]' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            enabled ? 'right-1' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

export default NotificationToggle;
