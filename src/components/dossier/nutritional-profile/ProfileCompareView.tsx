'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useComparePatientProfiles } from '@/hooks/usePatientNutritionalProfile';
import type { NutritionalProfilePatient } from '@/types/nutritional-profile';
import {
  ACTIVITY_LEVELS,
  GOAL_ADJUSTMENTS,
  BMR_FORMULAS,
  calculateBMI,
  getBMIInterpretation,
} from '@/lib/nutritional-profile-calculator';

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Render a delta indicator with color.
 * Positive = green (improvement by default), negative = red.
 * For weight/fat, positive might be neutral depending on goal; we keep it simple.
 */
function DeltaIndicator({
  value,
  unit,
  invertColor = false,
}: {
  value: number;
  unit: string;
  invertColor?: boolean;
}) {
  if (value === 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Minus className="w-3 h-3" />
        0 {unit}
      </span>
    );
  }

  const isPositive = value > 0;
  // By default: positive = green, negative = red. invertColor reverses this.
  const isGreen = invertColor ? !isPositive : isPositive;

  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium ${
        isGreen ? 'text-green-600' : 'text-red-500'
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isPositive ? '+' : ''}{value} {unit}
    </span>
  );
}

// ============================================================================
// COMPARISON ROW
// ============================================================================

