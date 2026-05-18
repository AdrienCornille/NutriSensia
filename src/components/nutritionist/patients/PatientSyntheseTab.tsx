'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Video,
  Building2,
  Flame,
  UserCheck,
  Loader2,
  Pause,
  Play,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { PatientDetailResponse } from '@/hooks/useNutritionistPatients';
import { useUpdatePatientStatus } from '@/hooks/useNutritionistPatients';
import { PatientNotesSection } from './PatientNotesSection';

interface PatientSyntheseTabProps {
  data: PatientDetailResponse;
}

// ==================== HELPERS ====================

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

  if (date.toDateString() === today.toDateString()) return 'Auj.';
  if (date.toDateString() === yesterday.toDateString()) return 'Hier';

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatWhen(dateStr: string): { dayLabel: string; time: string } {
  const date = new Date(dateStr);
  return {
    dayLabel: date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
    time: formatTime(dateStr),
  };
}

function getBmiLabel(bmi: number | null): {
  label: string;
  tone: 'is-positive' | 'is-negative' | '';
} {
  if (!bmi) return { label: '—', tone: '' };
  if (bmi < 18.5) return { label: 'Insuffisance', tone: 'is-negative' };
  if (bmi < 25) return { label: 'Normal', tone: 'is-positive' };
  if (bmi < 30) return { label: 'Surpoids', tone: 'is-negative' };
  return { label: 'Obésité', tone: 'is-negative' };
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Petit-déj',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
};

