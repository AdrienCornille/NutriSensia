'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Video,
  BookOpen,
  Headphones,
  GraduationCap,
  Eye,
  Bookmark,
  MoreVertical,
  Pencil,
  Trash2,
  Send,
  Archive,
  RotateCcw,
  Calendar,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  EducationalContent,
  ContentType,
  CONTENT_TYPE_LABELS,
  CONTENT_STATUS_LABELS,
  CONTENT_CATEGORY_LABELS,
} from '@/types/educational-content';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface ContentListProps {
  contents: EducationalContent[];
  onEdit: (content: EducationalContent) => void;
  onDelete: (content: EducationalContent) => void;
  onPublish: (content: EducationalContent, notifyPatients?: boolean) => void;
  onArchive: (content: EducationalContent) => void;
  onUnpublish?: (content: EducationalContent) => void;
  onSchedule?: (
    content: EducationalContent,
    scheduledAt: string,
    notifyPatients?: boolean
  ) => void;
}

const TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  article: <FileText className='w-5 h-5' />,
  video: <Video className='w-5 h-5' />,
  guide: <BookOpen className='w-5 h-5' />,
  podcast: <Headphones className='w-5 h-5' />,
  course: <GraduationCap className='w-5 h-5' />,
};

const TYPE_COLORS: Record<ContentType, string> = {
  article: 'bg-blue-50 text-blue-600',
  video: 'bg-purple-50 text-purple-600',
  guide: 'bg-orange-50 text-orange-600',
  podcast: 'bg-pink-50 text-pink-600',
  course: 'bg-[#1B998B]/10 text-[#1B998B]',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-amber-50 text-amber-600',
  published: 'bg-green-50 text-green-600',
  archived: 'bg-yellow-50 text-yellow-600',
};

type ConfirmAction = {
  type: 'publish' | 'unpublish' | 'archive' | 'delete' | 'schedule';
  content: EducationalContent;
};

