'use client';

import React, { useState } from 'react';
import {
  Loader2,
  AlertCircle,
  User,
  Calculator,
  Target,
  Apple,
  Pill,
  FileText,
  Lightbulb,
  History,
  ChevronDown,
  Scale,
  Ruler,
  Clock,
  Users,
  Activity,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import {
  usePatientActiveProfile,
  usePatientProfileHistory,
  usePatientProfileDetail,
} from '@/hooks/usePatientNutritionalProfile';
import type { NutritionalProfilePatient } from '@/types/nutritional-profile';
import {
  ACTIVITY_LEVELS,
  GOAL_ADJUSTMENTS,
  SPECIAL_CASE_ADJUSTMENTS,
  BMR_FORMULAS,
  MACRO_TEMPLATES,
  calculateBMI,
  getBMIInterpretation,
  getBodyFatInterpretation,
} from '@/lib/nutritional-profile-calculator';
import { CalculationExplanationModal } from './CalculationExplanationModal';
import { ProfileHistoryList } from './ProfileHistoryList';
import { ProfileCompareView } from './ProfileCompareView';
import { ProfilePDFExport } from './ProfilePDFExport';

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

const GENDER_LABELS: Record<string, string> = {
  male: 'Homme',
  female: 'Femme',
};

const MICRO_LABELS: Record<string, { label: string; unit: string }> = {
  fiber_g: { label: 'Fibres', unit: 'g' },
  sodium_mg: { label: 'Sodium', unit: 'mg' },
  calcium_mg: { label: 'Calcium', unit: 'mg' },
  iron_mg: { label: 'Fer', unit: 'mg' },
  magnesium_mg: { label: 'Magnésium', unit: 'mg' },
  phosphorus_mg: { label: 'Phosphore', unit: 'mg' },
  potassium_mg: { label: 'Potassium', unit: 'mg' },
  zinc_mg: { label: 'Zinc', unit: 'mg' },
  vitamin_a_ug: { label: 'Vitamine A', unit: 'µg' },
  vitamin_b1_mg: { label: 'Vitamine B1', unit: 'mg' },
  vitamin_b2_mg: { label: 'Vitamine B2', unit: 'mg' },
  vitamin_b3_mg: { label: 'Vitamine B3', unit: 'mg' },
  vitamin_b6_mg: { label: 'Vitamine B6', unit: 'mg' },
  vitamin_b9_ug: { label: 'Vitamine B9 (Folate)', unit: 'µg' },
  vitamin_b12_ug: { label: 'Vitamine B12', unit: 'µg' },
  vitamin_c_mg: { label: 'Vitamine C', unit: 'mg' },
  vitamin_d_ug: { label: 'Vitamine D', unit: 'µg' },
  vitamin_e_mg: { label: 'Vitamine E', unit: 'mg' },
  vitamin_k_ug: { label: 'Vitamine K', unit: 'µg' },
  cholesterol_mg: { label: 'Cholestérol', unit: 'mg' },
};

const MICRO_CATEGORIES = [
  {
    label: 'Fibres',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100',
    textColor: 'text-green-700',
    dotColor: 'bg-green-500',
    keys: ['fiber_g'],
  },
  {
    label: 'Minéraux',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
    keys: ['sodium_mg', 'calcium_mg', 'iron_mg', 'magnesium_mg', 'phosphorus_mg', 'potassium_mg', 'zinc_mg'],
  },
  {
    label: 'Vitamines',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-100',
    textColor: 'text-orange-700',
    dotColor: 'bg-orange-500',
    keys: ['vitamin_a_ug', 'vitamin_b1_mg', 'vitamin_b2_mg', 'vitamin_b3_mg', 'vitamin_b6_mg', 'vitamin_b9_ug', 'vitamin_b12_ug', 'vitamin_c_mg', 'vitamin_d_ug', 'vitamin_e_mg', 'vitamin_k_ug'],
  },
  {
    label: 'Autres',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-100',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-500',
    keys: ['cholesterol_mg'],
  },
];

// ============================================================================
// BMI BADGE
// ============================================================================

function BMIBadge({ bmi }: { bmi: number }) {
  const interpretation = getBMIInterpretation(bmi);

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${colorClasses[interpretation.color] || 'bg-gray-100 text-gray-700'}`}
    >
      IMC {bmi} - {interpretation.label}
    </span>
  );
}

// ============================================================================
// BODY FAT BADGE
// ============================================================================

function BodyFatBadge({ bodyFatPct, gender }: { bodyFatPct: number; gender: string }) {
  const interpretation = getBodyFatInterpretation(bodyFatPct, gender as 'male' | 'female');

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${colorClasses[interpretation.color] || 'bg-gray-100 text-gray-700'}`}
    >
      {bodyFatPct}% - {interpretation.label}
    </span>
  );
}

