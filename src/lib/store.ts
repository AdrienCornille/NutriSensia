import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types pour l'utilisateur
interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    dietaryRestrictions: string[];
    allergies: string[];
    goals: string[];
  } | null;
}

// Types pour les rôles
export type UserRole = 'patient' | 'nutritionist' | 'admin' | null;
export type NutritionistStatus =
  | 'pending'
  | 'active'
  | 'rejected'
  | 'info_required'
  | 'suspended'
  | null;

// Types pour l'état de l'application
interface AppState {
  // État de l'utilisateur
  user: User | null;
  isAuthenticated: boolean;

  // Rôle et statut (AUTH-012)
  role: UserRole;
  nutritionistStatus: NutritionistStatus;

  // État de l'interface
  isLoading: boolean;
  theme: 'light' | 'dark';

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setRole: (role: UserRole) => void;
  setNutritionistStatus: (status: NutritionistStatus) => void;
  setLoading: (isLoading: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  logout: () => void;
}

// Store principal de l'application
export const useAppStore = create<AppState>()(
  persist(
    set => ({
      // État initial
      user: null,
      isAuthenticated: false,
      role: null,
      nutritionistStatus: null,
      isLoading: false,
      theme: 'light',

      // Actions
      setUser: user => set({ user, isAuthenticated: !!user }),
      setAuthenticated: isAuthenticated => set({ isAuthenticated }),
      setRole: role => set({ role }),
      setNutritionistStatus: nutritionistStatus => set({ nutritionistStatus }),
      setLoading: isLoading => set({ isLoading }),
      setTheme: theme => set({ theme }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          role: null,
          nutritionistStatus: null,
        }),
    }),
    {
      name: 'nutrisensia-store', // Nom du stockage local
      partialize: state => ({
        // Ne persister que certains champs
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        nutritionistStatus: state.nutritionistStatus,
        theme: state.theme,
      }),
    }
  )
);
