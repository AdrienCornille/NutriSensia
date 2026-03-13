'use client';

import React, { useMemo } from 'react';
import {
  Loader2,
  AlertCircle,
  Edit3,
  Scale,
  Ruler,
  User,
  Calendar,
  Flame,
  Activity,
  Target,
  Beef,
  Wheat,
  Droplets,
  FileText,
  Lock,
  Hash,
  Pill,
  Zap,
} from 'lucide-react';
import { useNutritionalProfile } from '@/hooks/useNutritionistNutritionalProfiles';
import {
  calculateBMI,
  getBMIInterpretation,
  ACTIVITY_LEVELS,
  BMR_FORMULAS,
  GOAL_ADJUSTMENTS,
  SPECIAL_CASE_ADJUSTMENTS,
} from '@/lib/nutritional-profile-calculator';
import type { MicroTargets } from '@/types/nutritional-profile';

// ============================================================================
// Types
// ============================================================================

interface NutritionalProfileDetailProps {
  patientId: string;
  profileId: string;
  onBack: () => void;
  onEdit: () => void;
}

// ============================================================================
// Status Badge
// ============================================================================

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Actif', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  draft: { label: 'Brouillon', bg: 'bg-amber-50', text: 'text-amber-700' },
  archived: { label: 'Archivé', bg: 'bg-gray-100', text: 'text-gray-500' },
};

// ============================================================================
// KPI Card
// ============================================================================

