'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check } from 'lucide-react';
import Image from 'next/image';

interface FeatureItemProps {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  bullets?: string[];
  additionalText?: string;
  whyUseful: string;
  image: string;
  alt: string;
  isReversed?: boolean;
  index?: number;
}

/**
 * Composant Feature Item - Style Guide NutriSensia
 *
 * Design conforme au Style Guide :
 * - Carte englobante avec shadow signature (8px 8px 0 #d7e1ce)
 * - Typographie : Marcellus pour titres, Plus Jakarta Sans pour body
 * - Couleurs cohérentes
 * - Layout alternant image/texte à l'intérieur de la carte
 * - Animations style Apple avec effets sophistiqués
 */
export function FeatureItem({
  title,
  subtitle,
  description,
  bullets,
  additionalText,
  whyUseful,
  image,
  alt,
  isReversed = false,
  index = 0,
}: FeatureItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Animation variants style Apple - entrée spectaculaire
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 80,
      scale: 0.92,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.9,
        ease: [0.25, 0.46, 0.45, 0.94], // Apple-style easing
        delay: index * 0.1,
      },
    },
  };

  // Animation pour le contenu avec stagger
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3 + index * 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: isReversed ? -20 : 20,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // Animation pour l'image avec effet de reveal
  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 1.1,
      x: isReversed ? 40 : -40,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2 + index * 0.1,
      },
    },
  };

  // Animation pour les bullet points
  const bulletVariants = {
    hidden: {
      opacity: 0,
      x: -15,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <div
      ref={ref}
      style={{
        padding: '32px 24px',
        backgroundColor: '#f8f7ef',
        perspective: '1000px', // Pour les effets 3D subtils
      }}
    >
      {/* Carte principale englobante - Style Guide NutriSensia + Animations Apple */}
      <motion.div
        variants={cardVariants}
        initial='hidden'
        animate={isInView ? 'visible' : 'hidden'}
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '8px 8px 0 #d7e1ce',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'center',
          willChange: 'transform, opacity, filter',
        }}
        className='feature-card'
      >
        {/* Image Side avec animations style Apple */}
        <motion.div
          variants={imageVariants}
          style={{
            order: isReversed ? 2 : 1,
          }}
          className='feature-image-container'
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: '#f8f7ef',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <Image
              src={image}
              alt={alt}
              width={500}
              height={400}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Overlay gradient subtil style Apple */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, transparent 60%, rgba(63, 102, 85, 0.05) 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </motion.div>

        {/* Content Side avec animations staggerées */}
        <motion.div
          variants={contentVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          style={{
            order: isReversed ? 1 : 2,
          }}
          className='feature-content'
        >
          {/* Title - Marcellus */}
          <motion.h3
            variants={itemVariants}
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: '36px',
              color: '#3f6655',
              marginBottom: '8px',
            }}
            className='feature-title'
          >
            {title}
          </motion.h3>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '16px',
              lineHeight: '24px',
              color: '#3f6655',
              fontStyle: 'italic',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #b2c2bb',
            }}
            className='feature-subtitle'
          >
            {subtitle}
          </motion.p>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '15px',
              lineHeight: '24px',
              color: '#41556b',
              marginBottom: '12px',
            }}
            className='feature-description'
          >
            {description}
          </motion.p>

          {/* Bullets avec animation staggerée */}
          {bullets && bullets.length > 0 && (
            <motion.ul
              variants={contentVariants}
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 16px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {bullets.map((bullet, idx) => (
                <motion.li
                  key={idx}
                  variants={bulletVariants}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: '#41556b',
                  }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={
                      isInView
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0, rotate: -180 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + index * 0.1 + idx * 0.05,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: '#4A9B7B',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Check
                      style={{
                        width: '10px',
                        height: '10px',
                        color: '#ffffff',
                      }}
                      strokeWidth={3}
                    />
                  </motion.div>
                  <span>{bullet}</span>
                </motion.li>
              ))}
            </motion.ul>
          )}

          {/* Additional Text */}
          {additionalText && (
            <motion.p
              variants={itemVariants}
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '20px',
                color: '#41556b',
                marginBottom: '16px',
                fontStyle: 'italic',
              }}
            >
              {additionalText}
            </motion.p>
          )}

          {/* Why Useful Box - Style identique à "Idéal pour" */}
          <motion.div
            variants={itemVariants}
            style={{
              backgroundColor: '#b6ccae26',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #b6ccae',
            }}
          >
            <p
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#41556b',
                margin: 0,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: '#3f6655',
                }}
              >
                Pourquoi c&apos;est utile :
              </span>{' '}
              {whyUseful}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .feature-card {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            padding: 32px !important;
          }

          .feature-image-container {
            order: 1 !important;
          }

          .feature-content {
            order: 2 !important;
          }
        }

        @media (max-width: 768px) {
          .feature-card {
            padding: 24px !important;
            border-radius: 16px !important;
          }

          .feature-title {
            font-size: 24px !important;
            line-height: 32px !important;
          }

          .feature-subtitle {
            font-size: 15px !important;
            line-height: 22px !important;
          }

          .feature-description {
            font-size: 14px !important;
            line-height: 22px !important;
          }
        }

        @media (max-width: 480px) {
          .feature-card {
            padding: 20px !important;
            box-shadow: 6px 6px 0 #d7e1ce !important;
          }

          .feature-title {
            font-size: 22px !important;
            line-height: 28px !important;
          }

          .feature-subtitle {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
