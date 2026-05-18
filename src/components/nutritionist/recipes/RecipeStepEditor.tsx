'use client';

import React, { useCallback } from 'react';
import { Plus, Trash2, GripVertical, Clock } from 'lucide-react';
import { RecipeStepItem } from '@/lib/api-schemas';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StepFormItem extends Omit<RecipeStepItem, 'step_number'> {
  _tempId: string;
}

interface RecipeStepEditorProps {
  steps: StepFormItem[];
  onChange: (steps: StepFormItem[]) => void;
}

function createEmptyStep(): StepFormItem {
  return {
    _tempId: `step-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    instruction: '',
    duration_minutes: null,
    image_url: null,
    tips: null,
  };
}

function SortableStepRow({
  step,
  index,
  onChangeField,
  onRemove,
}: {
  step: StepFormItem;
  index: number;
  onChangeField: (
    index: number,
    field: keyof StepFormItem,
    value: unknown
  ) => void;
  onRemove: (index: number) => void;
}) {
  const sortableId = step._tempId || step.id || `step-${index}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group'
    >
      {/* Step number + drag handle */}
      <div className='flex flex-col items-center gap-1 pt-1'>
        <span className='w-7 h-7 rounded-full bg-[#1B998B] text-white text-xs font-bold flex items-center justify-center'>
          {index + 1}
        </span>
        <div
          {...attributes}
          {...listeners}
          className='cursor-grab active:cursor-grabbing p-0.5 text-gray-400 hover:text-gray-600'
          title='Glisser pour réordonner'
        >
          <GripVertical className='w-3.5 h-3.5' />
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 space-y-2'>
        <textarea
          value={step.instruction}
          onChange={e => onChangeField(index, 'instruction', e.target.value)}
          placeholder={`Décrivez l'étape ${index + 1}...`}
          rows={2}
          className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B998B] resize-none'
        />
        <div className='flex items-center gap-3'>
          {/* Duration */}
          <div className='flex items-center gap-1.5'>
            <Clock className='w-3.5 h-3.5 text-gray-400' />
            <input
              type='number'
              value={step.duration_minutes || ''}
              onChange={e =>
                onChangeField(
                  index,
                  'duration_minutes',
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              placeholder='min'
              min={0}
              className='w-16 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1B998B]'
            />
            <span className='text-xs text-gray-400'>min</span>
          </div>
          {/* Tips */}
          <input
            type='text'
            value={step.tips || ''}
            onChange={e => onChangeField(index, 'tips', e.target.value || null)}
            placeholder='Astuce (optionnel)'
            className='flex-1 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1B998B]'
          />
        </div>
      </div>

      {/* Delete */}
      <button
        type='button'
        onClick={() => onRemove(index)}
        className='p-1 h-fit text-gray-400 hover:text-red-500 transition-colors'
      >
        <Trash2 className='w-4 h-4' />
      </button>
    </div>
  );
}

export function RecipeStepEditor({ steps, onChange }: RecipeStepEditorProps) {
  const handleAdd = useCallback(() => {
    onChange([...steps, createEmptyStep()]);
  }, [steps, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(steps.filter((_, i) => i !== index));
    },
    [steps, onChange]
  );

  const handleChange = useCallback(
    (index: number, field: keyof StepFormItem, value: unknown) => {
      const updated = steps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      );
      onChange(updated);
    },
    [steps, onChange]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = steps.findIndex(
          s => (s._tempId || s.id) === active.id
        );
        const newIndex = steps.findIndex(s => (s._tempId || s.id) === over.id);
        onChange(arrayMove(steps, oldIndex, newIndex));
      }
    },
    [steps, onChange]
  );

  const stepIds = steps.map(s => s._tempId || s.id || '');

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-gray-700'>
          Étapes de préparation
        </h3>
        <button
          type='button'
          onClick={handleAdd}
          className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1B998B] bg-[#1B998B]/10 rounded-lg hover:bg-[#1B998B]/20 transition-colors'
        >
          <Plus className='w-3.5 h-3.5' />
          Ajouter une étape
        </button>
      </div>

      {steps.length === 0 ? (
        <div className='text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl'>
          Aucune étape. Cliquez sur &quot;Ajouter une étape&quot; pour
          commencer.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stepIds}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-3'>
              {steps.map((step, index) => (
                <SortableStepRow
                  key={step._tempId || step.id || index}
                  step={step}
                  index={index}
                  onChangeField={handleChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export type { StepFormItem };
