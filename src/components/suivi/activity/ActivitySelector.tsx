'use client';

import React from 'react';
import type { ActivityType } from '@/types/suivi';
import { activityTypeConfig } from '@/types/suivi';
import { activityOptions } from '@/data/mock-suivi';

interface ActivitySelectorProps {
  onSelectActivity: (type: ActivityType) => void;
}

export function ActivitySelector({ onSelectActivity }: ActivitySelectorProps) {
  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h2 className='font-semibold text-gray-800 mb-4'>
        Enregistrer une activité
      </h2>
      <div className='grid grid-cols-3 gap-4'>
        {activityOptions.map(activity => {
          const config = activityTypeConfig[activity.type];
          return (
            <button
              key={activity.type}
              onClick={() => onSelectActivity(activity.type)}
              className={`p-4 rounded-xl ${config.bgColor} ${config.textColor} hover:opacity-80 transition-opacity`}
            >
              <span className='text-2xl'>{activity.icon}</span>
              <p className='text-sm font-medium mt-2'>{activity.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ActivitySelector;
