'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Smartphone, Monitor, RefreshCw, Check, Layers } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Multi-Device pour la page Plateforme - Style Guide NutriSensia
 *
 * Design conforme au Style Guide :
 * - Typographie : Marcellus (serif) pour titres + Plus Jakarta Sans pour body
 * - Couleurs : #3f6655 (vert principal), #41556b (texte body), #f8f7ef (background)
 * - Shadow signature : 8px 8px 0 #d7e1ce
 * - Animations style Apple à l'entrée
 */
export function PlatformMultiDeviceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  const columnsData = [
    {
      id: 1,
      icon: Smartphone,
      title: 'Application Mobile',
      subtitle: 'Votre coach dans votre poche',
      description:
        'Accès complet à toutes les fonctionnalités depuis votre smartphone. Interface optimisée pour les gestes tactiles.',
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
      title: 'Version Web Complète',
      subtitle: 'Toute la puissance sur grand écran',
      description:
        "Interface desktop complète pour une expérience optimale. Parfait pour la planification et l'analyse détaillée.",
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
      title: 'Synchronisation Temps Réel',
      subtitle: 'Toujours à jour, partout',
      description:
        'Vos données se synchronisent automatiquement entre tous vos appareils. Continuez où vous vous êtes arrêtée.',
      features: [
        'Synchronisation instantanée',
        'Sauvegarde automatique',
        'Historique complet préservé',
        'Sécurité des données garantie',
      ],
    },
  ];

  // Animation variants style Apple - conditionnels selon première visite
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

  const containerVariants = {
    hidden: isFirstVisit ? { opacity: 0 } : { opacity: 1 },
    visible: {
      opacity: 1,
      transition: shouldAnimate
        ? {
            staggerChildren: 0.15,
            delayChildren: 0.2,
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

  const illustrationVariants = {
    hidden: isFirstVisit
      ? {
          opacity: 0,
          scale: 0.8,
        }
      : { opacity: 1, scale: 1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: shouldAnimate
        ? {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.1,
          }
        : { duration: 0 },
    },
  };

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#FBF9F7' /* Warm Cream - Méditerranée */,
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
            marginBottom: '48px',
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
              border: '1px solid #E5DED6' /* Beige Sand */,
              borderRadius: '35px',
              padding: '8px 20px',
              marginBottom: '24px',
            }}
          >
            <Layers
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
              Multi-plateforme
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
            Accessible Partout, Synchronisé Partout
          </h2>
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '18px',
              lineHeight: '28px',
              color: '#41556b',
              maxWidth: '700px',
              margin: '0 auto',
            }}
            className='section-subtitle'
          >
            Votre plateforme NutriSensia vous suit sur tous vos appareils.
            Mobile, tablette, ordinateur : votre accompagnement nutritionnel n'a
            jamais de pause.
          </p>
        </motion.div>

        {/* Illustration - Device Stack */}
        <motion.div
          variants={illustrationVariants}
          initial='hidden'
          animate={showContent ? 'visible' : 'hidden'}
          style={{
            textAlign: 'center',
            marginBottom: '64px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '20px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '20px',
              padding: '24px 40px',
              boxShadow: '8px 8px 0 #E5DED6' /* Beige Sand */,
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={
                showContent
                  ? { scale: 1, rotate: 0 }
                  : { scale: 0, rotate: -180 }
              }
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                width: '64px',
                height: '64px',
                backgroundColor:
                  'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Smartphone
                style={{
                  width: '32px',
                  height: '32px',
                  color: '#1B998B' /* Turquoise Azur */,
                }}
                strokeWidth={1.5}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={
                showContent
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0 }
              }
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <RefreshCw
                style={{
                  width: '28px',
                  height: '28px',
                  color: '#4A9B7B',
                }}
                strokeWidth={2}
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={
                showContent
                  ? { scale: 1, rotate: 0 }
                  : { scale: 0, rotate: 180 }
              }
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{
                width: '64px',
                height: '64px',
                backgroundColor:
                  'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Monitor
                style={{
                  width: '32px',
                  height: '32px',
                  color: '#1B998B' /* Turquoise Azur */,
                }}
                strokeWidth={1.5}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Columns Grid */}
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate={showContent ? 'visible' : 'hidden'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}
          className='columns-grid'
        >
          {columnsData.map((column, index) => (
            <motion.div
              key={column.id}
              variants={cardVariants}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '20px',
                padding: '32px 28px',
                boxShadow: '8px 8px 0 #E5DED6' /* Beige Sand */,
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
                  delay: 0.4 + index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor:
                    'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <column.icon
                  style={{
                    width: '28px',
                    height: '28px',
                    color: '#1B998B' /* Turquoise Azur */,
                  }}
                  strokeWidth={1.5}
                />
              </motion.div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: '24px',
                  fontWeight: 700,
                  lineHeight: '32px',
                  color: '#1B998B' /* Turquoise Azur */,
                  marginBottom: '6px',
                }}
              >
                {column.title}
              </h3>

              {/* Subtitle */}
              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '15px',
                  lineHeight: '22px',
                  color: '#1B998B' /* Turquoise Azur */,
                  fontStyle: 'italic',
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #E5DED6' /* Beige Sand */,
                }}
              >
                {column.subtitle}
              </p>

              {/* Description */}
              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '15px',
                  lineHeight: '24px',
                  color: '#41556b',
                  marginBottom: '20px',
                }}
              >
                {column.description}
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
                  gap: '10px',
                }}
              >
                {column.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    variants={featureVariants}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={showContent ? { scale: 1 } : { scale: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.6 + index * 0.1 + featureIndex * 0.05,
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
                    <span
                      style={{
                        fontFamily:
                          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: '14px',
                        lineHeight: '22px',
                        color: '#41556b',
                      }}
                    >
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA Box */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={
            showContent
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 30, scale: 0.95 }
          }
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.7,
          }}
          style={{
            marginTop: '64px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
              borderRadius: '20px',
              padding: '40px 48px',
              border: '1px solid #E5DED6' /* Beige Sand */,
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            <h3
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '28px',
                fontWeight: 700,
                lineHeight: '36px',
                color: '#1B998B' /* Turquoise Azur */,
                marginBottom: '12px',
              }}
            >
              Commencez sur l'appareil de votre choix
            </h3>
            <p
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '16px',
                lineHeight: '26px',
                color: '#41556b',
                marginBottom: '28px',
              }}
            >
              Téléchargez l'application mobile ou accédez à la version web. Vos
              données seront automatiquement synchronisées.
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#ffffff',
                  background:
                    'linear-gradient(135deg, #1B998B 0%, #147569 100%)' /* Dégradé CTA */,
                  border: 'none',
                  borderRadius: '35px',
                  padding: '14px 32px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
                }}
              >
                Télécharger l'App
              </button>
              <button
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1B998B' /* Turquoise Azur */,
                  backgroundColor: 'transparent',
                  border: '2px solid #e5e5e5',
                  borderRadius: '35px',
                  padding: '12px 32px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                Accéder au Web
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .columns-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
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

        @media (max-width: 480px) {
          .section-title {
            font-size: 32px !important;
            line-height: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
