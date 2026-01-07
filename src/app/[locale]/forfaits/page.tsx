'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

/**
 * Page Forfaits et Tarifs
 *
 * Cette page présente les différents forfaits disponibles sur la plateforme NutriSensia.
 * Elle est conçue pour être claire, attractive et faciliter la prise de décision des utilisateurs.
 * Accessible via l'URL /forfaits (avec support de l'internationalisation)
 */
export default function ForfaitsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Animation refs
  const { elementRef: prestationsRef, isInView: prestationsVisible } =
    useScrollAnimation();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Modalités accordion state and refs
  const modalitesRef = useRef(null);
  const modalitesInView = useInView(modalitesRef, {
    once: true,
    margin: '-100px',
  });
  const [openModalite, setOpenModalite] = useState<number | null>(null);

  // Remboursement banner ref
  const remboursementBannerRef = useRef(null);
  const remboursementBannerInView = useInView(remboursementBannerRef, {
    once: true,
    margin: '-50px',
  });

  const modalitesImages: Record<number, string> = {
    1: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80', // Paiement
    2: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop&q=80', // Annulation/Report
    3: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&q=80', // Contact
  };
  const [activeModaliteImage, setActiveModaliteImage] = useState(
    modalitesImages[1]
  );

  const handleToggleModalite = (id: number) => {
    if (openModalite === id) {
      setOpenModalite(null);
    } else {
      setOpenModalite(id);
      setActiveModaliteImage(modalitesImages[id]);
    }
  };

  const faqData = [
    {
      question:
        'Quelle est la différence entre nutritionniste et diététicien·ne ?',
      answer:
        "Les diététicien·ne·s HES peuvent être remboursé·e·s par l'assurance de base LAMal sur prescription médicale. En tant que nutritionniste, je vous accompagne via les assurances complémentaires, avec une approche axée sur la prévention, les habitudes durables et la compréhension de votre corps. Mon approche est complémentaire au suivi médical.",
    },
    {
      question: 'Comment se déroule une consultation en ligne ?',
      answer:
        "Très simplement ! Nous nous connectons par visioconférence depuis chez vous. Vous avez juste besoin d'un ordinateur, tablette ou smartphone avec connexion internet. C'est aussi efficace qu'en présentiel, avec le confort de rester chez vous.",
    },
    {
      question:
        'Dois-je préparer quelque chose avant ma première consultation ?',
      answer:
        "Non, rien d'obligatoire. Si vous le souhaitez, vous pouvez noter vos questions et préparer vos dernières analyses de sang si vous en avez. Mais l'essentiel, c'est de venir comme vous êtes !",
    },
    {
      question: 'Combien de temps entre chaque consultation ?',
      answer:
        'Cela dépend de vos objectifs et de votre rythme. En général, les consultations sont espacées de 2 à 4 semaines au début, puis progressivement plus espacées au fur et à mesure de votre autonomie.',
    },
    {
      question: 'Est-ce que ça va vraiment fonctionner pour moi ?',
      answer:
        "Si vous êtes prêt·e à faire de petits changements progressifs et à comprendre votre corps, oui ! Mon approche n'est pas basée sur la restriction mais sur l'écoute de vos besoins. Pas de régime miracle, juste ce qui fonctionne pour VOUS.",
    },
    {
      question: 'Allez-vous me faire suivre un régime strict ?',
      answer:
        'Absolument pas. Je ne crois pas aux régimes restrictifs qui ne fonctionnent jamais sur le long terme. Mon approche est basée sur de petites habitudes durables, adaptées à votre vie, vos goûts et votre rythme.',
    },
    {
      question: 'Combien de temps avant de voir des résultats ?',
      answer:
        'Les premiers changements (énergie, digestion, bien-être) se ressentent souvent dès les premières semaines. Les changements plus profonds (poids, analyses sanguines) demandent généralement 2-3 mois. Chaque personne est unique !',
    },
    {
      question:
        "Est-ce que c'est pour moi si je n'ai pas de problème de santé particulier ?",
      answer:
        "Oui ! Vous n'avez pas besoin d'être malade pour vouloir mieux comprendre votre corps et optimiser votre alimentation. Prévention, énergie, performances sportives, bien-être général : toutes les raisons sont bonnes.",
    },
    {
      question: 'Dois-je suivre plusieurs consultations ou une seule suffit ?',
      answer:
        "Une consultation découverte vous apporte déjà beaucoup de clarté et un plan d'action. Mais les meilleurs résultats viennent d'un suivi régulier pour ajuster, encourager et ancrer les changements. Je vous accompagne aussi longtemps que nécessaire.",
    },
    {
      question: 'Vous ne répondez pas à ma question ?',
      answer: 'Contactez-nous, nous vous répondrons avec plaisir !',
      hasContactLink: true,
    },
  ];

  return (
    <div className='min-h-screen'>
      {/* Header Marketing */}
      <MarketingHeader />

      {/* Section Hero - Nos Prestations */}
      <section
        ref={prestationsRef}
        style={{
          backgroundColor: '#ffffff',
          paddingTop: '120px',
          paddingBottom: '96px',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          {/* Header de section */}
          <motion.div
            style={{
              textAlign: 'center',
              marginBottom: '48px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={
              prestationsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Titre H2 */}
            <h2
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '42px',
                fontWeight: 700,
                lineHeight: '50.4px',
                color: '#1B998B',
                marginBottom: '24px',
              }}
            >
              Un Accompagnement Sur Mesure
            </h2>

            {/* Sous-titre */}
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
            >
              Chaque consultation est pensée pour répondre à vos besoins
              spécifiques, que vous débutiez votre parcours ou que vous
              souhaitiez approfondir votre démarche.
            </p>
          </motion.div>

          {/* Grid 2 cartes */}
          <div
            id='pricing-section'
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '32px',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            {/* Carte 1 - Consultation Découverte */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={
                prestationsVisible
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '40px 32px',
                border: '1px solid #e5e5e5',
                boxShadow: '6px 6px 0 #E5DED6',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Titre */}
              <h3
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: '28px',
                  fontWeight: 700,
                  lineHeight: '36px',
                  color: '#1B998B',
                  marginBottom: '8px',
                }}
              >
                Consultation Découverte
              </h3>

              {/* Sous-titre */}
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#1B998B',
                  marginBottom: '20px',
                }}
              >
                Arrêtez les régimes, comprenez votre corps
              </p>

              {/* Infos durée et prix - empilés verticalement */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#41556b'
                    strokeWidth='2'
                  >
                    <circle cx='12' cy='12' r='10' />
                    <polyline points='12,6 12,12 16,14' />
                  </svg>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '16px',
                      color: '#41556b',
                    }}
                  >
                    1h30
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#1B998B',
                  }}
                >
                  CHF 179
                </div>
              </div>

              {/* Description */}
              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '18px',
                  color: '#41556b',
                  lineHeight: '28px',
                  marginBottom: '24px',
                }}
              >
                Les régimes ne marchent pas parce qu'ils ignorent ce dont VOTRE
                corps a besoin. En 1h30, découvrez l'approche qui change tout :
                écouter votre biologie, pas les modes.
              </p>

              {/* Liste des avantages */}
              <div
                style={{
                  marginBottom: '24px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div>
                  {[
                    'Comprenez pourquoi vos tentatives précédentes ont échoué',
                    'Un plan basé sur la science, adapté à votre quotidien',
                    'De petites habitudes simples qui transforment tout',
                    'Sans restriction, sans culpabilité, sans révolution',
                  ].map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '14px',
                      }}
                    >
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(27, 153, 139, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <svg
                          width='12'
                          height='12'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#1B998B'
                          strokeWidth='3'
                        >
                          <polyline points='20,6 9,17 4,12' />
                        </svg>
                      </div>
                      <span
                        style={{
                          fontFamily:
                            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontSize: '16px',
                          color: '#41556b',
                          lineHeight: '24px',
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <a
                href='/inscription'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background:
                    'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
                  color: '#ffffff',
                  padding: '16px 32px',
                  borderRadius: '35px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '16px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 4px 14px rgba(27, 153, 139, 0.3)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 6px 20px rgba(27, 153, 139, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 14px rgba(27, 153, 139, 0.3)';
                }}
              >
                Réserver ma consultation
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                  />
                </svg>
              </a>
            </motion.div>

            {/* Carte 2 - Consultation de Suivi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={
                prestationsVisible
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '40px 32px',
                border: '1px solid #e5e5e5',
                boxShadow: '6px 6px 0 #E5DED6',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Titre */}
              <h3
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: '28px',
                  fontWeight: 700,
                  lineHeight: '36px',
                  color: '#1B998B',
                  marginBottom: '8px',
                }}
              >
                Consultation de Suivi
                <span
                  style={{
                    fontSize: '0.65em',
                    verticalAlign: 'top',
                    marginLeft: '2px',
                  }}
                >
                  *
                </span>
              </h3>

              {/* Sous-titre */}
              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#1B998B',
                  marginBottom: '20px',
                }}
              >
                Ajustez et progressez
              </p>

              {/* Infos durée et prix - empilés verticalement */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#41556b'
                    strokeWidth='2'
                  >
                    <circle cx='12' cy='12' r='10' />
                    <polyline points='12,6 12,12 16,14' />
                  </svg>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '16px',
                      color: '#41556b',
                    }}
                  >
                    1h
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#1B998B',
                  }}
                >
                  CHF 119
                </div>
              </div>

              {/* Description */}
              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '18px',
                  color: '#41556b',
                  lineHeight: '28px',
                  marginBottom: '24px',
                }}
              >
                Votre corps évolue, votre plan aussi. Ensemble, nous analysons
                ce qui fonctionne et ajustons pour maintenir vos progrès sans
                effort.
              </p>

              {/* Liste des avantages */}
              <div
                style={{
                  marginBottom: '24px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div>
                  {[
                    'On garde ce qui marche, on ajuste ce qui coince',
                    'De nouvelles stratégies selon vos besoins du moment',
                    "Un accompagnement qui s'intègre naturellement",
                    'Pour des résultats qui durent, sans y penser',
                  ].map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '14px',
                      }}
                    >
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(27, 153, 139, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <svg
                          width='12'
                          height='12'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#1B998B'
                          strokeWidth='3'
                        >
                          <polyline points='20,6 9,17 4,12' />
                        </svg>
                      </div>
                      <span
                        style={{
                          fontFamily:
                            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontSize: '16px',
                          color: '#41556b',
                          lineHeight: '24px',
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Note - positionnée en bas du conteneur flex */}
                <p
                  style={{
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '14px',
                    color: '#41556b',
                    fontStyle: 'italic',
                    marginTop: 'auto',
                    opacity: 0.7,
                  }}
                >
                  *Réservé aux patients ayant effectué une consultation
                  découverte
                </p>
              </div>

              {/* CTA Button */}
              <a
                href='/connexion'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  color: '#1B998B',
                  padding: '16px 32px',
                  borderRadius: '35px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '16px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '2px solid #1B998B',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(27, 153, 139, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Réserver mon suivi
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                  />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Banner Remboursement - Style CTABannerSection avec fond terracotta */}
      <section
        ref={remboursementBannerRef}
        style={{
          backgroundColor: '#E76F51',
          padding: '2rem 0',
        }}
      >
        <div className='container mx-auto max-w-[1200px] px-6'>
          <motion.div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '32px',
              flexWrap: 'wrap',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={
              remboursementBannerInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Texte */}
            <motion.span
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '18px',
                fontWeight: 600,
                color: '#ffffff',
                textAlign: 'center',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={
                remboursementBannerInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -20 }
              }
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            >
              Remboursement possible par les assurances complémentaires
            </motion.span>

            {/* Bouton CTA */}
            <motion.a
              href='/remboursement'
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '35px',
                padding: '14px 32px',
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#E76F51',
                textDecoration: 'none',
                textAlign: 'center',
                lineHeight: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={
                remboursementBannerInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: 20 }
              }
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              En savoir plus →
            </motion.a>
          </motion.div>
        </div>

        {/* Responsive Styles */}
        <style jsx>{`
          @media (max-width: 768px) {
            section > div > div {
              flex-direction: column !important;
              gap: 20px !important;
            }
          }
        `}</style>
      </section>

      {/* Section Modalités - Design Accordion */}
      <section
        ref={modalitesRef}
        style={{
          backgroundColor: '#ffffff',
          padding: '96px 0',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          {/* Header de section */}
          <motion.div
            style={{
              textAlign: 'center',
              marginBottom: '64px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={
              modalitesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Titre principal */}
            <h2
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '42px',
                fontWeight: 700,
                lineHeight: '50.4px',
                color: '#1B998B',
                marginBottom: '24px',
              }}
            >
              Modalités Pratiques
            </h2>

            {/* Sous-titre */}
            <p
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '18px',
                lineHeight: '28px',
                color: '#41556b',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              Tout ce que vous devez savoir
            </p>
          </motion.div>

          {/* Layout Accordéon + Image */}
          <div
            className='modalites-layout'
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px',
              alignItems: 'center',
            }}
          >
            {/* Colonne gauche - Accordéon */}
            <div>
              {/* Item 1: Comment Payer ? */}
              <motion.div
                style={{
                  borderBottom: '1px solid #b6ccae',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  modalitesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              >
                <button
                  onClick={() => handleToggleModalite(1)}
                  style={{
                    width: '100%',
                    padding: '24px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Marcellus', serif",
                      fontSize: '24px',
                      fontWeight: 700,
                      lineHeight: '32px',
                      color: '#1B998B',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Comment régler ma consultation ?
                  </h3>
                  <span
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '24px',
                      color: '#1B998B',
                      transition: 'transform 0.3s ease',
                      transform:
                        openModalite === 1 ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ∨
                  </span>
                </button>

                <AnimatePresence>
                  {openModalite === 1 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ paddingBottom: '24px' }}>
                        <h4
                          style={{
                            fontFamily:
                              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#1B998B',
                            marginBottom: '8px',
                          }}
                        >
                          Nous acceptons :
                        </h4>
                        <ul
                          style={{ marginBottom: '16px', paddingLeft: '20px' }}
                        >
                          <li
                            style={{
                              fontFamily: "'Plus Jakarta Sans'",
                              fontSize: '16px',
                              lineHeight: '26px',
                              color: '#41556b',
                              marginBottom: '4px',
                            }}
                          >
                            Carte bancaire (Visa, Mastercard)
                          </li>
                          <li
                            style={{
                              fontFamily: "'Plus Jakarta Sans'",
                              fontSize: '16px',
                              lineHeight: '26px',
                              color: '#41556b',
                              marginBottom: '4px',
                            }}
                          >
                            Virement bancaire (IBAN fourni après réservation)
                          </li>
                          <li
                            style={{
                              fontFamily: "'Plus Jakarta Sans'",
                              fontSize: '16px',
                              lineHeight: '26px',
                              color: '#41556b',
                            }}
                          >
                            Twint
                          </li>
                        </ul>

                        <p
                          style={{
                            fontFamily: "'Plus Jakarta Sans'",
                            fontSize: '16px',
                            lineHeight: '26px',
                            color: '#41556b',
                          }}
                        >
                          Le paiement s'effectue au moment de la réservation.
                          Vous recevez automatiquement un reçu détaillé pour
                          votre assurance complémentaire.
                        </p>

                        {/* Image mobile */}
                        <div
                          className='mobile-image-modalites'
                          style={{
                            display: 'none',
                            marginTop: '24px',
                          }}
                        >
                          <img
                            src={modalitesImages[1]}
                            alt='Paiement'
                            style={{
                              width: '100%',
                              height: '250px',
                              objectFit: 'cover',
                              borderRadius: '10px',
                              border: '1px solid #e5e5e5',
                              boxShadow: '8px 8px 0 #d7e1ce',
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Item 2: Annulation et Report */}
              <motion.div
                style={{
                  borderBottom: '1px solid #b6ccae',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  modalitesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              >
                <button
                  onClick={() => handleToggleModalite(2)}
                  style={{
                    width: '100%',
                    padding: '24px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Marcellus', serif",
                      fontSize: '24px',
                      fontWeight: 700,
                      lineHeight: '32px',
                      color: '#1B998B',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Puis-je annuler ou reporter ?
                  </h3>
                  <span
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '24px',
                      color: '#1B998B',
                      transition: 'transform 0.3s ease',
                      transform:
                        openModalite === 2 ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ∨
                  </span>
                </button>

                <AnimatePresence>
                  {openModalite === 2 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ paddingBottom: '24px' }}>
                        <p
                          style={{
                            fontFamily: "'Plus Jakarta Sans'",
                            fontSize: '16px',
                            lineHeight: '26px',
                            color: '#41556b',
                            marginBottom: '16px',
                          }}
                        >
                          Oui, nous comprenons que les imprévus arrivent.
                        </p>

                        <h4
                          style={{
                            fontFamily:
                              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#1B998B',
                            marginBottom: '8px',
                          }}
                        >
                          Annulation ou report gratuit :
                        </h4>
                        <ul
                          style={{ marginBottom: '16px', paddingLeft: '20px' }}
                        >
                          <li
                            style={{
                              fontFamily: "'Plus Jakarta Sans'",
                              fontSize: '16px',
                              lineHeight: '26px',
                              color: '#41556b',
                              marginBottom: '4px',
                            }}
                          >
                            Jusqu'à 48h avant votre rendez-vous
                          </li>
                          <li
                            style={{
                              fontFamily: "'Plus Jakarta Sans'",
                              fontSize: '16px',
                              lineHeight: '26px',
                              color: '#41556b',
                            }}
                          >
                            Par email ou directement sur la plateforme
                          </li>
                        </ul>

                        <h4
                          style={{
                            fontFamily:
                              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#1B998B',
                            marginBottom: '8px',
                          }}
                        >
                          Annulation tardive (moins de 48h) :
                        </h4>
                        <ul
                          style={{ marginBottom: '16px', paddingLeft: '20px' }}
                        >
                          <li
                            style={{
                              fontFamily: "'Plus Jakarta Sans'",
                              fontSize: '16px',
                              lineHeight: '26px',
                              color: '#41556b',
                              marginBottom: '4px',
                            }}
                          >
                            La consultation est facturée
                          </li>
                          <li
                            style={{
                              fontFamily: "'Plus Jakarta Sans'",
                              fontSize: '16px',
                              lineHeight: '26px',
                              color: '#41556b',
                            }}
                          >
                            Exception faite en cas d'urgence médicale avec
                            justificatif
                          </li>
                        </ul>

                        <h4
                          style={{
                            fontFamily:
                              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#1B998B',
                            marginBottom: '8px',
                          }}
                        >
                          En cas d'empêchement de ma part :
                        </h4>
                        <ul style={{ paddingLeft: '20px' }}>
                          <li
                            style={{
                              fontFamily: "'Plus Jakarta Sans'",
                              fontSize: '16px',
                              lineHeight: '26px',
                              color: '#41556b',
                              marginBottom: '4px',
                            }}
                          >
                            Je vous préviens dès que possible
                          </li>
                          <li
                            style={{
                              fontFamily: "'Plus Jakarta Sans'",
                              fontSize: '16px',
                              lineHeight: '26px',
                              color: '#41556b',
                            }}
                          >
                            Nous replanifions selon vos disponibilités, sans
                            frais
                          </li>
                        </ul>

                        {/* Image mobile */}
                        <div
                          className='mobile-image-modalites'
                          style={{
                            display: 'none',
                            marginTop: '24px',
                          }}
                        >
                          <img
                            src={modalitesImages[2]}
                            alt='Annulation et Report'
                            style={{
                              width: '100%',
                              height: '250px',
                              objectFit: 'cover',
                              borderRadius: '10px',
                              border: '1px solid #e5e5e5',
                              boxShadow: '8px 8px 0 #d7e1ce',
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Item 3: Une question ? */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  modalitesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              >
                <button
                  onClick={() => handleToggleModalite(3)}
                  style={{
                    width: '100%',
                    padding: '24px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Marcellus', serif",
                      fontSize: '24px',
                      fontWeight: 700,
                      lineHeight: '32px',
                      color: '#1B998B',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Une question ?
                  </h3>
                  <span
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '24px',
                      color: '#1B998B',
                      transition: 'transform 0.3s ease',
                      transform:
                        openModalite === 3 ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ∨
                  </span>
                </button>

                <AnimatePresence>
                  {openModalite === 3 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ paddingBottom: '24px' }}>
                        <p
                          style={{
                            fontFamily: "'Plus Jakarta Sans'",
                            fontSize: '16px',
                            lineHeight: '26px',
                            color: '#41556b',
                            marginBottom: '20px',
                          }}
                        >
                          N'hésitez pas à nous contacter, nous sommes là pour
                          vous accompagner.
                        </p>

                        <a
                          href='/contact'
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background:
                              'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
                            color: '#ffffff',
                            padding: '12px 24px',
                            borderRadius: '35px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '14px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition:
                              'transform 0.2s ease, box-shadow 0.2s ease',
                            boxShadow: '0 4px 14px rgba(27, 153, 139, 0.3)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform =
                              'translateY(-2px)';
                            e.currentTarget.style.boxShadow =
                              '0 6px 20px rgba(27, 153, 139, 0.4)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow =
                              '0 4px 14px rgba(27, 153, 139, 0.3)';
                          }}
                        >
                          Contactez-nous
                          <svg
                            width='14'
                            height='14'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='M17 8l4 4m0 0l-4 4m4-4H3'
                            />
                          </svg>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Colonne droite - Image (Desktop) */}
            <div
              className='desktop-image-modalites'
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.div
                style={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #e5e5e5',
                  boxShadow: '8px 8px 0 #d7e1ce',
                }}
              >
                <AnimatePresence mode='wait'>
                  <motion.img
                    key={activeModaliteImage}
                    src={activeModaliteImage}
                    alt='Modalité'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      width: '100%',
                      height: '500px',
                      objectFit: 'cover',
                    }}
                  />
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Responsive Styles */}
        <style jsx>{`
          @media (max-width: 1024px) {
            .modalites-layout {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }

            .desktop-image-modalites {
              display: none !important;
            }

            .mobile-image-modalites {
              display: block !important;
            }
          }

          @media (max-width: 768px) {
            section h2 {
              font-size: 32px !important;
              line-height: 38px !important;
            }
          }
        `}</style>
      </section>

      {/* Section FAQ - Fond Turquoise */}
      <section
        style={{
          backgroundColor: '#1B998B',
          padding: '96px 0',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          {/* Header de section */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '8px 20px',
                borderRadius: '35px',
                marginBottom: '24px',
              }}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#ffffff'
                strokeWidth='2'
              >
                <circle cx='12' cy='12' r='10' />
                <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
                <line x1='12' y1='17' x2='12.01' y2='17' />
              </svg>
              <span
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  letterSpacing: '0.5px',
                }}
              >
                VOS QUESTIONS
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '42px',
                fontWeight: 700,
                lineHeight: '50.4px',
                color: '#ffffff',
                marginBottom: '24px',
              }}
            >
              Questions Fréquentes
            </h2>
          </div>

          {/* Accordéon FAQ */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {faqData.map((faq, index) => (
              <div
                key={index}
                style={{
                  borderBottom:
                    index < faqData.length - 1
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : 'none',
                  paddingTop: index === 0 ? '0' : '24px',
                  paddingBottom: '24px',
                }}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                  role='button'
                >
                  {/* Question Text */}
                  <span
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '18px',
                      fontWeight: 600,
                      lineHeight: '28px',
                      color: '#ffffff',
                      flex: 1,
                      paddingRight: '16px',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {faq.question}
                  </span>

                  {/* Chevron Icon */}
                  <div style={{ flexShrink: 0, marginLeft: '16px' }}>
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#ffffff'
                      strokeWidth={2}
                      style={{
                        transition: 'transform 0.3s ease',
                        transform:
                          openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </button>

                {/* Answer Panel */}
                <div
                  id={`faq-answer-${index}`}
                  style={{
                    overflow: 'hidden',
                    maxHeight: openFaq === index ? '1000px' : '0',
                    paddingTop: openFaq === index ? '16px' : '0',
                    opacity: openFaq === index ? 1 : 0,
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <div style={{ paddingBottom: '8px' }}>
                    {faq.hasContactLink ? (
                      <p
                        style={{
                          fontFamily:
                            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontSize: '16px',
                          lineHeight: '24px',
                          color: 'rgba(255, 255, 255, 0.85)',
                        }}
                      >
                        <a
                          href='/contact'
                          style={{
                            color: '#ffffff',
                            fontWeight: 600,
                            textDecoration: 'underline',
                            transition: 'opacity 0.2s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.opacity = '0.8';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          Contactez-nous
                        </a>
                        , nous vous répondrons avec plaisir !
                      </p>
                    ) : (
                      <p
                        style={{
                          fontFamily:
                            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontSize: '16px',
                          lineHeight: '24px',
                          color: 'rgba(255, 255, 255, 0.85)',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {faq.answer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Marketing */}
      <MarketingFooter />
    </div>
  );
}