// ============================================================================
// INFO MODAL
// ============================================================================

type InfoTopic = 'bmi' | 'body_fat';

const INFO_CONTENT: Record<InfoTopic, { title: string; sections: { heading: string; content: string }[] }> = {
  bmi: {
    title: 'Indice de Masse Corporelle (IMC)',
    sections: [
      {
        heading: 'Définition',
        content:
          'L\'IMC est un indicateur simple du rapport entre le poids et la taille, utilisé pour évaluer le statut pondéral d\'un adulte.\n\n' +
          'Formule : IMC = poids (kg) / taille² (m²)',
      },
      {
        heading: 'Classification OMS',
        content:
          '• < 18.5 : Insuffisance pondérale\n' +
          '• 18.5 – 24.9 : Poids normal\n' +
          '• 25.0 – 29.9 : Surpoids\n' +
          '• 30.0 – 34.9 : Obésité classe I\n' +
          '• 35.0 – 39.9 : Obésité classe II\n' +
          '• ≥ 40.0 : Obésité classe III',
      },
      {
        heading: 'Limites',
        content:
          'L\'IMC ne distingue pas la masse grasse de la masse musculaire. Il peut surestimer l\'adiposité chez les sportifs et la sous-estimer chez les personnes âgées.\n\n' +
          'Source : Organisation Mondiale de la Santé (OMS).',
      },
    ],
  },
  body_fat: {
    title: 'Taux de masse grasse',
    sections: [
      {
        heading: 'Définition',
        content:
          'Le taux de masse grasse représente le pourcentage de graisse corporelle par rapport au poids total. Il est un indicateur complémentaire à l\'IMC pour évaluer la composition corporelle.',
      },
      {
        heading: 'Classification ACE (Femmes)',
        content:
          '• < 14% : Essentiel\n' +
          '• 14 – 20% : Athlète\n' +
          '• 21 – 24% : Fitness\n' +
          '• 25 – 31% : Acceptable\n' +
          '• > 31% : Excès',
      },
      {
        heading: 'Classification ACE (Hommes)',
        content:
          '• < 6% : Essentiel\n' +
          '• 6 – 13% : Athlète\n' +
          '• 14 – 17% : Fitness\n' +
          '• 18 – 24% : Acceptable\n' +
          '• > 24% : Excès',
      },
      {
        heading: 'Source',
        content: 'American Council on Exercise (ACE).',
      },
    ],
  },
};

