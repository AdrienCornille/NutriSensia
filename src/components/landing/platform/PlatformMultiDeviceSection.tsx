'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Smartphone, Monitor, RefreshCw, Check } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Multi-Device — Plateforme (DS v2 Editorial)
 *
 * Trois cartes ink-bordées : mobile, web, sync. Illustration
 * centrale composée de tags reliés en accent peps.
 */
export function PlatformMultiDeviceSection() {
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

  const columnsData = [
    {
      id: 1,
      icon: Smartphone,
      title: 'Application mobile',
      tag: 'iOS · Android',
      tagVariant: 'peps' as const,
      description:
        'Toutes les fonctionnalités sur votre smartphone, conçues pour le pouce — pas pour la souris.',
      features: [
        'Notifications push personnalisées',
        'Scan de codes-barres en magasin',
        'Photos de repas instantanées',
        'Mode hors-ligne disponible',
      ],
    },
    {
      id: 2,
      icon: Monitor,
      title: 'Version web complète',
      tag: 'Tous navigateurs',
      tagVariant: 'sage' as const,
      description:
        "Un grand écran pour planifier, analyser, et tout voir d'un coup d'œil.",
      features: [
        'Tableaux de bord étendus',
        'Export de rapports PDF',
        'Gestion avancée des recettes',
        'Interface clavier optimisée',
      ],
    },
    {
      id: 3,
      icon: RefreshCw,
      title: 'Sync temps réel',
      tag: 'Toujours à jour',
      tagVariant: 'coral' as const,
      description:
        "Tout se synchronise automatiquement. Vous changez d'écran, pas de fil.",
      features: [
        'Synchronisation instantanée',
        'Sauvegarde automatique',
        'Historique complet préservé',
        'Sécurité des données garantie',
      ],
    },
  ];

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--ns-cream-200)',
        padding: '112px 0',
        borderBottom: '1.5px solid var(--ns-ink)',
      }}
    >
      <div className='ns2-container'>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          <motion.div
            className='ns2-eyebrow ns2-eyebrow-dot'
            style={{ marginBottom: 16, ...getHidden(20) }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0)}
          >
            Multi-plateforme
          </motion.div>
          <motion.h2
            className='ns2-display'
            style={{
              fontSize: 'clamp(36px, 5vw, 60px)',
              marginBottom: 18,
              maxWidth: 800,
              ...getHidden(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.05)}
          >
            Accessible <em>partout</em>,
            <br />
            synchronisé <em>partout</em>.
          </motion.h2>
          <motion.p
            className='ns2-body-lg'
            style={{ maxWidth: 640, ...getHidden(20) }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.1)}
          >
            Mobile, tablette, ordinateur — la nutrition vous suit. Pas
            l&apos;inverse.
          </motion.p>
        </div>

        {/* Editorial illustration */}
        <motion.div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 64,
            ...getHidden(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.2)}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 18,
              padding: '14px 22px',
              background: 'var(--ns-cream-50)',
              border: '1.5px solid var(--ns-ink)',
              borderRadius: 'var(--ns-r-pill)',
              boxShadow: 'var(--ns-shadow-hard)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                background: 'var(--ns-peps-soft)',
                border: '1.5px solid var(--ns-ink)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Smartphone
                style={{ width: 24, height: 24, color: 'var(--ns-ink)' }}
                strokeWidth={1.75}
              />
            </div>
            <RefreshCw
              style={{ width: 22, height: 22, color: 'var(--ns-peps-deep)' }}
              strokeWidth={2.25}
            />
            <div
              style={{
                width: 48,
                height: 48,
                background: 'var(--ns-peps-soft)',
                border: '1.5px solid var(--ns-ink)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Monitor
                style={{ width: 24, height: 24, color: 'var(--ns-ink)' }}
                strokeWidth={1.75}
              />
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28,
          }}
          className='multi-device-grid'
        >
          {columnsData.map((column, index) => (
            <motion.article
              key={column.id}
              className='ns2-card'
              style={{
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                ...getHidden(30),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={getTransition(0.25 + index * 0.1)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    background: 'var(--ns-cream-100)',
                    border: '1.5px solid var(--ns-ink)',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <column.icon
                    style={{ width: 28, height: 28, color: 'var(--ns-ink)' }}
                    strokeWidth={1.75}
                  />
                </div>
                <span className={`ns2-tag ns2-tag-${column.tagVariant}`}>
                  {column.tag}
                </span>
              </div>

              <h3
                className='ns2-display'
                style={{ fontSize: 26, lineHeight: 1.2, margin: 0 }}
              >
                {column.title}
              </h3>

              <p className='ns2-body' style={{ margin: 0 }}>
                {column.description}
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  borderTop: '1.5px solid var(--ns-ink)',
                  paddingTop: 18,
                  marginTop: 'auto',
                }}
              >
                {column.features.map(feature => (
                  <li
                    key={feature}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      fontSize: 14,
                      lineHeight: '22px',
                      color: 'var(--ns-ink-2)',
                      fontFamily: 'var(--ns-font-sans-stack)',
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        background: 'var(--ns-peps)',
                        border: '1.5px solid var(--ns-ink)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <Check
                        style={{
                          width: 10,
                          height: 10,
                          color: 'var(--ns-ink)',
                        }}
                        strokeWidth={3}
                      />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .multi-device-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
