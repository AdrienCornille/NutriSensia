'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default function ApiTestPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<{ [key: string]: ApiResponse }>(
    {}
  );

  const testApi = async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' = 'GET',
    body?: any
  ) => {
    setLoading(true);
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`/api${endpoint}`, options);
      const data = await response.json();

      setResponses(prev => ({
        ...prev,
        [endpoint]: data,
      }));
    } catch (error) {
      setResponses(prev => ({
        ...prev,
        [endpoint]: {
          success: false,
          error: `Erreur réseau: ${error}`,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const clearResponses = () => {
    setResponses({});
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Test des Routes API</h1>

      {/* État de l'authentification */}
      <Card className='mb-6'>
        <div className='p-4'>
          <h2 className='text-xl font-semibold mb-2'>
            État de l'authentification
          </h2>
          <div className='space-y-2'>
            <p>
              <strong>Connecté:</strong> {isAuthenticated ? 'Oui' : 'Non'}
            </p>
            {user && (
              <>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Rôle:</strong> {user.user_metadata?.role || 'patient'}
                </p>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Tests des routes API */}
      <div className='space-y-6'>
        {/* Route publique */}
        <Card>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4'>Route Publique</h2>
            <div className='space-y-2'>
              <Button
                onClick={() => testApi('/public/health')}
                disabled={loading}
                className='mr-2'
              >
                Test /api/public/health
              </Button>
              <Button
                onClick={() =>
                  testApi('/public/health', 'POST', { action: 'ping' })
                }
                disabled={loading}
                className='mr-2'
              >
                Test /api/public/health (POST ping)
              </Button>
              <Button
                onClick={() =>
                  testApi('/public/health', 'POST', { action: 'info' })
                }
                disabled={loading}
              >
                Test /api/public/health (POST info)
              </Button>
            </div>
          </div>
        </Card>

        {/* Route protégée */}
        <Card>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4'>Route Protégée</h2>
            <div className='space-y-2'>
              <Button
                onClick={() => testApi('/protected/user')}
                disabled={loading}
                className='mr-2'
              >
                Test /api/protected/user (GET)
              </Button>
              <Button
                onClick={() =>
                  testApi('/protected/user', 'PUT', {
                    fullName: 'Nouveau Nom',
                    phone: '+41 79 123 45 67',
                  })
                }
                disabled={loading}
              >
                Test /api/protected/user (PUT)
              </Button>
            </div>
          </div>
        </Card>

        {/* Route admin */}
        <Card>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4'>Route Admin</h2>
            <div className='space-y-2'>
              <Button
                onClick={() => testApi('/admin/stats')}
                disabled={loading}
                className='mr-2'
              >
                Test /api/admin/stats (GET)
              </Button>
              <Button
                onClick={() =>
                  testApi('/admin/stats', 'POST', {
                    setting: 'maintenance_mode',
                    value: true,
                  })
                }
                disabled={loading}
              >
                Test /api/admin/stats (POST)
              </Button>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4'>Actions</h2>
            <Button onClick={clearResponses} disabled={loading}>
              Effacer les réponses
            </Button>
          </div>
        </Card>
      </div>

      {/* Affichage des réponses */}
      {Object.keys(responses).length > 0 && (
        <Card className='mt-6'>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4'>Réponses des API</h2>
            <div className='space-y-4'>
              {Object.entries(responses).map(([endpoint, response]) => (
                <div key={endpoint} className='border rounded p-3'>
                  <h3 className='font-semibold text-sm text-gray-700 mb-2'>
                    {endpoint}
                  </h3>
                  <pre className='text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40'>
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className='mt-6'>
        <div className='p-4'>
          <h2 className='text-xl font-semibold mb-4'>Instructions de test</h2>
          <div className='space-y-2 text-sm text-gray-600'>
            <p>
              • <strong>Routes publiques:</strong> Accessibles sans
              authentification
            </p>
            <p>
              • <strong>Routes protégées:</strong> Nécessitent une
              authentification
            </p>
            <p>
              • <strong>Routes admin:</strong> Nécessitent le rôle admin
            </p>
            <p>
              • Testez d'abord sans être connecté, puis connectez-vous et testez
              à nouveau
            </p>
            <p>• Les erreurs 401 indiquent un problème d'authentification</p>
            <p>• Les erreurs 403 indiquent un problème de permissions</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