export function ContentList({
  contents,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  onUnpublish,
  onSchedule,
}: ContentListProps) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPos, setMenuPos] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [confirmAction, setConfirmAction] =
    React.useState<ConfirmAction | null>(null);
  const [notifyPatients, setNotifyPatients] = React.useState(false);
  const [scheduledDate, setScheduledDate] = React.useState('');
  const [schedCalMonth, setSchedCalMonth] = React.useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [schedHour, setSchedHour] = React.useState('09');
  const [schedMinute, setSchedMinute] = React.useState('00');

  const openConfirm = (action: ConfirmAction) => {
    setConfirmAction(action);
    setNotifyPatients(false);
    if (action.type === 'schedule') {
      setScheduledDate('');
      setSchedCalMonth(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      );
      setSchedHour('09');
      setSchedMinute('00');
    }
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    switch (confirmAction.type) {
      case 'publish':
        onPublish(confirmAction.content, notifyPatients);
        break;
      case 'unpublish':
        onUnpublish?.(confirmAction.content);
        break;
      case 'archive':
        onArchive(confirmAction.content);
        break;
      case 'delete':
        onDelete(confirmAction.content);
        break;
      case 'schedule':
        if (scheduledDate && onSchedule) {
          onSchedule(
            confirmAction.content,
            new Date(scheduledDate).toISOString(),
            notifyPatients
          );
        }
        break;
    }
    setConfirmAction(null);
  };

  if (contents.length === 0) {
    return (
      <div className='text-center py-16'>
        <FileText className='w-12 h-12 text-gray-300 mx-auto mb-3' />
        <p className='text-gray-500 font-medium'>Aucun contenu</p>
        <p className='text-gray-400 text-sm mt-1'>
          Commencez par créer votre premier article ou guide.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='divide-y divide-gray-100'>
        {contents.map(content => (
          <div
            key={content.id}
            className='flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group'
            onClick={() => onEdit(content)}
          >
            {/* Type icon */}
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                TYPE_COLORS[content.type] || 'bg-gray-100 text-gray-600'
              }`}
            >
              {TYPE_ICONS[content.type] || <FileText className='w-5 h-5' />}
            </div>

            {/* Content info */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {content.title}
                </p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_COLORS[content.status] || ''
                  }`}
                >
                  {CONTENT_STATUS_LABELS[content.status] || content.status}
                </span>
                {content.isNew && (
                  <span className='text-xs font-medium text-[#1B998B]'>
                    Nouveau
                  </span>
                )}
              </div>
              <div className='flex items-center gap-2 text-xs text-gray-400 mt-0.5'>
                <span>{CONTENT_TYPE_LABELS[content.type] || content.type}</span>
                {content.category && (
                  <>
                    <span>·</span>
                    <span>
                      {CONTENT_CATEGORY_LABELS[content.category] ||
                        content.category}
                    </span>
                  </>
                )}
                {content.status === 'scheduled' &&
                  content.scheduledPublishAt && (
                    <>
                      <span>·</span>
                      <span className='flex items-center gap-1 text-amber-500'>
                        <Calendar className='w-3 h-3' />
                        {new Date(
                          content.scheduledPublishAt
                        ).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </>
                  )}
              </div>
            </div>

            {/* Stats */}
            <div className='hidden sm:flex items-center gap-4 text-xs text-gray-400'>
              <div className='flex items-center gap-1' title='Vues'>
                <Eye className='w-4 h-4' />
                <span>{content.viewCount}</span>
              </div>
              <div className='flex items-center gap-1' title='Sauvegardes'>
                <Bookmark className='w-4 h-4' />
                <span>{content.saveCount}</span>
              </div>
            </div>

            {/* Date */}
            <div className='hidden md:block text-xs text-gray-400 w-24 text-right'>
              {new Date(content.updatedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </div>

            {/* Actions menu */}
            <div className='relative'>
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (openMenuId === content.id) {
                    setOpenMenuId(null);
                  } else {
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    setMenuPos({
                      top: rect.bottom + 4,
                      left: rect.right - 192,
                    });
                    setOpenMenuId(content.id);
                  }
                }}
                className='p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors'
              >
                <MoreVertical className='w-4 h-4' />
              </button>

              {openMenuId === content.id && (
                <>
                  <div
                    className='fixed inset-0 z-40'
                    onClick={e => {
                      e.stopPropagation();
                      setOpenMenuId(null);
                    }}
                  />
                  <div
                    className='fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48'
                    style={{ top: menuPos.top, left: menuPos.left }}
                  >
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(content);
                        setOpenMenuId(null);
                      }}
                      className='flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                    >
                      <Pencil className='w-4 h-4' />
                      Modifier
                    </button>
                    {(content.status === 'draft' ||
                      content.status === 'scheduled') && (
                      <>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openConfirm({ type: 'publish', content });
                            setOpenMenuId(null);
                          }}
                          className='flex items-center gap-2 w-full px-3 py-2 text-sm text-[#1B998B] hover:bg-[#1B998B]/5'
                        >
                          <Send className='w-4 h-4' />
                          Publier
                        </button>
                        {onSchedule && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              openConfirm({ type: 'schedule', content });
                              setOpenMenuId(null);
                            }}
                            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-700 hover:bg-amber-50'
                          >
                            <Calendar className='w-4 h-4' />
                            Planifier
                          </button>
                        )}
                      </>
                    )}
                    {content.status === 'published' && onUnpublish && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openConfirm({ type: 'unpublish', content });
                          setOpenMenuId(null);
                        }}
                        className='flex items-center gap-2 w-full px-3 py-2 text-sm text-orange-600 hover:bg-orange-50'
                      >
                        <RotateCcw className='w-4 h-4' />
                        Remettre en brouillon
                      </button>
                    )}
                    {content.status === 'published' && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openConfirm({ type: 'archive', content });
                          setOpenMenuId(null);
                        }}
                        className='flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-600 hover:bg-amber-50'
                      >
                        <Archive className='w-4 h-4' />
                        Archiver
                      </button>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        openConfirm({ type: 'delete', content });
                        setOpenMenuId(null);
                      }}
                      className='flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50'
                    >
                      <Trash2 className='w-4 h-4' />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Confirmation modals ─── */}
      <AnimatePresence>
        {confirmAction &&
          (() => {
            // Schedule modal has its own layout
            if (confirmAction.type === 'schedule') {
              return (
                <ScheduleModal
                  key='schedule-modal'
                  content={confirmAction.content}
                  notifyPatients={notifyPatients}
                  setNotifyPatients={setNotifyPatients}
                  scheduledDate={scheduledDate}
                  setScheduledDate={setScheduledDate}
                  calMonth={schedCalMonth}
                  setCalMonth={setSchedCalMonth}
                  schedHour={schedHour}
                  setSchedHour={setSchedHour}
                  schedMinute={schedMinute}
                  setSchedMinute={setSchedMinute}
                  onConfirm={handleConfirm}
                  onCancel={() => setConfirmAction(null)}
                />
              );
            }

            // Publish modal includes notify checkbox
            if (confirmAction.type === 'publish') {
              return (
                <motion.div
                  key='publish-modal'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
                  onClick={() => setConfirmAction(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'
                    onClick={e => e.stopPropagation()}
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-xl flex items-center justify-center bg-[#1B998B]/10 text-[#1B998B]'>
                          <Send className='w-5 h-5' />
                        </div>
                        <h3 className='text-base font-semibold text-gray-900'>
                          Publier ce contenu
                        </h3>
                      </div>
                      <button
                        onClick={() => setConfirmAction(null)}
                        className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
                      >
                        <X className='w-5 h-5 text-gray-400' />
                      </button>
                    </div>

                    <p className='text-sm font-medium text-gray-800 truncate mb-1'>
                      « {confirmAction.content.title} »
                    </p>
                    <p className='text-sm text-gray-500 mb-5'>
                      Le contenu sera immédiatement visible par vos patients.
                    </p>

                    <div className='mb-6'>
                      <label className='flex items-center gap-3 cursor-pointer group'>
                        <button
                          type='button'
                          role='checkbox'
                          aria-checked={notifyPatients}
                          onClick={() => setNotifyPatients(!notifyPatients)}
                          className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                            notifyPatients
                              ? 'bg-[#1B998B] border-[#1B998B]'
                              : 'border-gray-300 group-hover:border-[#1B998B]/50'
                          }`}
                        >
                          {notifyPatients && (
                            <svg
                              className='w-3 h-3 text-white'
                              viewBox='0 0 12 12'
                              fill='none'
                            >
                              <path
                                d='M2 6l3 3 5-5'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          )}
                        </button>
                        <span className='text-sm text-gray-600'>
                          Notifier mes patients lors de la publication
                        </span>
                      </label>
                    </div>

                    <div className='flex justify-end gap-2'>
                      <button
                        onClick={() => setConfirmAction(null)}
                        className='px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleConfirm}
                        className='flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors'
                      >
                        <Send className='w-4 h-4' />
                        Publier maintenant
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            }

            // Generic confirmation (unpublish, archive, delete)
            const configs: Record<
              string,
              {
                title: string;
                message: string;
                confirmLabel: string;
                confirmClass: string;
                icon: typeof Send;
                iconClass: string;
              }
            > = {
              unpublish: {
                title: 'Remettre en brouillon',
                message:
                  'En remettant ce contenu en brouillon, il ne sera plus accessible à vos patients.',
                confirmLabel: 'Remettre en brouillon',
                confirmClass: 'bg-orange-500 text-white hover:bg-orange-600',
                icon: RotateCcw,
                iconClass: 'text-orange-600 bg-orange-50',
              },
              archive: {
                title: 'Archiver ce contenu',
                message:
                  'Le contenu sera archivé et ne sera plus visible par vos patients. Vous pourrez le restaurer à tout moment.',
                confirmLabel: 'Archiver',
                confirmClass: 'bg-amber-500 text-white hover:bg-amber-600',
                icon: Archive,
                iconClass: 'text-amber-600 bg-amber-50',
              },
              delete: {
                title: 'Supprimer ce contenu',
                message:
                  'Cette action est irréversible. Le contenu et toutes ses données seront définitivement supprimés.',
                confirmLabel: 'Supprimer',
                confirmClass: 'bg-red-500 text-white hover:bg-red-600',
                icon: Trash2,
                iconClass: 'text-red-500 bg-red-50',
              },
            };

            const config = configs[confirmAction.type];
            if (!config) return null;
            const Icon = config.icon;

            return (
              <motion.div
                key='confirm-modal'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
                onClick={() => setConfirmAction(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'
                  onClick={e => e.stopPropagation()}
                >
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.iconClass}`}
                      >
                        <Icon className='w-5 h-5' />
                      </div>
                      <h3 className='text-base font-semibold text-gray-900'>
                        {config.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => setConfirmAction(null)}
                      className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
                    >
                      <X className='w-5 h-5 text-gray-400' />
                    </button>
                  </div>

                  <p className='text-sm font-medium text-gray-800 truncate mb-1'>
                    « {confirmAction.content.title} »
                  </p>
                  <p className='text-sm text-gray-500 mb-6'>{config.message}</p>

                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={() => setConfirmAction(null)}
                      className='px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleConfirm}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${config.confirmClass}`}
                    >
                      <Icon className='w-4 h-4' />
                      {config.confirmLabel}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </>
  );
}

// ─── Schedule Modal ───

function ScheduleModal({
  content,
  notifyPatients,
  setNotifyPatients,
  scheduledDate,
  setScheduledDate,
  calMonth,
  setCalMonth,
  schedHour,
  setSchedHour,
  schedMinute,
  setSchedMinute,
  onConfirm,
  onCancel,
}: {
  content: EducationalContent;
  notifyPatients: boolean;
  setNotifyPatients: (v: boolean) => void;
  scheduledDate: string;
  setScheduledDate: (v: string) => void;
  calMonth: Date;
  setCalMonth: (v: Date) => void;
  schedHour: string;
  setSchedHour: (v: string) => void;
  schedMinute: string;
  setSchedMinute: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedDate = scheduledDate ? new Date(scheduledDate) : null;
  const daysInMonthCount = new Date(
    calMonth.getFullYear(),
    calMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDow = new Date(
    calMonth.getFullYear(),
    calMonth.getMonth(),
    1
  ).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const isSelected = (day: number) => {
    if (!parsedDate) return false;
    return (
      parsedDate.getFullYear() === calMonth.getFullYear() &&
      parsedDate.getMonth() === calMonth.getMonth() &&
      parsedDate.getDate() === day
    );
  };

  const isToday = (day: number) => {
    const d = new Date();
    return (
      d.getFullYear() === calMonth.getFullYear() &&
      d.getMonth() === calMonth.getMonth() &&
      d.getDate() === day
    );
  };

  const isPast = (day: number) => {
    const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const selectDay = (day: number) => {
    const d = new Date(
      calMonth.getFullYear(),
      calMonth.getMonth(),
      day,
      parseInt(schedHour),
      parseInt(schedMinute)
    );
    setScheduledDate(d.toISOString().slice(0, 16));
  };

  const changeMonth = (dir: number) => {
    setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + dir, 1));
  };

  const updateTime = (h: string, m: string) => {
    if (parsedDate) {
      const d = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
        parseInt(h),
        parseInt(m)
      );
      setScheduledDate(d.toISOString().slice(0, 16));
    }
    setSchedHour(h);
    setSchedMinute(m);
  };

  return (
    <motion.div
      key='schedule-modal'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center justify-between mb-5'>
          <h3 className='text-base font-semibold text-gray-900'>
            Planifier la publication
          </h3>
          <button
            onClick={onCancel}
            className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5 text-gray-400' />
          </button>
        </div>

        <p className='text-sm font-medium text-gray-800 truncate mb-4'>
          « {content.title} »
        </p>

        {/* Calendar */}
        <div className='mb-5'>
          <div className='flex items-center justify-between mb-3'>
            <button
              onClick={() => changeMonth(-1)}
              className='p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors'
            >
              <ChevronLeft className='w-4 h-4' />
            </button>
            <span className='text-sm font-medium text-gray-700'>
              {monthNames[calMonth.getMonth()]} {calMonth.getFullYear()}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className='p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors'
            >
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>

          <div className='grid grid-cols-7 gap-1 mb-1'>
            {weekDays.map(d => (
              <div
                key={d}
                className='text-center text-xs font-medium text-gray-400 py-1'
              >
                {d}
              </div>
            ))}
          </div>

          <div className='grid grid-cols-7 gap-1'>
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`e-${i}`} className='aspect-square' />
            ))}
            {Array.from({ length: daysInMonthCount }).map((_, i) => {
              const day = i + 1;
              const past = isPast(day);
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <button
                  key={day}
                  type='button'
                  disabled={past}
                  onClick={() => selectDay(day)}
                  className={`aspect-square rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
                    past
                      ? 'text-gray-200 cursor-not-allowed'
                      : sel
                        ? 'bg-[#1B998B] text-white shadow-sm'
                        : tod
                          ? 'bg-[#1B998B]/10 text-[#1B998B] font-bold hover:bg-[#1B998B]/20'
                          : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time picker */}
        <div className='mb-5'>
          <label className='block text-xs font-medium text-gray-600 mb-2'>
            Heure de publication
          </label>
          <div className='flex items-center gap-2'>
            <CustomDropdown
              value={schedHour}
              onChange={v => updateTime(v, schedMinute)}
              options={Array.from({ length: 24 }).map((_, h) => ({
                value: String(h).padStart(2, '0'),
                label: `${String(h).padStart(2, '0')}h`,
              }))}
              placeholder='Heure'
              allowReset={false}
              className='flex-1'
            />
            <span className='text-gray-400 font-medium'>:</span>
            <CustomDropdown
              value={schedMinute}
              onChange={v => updateTime(schedHour, v)}
              options={['00', '15', '30', '45'].map(m => ({
                value: m,
                label: `${m} min`,
              }))}
              placeholder='Minutes'
              allowReset={false}
              className='flex-1'
            />
          </div>
        </div>

        {/* Notify */}
        <div className='mb-6'>
          <label className='flex items-center gap-3 cursor-pointer group'>
            <button
              type='button'
              role='checkbox'
              aria-checked={notifyPatients}
              onClick={() => setNotifyPatients(!notifyPatients)}
              className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                notifyPatients
                  ? 'bg-[#1B998B] border-[#1B998B]'
                  : 'border-gray-300 group-hover:border-[#1B998B]/50'
              }`}
            >
              {notifyPatients && (
                <svg
                  className='w-3 h-3 text-white'
                  viewBox='0 0 12 12'
                  fill='none'
                >
                  <path
                    d='M2 6l3 3 5-5'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
            </button>
            <span className='text-sm text-gray-600'>
              Notifier mes patients lors de la publication
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-2'>
          <button
            onClick={onCancel}
            className='px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={!scheduledDate}
            className='flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50 transition-colors'
          >
            <Calendar className='w-4 h-4' />
            Planifier
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
