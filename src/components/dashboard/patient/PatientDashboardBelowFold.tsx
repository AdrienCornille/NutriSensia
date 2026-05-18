'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useNextAppointment } from '@/hooks/useAppointments';
import { useUnreadCount, useConversations } from '@/hooks/useConversations';
import { useWeeklyObjectives } from '@/hooks/useObjectives';
import { useWeightEntries } from '@/hooks/useWeight';
import {
  TrendingUp,
  Calendar,
  ArrowRight,
  MessageSquare,
  Clock,
  Check,
  ChefHat,
  Apple,
  Star,
  FolderOpen,
} from 'lucide-react';

// ==================== TYPES ====================

type ProgressStatus = 'excellent' | 'good' | 'warning' | 'danger';
type AppointmentType = 'initial' | 'follow-up' | 'nutrition-plan' | 'check-in';
type AppointmentMode = 'visio' | 'cabinet' | 'phone';
type ObjectiveCategory =
  | 'nutrition'
  | 'hydration'
  | 'activity'
  | 'recipes'
  | 'tracking'
  | 'custom';

// ==================== HELPERS ====================

function getProgressStatus(current: number, target: number): ProgressStatus {
  const percentage = (current / target) * 100;
  if (percentage > 110) return 'danger';
  if (percentage >= 90) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'warning';
  return 'danger';
}

function getStatusColors(status: ProgressStatus) {
  switch (status) {
    case 'excellent':
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-600',
        bgLight: 'bg-emerald-50',
        border: 'border-emerald-200',
      };
    case 'good':
      return {
        bg: 'bg-[#1B998B]',
        text: 'text-[#1B998B]',
        bgLight: 'bg-[#1B998B]/10',
        border: 'border-[#1B998B]/30',
      };
    case 'warning':
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-600',
        bgLight: 'bg-amber-50',
        border: 'border-amber-200',
      };
    case 'danger':
      return {
        bg: 'bg-red-500',
        text: 'text-red-600',
        bgLight: 'bg-red-50',
        border: 'border-red-200',
      };
  }
}

function generateSparklinePath(
  data: number[],
  width: number,
  height: number,
  paddingY: number = 8
): string {
  if (data.length < 2) return '';

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.1;

  const paddingX = 8;
  const effectiveHeight = height - paddingY * 2;
  const effectiveWidth = width - paddingX * 2;

  const points = data.map((value, index) => {
    const x = paddingX + (index / (data.length - 1)) * effectiveWidth;
    const normalizedY = (max - value) / range;
    const y = paddingY + normalizedY * effectiveHeight;
    return { x, y };
  });

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev.x + (curr.x - prev.x) * 0.5;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) * 0.5;
    const cp2y = curr.y;
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
  }

  return path;
}

function generateSparklineAreaPath(
  data: number[],
  width: number,
  height: number,
  paddingY: number = 8
): string {
  const linePath = generateSparklinePath(data, width, height, paddingY);
  if (!linePath) return '';

  const paddingX = 8;
  const effectiveWidth = width - paddingX * 2;

  const lastX = paddingX + effectiveWidth;
  const firstX = paddingX;

  return `${linePath} L ${lastX.toFixed(2)} ${height} L ${firstX.toFixed(2)} ${height} Z`;
}

