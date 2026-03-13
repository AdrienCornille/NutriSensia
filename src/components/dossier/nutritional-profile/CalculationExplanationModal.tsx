'use client';

import React, { useState } from 'react';
import { X, ChevronDown, MessageCircle } from 'lucide-react';
import type { NutritionalProfilePatient } from '@/types/nutritional-profile';
import {
  ACTIVITY_LEVELS,
  GOAL_ADJUSTMENTS,
  SPECIAL_CASE_ADJUSTMENTS,
  BMR_FORMULAS,
} from '@/lib/nutritional-profile-calculator';

// ============================================================================
// TYPES
// ============================================================================

interface CalculationExplanationModalProps {
  profile: NutritionalProfilePatient;
  onClose: () => void;
}

// ============================================================================
// EXPANDABLE STEP
// ============================================================================

function ExplanationStep({
  stepNumber,
  title,
  defaultOpen = false,
  children,
}: {
  stepNumber: number;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1B998B] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            {stepNumber}
          </div>
          <span className="font-medium text-gray-800 text-left">{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 text-sm text-gray-600 space-y-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FORMULA EXPLANATION
// ============================================================================

function FormulaExplanation({ profile }: { profile: NutritionalProfilePatient }) {
  const formula = profile.bmr_formula;
  const { weight_kg, height_cm, age, gender, body_fat_pct } = profile;
  const genderLabel = gender === 'male' ? 'homme' : 'femme';

  switch (formula) {
    case 'mifflin_st_jeor':
      if (gender === 'male') {
        return (
          <div className="space-y-2">
            <p>
              La formule de <strong>Mifflin-St Jeor (1990)</strong> est la plus recommandée pour
              estimer le métabolisme de base chez les adultes.
            </p>
            <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs">
              <p>BMR = (10 x poids) + (6.25 x taille) - (5 x age) + 5</p>
              <p className="mt-1 text-[#1B998B]">
                BMR = (10 x {weight_kg}) + (6.25 x {height_cm}) - (5 x {age}) + 5
              </p>
              <p className="mt-1 text-[#1B998B]">
                BMR = {10 * weight_kg} + {(6.25 * height_cm).toFixed(1)} - {5 * age} + 5
              </p>
              <p className="mt-1 font-bold text-gray-800">
                BMR = {profile.calculated_bmr} kcal/jour
              </p>
            </div>
            <p className="text-gray-500">
              Formule pour un {genderLabel} de {weight_kg} kg, {height_cm} cm et {age} ans.
            </p>
          </div>
        );
      }
      return (
        <div className="space-y-2">
          <p>
            La formule de <strong>Mifflin-St Jeor (1990)</strong> est la plus recommandée pour
            estimer le métabolisme de base chez les adultes.
          </p>
          <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs">
            <p>BMR = (10 x poids) + (6.25 x taille) - (5 x age) - 161</p>
            <p className="mt-1 text-[#1B998B]">
              BMR = (10 x {weight_kg}) + (6.25 x {height_cm}) - (5 x {age}) - 161
            </p>
            <p className="mt-1 text-[#1B998B]">
              BMR = {10 * weight_kg} + {(6.25 * height_cm).toFixed(1)} - {5 * age} - 161
            </p>
            <p className="mt-1 font-bold text-gray-800">
              BMR = {profile.calculated_bmr} kcal/jour
            </p>
          </div>
          <p className="text-gray-500">
            Formule pour une {genderLabel} de {weight_kg} kg, {height_cm} cm et {age} ans.
          </p>
        </div>
      );

    case 'harris_benedict_revised':
      if (gender === 'male') {
        return (
          <div className="space-y-2">
            <p>
              La formule de <strong>Harris-Benedict révisée (1984)</strong> est largement utilisée
              en clinique pour estimer le métabolisme de base.
            </p>
            <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs">
              <p>BMR = (13.397 x poids) + (4.799 x taille) - (5.677 x age) + 88.362</p>
              <p className="mt-1 text-[#1B998B]">
                BMR = (13.397 x {weight_kg}) + (4.799 x {height_cm}) - (5.677 x {age}) + 88.362
              </p>
              <p className="mt-1 font-bold text-gray-800">
                BMR = {profile.calculated_bmr} kcal/jour
              </p>
            </div>
            <p className="text-gray-500">
              Formule pour un {genderLabel} de {weight_kg} kg, {height_cm} cm et {age} ans.
            </p>
          </div>
        );
      }
      return (
        <div className="space-y-2">
          <p>
            La formule de <strong>Harris-Benedict révisée (1984)</strong> est largement utilisée
            en clinique pour estimer le métabolisme de base.
          </p>
          <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs">
            <p>BMR = (9.247 x poids) + (3.098 x taille) - (4.330 x age) + 447.593</p>
            <p className="mt-1 text-[#1B998B]">
              BMR = (9.247 x {weight_kg}) + (3.098 x {height_cm}) - (4.330 x {age}) + 447.593
            </p>
            <p className="mt-1 font-bold text-gray-800">
              BMR = {profile.calculated_bmr} kcal/jour
            </p>
          </div>
          <p className="text-gray-500">
            Formule pour une {genderLabel} de {weight_kg} kg, {height_cm} cm et {age} ans.
          </p>
        </div>
      );

    case 'harris_benedict_original':
      if (gender === 'male') {
        return (
          <div className="space-y-2">
            <p>
              La formule <strong>Harris-Benedict originale (1919)</strong> est la formule historique
              de référence pour le calcul du métabolisme de base.
            </p>
            <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs">
              <p>BMR = 66.5 + (13.75 x poids) + (5.003 x taille) - (6.755 x age)</p>
              <p className="mt-1 text-[#1B998B]">
                BMR = 66.5 + (13.75 x {weight_kg}) + (5.003 x {height_cm}) - (6.755 x {age})
              </p>
              <p className="mt-1 font-bold text-gray-800">
                BMR = {profile.calculated_bmr} kcal/jour
              </p>
            </div>
            <p className="text-gray-500">
              Formule pour un {genderLabel} de {weight_kg} kg, {height_cm} cm et {age} ans.
            </p>
          </div>
        );
      }
      return (
        <div className="space-y-2">
          <p>
            La formule <strong>Harris-Benedict originale (1919)</strong> est la formule historique
            de référence pour le calcul du métabolisme de base.
          </p>
          <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs">
            <p>BMR = 655.1 + (9.563 x poids) + (1.850 x taille) - (4.676 x age)</p>
            <p className="mt-1 text-[#1B998B]">
              BMR = 655.1 + (9.563 x {weight_kg}) + (1.850 x {height_cm}) - (4.676 x {age})
            </p>
            <p className="mt-1 font-bold text-gray-800">
              BMR = {profile.calculated_bmr} kcal/jour
            </p>
          </div>
          <p className="text-gray-500">
            Formule pour une {genderLabel} de {weight_kg} kg, {height_cm} cm et {age} ans.
          </p>
        </div>
      );

    case 'katch_mcardle':
      return (
        <div className="space-y-2">
          <p>
            La formule de <strong>Katch-McArdle</strong> utilise la masse maigre pour un calcul
            plus précis, notamment chez les sportifs.
          </p>
          <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs">
            <p>Masse maigre = poids x (1 - masse grasse / 100)</p>
            <p className="mt-1 text-[#1B998B]">
              Masse maigre = {weight_kg} x (1 - {body_fat_pct} / 100) ={' '}
              {body_fat_pct ? (weight_kg * (1 - body_fat_pct / 100)).toFixed(1) : '?'} kg
            </p>
            <p className="mt-2">BMR = 370 + (21.6 x masse maigre)</p>
            <p className="mt-1 font-bold text-gray-800">
              BMR = {profile.calculated_bmr} kcal/jour
            </p>
          </div>
          <p className="text-gray-500">
            Avec un taux de masse grasse de {body_fat_pct}%.
          </p>
        </div>
      );
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CalculationExplanationModal({
  profile,
  onClose,
}: CalculationExplanationModalProps) {
  const activityInfo = ACTIVITY_LEVELS[profile.activity_level];
  const goalInfo = GOAL_ADJUSTMENTS[profile.goal];
  const specialCaseInfo = SPECIAL_CASE_ADJUSTMENTS[profile.special_case];
  const formulaInfo = BMR_FORMULAS[profile.bmr_formula];

  const goalAdjustment = profile.goal_adjustment_kcal || goalInfo.kcal;
  const specialCaseAdjustment = specialCaseInfo.kcal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Comprendre mes calculs
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Découvrez comment vos besoins nutritionnels sont calculés
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-5 space-y-3 flex-1">
          {/* Step 1: BMR */}
          <ExplanationStep stepNumber={1} title="Votre métabolisme de base (BMR)" defaultOpen>
            <p>
              Le métabolisme de base (BMR) représente l&apos;énergie que votre corps dépense au
              repos, simplement pour maintenir ses fonctions vitales : respiration, circulation
              sanguine, température corporelle, etc.
            </p>
            <p>
              Votre nutritionniste a utilisé la formule <strong>{formulaInfo.label}</strong> pour
              le calculer.
            </p>
            <FormulaExplanation profile={profile} />
          </ExplanationStep>

          {/* Step 2: Activity level */}
          <ExplanationStep stepNumber={2} title="Votre niveau d&apos;activité">
            <p>
              Votre niveau d&apos;activité physique est un facteur multiplicateur (appelé PAL -
              Physical Activity Level) qui est appliqué à votre BMR pour estimer votre
              dépense énergétique totale.
            </p>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{activityInfo.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{activityInfo.description}</p>
                </div>
                <span className="text-lg font-bold text-[#1B998B]">x {activityInfo.factor}</span>
              </div>
            </div>
            <p className="text-gray-500">
              Plus vous êtes actif, plus votre corps a besoin d&apos;énergie au quotidien.
            </p>
          </ExplanationStep>

          {/* Step 3: TDEE */}
          <ExplanationStep stepNumber={3} title="Votre dépense énergétique totale (TDEE)">
            <p>
              La dépense énergétique totale (TDEE) est la quantité d&apos;énergie dont votre corps
              a besoin chaque jour en tenant compte de votre activité physique.
            </p>
            <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs">
              <p>TDEE = BMR x Facteur d&apos;activité</p>
              <p className="mt-1 text-[#1B998B]">
                TDEE = {profile.calculated_bmr} x {activityInfo.factor}
              </p>
              <p className="mt-1 font-bold text-gray-800">
                TDEE = {profile.calculated_tdee} kcal/jour
              </p>
            </div>
            <p className="text-gray-500">
              C&apos;est la quantité de calories que vous dépenseriez si vous mainteniez votre poids
              actuel.
            </p>
          </ExplanationStep>

          {/* Step 4: Goal */}
          <ExplanationStep stepNumber={4} title="Votre objectif calorique">
            <p>
              En fonction de votre objectif ({goalInfo.label.toLowerCase()}), un ajustement calorique
              est appliqué à votre TDEE.
            </p>
            <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs">
              <p>Objectif = TDEE + Ajustement objectif + Ajustement spécial</p>
              <p className="mt-1 text-[#1B998B]">
                Objectif = {profile.calculated_tdee}{' '}
                {goalAdjustment >= 0 ? `+ ${goalAdjustment}` : `- ${Math.abs(goalAdjustment)}`}
                {profile.special_case !== 'none' && (
                  <> {specialCaseAdjustment >= 0 ? `+ ${specialCaseAdjustment}` : `- ${Math.abs(specialCaseAdjustment)}`} ({specialCaseInfo.label})</>
                )}
              </p>
              <p className="mt-1 font-bold text-gray-800">
                Objectif = {profile.calculated_calories} kcal/jour
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-blue-800 text-xs">
                <strong>{goalInfo.label}</strong> : {goalInfo.description}
              </p>
            </div>
          </ExplanationStep>

          {/* Step 5: Macros */}
          <ExplanationStep stepNumber={5} title="Vos macronutriments">
            <p>
              Les macronutriments sont les trois grandes familles de nutriments dont votre corps
              a besoin en grande quantité : les protéines, les glucides et les lipides.
            </p>
            <div className="space-y-3 mt-2">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-medium text-blue-600">Protéines ({profile.protein_pct}%)</p>
                <p className="text-xs mt-1">
                  Essentielles pour la construction et la réparation musculaire, le système
                  immunitaire et de nombreuses fonctions biologiques.
                </p>
                <p className="text-xs font-mono mt-1 text-gray-500">
                  {profile.calculated_calories} x {profile.protein_pct}% / 4 ={' '}
                  <strong>{profile.calculated_protein_g}g/jour</strong>
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-medium text-amber-600">Glucides ({profile.carbs_pct}%)</p>
                <p className="text-xs mt-1">
                  Source d&apos;énergie principale pour le cerveau et les muscles. Privilégiez les
                  glucides complexes (céréales complètes, légumineuses).
                </p>
                <p className="text-xs font-mono mt-1 text-gray-500">
                  {profile.calculated_calories} x {profile.carbs_pct}% / 4 ={' '}
                  <strong>{profile.calculated_carbs_g}g/jour</strong>
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-medium text-rose-600">Lipides ({profile.fat_pct}%)</p>
                <p className="text-xs mt-1">
                  Indispensables pour l&apos;absorption des vitamines, la production d&apos;hormones
                  et la protection des organes. Privilégiez les graisses insaturées.
                </p>
                <p className="text-xs font-mono mt-1 text-gray-500">
                  {profile.calculated_calories} x {profile.fat_pct}% / 9 ={' '}
                  <strong>{profile.calculated_fat_g}g/jour</strong>
                </p>
              </div>
            </div>
          </ExplanationStep>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <a
            href="/dashboard/patient/messagerie"
            className="flex items-center gap-2 text-sm text-[#1B998B] hover:text-[#178578] font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            J&apos;ai une question ?
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalculationExplanationModal;
