'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import type { Nutritionist, NutritionistStatus } from '@/types/messaging';
import { nutritionistStatusConfig, formatLastSeen } from '@/types/messaging';
import { useUserPresence } from '@/hooks/useConversations';

interface MessagingHeaderProps {
  nutritionist: Nutritionist;
  /** Role of the other participant (the person displayed in the header) */
  participantRole?: 'nutritionist' | 'patient';
  /** Optional: extra actions to render on the right side (e.g., export button) */
  actions?: React.ReactNode;
}

export function MessagingHeader({
  nutritionist,
  participantRole = 'nutritionist',
  actions,
}: MessagingHeaderProps) {
  // Fetch real presence data for the other participant
  const { data: presenceData } = useUserPresence(
    nutritionist.id,
    participantRole
  );

  // Use real presence data if available, otherwise fall back to prop
  const currentStatus: NutritionistStatus =
    presenceData?.status || nutritionist.status;
  const lastSeen = presenceData?.last_seen_at
    ? new Date(presenceData.last_seen_at)
    : nutritionist.lastSeen;
  const avgResponseTime = presenceData?.avg_response_time_minutes;

  const statusConfig = nutritionistStatusConfig[currentStatus];

  const formatResponseTime = (minutes: number): string => {
    if (minutes < 60) return `~${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? '~1h' : `~${hours}h`;
  };

  return (
    <header className='bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4 sticky top-0 z-10'>
      {/* Avatar */}
      <div className='relative'>
        {nutritionist.avatarUrl ? (
          <img
            src={nutritionist.avatarUrl}
            alt={nutritionist.name}
            className='w-10 h-10 rounded-full object-cover'
          />
        ) : (
          <div className='w-10 h-10 bg-[#1B998B] rounded-full flex items-center justify-center text-white font-medium text-sm'>
            {nutritionist.initials}
          </div>
        )}
        {/* Status indicator */}
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusConfig.dotColor}`}
          aria-label={statusConfig.label}
        />
      </div>

      {/* Info */}
      <div className='flex-1 min-w-0'>
        <h1 className='text-base font-semibold text-gray-800 truncate'>
          {nutritionist.name}
        </h1>
        <div className='flex items-center gap-2'>
          <p className={`text-xs ${statusConfig.textColor}`}>
            {currentStatus === 'online'
              ? statusConfig.label
              : lastSeen
                ? formatLastSeen(lastSeen)
                : statusConfig.label}
          </p>
          {avgResponseTime && currentStatus !== 'online' && (
            <span className='flex items-center gap-0.5 text-xs text-gray-400'>
              <Clock className='w-3 h-3' />
              {formatResponseTime(avgResponseTime)}
            </span>
          )}
        </div>
      </div>

      {/* Optional actions */}
      {actions && <div className='flex items-center gap-2'>{actions}</div>}
    </header>
  );
}

export default MessagingHeader;
