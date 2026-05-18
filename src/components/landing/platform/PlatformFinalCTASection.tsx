'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section CTA finale — Plateforme (DS v2 Editorial)
 *
 * Bannière peps avec sticker coral, hard shadow ink,
 * deux CTAs (dark primary + outline secondary).
 */
export function PlatformFinalCTASection() {
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
            padding: 'clamp(36px, 5vw, 64px)',
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
              right: 36,
              transform: 'rotate(4deg)',
            }}
          >
            7 jours offerts ★
          </span>

          <div style={{ flex: '1 1 360px' }}>
            <div className='ns2-eyebrow' style={{ marginBottom: 12 }}>
              On commence ?
            </div>
            <h3
              className='ns2-display'
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                margin: 0,
                color: 'var(--ns-ink)',
              }}
            >
              Prête à essayer <em>autrement</em> ?
            </h3>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Link href='/essai-gratuit' className='ns2-btn ns2-btn-dark'>
              Essai gratuit
              <ArrowRight className='w-4 h-4' />
            </Link>
            <Link
              href={{ pathname: '/contact', query: { type: 'consultation' } }}
              className='ns2-btn ns2-btn-outline'
            >
              Réserver une consultation
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
