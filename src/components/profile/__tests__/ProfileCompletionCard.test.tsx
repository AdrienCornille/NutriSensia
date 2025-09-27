/**
 * Tests pour le composant ProfileCompletionCard
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileCompletionCard } from '../ProfileCompletionCard';

// Mock de Framer Motion pour éviter les problèmes de test
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>
  },
  AnimatePresence: ({ children }: any) => children
}));

// Wrapper avec QueryClient pour les tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ProfileCompletionCard', () => {
  const mockProfileData = {
    first_name: 'Marie',
    last_name: 'Dubois',
    phone: '+41 79 123 45 67'
  };
  
  const mockOnEditProfile = jest.fn();
  
  beforeEach(() => {
    mockOnEditProfile.mockClear();
  });
  
  test('devrait afficher le pourcentage de complétude', async () => {
    render(
      <ProfileCompletionCard
        profileData={mockProfileData}
        role="nutritionist"
        onEditProfile={mockOnEditProfile}
      />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/complété/)).toBeInTheDocument();
    });
  });
  
  test('devrait afficher le niveau de complétude', async () => {
    render(
      <ProfileCompletionCard
        profileData={mockProfileData}
        role="nutritionist"
        onEditProfile={mockOnEditProfile}
      />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Incomplet|Basique|Bien|Excellent/)).toBeInTheDocument();
    });
  });
  
  test('devrait appeler onEditProfile quand le bouton est cliqué', async () => {
    const user = userEvent.setup();
    
    render(
      <ProfileCompletionCard
        profileData={mockProfileData}
        role="nutritionist"
        onEditProfile={mockOnEditProfile}
      />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      const button = screen.getByText(/Compléter mon profil/);
      expect(button).toBeInTheDocument();
    });
    
    const button = screen.getByText(/Compléter mon profil/);
    await user.click(button);
    
    expect(mockOnEditProfile).toHaveBeenCalledTimes(1);
  });
  
  test('devrait afficher les recommandations', async () => {
    render(
      <ProfileCompletionCard
        profileData={mockProfileData}
        role="nutritionist"
        onEditProfile={mockOnEditProfile}
      />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Recommandations/)).toBeInTheDocument();
    });
  });
  
  test('devrait afficher le mode compact correctement', async () => {
    render(
      <ProfileCompletionCard
        profileData={mockProfileData}
        role="nutritionist"
        onEditProfile={mockOnEditProfile}
        compact={true}
      />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/complété/)).toBeInTheDocument();
    });
    
    // En mode compact, certains éléments ne devraient pas être visibles
    expect(screen.queryByText(/Recommandations/)).not.toBeInTheDocument();
  });
  
  test('devrait afficher un état de chargement', () => {
    render(
      <ProfileCompletionCard
        profileData={{}}
        role="nutritionist"
        onEditProfile={mockOnEditProfile}
      />,
      { wrapper: createWrapper() }
    );
    
    // Devrait afficher un skeleton loader
    expect(screen.getByText(/Aucune donnée de profil disponible/)).toBeInTheDocument();
  });
  
  test('devrait gérer les différents rôles utilisateur', async () => {
    const { rerender } = render(
      <ProfileCompletionCard
        profileData={mockProfileData}
        role="nutritionist"
        onEditProfile={mockOnEditProfile}
      />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/visibilité professionnelle/)).toBeInTheDocument();
    });
    
    rerender(
      <ProfileCompletionCard
        profileData={mockProfileData}
        role="patient"
        onEditProfile={mockOnEditProfile}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/suivi nutritionnel/)).toBeInTheDocument();
    });
  });
});



