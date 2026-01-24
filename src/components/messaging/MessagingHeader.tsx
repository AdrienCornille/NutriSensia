'use client';

import React from 'react';
import type { Nutritionist } from '@/types/messaging';
import { nutritionistStatusConfig, formatLastSeen } from '@/types/messaging';

interface MessagingHeaderProps {
  nutritionist: Nutritionist;
}

export function MessagingHeader({ nutritionist }: MessagingHeaderProps) {
  const statusConfig = nutritionistStatusConfig[nutritionist.status];

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
      {/* Nutritionist avatar */}
      <div className="relative">
        <div className="w-10 h-10 bg-[#1B998B] rounded-full flex items-center justify-center text-white font-medium text-sm">
          {nutritionist.initials}
        </div>
        {/* Status indicator - MSG-008 */}
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusConfig.dotColor}`}
          aria-label={statusConfig.label}
        />
      </div>

      {/* Nutritionist info */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-gray-800 truncate">
          {nutritionist.name}
        </h1>
        <p className={`text-xs ${statusConfig.textColor}`}>
          {nutritionist.status === 'online'
            ? statusConfig.label
            : nutritionist.lastSeen
              ? formatLastSeen(nutritionist.lastSeen)
              : statusConfig.label}
        </p>
      </div>
    </header>
  );
}

export default MessagingHeader;