function KpiCard({
  icon,
  label,
  value,
  subtitle,
  bgColor,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div className='bg-white rounded-xl p-5 border border-gray-200'>
      <div className='flex items-center gap-3 mb-2'>
        <div className={`w-9 h-9 ${bgColor} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        <p className='text-sm text-gray-500'>{label}</p>
      </div>
      <div className='text-2xl font-semibold text-gray-800'>{value}</div>
      {subtitle && <div className='text-xs text-gray-500 mt-1'>{subtitle}</div>}
    </div>
  );
}

// ============================================================================
// Calc Row
// ============================================================================

function CalcRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className='flex items-center justify-between py-2.5 border-b border-gray-50 last:border-b-0'>
      <span className='text-sm text-gray-500'>{label}</span>
      <span className={`text-sm font-medium ${accent ? 'text-[#1B998B]' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// Macro Bar
// ============================================================================

function MacroBar({
  label,
  icon,
  pct,
  grams,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  pct: number;
  grams: number | null;
  color: string;
}) {
  const barColorMap: Record<string, { bar: string; bg: string; text: string }> = {
    blue: { bar: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
    amber: { bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
    rose: { bar: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
  };
  const c = barColorMap[color] || barColorMap.blue;

  return (
    <div className={`${c.bg} rounded-lg p-4 space-y-2`}>
      <div className='flex items-center justify-between'>
        <span className='text-xs text-gray-600 flex items-center gap-1.5'>
          {icon}
          {label}
        </span>
        <span className={`text-sm font-semibold ${c.text}`}>
          {pct}%{grams !== null ? ` (${grams}g)` : ''}
        </span>
      </div>
      <div className='h-2 bg-white/50 rounded-full overflow-hidden'>
        <div
          className={`h-full ${c.bar} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Micro Targets — Categorized
// ============================================================================

const MICRO_CATEGORIES: {
  category: string;
  fields: { key: keyof MicroTargets; label: string; unit: string }[];
}[] = [
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
      { key: 'vitamin_b1_mg', label: 'Vitamine B1', unit: 'mg' },
      { key: 'vitamin_b2_mg', label: 'Vitamine B2', unit: 'mg' },
      { key: 'vitamin_b3_mg', label: 'Vitamine B3', unit: 'mg' },
      { key: 'vitamin_b6_mg', label: 'Vitamine B6', unit: 'mg' },
      { key: 'vitamin_b9_ug', label: 'Vitamine B9', unit: 'µg' },
      { key: 'vitamin_b12_ug', label: 'Vitamine B12', unit: 'µg' },
      { key: 'vitamin_c_mg', label: 'Vitamine C', unit: 'mg' },
      { key: 'vitamin_d_ug', label: 'Vitamine D', unit: 'µg' },
      { key: 'vitamin_e_mg', label: 'Vitamine E', unit: 'mg' },
      { key: 'vitamin_k_ug', label: 'Vitamine K', unit: 'µg' },
    ],
  },
  {
    category: 'Autres',
    fields: [{ key: 'cholesterol_mg', label: 'Cholestérol', unit: 'mg' }],
  },
];

// ============================================================================
// Main Component
// ============================================================================

export function NutritionalProfileDetail({
  patientId,
  profileId,
  onBack,
  onEdit,
}: NutritionalProfileDetailProps) {
  const { data: profile, isLoading, error } = useNutritionalProfile(patientId, profileId);

  const bmi = useMemo(() => {
    if (!profile) return null;
    return calculateBMI(profile.weight_kg, profile.height_cm);
  }, [profile]);

  const bmiInterpretation = useMemo(() => {
    if (!bmi) return null;
    return getBMIInterpretation(bmi);
  }, [bmi]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='w-6 h-6 animate-spin text-[#1B998B]' />
        <span className='ml-2 text-sm text-gray-500'>Chargement du profil...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <button
            onClick={onBack}
            className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors'
          >
            Retour aux profils
          </button>
        </div>
        <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
          <AlertCircle className='w-8 h-8 text-red-500 mx-auto mb-3' />
          <p className='text-gray-800 font-medium mb-1'>Erreur de chargement</p>
          <p className='text-sm text-gray-500'>{error?.message || 'Profil introuvable.'}</p>
        </div>
      </div>
    );
  }

  const s = statusConfig[profile.status] || statusConfig.draft;
  const isArchived = profile.status === 'archived';

  const createdDate = new Date(profile.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const updatedDate = new Date(profile.updated_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const bmiColorMap: Record<string, { badge: string; kpiBg: string; kpiIcon: string }> = {
    blue: { badge: 'text-blue-600 bg-blue-50', kpiBg: 'bg-blue-50', kpiIcon: 'text-blue-600' },
    green: { badge: 'text-emerald-600 bg-emerald-50', kpiBg: 'bg-emerald-50', kpiIcon: 'text-emerald-600' },
    orange: { badge: 'text-orange-600 bg-orange-50', kpiBg: 'bg-orange-50', kpiIcon: 'text-orange-600' },
    red: { badge: 'text-red-600 bg-red-50', kpiBg: 'bg-red-50', kpiIcon: 'text-red-600' },
  };
  const bmiColors = bmiInterpretation ? bmiColorMap[bmiInterpretation.color] : null;

  const goalLabel = GOAL_ADJUSTMENTS[profile.goal]?.label ?? profile.goal;
  const goalKcal = profile.goal_adjustment_kcal ?? 0;
  const specialLabel = SPECIAL_CASE_ADJUSTMENTS[profile.special_case]?.label ?? profile.special_case;
  const activityLabel = ACTIVITY_LEVELS[profile.activity_level]?.label ?? profile.activity_level;
  const activityFactor = ACTIVITY_LEVELS[profile.activity_level]?.factor ?? 1;
  const formulaLabel = BMR_FORMULAS[profile.bmr_formula]?.label ?? profile.bmr_formula;

  // Micro targets — filter filled categories
  const filledMicroCategories = profile.micro_targets
    ? MICRO_CATEGORIES
        .map((cat) => ({
          ...cat,
          fields: cat.fields.filter((f) => profile.micro_targets?.[f.key] != null),
        }))
        .filter((cat) => cat.fields.length > 0)
    : [];

  const hasNotes = !!profile.notes;
  const hasPrivateNotes = !!profile.private_notes;

  return (
    <div className='space-y-6'>
      {/* ── Header ── */}
      <div className='flex items-center justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg font-semibold text-gray-800'>{profile.name}</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
              {s.label}
            </span>
          </div>
          <div className='flex items-center gap-3 text-xs text-gray-400 mt-0.5'>
            <span className='flex items-center gap-1'>
              <Hash className='w-3 h-3' />
              v{profile.version}
            </span>
            <span className='flex items-center gap-1'>
              <Calendar className='w-3 h-3' />
              {createdDate}
            </span>
            <span>Modifié le {updatedDate}</span>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {!isArchived && (
            <button
              onClick={onEdit}
              className='flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#147569] transition-colors text-sm font-medium'
            >
              <Edit3 className='w-4 h-4' />
              Modifier
            </button>
          )}
          <button
            onClick={onBack}
            className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors'
          >
            Retour aux profils
          </button>
        </div>
      </div>

      {/* ── Row 1: Patient KPIs ── */}
      <div className='grid grid-cols-2 lg:grid-cols-5 gap-4'>
        <KpiCard
          icon={<Scale className='w-4 h-4' />}
          label='Poids'
          value={`${profile.weight_kg} kg`}
          bgColor='bg-blue-50'
          iconColor='text-blue-600'
        />
        <KpiCard
          icon={<Ruler className='w-4 h-4' />}
          label='Taille'
          value={`${profile.height_cm} cm`}
          bgColor='bg-teal-50'
          iconColor='text-teal-600'
        />
        <KpiCard
          icon={<User className='w-4 h-4' />}
          label='Âge'
          value={`${profile.age} ans`}
          subtitle={profile.gender === 'male' ? 'Homme' : 'Femme'}
          bgColor='bg-gray-100'
          iconColor='text-gray-600'
        />
        {bmi !== null && bmiInterpretation && bmiColors ? (
          <KpiCard
            icon={<Scale className='w-4 h-4' />}
            label='IMC'
            value={
              <span className='flex items-center gap-2'>
                {bmi}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bmiColors.badge}`}>
                  {bmiInterpretation.label}
                </span>
              </span>
            }
            subtitle='kg/m²'
            bgColor={bmiColors.kpiBg}
            iconColor={bmiColors.kpiIcon}
          />
        ) : (
          <KpiCard
            icon={<Scale className='w-4 h-4' />}
            label='IMC'
            value='—'
            bgColor='bg-gray-100'
            iconColor='text-gray-600'
          />
        )}
        {profile.body_fat_pct ? (
          <KpiCard
            icon={<Activity className='w-4 h-4' />}
            label='Masse grasse'
            value={`${profile.body_fat_pct}%`}
            bgColor='bg-purple-50'
            iconColor='text-purple-600'
          />
        ) : (
          <KpiCard
            icon={<Activity className='w-4 h-4' />}
            label='Activité'
            value={activityLabel}
            subtitle={`Facteur : ${activityFactor}`}
            bgColor='bg-purple-50'
            iconColor='text-purple-600'
          />
        )}
      </div>

      {/* ── Row 2: Calculs + Calories & Macros ── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left: Calculs énergétiques */}
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4'>
            <Zap className='w-4 h-4 text-[#1B998B]' />
            Calculs énergétiques
          </h3>

          <CalcRow label='Formule' value={formulaLabel} />
          <CalcRow
            label='Métabolisme de Base (MB)'
            value={profile.calculated_bmr ? `${profile.calculated_bmr.toLocaleString('fr-FR')} kcal` : '—'}
          />
          <CalcRow
            label='Niveau d&#39;activité'
            value={`${activityLabel} (x${activityFactor})`}
          />
          <CalcRow
            label='Dépense Énergétique Totale (DET)'
            value={profile.calculated_tdee ? `${profile.calculated_tdee.toLocaleString('fr-FR')} kcal` : '—'}
            accent
          />
          <CalcRow
            label='Objectif'
            value={
              <span className='flex items-center gap-2'>
                {goalLabel}
                <span className={`text-xs ${goalKcal < 0 ? 'text-blue-600' : goalKcal > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                  ({goalKcal > 0 ? '+' : ''}{goalKcal} kcal)
                </span>
              </span>
            }
          />
          {profile.special_case !== 'none' && (
            <CalcRow label='Cas particulier' value={specialLabel} />
          )}
        </div>

        {/* Right: Calories cibles + Macros */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-5'>
          {/* Target calories — prominent */}
          <div className='bg-emerald-50 rounded-xl p-5 text-center border border-emerald-100'>
            <p className='text-xs text-emerald-600 font-medium mb-1'>Calories cibles journalières</p>
            <p className='text-3xl font-bold text-emerald-700'>
              {profile.calculated_calories?.toLocaleString('fr-FR') ?? '—'}
            </p>
            <p className='text-xs text-emerald-500 mt-1'>kcal / jour</p>
          </div>

          {/* Macros */}
          <div>
            <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3'>
              <Target className='w-4 h-4 text-[#1B998B]' />
              Macronutriments
              {profile.macro_template && (
                <span className='text-xs font-normal text-gray-400'>({profile.macro_template})</span>
              )}
            </h3>
            <div className='space-y-3'>
              <MacroBar
                label='Protéines'
                icon={<Beef className='w-3.5 h-3.5 text-blue-500' />}
                pct={profile.protein_pct}
                grams={profile.calculated_protein_g}
                color='blue'
              />
              <MacroBar
                label='Glucides'
                icon={<Wheat className='w-3.5 h-3.5 text-amber-500' />}
                pct={profile.carbs_pct}
                grams={profile.calculated_carbs_g}
                color='amber'
              />
              <MacroBar
                label='Lipides'
                icon={<Droplets className='w-3.5 h-3.5 text-rose-500' />}
                pct={profile.fat_pct}
                grams={profile.calculated_fat_g}
                color='rose'
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Micronutriments ── */}
      {filledMicroCategories.length > 0 && (
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2 mb-5'>
            <Pill className='w-4 h-4 text-[#1B998B]' />
            Objectifs micronutriments
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {filledMicroCategories.map((cat) => (
              <div key={cat.category}>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
                  {cat.category}
                </p>
                <div className='space-y-2'>
                  {cat.fields.map((f) => (
                    <div
                      key={f.key}
                      className='flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2'
                    >
                      <span className='text-xs text-gray-600'>{f.label}</span>
                      <span className='text-xs font-medium text-gray-800'>
                        {profile.micro_targets![f.key]} {f.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 4: Notes ── */}
      {(hasNotes || hasPrivateNotes) && (
        <div className={`grid grid-cols-1 ${hasNotes && hasPrivateNotes ? 'lg:grid-cols-2' : ''} gap-6`}>
          {hasNotes && (
            <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-2'>
              <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                <FileText className='w-4 h-4 text-[#1B998B]' />
                Notes
              </h3>
              <p className='text-sm text-gray-600 whitespace-pre-wrap'>{profile.notes}</p>
            </div>
          )}
          {hasPrivateNotes && (
            <div className='bg-red-50 rounded-xl border border-red-100 p-6 space-y-2'>
              <h3 className='text-sm font-semibold text-red-700 flex items-center gap-2'>
                <Lock className='w-4 h-4' />
                Notes privées
                <span className='text-xs font-normal text-red-500'>(non visibles par le patient)</span>
              </h3>
              <p className='text-sm text-red-600 whitespace-pre-wrap'>{profile.private_notes}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
