'use client';

import { useState, useEffect } from 'react';

export default function EnvDebug() {
  const [showDetails, setShowDetails] = useState(false);
  const [envVars, setEnvVars] = useState<any>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Récupérer les variables d'environnement côté client
    const vars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    };

    setEnvVars(vars);
    setIsLoaded(true);
  }, []);

  // Vérifier la configuration
  const hasSupabaseUrl = !!envVars.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isUrlValid =
    envVars.NEXT_PUBLIC_SUPABASE_URL &&
    envVars.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' &&
    envVars.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://');
  const isKeyValid =
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key' &&
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ');

  const isConfigured =
    hasSupabaseUrl && hasSupabaseKey && isUrlValid && isKeyValid;

  if (!isLoaded) {
    return (
      <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded mb-4'></div>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow'>
      <h2 className='text-xl font-bold mb-4'>
        Debug des Variables d&apos;Environnement
      </h2>

      <div className='space-y-4'>
        {/* Statut général */}
        <div
          className={`p-4 rounded-lg border ${
            isConfigured
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <h3 className='font-semibold mb-2'>
            Statut de Configuration Supabase
          </h3>
          <p className={isConfigured ? 'text-green-800' : 'text-red-800'}>
            {isConfigured
              ? '✅ Configuration valide'
              : '❌ Configuration invalide'}
          </p>
        </div>

        {/* Variables d'environnement */}
        <div className='space-y-3'>
          <h3 className='font-semibold'>Variables d&apos;Environnement :</h3>

          <div className='grid grid-cols-1 gap-3'>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded'>
              <span className='font-mono text-sm'>
                NEXT_PUBLIC_SUPABASE_URL
              </span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  hasSupabaseUrl
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {hasSupabaseUrl ? '✅ Présent' : '❌ Manquant'}
              </span>
            </div>

            <div className='flex items-center justify-between p-3 bg-gray-50 rounded'>
              <span className='font-mono text-sm'>
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  hasSupabaseKey
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {hasSupabaseKey ? '✅ Présent' : '❌ Manquant'}
              </span>
            </div>

            <div className='flex items-center justify-between p-3 bg-gray-50 rounded'>
              <span className='font-mono text-sm'>NODE_ENV</span>
              <span className='px-2 py-1 rounded text-xs bg-blue-100 text-blue-800'>
                {envVars.NODE_ENV || 'Non défini'}
              </span>
            </div>
          </div>
        </div>

        {/* Validation des valeurs */}
        <div className='space-y-3'>
          <h3 className='font-semibold'>Validation des Valeurs :</h3>

          <div className='space-y-2'>
            <div className='flex items-center justify-between p-2 bg-gray-50 rounded'>
              <span>URL Supabase valide</span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  isUrlValid
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {isUrlValid ? '✅ Valide' : '❌ Invalide'}
              </span>
            </div>

            <div className='flex items-center justify-between p-2 bg-gray-50 rounded'>
              <span>Clé Supabase valide</span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  isKeyValid
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {isKeyValid ? '✅ Valide' : '❌ Invalide'}
              </span>
            </div>
          </div>
        </div>

        {/* Bouton pour afficher les détails */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className='w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          {showDetails ? 'Masquer les détails' : 'Afficher les détails'}
        </button>

        {/* Détails des variables */}
        {showDetails && (
          <div className='space-y-3'>
            <h3 className='font-semibold'>Détails des Variables :</h3>

            <div className='space-y-2'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  NEXT_PUBLIC_SUPABASE_URL
                </label>
                <div className='p-2 bg-gray-100 rounded font-mono text-xs break-all'>
                  {envVars.NEXT_PUBLIC_SUPABASE_URL || 'Non défini'}
                </div>
                {envVars.NEXT_PUBLIC_SUPABASE_URL && (
                  <div className='mt-1 text-xs text-gray-600'>
                    Longueur: {envVars.NEXT_PUBLIC_SUPABASE_URL.length}{' '}
                    caractères
                    {envVars.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')
                      ? ' ✅ HTTPS'
                      : ' ❌ Pas HTTPS'}
                  </div>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </label>
                <div className='p-2 bg-gray-100 rounded font-mono text-xs break-all'>
                  {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? `${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50)}...`
                    : 'Non défini'}
                </div>
                {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY && (
                  <div className='mt-1 text-xs text-gray-600'>
                    Longueur: {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.length}{' '}
                    caractères
                    {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ')
                      ? ' ✅ Format JWT'
                      : ' ❌ Format invalide'}
                  </div>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  NODE_ENV
                </label>
                <div className='p-2 bg-gray-100 rounded font-mono text-xs'>
                  {envVars.NODE_ENV || 'Non défini'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions de résolution */}
        {!isConfigured && (
          <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <h3 className='font-semibold text-yellow-800 mb-2'>
              Instructions de Résolution :
            </h3>
            <ol className='list-decimal list-inside space-y-1 text-sm text-yellow-700'>
              <li>
                Vérifiez que le fichier <code>.env.local</code> existe à la
                racine du projet
              </li>
              <li>
                Assurez-vous que les variables commencent par{' '}
                <code>NEXT_PUBLIC_</code>
              </li>
              <li>Redémarrez le serveur de développement après modification</li>
              <li>Vérifiez que les valeurs ne sont pas des placeholders</li>
              <li>
                Vérifiez que l&apos;URL commence par <code>https://</code>
              </li>
              <li>
                Vérifiez que la clé commence par <code>eyJ</code> (format JWT)
              </li>
            </ol>
          </div>
        )}

        {/* Test de connexion directe */}
        <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <h3 className='font-semibold text-blue-800 mb-2'>
            Test de Connexion Directe :
          </h3>
          <p className='text-sm text-blue-700 mb-3'>
            Cliquez sur le bouton ci-dessous pour tester directement la
            connexion à Supabase :
          </p>
          <button
            onClick={async () => {
              try {
                const response = await fetch(
                  `${envVars.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
                  {
                    headers: {
                      apikey: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                      Authorization: `Bearer ${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                  }
                );

                if (response.ok) {
                  alert('✅ Connexion à Supabase réussie !');
                } else {
                  alert(
                    `❌ Erreur de connexion : ${response.status} ${response.statusText}`
                  );
                }
              } catch (error) {
                alert(`❌ Erreur de connexion : ${error}`);
              }
            }}
            className='w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Tester la Connexion Supabase
          </button>
        </div>
      </div>
    </div>
  );
}
