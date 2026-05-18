'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

const DAILY_NOTES = [
  'Manger, pas se priver.',
  "Le beurre n'a jamais tué personne. La culpabilité, si.",
  'Une salade ne sauve pas une semaine.',
  "Le brocoli n'est pas une personnalité.",
  "Votre corps n'est pas un projet.",
  "Vous n'avez pas à mériter votre dîner.",
  "Le petit-déjeuner n'est ni sacré, ni le diable. C'est un repas.",
  'Manger lentement. Le frigo ne va nulle part.',
  'Le chocolat noir ne compte pas comme un légume. Désolée.',
  "Si c'était simple, ça se saurait.",
] as const;

/**
 * Hero — DS v2.
 * Asymmetric editorial layout (1.4fr / 1fr): eyebrow + Fraunces display title
 * with one italic phrase + one lime-highlighted word, body lead, peps CTA +
 * ghost link. Right column: framed photo with hard ink border + offset shadow,
 * angled peps sticker.
 */
export function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { isFirstVisit } = useFirstVisit();
  const [dailyNote, setDailyNote] = useState<string>(DAILY_NOTES[0]);
  useEffect(() => {
    setDailyNote(
      DAILY_NOTES[Math.floor(Math.random() * DAILY_NOTES.length)] as string
    );
  }, []);

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
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  return (
    <section
      ref={ref}
      id='hero'
      style={{
        background: 'var(--ns-cream-100)',
        paddingTop: 140,
        paddingBottom: 96,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className='ns2-container'>
        <div className='hero-grid'>
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
              Accompagnement nutritionnel · Suisse
            </motion.div>

            <motion.h1
              className='ns2-display'
              style={{
                fontSize: 'clamp(40px, 7vw, 84px)',
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
              Et si manger redevenait
              <br />
              un{' '}
              <em>
                <span className='ns2-hl'>simple plaisir</span>
              </em>
              &nbsp;?
            </motion.h1>

            <motion.p
              className='ns2-body-lg'
              style={{
                maxWidth: 540,
                marginBottom: 36,
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.35)}
            >
              Sans régime, sans culpabilité, sans application qui vous fait
              scanner une pomme. Juste vous, une diététicienne diplômée, et le
              temps de faire les choses bien.
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
              <Link href='/approche' className='ns2-btn ns2-btn-ghost'>
                Découvrir l'approche →
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              style={{
                marginTop: 56,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                flexWrap: 'wrap',
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.65)}
            >
              <div style={{ display: 'flex', gap: -8 }}>
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      border: 'var(--ns-bw) solid var(--ns-ink)',
                      background:
                        i === 1
                          ? 'var(--ns-peps)'
                          : i === 2
                            ? 'var(--ns-coral-soft)'
                            : i === 3
                              ? 'var(--ns-sage-200)'
                              : 'var(--ns-cream-300)',
                      marginLeft: i === 1 ? 0 : -10,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--ns-font-script-stack)',
                      fontSize: 14,
                      color: 'var(--ns-ink)',
                    }}
                  >
                    {['M', 'L', 'J', 'C'][i - 1]}
                  </div>
                ))}
              </div>
              <div>
                <div
                  className='ns2-meta'
                  style={{
                    fontWeight: 700,
                    color: 'var(--ns-ink)',
                    letterSpacing: '0.02em',
                  }}
                >
                  ★★★★★ &nbsp;4,5/5
                </div>
                <div className='ns2-meta'>
                  150+ femmes accompagnées · Agréments ASCA & RME
                </div>
              </div>
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
                src='https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&h=1100&fit=crop'
                alt='Une assiette colorée préparée avec soin'
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Sticker top-left */}
            <div
              style={{
                position: 'absolute',
                top: -14,
                left: -14,
              }}
            >
              <span
                className='ns2-sticker'
                style={{ transform: 'rotate(-6deg)' }}
              >
                Bienvenue ↘
              </span>
            </div>

            {/* Caption sticker bottom-right */}
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
                maxWidth: 220,
              }}
            >
              <div className='ns2-eyebrow'>Note du jour</div>
              <div
                className='ns2-script'
                style={{
                  marginTop: 4,
                  fontSize: 22,
                  color: 'var(--ns-ink)',
                  lineHeight: 1.1,
                }}
              >
                {dailyNote}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 64px;
          }
        }
        @media (max-width: 640px) {
          .hero-grid {
            gap: 48px;
          }
        }
      `}</style>
    </section>
  );
}
