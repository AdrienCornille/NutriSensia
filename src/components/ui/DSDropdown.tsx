'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface DSDropdownOption {
  value: string;
  label: string;
}

interface DSDropdownProps {
  value: string;
  options: DSDropdownOption[];
  onChange: (newValue: string) => void;
  disabled?: boolean;
  inputStyle: React.CSSProperties;
  triggerRef?: (el: HTMLButtonElement | null) => void;
  placeholder?: string;
  onTriggerKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  wrapperStyle?: React.CSSProperties;
  ariaLabel?: string;
}

export function DSDropdown({
  value,
  options,
  onChange,
  disabled = false,
  inputStyle,
  triggerRef,
  placeholder,
  onTriggerKeyDown,
  wrapperStyle,
  ariaLabel,
}: DSDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [triggerRect, setTriggerRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listboxRef = useRef<HTMLUListElement | null>(null);

  function setButtonRef(el: HTMLButtonElement | null) {
    buttonRef.current = el;
    triggerRef?.(el);
  }

  const selectedOption = options.find(o => o.value === value);
  const displayLabel = selectedOption?.label ?? placeholder ?? '— Choisir —';

  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      return;
    }
    const idx = options.findIndex(o => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [open, value, options]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = wrapperRef.current?.contains(target);
      const insideListbox = listboxRef.current?.contains(target);
      if (!insideTrigger && !insideListbox) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Track the trigger's viewport rect so the portalled listbox can
  // position itself with `position: fixed` (escapes any overflow:auto
  // ancestor like .fp-modal-body that would otherwise clip the panel).
  useLayoutEffect(() => {
    if (!open) {
      setTriggerRect(null);
      return;
    }
    function updateRect() {
      if (!buttonRef.current) return;
      const r = buttonRef.current.getBoundingClientRect();
      setTriggerRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    }
    updateRect();
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [open]);

  function commitSelection(idx: number) {
    if (idx < 0 || idx >= options.length) return;
    onChange(options[idx].value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        commitSelection(activeIndex);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setActiveIndex(i => Math.min(i + 1, options.length - 1));
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setActiveIndex(i => Math.max(i - 1, 0));
      }
      return;
    }
    if (e.key === 'Home' && open) {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (e.key === 'End' && open) {
      e.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }
    onTriggerKeyDown?.(e);
  }

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', marginTop: 4, ...wrapperStyle }}
    >
      <button
        type='button'
        ref={setButtonRef}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-label={ariaLabel}
        style={{
          ...inputStyle,
          marginTop: 0,
          cursor: disabled ? 'wait' : 'pointer',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontStyle: selectedOption ? 'normal' : 'italic',
          fontWeight: selectedOption
            ? ((inputStyle.fontWeight as number | string | undefined) ?? 600)
            : 500,
          color: selectedOption ? 'var(--ns-ink)' : 'var(--ns-ink-3)',
          borderColor: open
            ? 'var(--ns-ink)'
            : ((inputStyle.borderColor as string | undefined) ??
              'var(--ns-ink-4)'),
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className='w-3.5 h-3.5'
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            color: 'var(--ns-ink-3)',
          }}
          aria-hidden='true'
        />
      </button>
      {open &&
        triggerRect &&
        typeof document !== 'undefined' &&
        createPortal(
          <ul
            ref={listboxRef}
            role='listbox'
            style={{
              position: 'fixed',
              top: triggerRect.top + triggerRect.height + 4,
              left: triggerRect.left,
              width: triggerRect.width,
              margin: 0,
              padding: 4,
              listStyle: 'none',
              background: 'var(--ns-cream-50)',
              border: '1.5px solid var(--ns-ink)',
              borderRadius: 10,
              boxShadow: '3px 3px 0 var(--ns-ink)',
              zIndex: 1000,
              maxHeight: 260,
              overflowY: 'auto',
            }}
          >
            {options.length === 0 ? (
              <li
                style={{
                  padding: '8px 12px',
                  fontFamily: 'var(--ns-font-serif)',
                  fontStyle: 'italic',
                  fontSize: 13,
                  color: 'var(--ns-ink-3)',
                }}
              >
                Aucune option disponible.
              </li>
            ) : (
              options.map((opt, i) => {
                const isSelected = opt.value === value;
                const isActive = i === activeIndex;
                return (
                  <li
                    key={opt.value || `__empty_${i}`}
                    role='option'
                    aria-selected={isSelected}
                    onMouseDown={e => {
                      e.preventDefault();
                    }}
                    onClick={() => commitSelection(i)}
                    onMouseEnter={() => setActiveIndex(i)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontFamily: 'var(--ns-font-sans)',
                      fontSize: 14,
                      fontWeight: isSelected ? 700 : 600,
                      color: 'var(--ns-ink)',
                      background: isActive
                        ? 'var(--ns-peps-soft)'
                        : isSelected
                          ? 'var(--ns-cream-200)'
                          : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      transition: '80ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check
                        className='w-3.5 h-3.5'
                        strokeWidth={3}
                        style={{
                          color: 'var(--ns-peps-deep)',
                          flexShrink: 0,
                        }}
                        aria-hidden='true'
                      />
                    )}
                  </li>
                );
              })
            )}
          </ul>,
          document.body
        )}
    </div>
  );
}
