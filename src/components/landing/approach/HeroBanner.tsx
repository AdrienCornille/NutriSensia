'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Hero — page Approche, DS v2.
 * Asymmetric editorial layout (1.4fr / 1fr): eyebrow, Fraunces display title
 * with italic accent + lime highlight, body lead, peps CTA + ghost link.
 * Right column: framed photo with hard ink border + offset shadow + sticker.
 */
export interface HeroBannerProps {
  className?: string;
}

export function HeroBanner({ className }: HeroBannerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { isFirstVisit } = useFirstVisit();

  const showContent = !isFirstVisit || isInView;
  const getHidden = (yOffset: number, scale: number = 1) =>
    !isFirstVisit
      ? {}
      : {
          opacity: 0,
          transform: `translateY(${yOffset}px) scale(${scale})`,
        };
  const getTransition = (delay: number) =>
    isFirstVisit && isInView
      ? { duration: 0.7, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  return (
    <section
      ref={ref}
      className={className}
      style={{
        background: 'var(--ns-cream-100)',
        paddingTop: 140,
        paddingBottom: 96,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className='ns2-container'>
        <div className='approach-hero-grid'>
          {/* Left — text */}
          <div>
            <motion.div
              style={getHidden(20)}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.1)}
              className='ns2-eyebrow ns2-eyebrow-dot'
            >
              Notre approche
            </motion.div>

            <motion.h1
              className='ns2-display'
              style={{
                fontSize: 'clamp(40px, 6.5vw, 76px)',
                color: 'var(--ns-ink)',
                marginTop: 24,
                marginBottom: 28,
                ...getHidden(30),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={getTransition(0.2)}
            >
              Une méthode qui <span className='ns2-hl'>vous ressemble</span>,
              <br />
              <em>pas un protocole</em>.
            </motion.h1>

            <motion.p
              className='ns2-body-lg'
              style={{
                maxWidth: 560,
                marginBottom: 36,
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.35)}
            >
              Fini les régimes photocopiés et les plans qu&apos;on ne tient pas
              trois semaines. Une méthode scientifique, oui — mais pensée pour
              votre vraie vie. Celle avec les imprévus, les week-ends, et les
              semaines qui ne se ressemblent jamais.
            </motion.p>

            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                flexWrap: 'wrap',
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.5)}
            >
              <Link
                href='/contact?type=consultation'
                className='ns2-btn ns2-btn-peps'
              >
                Réserver une consultation
                <ArrowRight className='w-4 h-4' />
              </Link>
              <a href='#principles' className='ns2-btn ns2-btn-ghost'>
                Découvrir les principes →
              </a>
            </motion.div>
          </div>

          {/* Right — framed image */}
          <motion.div
            style={{
              position: 'relative',
              ...getHidden(40, 0.97),
            }}
            animate={
              showContent
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 40, scale: 0.97 }
            }
            transition={getTransition(0.3)}
          >
            <div className='ns2-frame' style={{ aspectRatio: '4 / 5' }}>
              <img
                src='https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=1100&fit=crop&q=80'
                alt='Une assiette colorée préparée avec soin'
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Sticker */}
            <div style={{ position: 'absolute', top: -14, left: -14 }}>
              <span
                className='ns2-sticker'
                style={{ transform: 'rotate(-6deg)' }}
              >
                Méthode douce →
              </span>
            </div>

            {/* Caption sticker */}
            <div
              style={{
                position: 'absolute',
                bottom: -18,
                right: -10,
                background: 'var(--ns-cream-50)',
                border: 'var(--ns-bw) solid var(--ns-ink)',
                borderRadius: 'var(--ns-r-md)',
                padding: '10px 16px',
                boxShadow: 'var(--ns-shadow-hard-sm)',
                maxWidth: 240,
              }}
            >
              <div className='ns2-eyebrow'>Notre promesse</div>
              <div
                className='ns2-script'
                style={{
                  marginTop: 4,
                  fontSize: 22,
                  color: 'var(--ns-ink)',
                  lineHeight: 1.1,
                }}
              >
                Écouter,
                <br />
                avant tout.
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .approach-hero-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .approach-hero-grid {
            grid-template-columns: 1fr;
            gap: 64px;
          }
        }
        @media (max-width: 640px) {
          .approach-hero-grid {
            gap: 48px;
          }
        }
      `}</style>
    </section>
  );
}

export default HeroBanner;
