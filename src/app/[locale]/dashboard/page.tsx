'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

/**
 * Dashboard redirect page
 * Redirects users to their appropriate dashboard based on role
 *
 * - Patient → /dashboard/patient
 * - Nutritionist (active) → /dashboard/nutritionist
 * - Nutritionist (pending) → /inscription/nutritionniste/en-attente
 * - Nutritionist (rejected) → /inscription/nutritionniste/rejete
 * - Admin → /admin
 */
export default function DashboardRedirectPage() {
  const router = useRouter();
  const {
    role,
    isActiveNutritionist,
    isPendingNutritionist,
    isRejectedNutritionist,
    isInfoRequiredNutritionist,
    isLoading,
  } = useUserRole();

  useEffect(() => {
    if (isLoading) return;

    // Redirect based on role
    if (role === 'patient') {
      router.replace('/dashboard/patient');
    } else if (role === 'nutritionist') {
      if (isActiveNutritionist) {
        router.replace('/dashboard/nutritionist');
      } else if (isPendingNutritionist) {
        router.replace('/inscription/nutritionniste/en-attente');
      } else if (isRejectedNutritionist) {
        router.replace('/inscription/nutritionniste/rejete');
      } else if (isInfoRequiredNutritionist) {
        router.replace('/inscription/nutritionniste/info-requise');
      } else {
        // Default for unknown status
        router.replace('/inscription/nutritionniste/en-attente');
      }
    } else if (role === 'admin') {
      router.replace('/admin');
    } else {
      // Default to patient if no role (shouldn't happen with AuthGuard)
      router.replace('/dashboard/patient');
    }
  }, [
    role,
    isActiveNutritionist,
    isPendingNutritionist,
    isRejectedNutritionist,
    isInfoRequiredNutritionist,
    isLoading,
    router,
  ]);

  // Show loading while determining role
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='text-center'>
        <Loader2 className='w-8 h-8 animate-spin text-[#1B998B] mx-auto mb-4' />
        <p className='text-gray-600'>Redirection en cours...</p>
      </div>
    </div>
  );
}
