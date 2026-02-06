'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export function PreferencesCard() {
  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center'>
            <Settings className='w-6 h-6 text-gray-600' />
          </div>
          <div>
            <p className='font-medium text-gray-800'>Gérer mes préférences</p>
            <p className='text-sm text-gray-500'>
              Choisissez quelles notifications recevoir
            </p>
          </div>
        </div>
        <Link
          href='/dashboard/profil?tab=notifications'
          className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
        >
          Paramètres
        </Link>
      </div>
    </div>
  );
}

export default PreferencesCard;
