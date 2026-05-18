'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * CTA banner — DS v2.
 * Peps panel with hard ink border + offset shadow, an angled coral sticker,
 * Fraunces italic phrase, dark CTA button. Positioned as a strong divider
 * between sections.
 */
export function CTABannerSection() {
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
            background: 'var(--ns-peps)',
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
          {/* Coral sticker top-right */}
          <div
            style={{
              position: 'absolute',
              top: -16,
              right: 32,
            }}
          >
            <span
              className='ns2-sticker ns2-sticker-coral'
              style={{ transform: 'rotate(4deg)' }}
            >
              Première séance ★
            </span>
          </div>

          <div style={{ flex: '1 1 480px' }}>
            <div className='ns2-eyebrow' style={{ color: 'var(--ns-ink)' }}>
              On commence ?
            </div>
            <h3
              className='ns2-display'
              style={{
                marginTop: 12,
                fontSize: 'clamp(28px, 4vw, 44px)',
                color: 'var(--ns-ink)',
                lineHeight: 1.05,
              }}
            >
              Une consultation découverte.{' '}
              <em>
                <span className='ns2-hl'>30 minutes</span>
              </em>
              , zéro engagement,
              <br />
              beaucoup d&apos;écoute.
            </h3>
          </div>

          <Link
            href='/contact?type=consultation'
            className='ns2-btn ns2-btn-dark'
            style={{ flexShrink: 0 }}
          >
            Prendre rendez-vous
            <ArrowRight className='w-4 h-4' />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
