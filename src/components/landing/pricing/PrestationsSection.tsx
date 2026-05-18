'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Prestations — page Prix, DS v2.
 * Hero éditorial cream + 2 .ns2-card tarifs (Découverte / Suivi).
 * Prix en gros Fraunces italic, tag couleur, liste à dots peps-deep, CTA peps.
 */

interface Plan {
  tagVariant: 'sage' | 'peps';
  tag: string;
  title: string;
  subtitle: string;
  duration: string;
  price: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  note?: string;
}

const PLANS: Plan[] = [
  {
    tagVariant: 'sage',
    tag: 'Découverte',
    title: 'Consultation découverte',
    subtitle: 'Arrêtez les régimes, comprenez votre corps',
    duration: '1h30',
    price: 'CHF 179',
    description:
      'Les régimes ne marchent pas parce qu’ils ignorent ce dont VOTRE corps a besoin. En 1h30, découvrez l’approche qui change tout : écouter votre biologie, pas les modes.',
    features: [
      'Comprenez pourquoi vos tentatives précédentes ont échoué',
      'Un plan basé sur la science, adapté à votre quotidien',
      'De petites habitudes simples qui transforment tout',
      'Sans restriction, sans culpabilité, sans révolution',
    ],
    cta: { label: 'Réserver ma consultation', href: '/inscription' },
  },
  {
    tagVariant: 'peps',
    tag: 'Suivi',
    title: 'Consultation de suivi',
    subtitle: 'Ajustez et progressez',
    duration: '1h',
    price: 'CHF 119',
    description:
      'Votre corps évolue, votre plan aussi. Ensemble, nous analysons ce qui fonctionne et ajustons pour maintenir vos progrès sans effort.',
    features: [
      'On garde ce qui marche, on ajuste ce qui coince',
      'De nouvelles stratégies selon vos besoins du moment',
      'Un accompagnement qui s’intègre naturellement',
      'Pour des résultats qui durent, sans y penser',
    ],
    cta: { label: 'Réserver mon suivi', href: '/connexion' },
    note: '*Réservé aux patients ayant effectué une consultation découverte.',
  },
];

export function PrestationsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  const showContent = !isFirstVisit || isInView;
  const getHidden = (yOffset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${yOffset}px)` };
  const getTransition = (delay: number) =>
    isFirstVisit && isInView
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  return (
    <section
      ref={ref}
      id='prestations'
      style={{
        background: 'var(--ns-cream-100)',
        paddingTop: 140,
        paddingBottom: 96,
      }}
    >
      <div className='ns2-container'>
        {/* Header */}
        <motion.div
          style={{ marginBottom: 64, ...getHidden(20) }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          <div className='ns2-eyebrow ns2-eyebrow-dot'>Nos tarifs</div>
          <h1
            className='ns2-display'
            style={{
              fontSize: 'clamp(40px, 6vw, 72px)',
              marginTop: 18,
              color: 'var(--ns-ink)',
              maxWidth: 920,
            }}
          >
            Un accompagnement <span className='ns2-hl'>sur mesure</span>,
            <br />
            <em>pas un catalogue</em>.
          </h1>
          <p className='ns2-body-lg' style={{ marginTop: 20, maxWidth: 720 }}>
            Chaque consultation est pensée pour répondre à vos besoins
            spécifiques, que vous débutiez votre parcours ou que vous souhaitiez
            approfondir votre démarche.
          </p>
        </motion.div>

        {/* Cards */}
        <div className='pricing-grid'>
          {PLANS.map((plan, index) => (
            <motion.article
              key={plan.title}
              className='ns2-card'
              style={{
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                ...getHidden(40),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
              }
              transition={getTransition(0.1 + index * 0.12)}
            >
              {/* Tag + duration */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <span className={`ns2-tag ns2-tag-${plan.tagVariant}`}>
                  {plan.tag}
                </span>
                <span
                  className='ns2-meta'
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--ns-ink-3)',
                  }}
                >
                  <Clock className='w-3.5 h-3.5' />
                  {plan.duration}
                </span>
              </div>

              {/* Title */}
              <h2
                className='ns2-display'
                style={{
                  fontSize: 32,
                  color: 'var(--ns-ink)',
                  lineHeight: 1.05,
                }}
              >
                {plan.title}
              </h2>

              {/* Subtitle */}
              <p
                className='ns2-body'
                style={{
                  fontStyle: 'italic',
                  fontFamily: 'var(--ns-font-serif-stack)',
                  fontSize: 18,
                  color: 'var(--ns-ink)',
                  lineHeight: 1.4,
                }}
              >
                {plan.subtitle}
              </p>

              {/* Price block */}
              <div
                style={{
                  paddingTop: 12,
                  paddingBottom: 12,
                  borderTop: '1.5px solid var(--ns-ink)',
                  borderBottom: '1.5px solid var(--ns-ink)',
                }}
              >
                <div
                  className='ns2-display'
                  style={{
                    fontSize: 56,
                    fontStyle: 'italic',
                    color: 'var(--ns-ink)',
                    lineHeight: 1,
                  }}
                >
                  {plan.price}
                </div>
              </div>

              {/* Description */}
              <p className='ns2-body'>{plan.description}</p>

              {/* Features */}
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  marginTop: 4,
                  flex: 1,
                }}
              >
                {plan.features.map(item => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      fontFamily: 'var(--ns-font-sans-stack)',
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: 'var(--ns-fg-muted)',
                    }}
                  >
                    <span
                      aria-hidden='true'
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
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div style={{ marginTop: 8 }}>
                <Link
                  href={plan.cta.href}
                  className='ns2-btn ns2-btn-peps'
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {plan.cta.label}
                  <ArrowRight className='w-4 h-4' />
                </Link>
              </div>

              {/* Note */}
              {plan.note && (
                <p
                  className='ns2-meta'
                  style={{
                    fontStyle: 'italic',
                    color: 'var(--ns-ink-3)',
                    marginTop: 4,
                  }}
                >
                  {plan.note}
                </p>
              )}
            </motion.article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          max-width: 980px;
          margin: 0 auto;
        }
        @media (max-width: 1024px) {
          .pricing-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </section>
  );
}
