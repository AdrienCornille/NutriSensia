'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  /** Optional: 'action' renders the option with primary color and a top separator */
  variant?: 'action';
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  /** If true, the placeholder acts as a "reset/all" option */
  allowReset?: boolean;
}

export function CustomDropdown({
  value,
  options,
  placeholder = 'Sélectionnez...',
  onChange,
  className = '',
  allowReset = true,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel =
    options.find(o => o.value === value)?.label || placeholder;

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border rounded-lg text-sm transition-colors ${
          open
            ? 'border-[#1B998B] ring-2 ring-[#1B998B]/20'
            : 'border-gray-200 hover:border-gray-300'
        } ${value ? 'text-gray-900' : 'text-gray-500'}`}
      >
        <span className='truncate text-left'>{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className='absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto'>
          {allowReset && (
            <button
              type='button'
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                !value
                  ? 'bg-[#1B998B]/5 text-[#1B998B] font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{placeholder}</span>
              {!value && <Check className='w-4 h-4 text-[#1B998B]' />}
            </button>
          )}

          {options.map(option => (
            <button
              key={option.value}
              type='button'
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                option.variant === 'action'
                  ? 'text-[#1B998B] font-medium hover:bg-[#1B998B]/5 border-t border-gray-100 mt-1 pt-2.5'
                  : value === option.value
                    ? 'bg-[#1B998B]/5 text-[#1B998B] font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{option.label}</span>
              {option.variant !== 'action' && value === option.value && (
                <Check className='w-4 h-4 text-[#1B998B]' />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
