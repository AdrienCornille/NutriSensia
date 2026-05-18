'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Méthodes — page Approche, DS v2.
 * Dark ink section (signature). Two-column layout (1fr / 1fr): left accordion
 * with cream titles + peps toggle button, right framed image that swaps with
 * the open item. On tablet/mobile, the image collapses inside the accordion
 * panel.
 */

interface MethodItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

const METHODS: MethodItem[] = [
  {
    id: 1,
    title: 'La Micronutrition',
    description:
      "Votre corps a besoin de vitamines, minéraux et oligoéléments pour tourner rond. Quand il en manque, il vous le fait savoir : fatigue qui traîne, fringales, sommeil agité, humeur en dents de scie. On identifie les carences, on les comble d'abord par l'assiette — et seulement si nécessaire, par des compléments ciblés.",
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'La Nutrition Fonctionnelle',
    description:
      "On ne se contente pas de traiter les symptômes — on cherche d'où ils viennent. Pourquoi cette fatigue ? Pourquoi ces ballonnements après les repas ? La nutrition fonctionnelle remonte aux causes : digestion, microbiote, inflammation, métabolisme. Comprendre, pour agir au bon endroit.",
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 3,
    title: "La Gestion de l'Inflammation",
    description:
      "L'inflammation chronique, c'est le bruit de fond que beaucoup ressentent sans le nommer : douleurs articulaires, troubles digestifs, peau qui réagit, fatigue persistante. Certains aliments l'entretiennent, d'autres l'apaisent. On identifie les déclencheurs dans votre alimentation et on construit un plan qui calme le terrain.",
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 4,
    title: "L'Équilibre Hormonal",
    description:
      'Hormones thyroïdiennes, insuline, cortisol, œstrogènes, progestérone : un déséquilibre, et tout le corps suit. Prise de poids inexpliquée, cycles perturbés, fatigue, humeur instable. La nutrition agit directement sur cet équilibre — quand on sait quoi manger, quand, et pourquoi.',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&q=80',
  },
];

export function MethodsSection() {
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

  const [openId, setOpenId] = useState<number | null>(METHODS[0].id);
  const [activeImage, setActiveImage] = useState(METHODS[0].image);

  const handleToggle = (id: number) => {
    if (openId === id) {
      setOpenId(null);
    } else {
      setOpenId(id);
      const method = METHODS.find(m => m.id === id);
      if (method) setActiveImage(method.image);
    }
  };

  return (
    <section
      ref={ref}
      id='methods'
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
            Nos méthodes
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
            Quatre approches,{' '}
            <span className='ns2-hl' style={{ color: 'var(--ns-cream-100)' }}>
              une boussole
            </span>
            .
          </h2>
          <p
            className='ns2-body-lg'
            style={{
              marginTop: 20,
              maxWidth: 780,
              color: 'rgba(250, 246, 234, 0.75)',
            }}
          >
            On ne croit pas aux méthodes uniques pour des corps tous différents.
            On combine ce qui fonctionne, prouvé par la science et affiné par
            l&apos;expérience clinique, ajusté à votre situation.
          </p>
        </motion.div>

        {/* Accordion + image */}
        <div className='methods-layout'>
          {/* Left — accordion */}
          <div>
            {METHODS.map((method, index) => {
              const isOpen = openId === method.id;
              return (
                <motion.div
                  key={method.id}
                  style={{
                    borderBottom:
                      index === METHODS.length - 1
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
                    onClick={() => handleToggle(method.id)}
                    aria-expanded={isOpen}
                    aria-controls={`method-${method.id}`}
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
                    <span>{method.title}</span>
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
                        borderRadius: 999,
                        color: isOpen ? 'var(--ns-ink)' : 'var(--ns-cream-100)',
                        transition:
                          'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                        borderColor: isOpen
                          ? 'var(--ns-peps)'
                          : 'var(--ns-cream-100)',
                      }}
                    >
                      <ChevronDown className='w-4 h-4' strokeWidth={2.2} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`method-${method.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ paddingBottom: 24 }}>
                          <p
                            className='ns2-body-lg'
                            style={{
                              color: 'rgba(250, 246, 234, 0.85)',
                              maxWidth: 580,
                            }}
                          >
                            {method.description}
                          </p>

                          {/* Mobile image (desktop image is in the right column) */}
                          <div
                            className='methods-mobile-image'
                            style={{ marginTop: 20 }}
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
                                src={method.image}
                                alt={method.title}
                                style={{
                                  width: '100%',
                                  height: 260,
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

          {/* Right — desktop image (sticky) */}
          <div className='methods-desktop-image'>
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
                  alt='Méthode active'
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

            {/* Sticker */}
            <div
              style={{
                position: 'absolute',
                top: -14,
                right: -14,
              }}
            >
              <span
                className='ns2-sticker'
                style={{ transform: 'rotate(4deg)' }}
              >
                4 leviers →
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .methods-layout {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 64px;
          align-items: start;
          position: relative;
        }
        .methods-desktop-image {
          position: sticky;
          top: 100px;
        }
        .methods-mobile-image {
          display: none;
        }
        @media (max-width: 1024px) {
          .methods-layout {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .methods-desktop-image {
            display: none;
          }
          .methods-mobile-image {
            display: block;
          }
        }
      `}</style>
    </section>
  );
}

export default MethodsSection;
