'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, MoreVertical } from 'lucide-react';
import type { ActivityEntry } from '@/types/suivi';
import {
  formatSuiviDate,
  activityTypeConfig,
  intensityConfig,
} from '@/types/suivi';

interface ActivityHistoryProps {
  activities: ActivityEntry[];
  onEdit?: (activity: ActivityEntry) => void;
  onDelete?: (activityId: string) => void;
}

export function ActivityHistory({
  activities,
  onEdit,
  onDelete,
}: ActivityHistoryProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleMenuToggle = (id: string) => {
    setMenuOpenId(menuOpenId === id ? null : id);
  };

  const handleEdit = (activity: ActivityEntry) => {
    setMenuOpenId(null);
    onEdit?.(activity);
  };

  const handleDeleteClick = (id: string) => {
    setMenuOpenId(null);
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = (id: string) => {
    onDelete?.(id);
    setDeleteConfirmId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  if (activities.length === 0) {
    return (
      <div className='bg-white rounded-xl p-6 border border-gray-200'>
        <h2 className='font-semibold text-gray-800 mb-4'>Activités récentes</h2>
        <div className='text-center py-8 text-gray-500'>
          <p>Aucune activité enregistrée</p>
          <p className='text-sm mt-1'>
            Sélectionnez une activité ci-dessus pour commencer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <h2 className='font-semibold text-gray-800 mb-4'>Activités récentes</h2>
      <div className='divide-y divide-gray-200'>
        {activities.map(activity => {
          const typeConfig = activityTypeConfig[activity.type];
          const intensityConf = intensityConfig[activity.intensity];
          const isDeleting = deleteConfirmId === activity.id;

          return (
            <div
              key={activity.id}
              className={`py-4 first:pt-0 last:pb-0 transition-colors ${
                isDeleting ? 'bg-red-50 -mx-6 px-6' : ''
              }`}
            >
              {isDeleting ? (
                // Confirmation de suppression
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <span className='text-red-600'>🗑️</span>
                    <p className='text-sm text-gray-700'>
                      Supprimer cette activité ({activity.typeName}) ?
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={handleDeleteCancel}
                      className='px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(activity.id)}
                      className='px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors'
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                // Affichage normal
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-[#1B998B]/10 rounded-xl flex items-center justify-center'>
                      <span className='text-xl'>{typeConfig.icon}</span>
                    </div>
                    <div>
                      <p className='font-medium text-gray-800'>
                        {activity.typeName}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {formatSuiviDate(activity.date)} 2026
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-4 md:gap-6'>
                    <div className='text-center hidden sm:block'>
                      <p className='text-xs text-gray-500'>Durée</p>
                      <p className='font-medium text-gray-800'>
                        {activity.duration} min
                      </p>
                    </div>
                    <div className='text-center hidden sm:block'>
                      <p className='text-xs text-gray-500'>Intensité</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${intensityConf.bgColor} ${intensityConf.textColor}`}
                      >
                        {intensityConf.label}
                      </span>
                    </div>
                    <div className='text-center'>
                      <p className='text-xs text-gray-500'>Calories</p>
                      <p className='font-medium text-amber-600'>
                        {activity.calories}
                      </p>
                    </div>

                    {/* Menu actions */}
                    {(onEdit || onDelete) && (
                      <div className='relative'>
                        <button
                          onClick={() => handleMenuToggle(activity.id)}
                          className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors'
                          aria-label='Actions'
                        >
                          <MoreVertical className='w-5 h-5' />
                        </button>

                        {menuOpenId === activity.id && (
                          <>
                            {/* Overlay pour fermer le menu */}
                            <div
                              className='fixed inset-0 z-10'
                              onClick={() => setMenuOpenId(null)}
                            />
                            {/* Menu dropdown */}
                            <div className='absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]'>
                              {onEdit && (
                                <button
                                  onClick={() => handleEdit(activity)}
                                  className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'
                                >
                                  <Pencil className='w-4 h-4' />
                                  Modifier
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => handleDeleteClick(activity.id)}
                                  className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2'
                                >
                                  <Trash2 className='w-4 h-4' />
                                  Supprimer
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityHistory;
