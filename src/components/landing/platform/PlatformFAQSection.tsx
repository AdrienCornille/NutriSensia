'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section FAQ — Plateforme (DS v2 Editorial)
 *
 * Carte ink-bordée avec accordion : peps circle pour chevron actif,
 * fond cream-100, séparateurs ink.
 */
export function PlatformFAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { isFirstVisit } = useFirstVisit();

  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  const getHidden = (yOffset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${yOffset}px)` };

  const getTransition = (delay: number) =>
    shouldAnimate
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  const faqs = [
    {
      id: 1,
      question: 'Comment accéder à la plateforme ?',
      answer:
        "Après votre consultation découverte, vous recevez un email avec vos identifiants. Ensuite, deux options : l'application mobile (iOS ou Android) ou directement le web depuis votre navigateur. Rien à installer si vous préférez.",
    },
    {
      id: 2,
      question: 'Mes données sont-elles sécurisées ?',
      answer:
        'Oui. Chiffrement SSL/TLS, authentification à deux facteurs, hébergement en Suisse, conformité RGPD. Vos données vous appartiennent — elles ne sont ni revendues, ni partagées, ni utilisées pour entraîner une IA.',
    },
    {
      id: 3,
      question: 'Puis-je utiliser la plateforme hors ligne ?',
      answer:
        'Oui, pour la plupart des fonctionnalités. Plans de repas, recettes, journal alimentaire et listes de courses restent accessibles sans connexion. La synchronisation se fait automatiquement dès que vous retrouvez le réseau.',
    },
    {
      id: 4,
      question: "Que se passe-t-il si j'oublie mon mot de passe ?",
      answer:
        "Un lien de réinitialisation depuis l'écran de connexion, un email pour confirmer, et c'est reparti. Pas de support à appeler, pas de formulaire à remplir en cinq étapes.",
    },
    {
      id: 5,
      question: 'La plateforme fonctionne-t-elle sur tous les appareils ?',
      answer:
        "iPhone, Android, Mac, PC, tablette : oui. Tout ce qui a un navigateur récent ou accès aux stores d'applications. Si votre appareil est trop ancien pour ça, il est peut-être temps d'en changer — mais c'est un autre débat.",
    },
    {
      id: 6,
      question: 'Puis-je annuler mon abonnement à tout moment ?',
      answer:
        "Oui, à tout moment, sans frais. La plateforme est incluse tant que vous êtes accompagnée — pas d'engagement caché, pas de pénalité, pas de cases à décocher en cinq étapes.",
    },
  ];

  const toggle = (index: number) =>
    setOpenIndex(openIndex === index ? null : index);

  return (
    <section
      id='faq-plateforme'
      ref={ref}
      style={{
        background: 'var(--ns-cream-100)',
        padding: '112px 0',
      }}
    >
      <div className='ns2-container'>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr',
            gap: 80,
            alignItems: 'start',
          }}
          className='faq-grid'
        >
          {/* Header */}
          <div>
            <motion.div
              className='ns2-eyebrow ns2-eyebrow-dot'
              style={{ marginBottom: 16, ...getHidden(20) }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0)}
            >
              Vos questions
            </motion.div>
            <motion.h2
              className='ns2-display'
              style={{
                fontSize: 'clamp(36px, 5vw, 60px)',
                marginBottom: 18,
                ...getHidden(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.05)}
            >
              On répond à <em>tout</em>,
              <br />
              même aux <span className='ns2-hl'>petites</span>.
            </motion.h2>
            <motion.p
              className='ns2-body-lg'
              style={{ marginBottom: 24, ...getHidden(20) }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.1)}
            >
              Une question n&apos;est pas listée ? Écrivez-nous — on répond en
              moins de 48 h, par un humain, pas par un bot.
            </motion.p>
            <motion.a
              href='/faq'
              className='ns2-btn ns2-btn-outline'
              style={getHidden(20)}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.15)}
            >
              Voir toutes les questions →
            </motion.a>
          </div>

          {/* Accordion */}
          <motion.div
            style={{
              background: 'var(--ns-cream-50)',
              border: '1.5px solid var(--ns-ink)',
              borderRadius: 'var(--ns-r-lg)',
              boxShadow: 'var(--ns-shadow-hard)',
              overflow: 'hidden',
              ...getHidden(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.2)}
          >
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.id}
                  style={{
                    borderBottom:
                      index === faqs.length - 1
                        ? 'none'
                        : '1.5px solid var(--ns-ink)',
                  }}
                >
                  <button
                    type='button'
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-platform-answer-${faq.id}`}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 24,
                      padding: '22px 28px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'var(--ns-font-serif-stack)',
                      fontSize: 20,
                      fontWeight: 500,
                      color: 'var(--ns-ink)',
                      lineHeight: 1.3,
                    }}
                  >
                    <span>{faq.question}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.28 }}
                      style={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isOpen
                          ? 'var(--ns-peps)'
                          : 'var(--ns-cream-100)',
                        border: '1.5px solid var(--ns-ink)',
                        borderRadius: 999,
                        color: 'var(--ns-ink)',
                      }}
                    >
                      <ChevronDown className='w-4 h-4' strokeWidth={2.25} />
                    </motion.span>
                  </button>
                  <motion.div
                    id={`faq-platform-answer-${faq.id}`}
                    initial={false}
                    animate={{
                      height: isOpen ? 'auto' : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 28px 22px' }}>
                      <p
                        className='ns2-body'
                        style={{ margin: 0, lineHeight: 1.65 }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .faq-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  );
}
