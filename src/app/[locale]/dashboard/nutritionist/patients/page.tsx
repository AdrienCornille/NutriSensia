'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Loader2,
  AlertCircle,
  UserPlus,
  Download,
} from 'lucide-react';
import {
  useNutritionistPatients,
  exportPatientsToCSV,
  type PatientListItem,
  type PatientStatusFilter,
  type PatientSort,
} from '@/hooks/useNutritionistPatients';
import { PatientFilters } from '@/components/nutritionist/patients/PatientFilters';
import { PatientCard } from '@/components/nutritionist/patients/PatientCard';
import { PatientListRow } from '@/components/nutritionist/patients/PatientListRow';

export default function NutritionistPatientsPage() {
  const router = useRouter();

  // State
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatusFilter>('all');
  const [sort, setSort] = useState<PatientSort>('name_asc');
  const [page] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Query
  const { data, isLoading, error } = useNutritionistPatients({
    search: debouncedSearch || undefined,
    status: statusFilter,
    sort,
    page,
    limit: 50,
  });

  const patients = data?.patients || [];
  const stats = data?.stats || { total: 0, active: 0, pending: 0, inactive: 0 };

  // Handlers
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

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-100'>
        <header className='bg-white border-b border-gray-200 px-8 h-[93px] flex items-center sticky top-0 z-10'>
          <h1 className='text-2xl font-semibold text-gray-800'>Mes patients</h1>
        </header>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <Loader2 className='w-8 h-8 animate-spin text-[#1B998B] mx-auto mb-3' />
            <p className='text-gray-500 text-sm'>Chargement des patients...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-gray-100'>
        <header className='bg-white border-b border-gray-200 px-8 h-[93px] flex items-center sticky top-0 z-10'>
          <h1 className='text-2xl font-semibold text-gray-800'>Mes patients</h1>
        </header>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <AlertCircle className='w-8 h-8 text-red-500 mx-auto mb-3' />
            <p className='text-gray-800 font-medium mb-1'>
              Erreur de chargement
            </p>
            <p className='text-gray-500 text-sm'>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 px-8 h-[93px] flex items-center sticky top-0 z-10'>
        <div className='flex items-center justify-between w-full'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-800'>
              Mes patients
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {stats.active} patients actifs sur {stats.total} au total
            </p>
          </div>
          {patients.length > 0 && (
            <button
              onClick={() => exportPatientsToCSV(patients)}
              className='flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              <Download className='w-4 h-4' />
              Exporter
            </button>
          )}
        </div>
      </header>

      <div className='px-8 py-6'>
        {/* Stat Cards */}
        <div className='grid grid-cols-4 gap-4 mb-6'>
          <div className='bg-white rounded-xl p-4 border border-gray-200'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                <Users className='w-5 h-5 text-gray-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-800'>
                  {stats.total}
                </p>
                <p className='text-xs text-gray-500'>Total</p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl p-4 border border-gray-200'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-[#1B998B]/10 rounded-full flex items-center justify-center'>
                <UserCheck className='w-5 h-5 text-[#1B998B]' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-800'>
                  {stats.active}
                </p>
                <p className='text-xs text-gray-500'>Actifs</p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl p-4 border border-gray-200'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center'>
                <Clock className='w-5 h-5 text-amber-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-800'>
                  {stats.pending}
                </p>
                <p className='text-xs text-gray-500'>Nouveaux</p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl p-4 border border-gray-200'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                <UserX className='w-5 h-5 text-gray-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-800'>
                  {stats.inactive}
                </p>
                <p className='text-xs text-gray-500'>En pause</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending patients banner (PAT-005) */}
        {stats.pending > 0 && statusFilter !== 'pending' && (
          <div className='bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <UserPlus className='w-5 h-5 text-amber-600' />
              <div>
                <p className='text-sm font-medium text-amber-800'>
                  {stats.pending} nouveau{stats.pending > 1 ? 'x' : ''} patient
                  {stats.pending > 1 ? 's' : ''} assigné
                  {stats.pending > 1 ? 's' : ''}
                </p>
                <p className='text-xs text-amber-600'>
                  Consultez leur dossier pour préparer la première consultation
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('pending')}
              className='text-sm text-amber-700 font-medium hover:underline whitespace-nowrap'
            >
              Voir &rarr;
            </button>
          </div>
        )}

        {/* Filters */}
        <div className='mb-6'>
          <PatientFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            sort={sort}
            onSortChange={setSort}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Content */}
        {patients.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
            <UserPlus className='w-12 h-12 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-800 font-medium mb-1'>
              Aucun patient trouvé
            </p>
            <p className='text-gray-500 text-sm'>
              {debouncedSearch || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche.'
                : "Vos patients apparaîtront ici dès qu'ils seront assignés."}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {patients.map(patient => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onNavigate={handleViewDetail}
                onSendMessage={handleSendMessage}
              />
            ))}
          </div>
        ) : (
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-100'>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Patient
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Objectif
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Statut
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Dernier RDV
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Prochain RDV
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Consult.
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Alertes
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {patients.map(patient => (
                  <PatientListRow
                    key={patient.id}
                    patient={patient}
                    onClick={(p) => handleViewDetail(p.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
