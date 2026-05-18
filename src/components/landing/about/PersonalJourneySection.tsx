'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Parcours — Transformer votre santé par la nutrition (DS v2 Editorial)
 *
 * Image cadrée en haut, contenu éditorial dessous, encadré
 * "Remboursement" en card peps-soft avec bordure ink.
 */
export function PersonalJourneySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: '-100px',
  });
  const { isFirstVisit } = useFirstVisit();

  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  const getHidden = (yOffset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${yOffset}px)` };

  const getTransition = (delay: number) =>
    shouldAnimate
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--ns-cream-200)',
        padding: '112px 0',
        borderTop: '1.5px solid var(--ns-ink)',
        borderBottom: '1.5px solid var(--ns-ink)',
      }}
    >
      <div className='ns2-container'>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          {/* Image */}
          <motion.div
            className='ns2-frame'
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              marginBottom: 56,
              position: 'relative',
              ...getHidden(30),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={getTransition(0)}
          >
            <Image
              src='/images/nutritionist-consultation.jpg'
              alt='Consultation nutritionnelle personnalisée avec Lucie Cornille'
              fill
              style={{ objectFit: 'cover' }}
              sizes='(max-width: 768px) 100vw, 880px'
            />
          </motion.div>

          {/* Eyebrow */}
          <motion.div
            className='ns2-eyebrow ns2-eyebrow-dot'
            style={{ marginBottom: 18, ...getHidden(20) }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.05)}
          >
            Notre raison d&apos;être
          </motion.div>

          {/* Titre */}
          <motion.h2
            className='ns2-display'
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              marginBottom: 32,
              ...getHidden(30),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={getTransition(0.1)}
          >
            Transformer votre santé par la <em>nutrition</em>,
            <br />
            une <span className='ns2-hl'>consultation</span> à la fois.
          </motion.h2>

          {/* Paragraphes */}
          {[
            {
              delay: 0.2,
              content: (
                <>
                  En Suisse, des milliers de personnes vivent avec des troubles
                  liés à leur alimentation. Pourtant, peu ont accès à un
                  accompagnement personnalisé. Et beaucoup pensent encore que
                  voir une nutritionniste, c&apos;est renoncer aux plaisirs de
                  la table.{' '}
                  <em
                    style={{
                      fontFamily: 'var(--ns-font-serif-stack)',
                      fontStyle: 'italic',
                      color: 'var(--ns-ink)',
                      fontWeight: 500,
                    }}
                  >
                    C&apos;est faux.
                  </em>{' '}
                  Et c&apos;est exactement ce qu&apos;on essaie de changer.
                </>
              ),
            },
            {
              delay: 0.3,
              content:
                "Chez NutriSensia, on croit qu'une vraie expertise nutritionnelle ne devrait pas être un luxe. Lucie Cornille, nutritionniste, propose des consultations en ligne fondées sur les connaissances scientifiques actuelles — et qui respectent qui vous êtes, ce que vous mangez, et d'où vous venez.",
            },
            {
              delay: 0.4,
              content:
                "Notre approche n'est pas un protocole : elle s'adapte à vos habitudes, vos goûts, vos contraintes. On construit, ensemble, un chemin qui tient — pas trois semaines.",
            },
          ].map((para, idx) => (
            <motion.p
              key={idx}
              className='ns2-body-lg'
              style={{
                marginBottom: 22,
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

          {/* Encart Remboursement */}
          <motion.div
            style={{
              background: 'var(--ns-peps-soft)',
              border: '1.5px solid var(--ns-ink)',
              borderRadius: 'var(--ns-r-md)',
              padding: 'clamp(24px, 4vw, 36px)',
              marginTop: 40,
              boxShadow: 'var(--ns-shadow-hard-sm)',
              position: 'relative',
              ...getHidden(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.5)}
          >
            <span
              className='ns2-sticker ns2-sticker-coral'
              style={{
                position: 'absolute',
                top: -14,
                left: 24,
                transform: 'rotate(-4deg)',
              }}
            >
              Bon à savoir ↘
            </span>
            <div className='ns2-eyebrow' style={{ marginBottom: 10 }}>
              Remboursement
            </div>
            <h3
              className='ns2-display'
              style={{
                fontSize: 26,
                lineHeight: 1.25,
                marginBottom: 12,
              }}
            >
              Pris en charge par votre <em>assurance complémentaire</em>.
            </h3>
            <p
              className='ns2-body'
              style={{ margin: 0, color: 'var(--ns-ink)' }}
            >
              La plupart des assurances complémentaires couvrent tout ou partie
              des consultations en nutrition. Un appel à votre assurance suffit
              pour vérifier votre couverture.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PersonalJourneySection;
