'use client';

import React from 'react';

// ==================== SUB-COMPONENTS ====================

export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className='text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2'>
        {title}
      </h3>
      <div className='space-y-1.5'>{children}</div>
    </div>
  );
}

export function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onChange}
      className='flex items-center gap-2.5 cursor-pointer group w-full text-left'
    >
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
          checked
            ? 'bg-[#1B998B] border-[#1B998B]'
            : 'border-gray-300 group-hover:border-gray-400'
        }`}
      >
        {checked && (
          <svg
            className='w-2.5 h-2.5 text-white'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={3}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M5 13l4 4L19 7'
            />
          </svg>
        )}
      </div>
      <span
        className={`text-sm ${checked ? 'text-gray-800 font-medium' : 'text-gray-600'}`}
      >
        {label}
      </span>
    </button>
  );
}

export function FilterRangeSlider({
  label,
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  step,
  unit,
}: {
  label: string;
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (minV: number, maxV: number) => void;
  step: number;
  unit: string;
}) {
  const isActive = valueMin > min || valueMax < max;
  const minPercent = ((valueMin - min) / (max - min)) * 100;
  const maxPercent = ((valueMax - min) / (max - min)) * 100;

  return (
    <div>
      <div className='flex items-center justify-between mb-2'>
        <span className='text-xs text-gray-600'>{label}</span>
        <span
          className={`text-xs font-medium ${isActive ? 'text-gray-800' : 'text-gray-400'}`}
        >
          {isActive ? `${valueMin}–${valueMax} ${unit}` : 'Tous'}
        </span>
      </div>
      <div className='relative h-5'>
        <div className='absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-200 rounded-full' />
        <div
          className='absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#1B998B] rounded-full'
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={e => {
            const v = parseInt(e.target.value);
            onChange(Math.min(v, valueMax - step), valueMax);
          }}
          className='absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1B998B] [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_white,0_2px_6px_rgba(0,0,0,0.2)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1B998B] [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.2)] [&::-moz-range-thumb]:cursor-pointer'
          style={{ zIndex: valueMin > max - step * 2 ? 5 : 3 }}
        />
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={e => {
            const v = parseInt(e.target.value);
            onChange(valueMin, Math.max(v, valueMin + step));
          }}
          className='absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1B998B] [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_white,0_2px_6px_rgba(0,0,0,0.2)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1B998B] [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.2)] [&::-moz-range-thumb]:cursor-pointer'
          style={{ zIndex: 4 }}
        />
      </div>
      <div className='flex justify-between mt-0.5'>
        <span className='text-[9px] text-gray-400'>{min}</span>
        <span className='text-[9px] text-gray-400'>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}
