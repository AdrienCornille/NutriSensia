/**
 * React Query hooks for Nutritionist Statistics (CONSULT-007)
 */
import { useQuery } from '@tanstack/react-query';
import type { ConsultationStatistics } from '@/types/nutritionist-dossier';

// ============================================================================
// Helpers
// ============================================================================

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erreur serveur');
  return json.data;
}

// ============================================================================
// Query Keys
// ============================================================================

export const statisticsKeys = {
  all: ['nutritionist-statistics'] as const,
  consultations: (month?: string) =>
    [...statisticsKeys.all, 'consultations', month || 'current'] as const,
};

// ============================================================================
// Hooks
// ============================================================================

export function useConsultationStatistics(month?: string) {
  const url = month
    ? `/api/protected/nutritionist/statistics/consultations?month=${month}`
    : '/api/protected/nutritionist/statistics/consultations';

  return useQuery<ConsultationStatistics, Error>({
    queryKey: statisticsKeys.consultations(month),
    queryFn: () => fetchJSON<ConsultationStatistics>(url),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
