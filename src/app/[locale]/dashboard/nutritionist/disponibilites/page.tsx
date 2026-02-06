'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Clock,
  Calendar,
  Ban,
  Trash2,
  Pencil,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useNutritionistAvailability,
  useCreateAvailability,
  useDeleteAvailability,
  getDayName,
  formatTime,
  getAvailabilityTypeLabel,
  type AvailabilityItem,
  type AvailabilityType,
} from '@/hooks/useNutritionistAvailability';
import { useNutritionistConsultationTypes } from '@/hooks/useNutritionistConsultationTypes';
import { Link } from '@/i18n/navigation';

// ==================== TYPES ====================

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
}

interface AvailabilityFormData {
  availability_type: AvailabilityType;
  days_of_week: number[];
  time_slots: TimeSlot[];
  specific_date: string;
  visio_available: boolean;
  cabinet_available: boolean;
  notes: string;
  consultation_type_ids: string[];
}

interface EditFormData {
  start_time: string;
  end_time: string;
  visio_available: boolean;
  cabinet_available: boolean;
  consultation_type_ids: string[];
  notes: string;
}

/**
 * Groups multiple DB rows (same slot but different consultation_type_id) into one UI entity.
 */
interface GroupedAvailability {
  key: string;
  availability_type: AvailabilityType;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  specific_date: string | null;
  visio_available: boolean;
  cabinet_available: boolean;
  notes: string | null;
  ids: string[];
  consultation_type_ids: string[];
  all_consultation_types: boolean;
  items: AvailabilityItem[];
}

function groupAvailabilities(
  items: AvailabilityItem[]
): GroupedAvailability[] {
  const map = new Map<string, GroupedAvailability>();

  for (const item of items) {
    const key = `${item.day_of_week ?? ''}_${item.specific_date ?? ''}_${item.start_time}_${item.end_time}_${item.visio_available}_${item.cabinet_available}`;

    if (!map.has(key)) {
      map.set(key, {
        key,
        availability_type: item.availability_type,
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        specific_date: item.specific_date,
        visio_available: item.visio_available,
        cabinet_available: item.cabinet_available,
        notes: item.notes,
        ids: [],
        consultation_type_ids: [],
        all_consultation_types: false,
        items: [],
      });
    }

    const group = map.get(key)!;
    group.ids.push(item.id);
    group.items.push(item);

    if (item.consultation_type_id === null) {
      group.all_consultation_types = true;
    } else if (
      !group.consultation_type_ids.includes(item.consultation_type_id)
    ) {
      group.consultation_type_ids.push(item.consultation_type_id);
    }
  }

  return Array.from(map.values());
}

const createTimeSlot = (): TimeSlot => ({
  id: crypto.randomUUID(),
  start_time: '09:00',
  end_time: '12:00',
});

const initialFormData: AvailabilityFormData = {
  availability_type: 'recurring',
  days_of_week: [1],
  time_slots: [createTimeSlot()],
  specific_date: '',
  visio_available: true,
  cabinet_available: true,
  notes: '',
  consultation_type_ids: [],
};

const DAYS = [
  { value: 1, label: 'Lun', fullLabel: 'Lundi' },
  { value: 2, label: 'Mar', fullLabel: 'Mardi' },
  { value: 3, label: 'Mer', fullLabel: 'Mercredi' },
  { value: 4, label: 'Jeu', fullLabel: 'Jeudi' },
  { value: 5, label: 'Ven', fullLabel: 'Vendredi' },
  { value: 6, label: 'Sam', fullLabel: 'Samedi' },
  { value: 0, label: 'Dim', fullLabel: 'Dimanche' },
];

// Ordre des jours pour le groupement (Lundi en premier)
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

