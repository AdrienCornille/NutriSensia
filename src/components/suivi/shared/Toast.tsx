'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  isVisible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

// Design System v2 — Editorial style.
// Each variant keeps the same cream-50 surface + 1.5px ink border + hard
// offset shadow signature, with a coloured icon chip on the left to encode
// the semantic. Body always uses Inter; nothing here uses the legacy
// Méditerranée palette.
const toastConfig: Record<
  ToastType,
  {
    icon: React.ReactNode;
    chipBg: string;
    chipColor: string;
  }
> = {
  success: {
    icon: <CheckCircle className='w-4 h-4' strokeWidth={2.5} />,
    chipBg: 'var(--ns-peps)',
    chipColor: 'var(--ns-ink)',
  },
  error: {
    icon: <XCircle className='w-4 h-4' strokeWidth={2.5} />,
    chipBg: 'var(--ns-coral)',
    chipColor: 'var(--ns-cream-50)',
  },
  warning: {
    icon: <AlertCircle className='w-4 h-4' strokeWidth={2.5} />,
    chipBg: 'var(--ns-honey)',
    chipColor: 'var(--ns-ink)',
  },
};

export function Toast({
  isVisible,
  type,
  title,
  message,
  duration = 4000,
  onClose,
}: ToastProps) {
  const config = toastConfig[type];

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -16, x: 8 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -16, x: 8 }}
          transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
          role='status'
          aria-live='polite'
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 60,
            maxWidth: 380,
            background: 'var(--ns-cream-50)',
            border: '1.5px solid var(--ns-ink)',
            borderRadius: 14,
            boxShadow: '4px 4px 0 var(--ns-ink)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            fontFamily: 'var(--ns-font-sans)',
          }}
        >
          <span
            aria-hidden='true'
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: config.chipBg,
              color: config.chipColor,
              border: '1.5px solid var(--ns-ink)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {config.icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--ns-ink)',
                lineHeight: 1.3,
              }}
            >
              {title}
            </p>
            {message && (
              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'var(--ns-ink-3)',
                  lineHeight: 1.4,
                }}
              >
                {message}
              </p>
            )}
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Fermer la notification'
            style={{
              flexShrink: 0,
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '1.5px solid var(--ns-ink-4)',
              background: 'transparent',
              color: 'var(--ns-ink-3)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              transition: '160ms var(--ns-ease)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--ns-ink)';
              e.currentTarget.style.color = 'var(--ns-ink)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--ns-ink-4)';
              e.currentTarget.style.color = 'var(--ns-ink-3)';
            }}
          >
            <X className='w-3 h-3' strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
