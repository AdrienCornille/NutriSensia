'use client';

import React from 'react';

interface ObjectivesOverviewProps {
  globalProgress: number;
}

export function ObjectivesOverview({ globalProgress }: ObjectivesOverviewProps) {
  return (
    <div className="bg-gradient-to-r from-[#1B998B] to-teal-500 rounded-xl p-6 text-white">
      <h2 className="font-semibold text-lg mb-2">Votre progression globale</h2>
      <p className="text-white/80">
        Vous avez atteint <span className="font-bold text-white">{globalProgress}%</span> de votre
        objectif principal. Continuez ainsi !
      </p>
      <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${globalProgress}%` }}
        />
      </div>
    </div>
  );
}

export default ObjectivesOverview;
