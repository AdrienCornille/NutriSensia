'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, HelpCircle, Loader2, X } from 'lucide-react';

export type ConfirmTone = 'danger' | 'default';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  /** Message body. Can be a string or a React node for richer content. */
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` paints the confirm button coral (destructive actions like
   *  delete). `default` uses the dark variant (standard confirmations). */
  tone?: ConfirmTone;
  /** Shows a spinner inside the confirm button and disables both actions. */
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * DS v2 confirmation modal. Replaces native `window.confirm()` for
 * destructive or important user-driven actions. ESC + overlay click both
 * trigger `onCancel`.
 */
export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  tone = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isLoading) onCancel();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const chipBg = tone === 'danger' ? 'var(--ns-coral)' : 'var(--ns-cream-200)';
  const chipColor = tone === 'danger' ? 'var(--ns-cream-50)' : 'var(--ns-ink)';
  const confirmBtnClass =
    tone === 'danger' ? 'fp-btn fp-btn-coral' : 'fp-btn fp-btn-dark';

  return (
    <div
      className='fp-modal is-open'
      onClick={() => {
        if (!isLoading) onCancel();
      }}
      role='dialog'
      aria-modal='true'
      aria-labelledby='confirm-modal-title'
    >
      <div
        className='fp-modal-card'
        onClick={e => e.stopPropagation()}
        style={{ width: 'min(480px, 100%)' }}
      >
        <div className='fp-modal-head'>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span
              aria-hidden='true'
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: 12,
                background: chipBg,
                color: chipColor,
                border: '1.5px solid var(--ns-ink)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tone === 'danger' ? (
                <AlertTriangle className='w-4 h-4' strokeWidth={2.5} />
              ) : (
                <HelpCircle className='w-4 h-4' strokeWidth={2.5} />
              )}
            </span>
            <div>
              <h3 className='fp-modal-title' id='confirm-modal-title'>
                {title}
              </h3>
              {message && (
                <p
                  className='fp-modal-sub'
                  style={{ fontStyle: 'normal', marginTop: 6 }}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
          <button
            type='button'
            className='fp-modal-close'
            onClick={onCancel}
            disabled={isLoading}
            aria-label='Fermer'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        </div>

        <div className='fp-modal-foot'>
          <span style={{ flex: 1 }} />
          <div className='fp-modal-foot-actions'>
            <button
              type='button'
              className='fp-btn'
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </button>
            <button
              type='button'
              className={confirmBtnClass}
              onClick={onConfirm}
              disabled={isLoading}
              autoFocus
            >
              {isLoading && (
                <Loader2
                  className='w-3.5 h-3.5 animate-spin'
                  aria-hidden='true'
                />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
