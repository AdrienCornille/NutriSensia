'use client';

import React, { useState } from 'react';
import { Calendar, Video, Building2, Flame, UserCheck, Loader2, Pause, Play } from 'lucide-react';
import type { PatientDetailResponse } from '@/hooks/useNutritionistPatients';
import { useUpdatePatientStatus } from '@/hooks/useNutritionistPatients';
import { PatientNotesSection } from './PatientNotesSection';

interface PatientSyntheseTabProps {
  data: PatientDetailResponse;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return 'Hier';

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getBmiLabel(bmi: number | null): { label: string; color: string } {
  if (!bmi) return { label: '—', color: 'text-gray-500' };
  if (bmi < 18.5) return { label: 'Insuffisance', color: 'text-blue-600' };
  if (bmi < 25) return { label: 'Normal', color: 'text-emerald-600' };
  if (bmi < 30) return { label: 'Surpoids', color: 'text-amber-600' };
  return { label: 'Obésité', color: 'text-red-600' };
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Petit-déj',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
};

export function PatientSyntheseTab({ data }: PatientSyntheseTabProps) {
  const {
    patient,
    kpis,
    weight_history,
    weekly_objectives,
    recent_meals,
    next_appointment,
    last_appointment,
    active_meal_plan,
    streaks,
  } = data;

  const bmiInfo = getBmiLabel(kpis.current_bmi);

  // Calculer la variation de poids
  const weightChange =
    kpis.current_weight && patient.initial_weight
      ? +(kpis.current_weight - patient.initial_weight).toFixed(1)
      : null;

  // Grouper les repas par jour
  const mealsByDay = recent_meals.reduce(
    (acc, meal) => {
      const day = meal.meal_date;
      if (!acc[day]) acc[day] = [];
      acc[day].push(meal);
      return acc;
    },
    {} as Record<string, typeof recent_meals>
  );

  // Max weight pour le chart
  const maxWeight =
    weight_history.length > 0
      ? Math.max(...weight_history.map(w => w.weight_kg))
      : 100;
  const minWeight =
    weight_history.length > 0
      ? Math.min(...weight_history.map(w => w.weight_kg))
      : 0;
  const weightRange = maxWeight - minWeight || 1;

  // Objectifs
  const objectives = weekly_objectives?.objectives as
    | {
        id: string;
        label: string;
        progress: number;
        target: number;
        unit: string;
        category: string;
      }[]
    | undefined;

  const statusMutation = useUpdatePatientStatus(patient.id);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);

  return (
    <div className='space-y-6'>
      {/* Bannière activation patient */}
      {patient.status === 'pending' && (
        <div className='flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3'>
          <div className='flex items-center gap-2'>
            <UserCheck className='w-4 h-4 text-amber-600' />
            <span className='text-sm text-amber-800'>
              Ce patient est en attente d&apos;activation.
            </span>
          </div>
          <button
            onClick={() =>
              statusMutation.mutate({
                status: 'active',
                status_reason: 'Activation manuelle par le nutritionniste',
              })
            }
            disabled={statusMutation.isPending}
            className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1B998B] rounded-lg hover:bg-[#147569] disabled:opacity-50 transition-colors'
          >
            {statusMutation.isPending ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <UserCheck className='w-3.5 h-3.5' />
            )}
            Activer le suivi
          </button>
        </div>
      )}

