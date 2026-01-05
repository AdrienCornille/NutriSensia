'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Hero - La Plateforme NutriSensia
 *
 * Design simplifié conforme au NutriSensia Style Guide :
 * - Layout 2 colonnes : Texte à gauche, Stack d'appareils à droite
 * - Typographie : Marcellus (serif) pour titres + Plus Jakarta Sans pour body
 * - Couleurs du Style Guide
 * - Stack d'appareils : Desktop, Tablet (iPad), Mobile (iPhone)
 */
export function PlatformHeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Style initial : cacher seulement si première visite
  const getHiddenStyle = (yOffset: number, xOffset: number = 0) => {
    if (!isFirstVisit) {
      return {};
    }
    return {
      opacity: 0,
      transform: `translateY(${yOffset}px) translateX(${xOffset}px)`,
    };
  };

  // Transition : animation seulement si première visite et en vue
  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  const handleCTAClick = () => {
    const freeTrialSection = document.getElementById('free-trial');
    if (freeTrialSection) {
      freeTrialSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/essai-gratuit';
    }
  };

  return (
    <section
      ref={ref}
      id='platform-hero'
      className='platform-hero-section'
      style={{
        backgroundColor: '#FBF9F7' /* Warm Cream - Méditerranée */,
        padding: '120px 0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
        }}
        className='hero-grid'
      >
        {/* ============================================ */}
        {/* COLONNE GAUCHE - CONTENU TEXTE              */}
        {/* ============================================ */}
        <div className='hero-content'>
          {/* Badge */}
          <motion.div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
              padding: '8px 16px',
              borderRadius: '35px',
              marginBottom: '24px',
              ...getHiddenStyle(10),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={getTransition(0.1)}
          >
            <Sparkles
              style={{ width: '16px', height: '16px', color: '#1B998B' }}
            />
            <span
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#1B998B' /* Turquoise Azur */,
              }}
            >
              Votre Coach Nutritionnel 24/7
            </span>
          </motion.div>

          {/* Titre H1 - Marcellus */}
          <motion.h1
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: '57.6px',
              color: '#1B998B' /* Turquoise Azur */,
              textAlign: 'left',
              marginBottom: '20px',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.2)}
            className='hero-title'
          >
            La Plateforme NutriSensia
          </motion.h1>

          {/* Sous-titre avec underline accent */}
          <motion.p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '20px',
              lineHeight: '28px',
              color: '#1B998B' /* Turquoise Azur */,
              borderBottom: '1px solid #E5DED6' /* Beige Sand */,
              paddingBottom: '20px',
              marginBottom: '20px',
              display: 'inline-block',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.35)}
            className='hero-subtitle'
          >
            Tous vos outils nutritionnels centralisés dans une interface moderne
            et intuitive.
          </motion.p>

          {/* Description */}
          <motion.p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '16px',
              lineHeight: '26px',
              color: '#41556b',
              marginBottom: '32px',
              maxWidth: '480px',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.5)}
            className='hero-description'
          >
            Parce que votre transformation mérite plus qu&apos;un simple PDF.
            Accédez à vos plans de repas, votre journal alimentaire, vos progrès
            et communiquez avec votre diététicienne — le tout au même endroit.
          </motion.p>

          {/* Bouton CTA */}
          <motion.div
            style={{
              marginBottom: '24px',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.65)}
          >
            <button
              className='hero-btn'
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                borderRadius: '35px',
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                background:
                  'linear-gradient(135deg, #1B998B 0%, #147569 100%)' /* Dégradé CTA */,
                color: '#ffffff',
                textDecoration: 'none',
              }}
              onClick={handleCTAClick}
              onMouseEnter={e => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
              }}
            >
              <Calendar style={{ width: '18px', height: '18px' }} />
              Découvrir Gratuitement
            </button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.8)}
            className='trust-indicators'
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#4A9B7B',
                  borderRadius: '50%',
                }}
              />
              <span
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '14px',
                  color: '#41556b',
                }}
              >
                Essai gratuit 7 jours
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#4A9B7B',
                  borderRadius: '50%',
                }}
              />
              <span
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '14px',
                  color: '#41556b',
                }}
              >
                Aucune carte bancaire
              </span>
            </div>
          </motion.div>
        </div>

        {/* ============================================ */}
        {/* COLONNE DROITE - STACK D'APPAREILS          */}
        {/* ============================================ */}
        <motion.div
          className='devices-stack'
          style={{
            position: 'relative',
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...getHiddenStyle(0, 40),
          }}
          animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={getTransition(0.3)}
        >
          {/* Desktop - MacBook */}
          <div
            className='device-desktop'
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '420px',
              zIndex: 1,
            }}
          >
            {/* Écran */}
            <div
              style={{
                backgroundColor: '#2c2c2c',
                borderRadius: '12px 12px 0 0',
                padding: '8px 8px 0 8px',
                border: '2px solid #1a1a1a',
              }}
            >
              {/* Caméra */}
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#3a3a3a',
                  borderRadius: '50%',
                  margin: '0 auto 6px',
                }}
              />
              {/* Contenu écran */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '4px 4px 0 0',
                  height: '240px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Header app */}
                <div
                  style={{
                    backgroundColor: '#1B998B' /* Turquoise Azur */,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#ffffff',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          color: '#1B998B',
                          fontSize: '10px',
                          fontWeight: 700,
                        }}
                      >
                        NS
                      </span>
                    </div>
                    <span
                      style={{
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      NutriSensia
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['Accueil', 'Plan repas', 'Progrès'].map(item => (
                      <span
                        key={item}
                        style={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '9px',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Contenu dashboard */}
                <div style={{ padding: '12px', flex: 1 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                    }}
                  >
                    {/* Widget 1 */}
                    <div
                      style={{
                        backgroundColor: 'rgba(27, 153, 139, 0.08)',
                        borderRadius: '6px',
                        padding: '10px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '8px',
                          color: '#1B998B',
                          fontWeight: 600,
                          marginBottom: '4px',
                        }}
                      >
                        Prochain RDV
                      </div>
                      <div style={{ fontSize: '7px', color: '#41556b' }}>
                        Mer. 16 oct • 14h30
                      </div>
                    </div>
                    {/* Widget 2 */}
                    <div
                      style={{
                        backgroundColor: '#e5e8e0',
                        borderRadius: '6px',
                        padding: '10px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '8px',
                          color: '#1B998B',
                          fontWeight: 600,
                          marginBottom: '4px',
                        }}
                      >
                        Objectif semaine
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '2px',
                          marginTop: '4px',
                        }}
                      >
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            style={{
                              width: '12px',
                              height: '4px',
                              backgroundColor: i <= 3 ? '#4A9B7B' : '#b2c2bb',
                              borderRadius: '2px',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Plan repas */}
                  <div
                    style={{
                      marginTop: '8px',
                      backgroundColor: 'rgba(27, 153, 139, 0.08)',
                      borderRadius: '6px',
                      padding: '10px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '8px',
                        color: '#1B998B',
                        fontWeight: 600,
                        marginBottom: '6px',
                      }}
                    >
                      Plan du jour
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                      }}
                    >
                      {[
                        'Petit-déj: Porridge fruits',
                        'Déjeuner: Salade quinoa',
                        'Dîner: Saumon légumes',
                      ].map((meal, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <div
                            style={{
                              width: '4px',
                              height: '4px',
                              backgroundColor: '#4A9B7B',
                              borderRadius: '50%',
                            }}
                          />
                          <span style={{ fontSize: '7px', color: '#41556b' }}>
                            {meal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Base du MacBook */}
            <div
              style={{
                backgroundColor: '#e0e0e0',
                height: '12px',
                borderRadius: '0 0 4px 4px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '4px',
                  backgroundColor: '#c8c8c8',
                  borderRadius: '2px',
                }}
              />
            </div>
            {/* Support */}
            <div
              style={{
                backgroundColor: '#d0d0d0',
                height: '8px',
                width: '200px',
                margin: '0 auto',
                borderRadius: '0 0 8px 8px',
              }}
            />
          </div>

          {/* iPad - Tablet */}
          <div
            className='device-tablet'
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '60px',
              width: '180px',
              zIndex: 2,
              transform: 'rotate(5deg)',
            }}
          >
            <div
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                padding: '12px 8px',
                border: '3px solid #2c2c2c',
              }}
            >
              {/* Caméra iPad */}
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  backgroundColor: '#3a3a3a',
                  borderRadius: '50%',
                  margin: '0 auto 8px',
                }}
              />
              {/* Écran iPad */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  height: '220px',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    backgroundColor: '#1B998B' /* Turquoise Azur */,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: '#1B998B',
                        fontSize: '7px',
                        fontWeight: 700,
                      }}
                    >
                      NS
                    </span>
                  </div>
                  <span
                    style={{
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: 600,
                    }}
                  >
                    Mon Suivi
                  </span>
                </div>
                {/* Contenu */}
                <div style={{ padding: '10px' }}>
                  <div
                    style={{
                      backgroundColor: 'rgba(27, 153, 139, 0.08)',
                      borderRadius: '6px',
                      padding: '10px',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '8px',
                        color: '#1B998B',
                        fontWeight: 600,
                        marginBottom: '6px',
                      }}
                    >
                      Évolution poids
                    </div>
                    {/* Mini graphique */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'end',
                        gap: '4px',
                        height: '40px',
                      }}
                    >
                      {[60, 75, 65, 80, 70, 85, 90].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: `${h}%`,
                            backgroundColor: i === 6 ? '#3f6655' : '#b6ccae',
                            borderRadius: '2px',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#e5e8e0',
                      borderRadius: '6px',
                      padding: '10px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '8px',
                        color: '#1B998B',
                        fontWeight: 600,
                      }}
                    >
                      Énergie: Excellent
                    </div>
                    <div
                      style={{ display: 'flex', gap: '3px', marginTop: '6px' }}
                    >
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: i <= 4 ? '#4A9B7B' : '#b2c2bb',
                            borderRadius: '50%',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Bouton Home iPad */}
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #3a3a3a',
                  borderRadius: '50%',
                  margin: '8px auto 0',
                }}
              />
            </div>
          </div>

          {/* iPhone - Mobile */}
          <div
            className='device-mobile'
            style={{
              position: 'absolute',
              bottom: '60px',
              right: '0',
              width: '100px',
              zIndex: 3,
              transform: 'rotate(-5deg)',
            }}
          >
            <div
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '20px',
                padding: '8px 4px',
                border: '3px solid #2c2c2c',
              }}
            >
              {/* Notch iPhone */}
              <div
                style={{
                  width: '40px',
                  height: '12px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '0 0 10px 10px',
                  margin: '0 auto 4px',
                }}
              />
              {/* Écran iPhone */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  height: '180px',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    backgroundColor: '#1B998B' /* Turquoise Azur */,
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: '#1B998B',
                        fontSize: '5px',
                        fontWeight: 700,
                      }}
                    >
                      NS
                    </span>
                  </div>
                </div>
                {/* Contenu */}
                <div style={{ padding: '8px' }}>
                  <div
                    style={{
                      backgroundColor: 'rgba(27, 153, 139, 0.08)',
                      borderRadius: '6px',
                      padding: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '6px',
                        color: '#1B998B',
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}
                    >
                      Aujourd&apos;hui
                    </div>
                    <div style={{ fontSize: '5px', color: '#41556b' }}>
                      3 repas planifiés
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#e5e8e0',
                      borderRadius: '6px',
                      padding: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '6px',
                        color: '#1B998B',
                        fontWeight: 600,
                      }}
                    >
                      Hydratation
                    </div>
                    <div
                      style={{ display: 'flex', gap: '2px', marginTop: '4px' }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div
                          key={i}
                          style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: i <= 5 ? '#4A9B7B' : '#b2c2bb',
                            borderRadius: '2px',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: 'rgba(27, 153, 139, 0.08)',
                      borderRadius: '6px',
                      padding: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '6px',
                        color: '#1B998B',
                        fontWeight: 600,
                      }}
                    >
                      Message
                    </div>
                    <div
                      style={{
                        fontSize: '5px',
                        color: '#41556b',
                        marginTop: '2px',
                      }}
                    >
                      1 nouveau
                    </div>
                  </div>
                </div>
              </div>
              {/* Barre Home iPhone */}
              <div
                style={{
                  width: '40px',
                  height: '4px',
                  backgroundColor: '#ffffff',
                  borderRadius: '2px',
                  margin: '6px auto 0',
                }}
              />
            </div>
          </div>

          {/* Élément décoratif */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '20px',
              width: '60px',
              height: '60px',
              backgroundColor: '#E5DED6' /* Beige Sand */,
              borderRadius: '50%',
              opacity: 0.5,
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '100px',
              left: '40px',
              width: '40px',
              height: '40px',
              backgroundColor: '#E5DED6' /* Beige Sand */,
              borderRadius: '50%',
              opacity: 0.6,
              zIndex: 0,
            }}
          />
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* RESPONSIVE STYLES                            */}
      {/* ============================================ */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            text-align: center !important;
          }

          .hero-content {
            order: 1;
          }

          .devices-stack {
            order: 2;
            height: 400px !important;
          }

          .hero-title {
            font-size: 42px !important;
            line-height: 50px !important;
            text-align: center !important;
          }

          .hero-subtitle {
            font-size: 18px !important;
            line-height: 26px !important;
            display: block !important;
            text-align: center !important;
          }

          .hero-description {
            max-width: 100% !important;
            text-align: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }

          .trust-indicators {
            justify-content: center !important;
          }

          .device-desktop {
            width: 350px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }

          .device-tablet {
            width: 150px !important;
            right: 10% !important;
            bottom: 0 !important;
          }

          .device-mobile {
            width: 85px !important;
            right: 5% !important;
            bottom: 40px !important;
          }
        }

        @media (max-width: 768px) {
          .platform-hero-section {
            padding: 100px 0 60px !important;
          }

          .hero-title {
            font-size: 32px !important;
            line-height: 40px !important;
          }

          .hero-subtitle {
            font-size: 16px !important;
            line-height: 24px !important;
          }

          .hero-description {
            font-size: 14px !important;
            line-height: 24px !important;
          }

          .devices-stack {
            height: 350px !important;
          }

          .device-desktop {
            width: 300px !important;
          }

          .device-tablet {
            width: 130px !important;
            right: 5% !important;
          }

          .device-mobile {
            width: 75px !important;
            right: 0 !important;
          }

          .hero-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 28px !important;
            line-height: 36px !important;
          }

          .hero-subtitle {
            font-size: 15px !important;
          }

          .devices-stack {
            height: 300px !important;
          }

          .device-desktop {
            width: 260px !important;
          }

          .device-tablet {
            width: 110px !important;
          }

          .device-mobile {
            width: 65px !important;
          }

          .trust-indicators {
            flex-direction: column !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}
