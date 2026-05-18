'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, UserPlus } from 'lucide-react';
import {
  useNutritionistPatients,
  exportPatientsToCSV,
  type PatientListItem,
  type PatientStatusFilter,
  type PatientSort,
} from '@/hooks/useNutritionistPatients';
import {
  PatientFilters,
  type ExtendedStatusFilter,
} from '@/components/nutritionist/patients/PatientFilters';
import { PatientCard } from '@/components/nutritionist/patients/PatientCard';
import { PatientListRow } from '@/components/nutritionist/patients/PatientListRow';
import { PatientsRibbon } from '@/components/nutritionist/patients/PatientsRibbon';
import {
  isPatientToWatch,
  countNewThisMonth,
} from '@/components/nutritionist/patients/patient-display';

export default function NutritionistPatientsPage() {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExtendedStatusFilter>('all');
  const [sort, setSort] = useState<PatientSort>('date_desc');
  const [page] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const apiStatus: PatientStatusFilter =
    statusFilter === 'watch' ? 'all' : statusFilter;

  const { data, isLoading, error } = useNutritionistPatients({
    search: debouncedSearch || undefined,
    status: apiStatus,
    sort,
    page,
    limit: 50,
  });

  const allPatients = useMemo(() => data?.patients ?? [], [data]);
  const stats = data?.stats ?? { total: 0, active: 0, pending: 0, inactive: 0 };

  // Recompute `now` whenever the fetched data changes — derived classifications
  // (À relancer, plateau, etc.) are time-sensitive but stable per data snapshot.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => new Date(), [allPatients]);

  const watchCount = useMemo(
    () => allPatients.filter(p => isPatientToWatch(p, now)).length,
    [allPatients, now]
  );

  const newThisMonth = useMemo(
    () => countNewThisMonth(allPatients, now),
    [allPatients, now]
  );

  const patients = useMemo(() => {
    if (statusFilter === 'watch') {
      return allPatients.filter(p => isPatientToWatch(p, now));
    }
    return allPatients;
  }, [allPatients, statusFilter, now]);

  const handleViewDetail = useCallback(
    (id: string) => {
      router.push(`/dashboard/nutritionist/patients/${id}`);
    },
    [router]
  );

  const handleSendMessage = useCallback(
    (_patient: PatientListItem) => {
      router.push('/dashboard/nutritionist/messagerie');
    },
    [router]
  );

  const handleExport = useCallback(() => {
    if (patients.length > 0) exportPatientsToCSV(patients);
  }, [patients]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Loader2
            className='animate-spin'
            style={{ margin: '0 auto 12px', color: 'var(--ns-ink)' }}
            size={28}
          />
          <p style={{ color: 'var(--ns-ink-3)', fontSize: 13 }}>
            Chargement des patients…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='pt-empty' style={{ marginTop: 32 }}>
        <AlertCircle
          size={32}
          style={{ color: 'var(--ns-coral)', margin: '0 auto 12px' }}
        />
        <h3>Erreur de chargement</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  const showPendingBanner =
    stats.pending > 0 && statusFilter !== 'pending' && statusFilter !== 'watch';

  return (
    <>
      <PatientsRibbon
        stats={stats}
        watchCount={watchCount}
        newThisMonth={newThisMonth}
      />

      <PatientFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sort={sort}
        onSortChange={setSort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        stats={stats}
        watchCount={watchCount}
        onExport={patients.length > 0 ? handleExport : undefined}
      />

      {showPendingBanner && (
        <div className='pt-pending-banner'>
          <div>
            <b>
              {stats.pending} nouveau{stats.pending > 1 ? 'x' : ''} patient
              {stats.pending > 1 ? 's' : ''} assigné
              {stats.pending > 1 ? 's' : ''}
            </b>
            <span>
              Consultez leur dossier pour préparer la première consultation.
            </span>
          </div>
          <button type='button' onClick={() => setStatusFilter('pending')}>
            Voir →
          </button>
        </div>
      )}

      {patients.length === 0 ? (
        <div className='pt-empty'>
          <UserPlus
            size={32}
            style={{ color: 'var(--ns-ink-4)', margin: '0 auto 12px' }}
          />
          <h3>Aucun patient trouvé</h3>
          <p>
            {debouncedSearch || statusFilter !== 'all'
              ? 'Essayez de modifier vos filtres de recherche.'
              : "Vos patient·e·s apparaîtront ici dès qu'ils seront assignés."}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <section className='pt-grid is-active'>
          {patients.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onNavigate={handleViewDetail}
              onSendMessage={handleSendMessage}
            />
          ))}
        </section>
      ) : (
        <section className='pt-list is-active'>
          <div className='pt-list-head'>
            <div>Patient</div>
            <div>Objectif</div>
            <div>Statut</div>
            <div>Évolution</div>
            <div className='pt-hide-md'>Dernière séance</div>
            <div style={{ textAlign: 'center' }}>Cons.</div>
            <div>Prochain RDV</div>
            <div />
          </div>
          {patients.map(patient => (
            <PatientListRow
              key={patient.id}
              patient={patient}
              onClick={p => handleViewDetail(p.id)}
              onSendMessage={handleSendMessage}
            />
          ))}
          <div className='pt-list-foot'>
            <span>
              {patients.length} sur {stats.total} affiché
              {patients.length > 1 ? 's' : ''}
            </span>
          </div>
        </section>
      )}

      <footer className='pt-foot'>
        <span>NutriSensia Pro · données chiffrées de bout en bout</span>
        <span className='pt-foot-meta'>chaque dossier, un parcours…</span>
      </footer>
    </>
  );
}
