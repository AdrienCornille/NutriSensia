'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Calendar,
  FileText,
  Smartphone,
  Lock,
  Check,
  Gift,
} from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Bonus pour la page Plateforme - Style Guide NutriSensia
 *
 * Design conforme au Style Guide :
 * - Typographie : Marcellus (serif) pour titres + Plus Jakarta Sans pour body
 * - Couleurs : #3f6655 (vert principal), #41556b (texte body), #f8f7ef (background)
 * - Shadow signature : 8px 8px 0 #d7e1ce
 * - Animations style Apple
 */
export function PlatformBonusSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  const bonusFeatures = [
    {
      id: 1,
      icon: Calendar,
      title: 'Rappels Intelligents',
      subtitle: 'Jamais oublier',
      description:
        'Notifications personnalisées pour vos repas, suppléments et consultations.',
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
      title: 'Rapports Détaillés',
      subtitle: 'Suivi complet',
      description:
        'Analyses approfondies de vos progrès avec graphiques et insights.',
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
      title: 'Mode Hors-Ligne',
      subtitle: 'Toujours accessible',
      description: 'Accédez à vos informations même sans connexion internet.',
      features: [
        'Consultation hors-ligne',
        'Recettes sauvegardées',
        'Plans nutritionnels',
        'Synchronisation automatique',
      ],
    },
    {
      id: 4,
      icon: Lock,
      title: 'Sécurité Avancée',
      subtitle: 'Données protégées',
      description:
        'Chiffrement de niveau bancaire pour protéger vos informations personnelles.',
      features: [
        'Chiffrement SSL/TLS',
        'Authentification 2FA',
        'Sauvegarde sécurisée',
        'Conformité RGPD',
      ],
    },
  ];

  // Animation variants style Apple - conditionnels selon première visite
  const containerVariants = {
    hidden: isFirstVisit ? { opacity: 0 } : { opacity: 1 },
    visible: {
      opacity: 1,
      transition: shouldAnimate
        ? {
            staggerChildren: 0.12,
            delayChildren: 0.2,
          }
        : { duration: 0 },
    },
  };

  const headerVariants = {
    hidden: isFirstVisit
      ? {
          opacity: 0,
          y: 40,
          filter: 'blur(10px)',
        }
      : { opacity: 1, y: 0, filter: 'blur(0px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: shouldAnimate
        ? {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }
        : { duration: 0 },
    },
  };

  const cardVariants = {
    hidden: isFirstVisit
      ? {
          opacity: 0,
          y: 60,
          scale: 0.9,
          filter: 'blur(8px)',
        }
      : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: shouldAnimate
        ? {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
          }
        : { duration: 0 },
    },
  };

  const featureVariants = {
    hidden: isFirstVisit ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 },
    visible: {
      opacity: 1,
      x: 0,
      transition: shouldAnimate
        ? {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }
        : { duration: 0 },
    },
  };

  const bottomNoteVariants = {
    hidden: isFirstVisit
      ? {
          opacity: 0,
          y: 30,
          scale: 0.95,
        }
      : { opacity: 1, y: 0, scale: 1 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: shouldAnimate
        ? {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.6,
          }
        : { duration: 0 },
    },
  };

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#E5DED6' /* Beige Sand - Méditerranée */,
        padding: '96px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        <motion.div
          variants={headerVariants}
          initial='hidden'
          animate={showContent ? 'visible' : 'hidden'}
          style={{
            textAlign: 'center',
            marginBottom: '64px',
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              showContent
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.8 }
            }
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
              border: '1px solid #E5DED6',
              borderRadius: '35px',
              padding: '8px 20px',
              marginBottom: '24px',
            }}
          >
            <Gift
              style={{
                width: '16px',
                height: '16px',
                color: '#1B998B' /* Turquoise Azur */,
              }}
            />
            <span
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#1B998B' /* Turquoise Azur */,
                letterSpacing: '0.5px',
              }}
            >
              Inclus pour toute consultation
            </span>
          </motion.div>

          <h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: '57.6px',
              color: '#1B998B' /* Turquoise Azur */,
              marginBottom: '16px',
            }}
            className='section-title'
          >
            Fonctionnalités Bonus
          </h2>
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '18px',
              lineHeight: '28px',
              color: '#41556b',
              maxWidth: '600px',
              margin: '0 auto',
            }}
            className='section-subtitle'
          >
            Des outils supplémentaires pour optimiser votre expérience et
            maximiser vos résultats.
          </p>
        </motion.div>

        {/* Bonus Features Grid */}
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate={showContent ? 'visible' : 'hidden'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
          }}
          className='bonus-grid'
        >
          {bonusFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              variants={cardVariants}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '16px',
                padding: '28px 24px',
                boxShadow: '6px 6px 0 #E5DED6' /* Beige Sand */,
              }}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={
                  showContent
                    ? { scale: 1, rotate: 0 }
                    : { scale: 0, rotate: -180 }
                }
                transition={{
                  duration: 0.5,
                  delay: 0.3 + index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor:
                    'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <feature.icon
                  style={{
                    width: '24px',
                    height: '24px',
                    color: '#1B998B' /* Turquoise Azur */,
                  }}
                  strokeWidth={1.5}
                />
              </motion.div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: '26px',
                  color: '#1B998B' /* Turquoise Azur */,
                  marginBottom: '4px',
                }}
              >
                {feature.title}
              </h3>

              {/* Subtitle */}
              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#1B998B' /* Turquoise Azur */,
                  fontStyle: 'italic',
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #E5DED6' /* Beige Sand */,
                }}
              >
                {feature.subtitle}
              </p>

              {/* Description */}
              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: '#41556b',
                  marginBottom: '16px',
                }}
              >
                {feature.description}
              </p>

              {/* Features List */}
              <motion.ul
                variants={containerVariants}
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {feature.features.map((item, itemIndex) => (
                  <motion.li
                    key={itemIndex}
                    variants={featureVariants}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={showContent ? { scale: 1 } : { scale: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.5 + index * 0.1 + itemIndex * 0.05,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      style={{
                        width: '16px',
                        height: '16px',
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
                          width: '9px',
                          height: '9px',
                          color: '#ffffff',
                        }}
                        strokeWidth={3}
                      />
                    </motion.div>
                    <span
                      style={{
                        fontFamily:
                          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: '13px',
                        lineHeight: '20px',
                        color: '#41556b',
                      }}
                    >
                      {item}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Note - Style "Idéal pour" */}
        <motion.div
          variants={bottomNoteVariants}
          initial='hidden'
          animate={showContent ? 'visible' : 'hidden'}
          style={{
            marginTop: '64px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
              borderRadius: '16px',
              padding: '32px 40px',
              border: '1px solid #E5DED6',
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            <h3
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '24px',
                fontWeight: 700,
                lineHeight: '32px',
                color: '#1B998B' /* Turquoise Azur */,
                marginBottom: '12px',
              }}
            >
              Toutes ces fonctionnalités sont incluses
            </h3>
            <p
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '16px',
                lineHeight: '26px',
                color: '#41556b',
                margin: 0,
              }}
            >
              Aucun supplément à payer. Ces outils bonus sont automatiquement
              disponibles dès votre inscription à la plateforme.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .bonus-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 36px !important;
            line-height: 44px !important;
          }

          .section-subtitle {
            font-size: 16px !important;
            line-height: 24px !important;
          }
        }

        @media (max-width: 640px) {
          .bonus-grid {
            grid-template-columns: 1fr !important;
          }

          .section-title {
            font-size: 32px !important;
            line-height: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
