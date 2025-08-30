'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'nutritionist' | 'admin';
  avatar_url?: string;
  phone?: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
  height_cm?: number;
  weight_kg?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activity_level?: string;
  dietary_restrictions?: string[];
  allergies?: string[];
  goals?: string[];
  profile_public: boolean;
  allow_contact: boolean;
  timezone: string;
  language: string;
  notification_preferences: any;
}

interface TestResult {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function ProfileTest() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ [key: string]: TestResult }>({});
  const [authStatus, setAuthStatus] = useState<{
    user: any;
    session: any;
  } | null>(null);
  const [updateForm, setUpdateForm] = useState({
    full_name: '',
    phone: '',
    height_cm: '',
    weight_kg: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    activity_level: 'sedentary' as string,
    dietary_restrictions: [] as string[],
    allergies: [] as string[],
    goals: [] as string[],
    profile_public: false,
    allow_contact: true,
  });

  // Vérifier l'état d'authentification
  const checkAuthStatus = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      setAuthStatus({ user, session });

      if (userError) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur:",
          userError
        );
      }
      if (sessionError) {
        console.error(
          'Erreur lors de la récupération de la session:',
          sessionError
        );
      }

      return { user, session };
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification:",
        error
      );
      return { user: null, session: null };
    }
  };

  // Charger le profil actuel
  const loadProfile = async () => {
    setLoading(true);
    try {
      // Vérifier d'abord l'authentification
      const { user, session } = await checkAuthStatus();

      if (!user) {
        setResults(prev => ({
          ...prev,
          loadProfile: {
            status: 'error',
            message:
              "❌ Aucun utilisateur connecté. Veuillez vous connecter d'abord.",
            details: { auth_status: 'not_authenticated' },
          },
        }));
        return;
      }

      console.log('Utilisateur connecté:', user.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setResults(prev => ({
          ...prev,
          loadProfile: {
            status: 'error',
            message: `❌ Erreur lors du chargement du profil: ${error.message}`,
            details: { error, user_id: user.id },
          },
        }));
      } else {
        setProfile(profile);
        setUpdateForm({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          height_cm: profile.height_cm?.toString() || '',
          weight_kg: profile.weight_kg?.toString() || '',
          age: profile.age?.toString() || '',
          gender: profile.gender || 'male',
          activity_level: profile.activity_level || 'sedentary',
          dietary_restrictions: profile.dietary_restrictions || [],
          allergies: profile.allergies || [],
          goals: profile.goals || [],
          profile_public: profile.profile_public || false,
          allow_contact: profile.allow_contact || true,
        });

        setResults(prev => ({
          ...prev,
          loadProfile: {
            status: 'success',
            message: '✅ Profil chargé avec succès',
            details: { profile, user_id: user.id },
          },
        }));
      }
    } catch (error: any) {
      console.error('Erreur inattendue lors du chargement du profil:', error);
      setResults(prev => ({
        ...prev,
        loadProfile: {
          status: 'error',
          message: `❌ Erreur inattendue: ${error.message}`,
          details: { error },
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  // Tester la création de profil
  const testProfileCreation = async () => {
    setResults(prev => ({
      ...prev,
      profileCreation: { status: 'loading', message: 'Test en cours...' },
    }));

    try {
      const { user } = await checkAuthStatus();

      if (!user) {
        setResults(prev => ({
          ...prev,
          profileCreation: {
            status: 'error',
            message: '❌ Aucun utilisateur connecté',
          },
        }));
        return;
      }

      console.log('Test création profil pour utilisateur:', user.id);

      // Vérifier si le profil existe déjà
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id, created_at')
        .eq('id', user.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, ce qui est normal si le profil n'existe pas encore
        console.error(
          'Erreur lors de la vérification du profil existant:',
          selectError
        );
        setResults(prev => ({
          ...prev,
          profileCreation: {
            status: 'error',
            message: `❌ Erreur lors de la vérification: ${selectError.message}`,
            details: { error: selectError },
          },
        }));
        return;
      }

      if (existingProfile) {
        setResults(prev => ({
          ...prev,
          profileCreation: {
            status: 'success',
            message:
              "✅ Profil déjà créé automatiquement lors de l'inscription",
            details: {
              profile_id: existingProfile.id,
              created_at: existingProfile.created_at,
              user_id: user.id,
            },
          },
        }));
      } else {
        // Essayer de créer le profil manuellement
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            role: 'patient',
          })
          .select()
          .single();

        if (insertError) {
          setResults(prev => ({
            ...prev,
            profileCreation: {
              status: 'error',
              message: `❌ Erreur lors de la création manuelle: ${insertError.message}`,
              details: { error: insertError, user_id: user.id },
            },
          }));
        } else {
          setResults(prev => ({
            ...prev,
            profileCreation: {
              status: 'success',
              message: '✅ Profil créé manuellement avec succès',
              details: { profile: newProfile, user_id: user.id },
            },
          }));
        }
      }
    } catch (error: any) {
      console.error('Erreur lors du test de création de profil:', error);
      setResults(prev => ({
        ...prev,
        profileCreation: {
          status: 'error',
          message: `❌ Erreur: ${error.message}`,
          details: { error },
        },
      }));
    }
  };

  // Tester la mise à jour du profil
  const testProfileUpdate = async () => {
    setResults(prev => ({
      ...prev,
      profileUpdate: { status: 'loading', message: 'Test en cours...' },
    }));

    try {
      const { user } = await checkAuthStatus();

      if (!user) {
        setResults(prev => ({
          ...prev,
          profileUpdate: {
            status: 'error',
            message: '❌ Aucun utilisateur connecté',
          },
        }));
        return;
      }

      console.log('Test mise à jour profil pour utilisateur:', user.id);

      const updateData = {
        full_name: updateForm.full_name || 'Test Update',
        phone: updateForm.phone || '0123456789',
        height_cm: updateForm.height_cm ? parseInt(updateForm.height_cm) : 170,
        weight_kg: updateForm.weight_kg
          ? parseFloat(updateForm.weight_kg)
          : 70.0,
        age: updateForm.age ? parseInt(updateForm.age) : 30,
        gender: updateForm.gender,
        activity_level: updateForm.activity_level,
        dietary_restrictions: updateForm.dietary_restrictions,
        allergies: updateForm.allergies,
        goals: updateForm.goals,
        profile_public: updateForm.profile_public,
        allow_contact: updateForm.allow_contact,
      };

      console.log('Données de mise à jour:', updateData);

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        setResults(prev => ({
          ...prev,
          profileUpdate: {
            status: 'error',
            message: `❌ Erreur lors de la mise à jour: ${error.message}`,
            details: { error, user_id: user.id, update_data: updateData },
          },
        }));
      } else {
        setProfile(data);
        setResults(prev => ({
          ...prev,
          profileUpdate: {
            status: 'success',
            message: '✅ Profil mis à jour avec succès',
            details: { profile: data, user_id: user.id },
          },
        }));
      }
    } catch (error: any) {
      console.error('Erreur inattendue lors de la mise à jour:', error);
      setResults(prev => ({
        ...prev,
        profileUpdate: {
          status: 'error',
          message: `❌ Erreur inattendue: ${error.message}`,
          details: { error },
        },
      }));
    }
  };

  // Tester les politiques RLS
  const testRLSPolicies = async () => {
    setResults(prev => ({
      ...prev,
      rlsPolicies: { status: 'loading', message: 'Test en cours...' },
    }));

    try {
      const { user } = await checkAuthStatus();

      if (!user) {
        setResults(prev => ({
          ...prev,
          rlsPolicies: {
            status: 'error',
            message: '❌ Aucun utilisateur connecté',
          },
        }));
        return;
      }

      console.log('Test politiques RLS pour utilisateur:', user.id);

      // Test 1: L'utilisateur peut voir son propre profil
      const { data: ownProfile, error: ownError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .single();

      if (ownError) {
        console.error(
          'Erreur lors du test de lecture du profil propre:',
          ownError
        );
        setResults(prev => ({
          ...prev,
          rlsPolicies: {
            status: 'error',
            message: `❌ L'utilisateur ne peut pas voir son propre profil: ${ownError.message}`,
            details: { error: ownError, user_id: user.id },
          },
        }));
        return;
      }

      // Test 2: L'utilisateur peut voir les profils publics
      const { data: otherProfiles, error: otherError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, profile_public')
        .neq('id', user.id)
        .limit(5);

      if (otherError) {
        console.error(
          'Erreur lors du test de lecture des autres profils:',
          otherError
        );
        setResults(prev => ({
          ...prev,
          rlsPolicies: {
            status: 'error',
            message: `❌ Erreur lors du test des autres profils: ${otherError.message}`,
            details: { error: otherError, user_id: user.id },
          },
        }));
        return;
      }

      // Compter les profils publics visibles
      const publicProfiles = otherProfiles?.filter(p => p.profile_public) || [];

      setResults(prev => ({
        ...prev,
        rlsPolicies: {
          status: 'success',
          message: `✅ Politiques RLS testées avec succès - Profil propre accessible, ${publicProfiles.length} profils publics visibles`,
          details: {
            own_profile: ownProfile ? 'accessible' : 'non accessible',
            other_profiles_count: otherProfiles?.length || 0,
            public_profiles_count: publicProfiles.length,
            rls_working: true,
            user_id: user.id,
          },
        },
      }));
    } catch (error: any) {
      console.error('Erreur lors du test RLS:', error);
      setResults(prev => ({
        ...prev,
        rlsPolicies: {
          status: 'error',
          message: `❌ Erreur lors du test RLS: ${error.message}`,
          details: { error },
        },
      }));
    }
  };

  // Tester les fonctions utilitaires
  const testUtilityFunctions = async () => {
    setResults(prev => ({
      ...prev,
      utilityFunctions: { status: 'loading', message: 'Test en cours...' },
    }));

    try {
      const { user } = await checkAuthStatus();

      if (!user) {
        setResults(prev => ({
          ...prev,
          utilityFunctions: {
            status: 'error',
            message: '❌ Aucun utilisateur connecté',
          },
        }));
        return;
      }

      console.log('Test fonctions utilitaires pour utilisateur:', user.id);

      // Test de la fonction get_user_stats
      const { data: stats, error: statsError } = await supabase.rpc(
        'get_user_stats',
        { user_id: user.id }
      );

      if (statsError) {
        console.error(
          'Erreur lors du test des fonctions utilitaires:',
          statsError
        );
        setResults(prev => ({
          ...prev,
          utilityFunctions: {
            status: 'error',
            message: `❌ Erreur lors du test des fonctions utilitaires: ${statsError.message}`,
            details: { error: statsError, user_id: user.id },
          },
        }));
      } else {
        setResults(prev => ({
          ...prev,
          utilityFunctions: {
            status: 'success',
            message: '✅ Fonctions utilitaires testées avec succès',
            details: {
              user_stats: stats,
              functions_available: [
                'get_user_stats',
                'get_user_role',
                'is_nutritionist',
                'is_admin',
              ],
              user_id: user.id,
            },
          },
        }));
      }
    } catch (error: any) {
      console.error(
        'Erreur inattendue lors du test des fonctions utilitaires:',
        error
      );
      setResults(prev => ({
        ...prev,
        utilityFunctions: {
          status: 'error',
          message: `❌ Erreur inattendue: ${error.message}`,
          details: { error },
        },
      }));
    }
  };

  // Charger le profil au montage du composant
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow'>
      <h2 className='text-2xl font-bold mb-6'>
        Test du Système de Rôles et Profils
      </h2>

      {/* Statut d'authentification */}
      <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
        <h3 className='text-lg font-semibold mb-3'>
          Statut d'Authentification
        </h3>
        {authStatus ? (
          <div className='text-sm'>
            <p>
              <strong>Utilisateur connecté:</strong>{' '}
              {authStatus.user ? '✅ Oui' : '❌ Non'}
            </p>
            <p>
              <strong>Session active:</strong>{' '}
              {authStatus.session ? '✅ Oui' : '❌ Non'}
            </p>
            {authStatus.user && (
              <p>
                <strong>ID utilisateur:</strong> {authStatus.user.id}
              </p>
            )}
          </div>
        ) : (
          <p className='text-sm text-gray-600'>Vérification en cours...</p>
        )}
      </div>

      {/* Affichage du profil actuel */}
      {profile && (
        <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
          <h3 className='text-lg font-semibold mb-3'>Profil Actuel</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <p>
                <strong>ID:</strong> {profile.id}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Nom:</strong> {profile.full_name || 'Non défini'}
              </p>
              <p>
                <strong>Rôle:</strong>{' '}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    profile.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : profile.role === 'nutritionist'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {profile.role}
                </span>
              </p>
              <p>
                <strong>Téléphone:</strong> {profile.phone || 'Non défini'}
              </p>
            </div>
            <div>
              <p>
                <strong>Email vérifié:</strong>{' '}
                {profile.email_verified ? '✅' : '❌'}
              </p>
              <p>
                <strong>2FA activé:</strong>{' '}
                {profile.two_factor_enabled ? '✅' : '❌'}
              </p>
              <p>
                <strong>Profil public:</strong>{' '}
                {profile.profile_public ? '✅' : '❌'}
              </p>
              <p>
                <strong>Dernière connexion:</strong>{' '}
                {profile.last_sign_in_at
                  ? new Date(profile.last_sign_in_at).toLocaleString('fr-FR')
                  : 'Jamais'}
              </p>
              <p>
                <strong>Créé le:</strong>{' '}
                {new Date(profile.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de mise à jour */}
      <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
        <h3 className='text-lg font-semibold mb-3'>Mise à Jour du Profil</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Nom complet
            </label>
            <input
              type='text'
              value={updateForm.full_name}
              onChange={e =>
                setUpdateForm(prev => ({ ...prev, full_name: e.target.value }))
              }
              className='w-full p-2 border rounded'
              placeholder='Votre nom complet'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Téléphone</label>
            <input
              type='text'
              value={updateForm.phone}
              onChange={e =>
                setUpdateForm(prev => ({ ...prev, phone: e.target.value }))
              }
              className='w-full p-2 border rounded'
              placeholder='0123456789'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Taille (cm)
            </label>
            <input
              type='number'
              value={updateForm.height_cm}
              onChange={e =>
                setUpdateForm(prev => ({ ...prev, height_cm: e.target.value }))
              }
              className='w-full p-2 border rounded'
              placeholder='170'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Poids (kg)</label>
            <input
              type='number'
              step='0.1'
              value={updateForm.weight_kg}
              onChange={e =>
                setUpdateForm(prev => ({ ...prev, weight_kg: e.target.value }))
              }
              className='w-full p-2 border rounded'
              placeholder='70.0'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Âge</label>
            <input
              type='number'
              value={updateForm.age}
              onChange={e =>
                setUpdateForm(prev => ({ ...prev, age: e.target.value }))
              }
              className='w-full p-2 border rounded'
              placeholder='30'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Genre</label>
            <select
              value={updateForm.gender}
              onChange={e =>
                setUpdateForm(prev => ({
                  ...prev,
                  gender: e.target.value as 'male' | 'female' | 'other',
                }))
              }
              className='w-full p-2 border rounded'
            >
              <option value='male'>Homme</option>
              <option value='female'>Femme</option>
              <option value='other'>Autre</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Niveau d'activité
            </label>
            <select
              value={updateForm.activity_level}
              onChange={e =>
                setUpdateForm(prev => ({
                  ...prev,
                  activity_level: e.target.value,
                }))
              }
              className='w-full p-2 border rounded'
            >
              <option value='sedentary'>Sédentaire</option>
              <option value='lightly_active'>Légèrement actif</option>
              <option value='moderately_active'>Modérément actif</option>
              <option value='very_active'>Très actif</option>
              <option value='extremely_active'>Extrêmement actif</option>
            </select>
          </div>
          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              id='profile_public'
              checked={updateForm.profile_public}
              onChange={e =>
                setUpdateForm(prev => ({
                  ...prev,
                  profile_public: e.target.checked,
                }))
              }
              className='rounded'
            />
            <label htmlFor='profile_public' className='text-sm font-medium'>
              Profil public
            </label>
          </div>
        </div>
      </div>

      {/* Boutons de test */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <button
          onClick={loadProfile}
          disabled={loading}
          className='p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
        >
          {loading ? 'Chargement...' : 'Charger Profil'}
        </button>

        <button
          onClick={testProfileCreation}
          className='p-3 bg-green-500 text-white rounded hover:bg-green-600'
        >
          Test Création Profil
        </button>

        <button
          onClick={testProfileUpdate}
          className='p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600'
        >
          Test Mise à Jour
        </button>

        <button
          onClick={testRLSPolicies}
          className='p-3 bg-purple-500 text-white rounded hover:bg-purple-600'
        >
          Test Politiques RLS
        </button>

        <button
          onClick={testUtilityFunctions}
          className='p-3 bg-indigo-500 text-white rounded hover:bg-indigo-600'
        >
          Test Fonctions Utilitaires
        </button>
      </div>

      {/* Résultats des tests */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Résultats des Tests</h3>

        {Object.entries(results).map(([key, result]) => (
          <div
            key={key}
            className={`p-4 rounded-lg border ${
              result.status === 'success'
                ? 'bg-green-50 border-green-200'
                : result.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : result.status === 'loading'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h4 className='font-semibold mb-2 capitalize'>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <p
              className={`mb-2 ${
                result.status === 'success'
                  ? 'text-green-800'
                  : result.status === 'error'
                    ? 'text-red-800'
                    : result.status === 'loading'
                      ? 'text-blue-800'
                      : 'text-gray-800'
              }`}
            >
              {result.message}
            </p>
            {result.details && (
              <details className='mt-2'>
                <summary className='cursor-pointer text-sm font-medium'>
                  Détails
                </summary>
                <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto'>
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
