'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Expertise — Une expertise au service de votre bien-être (DS v2)
 *
 * Layout 2 colonnes : narration éditoriale à gauche
 * (eyebrow + display + paragraphes + qualifications),
 * portrait framé hard-border à droite avec sticker.
 */
export function ExpertiseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: '-100px',
  });
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

  const paragraphs = [
    {
      delay: 0.3,
      content:
        "J'ai fondé NutriSensia avec une conviction profonde : la nutrition ne devrait jamais être une source de frustration ou de culpabilité. C'est un outil — pour aller mieux, pour comprendre son corps, pour vivre plus pleinement.",
    },
    {
      delay: 0.4,
      content:
        "J'accompagne avec rigueur et avec écoute. Les deux. Trois ans d'études en nutrition, plusieurs années d'accompagnement clinique, et toujours du temps consacré à me former — parce que la science évolue, et l'accompagnement aussi.",
    },
    {
      delay: 0.5,
      content:
        "Mes spécialités : la gestion du poids dans la durée, l'équilibre métabolique, et l'alimentation adaptée aux besoins spécifiques — ménopause, troubles digestifs, déséquilibres hormonaux.",
    },
    {
      delay: 0.6,
      content:
        "Ce qui me fait revenir chaque jour, c'est l'instant où une personne comprend enfin ce que son corps lui dit. C'est ça, mon métier.",
    },
  ];

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--ns-cream-100)',
        padding: '112px 0',
      }}
    >
      <div className='ns2-container'>
        <div className='expertise-grid'>
          {/* LEFT — narration */}
          <motion.div
            style={getHidden(0, -30)}
            animate={
              showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
            }
            transition={getTransition(0.1)}
          >
            <div
              className='ns2-eyebrow ns2-eyebrow-dot'
              style={{ marginBottom: 18 }}
            >
              Lucie · Nutritionniste
            </div>

            <h2
              className='ns2-display'
              style={{
                fontSize: 'clamp(36px, 5vw, 60px)',
                marginBottom: 24,
              }}
            >
              Une <em>expertise</em> au service
              <br />
              de votre <span className='ns2-hl'>bien-être</span>.
            </h2>

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: 32,
              }}
            >
              <span className='ns2-tag ns2-tag-sage'>Nutrition</span>
              <span className='ns2-tag ns2-tag-peps'>Suivi durable</span>
              <span className='ns2-tag ns2-tag-coral'>Métabolisme</span>
            </div>

            {paragraphs.map((para, idx) => (
              <motion.p
                key={idx}
                className='ns2-body-lg'
                style={{
                  marginBottom: 20,
                  lineHeight: 1.75,
                  ...getHidden(20),
                }}
                animate={
                  showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={getTransition(para.delay)}
              >
                {para.content}
              </motion.p>
            ))}
          </motion.div>

          {/* RIGHT — portrait */}
          <motion.div
            style={{ position: 'relative', ...getHidden(0, 30) }}
            animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={getTransition(0.2)}
          >
            <div
              className='ns2-frame'
              style={{
                width: '100%',
                aspectRatio: '3 / 4',
                position: 'relative',
              }}
            >
              <Image
                src='/images/lucie-cornille-profile.jpg'
                alt='Lucie Cornille, Nutritionniste certifiée'
                fill
                style={{ objectFit: 'cover' }}
                sizes='(max-width: 768px) 100vw, 420px'
              />
            </div>
            <span
              className='ns2-sticker'
              style={{
                position: 'absolute',
                top: -16,
                left: -12,
                transform: 'rotate(-6deg)',
                zIndex: 2,
              }}
            >
              Bienvenue ✦
            </span>

            <div
              style={{
                position: 'absolute',
                bottom: -24,
                right: -16,
                background: 'var(--ns-cream-50)',
                border: '1.5px solid var(--ns-ink)',
                borderRadius: 14,
                padding: '12px 18px',
                boxShadow: 'var(--ns-shadow-hard-sm)',
                transform: 'rotate(3deg)',
                maxWidth: 220,
              }}
            >
              <div className='ns2-eyebrow' style={{ marginBottom: 4 }}>
                Approche
              </div>
              <div
                style={{
                  fontFamily: 'var(--ns-font-script-stack)',
                  fontSize: 22,
                  color: 'var(--ns-ink)',
                  lineHeight: 1.1,
                }}
              >
                empathique &amp;
                <br />
                rigoureuse.
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .expertise-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 80px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .expertise-grid {
            grid-template-columns: 1fr;
            gap: 64px;
          }
        }
      `}</style>
    </section>
  );
}

export default ExpertiseSection;
