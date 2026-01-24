'use client';

import React from 'react';

export function AnamneseReadOnlyAlert() {
  return (
    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
      <div className="flex items-start gap-3">
        <span className="text-amber-500">ℹ️</span>
        <div>
          <p className="text-sm font-medium text-amber-800">Document en lecture seule</p>
          <p className="text-sm text-amber-700 mt-1">
            Ce document a été validé par votre nutritionniste. Si des informations ont changé,
            signalez-le via la messagerie.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AnamneseReadOnlyAlert;