      {/* Bannière mise en pause */}
      {patient.status === 'active' && (
        <div className='flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3'>
          {showPauseConfirm ? (
            <>
              <span className='text-sm text-gray-700'>
                Confirmer la mise en pause du suivi ?
              </span>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setShowPauseConfirm(false)}
                  className='px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    statusMutation.mutate(
                      { status: 'inactive', status_reason: 'Mise en pause par le nutritionniste' },
                      { onSuccess: () => setShowPauseConfirm(false) }
                    );
                  }}
                  disabled={statusMutation.isPending}
                  className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors'
                >
                  {statusMutation.isPending ? (
                    <Loader2 className='w-3.5 h-3.5 animate-spin' />
                  ) : (
                    <Pause className='w-3.5 h-3.5' />
                  )}
                  Confirmer la pause
                </button>
              </div>
            </>
          ) : (
            <>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-[#1B998B]' />
                <span className='text-sm text-gray-600'>Suivi actif</span>
              </div>
              <button
                onClick={() => setShowPauseConfirm(true)}
                className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                <Pause className='w-3.5 h-3.5' />
                Mettre en pause
              </button>
            </>
          )}
        </div>
      )}

      {/* Bannière réactivation */}
      {patient.status === 'inactive' && (
        <div className='flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-5 py-3'>
          <div className='flex items-center gap-2'>
            <Pause className='w-4 h-4 text-gray-500' />
            <span className='text-sm text-gray-600'>
              Le suivi de ce patient est en pause.
            </span>
          </div>
          <button
            onClick={() =>
              statusMutation.mutate({
                status: 'active',
                status_reason: 'Réactivation par le nutritionniste',
              })
            }
            disabled={statusMutation.isPending}
            className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1B998B] rounded-lg hover:bg-[#147569] disabled:opacity-50 transition-colors'
          >
            {statusMutation.isPending ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <Play className='w-3.5 h-3.5' />
            )}
            Réactiver le suivi
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
        <div className='bg-white rounded-xl p-4 border border-gray-200 text-center'>
          <p className='text-xs text-gray-500 mb-1'>Poids actuel</p>
          <p className='text-2xl font-bold text-gray-800'>
            {kpis.current_weight ? `${kpis.current_weight}` : '—'}
          </p>
          <p className='text-xs text-gray-500'>kg</p>
          {weightChange !== null && (
            <p
              className={`text-xs mt-1 ${weightChange < 0 ? 'text-emerald-600' : weightChange > 0 ? 'text-red-600' : 'text-gray-500'}`}
            >
              {weightChange > 0 ? '+' : ''}
              {weightChange} kg depuis le début
            </p>
          )}
        </div>

        <div className='bg-white rounded-xl p-4 border border-gray-200 text-center'>
          <p className='text-xs text-gray-500 mb-1'>Objectif</p>
          <p className='text-2xl font-bold text-gray-800'>
            {kpis.target_weight ? `${kpis.target_weight}` : '—'}
          </p>
          <p className='text-xs text-gray-500'>kg</p>
        </div>

        <div className='bg-white rounded-xl p-4 border border-gray-200 text-center'>
          <p className='text-xs text-gray-500 mb-1'>IMC</p>
          <p className='text-2xl font-bold text-gray-800'>
            {kpis.current_bmi ?? '—'}
          </p>
          <p className={`text-xs mt-1 ${bmiInfo.color}`}>{bmiInfo.label}</p>
        </div>

        <div className='bg-white rounded-xl p-4 border border-gray-200 text-center'>
          <p className='text-xs text-gray-500 mb-1'>Adhérence</p>
          <p className='text-2xl font-bold text-gray-800'>
            {kpis.adherence_percent !== null
              ? `${kpis.adherence_percent}%`
              : '—'}
          </p>
          <p className='text-xs text-gray-500'>au plan</p>
        </div>

        <div className='bg-white rounded-xl p-4 border border-gray-200 text-center'>
          <p className='text-xs text-gray-500 mb-1'>Série</p>
          <div className='flex items-center justify-center gap-1'>
            <Flame className='w-5 h-5 text-orange-500' />
            <p className='text-2xl font-bold text-gray-800'>
              {kpis.meal_streak}
            </p>
          </div>
          <p className='text-xs text-gray-500'>jours consécutifs</p>
        </div>
      </div>

      {/* Row 2: Weight Chart + Objectives */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Weight Chart */}
        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <h3 className='text-sm font-semibold text-gray-800 mb-4'>
            Évolution du poids
          </h3>
          {weight_history.length > 0 ? (
            <div className='space-y-2'>
              <div className='flex items-end gap-1 h-40'>
                {weight_history.slice(-14).map((entry, i) => {
                  const height =
                    ((entry.weight_kg - minWeight) / weightRange) * 100;
                  const isLast = i === Math.min(weight_history.length, 14) - 1;
                  return (
                    <div
                      key={i}
                      className='flex-1 flex flex-col items-center justify-end'
                    >
                      <span className='text-[10px] text-gray-500 mb-1'>
                        {entry.weight_kg}
                      </span>
                      <div
                        className={`w-full rounded-t-sm ${isLast ? 'bg-[#1B998B]' : 'bg-[#1B998B]/20'}`}
                        style={{
                          height: `${Math.max(height, 5)}%`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className='flex gap-1'>
                {weight_history.slice(-14).map((entry, i) => (
                  <div key={i} className='flex-1 text-center'>
                    <span className='text-[9px] text-gray-400'>
                      {new Date(entry.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='h-40 flex items-center justify-center text-gray-400 text-sm'>
              Aucune donnée de poids
            </div>
          )}
        </div>

        {/* Objectives */}
        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <h3 className='text-sm font-semibold text-gray-800 mb-4'>
            Objectifs de la semaine
          </h3>
          {objectives && objectives.length > 0 ? (
            <div className='space-y-4'>
              {objectives.map(obj => {
                const percent =
                  obj.target > 0
                    ? Math.min(
                        Math.round((obj.progress / obj.target) * 100),
                        100
                      )
                    : 0;
                const barColor =
                  percent >= 75
                    ? 'bg-[#1B998B]'
                    : percent >= 50
                      ? 'bg-blue-500'
                      : 'bg-amber-500';
                return (
                  <div key={obj.id}>
                    <div className='flex items-center justify-between mb-1'>
                      <p className='text-sm text-gray-700'>{obj.label}</p>
                      <span className='text-xs font-medium text-gray-600'>
                        {percent}%
                      </span>
                    </div>
                    <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className='text-xs text-gray-400 mt-0.5'>
                      {obj.category}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='h-32 flex items-center justify-center text-gray-400 text-sm'>
              Aucun objectif cette semaine
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Recent Meals + Last Consultation */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recent Meals */}
        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <h3 className='text-sm font-semibold text-gray-800 mb-4'>
            Repas récents
          </h3>
          {Object.keys(mealsByDay).length > 0 ? (
            <div className='space-y-4'>
              {Object.entries(mealsByDay)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 3)
                .map(([day, meals]) => {
                  const totalCal = meals.reduce(
                    (sum, m) => sum + (m.total_calories || 0),
                    0
                  );
                  return (
                    <div
                      key={day}
                      className='border-l-2 border-[#1B998B]/20 pl-3'
                    >
                      <div className='flex items-center justify-between mb-1'>
                        <p className='text-sm font-medium text-gray-700'>
                          {formatDateShort(day)}
                        </p>
                        <span className='text-xs text-gray-500'>
                          {totalCal} kcal
                        </span>
                      </div>
                      {meals.map(meal => (
                        <p key={meal.id} className='text-xs text-gray-500'>
                          {mealTypeLabels[meal.meal_type] || meal.meal_type}
                          {meal.consumed_at &&
                            ` · ${formatTime(meal.consumed_at)}`}
                          {meal.total_calories &&
                            ` · ${meal.total_calories} kcal`}
                        </p>
                      ))}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className='h-32 flex items-center justify-center text-gray-400 text-sm'>
              Aucun repas récent
            </div>
          )}
        </div>

        {/* Last Consultation */}
        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <h3 className='text-sm font-semibold text-gray-800 mb-4'>
            Dernière consultation
          </h3>
          {last_appointment ? (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Calendar className='w-4 h-4 text-gray-400' />
                <span className='text-sm text-gray-700'>
                  {formatDate(last_appointment.scheduled_at)}
                </span>
                <span className='mx-1 text-gray-300'>·</span>
                {last_appointment.mode === 'video' ? (
                  <span className='flex items-center gap-1 text-xs text-blue-600'>
                    <Video className='w-3.5 h-3.5' /> Visio
                  </span>
                ) : (
                  <span className='flex items-center gap-1 text-xs text-gray-600'>
                    <Building2 className='w-3.5 h-3.5' /> Cabinet
                  </span>
                )}
              </div>
              {last_appointment.consultation_type && (
                <p className='text-sm text-gray-600 mb-2'>
                  {last_appointment.consultation_type.name_fr}
                </p>
              )}
            </div>
          ) : (
            <div className='h-32 flex items-center justify-center text-gray-400 text-sm'>
              Aucune consultation passée
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Next Appointment + Active Meal Plan */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Next Appointment */}
        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <h3 className='text-sm font-semibold text-gray-800 mb-4'>
            Prochain rendez-vous
          </h3>
          {next_appointment ? (
            <div className='flex items-center gap-3'>
              <div className='bg-[#1B998B]/5 rounded-lg p-3 text-center'>
                <p className='text-xs text-[#1B998B] uppercase font-medium'>
                  {new Date(next_appointment.scheduled_at).toLocaleDateString(
                    'fr-FR',
                    { month: 'short' }
                  )}
                </p>
                <p className='text-xl font-bold text-[#1B998B]'>
                  {new Date(next_appointment.scheduled_at).getDate()}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-800'>
                  {formatTime(next_appointment.scheduled_at)}
                </p>
                {next_appointment.consultation_type && (
                  <p className='text-xs text-gray-500'>
                    {next_appointment.consultation_type.name_fr}
                  </p>
                )}
                <div className='flex items-center gap-1 mt-1'>
                  {next_appointment.mode === 'video' ? (
                    <span className='flex items-center gap-1 text-xs text-blue-600'>
                      <Video className='w-3 h-3' /> Visio
                    </span>
                  ) : (
                    <span className='flex items-center gap-1 text-xs text-gray-500'>
                      <Building2 className='w-3 h-3' /> Cabinet
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className='h-20 flex items-center justify-center text-gray-400 text-sm'>
              Aucun RDV planifié
            </div>
          )}
        </div>

        {/* Active Meal Plan */}
        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <h3 className='text-sm font-semibold text-gray-800 mb-4'>
            Plan alimentaire actif
          </h3>
          {active_meal_plan ? (
            <div>
              <p className='text-sm font-medium text-gray-800 mb-1'>
                {active_meal_plan.name}
              </p>
              <p className='text-xs text-gray-500'>
                Du {formatDate(active_meal_plan.start_date)} au{' '}
                {formatDate(active_meal_plan.end_date)}
              </p>
              {active_meal_plan.daily_calories_target && (
                <p className='text-xs text-[#1B998B] mt-1'>
                  Objectif : {active_meal_plan.daily_calories_target} kcal/jour
                </p>
              )}
            </div>
          ) : (
            <div className='h-20 flex items-center justify-center text-gray-400 text-sm'>
              Aucun plan actif
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Notes internes */}
      <PatientNotesSection patientId={patient.id} />
    </div>
  );
}
