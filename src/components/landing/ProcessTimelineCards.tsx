'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Comment nous travaillons ensemble — DS v2.
 * Cream section with 3 .ns2-card cards (image top + content bottom). Each
 * card carries an angled peps sticker number, a colored duration tag, italic
 * tagline, and a peps-dot bullet list. Closes with a peps CTA.
 */

interface ProcessStep {
  number: string;
  title: string;
  duration: string;
  image: string;
  description: string;
}

const STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Consultation découverte',
    duration: '1h30 en visio',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&q=80',
    description:
      '1h30 pour comprendre votre vraie situation\nProgramme personnalisé livré sous 48-72 h — pas en deux secondes par une IA\nAccès immédiat à votre plateforme, jour et nuit\nMessagerie sécurisée, réponse sous 24 h\nVos premières actions, concrètes et tenables',
  },
  {
    number: '02',
    title: 'Suivi & ajustements',
    duration: '4 à 12 semaines',
    image:
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&q=80',
    description:
      'Une heure ensemble, toutes les 2 à 4 semaines, pour faire le point\nAjustements du plan en temps réel — la vraie vie ne suit jamais le plan parfaitement\nOn vous explique le « pourquoi », pas seulement le « quoi »\nSupport illimité entre les séances, réponse sous 24 h\nLes victoires se fêtent, les blocages se débloquent — ensemble',
  },
  {
    number: '03',
    title: 'Autonomie & résultats durables',
    duration: 'À vie',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80',
    description:
      "Vous savez lire les signaux de votre corps — et y répondre\nVous composez vos repas naturellement, sans calculatrice\nVous gérez les écarts et les dîners au resto sans culpabilité\nVos nouvelles habitudes sont devenues, simplement, vos habitudes\nVous n'avez plus besoin de nous. C'était l'objectif.",
  },
];

interface ProcessCardProps {
  step: ProcessStep;
  index: number;
  showContent: boolean;
  isFirstVisit: boolean;
  shouldAnimate: boolean;
}

function ProcessCard({
  step,
  index,
  showContent,
  isFirstVisit,
  shouldAnimate,
}: ProcessCardProps) {
  const getHidden = (yOffset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${yOffset}px)` };
  const getTransition = (delay: number) =>
    shouldAnimate
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  return (
    <motion.article
      className='ns2-card'
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        ...getHidden(40),
      }}
      animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={getTransition(index * 0.15)}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          borderBottom: 'var(--ns-bw) solid var(--ns-ink)',
          overflow: 'hidden',
        }}
      >
        <img
          src={step.image}
          alt={step.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      {/* Number sticker */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
        }}
      >
        <span
          className='ns2-sticker'
          style={{ transform: 'rotate(-4deg)', fontSize: 14 }}
        >
          {step.number}
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          flex: 1,
        }}
      >
        <span
          className={`ns2-tag ${
            index === 0
              ? 'ns2-tag-peps'
              : index === 1
                ? 'ns2-tag-coral'
                : 'ns2-tag-sage'
          }`}
          style={{ alignSelf: 'flex-start' }}
        >
          {step.duration}
        </span>

        <h3
          className='ns2-display'
          style={{
            fontSize: 24,
            color: 'var(--ns-ink)',
            lineHeight: 1.1,
          }}
        >
          {step.title}
        </h3>

        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginTop: 6,
          }}
        >
          {step.description.split('\n').map((line, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                fontFamily: 'var(--ns-font-sans-stack)',
                fontSize: 14,
                lineHeight: 1.55,
                color: 'var(--ns-fg-muted)',
              }}
            >
              <span
                aria-hidden='true'
                style={{
                  flexShrink: 0,
                  marginTop: 6,
                  width: 8,
                  height: 8,
                  background: 'var(--ns-peps-deep)',
                  borderRadius: 999,
                  border: '1.5px solid var(--ns-ink)',
                }}
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export default function ProcessTimelineCards() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
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
        background: 'var(--ns-cream-100)',
        paddingTop: 96,
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
          <div className='ns2-eyebrow ns2-eyebrow-dot'>Le parcours</div>
          <h2
            className='ns2-display'
            style={{
              fontSize: 'clamp(32px, 4.4vw, 56px)',
              marginTop: 18,
              color: 'var(--ns-ink)',
              maxWidth: 880,
            }}
          >
            Comment on travaille <span className='ns2-hl'>ensemble</span>,
            <br />
            <em>en trois temps</em>.
          </h2>
          <p className='ns2-body-lg' style={{ marginTop: 20, maxWidth: 700 }}>
            Un accompagnement progressif, conçu pour que les résultats tiennent
            — pas pour vous garder captive.
          </p>
        </motion.div>

        {/* Cards */}
        <div className='process-grid'>
          {STEPS.map((step, index) => (
            <ProcessCard
              key={step.number}
              step={step}
              index={index}
              showContent={showContent}
              isFirstVisit={isFirstVisit}
              shouldAnimate={shouldAnimate}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          style={{
            marginTop: 64,
            display: 'flex',
            justifyContent: 'center',
            ...getHidden(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.5)}
        >
          <Link
            href='/contact?type=consultation'
            className='ns2-btn ns2-btn-peps'
          >
            <Calendar className='w-4 h-4' />
            Réserver ma première consultation
            <ArrowRight className='w-4 h-4' />
          </Link>
        </motion.div>
      </div>

      <style jsx>{`
        .process-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .process-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </section>
  );
}
