'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ProfilePDFExportProps {
  profileId: string;
}

export function ProfilePDFExport({ profileId }: ProfilePDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/protected/dossier/nutritional-profile/export?profileId=${encodeURIComponent(profileId)}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur lors de l\'export');
      }

      const data = await response.json();

      // Download as JSON file (actual PDF generation deferred)
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profil-nutritionnel-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de l\'export'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Exporter en PDF"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Export...
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            Exporter
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}

export default ProfilePDFExport;
