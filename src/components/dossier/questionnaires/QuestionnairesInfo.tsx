'use client';

import React from 'react';

export function QuestionnairesInfo() {
  return (
    <div className='bg-blue-50 rounded-xl p-6 border border-blue-100'>
      <div className='flex items-start gap-4'>
        <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
          <span className='text-2xl'>💡</span>
        </div>
        <div>
          <h3 className='font-semibold text-blue-800'>Bon à savoir</h3>
          <p className='text-sm text-blue-700 mt-1'>
            Les questionnaires de suivi sont remplis ensemble lors de vos
            consultations. Vous ne pouvez pas les modifier après validation,
            mais vous pouvez les consulter à tout moment.
          </p>
        </div>
      </div>
    </div>
  );
}

export default QuestionnairesInfo;
