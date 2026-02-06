'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Clock,
  Banknote,
  Video,
  Building2,
  Pencil,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  FileType,
  X,
  GripVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useNutritionistConsultationTypes,
  useCreateConsultationType,
  useUpdateConsultationType,
  useDeleteConsultationType,
  useReorderConsultationTypes,
  type NutritionistConsultationType,
} from '@/hooks/useNutritionistConsultationTypes';
import type { CreateConsultationTypeData } from '@/lib/api-schemas';

// ============================================================================
// TYPES
// ============================================================================

interface ConsultationTypeFormData {
  code: string;
  name_fr: string;
  description_fr: string;
  default_duration: number;
  default_price: number;
  visio_available: boolean;
  cabinet_available: boolean;
}

const initialFormData: ConsultationTypeFormData = {
  code: '',
  name_fr: '',
  description_fr: '',
  default_duration: 60,
  default_price: 100,
  visio_available: true,
  cabinet_available: true,
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Card affichant un type de consultation (version sortable)
 */
function SortableConsultationTypeCard({
  type,
  onEdit,
  onDelete,
  isDeleting,
}: {
  type: NutritionistConsultationType;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: type.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border p-5 transition-colors ${
        isDragging
          ? 'border-[#1B998B] shadow-lg'
          : 'border-gray-200 hover:border-[#1B998B]/30'
      }`}
    >
      <div className='flex items-start gap-3'>
        {/* Handle de drag */}
        <button
          {...attributes}
          {...listeners}
          className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing transition-colors mt-0.5'
          title='Glisser pour réordonner'
        >
          <GripVertical className='w-4 h-4' />
        </button>

        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <h3 className='font-semibold text-gray-800'>{type.name_fr}</h3>
            <span className='text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded'>
              {type.code}
            </span>
          </div>

          {type.description_fr && (
            <p className='text-sm text-gray-500 mt-2 line-clamp-2'>
              {type.description_fr}
            </p>
          )}

          <div className='flex items-center gap-4 mt-3'>
            <div className='flex items-center gap-1.5 text-sm text-gray-600'>
              <Clock className='w-4 h-4 text-[#1B998B]' />
              <span>{type.default_duration} min</span>
            </div>
            <div className='flex items-center gap-1.5 text-sm text-gray-600'>
              <Banknote className='w-4 h-4 text-[#1B998B]' />
              <span>{type.default_price} CHF</span>
            </div>
          </div>

          <div className='flex items-center gap-3 mt-3'>
            {type.visio_available && (
              <div className='flex items-center gap-1 text-xs text-gray-500'>
                <Video className='w-3.5 h-3.5' />
                <span>Visio</span>
              </div>
            )}
            {type.cabinet_available && (
              <div className='flex items-center gap-1 text-xs text-gray-500'>
                <Building2 className='w-3.5 h-3.5' />
                <span>Cabinet</span>
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={onEdit}
            className='p-2 text-gray-400 hover:text-[#1B998B] hover:bg-[#1B998B]/10 rounded-lg transition-colors'
            title='Modifier'
          >
            <Pencil className='w-4 h-4' />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50'
            title='Supprimer'
          >
            {isDeleting ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Trash2 className='w-4 h-4' />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal d'ajout/modification d'un type de consultation
 */
function ConsultationTypeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingType,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConsultationTypeFormData) => void;
  isSubmitting: boolean;
  editingType: NutritionistConsultationType | null;
}) {
  const [formData, setFormData] = useState<ConsultationTypeFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);

  // Synchroniser formData avec editingType quand celui-ci change
  useEffect(() => {
    if (editingType) {
      setFormData({
        code: editingType.code,
        name_fr: editingType.name_fr,
        description_fr: editingType.description_fr || '',
        default_duration: editingType.default_duration,
        default_price: editingType.default_price,
        visio_available: editingType.visio_available,
        cabinet_available: editingType.cabinet_available,
      });
    } else {
      setFormData(initialFormData);
    }
    setError(null);
  }, [editingType]);

  const handleClose = () => {
    setFormData(initialFormData);
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.code.trim()) {
      setError('Le code est requis');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(formData.code)) {
      setError(
        'Le code doit contenir uniquement des lettres minuscules, chiffres et _'
      );
      return;
    }

    if (!formData.name_fr.trim()) {
      setError('Le nom est requis');
      return;
    }

    if (formData.default_duration < 15 || formData.default_duration > 180) {
      setError('La durée doit être entre 15 et 180 minutes');
      return;
    }

    if (formData.default_price < 0 || formData.default_price > 1000) {
      setError('Le prix doit être entre 0 et 1000 CHF');
      return;
    }

    if (!formData.visio_available && !formData.cabinet_available) {
      setError('Au moins un mode de consultation doit être sélectionné');
      return;
    }

    onSubmit(formData);
  };

  // Générer automatiquement le code à partir du nom
  const generateCodeFromName = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]+/g, '_') // Remplacer les caractères spéciaux par _
      .replace(/^_+|_+$/g, '') // Supprimer les _ au début et à la fin
      .substring(0, 50);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name_fr: name,
      // Auto-générer le code uniquement si on crée (pas d'édition) et si le code n'a pas été modifié manuellement
      code:
        !editingType && prev.code === generateCodeFromName(prev.name_fr)
          ? generateCodeFromName(name)
          : prev.code,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800'>
            {editingType
              ? 'Modifier le type de consultation'
              : 'Nouveau type de consultation'}
          </h2>
          <p className='text-sm text-gray-500 mt-1'>
            Définissez les détails de votre prestation
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-5'>
          {/* Error */}
          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2'>
              <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          {/* Nom */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Nom de la consultation *
            </label>
            <input
              type='text'
              value={formData.name_fr}
              onChange={e => handleNameChange(e.target.value)}
              placeholder='Ex: Consultation de découverte'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
              required
            />
          </div>

          {/* Code */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Code (identifiant unique) *
            </label>
            <input
              type='text'
              value={formData.code}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  code: e.target.value.toLowerCase(),
                }))
              }
              placeholder='Ex: decouverte'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] font-mono text-sm'
              required
              disabled={!!editingType} // Désactiver la modification du code en édition
            />
            <p className='text-xs text-gray-400 mt-1'>
              Lettres minuscules, chiffres et _ uniquement
            </p>
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Description
            </label>
            <textarea
              value={formData.description_fr}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  description_fr: e.target.value,
                }))
              }
              placeholder='Décrivez cette consultation...'
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] resize-none'
            />
          </div>

          {/* Durée et Prix */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Durée (minutes) *
              </label>
              <input
                type='number'
                value={formData.default_duration}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    default_duration: parseInt(e.target.value) || 0,
                  }))
                }
                min={15}
                max={180}
                step={5}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Prix (CHF) *
              </label>
              <input
                type='number'
                value={formData.default_price}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    default_price: parseFloat(e.target.value) || 0,
                  }))
                }
                min={0}
                max={1000}
                step={5}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                required
              />
            </div>
          </div>

          {/* Modes de consultation */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Modes de consultation disponibles *
            </label>
            <div className='flex flex-wrap gap-3'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={formData.visio_available}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      visio_available: e.target.checked,
                    }))
                  }
                  className='rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
                />
                <Video className='w-4 h-4 text-gray-500' />
                <span className='text-sm text-gray-700'>Visioconférence</span>
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={formData.cabinet_available}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      cabinet_available: e.target.checked,
                    }))
                  }
                  className='rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
                />
                <Building2 className='w-4 h-4 text-gray-500' />
                <span className='text-sm text-gray-700'>En cabinet</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={handleClose}
              className='flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Annuler
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex-1 px-4 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  <span>En cours...</span>
                </>
              ) : (
                <span>{editingType ? 'Enregistrer' : 'Créer'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * État vide
 */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
      <div className='w-16 h-16 bg-[#1B998B]/10 rounded-full flex items-center justify-center mx-auto mb-4'>
        <FileType className='w-8 h-8 text-[#1B998B]' />
      </div>
      <h3 className='text-lg font-semibold text-gray-800 mb-2'>
        Aucun type de consultation
      </h3>
      <p className='text-gray-500 mb-6 max-w-sm mx-auto'>
        Créez vos types de consultation pour définir vos prestations et tarifs.
      </p>
      <button
        onClick={onAdd}
        className='inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors'
      >
        <Plus className='w-4 h-4' />
        <span>Créer mon premier type</span>
      </button>
    </div>
  );
}

/**
 * Modal de confirmation de suppression
 */
function DeleteConfirmModal({
  isOpen,
  consultationType,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  isOpen: boolean;
  consultationType: NutritionistConsultationType | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && consultationType && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute inset-0 bg-black/50'
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden'
          >
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                  <AlertTriangle className='w-5 h-5 text-red-600' />
                </div>
                <h2 className='text-lg font-semibold text-gray-800'>
                  Supprimer le type de consultation
                </h2>
              </div>
              <button
                onClick={onCancel}
                className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Content */}
            <div className='px-6 py-5'>
              <p className='text-gray-600'>
                Êtes-vous sûr de vouloir supprimer{' '}
                <span className='font-medium text-gray-800'>
                  {consultationType.name_fr}
                </span>{' '}
                ?
              </p>
              <p className='text-sm text-gray-500 mt-2'>
                Cette action est irréversible. Ce type de consultation ne sera
                plus disponible pour vos patients.
              </p>
            </div>

            {/* Footer */}
            <div className='flex gap-3 px-6 py-4 bg-gray-50'>
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className='flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50'
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className='flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {isDeleting ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Supprimer</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TypesConsultationPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] =
    useState<NutritionistConsultationType | null>(null);
  const [typeToDelete, setTypeToDelete] =
    useState<NutritionistConsultationType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [orderedTypes, setOrderedTypes] = useState<NutritionistConsultationType[]>([]);

  // Queries & Mutations
  const { data, isLoading, error } = useNutritionistConsultationTypes();
  const createMutation = useCreateConsultationType();
  const updateMutation = useUpdateConsultationType();
  const deleteMutation = useDeleteConsultationType();
  const reorderMutation = useReorderConsultationTypes();

  // Synchroniser l'ordre local avec les données du serveur
  useEffect(() => {
    if (data?.consultationTypes) {
      setOrderedTypes(data.consultationTypes);
    }
  }, [data?.consultationTypes]);

  // Sensors pour le drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Gestion du drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Mise à jour optimiste de l'UI
      const newOrderedTypes = [...orderedTypes];
      const oldIndex = newOrderedTypes.findIndex((item) => item.id === active.id);
      const newIndex = newOrderedTypes.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(newOrderedTypes, oldIndex, newIndex);

      setOrderedTypes(reordered);

      // Persister l'ordre dans la base de données
      const orderedIds = reordered.map((item) => item.id);
      reorderMutation.mutate(orderedIds);
    }
  };

  const handleCreate = async (formData: ConsultationTypeFormData) => {
    try {
      const createData: CreateConsultationTypeData = {
        code: formData.code,
        name_fr: formData.name_fr,
        description_fr: formData.description_fr || undefined,
        default_duration: formData.default_duration,
        default_price: formData.default_price,
        visio_available: formData.visio_available,
        cabinet_available: formData.cabinet_available,
      };

      await createMutation.mutateAsync(createData);
      setShowModal(false);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleUpdate = async (formData: ConsultationTypeFormData) => {
    if (!editingType) return;

    try {
      await updateMutation.mutateAsync({
        id: editingType.id,
        data: {
          name_fr: formData.name_fr,
          description_fr: formData.description_fr || undefined,
          default_duration: formData.default_duration,
          default_price: formData.default_price,
          visio_available: formData.visio_available,
          cabinet_available: formData.cabinet_available,
        },
      });
      setEditingType(null);
      setShowModal(false);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleDeleteClick = (type: NutritionistConsultationType) => {
    setTypeToDelete(type);
  };

  const handleCancelDelete = () => {
    setTypeToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!typeToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(typeToDelete.id);
      setTypeToDelete(null);
    } catch {
      // Error is handled by the mutation
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (type: NutritionistConsultationType) => {
    setEditingType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingType(null);
  };

  const handleSubmit = (formData: ConsultationTypeFormData) => {
    if (editingType) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <header className='bg-white border-b border-gray-200 px-8 py-6'>
          <h1 className='text-2xl font-semibold text-gray-800'>
            Types de consultation
          </h1>
        </header>
        <main className='px-8 py-6'>
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-8 h-8 animate-spin text-[#1B998B]' />
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <header className='bg-white border-b border-gray-200 px-8 py-6'>
          <h1 className='text-2xl font-semibold text-gray-800'>
            Types de consultation
          </h1>
        </header>
        <main className='px-8 py-6'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
            <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
            <div>
              <p className='text-red-800 font-medium'>Erreur</p>
              <p className='text-red-600 text-sm'>{error.message}</p>
            </div>
          </div>
        </main>
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
              Types de consultation
            </h1>
            <p className='text-gray-500 mt-1'>
              Gérez vos prestations et tarifs
            </p>
          </div>
          <button
            onClick={() => {
              setEditingType(null);
              setShowModal(true);
            }}
            className='flex items-center gap-2 px-4 py-2.5 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors'
          >
            <Plus className='w-4 h-4' />
            <span>Ajouter un type</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className='px-8 py-6'>
        {orderedTypes.length === 0 ? (
          <EmptyState
            onAdd={() => {
              setEditingType(null);
              setShowModal(true);
            }}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedTypes.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-4'>
                {orderedTypes.map(type => (
                  <SortableConsultationTypeCard
                    key={type.id}
                    type={type}
                    onEdit={() => handleEdit(type)}
                    onDelete={() => handleDeleteClick(type)}
                    isDeleting={typeToDelete?.id === type.id && isDeleting}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* Modal d'édition/création */}
      <ConsultationTypeModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        editingType={editingType}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={typeToDelete !== null}
        consultationType={typeToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
