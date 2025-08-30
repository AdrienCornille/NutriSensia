/**
 * Tableau de bord de sécurité pour les administrateurs
 * Affiche les métriques, événements et alertes de sécurité
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SecurityMetrics {
  timeframe: string;
  period: {
    start: string;
    end: string;
  };
  overview: {
    total_events: number;
    total_events_trend: number;
    failed_logins: number;
    failed_logins_trend: number;
    suspicious_activities: number;
    mfa_events: number;
  };
  breakdown: {
    by_type: Array<{ event_type: string; count: number }>;
    by_severity: Array<{ severity: string; count: number }>;
    top_ips: Array<{ ip_address: string; count: number }>;
  };
  alerts: {
    high_severity_events: number;
    critical_events: number;
    rate_limit_exceeded: number;
  };
}

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id?: string;
  ip_address: string;
  user_agent: string;
  metadata?: Record<string, any>;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const TIMEFRAMES = [
  { value: '1h', label: '1 heure' },
  { value: '24h', label: '24 heures' },
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
];

const SEVERITY_COLORS = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-orange-600 bg-orange-100',
  critical: 'text-red-600 bg-red-100',
};

const EVENT_TYPE_LABELS = {
  login_attempt: 'Tentative de connexion',
  login_success: 'Connexion réussie',
  login_failure: 'Échec de connexion',
  logout: 'Déconnexion',
  mfa_attempt: 'Tentative 2FA',
  mfa_success: '2FA réussie',
  mfa_failure: 'Échec 2FA',
  suspicious_activity: 'Activité suspecte',
  rate_limit_exceeded: 'Rate limit dépassé',
  password_reset: 'Réinitialisation mot de passe',
  account_locked: 'Compte bloqué',
};

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [eventPage, setEventPage] = useState(1);

  // Charger les métriques
  const loadMetrics = async (selectedTimeframe: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('supabase-auth-token');
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(
        `/api/security/metrics?timeframe=${selectedTimeframe}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error('Erreur lors du chargement des métriques:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les événements
  const loadEvents = async (page: number = 1) => {
    try {
      const token = localStorage.getItem('supabase-auth-token');
      if (!token) return;

      const response = await fetch(
        `/api/security/events?page=${page}&limit=20&severity=high,critical`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des événements:', err);
    }
  };

  // Déclencher une alerte manuelle
  const triggerAlert = async () => {
    try {
      const token = localStorage.getItem('supabase-auth-token');
      if (!token) return;

      const message = prompt("Message de l'alerte:");
      if (!message) return;

      const response = await fetch('/api/security/metrics/alert', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          severity: 'high',
          metadata: { manual_trigger: true },
        }),
      });

      if (response.ok) {
        alert('Alerte créée avec succès');
        loadEvents(); // Recharger les événements
      }
    } catch (err) {
      console.error("Erreur lors de la création de l'alerte:", err);
      alert("Erreur lors de la création de l'alerte");
    }
  };

  useEffect(() => {
    loadMetrics(timeframe);
    loadEvents();
  }, [timeframe]);

  const formatTrend = (trend: number) => {
    const isPositive = trend > 0;
    const color = isPositive ? 'text-red-600' : 'text-green-600';
    const arrow = isPositive ? '↗' : '↘';
    return (
      <span className={`${color} text-sm font-medium`}>
        {arrow} {Math.abs(trend)}%
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded mb-6'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className='h-32 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <Card className='p-6 border-red-200 bg-red-50'>
          <h2 className='text-lg font-semibold text-red-800 mb-2'>
            Erreur de chargement
          </h2>
          <p className='text-red-600'>{error}</p>
          <Button
            onClick={() => loadMetrics(timeframe)}
            className='mt-4'
            variant='outline'
          >
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className='p-6'>
        <Card className='p-6'>
          <p>Aucune donnée disponible</p>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* En-tête */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Tableau de bord sécurité
          </h1>
          <p className='text-gray-600'>
            Monitoring et alertes de sécurité en temps réel
          </p>
        </div>

        <div className='flex gap-2'>
          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            {TIMEFRAMES.map(tf => (
              <option key={tf.value} value={tf.value}>
                {tf.label}
              </option>
            ))}
          </select>

          <Button onClick={triggerAlert} variant='outline'>
            Créer une alerte
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Événements totaux
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {metrics.overview.total_events.toLocaleString()}
              </p>
            </div>
            {formatTrend(metrics.overview.total_events_trend)}
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Échecs de connexion
              </p>
              <p className='text-2xl font-bold text-red-600'>
                {metrics.overview.failed_logins.toLocaleString()}
              </p>
            </div>
            {formatTrend(metrics.overview.failed_logins_trend)}
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Activités suspectes
              </p>
              <p className='text-2xl font-bold text-orange-600'>
                {metrics.overview.suspicious_activities.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Événements 2FA
              </p>
              <p className='text-2xl font-bold text-blue-600'>
                {metrics.overview.mfa_events.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alertes */}
      {(metrics.alerts.critical_events > 0 ||
        metrics.alerts.high_severity_events > 0) && (
        <Card className='p-6 border-red-200 bg-red-50'>
          <h3 className='text-lg font-semibold text-red-800 mb-4'>
            🚨 Alertes de sécurité
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {metrics.alerts.critical_events > 0 && (
              <div className='text-center'>
                <p className='text-2xl font-bold text-red-600'>
                  {metrics.alerts.critical_events}
                </p>
                <p className='text-sm text-red-800'>Événements critiques</p>
              </div>
            )}
            {metrics.alerts.high_severity_events > 0 && (
              <div className='text-center'>
                <p className='text-2xl font-bold text-orange-600'>
                  {metrics.alerts.high_severity_events}
                </p>
                <p className='text-sm text-orange-800'>Sévérité élevée</p>
              </div>
            )}
            {metrics.alerts.rate_limit_exceeded > 0 && (
              <div className='text-center'>
                <p className='text-2xl font-bold text-yellow-600'>
                  {metrics.alerts.rate_limit_exceeded}
                </p>
                <p className='text-sm text-yellow-800'>Rate limits dépassés</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Graphiques */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Événements par type */}
        <Card className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Événements par type
          </h3>
          <div className='space-y-3'>
            {metrics.breakdown.by_type.slice(0, 5).map(item => (
              <div
                key={item.event_type}
                className='flex justify-between items-center'
              >
                <span className='text-sm text-gray-600'>
                  {EVENT_TYPE_LABELS[
                    item.event_type as keyof typeof EVENT_TYPE_LABELS
                  ] || item.event_type}
                </span>
                <span className='font-medium'>
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top IPs suspectes */}
        <Card className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Top IPs suspectes
          </h3>
          <div className='space-y-3'>
            {metrics.breakdown.top_ips.slice(0, 5).map(item => (
              <div
                key={item.ip_address}
                className='flex justify-between items-center'
              >
                <span className='text-sm font-mono text-gray-600'>
                  {item.ip_address}
                </span>
                <span className='font-medium text-red-600'>{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Événements récents */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Événements de haute sévérité récents
        </h3>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Sévérité
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  IP
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {events.slice(0, 10).map(event => (
                <tr key={event.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {EVENT_TYPE_LABELS[
                      event.event_type as keyof typeof EVENT_TYPE_LABELS
                    ] || event.event_type}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${SEVERITY_COLORS[event.severity]}`}
                    >
                      {event.severity}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600'>
                    {event.ip_address}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatTimestamp(event.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {events.length === 0 && (
          <div className='text-center py-8 text-gray-500'>
            Aucun événement de haute sévérité récent
          </div>
        )}
      </Card>
    </div>
  );
}