function InfoModal({ topic, onClose }: { topic: InfoTopic; onClose: () => void }) {
  const info = INFO_CONTENT[topic];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#1B998B]" />
            {info.title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4 space-y-4">
          {info.sections.map((section, i) => (
            <div key={i} className="space-y-1.5">
              <h4 className="text-sm font-medium text-gray-800">{section.heading}</h4>
              <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
              {i < info.sections.length - 1 && <div className="border-b border-gray-100 pt-2" />}
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MACRO CARD
// ============================================================================

function MacroCard({
  label,
  pct,
  grams,
  bgColor,
  textColor,
  barColor,
}: {
  label: string;
  pct: number;
  grams: number | null;
  bgColor: string;
  textColor: string;
  barColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full bg-white/60 font-semibold ${textColor}`}>
          {pct}%
        </span>
      </div>
      {grams !== null && (
        <div className="flex items-baseline gap-1 mb-3">
          <span className={`text-2xl font-bold ${textColor}`}>{grams}</span>
          <span className="text-sm text-gray-500">g</span>
        </div>
      )}
      <div className="h-2.5 bg-white/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// COLLAPSIBLE SECTION
// ============================================================================

function CollapsibleSection({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1B998B]/10 rounded-lg flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-[#1B998B]" />
          </div>
          <span className="font-medium text-gray-800">{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROFILE CONTENT
// ============================================================================

function ProfileContent({ profile }: { profile: NutritionalProfilePatient }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [detailProfileId, setDetailProfileId] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<InfoTopic | null>(null);

  const { data: historyProfiles } = usePatientProfileHistory();
  const hasMultipleProfiles = (historyProfiles?.length ?? 0) > 1;

  const bmi = calculateBMI(profile.weight_kg, profile.height_cm);
  const activityInfo = ACTIVITY_LEVELS[profile.activity_level] ?? { label: profile.activity_level, description: '', factor: 1 };
  const goalInfo = GOAL_ADJUSTMENTS[profile.goal as keyof typeof GOAL_ADJUSTMENTS] ?? { label: profile.goal, kcal: 0, description: '' };
  const specialCaseInfo = SPECIAL_CASE_ADJUSTMENTS[profile.special_case as keyof typeof SPECIAL_CASE_ADJUSTMENTS] ?? { label: profile.special_case, kcal: 0 };
  const formulaInfo = BMR_FORMULAS[profile.bmr_formula as keyof typeof BMR_FORMULAS] ?? { label: profile.bmr_formula, description: '', requiresBodyFat: false };
  const macroTemplateLabel = profile.macro_template
    ? MACRO_TEMPLATES[profile.macro_template as keyof typeof MACRO_TEMPLATES]?.label || profile.macro_template
    : null;

  // Micro targets as array of { key, label, value, unit }
  const microTargets = profile.micro_targets
    ? Object.entries(profile.micro_targets)
        .filter(([, val]) => val !== null && val !== undefined)
        .map(([key, val]) => ({
          key,
          label: MICRO_LABELS[key]?.label || key,
          value: val as number,
          unit: MICRO_LABELS[key]?.unit || '',
        }))
    : [];

  // ---- Sub-views ----
  if (showHistory && !showCompare && !detailProfileId) {
    return (
      <ProfileHistoryList
        onViewDetail={(id) => setDetailProfileId(id)}
        onCompare={() => setShowCompare(true)}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  if (showCompare && historyProfiles) {
    return (
      <ProfileCompareView
        profiles={historyProfiles}
        onBack={() => {
          setShowCompare(false);
          // Stay in history if we came from there
        }}
      />
    );
  }

  // Handle detail view from history (re-renders the profile content for a specific profile)
  if (detailProfileId && detailProfileId !== profile.id) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setDetailProfileId(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>&larr;</span>
          <span>Retour à l&apos;historique</span>
        </button>
        <ProfileDetailView profileId={detailProfileId} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - hero style */}
      <div className="bg-gradient-to-br from-[#1B998B]/5 via-white to-teal-50 rounded-xl border border-[#1B998B]/10 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1B998B] to-teal-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">
                  Créé le {formatDate(profile.created_at)}
                </span>
                {profile.updated_at !== profile.created_at && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm text-gray-500">
                      Mis à jour le {formatDate(profile.updated_at)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#1B998B]/15 text-[#1B998B] border border-[#1B998B]/20">
              Profil actif
            </span>
            <ProfilePDFExport profileId={profile.id} />
          </div>
        </div>
      </div>

      {/* Mes données de base */}
      <CollapsibleSection icon={User} title="Mes données de base">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 bg-[#1B998B]/10 rounded-lg flex items-center justify-center">
                <Scale className="w-3.5 h-3.5 text-[#1B998B]" />
              </div>
              <span className="text-xs font-medium text-gray-500">Poids</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{profile.weight_kg} <span className="text-sm font-normal text-gray-500">kg</span></p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 bg-[#1B998B]/10 rounded-lg flex items-center justify-center">
                <Ruler className="w-3.5 h-3.5 text-[#1B998B]" />
              </div>
              <span className="text-xs font-medium text-gray-500">Taille</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{profile.height_cm} <span className="text-sm font-normal text-gray-500">cm</span></p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 bg-[#1B998B]/10 rounded-lg flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-[#1B998B]" />
              </div>
              <span className="text-xs font-medium text-gray-500">Âge</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{profile.age} <span className="text-sm font-normal text-gray-500">ans</span></p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 bg-[#1B998B]/10 rounded-lg flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-[#1B998B]" />
              </div>
              <span className="text-xs font-medium text-gray-500">Genre</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {GENDER_LABELS[profile.gender] || profile.gender}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#1B998B]/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-[#1B998B]" />
                </div>
                <span className="text-xs font-medium text-gray-500">IMC</span>
              </div>
              <button onClick={() => setInfoModal('bmi')} className="p-0.5 text-gray-400 hover:text-[#1B998B] transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-0.5">
              <BMIBadge bmi={bmi} />
            </div>
          </div>
          {profile.body_fat_pct !== null && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#1B998B]/10 rounded-lg flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-[#1B998B]" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Masse grasse</span>
                </div>
                <button onClick={() => setInfoModal('body_fat')} className="p-0.5 text-gray-400 hover:text-[#1B998B] transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-0.5">
                <BodyFatBadge bodyFatPct={profile.body_fat_pct} gender={profile.gender} />
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Mes calculs */}
      <CollapsibleSection icon={Calculator} title="Mes calculs">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
            {/* Step 1: BMR */}
            <div className="p-4 bg-[#1B998B]/5 rounded-xl border border-[#1B998B]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-[#1B998B] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  1
                </div>
                <span className="text-xs font-medium text-[#1B998B]">Métabolisme de base</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {profile.calculated_bmr?.toLocaleString('fr-FR')}
                <span className="text-sm font-normal text-gray-500 ml-1">kcal</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{formulaInfo.label}</p>
            </div>

            {/* Step 2: Activity */}
            <div className="p-4 bg-[#1B998B]/5 rounded-xl border border-[#1B998B]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-[#1B998B] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  2
                </div>
                <span className="text-xs font-medium text-[#1B998B]">Niveau d&apos;activité</span>
              </div>
              <p className="text-base font-bold text-gray-900">{activityInfo.label}</p>
              <p className="text-xs text-gray-500 mt-1">{activityInfo.description}</p>
              <p className="text-xs font-semibold text-[#1B998B] mt-1.5">x {activityInfo.factor}</p>
            </div>

            {/* Step 3: TDEE */}
            <div className="p-4 bg-gradient-to-br from-[#1B998B]/10 to-teal-50 rounded-xl border border-[#1B998B]/15">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-[#1B998B] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  3
                </div>
                <span className="text-xs font-medium text-[#1B998B]">Dépense énergétique</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {profile.calculated_tdee?.toLocaleString('fr-FR')}
                <span className="text-sm font-normal text-gray-500 ml-1">kcal</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">BMR x {activityInfo.factor}</p>
            </div>
          </div>

          <button
            onClick={() => setShowExplanation(true)}
            className="flex items-center gap-2 text-sm text-[#1B998B] hover:text-[#178578] font-medium transition-colors group"
          >
            <div className="w-7 h-7 bg-[#1B998B]/10 rounded-lg flex items-center justify-center group-hover:bg-[#1B998B]/15 transition-colors">
              <Lightbulb className="w-4 h-4" />
            </div>
            Comprendre mes calculs
          </button>
        </div>
      </CollapsibleSection>

      {/* Mon objectif */}
      <CollapsibleSection icon={Target} title="Mon objectif">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#1B998B]/5 rounded-xl">
            <div className="w-9 h-9 bg-[#1B998B]/15 rounded-lg flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-[#1B998B]" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">{goalInfo.label}</span>
              <p className="text-xs text-gray-500 mt-0.5">{goalInfo.description}</p>
            </div>
          </div>

          {profile.goal_adjustment_kcal !== 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                profile.goal_adjustment_kcal > 0 ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {profile.goal_adjustment_kcal > 0 ? (
                  <ArrowUp className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 text-orange-600" />
                )}
              </div>
              <span className="text-sm text-gray-600">
                Ajustement : <span className="font-semibold">
                  {profile.goal_adjustment_kcal > 0 ? '+' : ''}{profile.goal_adjustment_kcal} kcal/jour
                </span>
              </span>
            </div>
          )}

          {profile.special_case !== 'none' && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <span className="text-sm font-semibold text-purple-700">{specialCaseInfo.label}</span>
                {specialCaseInfo.kcal !== 0 && (
                  <p className="text-xs text-purple-500 mt-0.5">
                    {specialCaseInfo.kcal > 0 ? '+' : ''}{specialCaseInfo.kcal} kcal/jour
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Target calories - prominent */}
          <div className="bg-gradient-to-r from-[#1B998B] to-teal-500 rounded-xl p-5 text-white">
            <p className="text-sm text-white/80">Votre objectif calorique journalier</p>
            <p className="text-3xl font-bold mt-1">
              {profile.calculated_calories?.toLocaleString('fr-FR')} kcal
            </p>
            <p className="text-sm text-white/70 mt-1">
              Calculé par votre nutritionniste selon vos besoins personnels
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Mes macronutriments */}
      <CollapsibleSection icon={Apple} title="Mes macronutriments">
        <div className="space-y-4">
          {macroTemplateLabel && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <Apple className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Répartition : <span className="font-medium text-gray-700">{macroTemplateLabel}</span>
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MacroCard
              label="Protéines"
              pct={profile.protein_pct}
              grams={profile.calculated_protein_g}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              barColor="bg-blue-500"
            />
            <MacroCard
              label="Glucides"
              pct={profile.carbs_pct}
              grams={profile.calculated_carbs_g}
              bgColor="bg-amber-50"
              textColor="text-amber-700"
              barColor="bg-amber-500"
            />
            <MacroCard
              label="Lipides"
              pct={profile.fat_pct}
              grams={profile.calculated_fat_g}
              bgColor="bg-rose-50"
              textColor="text-rose-700"
              barColor="bg-rose-500"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Mes micronutriments */}
      {microTargets.length > 0 && (
        <CollapsibleSection icon={Pill} title="Mes micronutriments" defaultOpen={false}>
          <div className="space-y-5">
            {MICRO_CATEGORIES.map((category) => {
              const categoryMicros = microTargets.filter((m) => category.keys.includes(m.key));
              if (categoryMicros.length === 0) return null;

              return (
                <div key={category.label}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className={`w-2 h-2 rounded-full ${category.dotColor}`} />
                    <h4 className={`text-sm font-medium ${category.textColor}`}>{category.label}</h4>
                    <span className="text-xs text-gray-400">({categoryMicros.length})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {categoryMicros.map(({ key, label, value, unit }) => (
                      <div
                        key={key}
                        className={`p-3 ${category.bgColor} rounded-lg border ${category.borderColor} hover:shadow-sm transition-all`}
                      >
                        <span className="text-xs font-medium text-gray-600">{label}</span>
                        <p className="mt-1">
                          <span className="text-base font-bold text-gray-800">{value}</span>
                          <span className="text-xs text-gray-500 ml-1">{unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Notes de mon nutritionniste */}
      {profile.notes && (
        <CollapsibleSection icon={FileText} title="Notes de mon nutritionniste" defaultOpen={false}>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-600 mb-1.5">Note de votre nutritionniste</p>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{profile.notes}</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        {hasMultipleProfiles && (
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <History className="w-4 h-4" />
            Voir l&apos;historique
          </button>
        )}
      </div>

      {/* Explanation modal */}
      {showExplanation && (
        <CalculationExplanationModal
          profile={profile}
          onClose={() => setShowExplanation(false)}
        />
      )}

      {/* Info modal (BMI / Body fat) */}
      {infoModal && (
        <InfoModal topic={infoModal} onClose={() => setInfoModal(null)} />
      )}
    </div>
  );
}

// ============================================================================
// DETAIL VIEW (for viewing a non-active profile from history)
// ============================================================================

function ProfileDetailView({ profileId }: { profileId: string }) {
  const { data: profile, isLoading, error } = usePatientProfileDetail(profileId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-[#1B998B]" />
        <span className="ml-2 text-sm text-gray-500">Chargement du profil...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">Impossible de charger ce profil</span>
      </div>
    );
  }

  return <ProfileContent profile={profile} />;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NutritionalProfileSection() {
  const { data: profile, isLoading, error } = usePatientActiveProfile();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-[#1B998B]" />
          <span className="ml-2 text-sm text-gray-500">Chargement de votre profil nutritionnel...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center py-12 text-red-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">Erreur lors du chargement de votre profil nutritionnel</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 text-center py-12">
        <div className="w-14 h-14 bg-[#1B998B]/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6 text-[#1B998B]" />
        </div>
        <p className="text-gray-800 font-medium">
          Votre profil nutritionnel n&apos;est pas encore disponible
        </p>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Votre nutritionniste n&apos;a pas encore créé votre profil nutritionnel.
          Il sera disponible ici une fois configuré lors de votre prochaine consultation.
        </p>
      </div>
    );
  }

  return <ProfileContent profile={profile} />;
}

export default NutritionalProfileSection;
