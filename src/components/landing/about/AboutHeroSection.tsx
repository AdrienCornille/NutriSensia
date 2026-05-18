'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Hero — À propos (DS v2 Editorial)
 *
 * Eyebrow + display titre avec emphase + script italique
 * à gauche, deux images framées en composition décalée
 * à droite (signature DS v2 hard-border + offset shadow).
 */
export function AboutHeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { isFirstVisit } = useFirstVisit();

  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  const getHidden = (yOffset: number, xOffset = 0) =>
    !isFirstVisit
      ? {}
      : {
          opacity: 0,
          transform: `translateY(${yOffset}px) translateX(${xOffset}px)`,
        };

  const getTransition = (delay: number) =>
    shouldAnimate
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--ns-cream-100)',
        padding: '128px 0 112px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className='ns2-container'>
        <div className='about-hero-grid'>
          {/* LEFT — Content */}
          <div>
            <motion.div
              className='ns2-eyebrow ns2-eyebrow-dot'
              style={{ marginBottom: 18, ...getHidden(10) }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
              }
              transition={getTransition(0)}
            >
              À propos · NutriSensia
            </motion.div>

            <motion.h1
              className='ns2-display'
              style={{
                fontSize: 'clamp(40px, 6vw, 76px)',
                marginBottom: 24,
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.1)}
            >
              Une nutrition <span className='ns2-hl'>accessible</span>,
              <br />
              avec <span className='ns2-hl'>bienveillance</span>
              <br />
              et science.
            </motion.h1>

            <motion.p
              className='ns2-body-lg'
              style={{ maxWidth: 520, marginBottom: 28, ...getHidden(20) }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.25)}
            >
              Rendre l&apos;expertise nutritionnelle accessible — à toutes
              celles qui pensaient qu&apos;elle ne leur était pas destinée. Sans
              jugement, sans régime restrictif, sans drame.
            </motion.p>

            <motion.div
              style={{
                fontFamily: 'var(--ns-font-script-stack)',
                fontSize: 26,
                color: 'var(--ns-ink)',
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.4)}
            >
              <em
                style={{
                  fontFamily: 'var(--ns-font-serif-stack)',
                  fontStyle: 'italic',
                  color: 'var(--ns-peps-deep)',
                }}
              >
                — Lucie Cornille,
              </em>{' '}
              nutritionniste
            </motion.div>
          </div>

          {/* RIGHT — Images framées */}
          <div className='about-hero-images'>
            <motion.div
              className='ns2-frame about-hero-img-main'
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 320,
                aspectRatio: '4 / 3',
                zIndex: 1,
                ...getHidden(0, 30),
              }}
              animate={
                showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }
              }
              transition={getTransition(0.2)}
            >
              <Image
                src='/images/nutritionist-consultation.jpg'
                alt='Consultation nutritionnelle personnalisée'
                fill
                priority
                style={{ objectFit: 'cover' }}
                sizes='(max-width: 768px) 240px, 320px'
              />
            </motion.div>

            <motion.div
              className='ns2-frame about-hero-img-overlap'
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 280,
                aspectRatio: '4 / 3',
                zIndex: 2,
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.4)}
            >
              <Image
                src='/images/hero-healthy-plate.jpg'
                alt='Plat sain et équilibré'
                fill
                style={{ objectFit: 'cover' }}
                sizes='(max-width: 768px) 200px, 280px'
              />
            </motion.div>

            {/* Sticker accent */}
            <motion.span
              className='ns2-sticker'
              style={{
                position: 'absolute',
                top: -16,
                right: -8,
                transform: 'rotate(6deg)',
                zIndex: 3,
                ...getHidden(0, 30),
              }}
              animate={
                showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }
              }
              transition={getTransition(0.55)}
            >
              Bonjour ↘
            </motion.span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .about-hero-images {
          position: relative;
          width: 100%;
          height: 460px;
        }
        @media (max-width: 1024px) {
          .about-hero-grid {
            grid-template-columns: 1fr;
            gap: 80px;
          }
          .about-hero-images {
            height: 420px;
            max-width: 480px;
            margin: 0 auto;
          }
        }
        @media (max-width: 640px) {
          .about-hero-images {
            height: 360px;
          }
          :global(.about-hero-img-main) {
            width: 240px !important;
          }
          :global(.about-hero-img-overlap) {
            width: 220px !important;
          }
        }
      `}</style>
    </section>
  );
}
