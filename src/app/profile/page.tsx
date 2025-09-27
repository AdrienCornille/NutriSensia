'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Vérifier l'authentification
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError('Aucune session détectée');
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError('Utilisateur non trouvé');
          return;
        }

        setUser(user);

        // Charger le profil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profil n'existe pas, le créer
            const newProfile = {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || null,
              role: user.user_metadata?.role || 'patient',
              avatar_url: user.user_metadata?.avatar_url || null,
              phone: user.user_metadata?.phone || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              email_verified: user.email_confirmed_at ? true : false,
              two_factor_enabled: false,
              last_sign_in_at: user.last_sign_in_at,
            };

            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();

            if (createError) {
              setError(`Erreur création profil: ${createError.message}`);
              return;
            }

            setProfile(createdProfile);
          } else {
            setError(`Erreur chargement profil: ${profileError.message}`);
            return;
          }
        } else {
          setProfile(profileData);
        }
      } catch (err: any) {
        console.error('Erreur:', err);
        setError(err.message || 'Erreur inattendue');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /**
   * Gère le succès du téléchargement d'avatar
   */
  const handleAvatarUploadSuccess = async (url: string) => {
    try {
      // Debug: vérifier l'authentification
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log('User authenticated:', user?.id);
      console.log('Profile ID:', profile?.id);

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({ avatar_url: url, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        alert("Erreur lors de la mise à jour de l'avatar");
        return;
      }

      setProfile(updatedProfile);
      setIsEditingAvatar(false);
      alert('Avatar mis à jour avec succès');
    } catch (err: any) {
      console.error('Error in handleAvatarUploadSuccess:', err);
      alert(`Erreur: ${err.message}`);
    }
  };

  /**
   * Gère la suppression de l'avatar
   */
  const handleAvatarDelete = async () => {
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        alert("Erreur lors de la suppression de l'avatar");
        return;
      }

      setProfile(updatedProfile);
      alert('Avatar supprimé avec succès');
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  /**
   * Affiche le contenu de chargement
   */
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
        <div className='container mx-auto max-w-4xl py-8'>
          <div className='text-center mb-8'>
            <div className='h-8 bg-gray-200 rounded animate-pulse mb-2' />
            <div className='h-4 bg-gray-200 rounded animate-pulse w-64 mx-auto' />
          </div>
          <div className='grid md:grid-cols-2 gap-6'>
            <Card className='p-6'>
              <div className='h-6 bg-gray-200 rounded animate-pulse mb-4' />
              <div className='space-y-4'>
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div className='h-4 bg-gray-200 rounded animate-pulse mb-1' />
                    <div className='h-3 bg-gray-200 rounded animate-pulse' />
                  </div>
                ))}
              </div>
            </Card>
            <Card className='p-6'>
              <div className='h-6 bg-gray-200 rounded animate-pulse mb-4' />
              <div className='space-y-4'>
                <div className='h-4 bg-gray-200 rounded animate-pulse' />
                <div className='h-10 bg-gray-200 rounded animate-pulse' />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Affiche l'erreur
   */
  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
        <div className='container mx-auto max-w-4xl py-8'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-red-600 mb-4'>
              Erreur de chargement
            </h1>
            <p className='text-gray-600 mb-6'>{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='container mx-auto max-w-4xl py-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Profil Utilisateur
          </h1>
          <p className='text-gray-600'>
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          {/* Informations personnelles */}
          <Card className='p-6'>
            <CardHeader>
              <h2 className='text-xl font-semibold mb-4'>
                Informations personnelles
              </h2>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Avatar */}
                <div className='flex items-center space-x-4 mb-6'>
                  <Avatar
                    src={profile?.avatar_url}
                    name={profile?.full_name}
                    email={profile?.email}
                    size='xl'
                    clickable
                    onClick={() => setIsEditingAvatar(true)}
                  />
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      Photo de profil
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Cliquez sur l'avatar pour le modifier
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Email
                  </label>
                  <p className='text-gray-900'>{profile?.email}</p>
                </div>

                {/* Nom */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Nom complet
                  </label>
                  <p className='text-gray-900'>
                    {profile?.full_name || 'Non renseigné'}
                  </p>
                </div>

                {/* Rôle */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Rôle
                  </label>
                  <p className='text-gray-900 capitalize'>
                    {profile?.role === 'nutritionist'
                      ? 'Nutritionniste'
                      : profile?.role === 'patient'
                        ? 'Patient'
                        : profile?.role === 'admin'
                          ? 'Administrateur'
                          : profile?.role}
                  </p>
                </div>

                {/* Téléphone */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Téléphone
                  </label>
                  <p className='text-gray-900'>
                    {profile?.phone || 'Non renseigné'}
                  </p>
                </div>

                {/* Date de création */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Membre depuis
                  </label>
                  <p className='text-gray-900'>
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString(
                          'fr-FR',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )
                      : 'Date inconnue'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sécurité et Avatar Upload */}
          <div className='space-y-6'>
            {/* Sécurité */}
            <Card className='p-6'>
              <CardHeader>
                <h2 className='text-xl font-semibold mb-4'>Sécurité</h2>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium text-gray-900'>
                        Authentification 2FA
                      </p>
                      <p className='text-sm text-gray-600'>
                        Protection supplémentaire de votre compte
                      </p>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        profile?.two_factor_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {profile?.two_factor_enabled ? 'Activée' : 'Désactivée'}
                    </span>
                  </div>
                  <Button variant='outline' className='w-full'>
                    Gérer la 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upload d'avatar */}
            {isEditingAvatar && (
              <Card className='p-6'>
                <CardHeader>
                  <h2 className='text-xl font-semibold mb-4'>
                    Modifier la photo de profil
                  </h2>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    currentImageUrl={profile?.avatar_url}
                    bucketName='avatars'
                    path={`users/${profile?.id}`}
                    onUploadSuccess={handleAvatarUploadSuccess}
                    onUploadError={error =>
                      alert(`Erreur de téléchargement: ${error}`)
                    }
                    onDelete={handleAvatarDelete}
                    dropText='Glissez-déposez votre photo de profil ici'
                    maxFileSize={5 * 1024 * 1024} // 5MB
                    maxWidth={400}
                    maxHeight={400}
                    quality={85}
                  />
                  <div className='mt-4 text-center'>
                    <Button
                      variant='outline'
                      onClick={() => setIsEditingAvatar(false)}
                      className='w-full'
                    >
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className='mt-8 text-center space-x-4'>
          <Link href='/profile/edit'>
            <Button>Modifier le profil</Button>
          </Link>
          <Link href='/profile/authenticated-test'>
            <Button variant='secondary'>Test Formulaire Authentifié</Button>
          </Link>
          <Link href='/profile/supabase-test'>
            <Button variant='secondary'>Test Sauvegarde Supabase</Button>
          </Link>
          <Link href='/auth-test'>
            <Button variant='outline'>Test Auth</Button>
          </Link>
          <Link href='/test-conversion'>
            <Button variant='outline'>Test Conversion Tarifs</Button>
          </Link>
          <Link href='/'>
            <Button variant='outline'>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