// Returns 12 spark heights (0..100) from weight history, padded with the
// oldest available value if fewer than 12 entries exist.
function buildSparkValues(history: { weight_kg: number }[]): number[] {
  if (history.length === 0) return [];
  const last12 = history.slice(-12);
  const values = last12.map(h => h.weight_kg);
  while (values.length < 12) values.unshift(values[0]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  // Invert: a lower weight gives a *shorter* bar so the trend visually descends
  // toward the goal. Match the editorial reference (last bar = current).
  return values.map(v => Math.round(((v - min) / range) * 100));
}

interface ActivityEntry {
  id: string;
  sortKey: number; // timestamp ms desc
  time: string;
  day: string;
  title: string;
  tone?: 'is-good' | 'is-warn' | 'is-info' | '';
  tag?: { label: string; tone?: 'is-good' | 'is-warn' | '' };
  description?: string;
  meta?: string[];
}

function buildActivityFeed(
  recentMeals: PatientDetailResponse['recent_meals'],
  weightHistory: PatientDetailResponse['weight_history'],
  lastAppointment: PatientDetailResponse['last_appointment']
): ActivityEntry[] {
  const entries: ActivityEntry[] = [];

  for (const meal of recentMeals.slice(0, 6)) {
    const ts = meal.consumed_at
      ? new Date(meal.consumed_at).getTime()
      : new Date(meal.meal_date).getTime();
    entries.push({
      id: `meal-${meal.id}`,
      sortKey: ts,
      time: meal.consumed_at ? formatTime(meal.consumed_at) : '—',
      day: formatDateShort(meal.meal_date),
      title: `${mealTypeLabels[meal.meal_type] || meal.meal_type} loggué`,
      tone: 'is-good',
      tag: meal.total_calories
        ? { label: `${meal.total_calories} kcal`, tone: 'is-good' }
        : undefined,
      description: meal.name || undefined,
    });
  }

  // Weight entries — last 3 only to avoid drowning the feed
  for (const w of weightHistory.slice(-3).reverse()) {
    const ts = new Date(w.date).getTime();
    entries.push({
      id: `weight-${w.date}`,
      sortKey: ts,
      time: '—',
      day: formatDateShort(w.date),
      title: 'Pesée enregistrée',
      tone: '',
      tag: { label: `${w.weight_kg} kg` },
    });
  }

  if (lastAppointment) {
    entries.push({
      id: `appt-${lastAppointment.id}`,
      sortKey: new Date(lastAppointment.scheduled_at).getTime(),
      time: formatTime(lastAppointment.scheduled_at),
      day: formatDateShort(lastAppointment.scheduled_at),
      title: lastAppointment.consultation_type?.name_fr || 'Consultation',
      tone: 'is-info',
      tag: { label: lastAppointment.mode === 'video' ? 'Visio' : 'Cabinet' },
    });
  }

  return entries.sort((a, b) => b.sortKey - a.sortKey).slice(0, 6);
}

// ==================== COMPONENT ====================

export function PatientSyntheseTab({ data }: PatientSyntheseTabProps) {
  const router = useRouter();
  const {
    patient,
    kpis,
    weight_history,
    weekly_objectives,
    recent_meals,
    next_appointment,
    last_appointment,
    active_meal_plan,
  } = data;

  const bmiInfo = getBmiLabel(kpis.current_bmi);

  // Weight delta since start
  const weightChange =
    kpis.current_weight && patient.initial_weight
      ? +(kpis.current_weight - patient.initial_weight).toFixed(1)
      : null;

  // Sparkline
  const sparkValues = useMemo(
    () => buildSparkValues(weight_history),
    [weight_history]
  );

  // Activity feed
  const activityFeed = useMemo(
    () => buildActivityFeed(recent_meals, weight_history, last_appointment),
    [recent_meals, weight_history, last_appointment]
  );

  // Weight chart bounds
  const lastValues = weight_history.slice(-12);
  const chartMax =
    lastValues.length > 0 ? Math.max(...lastValues.map(w => w.weight_kg)) : 100;
  const chartMin =
    lastValues.length > 0 ? Math.min(...lastValues.map(w => w.weight_kg)) : 0;
  const chartRange = Math.max(chartMax - chartMin, 1);

  // Goal line position on chart (only if target inside range)
  const targetWeight = kpis.target_weight;
  const goalTopPct =
    targetWeight !== null &&
    targetWeight >= chartMin &&
    targetWeight <= chartMax
      ? 100 - ((targetWeight - chartMin) / chartRange) * 100
      : null;

  // Objectives
  type Objective = {
    id: string;
    label: string;
    progress: number;
    target: number;
    unit: string;
    category: string;
  };
  const objectives = weekly_objectives?.objectives as Objective[] | undefined;
  const objectivesDoneCount =
    objectives?.filter(o => (o.target > 0 ? o.progress >= o.target : false))
      .length ?? 0;
  const objectivesTotal = objectives?.length ?? 0;

  // Status mutation
  const statusMutation = useUpdatePatientStatus(patient.id);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);

  // Next appointment formatting
  const nextWhen = next_appointment
    ? formatWhen(next_appointment.scheduled_at)
    : null;

  return (
    <>
      {/* ─── Status banner ─── */}
      {patient.status === 'pending' && (
        <div className='fp-status-bar is-pending'>
          <span className='fp-status-dot' aria-hidden='true' />
          <b>Activation en attente</b>
          <span className='fp-status-text'>
            — ce patient n&apos;a pas encore démarré son suivi.
          </span>
          <span className='fp-status-bar-spacer' />
          <button
            type='button'
            className='fp-btn fp-btn-dark'
            disabled={statusMutation.isPending}
            onClick={() =>
              statusMutation.mutate({
                status: 'active',
                status_reason: 'Activation manuelle par le nutritionniste',
              })
            }
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

      {patient.status === 'active' && (
        <div className='fp-status-bar'>
          <span className='fp-status-dot' aria-hidden='true' />
          <b>Suivi actif</b>
          <span className='fp-status-text'>
            — dernière mise à jour le {formatDate(patient.created_at)}.
          </span>
          <span className='fp-status-bar-spacer' />
          {showPauseConfirm ? (
            <>
              <button
                type='button'
                className='fp-btn'
                onClick={() => setShowPauseConfirm(false)}
              >
                Annuler
              </button>
              <button
                type='button'
                className='fp-btn fp-btn-dark'
                disabled={statusMutation.isPending}
                onClick={() =>
                  statusMutation.mutate(
                    {
                      status: 'inactive',
                      status_reason: 'Mise en pause par le nutritionniste',
                    },
                    { onSuccess: () => setShowPauseConfirm(false) }
                  )
                }
              >
                {statusMutation.isPending ? (
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                ) : (
                  <Pause className='w-3.5 h-3.5' />
                )}
                Confirmer la pause
              </button>
            </>
          ) : (
            <button
              type='button'
              className='fp-btn'
              onClick={() => setShowPauseConfirm(true)}
            >
              <Pause className='w-3.5 h-3.5' />
              Mettre en pause
            </button>
          )}
        </div>
      )}

      {patient.status === 'inactive' && (
        <div className='fp-status-bar is-inactive'>
          <span className='fp-status-dot' aria-hidden='true' />
          <b>Suivi en pause</b>
          <span className='fp-status-text'>— aucun échange en cours.</span>
          <span className='fp-status-bar-spacer' />
          <button
            type='button'
            className='fp-btn fp-btn-dark'
            disabled={statusMutation.isPending}
            onClick={() =>
              statusMutation.mutate({
                status: 'active',
                status_reason: 'Réactivation par le nutritionniste',
              })
            }
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

      {/* ─── KPI strip ─── */}
      <div className='fp-kpis'>
        {/* KPI 1 · Poids actuel (feature) */}
        <div className='fp-kpi is-feature'>
          <div className='fp-kpi-head'>
            <span className='fp-kpi-label'>Poids actuel</span>
            {weightChange !== null && weightChange !== 0 && (
              <span className='fp-kpi-tag'>
                {weightChange > 0 ? '+' : ''}
                {weightChange} kg
              </span>
            )}
          </div>
          <div
            className={`fp-kpi-value ${kpis.current_weight === null ? 'is-empty' : ''}`}
          >
            {kpis.current_weight !== null ? (
              <>
                {kpis.current_weight}
                <em>kg</em>
              </>
            ) : (
              '—'
            )}
          </div>
          {sparkValues.length > 0 && (
            <div className='fp-spark' aria-hidden='true'>
              {sparkValues.map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${Math.max(h, 8)}%` }}
                  className={i === sparkValues.length - 1 ? 'is-now' : ''}
                />
              ))}
            </div>
          )}
          <span className='fp-kpi-foot'>
            {patient.initial_weight !== null
              ? `Initial · ${patient.initial_weight} kg`
              : 'Aucune référence initiale'}
          </span>
        </div>

        {/* KPI 2 · Objectif */}
        <div className='fp-kpi'>
          <div className='fp-kpi-head'>
            <span className='fp-kpi-label'>Objectif</span>
            {kpis.target_weight !== null && kpis.current_weight !== null && (
              <span className='fp-kpi-tag'>
                {Math.round(
                  Math.max(
                    0,
                    Math.min(
                      100,
                      (((patient.initial_weight ?? kpis.current_weight) -
                        kpis.current_weight) /
                        Math.max(
                          (patient.initial_weight ?? kpis.current_weight) -
                            kpis.target_weight,
                          0.0001
                        )) *
                        100
                    )
                  )
                )}{' '}
                % atteint
              </span>
            )}
          </div>
          <div
            className={`fp-kpi-value ${kpis.target_weight === null ? 'is-empty' : ''}`}
          >
            {kpis.target_weight !== null ? (
              <>
                {kpis.target_weight}
                <em>kg</em>
              </>
            ) : (
              '—'
            )}
          </div>
          {kpis.target_weight !== null && kpis.current_weight !== null && (
            <span
              className={`fp-kpi-delta ${
                kpis.current_weight > kpis.target_weight ? 'is-down' : 'is-flat'
              }`}
            >
              {kpis.current_weight > kpis.target_weight ? '▼' : '✓'}{' '}
              {kpis.current_weight > kpis.target_weight
                ? `encore ${(kpis.current_weight - kpis.target_weight).toFixed(1)} kg`
                : 'Objectif atteint'}
            </span>
          )}
          <span className='fp-kpi-foot'>Cible définie</span>
        </div>

        {/* KPI 3 · IMC */}
        <div className='fp-kpi'>
          <div className='fp-kpi-head'>
            <span className='fp-kpi-label'>IMC</span>
            {bmiInfo.label !== '—' && (
              <span className={`fp-kpi-tag ${bmiInfo.tone}`}>
                {bmiInfo.label}
              </span>
            )}
          </div>
          <div
            className={`fp-kpi-value ${kpis.current_bmi === null ? 'is-empty' : ''}`}
          >
            {kpis.current_bmi ?? '—'}
          </div>
          {patient.initial_bmi !== null && kpis.current_bmi !== null && (
            <span
              className={`fp-kpi-delta ${
                kpis.current_bmi < patient.initial_bmi
                  ? 'is-down'
                  : kpis.current_bmi > patient.initial_bmi
                    ? 'is-up'
                    : 'is-flat'
              }`}
            >
              {kpis.current_bmi < patient.initial_bmi
                ? '▼'
                : kpis.current_bmi > patient.initial_bmi
                  ? '▲'
                  : '–'}{' '}
              {Math.abs(+(kpis.current_bmi - patient.initial_bmi).toFixed(1))}{' '}
              pts
            </span>
          )}
          <span className='fp-kpi-foot'>Normal &lt; 25</span>
        </div>

        {/* KPI 4 · Adhérence (ring) */}
        <div className='fp-kpi'>
          <div className='fp-kpi-head'>
            <span className='fp-kpi-label'>Adhérence au plan</span>
          </div>
          <div className='fp-ring-row'>
            <div
              className='fp-ring'
              style={
                {
                  ['--val' as never]:
                    kpis.adherence_percent !== null
                      ? kpis.adherence_percent / 100
                      : 0,
                } as React.CSSProperties
              }
            >
              <b>
                {kpis.adherence_percent !== null
                  ? `${kpis.adherence_percent}%`
                  : '—'}
              </b>
            </div>
            <div className='min-w-0'>
              <span className='fp-kpi-foot' style={{ marginTop: 0 }}>
                {active_meal_plan ? active_meal_plan.name : 'Aucun plan actif'}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 5 · Série */}
        <div className='fp-kpi'>
          <div className='fp-kpi-head'>
            <span className='fp-kpi-label'>Série</span>
            <span className='fp-kpi-tag'>
              <Flame className='w-3 h-3 inline -mt-0.5' />
            </span>
          </div>
          <div className='fp-kpi-value'>
            {kpis.meal_streak}
            <em>jours</em>
          </div>
          <span className='fp-kpi-delta is-flat'>
            Repas loggués consécutifs
          </span>
        </div>
      </div>

      {/* ─── Grid 2 colonnes ─── */}
      <div className='fp-grid'>
        {/* ─── LEFT COLUMN ─── */}
        <div className='fp-col'>
          {/* Weight chart */}
          <article className='fp-card'>
            <div className='fp-card-head'>
              <div>
                <h2 className='fp-card-title'>
                  Évolution du <em>poids</em>
                </h2>
                <div className='fp-card-sub'>
                  {patient.initial_weight !== null && (
                    <span>
                      Référence · <b>{patient.initial_weight} kg</b>
                    </span>
                  )}
                  {kpis.target_weight !== null && (
                    <>
                      {patient.initial_weight !== null && (
                        <span style={{ color: 'var(--ns-ink-4)' }}>·</span>
                      )}
                      <span>
                        Objectif · <b>{kpis.target_weight} kg</b>
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                type='button'
                className='fp-card-link'
                onClick={() =>
                  router.push(
                    `/dashboard/nutritionist/patients/${patient.id}?tab=suivi`
                  )
                }
              >
                Détail suivi <ArrowRight className='w-3 h-3' />
              </button>
            </div>

            <div className='fp-chart-legend'>
              <span className='fp-chart-legend-item is-bar'>Poids hebdo</span>
              <span className='fp-chart-legend-item is-now'>Actuel</span>
              {goalTopPct !== null && (
                <span className='fp-chart-legend-item is-goal'>
                  Objectif ({kpis.target_weight} kg)
                </span>
              )}
            </div>

            {lastValues.length > 0 ? (
              <div className='fp-chart'>
                <div className='fp-chart-yaxis'>
                  <span>{Math.ceil(chartMax)}</span>
                  <span>{Math.round((chartMax + chartMin) / 2)}</span>
                  <span>{Math.floor(chartMin)}</span>
                </div>
                <div className='fp-chart-box'>
                  <div className='fp-chart-grid' aria-hidden='true'>
                    <div style={{ top: '0%' }} />
                    <div style={{ top: '50%' }} />
                  </div>
                  {goalTopPct !== null && (
                    <>
                      <div
                        className='fp-chart-goal'
                        style={{ top: `${goalTopPct}%` }}
                        aria-hidden='true'
                      />
                      <span
                        className='fp-chart-goal-label'
                        style={{ top: `${goalTopPct}%` }}
                      >
                        Cible {kpis.target_weight} kg
                      </span>
                    </>
                  )}
                  <div className='fp-chart-bars'>
                    {lastValues.map((entry, i) => {
                      const heightPct =
                        ((entry.weight_kg - chartMin) / chartRange) * 100;
                      const isLast = i === lastValues.length - 1;
                      return (
                        <div
                          key={`${entry.date}-${i}`}
                          className={`fp-chart-bar ${isLast ? 'is-now' : ''}`}
                          style={{ height: `${Math.max(heightPct, 6)}%` }}
                        >
                          <span className='fp-chart-tip'>
                            {entry.weight_kg} kg ·{' '}
                            {new Date(entry.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className='fp-chart-xaxis'>
                    {lastValues
                      .filter(
                        (_, i) =>
                          i === 0 ||
                          i === Math.floor(lastValues.length / 2) ||
                          i === lastValues.length - 1
                      )
                      .map((entry, i) => (
                        <span key={i}>
                          {new Date(entry.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className='fp-chart-empty'>Aucune pesée enregistrée</div>
            )}
          </article>

          {/* Plan alimentaire actif (semaine) */}
          <article className='fp-card'>
            <div className='fp-card-head'>
              <div>
                <h2 className='fp-card-title'>
                  Plan <em>de la semaine</em>
                </h2>
                <div className='fp-card-sub'>
                  {active_meal_plan ? (
                    <>
                      <span>
                        <b>{active_meal_plan.name}</b>
                      </span>
                      <span style={{ color: 'var(--ns-ink-4)' }}>·</span>
                      <span>
                        {formatDate(active_meal_plan.start_date)} →{' '}
                        {formatDate(active_meal_plan.end_date)}
                      </span>
                    </>
                  ) : (
                    <span>Aucun plan alimentaire actif</span>
                  )}
                </div>
              </div>
              <button
                type='button'
                className='fp-card-link'
                onClick={() =>
                  router.push(
                    `/dashboard/nutritionist/patients/${patient.id}?tab=plan`
                  )
                }
              >
                Ouvrir le plan <ArrowRight className='w-3 h-3' />
              </button>
            </div>

            {/* TODO: Day-by-day meal logging status is not available in the
                current detail API (would require /meal-plans/[id]/days +
                meal_logs join). Rendering placeholder empty state until backend
                exposes per-day completion. */}
            {active_meal_plan ? (
              <div className='fp-plan-empty'>
                Détail journalier disponible dans l&apos;onglet « Plan
                alimentaire ».
              </div>
            ) : (
              <div className='fp-plan-empty'>
                Aucun plan en cours cette semaine.
              </div>
            )}

            {active_meal_plan && (
              <div className='fp-plan-foot'>
                {kpis.adherence_percent !== null && (
                  <div>
                    <b>{kpis.adherence_percent}%</b>
                    <span style={{ marginLeft: 6 }}>d&apos;adhérence</span>
                  </div>
                )}
                {active_meal_plan.daily_calories_target && (
                  <div>
                    <b>{active_meal_plan.daily_calories_target}</b>
                    <span style={{ marginLeft: 6 }}>kcal / jour cible</span>
                  </div>
                )}
              </div>
            )}
          </article>

          {/* Fil d'activité */}
          <article className='fp-card'>
            <div className='fp-card-head'>
              <div>
                <h2 className='fp-card-title'>
                  Fil <em>d&apos;activité</em>
                </h2>
                <div className='fp-card-sub'>
                  {activityFeed.length > 0
                    ? `${activityFeed.length} entrée${activityFeed.length > 1 ? 's' : ''} récente${activityFeed.length > 1 ? 's' : ''}`
                    : 'Aucune activité récente'}
                </div>
              </div>
            </div>

            {activityFeed.length > 0 ? (
              <div className='fp-timeline'>
                {activityFeed.map(entry => (
                  <div
                    key={entry.id}
                    className={`fp-timeline-item ${entry.tone || ''}`}
                  >
                    <div className='fp-tl-time'>
                      <b>{entry.time}</b>
                      {entry.day}
                    </div>
                    <div className='fp-tl-body'>
                      <div className='fp-tl-title'>
                        {entry.title}
                        {entry.tag && (
                          <span className={`fp-tl-tag ${entry.tag.tone || ''}`}>
                            {entry.tag.label}
                          </span>
                        )}
                      </div>
                      {entry.description && (
                        <div className='fp-tl-desc'>
                          « {entry.description} »
                        </div>
                      )}
                      {entry.meta && (
                        <div className='fp-tl-meta'>
                          {entry.meta.map((m, i) => (
                            <span key={i}>{m}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='fp-timeline-empty'>
                Aucun repas, pesée ou consultation récents.
              </div>
            )}
          </article>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className='fp-col'>
          {/* Next appointment */}
          <article className='fp-rdv'>
            <span className='fp-rdv-eyebrow'>Prochain rendez-vous</span>
            {nextWhen && next_appointment ? (
              <>
                <div className='fp-rdv-when'>
                  {nextWhen.dayLabel} · <em>{nextWhen.time}</em>
                </div>
                <div className='fp-rdv-meta'>
                  <span>
                    {next_appointment.consultation_type?.name_fr ||
                      'Consultation'}
                  </span>
                  {next_appointment.consultation_type?.default_duration && (
                    <>
                      <span className='dot' />
                      <span>
                        {next_appointment.consultation_type.default_duration}{' '}
                        min
                      </span>
                    </>
                  )}
                  <span className='dot' />
                  <span
                    className='inline-flex items-center gap-1'
                    style={{ fontWeight: 600 }}
                  >
                    {next_appointment.mode === 'video' ? (
                      <>
                        <Video className='w-3 h-3' /> Visio
                      </>
                    ) : (
                      <>
                        <Building2 className='w-3 h-3' /> Cabinet
                      </>
                    )}
                  </span>
                </div>
                <div className='fp-rdv-actions'>
                  <button
                    type='button'
                    className='fp-btn'
                    style={{
                      background: 'transparent',
                      color: 'var(--ns-cream-50)',
                      borderColor: 'rgba(255,255,255,0.35)',
                    }}
                    onClick={() =>
                      router.push('/dashboard/nutritionist/agenda')
                    }
                  >
                    Replanifier
                  </button>
                  <button
                    type='button'
                    className='fp-btn fp-btn-peps'
                    onClick={() =>
                      router.push('/dashboard/nutritionist/agenda')
                    }
                  >
                    Ouvrir l&apos;agenda <ArrowRight className='w-3 h-3' />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className='fp-rdv-empty'>Aucun rendez-vous planifié.</div>
                <div className='fp-rdv-actions'>
                  <button
                    type='button'
                    className='fp-btn fp-btn-peps'
                    onClick={() =>
                      router.push('/dashboard/nutritionist/agenda')
                    }
                  >
                    Planifier <ArrowRight className='w-3 h-3' />
                  </button>
                </div>
              </>
            )}
          </article>

          {/* Objectifs semaine */}
          <article className='fp-card is-pad-sm'>
            <div className='fp-card-head' style={{ marginBottom: 12 }}>
              <div>
                <h2 className='fp-card-title' style={{ fontSize: 19 }}>
                  Objectifs <em>de la semaine</em>
                </h2>
                <div className='fp-card-sub'>
                  {objectivesTotal > 0
                    ? `${objectivesDoneCount} / ${objectivesTotal} atteint${objectivesDoneCount > 1 ? 's' : ''}`
                    : 'Aucun objectif défini'}
                </div>
              </div>
            </div>

            {objectives && objectives.length > 0 ? (
              <div className='fp-goals'>
                {objectives.map(obj => {
                  const percent =
                    obj.target > 0
                      ? Math.min(
                          Math.round((obj.progress / obj.target) * 100),
                          100
                        )
                      : 0;
                  const isDone = percent >= 100;
                  return (
                    <div
                      key={obj.id}
                      className={`fp-goal ${isDone ? 'is-done' : ''}`}
                    >
                      <span className='fp-goal-check' aria-hidden='true' />
                      <div className='fp-goal-body'>
                        <div className='fp-goal-title'>{obj.label}</div>
                        <div className='fp-goal-meta'>
                          {obj.progress} / {obj.target} {obj.unit}
                          {obj.category ? ` · ${obj.category}` : ''}
                        </div>
                      </div>
                      <div className='fp-goal-progress' aria-hidden='true'>
                        <span style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='fp-goals-empty'>
                Aucun objectif pour cette semaine.
              </div>
            )}
          </article>

          {/* Dernière consultation */}
          <article className='fp-card is-pad-sm'>
            <div className='fp-card-head' style={{ marginBottom: 12 }}>
              <div>
                <h2 className='fp-card-title' style={{ fontSize: 19 }}>
                  Dernière <em>consultation</em>
                </h2>
                <div className='fp-card-sub'>
                  {last_appointment?.consultation_type?.name_fr || 'Historique'}
                </div>
              </div>
              {last_appointment && (
                <button
                  type='button'
                  className='fp-card-link'
                  onClick={() =>
                    router.push(
                      `/dashboard/nutritionist/patients/${patient.id}?tab=consultations`
                    )
                  }
                >
                  Voir <ArrowRight className='w-3 h-3' />
                </button>
              )}
            </div>

            {last_appointment ? (
              <div className='fp-quick'>
                <div className='fp-quick-date'>
                  <b>{new Date(last_appointment.scheduled_at).getDate()}</b>
                  <span>
                    {new Date(last_appointment.scheduled_at).toLocaleDateString(
                      'fr-FR',
                      { month: 'short' }
                    )}
                  </span>
                </div>
                <div className='fp-quick-body'>
                  <div className='fp-quick-title'>
                    {last_appointment.consultation_type?.name_fr ||
                      'Consultation'}
                  </div>
                  <div className='fp-quick-meta'>
                    <span className='inline-flex items-center gap-1'>
                      <Calendar className='w-3 h-3' />{' '}
                      {formatDate(last_appointment.scheduled_at)}
                    </span>
                    <span>·</span>
                    {last_appointment.mode === 'video' ? (
                      <span className='inline-flex items-center gap-1'>
                        <Video className='w-3 h-3' /> Visio
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1'>
                        <Building2 className='w-3 h-3' /> Cabinet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='fp-quick-empty'>Aucune consultation passée.</div>
            )}
          </article>

          {/* Notes internes */}
          <PatientNotesSection patientId={patient.id} />
        </div>
      </div>

      {/* ─── Footer signature ─── */}
      <div className='fp-foot'>
        <span>Fiche mise à jour automatiquement · données synchronisées.</span>
        <span className='fp-foot-script'>on tient le rythme …</span>
      </div>
    </>
  );
}
