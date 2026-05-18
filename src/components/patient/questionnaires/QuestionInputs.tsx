'use client';

/**
 * 8 question input components for the patient response form (P2.C.2).
 * Each component is a controlled input that takes the current answer and
 * fires `onChange` with a partial SaveAnswerPayload representing only the
 * fields it owns (e.g. ScaleInput only sets value_numeric).
 *
 * The Bristol scale labels are intentionally text-only in P2.C.2 — illustrations
 * can be added later without changing the component contract.
 */

import React from 'react';
import { Check } from 'lucide-react';
import type {
  PatientQuestion,
  PatientAnswer,
  SaveAnswerPayload,
} from '@/types/patient-questionnaires';

export interface QuestionInputProps {
  question: PatientQuestion;
  answer: PatientAnswer | undefined;
  onChange: (payload: SaveAnswerPayload) => void;
  disabled?: boolean;
  id?: string;
}

export function QuestionInput(props: QuestionInputProps) {
  switch (props.question.type) {
    case 'free_text':
      return <FreeTextInput {...props} />;
    case 'number':
      return <NumberInput {...props} />;
    case 'time':
      return <TimeInput {...props} />;
    case 'single_choice':
      return <SingleChoiceInput {...props} />;
    case 'multi_choice':
      return <MultiChoiceInput {...props} />;
    case 'scale':
      return <ScaleInput {...props} />;
    case 'percent':
      return <PercentSliderInput {...props} />;
    case 'bristol':
      return <BristolScaleInput {...props} />;
  }
}

// ── Free text ────────────────────────────────────────────────────────────

function FreeTextInput({
  question,
  answer,
  onChange,
  disabled,
  id,
}: QuestionInputProps) {
  return (
    <textarea
      id={id}
      value={answer?.value_text ?? ''}
      onChange={e => onChange({ value_text: e.target.value || null })}
      disabled={disabled}
      placeholder='Votre réponse…'
      rows={3}
      className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500'
      aria-required={question.is_required}
    />
  );
}

// ── Number ───────────────────────────────────────────────────────────────

function NumberInput({
  question,
  answer,
  onChange,
  disabled,
  id,
}: QuestionInputProps) {
  return (
    <input
      id={id}
      type='number'
      value={answer?.value_numeric ?? ''}
      min={question.number_min ?? undefined}
      max={question.number_max ?? undefined}
      step='any'
      onChange={e => {
        const v = e.target.value;
        onChange({ value_numeric: v === '' ? null : Number(v) });
      }}
      disabled={disabled}
      placeholder='—'
      className='w-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500'
      aria-required={question.is_required}
    />
  );
}

// ── Time ─────────────────────────────────────────────────────────────────

function TimeInput({
  answer,
  onChange,
  disabled,
  id,
  question,
}: QuestionInputProps) {
  return (
    <input
      id={id}
      type='time'
      value={answer?.value_time?.slice(0, 5) ?? ''}
      onChange={e => onChange({ value_time: e.target.value || null })}
      disabled={disabled}
      className='px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
      aria-required={question.is_required}
    />
  );
}

// ── Single choice ────────────────────────────────────────────────────────

