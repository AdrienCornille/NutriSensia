'use client';

import React, { ReactNode } from 'react';
import { useAuth, usePermissions } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Types pour les props du AuthGuard
interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'nutritionist' | 'patient' | 'admin';
  requiredRoles?: ('nutritionist' | 'patient' | 'admin')[];
  fallback?: ReactNode;
  redirectTo?: string;
}

// Composant de chargement
const LoadingSpinner = () => (
  <div className='flex items-center justify-center min-h-screen'>
    <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600'></div>
  </div>
);

// Composant d'erreur d'authentification
const AuthError = ({ message }: { message: string }) => (
  <div className='flex items-center justify-center min-h-screen'>
    <div className='text-center'>
      <h2 className='text-2xl font-bold text-red-600 mb-4'>Accès refusé</h2>
      <p className='text-gray-600'>{message}</p>
    </div>
  </div>
);

/**
 * Composant AuthGuard pour protéger les routes côté client
 * Vérifie l'authentification et les rôles
 */
export function AuthGuard({
  children,
  requiredRole,
  requiredRoles,
  fallback,
  redirectTo = '/auth/signin',
}: AuthGuardProps) {
  const { user, loading, initialized, isAuthenticated } = useAuth();
  const { hasRole, hasAnyRole } = usePermissions();
  const router = useRouter();

  // Redirection si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [initialized, loading, isAuthenticated, router, redirectTo]);

  // Vérification des rôles requis
  const checkRoleAccess = () => {
    if (requiredRole) {
      return hasRole(requiredRole);
    }
    if (requiredRoles) {
      return hasAnyRole(requiredRoles);
    }
    return true;
  };

  // Affichage du chargement
  if (loading || !initialized) {
    return fallback || <LoadingSpinner />;
  }

  // Vérification de l'authentification
  if (!isAuthenticated) {
    return (
      fallback || (
        <AuthError message='Vous devez être connecté pour accéder à cette page.' />
      )
    );
  }

  // Vérification des rôles
  if (!checkRoleAccess()) {
    return (
      fallback || (
        <AuthError
          message={`Vous n'avez pas les permissions nécessaires pour accéder à cette page. Rôle requis: ${requiredRole || requiredRoles?.join(', ')}`}
        />
      )
    );
  }

  // Si toutes les vérifications sont passées, afficher le contenu
  return <>{children}</>;
}

/**
 * Composant pour protéger les routes admin
 */
export function AdminGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard requiredRole='admin' fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

/**
 * Composant pour protéger les routes nutritionniste
 */
export function NutritionistGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard requiredRole='nutritionist' fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

/**
 * Composant pour protéger les routes patient
 */
export function PatientGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard requiredRole='patient' fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

/**
 * Hook pour vérifier l'accès à une route
 */
export function useRouteAccess() {
  const { user, isAuthenticated, loading } = useAuth();
  const { hasRole, hasAnyRole } = usePermissions();

  const canAccess = (
    requiredRole?: 'nutritionist' | 'patient' | 'admin',
    requiredRoles?: ('nutritionist' | 'patient' | 'admin')[]
  ) => {
    if (loading || !isAuthenticated || !user) {
      return false;
    }

    // Vérification des rôles
    if (requiredRole && !hasRole(requiredRole)) {
      return false;
    }

    if (requiredRoles && !hasAnyRole(requiredRoles)) {
      return false;
    }

    return true;
  };

  return {
    canAccess,
    isAuthenticated,
    loading,
    user,
  };
}
