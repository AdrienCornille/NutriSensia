'use client';

import { AuthenticatedProfileForm } from '@/components/forms/AuthenticatedProfileForm';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/ui/Notification';

export default function EditProfilePage() {
  const router = useRouter();
  const { showSuccess, showError } = useNotification();

  const handleSave = async (data: any) => {
    try {
      // Logique personnalisée après la sauvegarde Supabase
      console.log('Données sauvegardées dans Supabase:', data);
      
      // Ici vous pouvez ajouter une logique personnalisée si nécessaire
      // Par exemple, envoyer des notifications, mettre à jour d'autres services, etc.
      
      // Afficher un message de succès
      showSuccess('Profil mis à jour !', 'Vos modifications ont été sauvegardées avec succès dans Supabase.');
      
      // Rediriger vers la page de profil
      router.push('/profile');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Erreur de sauvegarde', 'Une erreur est survenue lors de la mise à jour du profil');
      throw error; // Re-lancer l'erreur pour que le formulaire la gère
    }
  };

  const handleCancel = () => {
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedProfileForm
        onSave={handleSave}
        onCancel={handleCancel}
        redirectAfterSave="/profile"
      />
    </div>
  );
}
