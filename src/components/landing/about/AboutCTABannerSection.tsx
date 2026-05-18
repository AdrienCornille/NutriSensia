'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * CTA Banner — À propos (DS v2 Editorial)
 *
 * Bannière peps avec sticker coral, hard shadow ink,
 * CTA dark + outline.
 */
export function AboutCTABannerSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { isFirstVisit } = useFirstVisit();

  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  const getTransition = (delay: number) =>
    shouldAnimate
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
          style={{
            background: 'var(--ns-peps)',
            border: '1.5px solid var(--ns-ink)',
            borderRadius: 'var(--ns-r-lg)',
            boxShadow: 'var(--ns-shadow-hard-lg)',
            padding: 'clamp(32px, 5vw, 56px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
            flexWrap: 'wrap',
            position: 'relative',
            ...(isFirstVisit
              ? { opacity: 0, transform: 'translateY(20px)' }
              : {}),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          <span
            className='ns2-sticker ns2-sticker-coral'
            style={{
              position: 'absolute',
              top: -16,
              right: 32,
              transform: 'rotate(4deg)',
            }}
          >
            On commence ↘
          </span>

          <div style={{ flex: '1 1 360px' }}>
            <div className='ns2-eyebrow' style={{ marginBottom: 10 }}>
              Premier pas
            </div>
            <h3
              className='ns2-display'
              style={{
                fontSize: 'clamp(26px, 4vw, 40px)',
                margin: 0,
                color: 'var(--ns-ink)',
                lineHeight: 1.15,
              }}
            >
              Prêt·e à faire <em>le premier pas</em> ?
            </h3>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href='/contact' className='ns2-btn ns2-btn-dark'>
              Réserver une consultation
              <ArrowRight className='w-4 h-4' />
            </Link>
            <Link href='/contact' className='ns2-btn ns2-btn-outline'>
              Poser une question
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
