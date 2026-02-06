'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminNutritionistProfile } from '@/types/admin';
import type { NutritionistStatus } from '@/types/nutritionist-registration';
import {
  NUTRITIONIST_STATUS_CONFIG,
  getStatusBadgeClasses,
  formatNutritionistName,
} from '@/types/admin';

interface AdminNutritionistListProps {
  nutritionists: AdminNutritionistProfile[];
  isLoading?: boolean;
  onSelectNutritionist: (nutritionist: AdminNutritionistProfile) => void;
  className?: string;
}

const statusFilters: { value: NutritionistStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'active', label: 'Actifs' },
  { value: 'rejected', label: 'Rejetés' },
  { value: 'info_required', label: 'Info requise' },
  { value: 'suspended', label: 'Suspendus' },
];

const getStatusIcon = (status: NutritionistStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className='w-4 h-4' />;
    case 'active':
      return <CheckCircle className='w-4 h-4' />;
    case 'rejected':
      return <XCircle className='w-4 h-4' />;
    case 'info_required':
      return <AlertCircle className='w-4 h-4' />;
    case 'suspended':
      return <XCircle className='w-4 h-4' />;
    default:
      return <Clock className='w-4 h-4' />;
  }
};

/**
 * Liste des nutritionnistes pour le panel admin
 * Permet de filtrer par statut et rechercher
 */
export function AdminNutritionistList({
  nutritionists,
  isLoading = false,
  onSelectNutritionist,
  className,
}: AdminNutritionistListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<NutritionistStatus | 'all'>(
    'all'
  );

  // Filtrer les nutritionnistes
  const filteredNutritionists = useMemo(() => {
    return nutritionists.filter(nutritionist => {
      // Filtre par statut
      if (statusFilter !== 'all' && nutritionist.status !== statusFilter) {
        return false;
      }

      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = formatNutritionistName(nutritionist).toLowerCase();
        const email = nutritionist.email.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      }

      return true;
    });
  }, [nutritionists, statusFilter, searchQuery]);

  // Compter par statut
  const statusCounts = useMemo(() => {
    const counts: Record<NutritionistStatus | 'all', number> = {
      all: nutritionists.length,
      pending: 0,
      active: 0,
      rejected: 0,
      info_required: 0,
      suspended: 0,
    };

    nutritionists.forEach(n => {
      counts[n.status]++;
    });

    return counts;
  }, [nutritionists]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-CH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100',
        className
      )}
    >
      {/* Header avec filtres */}
      <div className='p-6 border-b border-gray-100'>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Recherche */}
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              placeholder='Rechercher par nom ou email...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-all'
            />
          </div>

          {/* Filtre par statut */}
          <div className='relative'>
            <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as NutritionistStatus | 'all')
              }
              className='pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-all appearance-none bg-white cursor-pointer'
            >
              {statusFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label} ({statusCounts[filter.value]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags rapides */}
        <div className='flex flex-wrap gap-2 mt-4'>
          {statusFilters.map(filter => {
            const count = statusCounts[filter.value];
            const isActive = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[#1B998B] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    'ml-1.5 px-1.5 py-0.5 rounded-full text-xs',
                    isActive ? 'bg-white/20' : 'bg-gray-200'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste */}
      <div className='divide-y divide-gray-100'>
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='p-4 animate-pulse'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-gray-200 rounded-full' />
                <div className='flex-1'>
                  <div className='h-4 bg-gray-200 rounded w-32 mb-2' />
                  <div className='h-3 bg-gray-100 rounded w-48' />
                </div>
              </div>
            </div>
          ))
        ) : filteredNutritionists.length === 0 ? (
          <div className='p-12 text-center'>
            <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <User className='w-8 h-8 text-gray-400' />
            </div>
            <p className='text-gray-600 font-medium'>
              Aucun nutritionniste trouvé
            </p>
            <p className='text-sm text-gray-400 mt-1'>
              {searchQuery
                ? 'Essayez une autre recherche'
                : 'Aucune demande pour ce statut'}
            </p>
          </div>
        ) : (
          filteredNutritionists.map((nutritionist, index) => (
            <motion.button
              key={nutritionist.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectNutritionist(nutritionist)}
              className='w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-center gap-4 group'
            >
              {/* Avatar */}
              <div className='relative flex-shrink-0'>
                {nutritionist.documents.find(d => d.type === 'photo')
                  ?.fileUrl ? (
                  <img
                    src={
                      nutritionist.documents.find(d => d.type === 'photo')
                        ?.fileUrl
                    }
                    alt={formatNutritionistName(nutritionist)}
                    className='w-12 h-12 rounded-full object-cover'
                  />
                ) : (
                  <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center'>
                    <User className='w-6 h-6 text-gray-400' />
                  </div>
                )}
                {/* Badge statut */}
                <div
                  className={cn(
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white',
                    getStatusBadgeClasses(nutritionist.status)
                  )}
                >
                  {getStatusIcon(nutritionist.status)}
                </div>
              </div>

              {/* Infos */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <p className='font-medium text-gray-900 truncate'>
                    {formatNutritionistName(nutritionist)}
                  </p>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      getStatusBadgeClasses(nutritionist.status)
                    )}
                  >
                    {NUTRITIONIST_STATUS_CONFIG[nutritionist.status].labelFr}
                  </span>
                </div>
                <p className='text-sm text-gray-500 truncate'>
                  {nutritionist.email}
                </p>
                <div className='flex items-center gap-3 mt-1 text-xs text-gray-400'>
                  <span>Demande le {formatDate(nutritionist.createdAt)}</span>
                  {nutritionist.ascaNumber && (
                    <span>ASCA: {nutritionist.ascaNumber}</span>
                  )}
                  {nutritionist.rmeNumber && (
                    <span>RME: {nutritionist.rmeNumber}</span>
                  )}
                </div>
              </div>

              {/* Flèche */}
              <ChevronRight className='w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all' />
            </motion.button>
          ))
        )}
      </div>

      {/* Footer avec total */}
      <div className='p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl'>
        <p className='text-sm text-gray-500 text-center'>
          {filteredNutritionists.length} nutritionniste
          {filteredNutritionists.length > 1 ? 's' : ''} affiché
          {filteredNutritionists.length > 1 ? 's' : ''}
          {statusFilter !== 'all' &&
            ` (filtre: ${NUTRITIONIST_STATUS_CONFIG[statusFilter].labelFr})`}
        </p>
      </div>
    </div>
  );
}

export default AdminNutritionistList;
