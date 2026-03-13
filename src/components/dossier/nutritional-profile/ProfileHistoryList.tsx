'use client';

import React from 'react';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  GitCompare,
  Calendar,
  Target,
  Flame,
} from 'lucide-react';
import { usePatientProfileHistory } from '@/hooks/usePatientNutritionalProfile';
import type { NutritionalProfilePatient, ProfileStatus } from '@/types/nutritional-profile';
import { GOAL_ADJUSTMENTS } from '@/lib/nutritional-profile-calculator';

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const STATUS_CONFIG: Record<ProfileStatus, { label: string; className: string }> = {
  active: {
    label: 'Actif',
    className: 'bg-green-100 text-green-700',
  },
  draft: {
    label: 'Brouillon',
    className: 'bg-yellow-100 text-yellow-700',
  },
  archived: {
    label: 'Archivé',
    className: 'bg-gray-100 text-gray-600',
  },
};

// ============================================================================
// PROFILE CARD
// ============================================================================

function ProfileCard({
  profile,
  onClick,
}: {
  profile: NutritionalProfilePatient;
  onClick: () => void;
}) {
  const isActive = profile.status === 'active';
  const statusInfo = STATUS_CONFIG[profile.status];
  const goalInfo = GOAL_ADJUSTMENTS[profile.goal];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-sm ${
        isActive
          ? 'border-[#1B998B]/40 bg-[#1B998B]/5 ring-1 ring-[#1B998B]/10'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 truncate">{profile.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">{formatDate(profile.created_at)}</span>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-sm font-semibold text-gray-700">
            {profile.calculated_calories?.toLocaleString('fr-FR') || '—'} kcal
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-[#1B998B]" />
          <span className="text-sm text-gray-600">{goalInfo.label}</span>
        </div>
      </div>

      {profile.status === 'archived' && profile.archived_at && (
        <p className="text-xs text-gray-400 mt-2">
          Archivé le {formatDate(profile.archived_at)}
        </p>
      )}
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ProfileHistoryListProps {
  onViewDetail: (profileId: string) => void;
  onCompare: () => void;
  onBack: () => void;
}

export function ProfileHistoryList({
  onViewDetail,
  onCompare,
  onBack,
}: ProfileHistoryListProps) {
  const { data: profiles, isLoading, error } = usePatientProfileHistory();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-[#1B998B]" />
          <span className="ml-2 text-sm text-gray-500">Chargement de l&apos;historique...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center py-12 text-red-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">Erreur lors du chargement de l&apos;historique</span>
        </div>
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 text-center py-12">
        <p className="text-gray-500">Aucun profil dans l&apos;historique.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au profil
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">Historique des profils</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {profiles.length} profil{profiles.length > 1 ? 's' : ''} au total
            </p>
          </div>
          {profiles.length >= 2 && (
            <button
              onClick={onCompare}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1B998B] bg-[#1B998B]/10 rounded-lg hover:bg-[#1B998B]/20 transition-colors"
            >
              <GitCompare className="w-4 h-4" />
              Comparer deux profils
            </button>
          )}
        </div>

        <div className="space-y-3">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onClick={() => onViewDetail(profile.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfileHistoryList;
