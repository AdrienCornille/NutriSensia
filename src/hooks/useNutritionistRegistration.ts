import { useState, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';
import type { NutritionistRegistrationData } from '@/types/nutritionist-registration';

interface UseNutritionistRegistrationReturn {
  isSubmitting: boolean;
  error: string | null;
  submitRegistration: (data: NutritionistRegistrationData) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Hook pour gérer la soumission de l'inscription nutritionniste
 * @see AUTH-008, AUTH-009 dans USER_STORIES.md
 */
export function useNutritionistRegistration(): UseNutritionistRegistrationReturn {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitRegistration = useCallback(
    async (data: NutritionistRegistrationData): Promise<boolean> => {
      try {
        setIsSubmitting(true);
        setError(null);

        // 1. Créer le compte utilisateur avec Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: data.personalInfo.email,
            password: data.personalInfo.password,
            options: {
              data: {
                first_name: data.personalInfo.firstName,
                last_name: data.personalInfo.lastName,
                full_name: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
                phone: data.personalInfo.phone,
                role: 'nutritionist',
              },
            },
          }
        );

        if (authError) {
          if (authError.message.includes('already registered')) {
            throw new Error(
              'Un compte existe déjà avec cet email. Veuillez vous connecter.'
            );
          }
          throw new Error(
            `Erreur lors de la création du compte: ${authError.message}`
          );
        }

        if (!authData.user) {
          throw new Error('Erreur lors de la création du compte utilisateur');
        }

        const userId = authData.user.id;

        // 2. Créer le profil dans la table profiles
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: userId,
          email: data.personalInfo.email,
          full_name: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
          role: 'nutritionist',
          phone: data.personalInfo.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error('Erreur création profil:', profileError);
          // Ne pas bloquer, le profil peut être créé par un trigger
        }

        // 3. Créer le profil nutritionniste
        const { error: nutritionistError } = await supabase
          .from('nutritionist_profiles')
          .insert({
            user_id: userId,
            first_name: data.personalInfo.firstName,
            last_name: data.personalInfo.lastName,
            phone: data.personalInfo.phone,
            asca_number: data.professionalInfo.ascaNumber || null,
            rme_number: data.professionalInfo.rmeNumber || null,
            specializations: data.professionalInfo.specializations,
            years_of_experience: data.professionalInfo.yearsOfExperience,
            languages: data.professionalInfo.languages,
            bio: data.professionalInfo.bio || null,
            practice_address: data.professionalInfo.cabinetAddress || null,
            status: 'pending',
            is_active: false,
            verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (nutritionistError) {
          throw new Error(
            `Erreur lors de la création du profil nutritionniste: ${nutritionistError.message}`
          );
        }

        // 4. Enregistrer les documents dans la table nutritionist_documents
        const documentsToSave = [];

        if (data.documents.ascaCertificate) {
          documentsToSave.push({
            nutritionist_id: userId,
            type: 'asca_certificate',
            file_name: data.documents.ascaCertificate.fileName,
            file_url: data.documents.ascaCertificate.fileUrl,
            file_size: data.documents.ascaCertificate.fileSize,
            mime_type: data.documents.ascaCertificate.mimeType,
          });
        }

        if (data.documents.rmeCertificate) {
          documentsToSave.push({
            nutritionist_id: userId,
            type: 'rme_certificate',
            file_name: data.documents.rmeCertificate.fileName,
            file_url: data.documents.rmeCertificate.fileUrl,
            file_size: data.documents.rmeCertificate.fileSize,
            mime_type: data.documents.rmeCertificate.mimeType,
          });
        }

        if (data.documents.diploma) {
          documentsToSave.push({
            nutritionist_id: userId,
            type: 'diploma',
            file_name: data.documents.diploma.fileName,
            file_url: data.documents.diploma.fileUrl,
            file_size: data.documents.diploma.fileSize,
            mime_type: data.documents.diploma.mimeType,
          });
        }

        if (data.documents.photo) {
          documentsToSave.push({
            nutritionist_id: userId,
            type: 'photo',
            file_name: data.documents.photo.fileName,
            file_url: data.documents.photo.fileUrl,
            file_size: data.documents.photo.fileSize,
            mime_type: data.documents.photo.mimeType,
          });
        }

        if (documentsToSave.length > 0) {
          const { error: docsError } = await supabase
            .from('nutritionist_documents')
            .insert(documentsToSave);

          if (docsError) {
            console.error('Erreur enregistrement documents:', docsError);
            // Ne pas bloquer la soumission si l'enregistrement échoue
          }
        }

        // 5. Rediriger vers la page d'attente
        router.push('/inscription/nutritionniste/en-attente');

        return true;
      } catch (err: any) {
        console.error('Erreur inscription nutritionniste:', err);
        setError(
          err.message || "Une erreur s'est produite lors de l'inscription"
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [router]
  );

  return {
    isSubmitting,
    error,
    submitRegistration,
    clearError,
  };
}

export default useNutritionistRegistration;