function ComparisonRow({
  label,
  valueA,
  valueB,
  delta,
  unit,
  invertColor = false,
}: {
  label: string;
  valueA: string;
  valueB: string;
  delta?: number;
  unit?: string;
  invertColor?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm text-gray-600 text-center">{valueA}</span>
      <span className="text-sm text-gray-600 text-center">{valueB}</span>
      <div className="w-24 text-right">
        {delta !== undefined && unit ? (
          <DeltaIndicator value={delta} unit={unit} invertColor={invertColor} />
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PROFILE SELECTOR
// ============================================================================

function ProfileSelector({
  label,
  profiles,
  selectedId,
  onChange,
  disabledId,
}: {
  label: string;
  profiles: NutritionalProfilePatient[];
  selectedId: string | null;
  onChange: (id: string) => void;
  disabledId: string | null;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <select
        value={selectedId || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B] bg-white"
      >
        <option value="">Sélectionner un profil...</option>
        {profiles.map((p) => (
          <option key={p.id} value={p.id} disabled={p.id === disabledId}>
            {p.name} ({formatDate(p.created_at)})
            {p.status === 'active' ? ' - Actif' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// COMPARISON CONTENT
// ============================================================================

function ComparisonContent({
  profileA,
  profileB,
  deltas,
}: {
  profileA: NutritionalProfilePatient;
  profileB: NutritionalProfilePatient;
  deltas: {
    calories: number;
    bmr: number;
    tdee: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    weight_kg: number;
  };
}) {
  const bmiA = calculateBMI(profileA.weight_kg, profileA.height_cm);
  const bmiB = calculateBMI(profileB.weight_kg, profileB.height_cm);
  const bmiDelta = Math.round((bmiB - bmiA) * 10) / 10;

  const activityA = ACTIVITY_LEVELS[profileA.activity_level];
  const activityB = ACTIVITY_LEVELS[profileB.activity_level];
  const goalA = GOAL_ADJUSTMENTS[profileA.goal];
  const goalB = GOAL_ADJUSTMENTS[profileB.goal];

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 pb-2 border-b-2 border-gray-200">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Indicateur
        </span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
          {profileA.name}
        </span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
          {profileB.name}
        </span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-24 text-right">
          Évolution
        </span>
      </div>

      {/* Données de base */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Données de base
        </h3>
        <div className="bg-white rounded-lg border border-gray-100 px-4">
          <ComparisonRow
            label="Poids"
            valueA={`${profileA.weight_kg} kg`}
            valueB={`${profileB.weight_kg} kg`}
            delta={deltas.weight_kg}
            unit="kg"
            invertColor
          />
          <ComparisonRow
            label="Taille"
            valueA={`${profileA.height_cm} cm`}
            valueB={`${profileB.height_cm} cm`}
          />
          <ComparisonRow
            label="IMC"
            valueA={`${bmiA} (${getBMIInterpretation(bmiA).label})`}
            valueB={`${bmiB} (${getBMIInterpretation(bmiB).label})`}
            delta={bmiDelta}
            unit=""
            invertColor
          />
          <ComparisonRow
            label="Activité"
            valueA={activityA.label}
            valueB={activityB.label}
          />
          <ComparisonRow
            label="Objectif"
            valueA={goalA.label}
            valueB={goalB.label}
          />
        </div>
      </div>

      {/* Calculs */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Calculs énergétiques
        </h3>
        <div className="bg-white rounded-lg border border-gray-100 px-4">
          <ComparisonRow
            label="BMR"
            valueA={`${profileA.calculated_bmr?.toLocaleString('fr-FR')} kcal`}
            valueB={`${profileB.calculated_bmr?.toLocaleString('fr-FR')} kcal`}
            delta={deltas.bmr}
            unit="kcal"
          />
          <ComparisonRow
            label="TDEE"
            valueA={`${profileA.calculated_tdee?.toLocaleString('fr-FR')} kcal`}
            valueB={`${profileB.calculated_tdee?.toLocaleString('fr-FR')} kcal`}
            delta={deltas.tdee}
            unit="kcal"
          />
          <ComparisonRow
            label="Calories cible"
            valueA={`${profileA.calculated_calories?.toLocaleString('fr-FR')} kcal`}
            valueB={`${profileB.calculated_calories?.toLocaleString('fr-FR')} kcal`}
            delta={deltas.calories}
            unit="kcal"
          />
        </div>
      </div>

      {/* Macros */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Macronutriments
        </h3>
        <div className="bg-white rounded-lg border border-gray-100 px-4">
          <ComparisonRow
            label="Protéines"
            valueA={`${profileA.calculated_protein_g}g (${profileA.protein_pct}%)`}
            valueB={`${profileB.calculated_protein_g}g (${profileB.protein_pct}%)`}
            delta={deltas.protein_g}
            unit="g"
          />
          <ComparisonRow
            label="Glucides"
            valueA={`${profileA.calculated_carbs_g}g (${profileA.carbs_pct}%)`}
            valueB={`${profileB.calculated_carbs_g}g (${profileB.carbs_pct}%)`}
            delta={deltas.carbs_g}
            unit="g"
          />
          <ComparisonRow
            label="Lipides"
            valueA={`${profileA.calculated_fat_g}g (${profileA.fat_pct}%)`}
            valueB={`${profileB.calculated_fat_g}g (${profileB.fat_pct}%)`}
            delta={deltas.fat_g}
            unit="g"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ProfileCompareViewProps {
  profiles: NutritionalProfilePatient[];
  onBack: () => void;
}

export function ProfileCompareView({ profiles, onBack }: ProfileCompareViewProps) {
  const [profileAId, setProfileAId] = useState<string | null>(
    profiles.length >= 2 ? profiles[1]?.id || null : null
  );
  const [profileBId, setProfileBId] = useState<string | null>(
    profiles.length >= 1 ? profiles[0]?.id || null : null
  );

  const { data: comparison, isLoading, error } = useComparePatientProfiles(
    profileAId,
    profileBId
  );

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Comparer deux profils</h2>
        <p className="text-sm text-gray-500 mb-5">
          Sélectionnez deux profils pour voir l&apos;évolution de vos paramètres nutritionnels.
        </p>

        {/* Profile selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <ProfileSelector
            label="Premier profil (avant)"
            profiles={profiles}
            selectedId={profileAId}
            onChange={setProfileAId}
            disabledId={profileBId}
          />
          <ProfileSelector
            label="Second profil (apres)"
            profiles={profiles}
            selectedId={profileBId}
            onChange={setProfileBId}
            disabledId={profileAId}
          />
        </div>

        {/* Comparison content */}
        {!profileAId || !profileBId ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">
              Sélectionnez deux profils pour afficher la comparaison.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-[#1B998B]" />
            <span className="ml-2 text-sm text-gray-500">Chargement de la comparaison...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-500">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">Erreur lors de la comparaison</span>
          </div>
        ) : comparison ? (
          <ComparisonContent
            profileA={comparison.profile_a as NutritionalProfilePatient}
            profileB={comparison.profile_b as NutritionalProfilePatient}
            deltas={comparison.deltas}
          />
        ) : null}
      </div>
    </div>
  );
}

export default ProfileCompareView;
