'use client';

import React from 'react';
import {
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Scale,
  Flame,
  Activity,
  Target,
  Beef,
  Wheat,
  Droplets,
  Calendar,
  Ruler,
  User,
  Zap,
  GitCompare,
  Hash,
  Pill,
} from 'lucide-react';
import { useCompareProfiles } from '@/hooks/useNutritionistNutritionalProfiles';
import {
  ACTIVITY_LEVELS,
  BMR_FORMULAS,
  GOAL_ADJUSTMENTS,
  SPECIAL_CASE_ADJUSTMENTS,
} from '@/lib/nutritional-profile-calculator';
import type { NutritionalProfile, MicroTargets } from '@/types/nutritional-profile';

// ============================================================================
// Types
// ============================================================================

interface NutritionalProfileCompareProps {
  patientId: string;
  profileAId: string;
  profileBId: string;
  onBack: () => void;
}

// ============================================================================
// Status config
// ============================================================================

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Actif', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  draft: { label: 'Brouillon', bg: 'bg-amber-50', text: 'text-amber-700' },
  archived: { label: 'Archivé', bg: 'bg-gray-100', text: 'text-gray-500' },
};

// ============================================================================
// Micro display config
// ============================================================================

const MICRO_DISPLAY: { category: string; fields: { key: keyof MicroTargets; label: string; unit: string }[] }[] = [
  {
    category: 'Fibres',
    fields: [{ key: 'fiber_g', label: 'Fibres', unit: 'g' }],
  },
  {
    category: 'Minéraux',
    fields: [
      { key: 'sodium_mg', label: 'Sodium', unit: 'mg' },
      { key: 'calcium_mg', label: 'Calcium', unit: 'mg' },
      { key: 'iron_mg', label: 'Fer', unit: 'mg' },
      { key: 'magnesium_mg', label: 'Magnésium', unit: 'mg' },
      { key: 'phosphorus_mg', label: 'Phosphore', unit: 'mg' },
      { key: 'potassium_mg', label: 'Potassium', unit: 'mg' },
      { key: 'zinc_mg', label: 'Zinc', unit: 'mg' },
    ],
  },
  {
    category: 'Vitamines',
    fields: [
      { key: 'vitamin_a_ug', label: 'Vitamine A', unit: 'µg' },
      { key: 'vitamin_b1_mg', label: 'Vit. B1', unit: 'mg' },
      { key: 'vitamin_b2_mg', label: 'Vit. B2', unit: 'mg' },
      { key: 'vitamin_b3_mg', label: 'Vit. B3', unit: 'mg' },
      { key: 'vitamin_b6_mg', label: 'Vit. B6', unit: 'mg' },
      { key: 'vitamin_b9_ug', label: 'Vit. B9', unit: 'µg' },
      { key: 'vitamin_b12_ug', label: 'Vit. B12', unit: 'µg' },
      { key: 'vitamin_c_mg', label: 'Vit. C', unit: 'mg' },
      { key: 'vitamin_d_ug', label: 'Vit. D', unit: 'µg' },
      { key: 'vitamin_e_mg', label: 'Vit. E', unit: 'mg' },
      { key: 'vitamin_k_ug', label: 'Vit. K', unit: 'µg' },
    ],
  },
  {
    category: 'Autres',
    fields: [{ key: 'cholesterol_mg', label: 'Cholestérol', unit: 'mg' }],
  },
];

// ============================================================================
// Delta Indicator
// ============================================================================

