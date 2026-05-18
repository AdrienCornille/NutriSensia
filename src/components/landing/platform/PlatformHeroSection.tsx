'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Hero — La Plateforme (DS v2 Editorial)
 *
 * Layout 2 colonnes : eyebrow + display titre + body + CTAs
 * à gauche, mockup éditorial (cards cream/ink/peps superposées)
 * à droite. Sticker rotatif en accent.
 */
export function PlatformHeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
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

  const handleCTAClick = () => {
    const next = document.getElementById('platform-features');
    if (next) {
      next.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/essai-gratuit';
    }
  };

  return (
    <section
      ref={ref}
      id='platform-hero'
      style={{
        background: 'var(--ns-cream-100)',
        padding: '128px 0 96px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className='ns2-container'>
        <div className='hero-grid'>
          {/* ============== LEFT — CONTENT ============== */}
          <div className='hero-content'>
            <motion.div
              className='ns2-eyebrow ns2-eyebrow-dot'
              style={{ marginBottom: 18, ...getHidden(10) }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
              }
              transition={getTransition(0.1)}
            >
              Plateforme · Coach 24/7
            </motion.div>

            <motion.h1
              className='ns2-display hero-title'
              style={{
                fontSize: 'clamp(40px, 6vw, 76px)',
                marginBottom: 24,
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.2)}
            >
              Votre <em>nutrition</em>,
              <br />
              centralisée et <span className='ns2-hl'>vivante</span>.
            </motion.h1>

            <motion.p
              className='ns2-body-lg'
              style={{
                maxWidth: 520,
                marginBottom: 36,
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.35)}
            >
              Plans de repas, journal, progrès, messagerie — tout au même
              endroit. Parce que votre transformation mérite mieux qu&apos;un
              PDF imprimé et oublié sur un coin de bureau.
            </motion.p>

            <motion.div
              style={{
                display: 'flex',
                gap: 14,
                flexWrap: 'wrap',
                marginBottom: 28,
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.5)}
            >
              <button
                type='button'
                onClick={handleCTAClick}
                className='ns2-btn ns2-btn-peps'
              >
                Découvrir gratuitement
                <ArrowRight className='w-4 h-4' />
              </button>
              <a href='#platform-features' className='ns2-btn ns2-btn-outline'>
                Voir les fonctionnalités
              </a>
            </motion.div>

            <motion.div
              style={{
                display: 'flex',
                gap: 28,
                flexWrap: 'wrap',
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.65)}
            >
              {['Essai gratuit 7 jours', 'Aucune carte bancaire demandée'].map(
                label => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: 'var(--ns-ink-3)',
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        background: 'var(--ns-peps-deep)',
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    />
                    {label}
                  </div>
                )
              )}
            </motion.div>
          </div>

          {/* ============== RIGHT — EDITORIAL MOCKUP ============== */}
          <motion.div
            className='hero-visual'
            style={{
              position: 'relative',
              ...getHidden(0, 40),
            }}
            animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={getTransition(0.3)}
          >
            {/* Sticker top-left */}
            <span
              className='ns2-sticker'
              style={{
                position: 'absolute',
                top: -18,
                left: -8,
                transform: 'rotate(-6deg)',
                zIndex: 5,
              }}
            >
              Inclus ↘
            </span>

            {/* Big card — dashboard preview */}
            <div
              className='ns2-card-static'
              style={{
                position: 'relative',
                padding: 0,
                width: '100%',
                aspectRatio: '5 / 4',
                background: 'var(--ns-cream-50)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* App header bar */}
              <div
                style={{
                  background: 'var(--ns-ink)',
                  color: 'var(--ns-cream-100)',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1.5px solid var(--ns-ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'var(--ns-peps)',
                      display: 'inline-block',
                    }}
                  />
                  <span
                    className='ns2-eyebrow'
                    style={{ color: 'var(--ns-cream-100)' }}
                  >
                    NutriSensia · Tableau de bord
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--ns-font-script-stack)',
                    fontSize: 18,
                    color: 'var(--ns-peps)',
                  }}
                >
                  bonjour ✦
                </span>
              </div>

              {/* Body grid */}
              <div
                style={{
                  flex: 1,
                  padding: 20,
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr',
                  gap: 14,
                }}
              >
                {/* Plan du jour card */}
                <div
                  style={{
                    background: 'var(--ns-cream-100)',
                    border: '1.5px solid var(--ns-ink)',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <span className='ns2-eyebrow'>Plan du jour</span>
                  {[
                    'Petit-déj · Porridge fruits',
                    'Déjeuner · Quinoa pois chiches',
                    'Dîner · Saumon légumes vapeur',
                  ].map(meal => (
                    <div
                      key={meal}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: 12,
                        color: 'var(--ns-ink-2)',
                        fontFamily: 'var(--ns-font-serif-stack)',
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          background: 'var(--ns-peps)',
                          border: '1.5px solid var(--ns-ink)',
                          borderRadius: 3,
                          display: 'inline-block',
                        }}
                      />
                      {meal}
                    </div>
                  ))}
                </div>

                {/* Side stack */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      background: 'var(--ns-peps-soft)',
                      border: '1.5px solid var(--ns-ink)',
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <span className='ns2-eyebrow'>Objectif semaine</span>
                    <div
                      style={{
                        display: 'flex',
                        gap: 4,
                        marginTop: 10,
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <span
                          key={i}
                          style={{
                            flex: 1,
                            height: 8,
                            background:
                              i <= 4
                                ? 'var(--ns-peps-deep)'
                                : 'var(--ns-cream-300)',
                            border: '1.5px solid var(--ns-ink)',
                            borderRadius: 2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'var(--ns-cream-100)',
                      border: '1.5px solid var(--ns-ink)',
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <span className='ns2-eyebrow'>Prochain RDV</span>
                    <div
                      style={{
                        marginTop: 6,
                        fontFamily: 'var(--ns-font-serif-stack)',
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'var(--ns-ink)',
                      }}
                    >
                      Mer. 16 oct
                      <br />
                      14h50
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone mockup overlap bottom-right */}
            <div
              className='hero-phone'
              style={{
                position: 'absolute',
                right: -28,
                bottom: -36,
                width: 168,
                background: 'var(--ns-ink)',
                border: '1.5px solid var(--ns-ink)',
                borderRadius: 28,
                padding: 8,
                boxShadow: 'var(--ns-shadow-hard-lg)',
                transform: 'rotate(4deg)',
              }}
            >
              <div
                style={{
                  background: 'var(--ns-cream-50)',
                  borderRadius: 22,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <span className='ns2-eyebrow'>Aujourd&apos;hui</span>
                <div
                  style={{
                    fontFamily: 'var(--ns-font-serif-stack)',
                    fontSize: 18,
                    fontWeight: 500,
                    lineHeight: 1.2,
                    color: 'var(--ns-ink)',
                  }}
                >
                  3 repas
                  <br />
                  <em style={{ color: 'var(--ns-peps-deep)' }}>planifiés</em>
                </div>
                <div
                  style={{
                    height: 1,
                    background: 'var(--ns-ink)',
                    opacity: 0.15,
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <span
                      key={i}
                      style={{
                        flex: 1,
                        height: 6,
                        background:
                          i <= 5
                            ? 'var(--ns-peps-deep)'
                            : 'var(--ns-cream-300)',
                        borderRadius: 1.5,
                      }}
                    />
                  ))}
                </div>
                <span className='ns2-meta'>Hydratation 5/8</span>
              </div>
            </div>

            {/* Caveat caption bottom-left */}
            <div
              className='hero-caption'
              style={{
                position: 'absolute',
                bottom: -28,
                left: -16,
                background: 'var(--ns-cream-50)',
                border: '1.5px solid var(--ns-ink)',
                borderRadius: 14,
                padding: '10px 16px',
                boxShadow: 'var(--ns-shadow-hard-sm)',
                transform: 'rotate(-3deg)',
                maxWidth: 200,
              }}
            >
              <span className='ns2-eyebrow'>Note du jour</span>
              <div
                style={{
                  fontFamily: 'var(--ns-font-script-stack)',
                  fontSize: 22,
                  marginTop: 4,
                  color: 'var(--ns-ink)',
                  lineHeight: 1.1,
                }}
              >
                vivant,
                <br />
                pas figé.
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 96px;
          }
          .hero-visual {
            max-width: 480px;
            margin: 0 auto;
          }
        }
        @media (max-width: 640px) {
          .hero-phone {
            right: -8px !important;
            width: 140px !important;
          }
          .hero-caption {
            left: -4px !important;
            max-width: 170px !important;
          }
        }
      `}</style>
    </section>
  );
}
