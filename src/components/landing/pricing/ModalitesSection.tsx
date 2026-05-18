'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Modalités pratiques — page Prix, DS v2.
 * Dark ink section. Two-column layout: accordion (cream typography + peps
 * toggle) on the left, sticky framed photo on the right that swaps with the
 * open item. Images collapse inside the accordion panel on tablet/mobile.
 */

interface ModaliteItem {
  id: number;
  title: string;
  image: string;
  body: React.ReactNode;
}

const MODALITES: ModaliteItem[] = [
  {
    id: 1,
    title: 'Comment régler ma consultation ?',
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=1100&fit=crop&q=80',
    body: (
      <>
        <p className='ns2-body-lg' style={{ marginBottom: 14 }}>
          Trois moyens de paiement, simples et sécurisés.
        </p>
        <ul className='modalite-list'>
          <li>Carte bancaire (Visa, Mastercard)</li>
          <li>Virement bancaire (IBAN fourni après réservation)</li>
          <li>Twint</li>
        </ul>
        <p className='ns2-body' style={{ marginTop: 16 }}>
          Le paiement s’effectue au moment de la réservation. Vous recevez
          automatiquement un reçu détaillé pour votre assurance complémentaire.
        </p>
      </>
    ),
  },
  {
    id: 2,
    title: 'Puis-je annuler ou reporter ?',
    image:
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=900&h=1100&fit=crop&q=80',
    body: (
      <>
        <p className='ns2-body-lg' style={{ marginBottom: 18 }}>
          Oui — les imprévus arrivent, on s’adapte.
        </p>

        <div className='modalite-block'>
          <h4 className='modalite-h4'>Annulation ou report gratuit</h4>
          <ul className='modalite-list'>
            <li>Jusqu’à 48h avant votre rendez-vous</li>
            <li>Par email ou directement sur la plateforme</li>
          </ul>
        </div>

        <div className='modalite-block'>
          <h4 className='modalite-h4'>Annulation tardive (moins de 48h)</h4>
          <ul className='modalite-list'>
            <li>La consultation est facturée</li>
            <li>Exception faite en cas d’urgence médicale avec justificatif</li>
          </ul>
        </div>

        <div className='modalite-block'>
          <h4 className='modalite-h4'>En cas d’empêchement de notre part</h4>
          <ul className='modalite-list'>
            <li>Nous vous prévenons dès que possible</li>
            <li>
              Replanification selon vos disponibilités, sans frais
              supplémentaires
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: 3,
    title: 'Une question ?',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=1100&fit=crop&q=80',
    body: (
      <>
        <p className='ns2-body-lg' style={{ marginBottom: 18 }}>
          N’hésitez pas à nous contacter — nous sommes là pour vous accompagner.
        </p>
        <Link href='/contact' className='ns2-btn ns2-btn-peps ns2-btn-sm'>
          Contactez-nous
          <ArrowRight className='w-4 h-4' />
        </Link>
      </>
    ),
  },
];

export function ModalitesSection() {
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

  const [openId, setOpenId] = useState<number | null>(MODALITES[0].id);
  const [activeImage, setActiveImage] = useState(MODALITES[0].image);

  const handleToggle = (id: number) => {
    if (openId === id) {
      setOpenId(null);
    } else {
      setOpenId(id);
      const m = MODALITES.find(x => x.id === id);
      if (m) setActiveImage(m.image);
    }
  };

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--ns-ink)',
        color: 'var(--ns-cream-100)',
        paddingTop: 96,
        paddingBottom: 96,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className='ns2-container'>
        {/* Header */}
        <motion.div
          style={{ marginBottom: 64, ...getHidden(20) }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          <div
            className='ns2-eyebrow ns2-eyebrow-dot'
            style={{ color: 'var(--ns-cream-100)' }}
          >
            Modalités pratiques
          </div>
          <h2
            className='ns2-display'
            style={{
              fontSize: 'clamp(32px, 4.4vw, 56px)',
              marginTop: 18,
              color: 'var(--ns-cream-100)',
              maxWidth: 880,
            }}
          >
            Tout ce que vous devez{' '}
            <span className='ns2-hl' style={{ color: 'var(--ns-cream-100)' }}>
              savoir
            </span>
            .
          </h2>
        </motion.div>

        {/* Layout */}
        <div className='modalites-layout'>
          {/* Left — accordion */}
          <div>
            {MODALITES.map((m, index) => {
              const isOpen = openId === m.id;
              return (
                <motion.div
                  key={m.id}
                  style={{
                    borderBottom:
                      index === MODALITES.length - 1
                        ? 'none'
                        : '1.5px solid rgba(250, 246, 234, 0.18)',
                    ...getHidden(20),
                  }}
                  animate={
                    showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={getTransition(0.1 + index * 0.08)}
                >
                  <button
                    type='button'
                    onClick={() => handleToggle(m.id)}
                    aria-expanded={isOpen}
                    aria-controls={`modalite-${m.id}`}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 24,
                      padding: '24px 0',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--ns-cream-100)',
                      fontFamily: 'var(--ns-font-serif-stack)',
                      fontSize: 'clamp(20px, 2.4vw, 28px)',
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15,
                    }}
                  >
                    <span>{m.title}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        flexShrink: 0,
                        width: 36,
                        height: 36,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isOpen ? 'var(--ns-peps)' : 'transparent',
                        border: '1.5px solid var(--ns-cream-100)',
                        borderColor: isOpen
                          ? 'var(--ns-peps)'
                          : 'var(--ns-cream-100)',
                        borderRadius: 999,
                        color: isOpen ? 'var(--ns-ink)' : 'var(--ns-cream-100)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <ChevronDown className='w-4 h-4' strokeWidth={2.2} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`modalite-${m.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{ paddingBottom: 28, maxWidth: 580 }}
                          className='modalite-content'
                        >
                          {m.body}

                          {/* Mobile image (desktop image is sticky to the right) */}
                          <div
                            className='modalites-mobile-image'
                            style={{ marginTop: 24 }}
                          >
                            <div
                              style={{
                                border:
                                  'var(--ns-bw) solid var(--ns-cream-100)',
                                borderRadius: 'var(--ns-r-md)',
                                overflow: 'hidden',
                                boxShadow: '6px 6px 0 var(--ns-peps)',
                              }}
                            >
                              <img
                                src={m.image}
                                alt={m.title}
                                style={{
                                  width: '100%',
                                  height: 240,
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Right — sticky desktop image */}
          <div className='modalites-desktop-image'>
            <div
              style={{
                border: 'var(--ns-bw) solid var(--ns-cream-100)',
                borderRadius: 'var(--ns-r-md)',
                overflow: 'hidden',
                boxShadow: '6px 6px 0 var(--ns-peps)',
                aspectRatio: '4 / 5',
                position: 'relative',
              }}
            >
              <AnimatePresence mode='wait'>
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt='Illustration de la modalité active'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </AnimatePresence>
            </div>
            <div style={{ position: 'absolute', top: -14, right: -14 }}>
              <span
                className='ns2-sticker'
                style={{ transform: 'rotate(4deg)' }}
              >
                Pratique ↘
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modalites-layout {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 64px;
          align-items: start;
          position: relative;
        }
        .modalites-desktop-image {
          position: sticky;
          top: 100px;
        }
        .modalites-mobile-image {
          display: none;
        }
        @media (max-width: 1024px) {
          .modalites-layout {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .modalites-desktop-image {
            display: none;
          }
          .modalites-mobile-image {
            display: block;
          }
        }
      `}</style>

      <style jsx global>{`
        .modalite-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .modalite-list li {
          position: relative;
          padding-left: 22px;
          font-family: var(--ns-font-sans-stack);
          font-size: 15px;
          line-height: 1.6;
          color: rgba(250, 246, 234, 0.85);
        }
        .modalite-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 9px;
          width: 8px;
          height: 8px;
          background: var(--ns-peps);
          border-radius: 999px;
          border: 1.5px solid var(--ns-cream-100);
        }
        .modalite-block {
          margin-bottom: 18px;
        }
        .modalite-block:last-child {
          margin-bottom: 0;
        }
        .modalite-h4 {
          font-family: var(--ns-font-sans-stack);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ns-peps);
          margin: 0 0 10px;
        }
        .modalite-content .ns2-body-lg {
          color: rgba(250, 246, 234, 0.9);
        }
        .modalite-content .ns2-body {
          color: rgba(250, 246, 234, 0.75);
        }
      `}</style>
    </section>
  );
}
