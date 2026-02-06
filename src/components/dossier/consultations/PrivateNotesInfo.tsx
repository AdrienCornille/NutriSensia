'use client';

import React from 'react';

export function PrivateNotesInfo() {
  return (
    <div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
      <div className='flex items-start gap-4'>
        <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
          <span className='text-2xl'>🔒</span>
        </div>
        <div>
          <h3 className='font-semibold text-gray-800'>Notes privées</h3>
          <p className='text-sm text-gray-600 mt-1'>
            Votre nutritionniste peut prendre des notes privées pendant les
            consultations. Seuls les résumés et points clés partagés
            apparaissent ici.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivateNotesInfo;
