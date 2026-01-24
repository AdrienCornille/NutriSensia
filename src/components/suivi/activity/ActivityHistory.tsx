'use client';

import React from 'react';
import type { ActivityEntry } from '@/types/suivi';
import { formatSuiviDate, activityTypeConfig, intensityConfig } from '@/types/suivi';

interface ActivityHistoryProps {
  activities: ActivityEntry[];
}

export function ActivityHistory({ activities }: ActivityHistoryProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="font-semibold text-gray-800 mb-4">Activités récentes</h2>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => {
          const typeConfig = activityTypeConfig[activity.type];
          const intensityConf = intensityConfig[activity.intensity];

          return (
            <div
              key={activity.id}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1B998B]/10 rounded-xl flex items-center justify-center">
                  <span className="text-xl">{typeConfig.icon}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{activity.typeName}</p>
                  <p className="text-sm text-gray-500">
                    {formatSuiviDate(activity.date)} 2026
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Durée</p>
                  <p className="font-medium text-gray-800">{activity.duration} min</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Intensité</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${intensityConf.bgColor} ${intensityConf.textColor}`}
                  >
                    {intensityConf.label}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Calories</p>
                  <p className="font-medium text-amber-600">{activity.calories}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityHistory;
