'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Pourquoi me faire confiance — DS v2.
 * Asymmetric grid 1.4fr / 1fr (image left), Fraunces display title with italic
 * accent and lime highlight, eyebrow, body lead, bordered checklist, dark CTA.
 * Image lives inside .ns2-frame with offset ink shadow + script-caption sticker.
 */
export function AboutMeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  const showContent = !isFirstVisit || isInView;
  const getHidden = (axis: 'x' | 'y', offset: number) =>
    !isFirstVisit
      ? {}
      : {
          opacity: 0,
          transform:
            axis === 'x'
              ? `translateX(${offset}px)`
              : `translateY(${offset}px)`,
        };
  const getTransition = (delay: number) =>
    isFirstVisit && isInView
      ? { duration: 0.7, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  const offers = [
    'Un accompagnement qui évolue avec vous, pas malgré vous',
    'Une écoute pour comprendre votre relation à l’alimentation',
    'Des ajustements en temps réel, selon vos ressentis',
    'Un soutien humain dans les moments de doute',
  ];

  return (
    <section
      id='about-me'
      ref={ref}
      style={{
        background: 'var(--ns-cream-200)',
        paddingTop: 96,
        paddingBottom: 96,
        borderTop: 'var(--ns-bw) solid var(--ns-ink)',
      }}
    >
      <div className='ns2-container'>
        <div className='about-grid'>
          {/* Image */}
          <motion.div
            style={{ position: 'relative', ...getHidden('x', -30) }}
            animate={
              showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
            }
            transition={getTransition(0)}
          >
            <div
              className='ns2-frame'
              style={{ aspectRatio: '4 / 5', maxWidth: 520 }}
            >
              <img
                src='/images/lucie-cornille-profile.jpg'
                alt='Lucie Cornille — Nutritionniste ASCA/RME'
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=900&auto=format&fit=crop';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Sticker eyebrow */}
            <div
              style={{
                position: 'absolute',
                top: -14,
                left: -14,
              }}
            >
              <span className='ns2-sticker'>L'équipe ↘</span>
            </div>

            {/* Caption card bottom */}
            <div
              style={{
                position: 'absolute',
                bottom: -22,
                right: -10,
                background: 'var(--ns-cream-50)',
                border: 'var(--ns-bw) solid var(--ns-ink)',
                borderRadius: 'var(--ns-r-md)',
                padding: '12px 18px',
                boxShadow: 'var(--ns-shadow-hard-sm)',
                maxWidth: 240,
              }}
            >
              <div className='ns2-eyebrow'>Diététicienne</div>
              <div
                className='ns2-display'
                style={{
                  fontSize: 22,
                  marginTop: 4,
                  color: 'var(--ns-ink)',
                  fontStyle: 'italic',
                  lineHeight: 1.05,
                }}
              >
                Lucie Cornille
              </div>
              <div className='ns2-meta' style={{ marginTop: 4 }}>
                ASCA & RME · Lausanne
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            style={getHidden('x', 30)}
            animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={getTransition(0.15)}
          >
            <div className='ns2-eyebrow ns2-eyebrow-dot'>À propos</div>

            <h2
              className='ns2-display'
              style={{
                fontSize: 'clamp(36px, 5vw, 60px)',
                color: 'var(--ns-ink)',
                marginTop: 18,
                marginBottom: 24,
              }}
            >
              Pourquoi <em>une humaine</em>, pas une IA&nbsp;?
            </h2>

            <p className='ns2-body-lg' style={{ marginBottom: 16 }}>
              Une IA peut générer votre plan alimentaire en trois secondes. Elle
              peut même le rendre joli. Ce qu’elle ne peut pas faire&nbsp;:
              entendre dans votre voix que cette semaine a été dure. Comprendre
              pourquoi vous avez sauté trois repas. Réajuster, sans jugement,
              quand la vie déborde.
            </p>
            <p className='ns2-body' style={{ marginBottom: 32 }}>
              C’est pour ça que Lucie a créé NutriSensia. Trois ans d’études en
              nutrition, et l’envie de faire les choses autrement.
            </p>

            <div
              style={{
                background: 'var(--ns-cream-50)',
                border: 'var(--ns-bw) solid var(--ns-ink)',
                borderRadius: 'var(--ns-r-md)',
                padding: 24,
                marginBottom: 32,
              }}
            >
              <div className='ns2-eyebrow'>Ce que nous offrons</div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  marginTop: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {offers.map(offer => (
                  <li
                    key={offer}
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      fontFamily: 'var(--ns-font-sans-stack)',
                      fontSize: 15,
                      color: 'var(--ns-fg-muted)',
                      lineHeight: 1.55,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        marginTop: 6,
                        width: 10,
                        height: 10,
                        background: 'var(--ns-peps-deep)',
                        borderRadius: 999,
                        border: '1.5px solid var(--ns-ink)',
                      }}
                    />
                    {offer}
                  </li>
                ))}
              </ul>
            </div>

            <p
              className='ns2-body'
              style={{
                fontFamily: 'var(--ns-font-serif-stack)',
                fontStyle: 'italic',
                fontSize: 18,
                color: 'var(--ns-ink)',
                marginBottom: 32,
              }}
            >
              Parce que{' '}
              <span className='ns2-hl'>votre corps n’est pas un dataset</span> —
              et qu’un vrai changement ne se construit pas seule devant un
              écran.
            </p>

            <Link href='/a-propos' className='ns2-btn ns2-btn-dark'>
              Notre histoire complète
              <ArrowRight className='w-4 h-4' />
            </Link>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 64px;
          }
        }
      `}</style>
    </section>
  );
}