// ==================== DELETE CONFIRM MODAL ====================

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  group,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  group: GroupedAvailability | null;
}) {
  if (!isOpen || !group) return null;

  const label =
    group.availability_type === 'recurring'
      ? getDayName(group.day_of_week!)
      : group.specific_date;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className='bg-white rounded-2xl max-w-md w-full p-6'
            onClick={e => e.stopPropagation()}
          >
            <div className='text-center'>
              <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Trash2 className='w-6 h-6 text-red-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                Supprimer cette disponibilité ?
              </h3>
              <p className='text-sm text-gray-500 mb-1'>
                <strong>{label}</strong> : {formatTime(group.start_time)}{' '}
                - {formatTime(group.end_time)}
              </p>
              <p className='text-sm text-gray-400 mb-6'>
                Cette action est irréversible.
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className='flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50'
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className='flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {isDeleting ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==================== EDIT AVAILABILITY MODAL ====================

function EditAvailabilityModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  group,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (group: GroupedAvailability, data: EditFormData) => void;
  isSubmitting: boolean;
  group: GroupedAvailability | null;
}) {
  const [formData, setFormData] = useState<EditFormData>({
    start_time: '',
    end_time: '',
    visio_available: true,
    cabinet_available: true,
    consultation_type_ids: [],
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch consultation types
  const { data: consultationTypesData, isLoading: isLoadingTypes } =
    useNutritionistConsultationTypes();
  const consultationTypes = consultationTypesData?.consultationTypes;

  // Sync form data when group changes
  useEffect(() => {
    if (group) {
      setFormData({
        start_time: formatTime(group.start_time),
        end_time: formatTime(group.end_time),
        visio_available: group.visio_available,
        cabinet_available: group.cabinet_available,
        consultation_type_ids: group.all_consultation_types
          ? (consultationTypes || []).map(ct => ct.id)
          : [...group.consultation_type_ids],
        notes: group.notes || '',
      });
    }
    setError(null);
  }, [group, consultationTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.start_time >= formData.end_time) {
      setError("L'heure de fin doit être après l'heure de début");
      return;
    }
    if (
      !formData.visio_available &&
      !formData.cabinet_available &&
      group?.availability_type !== 'blocked'
    ) {
      setError('Veuillez sélectionner au moins un mode de consultation');
      return;
    }
    if (
      formData.consultation_type_ids.length === 0 &&
      group?.availability_type !== 'blocked'
    ) {
      setError('Veuillez sélectionner au moins un type de consultation');
      return;
    }

    if (group) {
      onSubmit(group, formData);
    }
  };

  if (!isOpen || !group) return null;

  const label =
    group.availability_type === 'recurring'
      ? getDayName(group.day_of_week!)
      : group.specific_date;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className='bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto'
            onClick={e => e.stopPropagation()}
          >
            <div className='p-6 border-b border-gray-100'>
              <h2 className='text-lg font-semibold text-gray-800'>
                Modifier la disponibilité
              </h2>
              <p className='text-sm text-gray-500 mt-1'>
                {getAvailabilityTypeLabel(group.availability_type)} —{' '}
                {label}
              </p>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-5'>
              {error && (
                <div className='p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2'>
                  <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
                  <p className='text-sm text-red-600'>{error}</p>
                </div>
              )}

              {/* Créneau horaire */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Créneau horaire
                </label>
                <div className='flex items-center gap-2'>
                  <input
                    type='time'
                    value={formData.start_time}
                    onChange={e =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent'
                  />
                  <span className='text-gray-400'>—</span>
                  <input
                    type='time'
                    value={formData.end_time}
                    onChange={e =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent'
                  />
                </div>
              </div>

              {/* Modes de consultation */}
              {group.availability_type !== 'blocked' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Modes disponibles
                  </label>
                  <div className='flex gap-4'>
                    <label className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={formData.visio_available}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            visio_available: e.target.checked,
                          })
                        }
                        className='rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
                      />
                      <span className='text-sm text-gray-700'>
                        Visioconférence
                      </span>
                    </label>
                    <label className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={formData.cabinet_available}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            cabinet_available: e.target.checked,
                          })
                        }
                        className='rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
                      />
                      <span className='text-sm text-gray-700'>Cabinet</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Type de consultation */}
              {group.availability_type !== 'blocked' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Types de consultation
                  </label>
                  <ConsultationTypeSelector
                    selectedIds={formData.consultation_type_ids}
                    consultationTypes={consultationTypes}
                    onSelectionChange={ids => {
                      setFormData({
                        ...formData,
                        consultation_type_ids: ids,
                      });
                    }}
                    isLoading={isLoadingTypes}
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  placeholder='Ex: Consultations de suivi uniquement'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent resize-none'
                />
              </div>

              {/* Actions */}
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={onClose}
                  className='flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors'
                >
                  Annuler
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='flex-1 py-2 px-4 bg-[#1B998B] text-white font-medium rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Mise à jour...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==================== AVAILABILITY CARD ====================

function AvailabilityCard({
  group,
  typeNameMap,
  onEdit,
  onDelete,
}: {
  group: GroupedAvailability;
  typeNameMap: Map<string, string>;
  onEdit: (group: GroupedAvailability) => void;
  onDelete: (group: GroupedAvailability) => void;
}) {
  return (
    <div className='bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow'>
      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-3'>
          <div className='p-2 rounded-lg bg-green-100 text-green-700'>
            <Clock className='w-4 h-4' />
          </div>
          <div>
            <p className='font-medium text-gray-800'>
              {formatTime(group.start_time)} -{' '}
              {formatTime(group.end_time)}
            </p>
            <div className='flex flex-wrap gap-2 mt-2'>
              {group.visio_available && (
                <span className='text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded'>
                  Visio
                </span>
              )}
              {group.cabinet_available && (
                <span className='text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded'>
                  Cabinet
                </span>
              )}
              {group.all_consultation_types ? (
                <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded'>
                  Tous les types
                </span>
              ) : (
                group.consultation_type_ids.map(id => (
                  <span
                    key={id}
                    className='text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded'
                  >
                    {typeNameMap.get(id) || 'Type inconnu'}
                  </span>
                ))
              )}
            </div>
            {group.notes && (
              <p className='text-xs text-gray-400 mt-2'>{group.notes}</p>
            )}
          </div>
        </div>
        <div className='flex gap-1'>
          <button
            onClick={() => onEdit(group)}
            className='p-2 text-gray-400 hover:text-[#1B998B] hover:bg-green-50 rounded-lg transition-colors'
            title='Modifier'
          >
            <Pencil className='w-4 h-4' />
          </button>
          <button
            onClick={() => onDelete(group)}
            className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
            title='Supprimer'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== NON-RECURRING AVAILABILITY CARD ====================

function NonRecurringCard({
  group,
  onDelete,
}: {
  group: GroupedAvailability;
  onDelete: (group: GroupedAvailability) => void;
}) {
  const isBlocked = group.availability_type === 'blocked';

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow'>
      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-3'>
          <div
            className={`p-2 rounded-lg ${isBlocked ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
          >
            {isBlocked ? (
              <Ban className='w-4 h-4' />
            ) : (
              <Calendar className='w-4 h-4' />
            )}
          </div>
          <div>
            <p className='font-medium text-gray-800'>
              {group.specific_date}
            </p>
            <p className='text-sm text-gray-600 mt-1'>
              {formatTime(group.start_time)} -{' '}
              {formatTime(group.end_time)}
            </p>
            <div className='flex gap-2 mt-2'>
              {group.visio_available && (
                <span className='text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded'>
                  Visio
                </span>
              )}
              {group.cabinet_available && (
                <span className='text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded'>
                  Cabinet
                </span>
              )}
            </div>
            {group.notes && (
              <p className='text-xs text-gray-400 mt-2'>{group.notes}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(group)}
          className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
          title='Supprimer'
        >
          <Trash2 className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}

// ==================== TIME SLOT INPUT ====================

function TimeSlotInput({
  slot,
  onUpdate,
  onRemove,
  canRemove,
}: {
  slot: TimeSlot;
  onUpdate: (
    id: string,
    field: 'start_time' | 'end_time',
    value: string
  ) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  return (
    <div className='flex items-center gap-2'>
      <input
        type='time'
        value={slot.start_time}
        onChange={e => onUpdate(slot.id, 'start_time', e.target.value)}
        className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent'
      />
      <span className='text-gray-400'>-</span>
      <input
        type='time'
        value={slot.end_time}
        onChange={e => onUpdate(slot.id, 'end_time', e.target.value)}
        className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent'
      />
      {canRemove && (
        <button
          type='button'
          onClick={() => onRemove(slot.id)}
          className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
        >
          <X className='w-4 h-4' />
        </button>
      )}
    </div>
  );
}

// ==================== DAY SELECTOR ====================

function DaySelector({
  selectedDays,
  onToggle,
}: {
  selectedDays: number[];
  onToggle: (day: number) => void;
}) {
  return (
    <div className='flex flex-wrap gap-2'>
      {DAYS.map(day => (
        <button
          key={day.value}
          type='button'
          onClick={() => onToggle(day.value)}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
            selectedDays.includes(day.value)
              ? 'bg-[#1B998B] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}

// ==================== CONSULTATION TYPE SELECTOR ====================

function ConsultationTypeSelector({
  selectedIds,
  consultationTypes,
  onSelectionChange,
  isLoading,
}: {
  selectedIds: string[];
  consultationTypes:
    | Array<{ id: string; name_fr: string; code: string }>
    | undefined;
  onSelectionChange: (ids: string[]) => void;
  isLoading: boolean;
}) {
  const allSelected =
    !!consultationTypes &&
    consultationTypes.length > 0 &&
    consultationTypes.every(ct => selectedIds.includes(ct.id));

  const handleSelectAll = (checked: boolean) => {
    if (!consultationTypes) return;
    onSelectionChange(checked ? consultationTypes.map(ct => ct.id) : []);
  };

  const handleToggle = (id: string) => {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter(t => t !== id)
        : [...selectedIds, id]
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 text-gray-500'>
        <Loader2 className='w-4 h-4 animate-spin' />
        <span className='text-sm'>Chargement des types...</span>
      </div>
    );
  }

  if (!consultationTypes || consultationTypes.length === 0) {
    return (
      <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg'>
        <p className='text-sm text-amber-800'>
          Vous n&apos;avez pas encore créé de types de consultation.{' '}
          <Link
            href='/dashboard/nutritionist/parametres/types-consultation'
            className='text-[#1B998B] hover:underline font-medium'
          >
            Créez vos types
          </Link>{' '}
          pour pouvoir les associer à vos disponibilités.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <label className='flex items-center gap-2'>
        <input
          type='checkbox'
          checked={allSelected}
          onChange={e => handleSelectAll(e.target.checked)}
          className='rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
        />
        <span className='text-sm text-gray-700 font-medium'>
          Tout sélectionner
        </span>
      </label>

      <div className='pl-6 space-y-2'>
        {consultationTypes.map(type => (
          <label key={type.id} className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={selectedIds.includes(type.id)}
              onChange={() => handleToggle(type.id)}
              className='rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
            />
            <span className='text-sm text-gray-700'>{type.name_fr}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ==================== ADD AVAILABILITY MODAL ====================

function AddAvailabilityModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AvailabilityFormData) => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] =
    useState<AvailabilityFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);

  const { data: consultationTypesData, isLoading: isLoadingTypes } =
    useNutritionistConsultationTypes();
  const consultationTypes = consultationTypesData?.consultationTypes;

  // Pre-select all types by default when they load
  useEffect(() => {
    if (consultationTypes && formData.consultation_type_ids.length === 0) {
      setFormData(prev => ({
        ...prev,
        consultation_type_ids: consultationTypes.map(ct => ct.id),
      }));
    }
  }, [consultationTypes]); // eslint-disable-line react-hooks/exhaustive-deps

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      time_slots: [...prev.time_slots, createTimeSlot()],
    }));
  };

  const updateTimeSlot = (
    id: string,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      time_slots: prev.time_slots.map(slot =>
        slot.id === id ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const removeTimeSlot = (id: string) => {
    setFormData(prev => ({
      ...prev,
      time_slots: prev.time_slots.filter(slot => slot.id !== id),
    }));
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day],
    }));
  };

  const handleTypeSelectionChange = (ids: string[]) => {
    setFormData(prev => ({
      ...prev,
      consultation_type_ids: ids,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      formData.availability_type === 'recurring' &&
      formData.days_of_week.length === 0
    ) {
      setError('Veuillez sélectionner au moins un jour de la semaine');
      return;
    }
    if (
      (formData.availability_type === 'exception' ||
        formData.availability_type === 'blocked') &&
      !formData.specific_date
    ) {
      setError('Veuillez sélectionner une date');
      return;
    }
    if (formData.time_slots.length === 0) {
      setError('Veuillez ajouter au moins un créneau horaire');
      return;
    }
    for (const slot of formData.time_slots) {
      if (slot.start_time >= slot.end_time) {
        setError("L'heure de fin doit être après l'heure de début");
        return;
      }
    }
    if (
      !formData.visio_available &&
      !formData.cabinet_available &&
      formData.availability_type !== 'blocked'
    ) {
      setError('Veuillez sélectionner au moins un mode de consultation');
      return;
    }
    if (
      formData.consultation_type_ids.length === 0 &&
      formData.availability_type !== 'blocked'
    ) {
      setError('Veuillez sélectionner au moins un type de consultation');
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setError(null);
    onClose();
  };

  const totalEntries = useMemo(() => {
    if (formData.availability_type !== 'recurring')
      return formData.time_slots.length;
    const days = formData.days_of_week.length;
    const slots = formData.time_slots.length;
    const types = Math.max(1, formData.consultation_type_ids.length);
    return days * slots * types;
  }, [formData]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-lg font-semibold text-gray-800'>
            Ajouter des disponibilités
          </h2>
          <p className='text-sm text-gray-500 mt-1'>
            Définissez vos plages horaires de travail
          </p>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-5'>
          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2'>
              <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          {/* Type */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Type
            </label>
            <select
              value={formData.availability_type}
              onChange={e =>
                setFormData({
                  ...formData,
                  availability_type: e.target.value as AvailabilityType,
                })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent'
            >
              <option value='recurring'>Récurrente (chaque semaine)</option>
              <option value='exception'>Exception (date spécifique)</option>
              <option value='blocked'>Bloqué (indisponible)</option>
            </select>
          </div>

          {/* Jours de la semaine (recurring) */}
          {formData.availability_type === 'recurring' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Jours de la semaine
                {formData.days_of_week.length > 0 && (
                  <span className='ml-2 text-xs text-gray-400'>
                    ({formData.days_of_week.length} jour
                    {formData.days_of_week.length > 1 ? 's' : ''} sélectionné
                    {formData.days_of_week.length > 1 ? 's' : ''})
                  </span>
                )}
              </label>
              <DaySelector
                selectedDays={formData.days_of_week}
                onToggle={toggleDay}
              />
            </div>
          )}

          {/* Date spécifique (exception/blocked) */}
          {(formData.availability_type === 'exception' ||
            formData.availability_type === 'blocked') && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Date
              </label>
              <input
                type='date'
                value={formData.specific_date}
                onChange={e =>
                  setFormData({ ...formData, specific_date: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent'
              />
            </div>
          )}

          {/* Créneaux horaires */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Créneaux horaires
              {formData.time_slots.length > 1 && (
                <span className='ml-2 text-xs text-gray-400'>
                  ({formData.time_slots.length} créneaux)
                </span>
              )}
            </label>
            <div className='space-y-2'>
              {formData.time_slots.map(slot => (
                <TimeSlotInput
                  key={slot.id}
                  slot={slot}
                  onUpdate={updateTimeSlot}
                  onRemove={removeTimeSlot}
                  canRemove={formData.time_slots.length > 1}
                />
              ))}
            </div>
            <button
              type='button'
              onClick={addTimeSlot}
              className='mt-2 inline-flex items-center gap-1 text-sm text-[#1B998B] hover:text-[#158578] font-medium'
            >
              <Plus className='w-4 h-4' />
              Ajouter un créneau
            </button>
          </div>

          {/* Modes de consultation */}
          {formData.availability_type !== 'blocked' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Modes disponibles
              </label>
              <div className='flex gap-4'>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={formData.visio_available}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        visio_available: e.target.checked,
                      })
                    }
                    className='rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
                  />
                  <span className='text-sm text-gray-700'>Visioconférence</span>
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={formData.cabinet_available}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        cabinet_available: e.target.checked,
                      })
                    }
                    className='rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
                  />
                  <span className='text-sm text-gray-700'>Cabinet</span>
                </label>
              </div>
            </div>
          )}

          {/* Types de consultation */}
          {formData.availability_type !== 'blocked' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Types de consultation
              </label>
              <ConsultationTypeSelector
                selectedIds={formData.consultation_type_ids}
                consultationTypes={consultationTypes}
                onSelectionChange={handleTypeSelectionChange}
                isLoading={isLoadingTypes}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={e =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
              placeholder='Ex: Consultations de suivi uniquement'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B998B] focus:border-transparent resize-none'
            />
          </div>

          {/* Résumé */}
          {totalEntries > 1 && (
            <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-700'>
                <strong>{totalEntries} entrées</strong> seront créées
                {formData.availability_type === 'recurring' && (
                  <>
                    {' '}
                    ({formData.days_of_week.length} jour
                    {formData.days_of_week.length > 1 ? 's' : ''} x{' '}
                    {formData.time_slots.length} créneau
                    {formData.time_slots.length > 1 ? 'x' : ''})
                  </>
                )}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={handleClose}
              className='flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors'
            >
              Annuler
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex-1 py-2 px-4 bg-[#1B998B] text-white font-medium rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Ajout...
                </>
              ) : (
                'Ajouter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function DisponibilitesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroup, setEditingGroup] =
    useState<GroupedAvailability | null>(null);
  const [deletingGroup, setDeletingGroup] =
    useState<GroupedAvailability | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Queries
  const { data, isLoading, error } = useNutritionistAvailability();

  // Consultation types for display in cards
  const { data: consultationTypesData } = useNutritionistConsultationTypes();
  const typeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (consultationTypesData?.consultationTypes) {
      for (const t of consultationTypesData.consultationTypes) {
        map.set(t.id, t.name_fr);
      }
    }
    return map;
  }, [consultationTypesData]);

  // Mutations
  const createMutation = useCreateAvailability();
  const deleteMutation = useDeleteAvailability();

  // Group recurring availabilities by day of week (Monday first), merging same-slot rows
  const recurringByDay = useMemo(() => {
    if (!data?.grouped?.recurring)
      return new Map<number, GroupedAvailability[]>();

    const allGrouped = groupAvailabilities(data.grouped.recurring);

    const map = new Map<number, GroupedAvailability[]>();
    for (const day of DAY_ORDER) {
      const items = allGrouped
        .filter(g => g.day_of_week === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      if (items.length > 0) {
        map.set(day, items);
      }
    }
    return map;
  }, [data]);

  // Group exceptions and blocked
  const groupedExceptions = useMemo(() => {
    if (!data?.grouped?.exceptions) return [];
    return groupAvailabilities(data.grouped.exceptions);
  }, [data]);

  const groupedBlocked = useMemo(() => {
    if (!data?.grouped?.blocked) return [];
    return groupAvailabilities(data.grouped.blocked);
  }, [data]);

  // Total raw count for the recurring header
  const recurringCount = data?.grouped?.recurring?.length || 0;

  const handleAddAvailability = async (formData: AvailabilityFormData) => {
    setIsSubmitting(true);

    try {
      const entries: Array<{
        availability_type: AvailabilityType;
        day_of_week?: number;
        specific_date?: string;
        start_time: string;
        end_time: string;
        visio_available: boolean;
        cabinet_available: boolean;
        consultation_type_id?: string;
        notes?: string;
      }> = [];

      // All types selected = single row with consultation_type_id = null
      const totalTypes =
        consultationTypesData?.consultationTypes?.length || 0;
      const isAllTypes =
        formData.consultation_type_ids.length === totalTypes &&
        totalTypes > 0;

      if (formData.availability_type === 'recurring') {
        for (const day of formData.days_of_week) {
          for (const slot of formData.time_slots) {
            if (isAllTypes || formData.consultation_type_ids.length === 0) {
              entries.push({
                availability_type: formData.availability_type,
                day_of_week: day,
                start_time: slot.start_time,
                end_time: slot.end_time,
                visio_available: formData.visio_available,
                cabinet_available: formData.cabinet_available,
                notes: formData.notes || undefined,
              });
            } else {
              for (const typeId of formData.consultation_type_ids) {
                entries.push({
                  availability_type: formData.availability_type,
                  day_of_week: day,
                  start_time: slot.start_time,
                  end_time: slot.end_time,
                  visio_available: formData.visio_available,
                  cabinet_available: formData.cabinet_available,
                  consultation_type_id: typeId,
                  notes: formData.notes || undefined,
                });
              }
            }
          }
        }
      } else {
        for (const slot of formData.time_slots) {
          if (
            formData.availability_type === 'blocked' ||
            isAllTypes ||
            formData.consultation_type_ids.length === 0
          ) {
            entries.push({
              availability_type: formData.availability_type,
              specific_date: formData.specific_date,
              start_time: slot.start_time,
              end_time: slot.end_time,
              visio_available: formData.visio_available,
              cabinet_available: formData.cabinet_available,
              notes: formData.notes || undefined,
            });
          } else {
            for (const typeId of formData.consultation_type_ids) {
              entries.push({
                availability_type: formData.availability_type,
                specific_date: formData.specific_date,
                start_time: slot.start_time,
                end_time: slot.end_time,
                visio_available: formData.visio_available,
                cabinet_available: formData.cabinet_available,
                consultation_type_id: typeId,
                notes: formData.notes || undefined,
              });
            }
          }
        }
      }

      await Promise.all(
        entries.map(entry => createMutation.mutateAsync(entry))
      );

      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating availabilities:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (
    group: GroupedAvailability,
    formData: EditFormData
  ) => {
    setIsUpdating(true);
    try {
      // Always delete all old rows in the group, then create new ones
      // This handles any combination of type changes cleanly
      await Promise.all(
        group.ids.map(id => deleteMutation.mutateAsync(id))
      );

      const baseData = {
        availability_type: group.availability_type,
        day_of_week: group.day_of_week ?? undefined,
        specific_date: group.specific_date ?? undefined,
        start_time: formData.start_time,
        end_time: formData.end_time,
        visio_available: formData.visio_available,
        cabinet_available: formData.cabinet_available,
        notes: formData.notes || undefined,
      };

      // All types selected = single row with consultation_type_id = null
      const totalTypes =
        consultationTypesData?.consultationTypes?.length || 0;
      const isAllTypes =
        formData.consultation_type_ids.length === totalTypes &&
        totalTypes > 0;

      if (isAllTypes || formData.consultation_type_ids.length === 0) {
        // "All types" = one row with consultation_type_id = null
        await createMutation.mutateAsync(baseData);
      } else {
        // One row per selected type
        await Promise.all(
          formData.consultation_type_ids.map(typeId =>
            createMutation.mutateAsync({
              ...baseData,
              consultation_type_id: typeId,
            })
          )
        );
      }

      setEditingGroup(null);
    } catch (err) {
      console.error('Error updating availability:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGroup) return;
    try {
      await Promise.all(
        deletingGroup.ids.map(id => deleteMutation.mutateAsync(id))
      );
      setDeletingGroup(null);
    } catch (err) {
      console.error('Error deleting availability:', err);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin text-[#1B998B] mx-auto mb-4' />
          <p className='text-gray-500'>Chargement des disponibilités...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-lg font-semibold text-red-800'>Erreur</h2>
          <p className='text-red-600 mt-2'>{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 px-8 py-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-800'>
              Mes disponibilités
            </h1>
            <p className='text-gray-500 mt-1'>
              Gérez vos plages horaires de travail
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors'
          >
            <Plus className='w-5 h-5' />
            Ajouter
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className='px-8 py-6 space-y-8'>
        {/* Recurring availabilities - Grouped by day */}
        <section>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <Clock className='w-5 h-5 text-green-600' />
            Disponibilités récurrentes
            {recurringCount > 0 && (
              <span className='text-sm font-normal text-gray-400'>
                ({recurringCount})
              </span>
            )}
          </h2>

          {recurringByDay.size === 0 ? (
            <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
              <Clock className='w-12 h-12 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500'>Aucune disponibilité récurrente</p>
              <p className='text-sm text-gray-400 mt-1'>
                Ajoutez des créneaux hebdomadaires pour recevoir des patients
              </p>
            </div>
          ) : (
            <div className='space-y-6'>
              {DAY_ORDER.map(day => {
                const items = recurringByDay.get(day);
                if (!items || items.length === 0) return null;

                return (
                  <div key={day}>
                    <h3 className='text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2'>
                      <span className='w-2 h-2 rounded-full bg-[#1B998B]' />
                      {getDayName(day)}
                      <span className='text-xs font-normal text-gray-400'>
                        ({items.length} créneau{items.length > 1 ? 'x' : ''})
                      </span>
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                      {items.map(g => (
                        <AvailabilityCard
                          key={g.key}
                          group={g}
                          typeNameMap={typeNameMap}
                          onEdit={setEditingGroup}
                          onDelete={setDeletingGroup}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Exceptions */}
        <section>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-blue-600' />
            Exceptions
            {groupedExceptions.length > 0 && (
              <span className='text-sm font-normal text-gray-400'>
                ({groupedExceptions.length})
              </span>
            )}
          </h2>
          {groupedExceptions.length === 0 ? (
            <div className='bg-white rounded-xl border border-gray-200 p-6 text-center'>
              <p className='text-gray-500'>Aucune exception</p>
              <p className='text-sm text-gray-400 mt-1'>
                Utilisez les exceptions pour des horaires spéciaux
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {groupedExceptions.map(g => (
                <NonRecurringCard
                  key={g.key}
                  group={g}
                  onDelete={setDeletingGroup}
                />
              ))}
            </div>
          )}
        </section>

        {/* Blocked dates */}
        <section>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <Ban className='w-5 h-5 text-red-600' />
            Dates bloquées
            {groupedBlocked.length > 0 && (
              <span className='text-sm font-normal text-gray-400'>
                ({groupedBlocked.length})
              </span>
            )}
          </h2>
          {groupedBlocked.length === 0 ? (
            <div className='bg-white rounded-xl border border-gray-200 p-6 text-center'>
              <p className='text-gray-500'>Aucune date bloquée</p>
              <p className='text-sm text-gray-400 mt-1'>
                Bloquez des dates pour congés ou indisponibilités
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {groupedBlocked.map(g => (
                <NonRecurringCard
                  key={g.key}
                  group={g}
                  onDelete={setDeletingGroup}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add Modal */}
      <AddAvailabilityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddAvailability}
        isSubmitting={isSubmitting}
      />

      {/* Edit Modal */}
      <EditAvailabilityModal
        isOpen={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        onSubmit={handleEdit}
        isSubmitting={isUpdating}
        group={editingGroup}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingGroup}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
        group={deletingGroup}
      />
    </div>
  );
}
