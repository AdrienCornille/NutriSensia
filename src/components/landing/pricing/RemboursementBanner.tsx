'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Remboursement banner — page Prix, DS v2.
 * Coral panel with hard ink border + offset shadow + angled peps sticker
 * + dark CTA. Same structural language as the homepage CTABannerSection
 * but with a coral accent (warmer, secondary-CTA feel).
 */
export function RemboursementBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { isFirstVisit } = useFirstVisit();

  const showContent = !isFirstVisit || isInView;
  const getTransition = (delay: number) =>
    isFirstVisit && isInView
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--ns-cream-100)',
        padding: '64px 0',
      }}
    >
      <div className='ns2-container'>
        <motion.div
          initial={false}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
          style={{
            position: 'relative',
            background: 'var(--ns-coral-soft)',
            border: 'var(--ns-bw) solid var(--ns-ink)',
            borderRadius: 'var(--ns-r-lg)',
            boxShadow: 'var(--ns-shadow-hard-lg)',
            padding: 'clamp(32px, 5vw, 56px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          {/* Sticker */}
          <div
            style={{
              position: 'absolute',
              top: -16,
              right: 32,
            }}
          >
            <span className='ns2-sticker' style={{ transform: 'rotate(4deg)' }}>
              Bon plan ↘
            </span>
          </div>

          <div style={{ flex: '1 1 480px' }}>
            <div className='ns2-eyebrow' style={{ color: 'var(--ns-ink)' }}>
              Assurance complémentaire
            </div>
            <h2
              className='ns2-display'
              style={{
                marginTop: 12,
                fontSize: 'clamp(26px, 3.4vw, 38px)',
                color: 'var(--ns-ink)',
                lineHeight: 1.05,
              }}
            >
              Remboursement <em>possible</em> par votre
              <br />
              assurance complémentaire.
            </h2>
          </div>

          <Link
            href='/remboursement'
            className='ns2-btn ns2-btn-dark'
            style={{ flexShrink: 0 }}
          >
            En savoir plus
            <ArrowRight className='w-4 h-4' />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
