'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, FileText, Smartphone, Lock, Check } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Bonus — Plateforme (DS v2 Editorial)
 *
 * 4 cartes "fonctionnalités bonus" avec icônes peps,
 * tags sage, et bullet checks lime sur fond cream-100.
 */
export function PlatformBonusSection() {
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

  const bonusFeatures = [
    {
      id: 1,
      icon: Calendar,
      title: 'Rappels intelligents',
      tag: 'Quotidien',
      tagVariant: 'sage' as const,
      description:
        'Notifications personnalisées pour vos repas, suppléments et consultations. Désactivables en un clic.',
      features: [
        'Rappels de repas personnalisés',
        'Notifications de suppléments',
        'Rappels de consultations',
        'Alertes de progrès',
      ],
    },
    {
      id: 2,
      icon: FileText,
      title: 'Rapports détaillés',
      tag: 'Suivi',
      tagVariant: 'peps' as const,
      description:
        'Analyses détaillées de vos progrès, avec graphiques clairs et points clés à retenir.',
      features: [
        'Graphiques de progression',
        'Analyses nutritionnelles',
        "Rapports d'activité",
        'Export PDF',
      ],
    },
    {
      id: 3,
      icon: Smartphone,
      title: 'Mode hors-ligne',
      tag: 'Mobilité',
      tagVariant: 'coral' as const,
      description:
        "Tout reste accessible, même sans connexion. (Idéal pour le train, l'avion, ou les zones blanches.)",
      features: [
        'Consultation hors-ligne',
        'Recettes sauvegardées',
        'Plans nutritionnels',
        'Synchronisation auto',
      ],
    },
    {
      id: 4,
      icon: Lock,
      title: 'Sécurité avancée',
      tag: 'Confiance',
      tagVariant: 'dark' as const,
      description:
        'Chiffrement de niveau bancaire pour protéger vos informations. Hébergement en Suisse.',
      features: [
        'Chiffrement SSL/TLS',
        'Authentification 2FA',
        'Sauvegarde sécurisée',
        'Conformité RGPD',
      ],
    },
  ];

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--ns-cream-100)',
        padding: '112px 0',
        borderBottom: '1.5px solid var(--ns-ink)',
      }}
    >
      <div className='ns2-container'>
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 64,
            alignItems: 'end',
            marginBottom: 64,
          }}
          className='bonus-header'
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
              Inclus dans toutes les consultations
            </motion.div>
            <motion.h2
              className='ns2-display'
              style={{
                fontSize: 'clamp(36px, 5vw, 60px)',
                marginBottom: 0,
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.05)}
            >
              Et quelques bonus
              <br />
              <em>discrets</em> mais <span className='ns2-hl'>essentiels</span>.
            </motion.h2>
          </div>
          <motion.p
            className='ns2-body-lg'
            style={{ ...getHidden(20) }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.1)}
          >
            Pas de pack premium, pas d&apos;option payante. Ces outils sont
            automatiquement inclus dès votre inscription.
          </motion.p>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
          }}
          className='bonus-grid'
        >
          {bonusFeatures.map((feature, index) => (
            <motion.article
              key={feature.id}
              className='ns2-card'
              style={{
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                ...getHidden(30),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={getTransition(0.15 + index * 0.08)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    background: 'var(--ns-peps-soft)',
                    border: '1.5px solid var(--ns-ink)',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <feature.icon
                    style={{ width: 24, height: 24, color: 'var(--ns-ink)' }}
                    strokeWidth={1.75}
                  />
                </div>
                <span className={`ns2-tag ns2-tag-${feature.tagVariant}`}>
                  {feature.tag}
                </span>
              </div>

              <h3
                className='ns2-display'
                style={{ fontSize: 22, lineHeight: 1.2, margin: 0 }}
              >
                {feature.title}
              </h3>

              <p className='ns2-body' style={{ margin: 0 }}>
                {feature.description}
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginTop: 'auto',
                  borderTop: '1.5px solid var(--ns-ink)',
                  paddingTop: 16,
                }}
              >
                {feature.features.map(item => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      fontSize: 13,
                      lineHeight: '20px',
                      color: 'var(--ns-ink-2)',
                      fontFamily: 'var(--ns-font-sans-stack)',
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
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
                        style={{ width: 9, height: 9, color: 'var(--ns-ink)' }}
                        strokeWidth={3}
                      />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .bonus-header {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            align-items: start !important;
          }
          .bonus-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .bonus-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
