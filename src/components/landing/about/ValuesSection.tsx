'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Valeurs Fondamentales (DS v2 Editorial)
 *
 * 6 cartes ns2-card avec hover lift, badge numéroté
 * en peps-soft, tags variés. Background cream-200.
 */
export function ValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
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

  const values: {
    title: string;
    tag: string;
    tagVariant: 'peps' | 'sage' | 'coral' | 'dark';
    description: string;
  }[] = [
    {
      title: 'Accessibilité',
      tag: 'Pour tous',
      tagVariant: 'peps',
      description:
        'Voir une nutritionniste diplômée ne devrait pas dépendre de votre code postal. Nos consultations sont en ligne, partout en Suisse — de Genève à St-Gall, du Tessin au Jura.',
    },
    {
      title: 'Bienveillance',
      tag: 'Sans jugement',
      tagVariant: 'sage',
      description:
        "Aucun corps n'est trop ceci, trop cela, ou pas assez quelque chose. On respecte votre histoire, votre morphologie, vos difficultés. Toujours.",
    },
    {
      title: 'Confiance',
      tag: 'Honnêteté',
      tagVariant: 'coral',
      description:
        "Vous nous confiez quelque chose de précieux : votre santé. On vous le rend par de l'honnêteté — sur vos progrès, sur ce qui coince, et sur ce que ça coûte. Aucune surprise.",
    },
    {
      title: 'Science',
      tag: 'Données actuelles',
      tagVariant: 'dark',
      description:
        "La nutrition est une science qui évolue vite. Nos recommandations s'appuient sur la recherche la plus récente — pas sur le dernier livre à la mode.",
    },
    {
      title: 'Personnalisation',
      tag: 'Sur mesure',
      tagVariant: 'peps',
      description:
        "Vos conseils ne sont pas ceux d'une autre. Ils s'adaptent à votre vie, vos goûts, votre rythme — avec vous, jamais contre vous.",
    },
    {
      title: 'Collaboration',
      tag: 'En équipe',
      tagVariant: 'sage',
      description:
        'La santé ne se joue pas en solo. On travaille main dans la main avec votre médecin et les autres professionnel·le·s qui vous accompagnent — chacun son rôle, tous dans le même sens.',
    },
  ];

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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr',
            gap: 64,
            alignItems: 'end',
            marginBottom: 56,
          }}
          className='values-header'
        >
          <div>
            <motion.div
              className='ns2-eyebrow ns2-eyebrow-dot'
              style={{ marginBottom: 16, ...getHidden(20) }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0)}
            >
              Nos valeurs fondamentales
            </motion.div>
            <motion.h2
              className='ns2-display'
              style={{
                fontSize: 'clamp(36px, 5vw, 60px)',
                margin: 0,
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.05)}
            >
              Ce qui guide
              <br />
              notre pratique <em>au</em>{' '}
              <span className='ns2-hl'>quotidien</span>.
            </motion.h2>
          </div>
          <motion.p
            className='ns2-body-lg'
            style={getHidden(20)}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.1)}
          >
            Six convictions, pas des slogans. Elles se voient en consultation,
            pas seulement sur cette page.
          </motion.p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
          className='values-grid'
        >
          {values.map((value, index) => (
            <motion.article
              key={value.title}
              className='ns2-card'
              style={{
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                ...getHidden(30),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={getTransition(0.15 + index * 0.06)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--ns-font-serif-stack)',
                    fontSize: 28,
                    fontStyle: 'italic',
                    fontWeight: 500,
                    color: 'var(--ns-peps-deep)',
                    lineHeight: 1,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={`ns2-tag ns2-tag-${value.tagVariant}`}>
                  {value.tag}
                </span>
              </div>

              <h3
                className='ns2-display'
                style={{ fontSize: 26, lineHeight: 1.2, margin: 0 }}
              >
                {value.title}
              </h3>

              <p
                className='ns2-body'
                style={{
                  margin: 0,
                  lineHeight: 1.65,
                  borderTop: '1.5px solid var(--ns-ink)',
                  paddingTop: 16,
                }}
              >
                {value.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .values-header {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            align-items: start !important;
          }
          .values-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .values-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export default ValuesSection;