function getDaysUntil(date: Date): number {
  const now = new Date();
  const target = new Date(date);
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatCountdown(date: Date): string {
  const days = getDaysUntil(date);
  if (days < 0) return 'Passé';
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';
  if (days < 7) return `Dans ${days} jours`;
  if (days < 14) return 'La semaine prochaine';
  return `Dans ${Math.ceil(days / 7)} semaines`;
}

function getAppointmentTypeLabel(type: AppointmentType): string {
  switch (type) {
    case 'initial':
      return 'Consultation initiale';
    case 'follow-up':
      return 'Consultation de suivi';
    case 'nutrition-plan':
      return 'Révision du plan';
    case 'check-in':
      return 'Point rapide';
  }
}

function getAppointmentModeInfo(mode: AppointmentMode): {
  label: string;
  color: string;
  icon: string;
} {
  switch (mode) {
    case 'visio':
      return {
        label: 'En visio',
        color: 'text-blue-600 bg-blue-50',
        icon: '📹',
      };
    case 'cabinet':
      return {
        label: 'Au cabinet',
        color: 'text-purple-600 bg-purple-50',
        icon: '🏥',
      };
    case 'phone':
      return {
        label: 'Par téléphone',
        color: 'text-amber-600 bg-amber-50',
        icon: '📞',
      };
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getTimeRemaining(endDate: Date): {
  days: number;
  hours: number;
  text: string;
  isUrgent: boolean;
} {
  const now = new Date();
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const diffMs = end.getTime() - now.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let text = '';
  let isUrgent = false;

  if (diffMs <= 0) {
    text = 'Terminé';
  } else if (days === 0) {
    text = hours <= 1 ? 'Dernière heure !' : `${hours}h restantes`;
    isUrgent = true;
  } else if (days === 1) {
    text = 'Demain';
    isUrgent = true;
  } else if (days < 3) {
    text = `${days}j restants`;
    isUrgent = true;
  } else {
    text = `${days}j restants`;
  }

  return { days, hours, text, isUrgent };
}

function getObjectiveCategoryInfo(category: ObjectiveCategory): {
  icon: string;
  bgColor: string;
  textColor: string;
  label: string;
} {
  switch (category) {
    case 'nutrition':
      return {
        icon: '🍎',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        label: 'Nutrition',
      };
    case 'hydration':
      return {
        icon: '💧',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        label: 'Hydratation',
      };
    case 'activity':
      return {
        icon: '🏃',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-600',
        label: 'Activité',
      };
    case 'recipes':
      return {
        icon: '👨‍🍳',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600',
        label: 'Recettes',
      };
    case 'tracking':
      return {
        icon: '📊',
        bgColor: 'bg-indigo-100',
        textColor: 'text-indigo-600',
        label: 'Suivi',
      };
    case 'custom':
    default:
      return {
        icon: '🎯',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        label: 'Personnalisé',
      };
  }
}

// ==================== CONSTANTES ====================

const quickAccess = [
  {
    icon: <ChefHat className='w-6 h-6' />,
    label: 'Recettes',
    desc: '124 recettes',
    color: 'bg-orange-50 text-orange-600',
    href: '/dashboard/recettes',
  },
  {
    icon: <Apple className='w-6 h-6' />,
    label: 'Base aliments',
    desc: 'Rechercher',
    color: 'bg-green-50 text-green-600',
    href: '/dashboard/aliments',
  },
  {
    icon: <Star className='w-6 h-6' />,
    label: 'Contenu exclusif',
    desc: '3 nouveaux',
    color: 'bg-purple-50 text-purple-600',
    href: '/dashboard/suivi',
  },
  {
    icon: <FolderOpen className='w-6 h-6' />,
    label: 'Mon dossier',
    desc: 'Anamnèse, objectifs',
    color: 'bg-blue-50 text-blue-600',
    href: '/dashboard/dossier',
  },
];

// ==================== COMPONENT ====================

export default function PatientDashboardBelowFold() {
  const { data: nextAppointmentData, isLoading: appointmentLoading } =
    useNextAppointment();
  const { data: unreadCountData } = useUnreadCount();
  const { data: conversationsData } = useConversations();
  const unreadCount = unreadCountData?.unread_count || 0;
  const recentConversations = conversationsData?.conversations || [];

  const { data: weeklyObjectivesData, isLoading: objectivesLoading } =
    useWeeklyObjectives();

  const { data: weightData } = useWeightEntries({ limit: 7 });
  const weightEntries = weightData?.entries || [];
  const currentWeight = weightData?.statistics?.current_weight ?? null;
  const weightChange = weightData?.statistics?.total_change ?? 0;
  const weightHistory = weightEntries.map(e => e.weight_kg).reverse();

  return (
    <>
      {/* Zone secondaire - Cette semaine */}
      <section className='mb-8'>
        <h2 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4'>
          Cette semaine
        </h2>

        <div className='grid grid-cols-3 gap-6'>
          {/* DASH-004: Progression avec sparkline et comparaisons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className='bg-white rounded-xl p-6 border border-gray-200'
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-semibold text-gray-800'>Progression</h3>
              <span className='text-xs text-gray-400'>Cette semaine</span>
            </div>

            <div className='mb-4'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <TrendingUp className='w-4 h-4 text-blue-600' />
                  </div>
                  <span className='text-sm font-medium text-gray-700'>
                    Poids
                  </span>
                </div>
                {currentWeight !== null ? (
                  <div className='text-right'>
                    <span className='text-lg font-bold text-gray-800'>
                      {currentWeight} kg
                    </span>
                    {weightChange !== 0 && (
                      <span
                        className={`ml-2 text-sm font-medium ${weightChange < 0 ? 'text-emerald-600' : 'text-red-500'}`}
                      >
                        {weightChange > 0 ? '+' : ''}
                        {weightChange} kg
                      </span>
                    )}
                  </div>
                ) : (
                  <span className='text-sm text-gray-400'>Aucune donnée</span>
                )}
              </div>

              {weightHistory.length >= 2 ? (
                <div className='mt-3 mb-1'>
                  <div className='h-16 w-full relative bg-gradient-to-b from-[#1B998B]/5 to-transparent rounded-lg overflow-hidden'>
                    <svg
                      className='w-full h-full'
                      viewBox='0 0 200 64'
                      preserveAspectRatio='none'
                    >
                      <defs>
                        <linearGradient
                          id='weightAreaGradient'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='0%'
                            stopColor='#1B998B'
                            stopOpacity='0.25'
                          />
                          <stop
                            offset='50%'
                            stopColor='#1B998B'
                            stopOpacity='0.1'
                          />
                          <stop
                            offset='100%'
                            stopColor='#1B998B'
                            stopOpacity='0'
                          />
                        </linearGradient>
                        <linearGradient
                          id='weightLineGradient'
                          x1='0'
                          y1='0'
                          x2='1'
                          y2='0'
                        >
                          <stop
                            offset='0%'
                            stopColor='#1B998B'
                            stopOpacity='0.6'
                          />
                          <stop
                            offset='50%'
                            stopColor='#1B998B'
                            stopOpacity='1'
                          />
                          <stop
                            offset='100%'
                            stopColor='#1B998B'
                            stopOpacity='1'
                          />
                        </linearGradient>
                      </defs>

                      <line
                        x1='0'
                        y1='16'
                        x2='200'
                        y2='16'
                        stroke='#E5E7EB'
                        strokeWidth='0.5'
                        strokeOpacity='0.5'
                      />
                      <line
                        x1='0'
                        y1='32'
                        x2='200'
                        y2='32'
                        stroke='#E5E7EB'
                        strokeWidth='0.5'
                        strokeOpacity='0.5'
                      />
                      <line
                        x1='0'
                        y1='48'
                        x2='200'
                        y2='48'
                        stroke='#E5E7EB'
                        strokeWidth='0.5'
                        strokeOpacity='0.5'
                      />

                      <motion.path
                        d={generateSparklineAreaPath(weightHistory, 200, 64, 6)}
                        fill='url(#weightAreaGradient)'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />

                      <motion.path
                        d={generateSparklinePath(weightHistory, 200, 64, 6)}
                        fill='none'
                        stroke='url(#weightLineGradient)'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />

                      {(() => {
                        const data = weightHistory;
                        const min = Math.min(...data);
                        const max = Math.max(...data);
                        const range = max - min || 0.1;
                        const lastIndex = data.length - 1;
                        const x = 8 + (lastIndex / (data.length - 1)) * 184;
                        const y = 6 + ((max - data[lastIndex]) / range) * 52;
                        return (
                          <>
                            <motion.circle
                              cx={x}
                              cy={y}
                              r='8'
                              fill='#1B998B'
                              opacity='0.2'
                              initial={{ scale: 0 }}
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: 1.2,
                              }}
                            />
                            <motion.circle
                              cx={x}
                              cy={y}
                              r='4'
                              fill='#1B998B'
                              stroke='#fff'
                              strokeWidth='2'
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: 1.2 }}
                            />
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  <div className='flex justify-between text-[10px] text-gray-400 px-1 mt-1'>
                    <span>Lun</span>
                    <span>Mar</span>
                    <span>Mer</span>
                    <span>Jeu</span>
                    <span>Ven</span>
                    <span>Sam</span>
                    <span className='font-medium text-[#1B998B]'>Auj.</span>
                  </div>
                </div>
              ) : (
                <p className='mt-3 text-xs text-gray-400 text-center'>
                  Ajoutez au moins 2 pesées pour voir votre courbe
                </p>
              )}
            </div>
          </motion.div>

          {/* DASH-005: Prochain RDV avec compte à rebours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className='bg-white rounded-xl p-6 border border-gray-200'
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-semibold text-gray-800'>
                Prochain rendez-vous
              </h3>
              {nextAppointmentData?.appointment && (
                <span className='inline-flex items-center px-2 py-1 bg-[#1B998B]/10 text-[#1B998B] text-xs font-medium rounded-full'>
                  {formatCountdown(
                    new Date(nextAppointmentData.appointment.scheduled_at)
                  )}
                </span>
              )}
            </div>

            {appointmentLoading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='w-6 h-6 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
              </div>
            ) : nextAppointmentData?.appointment ? (
              (() => {
                const appt = nextAppointmentData.appointment;
                const apptDate = new Date(appt.scheduled_at);
                const apptEndDate = new Date(appt.scheduled_end_at);
                const consultTypeName =
                  appt.consultation_type?.name_fr ||
                  getAppointmentTypeLabel(
                    (appt.consultation_type_code === 'follow_up'
                      ? 'follow-up'
                      : appt.consultation_type_code) as AppointmentType
                  );
                const nutriName =
                  appt.nutritionist?.title ||
                  appt.nutritionist?.cabinet_name ||
                  'Nutritionniste';
                const nutriInitials = nutriName
                  .split(' ')
                  .map((w: string) => w[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <>
                    <div className='bg-gradient-to-br from-[#1B998B]/5 to-[#1B998B]/10 rounded-xl p-4 mb-4 border border-[#1B998B]/10'>
                      <div className='flex items-start gap-4'>
                        <div className='w-14 h-14 bg-white rounded-xl flex flex-col items-center justify-center border border-[#1B998B]/20 shadow-sm'>
                          <span className='text-[10px] text-[#1B998B] font-semibold uppercase'>
                            {apptDate.toLocaleDateString('fr-FR', {
                              month: 'short',
                            })}
                          </span>
                          <span className='text-xl font-bold text-gray-800'>
                            {apptDate.getDate()}
                          </span>
                        </div>

                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-semibold text-gray-800 mb-1'>
                            {consultTypeName}
                          </p>
                          <p className='text-sm text-gray-600 mb-2'>
                            {apptDate.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {apptEndDate.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>

                          {(() => {
                            const modeInfo = getAppointmentModeInfo(
                              appt.mode as AppointmentMode
                            );
                            return (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${modeInfo.color}`}
                              >
                                <span>{modeInfo.icon}</span>
                                {modeInfo.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <div className='flex items-center gap-2 mt-3 pt-3 border-t border-[#1B998B]/10'>
                        <div className='w-6 h-6 bg-[#1B998B] rounded-full flex items-center justify-center text-white text-[10px] font-medium'>
                          {nutriInitials}
                        </div>
                        <span className='text-xs text-gray-600'>
                          avec{' '}
                          <span className='font-medium text-gray-800'>
                            {nutriName}
                          </span>
                        </span>
                      </div>
                    </div>

                    <Link
                      href='/dashboard/patient/agenda'
                      className='w-full py-2.5 text-sm text-[#1B998B] font-medium hover:bg-[#1B998B]/5 rounded-lg transition-colors flex items-center justify-center gap-1'
                    >
                      <Calendar className='w-4 h-4' />
                      Voir l&apos;agenda complet
                      <ArrowRight className='w-4 h-4' />
                    </Link>
                  </>
                );
              })()
            ) : (
              <div className='text-center py-6'>
                <div className='w-14 h-14 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                  <Calendar className='w-7 h-7 text-gray-400' />
                </div>
                <p className='text-sm font-medium text-gray-600 mb-1'>
                  Aucun rendez-vous planifié
                </p>
                <p className='text-xs text-gray-400 mb-4'>
                  Prenez rendez-vous avec votre nutritionniste
                </p>
                <Link
                  href='/dashboard/patient/agenda'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white text-sm font-medium rounded-lg hover:bg-[#147569] transition-colors'
                >
                  <Calendar className='w-4 h-4' />
                  Prendre rendez-vous
                </Link>
              </div>
            )}
          </motion.div>

          {/* DASH-006: Messages avec badge dynamique */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className='bg-white rounded-xl p-6 border border-gray-200'
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-semibold text-gray-800'>Messages</h3>
              {unreadCount > 0 && (
                <motion.span
                  key={unreadCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className='bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1'
                >
                  <span className='relative flex h-2 w-2'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
                  </span>
                  {unreadCount} non lu
                  {unreadCount > 1 ? 's' : ''}
                </motion.span>
              )}
            </div>

            <div className='space-y-2 max-h-40 overflow-y-auto'>
              {recentConversations.length > 0 ? (
                recentConversations.slice(0, 2).map(conv => (
                  <Link key={conv.id} href='/dashboard/patient/messagerie'>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        conv.unreadCount > 0
                          ? 'bg-[#1B998B]/5 hover:bg-[#1B998B]/10'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className='w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 bg-[#1B998B]'>
                        {conv.nutritionist.initials}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <p
                            className={`text-sm ${conv.unreadCount > 0 ? 'font-semibold text-gray-800' : 'font-medium text-gray-600'}`}
                          >
                            {conv.nutritionist.name}
                          </p>
                        </div>
                        {conv.lastMessage && (
                          <>
                            <p
                              className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-700' : 'text-gray-500'}`}
                            >
                              {conv.lastMessage.content}
                            </p>
                            <p className='text-[10px] text-gray-400 mt-0.5'>
                              {formatRelativeTime(conv.lastMessage.timestamp)}
                            </p>
                          </>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className='w-2 h-2 bg-[#1B998B] rounded-full mt-2 flex-shrink-0'></div>
                      )}
                    </motion.div>
                  </Link>
                ))
              ) : (
                <div className='text-center py-4'>
                  <p className='text-sm text-gray-500'>Aucun message</p>
                </div>
              )}
            </div>

            <Link
              href='/dashboard/patient/messagerie'
              className='w-full py-2.5 mt-3 text-sm text-[#1B998B] font-medium hover:bg-[#1B998B]/5 rounded-lg transition-colors flex items-center justify-center gap-1'
            >
              <MessageSquare className='w-4 h-4' />
              Ouvrir la messagerie
              <ArrowRight className='w-4 h-4' />
            </Link>
          </motion.div>
        </div>

        {/* DASH-007: Objectifs de la semaine */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className='mt-6 bg-white rounded-xl p-6 border border-gray-200'
        >
          {objectivesLoading ? (
            <div className='animate-pulse space-y-4'>
              <div className='h-5 bg-gray-200 rounded w-48' />
              <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className='h-40 bg-gray-100 rounded-xl' />
                ))}
              </div>
            </div>
          ) : weeklyObjectivesData &&
            weeklyObjectivesData.objectives.length > 0 ? (
            <>
              <div className='flex items-center justify-between mb-5'>
                <div className='flex items-center gap-3'>
                  <h3 className='font-semibold text-gray-800'>
                    Objectifs de la semaine
                  </h3>
                  <span className='inline-flex items-center px-2 py-0.5 bg-[#1B998B]/10 text-[#1B998B] text-xs font-medium rounded-full'>
                    {weeklyObjectivesData.completed_objectives}/
                    {weeklyObjectivesData.total_objectives} atteints
                  </span>
                </div>
                {weeklyObjectivesData.time_remaining && (
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${
                      weeklyObjectivesData.time_remaining.days <= 2
                        ? 'text-amber-600'
                        : 'text-gray-500'
                    }`}
                  >
                    <Clock className='w-3 h-3' />
                    {weeklyObjectivesData.time_remaining.label}
                  </span>
                )}
              </div>

              <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                {weeklyObjectivesData.objectives.map((objective, index) => {
                  const objStatus = getProgressStatus(objective.progress, 100);
                  const objColors = getStatusColors(objStatus);
                  const categoryInfo = getObjectiveCategoryInfo(
                    objective.category as ObjectiveCategory
                  );
                  const weekEndDate = new Date(
                    weeklyObjectivesData.week_end + 'T23:59:59'
                  );
                  const timeLeft = getTimeRemaining(weekEndDate);

                  return (
                    <motion.div
                      key={objective.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className={`relative p-4 rounded-xl border-2 transition-all group ${
                        objective.isCompleted
                          ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50'
                          : `${objColors.border} ${objColors.bgLight}`
                      }`}
                    >
                      {objective.isCompleted && (
                        <>
                          <motion.div
                            className='absolute -top-1 -right-1'
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 15,
                              delay: 0.8 + index * 0.1,
                            }}
                          >
                            <div className='w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg'>
                              <Check className='w-4 h-4 text-white' />
                            </div>
                          </motion.div>
                          <motion.div
                            className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-xl'
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{
                              duration: 1.5,
                              delay: 1 + index * 0.1,
                              ease: 'easeInOut',
                            }}
                          />
                        </>
                      )}

                      <div className='flex items-center justify-between mb-3'>
                        <div
                          className={`w-8 h-8 rounded-lg ${categoryInfo.bgColor} flex items-center justify-center`}
                        >
                          <span className='text-sm'>{categoryInfo.icon}</span>
                        </div>
                        {!objective.isCompleted && (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              timeLeft.isUrgent
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {timeLeft.text}
                          </span>
                        )}
                        {objective.isCompleted && (
                          <span className='text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700'>
                            Atteint !
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-sm font-medium mb-1 ${
                          objective.isCompleted
                            ? 'text-emerald-800'
                            : 'text-gray-800'
                        }`}
                      >
                        {objective.label}
                      </p>
                      {objective.description && (
                        <p className='text-[10px] text-gray-500 mb-3 line-clamp-1'>
                          {objective.description}
                        </p>
                      )}

                      <div className='mb-2'>
                        <div className='flex items-center justify-between mb-1'>
                          <span
                            className={`text-xs font-semibold ${
                              objective.isCompleted
                                ? 'text-emerald-600'
                                : objColors.text
                            }`}
                          >
                            {objective.progress}%
                          </span>
                          <span className='text-[10px] text-gray-500'>
                            {objective.current}/{objective.target}{' '}
                            {objective.unit}
                          </span>
                        </div>
                        <div className='h-2 bg-white/70 rounded-full overflow-hidden shadow-inner'>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${objective.progress}%` }}
                            transition={{
                              duration: 0.8,
                              delay: 0.8 + index * 0.1,
                              ease: 'easeOut',
                            }}
                            className={`h-full rounded-full ${
                              objective.isCompleted
                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                : objColors.bg
                            }`}
                          />
                        </div>
                      </div>

                      {objective.definedBy && (
                        <div className='flex items-center gap-1.5 pt-2 border-t border-gray-200/50'>
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium text-white ${
                              objective.definedBy.role === 'nutritionist'
                                ? 'bg-[#1B998B]'
                                : 'bg-blue-500'
                            }`}
                          >
                            {objective.definedBy.initials}
                          </div>
                          <span className='text-[10px] text-gray-400'>
                            {objective.definedBy.role === 'nutritionist'
                              ? 'Défini par'
                              : 'Suggéré par'}{' '}
                            {objective.definedBy.name}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {weeklyObjectivesData.completed_objectives ===
                weeklyObjectivesData.total_objectives &&
                weeklyObjectivesData.total_objectives > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className='mt-4 p-4 bg-gradient-to-r from-emerald-50 to-[#1B998B]/10 rounded-xl border border-emerald-200 text-center'
                  >
                    <div className='flex items-center justify-center gap-2 mb-1'>
                      <span className='text-2xl'>🎉</span>
                      <span className='font-semibold text-emerald-800'>
                        Félicitations !
                      </span>
                      <span className='text-2xl'>🎉</span>
                    </div>
                    <p className='text-sm text-emerald-700'>
                      Vous avez atteint tous vos objectifs cette semaine.
                      Continuez ainsi !
                    </p>
                  </motion.div>
                )}
            </>
          ) : (
            <div className='text-center py-6'>
              <h3 className='font-semibold text-gray-800 mb-2'>
                Objectifs de la semaine
              </h3>
              <p className='text-sm text-gray-500'>
                Aucun objectif défini pour cette semaine.
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                Votre nutritionniste peut vous définir des objectifs
                personnalisés.
              </p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Zone tertiaire - Accès rapide */}
      <section>
        <h2 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4'>
          Accès rapide
        </h2>

        <div className='grid grid-cols-4 gap-4'>
          {quickAccess.map((item, index) => (
            <Link key={index} href={item.href as any}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                className='bg-white rounded-xl p-5 border border-gray-200 text-left hover:border-[#1B998B]/50 hover:shadow-md transition-all h-full'
              >
                <div
                  className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}
                >
                  {item.icon}
                </div>
                <p className='font-medium text-gray-800'>{item.label}</p>
                <p className='text-sm text-gray-500'>{item.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