function SingleChoiceInput({
  question,
  answer,
  onChange,
  disabled,
}: QuestionInputProps) {
  const selectedId = answer?.value_option_id ?? null;
  return (
    <div className='space-y-2'>
      {question.options.map(opt => {
        const isSelected = opt.id === selectedId;
        return (
          <button
            key={opt.id}
            type='button'
            disabled={disabled}
            onClick={() => onChange({ value_option_id: opt.id })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
              isSelected
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/30'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-pressed={isSelected}
          >
            <span
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-600'
                  : 'border-gray-300 bg-white'
              }`}
              aria-hidden='true'
            >
              {isSelected && <span className='w-2 h-2 rounded-full bg-white' />}
            </span>
            <span className='flex-1'>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Multi choice (with is_exclusive handling) ────────────────────────────

function MultiChoiceInput({
  question,
  answer,
  onChange,
  disabled,
}: QuestionInputProps) {
  const selectedIds = new Set(answer?.selected_option_ids ?? []);

  function toggle(optionId: string) {
    const opt = question.options.find(o => o.id === optionId);
    if (!opt) return;
    let next: string[];
    if (selectedIds.has(optionId)) {
      // Deselecting — just remove.
      next = (answer?.selected_option_ids ?? []).filter(id => id !== optionId);
    } else if (opt.is_exclusive) {
      // Selecting an exclusive option — clear all others.
      next = [optionId];
    } else {
      // Selecting a regular option — keep selection but drop any exclusive one.
      const exclusiveIds = new Set(
        question.options.filter(o => o.is_exclusive).map(o => o.id)
      );
      const without = (answer?.selected_option_ids ?? []).filter(
        id => !exclusiveIds.has(id)
      );
      next = [...without, optionId];
    }
    onChange({ selected_option_ids: next });
  }

  return (
    <div className='space-y-2'>
      {question.options.map(opt => {
        const isSelected = selectedIds.has(opt.id);
        return (
          <button
            key={opt.id}
            type='button'
            disabled={disabled}
            onClick={() => toggle(opt.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
              isSelected
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/30'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-pressed={isSelected}
          >
            <span
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-600'
                  : 'border-gray-300 bg-white'
              }`}
              aria-hidden='true'
            >
              {isSelected && (
                <Check className='w-3.5 h-3.5 text-white' strokeWidth={3} />
              )}
            </span>
            <span className='flex-1'>{opt.label}</span>
            {opt.is_exclusive && (
              <span className='text-xs text-gray-400 italic'>exclusif</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Scale (with anchors) ─────────────────────────────────────────────────

function ScaleInput({
  question,
  answer,
  onChange,
  disabled,
}: QuestionInputProps) {
  const min = question.scale_min ?? 0;
  const max = question.scale_max ?? 10;
  const values: number[] = [];
  for (let v = min; v <= max; v++) values.push(v);
  const current = answer?.value_numeric;

  return (
    <div>
      <div className='flex items-center gap-1 flex-wrap'>
        {values.map(v => {
          const isSelected = current === v;
          return (
            <button
              key={v}
              type='button'
              disabled={disabled}
              onClick={() => onChange({ value_numeric: v })}
              className={`w-11 h-11 rounded-lg border-2 font-semibold transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-600 text-white scale-105'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              aria-pressed={isSelected}
              aria-label={`${v} sur ${max}`}
            >
              {v}
            </button>
          );
        })}
      </div>
      {(question.scale_min_label || question.scale_max_label) && (
        <div className='flex justify-between mt-2 text-xs text-gray-500 italic'>
          <span>{question.scale_min_label || `${min}`}</span>
          <span>{question.scale_max_label || `${max}`}</span>
        </div>
      )}
    </div>
  );
}

// ── Percent slider (0-100, step 10) ──────────────────────────────────────

function PercentSliderInput({
  answer,
  onChange,
  disabled,
}: QuestionInputProps) {
  const current = answer?.value_numeric ?? 0;
  return (
    <div>
      <div className='flex items-center gap-4'>
        <input
          type='range'
          min={0}
          max={100}
          step={10}
          value={current}
          onChange={e => onChange({ value_numeric: Number(e.target.value) })}
          disabled={disabled}
          className='flex-1 accent-emerald-600 disabled:opacity-60'
        />
        <div className='w-16 text-right'>
          <span className='text-xl font-semibold text-emerald-700'>
            {current}
          </span>
          <span className='text-sm text-gray-500 ml-0.5'>%</span>
        </div>
      </div>
      <div className='flex justify-between text-xs text-gray-400 mt-1 px-1'>
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ── Bristol scale (1-7 with descriptive text) ───────────────────────────

const BRISTOL_TYPES: { value: number; label: string; hint: string }[] = [
  { value: 1, label: 'Type 1', hint: 'Boulettes dures, séparées' },
  { value: 2, label: 'Type 2', hint: 'En forme de saucisse, grumeleuse' },
  { value: 3, label: 'Type 3', hint: 'En forme de saucisse, avec craquelures' },
  { value: 4, label: 'Type 4', hint: 'En forme de saucisse, lisse' },
  { value: 5, label: 'Type 5', hint: 'Morceaux mous, à bords nets' },
  { value: 6, label: 'Type 6', hint: 'Morceaux flous, à bords déchirés' },
  { value: 7, label: 'Type 7', hint: 'Entièrement liquide' },
];

function BristolScaleInput({ answer, onChange, disabled }: QuestionInputProps) {
  const current = answer?.value_numeric;
  return (
    <div className='space-y-2'>
      {BRISTOL_TYPES.map(item => {
        const isSelected = current === item.value;
        return (
          <button
            key={item.value}
            type='button'
            disabled={disabled}
            onClick={() => onChange({ value_numeric: item.value })}
            className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
              isSelected
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/30'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-pressed={isSelected}
          >
            <span
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600'
              }`}
              aria-hidden='true'
            >
              {item.value}
            </span>
            <div className='flex-1'>
              <div className='font-semibold'>{item.label}</div>
              <div
                className={`text-sm ${isSelected ? 'text-emerald-700' : 'text-gray-500'}`}
              >
                {item.hint}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