function DeltaIndicator({ value, unit, invert, decimals = 0 }: { value: number; unit: string; invert?: boolean; decimals?: number }) {
  if (value == null) {
    return (
      <span className='inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full'>
        <Minus className='w-3 h-3' /> — {unit}
      </span>
    );
  }
  // Round to avoid floating point artifacts
  const rounded = Number(value.toFixed(decimals));

  if (rounded === 0) {
    return (
      <span className='inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full'>
        <Minus className='w-3 h-3' /> 0 {unit}
      </span>
    );
  }

  const isPositive = invert ? rounded < 0 : rounded > 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-orange-700 bg-orange-50'
      }`}
    >
      {rounded > 0 ? <ArrowUp className='w-3 h-3' /> : <ArrowDown className='w-3 h-3' />}
      {rounded > 0 ? '+' : ''}{rounded} {unit}
    </span>
  );
}

// ============================================================================
// Profile Summary Card (inside the header)
// ============================================================================

function ProfileSummaryCard({ profile, label, accent }: { profile: NutritionalProfile; label: string; accent: string }) {
  const s = statusConfig[profile.status] || statusConfig.draft;
  const date = new Date(profile.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={`flex-1 rounded-xl border-2 ${accent} p-4 space-y-2`}>
      <div className='flex items-center gap-2'>
        <span className='text-xs font-bold text-gray-400 uppercase tracking-wider'>{label}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
          {s.label}
        </span>
      </div>
      <p className='text-base font-semibold text-gray-800'>{profile.name}</p>
      <div className='flex items-center gap-3 text-xs text-gray-400'>
        <span className='flex items-center gap-1'>
          <Hash className='w-3 h-3' />
          v{profile.version}
        </span>
        <span className='flex items-center gap-1'>
          <Calendar className='w-3 h-3' />
          {date}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Comparison Table
// ============================================================================

function CompareTable({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: {
    label: string;
    valueA: string;
    valueB: string;
    delta?: number;
    unit?: string;
    invert?: boolean;
    highlight?: boolean;
    decimals?: number;
  }[];
}) {
  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4'>
        {icon}
        {title}
      </h3>

      {/* Table header */}
      <div className='grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-3 pb-3 border-b border-gray-200'>
        <span className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Paramètre</span>
        <span className='text-xs font-medium text-blue-600 text-center uppercase tracking-wider'>Profil A</span>
        <span className='text-xs font-medium text-violet-600 text-center uppercase tracking-wider'>Profil B</span>
        <span className='text-xs font-medium text-gray-400 text-right w-24 uppercase tracking-wider'>Évolution</span>
      </div>

      {/* Table rows */}
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-3 py-3 border-b border-gray-50 last:border-b-0 ${
            row.highlight ? 'bg-emerald-50/50 -mx-6 px-6 rounded-lg' : ''
          } ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
        >
          <span className={`text-sm ${row.highlight ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
            {row.label}
          </span>
          <span className={`text-sm font-medium text-center ${row.highlight ? 'text-blue-700 font-bold' : 'text-gray-800'}`}>
            {row.valueA}
          </span>
          <span className={`text-sm font-medium text-center ${row.highlight ? 'text-violet-700 font-bold' : 'text-gray-800'}`}>
            {row.valueB}
          </span>
          <div className='w-24 flex justify-end'>
            {row.delta !== undefined && row.unit ? (
              <DeltaIndicator value={row.delta} unit={row.unit} invert={row.invert} decimals={row.decimals} />
            ) : (
              <span className='w-24' />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Macro Compare Visual
// ============================================================================

function MacroCompareVisual({
  label,
  icon,
  color,
  pctA,
  pctB,
  gramsA,
  gramsB,
  deltaG,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  pctA: number;
  pctB: number;
  gramsA: number | null;
  gramsB: number | null;
  deltaG: number;
}) {
  const colorMap: Record<string, { bar: string; bgA: string; bgB: string; textA: string; textB: string }> = {
    blue: { bar: 'bg-blue-500', bgA: 'bg-blue-50', bgB: 'bg-blue-50', textA: 'text-blue-700', textB: 'text-blue-700' },
    amber: { bar: 'bg-amber-500', bgA: 'bg-amber-50', bgB: 'bg-amber-50', textA: 'text-amber-700', textB: 'text-amber-700' },
    rose: { bar: 'bg-rose-500', bgA: 'bg-rose-50', bgB: 'bg-rose-50', textA: 'text-rose-700', textB: 'text-rose-700' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <span className='text-sm text-gray-700 flex items-center gap-2 font-medium'>
          {icon}
          {label}
        </span>
        <DeltaIndicator value={deltaG} unit='g' />
      </div>

      {/* Side by side bars */}
      <div className='grid grid-cols-2 gap-4'>
        {/* Profile A */}
        <div className={`${c.bgA} rounded-lg p-3`}>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs font-medium text-blue-600'>Profil A</span>
            <span className={`text-sm font-semibold ${c.textA}`}>
              {pctA}%{gramsA !== null ? ` · ${gramsA}g` : ''}
            </span>
          </div>
          <div className='h-2 bg-white/60 rounded-full overflow-hidden'>
            <div className={`h-full ${c.bar} rounded-full transition-all`} style={{ width: `${pctA}%` }} />
          </div>
        </div>

        {/* Profile B */}
        <div className={`${c.bgB} rounded-lg p-3`}>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs font-medium text-violet-600'>Profil B</span>
            <span className={`text-sm font-semibold ${c.textB}`}>
              {pctB}%{gramsB !== null ? ` · ${gramsB}g` : ''}
            </span>
          </div>
          <div className='h-2 bg-white/60 rounded-full overflow-hidden'>
            <div className={`h-full ${c.bar} rounded-full transition-all`} style={{ width: `${pctB}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function NutritionalProfileCompare({
  patientId,
  profileAId,
  profileBId,
  onBack,
}: NutritionalProfileCompareProps) {
  const { data: comparison, isLoading, error } = useCompareProfiles(patientId, profileAId, profileBId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        <span className='ml-2 text-sm text-gray-500'>Chargement de la comparaison...</span>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <button
            onClick={onBack}
            className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors'
          >
            Annuler
          </button>
        </div>
        <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
          <AlertCircle className='w-8 h-8 text-red-500 mx-auto mb-3' />
          <p className='text-gray-800 font-medium mb-1'>Erreur de chargement</p>
          <p className='text-sm text-gray-500'>{error?.message || 'Impossible de charger la comparaison.'}</p>
        </div>
      </div>
    );
  }

  const { profile_a: a, profile_b: b, deltas } = comparison;

  return (
    <div className='space-y-6'>
      {/* ── Header ── */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <GitCompare className='w-5 h-5 text-[#1B998B]' />
            Comparaison de profils
          </h2>
          <p className='text-xs text-gray-400 mt-0.5'>
            Visualisez les différences entre deux profils nutritionnels
          </p>
        </div>
        <button
          onClick={onBack}
          className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors'
        >
          Annuler
        </button>
      </div>

      {/* ── Profile Summary Cards ── */}
      <div className='flex gap-4'>
        <ProfileSummaryCard profile={a} label='Profil A' accent='border-blue-200 bg-blue-50/30' />
        <ProfileSummaryCard profile={b} label='Profil B' accent='border-violet-200 bg-violet-50/30' />
      </div>

      {/* ── Calories Comparison (prominent) ── */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4'>
          <Zap className='w-4 h-4 text-[#1B998B]' />
          Calories cibles journalières
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-emerald-50 rounded-xl p-5 text-center border border-emerald-100'>
            <p className='text-xs font-medium text-blue-600 mb-1'>Profil A</p>
            <p className='text-3xl font-bold text-emerald-700'>
              {a.calculated_calories?.toLocaleString('fr-FR') ?? '—'}
            </p>
            <p className='text-xs text-emerald-500 mt-1'>kcal / jour</p>
          </div>
          <div className='bg-emerald-50 rounded-xl p-5 text-center border border-emerald-100'>
            <p className='text-xs font-medium text-violet-600 mb-1'>Profil B</p>
            <p className='text-3xl font-bold text-emerald-700'>
              {b.calculated_calories?.toLocaleString('fr-FR') ?? '—'}
            </p>
            <p className='text-xs text-emerald-500 mt-1'>kcal / jour</p>
          </div>
        </div>
        <div className='flex items-center justify-center mt-4'>
          <DeltaIndicator value={deltas.calories} unit='kcal' />
        </div>
      </div>

      {/* ── Patient Data ── */}
      <CompareTable
        title='Données patient'
        icon={<User className='w-4 h-4 text-[#1B998B]' />}
        rows={[
          { label: 'Poids', valueA: `${a.weight_kg} kg`, valueB: `${b.weight_kg} kg`, delta: deltas.weight_kg, unit: 'kg', decimals: 1 },
          { label: 'Taille', valueA: `${a.height_cm} cm`, valueB: `${b.height_cm} cm` },
          { label: 'Âge', valueA: `${a.age} ans`, valueB: `${b.age} ans` },
          { label: 'Genre', valueA: a.gender === 'male' ? 'Homme' : 'Femme', valueB: b.gender === 'male' ? 'Homme' : 'Femme' },
          ...(a.body_fat_pct || b.body_fat_pct
            ? [{ label: 'Masse grasse', valueA: a.body_fat_pct ? `${a.body_fat_pct}%` : '—', valueB: b.body_fat_pct ? `${b.body_fat_pct}%` : '—' }]
            : []),
        ]}
      />

      {/* ── Calculs énergétiques ── */}
      <CompareTable
        title='Calculs énergétiques'
        icon={<Flame className='w-4 h-4 text-[#1B998B]' />}
        rows={[
          {
            label: 'Formule',
            valueA: BMR_FORMULAS[a.bmr_formula]?.label ?? a.bmr_formula,
            valueB: BMR_FORMULAS[b.bmr_formula]?.label ?? b.bmr_formula,
          },
          {
            label: 'Métabolisme de Base (MB)',
            valueA: a.calculated_bmr ? `${a.calculated_bmr.toLocaleString('fr-FR')} kcal` : '—',
            valueB: b.calculated_bmr ? `${b.calculated_bmr.toLocaleString('fr-FR')} kcal` : '—',
            delta: deltas.bmr,
            unit: 'kcal',
          },
          {
            label: 'Niveau d\'activité',
            valueA: ACTIVITY_LEVELS[a.activity_level]?.label ?? a.activity_level,
            valueB: ACTIVITY_LEVELS[b.activity_level]?.label ?? b.activity_level,
          },
          {
            label: 'Dépense Énergétique Totale (DET)',
            valueA: a.calculated_tdee ? `${a.calculated_tdee.toLocaleString('fr-FR')} kcal` : '—',
            valueB: b.calculated_tdee ? `${b.calculated_tdee.toLocaleString('fr-FR')} kcal` : '—',
            delta: deltas.tdee,
            unit: 'kcal',
          },
          {
            label: 'Objectif',
            valueA: GOAL_ADJUSTMENTS[a.goal]?.label ?? a.goal,
            valueB: GOAL_ADJUSTMENTS[b.goal]?.label ?? b.goal,
          },
          ...(a.special_case !== 'none' || b.special_case !== 'none'
            ? [{
                label: 'Cas particulier',
                valueA: SPECIAL_CASE_ADJUSTMENTS[a.special_case]?.label ?? a.special_case,
                valueB: SPECIAL_CASE_ADJUSTMENTS[b.special_case]?.label ?? b.special_case,
              }]
            : []),
        ]}
      />

      {/* ── Macronutriments ── */}
      <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-6'>
        <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
          <Target className='w-4 h-4 text-[#1B998B]' />
          Répartition des macronutriments
        </h3>

        <MacroCompareVisual
          label='Protéines'
          icon={<Beef className='w-4 h-4 text-blue-500' />}
          color='blue'
          pctA={a.protein_pct}
          pctB={b.protein_pct}
          gramsA={a.calculated_protein_g}
          gramsB={b.calculated_protein_g}
          deltaG={deltas.protein_g}
        />
        <MacroCompareVisual
          label='Glucides'
          icon={<Wheat className='w-4 h-4 text-amber-500' />}
          color='amber'
          pctA={a.carbs_pct}
          pctB={b.carbs_pct}
          gramsA={a.calculated_carbs_g}
          gramsB={b.calculated_carbs_g}
          deltaG={deltas.carbs_g}
        />
        <MacroCompareVisual
          label='Lipides'
          icon={<Droplets className='w-4 h-4 text-rose-500' />}
          color='rose'
          pctA={a.fat_pct}
          pctB={b.fat_pct}
          gramsA={a.calculated_fat_g}
          gramsB={b.calculated_fat_g}
          deltaG={deltas.fat_g}
        />
      </div>

      {/* ── Micronutriments ── */}
      {(() => {
        const microA = a.micro_targets || {};
        const microB = b.micro_targets || {};

        // Collect all fields that have at least one value in A or B
        const filledCategories = MICRO_DISPLAY
          .map((cat) => ({
            ...cat,
            fields: cat.fields.filter((f) => microA[f.key] != null || microB[f.key] != null),
          }))
          .filter((cat) => cat.fields.length > 0);

        if (filledCategories.length === 0) return null;

        return (
          <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
            <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
              <Pill className='w-4 h-4 text-[#1B998B]' />
              Objectifs micronutriments
            </h3>

            {filledCategories.map((cat) => (
              <div key={cat.category}>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                  {cat.category}
                </p>

                {/* Table header */}
                <div className='grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-3 pb-2 border-b border-gray-200'>
                  <span className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Nutriment</span>
                  <span className='text-xs font-medium text-blue-600 text-center uppercase tracking-wider'>Profil A</span>
                  <span className='text-xs font-medium text-violet-600 text-center uppercase tracking-wider'>Profil B</span>
                  <span className='text-xs font-medium text-gray-400 text-right w-24 uppercase tracking-wider'>Évolution</span>
                </div>

                {cat.fields.map((f, i) => {
                  const valA = microA[f.key];
                  const valB = microB[f.key];
                  const delta = (valB ?? 0) - (valA ?? 0);
                  const hasBoth = valA != null && valB != null;

                  return (
                    <div
                      key={f.key}
                      className={`grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-3 py-2.5 border-b border-gray-50 last:border-b-0 ${
                        i % 2 === 0 ? '' : 'bg-gray-50/30'
                      }`}
                    >
                      <span className='text-sm text-gray-600'>{f.label}</span>
                      <span className='text-sm font-medium text-center text-gray-800'>
                        {valA != null ? `${valA} ${f.unit}` : '—'}
                      </span>
                      <span className='text-sm font-medium text-center text-gray-800'>
                        {valB != null ? `${valB} ${f.unit}` : '—'}
                      </span>
                      <div className='w-24 flex justify-end'>
                        {hasBoth ? (
                          <DeltaIndicator value={delta} unit={f.unit} decimals={1} />
                        ) : (
                          <span className='w-24' />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
