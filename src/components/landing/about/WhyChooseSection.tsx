'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  GraduationCap,
  FlaskConical,
  ShieldCheck,
  Video,
  Heart,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Pourquoi Choisir NutriSensia (DS v2 Editorial)
 *
 * Section ink avec accents peps : eyebrow + display
 * en cream sur fond sombre, grille 6 raisons avec
 * icônes peps-soft, CTA peps signature.
 */
export function WhyChooseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  const getHidden = (yOffset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${yOffset}px)` };

  const getTransition = (delay: number) =>
    shouldAnimate
      ? { duration: 0.5, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  const reasons = [
    {
      icon: GraduationCap,
      title: 'Nutritionniste formée',
      text: 'Formation et expérience éprouvées au service de votre santé.',
    },
    {
      icon: FlaskConical,
      title: 'Approche scientifique',
      text: 'Recommandations fondées sur les connaissances actuelles en nutrition.',
    },
    {
      icon: ShieldCheck,
      title: 'Remboursement possible',
      text: 'Pris en charge par les assurances complémentaires en Suisse.',
    },
    {
      icon: Video,
      title: 'Consultations en ligne',
      text: 'Flexibles, pratiques, adaptées à votre emploi du temps.',
    },
    {
      icon: Heart,
      title: 'Suivi bienveillant',
      text: 'Accompagnement personnalisé sans jugement, à votre rythme.',
    },
    {
      icon: TrendingUp,
      title: 'Résultats durables',
      text: 'Des progrès mesurables qui tiennent dans le temps.',
    },
  ];

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--ns-ink)',
        color: 'var(--ns-cream-100)',
        padding: '120px 0',
        borderTop: '1.5px solid var(--ns-ink)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Marqueurs décoratifs peps */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '8%',
          right: '-60px',
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'var(--ns-peps)',
          opacity: 0.08,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '-40px',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'var(--ns-peps)',
          opacity: 0.06,
          pointerEvents: 'none',
        }}
      />

      <div
        className='ns2-container'
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 64,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <motion.div
            className='ns2-eyebrow ns2-eyebrow-dot'
            style={{
              marginBottom: 16,
              color: 'var(--ns-cream-100)',
              ...getHidden(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0)}
          >
            Pourquoi NutriSensia
          </motion.div>
          <motion.h2
            className='ns2-display'
            style={{
              fontSize: 'clamp(36px, 5vw, 60px)',
              marginBottom: 18,
              color: 'var(--ns-cream-100)',
              maxWidth: 800,
              ...getHidden(30),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={getTransition(0.05)}
          >
            L&apos;<em>excellence</em> nutritionnelle
            <br />à <span className='ns2-hl'>portée</span> de clic.
          </motion.h2>
          <motion.p
            className='ns2-body-lg'
            style={{
              maxWidth: 600,
              color: 'rgba(250, 246, 234, 0.75)',
              ...getHidden(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.1)}
          >
            Six raisons concrètes de nous confier votre accompagnement
            nutritionnel.
          </motion.p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}
          className='why-choose-grid'
        >
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              style={{
                background: 'var(--ns-cream-50)',
                border: '1.5px solid var(--ns-cream-50)',
                borderRadius: 'var(--ns-r-md)',
                padding: 24,
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                color: 'var(--ns-ink)',
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.2 + index * 0.06)}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  background: 'var(--ns-peps-soft)',
                  border: '1.5px solid var(--ns-ink)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <reason.icon
                  style={{ width: 22, height: 22, color: 'var(--ns-ink)' }}
                  strokeWidth={1.75}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  className='ns2-display'
                  style={{
                    fontSize: 18,
                    lineHeight: 1.25,
                    margin: 0,
                    marginBottom: 4,
                  }}
                >
                  {reason.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--ns-font-sans-stack)',
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: 'var(--ns-ink-2)',
                    margin: 0,
                  }}
                >
                  {reason.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 56,
            ...getHidden(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.7)}
        >
          <Link href='/contact' className='ns2-btn ns2-btn-peps'>
            Prendre rendez-vous
            <ArrowRight className='w-4 h-4' />
          </Link>
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .why-choose-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .why-choose-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export default WhyChooseSection;
