'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { SmoothScrollProvider } from '@/components/ui/SmoothScrollProvider';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Page Remboursement Assurance - Design NutriSensia Style Guide
 *
 * Cette page explique le processus de remboursement par les assurances complémentaires suisses.
 * Design conforme au NutriSensia Style Guide avec :
 * - Typographie : Marcellus (titres) + Plus Jakarta Sans (body)
 * - Couleurs : Turquoise Méditerranée (#1B998B) + palette neutre
 * - Cartes avec shadow signature (8px 8px 0 #E5DED6)
 * - Animations Framer Motion
 */
// Données des étapes du processus de remboursement
const processSteps = [
  {
    number: 1,
    title: 'Consultation',
    description:
      'Vous réservez et suivez vos consultations. Paiement par carte ou virement.',
    icon: (
      <svg
        width='32'
        height='32'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
        <circle cx='9' cy='7' r='4' />
        <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
        <path d='M16 3.13a4 4 0 0 1 0 7.75' />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Facture',
    description: 'Vous recevez automatiquement une facture conforme ASCA/RME.',
    icon: (
      <svg
        width='32'
        height='32'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
        <polyline points='14 2 14 8 20 8' />
        <line x1='16' y1='13' x2='8' y2='13' />
        <line x1='16' y1='17' x2='8' y2='17' />
        <polyline points='10 9 9 9 8 9' />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Transmission',
    description:
      'Vous envoyez la facture à votre assurance complémentaire (courrier, email ou app).',
    icon: (
      <svg
        width='32'
        height='32'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <line x1='22' y1='2' x2='11' y2='13' />
        <polygon points='22 2 15 22 11 13 2 9 22 2' />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Remboursement',
    description:
      'Votre assurance complémentaire vous rembourse sous 2-4 semaines selon votre contrat.',
    icon: (
      <svg
        width='32'
        height='32'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <circle cx='12' cy='12' r='10' />
        <path d='M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8' />
        <path d='M12 18V6' />
      </svg>
    ),
  },
];

// Données des assurances partenaires avec logos
const insurancePartners = [
  { name: 'Swica', logo: '/images/insurance/swica.svg' },
  { name: 'Helsana', logo: '/images/insurance/helsana.svg' },
  { name: 'CSS', logo: '/images/insurance/css.svg' },
  { name: 'Visana', logo: '/images/insurance/visana.svg' },
  { name: 'Groupe Mutuel', logo: '/images/insurance/groupe-mutuel.png' },
  { name: 'Assura', logo: '/images/insurance/assura.svg' },
  { name: 'Concordia', logo: '/images/insurance/concordia.svg' },
  { name: 'Zurich', logo: '/images/insurance/zurich.svg' },
];

export default function RemboursementPage() {
  const heroRef = useRef(null);
  const processRef = useRef(null);
  const insuranceRef = useRef(null);
  const faqInsuranceRef = useRef(null);
  const ctaBannerRef = useRef(null);
  const chronicRef = useRef(null);
  const adviceRef = useRef(null);
  const faqRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true, margin: '-50px' });
  const isProcessInView = useInView(processRef, {
    once: true,
    margin: '-100px',
  });
  const isInsuranceInView = useInView(insuranceRef, {
    once: true,
    margin: '-100px',
  });
  const isFaqInsuranceInView = useInView(faqInsuranceRef, {
    once: true,
    margin: '-100px',
  });
  const isCtaBannerInView = useInView(ctaBannerRef, {
    once: true,
    margin: '-50px',
  });
  const isChronicInView = useInView(chronicRef, {
    once: true,
    margin: '-100px',
  });
  const isAdviceInView = useInView(adviceRef, { once: true, margin: '-100px' });
  const isFaqInView = useInView(faqRef, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  // State pour l'accordion FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Helpers pour les animations conditionnelles
  const getInitialStyle = (
    yOffset: number = 0,
    xOffset: number = 0,
    scale: number = 1,
    blur: number = 0
  ) => {
    if (!isFirstVisit) return {};
    const style: React.CSSProperties = { opacity: 0 };
    if (yOffset !== 0) style.transform = `translateY(${yOffset}px)`;
    if (xOffset !== 0) style.transform = `translateX(${xOffset}px)`;
    if (scale !== 1) style.transform = `scale(${scale})`;
    if (blur > 0) style.filter = `blur(${blur}px)`;
    return style;
  };

  const getTransition = (duration: number, delay: number = 0) => {
    if (!isFirstVisit) return { duration: 0 };
    return { duration, delay, ease: 'easeOut' as const };
  };

  const shouldAnimate = (isInView: boolean) => isFirstVisit && isInView;

  // Données FAQ spécifiques au remboursement
  const remboursementFaqs = [
    {
      id: 1,
      question:
        'Quelles assurances complémentaires remboursent les consultations nutritionnelles ?',
      answer:
        "La plupart des assurances complémentaires suisses remboursent les consultations avec une diététicienne agréée ASCA/RME. Les principales assurances partenaires sont : Visana, Swica, CSS, Helsana, Sanitas, Groupe Mutuel, Assura, Concordia, et bien d'autres. Le taux de remboursement dépend de votre contrat spécifique.",
    },
    {
      id: 2,
      question: 'Quel est le taux de remboursement habituel ?',
      answer:
        "Le taux de remboursement varie généralement entre 50% et 90% selon votre contrat d'assurance complémentaire. Certains contrats prévoient un plafond annuel (par exemple 1'500 CHF/an). Nous vous recommandons de contacter directement votre assurance complémentaire pour connaître votre couverture exacte.",
    },
    {
      id: 3,
      question: 'Comment obtenir mon remboursement ?',
      answer:
        'Après chaque consultation, vous recevez une facture conforme aux standards ASCA/RME. Vous la transmettez simplement à votre assurance complémentaire (par courrier ou via leur application mobile). Le remboursement est généralement effectué sous 2 à 4 semaines.',
    },
    {
      id: 4,
      question: 'Dois-je avancer les frais de consultation ?',
      answer:
        'Oui, vous réglez la consultation directement par carte bancaire ou virement. Vous êtes ensuite remboursé(e) par votre assurance complémentaire selon votre contrat. Ce système est standard pour les médecines complémentaires en Suisse.',
    },
    {
      id: 5,
      question: 'Les consultations en ligne sont-elles aussi remboursées ?',
      answer:
        'Oui, les consultations en visioconférence sont remboursées exactement comme les consultations en cabinet. La facture est identique et reconnue par toutes les assurances complémentaires partenaires.',
    },
    {
      id: 6,
      question:
        'Que faire si mon assurance complémentaire refuse le remboursement ?',
      answer:
        "Si votre assurance complémentaire refuse le remboursement, vérifiez d'abord que vous avez bien une couverture pour les médecines complémentaires (thérapies alternatives). Si c'est le cas, n'hésitez pas à nous contacter : nous pouvons vous fournir des documents supplémentaires ou vous aider dans vos démarches.",
    },
  ];

  const toggleFaqAccordion = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleFaqKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFaqAccordion(index);
    }
  };

  return (
    <SmoothScrollProvider>
      <div className='min-h-screen bg-[#FDFCFB]'>
        {/* Header Marketing */}
        <MarketingHeader />

        {/* ============================================ */}
        {/* SECTION HERO - Style Split-Screen            */}
        {/* Inspiré de Culina Health                     */}
        {/* ============================================ */}
        <section
          ref={heroRef}
          id='hero-remboursement'
          className='hero-section-remboursement'
          style={{
            backgroundColor: '#f8f7ef',
            padding: '120px 0 80px',
            position: 'relative',
            overflow: 'hidden',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
          }}
        >
          {/* CONTAINER PRINCIPAL - SPLIT LAYOUT */}
          <div
            className='hero-container-remboursement'
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '0 48px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            {/* COLONNE GAUCHE - CONTENU TEXTE */}
            <div className='hero-text-remboursement'>
              {/* BADGE CERTIFICATIONS - Style Pill (comme page plateforme) */}
              <motion.div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor:
                    'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
                  padding: '8px 16px',
                  borderRadius: '35px',
                  marginBottom: '24px',
                  ...getInitialStyle(0, 0, 0.8),
                }}
                animate={
                  isHeroInView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.8 }
                }
                transition={getTransition(0.5)}
              >
                {/* Shield/Award Icon for certification */}
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#1B998B'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                  <polyline points='9 12 11 14 15 10' />
                </svg>
                <span
                  style={{
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1B998B',
                  }}
                >
                  Thérapeute Certifiée ASCA RME
                </span>
              </motion.div>

              {/* TITRE H1 - Style Guide: Marcellus, 48px, bold, lineHeight 57.6px */}
              <motion.h1
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: '48px',
                  fontWeight: 700,
                  lineHeight: '57.6px',
                  color: '#1B998B',
                  marginBottom: '24px',
                  ...getInitialStyle(30),
                }}
                animate={
                  isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={getTransition(0.7)}
              >
                Trouvez une diététicienne remboursée par votre assurance
                complémentaire
              </motion.h1>

              {/* DESCRIPTION - Style Guide: Plus Jakarta Sans, 16px, lineHeight 24px */}
              <motion.p
                className='hero-description-remboursement'
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#41556b',
                  marginBottom: '32px',
                  maxWidth: '520px',
                  ...getInitialStyle(30),
                }}
                animate={
                  isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={getTransition(0.7, 0.25)}
              >
                Nous sommes convaincus que des soins nutritionnels de qualité
                doivent être accessibles à tous. C'est pourquoi nous sommes
                certifiés <strong style={{ color: '#1a1a1a' }}>ASCA</strong> et{' '}
                <strong style={{ color: '#1a1a1a' }}>RME</strong>, permettant le
                remboursement par la plupart des assurances complémentaires
                suisses comme Swica, Helsana, CSS, Visana et bien d'autres.
              </motion.p>

              {/* BOUTON CTA */}
              <motion.div
                style={getInitialStyle(30)}
                animate={
                  isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={getTransition(0.7, 0.35)}
              >
                <button
                  className='hero-btn-remboursement'
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    borderRadius: '35px',
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: '25.2px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    background:
                      'linear-gradient(135deg, #1B998B 0%, #147569 100%)' /* Dégradé CTA */,
                    color: '#FDFCFB',
                    textDecoration: 'none',
                  }}
                  onClick={() => {
                    window.location.href = '/contact?type=consultation';
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
                  Réserver ma première consultation →
                </button>
              </motion.div>
            </div>

            {/* COLONNE DROITE - IMAGE */}
            <motion.div
              className='hero-image-remboursement'
              style={{
                position: 'relative',
                ...getInitialStyle(0, 40),
              }}
              animate={
                isHeroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }
              }
              transition={getTransition(0.8, 0.2)}
            >
              {/* IMAGE AVEC SHADOW DÉCALÉE */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '8px 8px 0 #E5DED6',
                }}
              >
                <img
                  src='https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=85'
                  alt='Consultation nutritionnelle en ligne'
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    aspectRatio: '4/3',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* ============================================ */}
          {/* RESPONSIVE STYLES                            */}
          {/* ============================================ */}
          <style jsx>{`
            /* Large Tablets (≤ 1024px) */
            @media (max-width: 1024px) {
              .hero-container-remboursement {
                grid-template-columns: 1fr !important;
                gap: 48px !important;
                padding: 0 32px !important;
              }

              .hero-text-remboursement {
                text-align: center !important;
                order: 1 !important;
              }

              .hero-text-remboursement h1 {
                font-size: 42px !important;
              }

              .hero-subtitle-remboursement {
                font-size: 20px !important;
              }

              .hero-description-remboursement {
                max-width: 100% !important;
                margin-left: auto !important;
                margin-right: auto !important;
              }

              .hero-image-remboursement {
                order: 2 !important;
                max-width: 500px !important;
                margin: 0 auto !important;
              }
            }

            /* Mobile (≤ 768px) */
            @media (max-width: 768px) {
              .hero-section-remboursement {
                padding: 100px 0 60px !important;
              }

              .hero-container-remboursement {
                padding: 0 20px !important;
                gap: 40px !important;
              }

              .hero-text-remboursement h1 {
                font-size: 32px !important;
                line-height: 1.2 !important;
              }

              .hero-subtitle-remboursement {
                font-size: 18px !important;
              }

              .hero-description-remboursement {
                font-size: 15px !important;
              }

              .hero-btn-remboursement {
                width: 100% !important;
                justify-content: center !important;
              }

              .hero-image-remboursement {
                max-width: 100% !important;
              }
            }

            /* Small Mobile (≤ 480px) */
            @media (max-width: 480px) {
              .hero-text-remboursement h1 {
                font-size: 28px !important;
              }

              .hero-subtitle-remboursement {
                font-size: 16px !important;
              }
            }
          `}</style>
        </section>

        {/* ============================================ */}
        {/* SECTION ASSURANCES PARTENAIRES              */}
        {/* Style Culina Health - Bandeau simple        */}
        {/* Position: Après le Hero                     */}
        {/* ============================================ */}
        <section
          ref={insuranceRef}
          className='insurance-section'
          style={{
            backgroundColor:
              'rgba(27, 153, 139, 0.08)' /* Turquoise Méditerranée - opacité légère */,
            padding: '64px 24px',
            position: 'relative',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
          }}
        >
          <div
            style={{
              width: '75%',
              maxWidth: '1600px',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            {/* LOGOS DES ASSURANCES EN LIGNE */}
            <motion.div
              className='insurance-logos-row'
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '40px',
                ...getInitialStyle(20),
              }}
              animate={
                isInsuranceInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.6, 0.15)}
            >
              {insurancePartners.map(insurance => (
                <div
                  key={insurance.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.9,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={insurance.logo}
                    alt={`Logo ${insurance.name}`}
                    style={{
                      height: '32px',
                      width: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* STYLES RESPONSIVE */}
          <style jsx>{`
            @media (max-width: 900px) {
              .insurance-logos-row {
                gap: 24px !important;
              }
            }
            @media (max-width: 600px) {
              .insurance-section {
                padding: 48px 20px !important;
              }
              .insurance-logos-row {
                gap: 20px !important;
              }
            }
          `}</style>
        </section>

        {/* ============================================ */}
        {/* SECTION FAQ ASSURANCE - SPLIT LAYOUT        */}
        {/* Image à gauche, Texte à droite              */}
        {/* ============================================ */}
        <section
          ref={faqInsuranceRef}
          className='faq-insurance-section'
          style={{
            backgroundColor: '#ffffff',
            padding: '96px 24px',
            position: 'relative',
          }}
        >
          <div
            className='faq-insurance-container'
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            {/* COLONNE GAUCHE - IMAGE */}
            <motion.div
              className='faq-insurance-image'
              style={{
                position: 'relative',
                ...getInitialStyle(0, -40),
              }}
              animate={
                isFaqInsuranceInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -40 }
              }
              transition={getTransition(0.8)}
            >
              <div
                style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '12px 12px 0 #E5DED6',
                }}
              >
                <img
                  src='https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=900&fit=crop&q=85'
                  alt="Documents d'assurance et consultation nutritionnelle"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    aspectRatio: '4/5',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </motion.div>

            {/* COLONNE DROITE - TEXTE */}
            <motion.div
              className='faq-insurance-text'
              style={getInitialStyle(0, 40)}
              animate={
                isFaqInsuranceInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: 40 }
              }
              transition={getTransition(0.8, 0.1)}
            >
              {/* TITRE PRINCIPAL - Style Guide: Marcellus, 42px, bold */}
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
                Les consultations en nutrition sont-elles remboursées par
                l'assurance maladie ?
              </h2>

              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#41556b',
                  marginBottom: '16px',
                }}
              >
                <strong style={{ color: '#1a1a1a' }}>Oui !</strong> De
                nombreux·ses client·e·s de NutriSensia accèdent à nos
                consultations nutritionnelles en ligne avec un remboursement
                grâce à leur assurance complémentaire. En Suisse, bien que
                l'assurance de base LAMal ne rembourse pas les consultations
                avec un·e nutritionniste, de nombreuses assurances
                complémentaires offrent des remboursements substantiels pour ce
                type de prestations.
              </p>

              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#41556b',
                  marginBottom: '16px',
                }}
              >
                Il est important de connaître les avantages spécifiques de votre
                plan d'assurance complémentaire. Nous vous encourageons à
                vérifier votre couverture auprès de votre caisse maladie avant
                votre première consultation.
              </p>

              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#41556b',
                  marginBottom: '0',
                }}
              >
                Chez NutriSensia, nous sommes nutritionnistes et nos
                consultations relèvent donc des assurances complémentaires, qui
                couvrent une gamme plus large de besoins : gestion du poids,
                alimentation sportive, prévention santé, alimentation familiale,
                etc. Si votre plan d'assurance complémentaire ne couvre pas les
                consultations nutritionnelles, nous proposons des tarifs
                transparents et abordables. N'hésitez pas à nous contacter pour
                discuter des options adaptées à votre situation.
              </p>
            </motion.div>
          </div>

          {/* STYLES RESPONSIVE */}
          <style jsx>{`
            @media (max-width: 900px) {
              .faq-insurance-container {
                grid-template-columns: 1fr !important;
                gap: 48px !important;
              }
              .faq-insurance-image {
                order: 2 !important;
                max-width: 500px !important;
                margin: 0 auto !important;
              }
              .faq-insurance-text {
                order: 1 !important;
              }
            }
            @media (max-width: 600px) {
              .faq-insurance-section {
                padding: 64px 20px !important;
              }
            }
          `}</style>
        </section>

        {/* ============================================ */}
        {/* SECTION CTA BANNER SÉPARATEUR               */}
        {/* Style NutriSensia - Terracotta              */}
        {/* ============================================ */}
        <section
          ref={ctaBannerRef}
          style={{
            backgroundColor: '#E76F51' /* Terracotta Méditerranée */,
            padding: '2rem 0',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 24px',
            }}
          >
            <motion.div
              className='cta-banner-content'
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '32px',
                flexWrap: 'wrap',
                ...getInitialStyle(20),
              }}
              animate={
                isCtaBannerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.6)}
            >
              {/* Texte */}
              <span
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#ffffff',
                  textAlign: 'center',
                }}
              >
                Réservez une consultation avec une diététicienne diplômée
              </span>

              {/* Bouton CTA */}
              <a
                href='/contact?type=consultation'
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '35px',
                  padding: '14px 32px',
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#147569' /* Turquoise foncé */,
                  textDecoration: 'none',
                  textAlign: 'center',
                  lineHeight: '16px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                Commencer →
              </a>
            </motion.div>
          </div>

          {/* STYLES RESPONSIVE */}
          <style jsx>{`
            @media (max-width: 768px) {
              .cta-banner-content {
                flex-direction: column !important;
                gap: 20px !important;
              }
            }
          `}</style>
        </section>

        {/* ============================================ */}
        {/* SECTION MALADIES CHRONIQUES - SPLIT LAYOUT  */}
        {/* Texte à gauche, Image à droite              */}
        {/* ============================================ */}
        <section
          ref={chronicRef}
          className='chronic-section'
          style={{
            backgroundColor: '#ffffff',
            padding: '96px 24px',
            position: 'relative',
          }}
        >
          <div
            className='chronic-container'
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            {/* COLONNE GAUCHE - TEXTE */}
            <motion.div
              className='chronic-text'
              style={getInitialStyle(0, -40)}
              animate={
                isChronicInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }
              }
              transition={getTransition(0.8)}
            >
              {/* TITRE - Style Guide: Marcellus, 42px, bold, lineHeight 50.4px */}
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
                Accompagnement nutritionnel pour les maladies chroniques
              </h2>

              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#41556b',
                  marginBottom: '16px',
                }}
              >
                L'accompagnement nutritionnel est une approche efficace pour
                gérer les maladies chroniques, ralentir leur progression et
                réduire les risques de complications. Des études ont démontré
                son efficacité pour la gestion du poids, du diabète, des
                maladies cardiovasculaires, ainsi que pour réduire le
                cholestérol et les risques cardiaques.
              </p>

              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#41556b',
                  marginBottom: '16px',
                }}
              >
                Si vous vivez avec un diabète de type 2, des maladies
                cardiovasculaires, du surpoids, un syndrome métabolique ou
                d'autres conditions chroniques, vous pouvez grandement
                bénéficier d'un suivi nutritionnel régulier.
              </p>

              <p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#41556b',
                  marginBottom: '24px',
                }}
              >
                Chez NutriSensia, nous combinons des connaissances en nutrition
                avec une approche centrée sur les changements de mode de vie
                durables et la modification progressive des habitudes. Notre
                objectif est de vous accompagner dans la mise en œuvre concrète
                de recommandations nutritionnelles adaptées à votre réalité
                quotidienne.
              </p>

              {/* NOTE IMPORTANTE - Style identique à PlatformBonusSection */}
              <div
                style={{
                  backgroundColor:
                    'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
                  borderRadius: '16px',
                  padding: '32px 40px',
                  border: '1px solid #E5DED6',
                  textAlign: 'left',
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
                  Important
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
                  En tant que nutritionniste, nous vous offrons un
                  accompagnement complémentaire axé sur la prévention et les
                  changements de comportements.
                </p>
              </div>
            </motion.div>

            {/* COLONNE DROITE - IMAGE */}
            <motion.div
              className='chronic-image'
              style={{
                position: 'relative',
                ...getInitialStyle(0, 40),
              }}
              animate={
                isChronicInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }
              }
              transition={getTransition(0.8, 0.1)}
            >
              <div
                style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '12px 12px 0 #E5DED6',
                }}
              >
                <img
                  src='https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=900&fit=crop&q=85'
                  alt='Alimentation saine pour la gestion des maladies chroniques'
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    aspectRatio: '4/5',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* STYLES RESPONSIVE */}
          <style jsx>{`
            @media (max-width: 900px) {
              .chronic-container {
                grid-template-columns: 1fr !important;
                gap: 48px !important;
              }
              .chronic-image {
                order: 1 !important;
                max-width: 500px !important;
                margin: 0 auto !important;
              }
              .chronic-text {
                order: 2 !important;
              }
            }
            @media (max-width: 600px) {
              .chronic-section {
                padding: 64px 20px !important;
              }
            }
          `}</style>
        </section>

        {/* ============================================ */}
        {/* SECTION COMMENT ÇA MARCHE - CARTES HORIZONTALES */}
        {/* Design inspiré de la page Approche              */}
        {/* ============================================ */}
        <section
          ref={processRef}
          className='process-section'
          style={{
            backgroundColor: '#E5DED6' /* Beige Sand - Méditerranée */,
            padding: '100px 40px',
            position: 'relative',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {/* EN-TÊTE DE SECTION */}
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              {/* H2 - Style Guide: Marcellus, 42px, bold, lineHeight 50.4px */}
              <motion.h2
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: '42px',
                  fontWeight: 700,
                  lineHeight: '50.4px',
                  color: '#1B998B',
                  marginBottom: '16px',
                  ...getInitialStyle(30),
                }}
                animate={
                  isProcessInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={getTransition(0.6)}
              >
                Comment ça marche ?
              </motion.h2>

              <motion.p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#41556b',
                  maxWidth: '600px',
                  margin: '0 auto',
                  ...getInitialStyle(20),
                }}
                animate={
                  isProcessInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={getTransition(0.5, 0.1)}
              >
                Un processus simple en 4 étapes pour obtenir votre remboursement
              </motion.p>
            </div>

            {/* GRILLE DE CARTES */}
            <div
              className='process-cards-grid'
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                marginBottom: '48px',
              }}
            >
              {processSteps.map((step, index) => {
                // Images pour chaque étape
                const stepImages = [
                  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop&q=80', // Consultation
                  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop&q=80', // Facture
                  'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=250&fit=crop&q=80', // Transmission
                  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop&q=80', // Remboursement
                ];

                return (
                  <motion.div
                    key={step.number}
                    className='process-card'
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      ...getInitialStyle(40),
                    }}
                    animate={
                      isProcessInView
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 40 }
                    }
                    transition={getTransition(0.6, 0.2 + index * 0.15)}
                  >
                    {/* Image avec badge numéro */}
                    <div style={{ position: 'relative' }}>
                      <img
                        src={stepImages[index]}
                        alt={step.title}
                        style={{
                          width: '100%',
                          height: '160px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      {/* Badge numéro */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '16px',
                          left: '16px',
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: '#1B998B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(27, 153, 139, 0.4)',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#ffffff',
                          }}
                        >
                          0{step.number}
                        </span>
                      </div>
                    </div>

                    {/* Contenu de la carte */}
                    <div
                      style={{
                        padding: '24px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Titre */}
                      <h3
                        style={{
                          fontFamily: "'Marcellus', serif",
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#1B998B',
                          marginBottom: '12px',
                        }}
                      >
                        {step.title}
                      </h3>

                      {/* Séparateur */}
                      <div
                        style={{
                          width: '100%',
                          height: '1px',
                          backgroundColor: '#e5e5e5',
                          marginBottom: '16px',
                        }}
                      />

                      {/* Description */}
                      <p
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: '14px',
                          lineHeight: '1.6',
                          color: '#41556b',
                          margin: 0,
                          flex: 1,
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* BOUTON CTA */}
            <motion.div
              style={{
                display: 'flex',
                justifyContent: 'center',
                ...getInitialStyle(20),
              }}
              animate={
                isProcessInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.5, 0.8)}
            >
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 32px',
                  borderRadius: '35px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  background:
                    'linear-gradient(135deg, #1B998B 0%, #147569 100%)' /* Dégradé CTA */,
                  color: '#ffffff',
                }}
                onClick={() => {
                  window.location.href = '/contact?type=consultation';
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
                  <line x1='16' y1='2' x2='16' y2='6' />
                  <line x1='8' y1='2' x2='8' y2='6' />
                  <line x1='3' y1='10' x2='21' y2='10' />
                </svg>
                Réserver ma première consultation
              </button>
            </motion.div>
          </div>

          {/* STYLES RESPONSIVE */}
          <style jsx>{`
            @media (max-width: 1024px) {
              .process-cards-grid {
                grid-template-columns: repeat(2, 1fr) !important;
              }
            }

            @media (max-width: 600px) {
              .process-section {
                padding: 60px 20px !important;
              }

              .process-cards-grid {
                grid-template-columns: 1fr !important;
                gap: 20px !important;
              }

              .process-section h2 {
                font-size: 32px !important;
              }
            }
          `}</style>
        </section>

        {/* ============================================ */}
        {/* SECTION BON À SAVOIR - Style Fonctionnalités Bonus */}
        {/* ============================================ */}
        <section
          ref={adviceRef}
          style={{
            backgroundColor: '#f8f7ef' /* Crème chaud */,
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
              style={{
                textAlign: 'center',
                marginBottom: '64px',
                ...getInitialStyle(40, 0, 1, 10),
              }}
              animate={
                isAdviceInView
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : { opacity: 0, y: 40, filter: 'blur(10px)' }
              }
              transition={getTransition(0.8)}
            >
              {/* Badge */}
              <motion.div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(27, 153, 139, 0.08)',
                  border: '1px solid #E5DED6',
                  borderRadius: '35px',
                  padding: '8px 20px',
                  marginBottom: '24px',
                  ...getInitialStyle(0, 0, 0.8),
                }}
                animate={
                  isAdviceInView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.8 }
                }
                transition={getTransition(0.5, 0.1)}
              >
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#1B998B'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M9 18h6' />
                  <path d='M10 22h4' />
                  <path d='M12 2a7 7 0 0 0-4 12.9V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.1A7 7 0 0 0 12 2Z' />
                </svg>
                <span
                  style={{
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1B998B',
                    letterSpacing: '0.5px',
                  }}
                >
                  Conseils pratiques
                </span>
              </motion.div>

              <h2
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: '48px',
                  fontWeight: 700,
                  lineHeight: '57.6px',
                  color: '#1B998B',
                  marginBottom: '16px',
                }}
                className='advice-title'
              >
                Bon à savoir
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
                className='advice-subtitle'
              >
                Quelques conseils pour optimiser vos remboursements et faciliter
                vos démarches.
              </p>
            </motion.div>

            {/* Advice Cards Grid */}
            <motion.div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                ...getInitialStyle(0),
              }}
              animate={isAdviceInView ? { opacity: 1 } : { opacity: 0 }}
              transition={getTransition(0.5)}
              className='advice-grid'
            >
              {[
                {
                  title: 'Vérifiez votre contrat',
                  subtitle: 'Avant de commencer',
                  description:
                    'Contactez votre assurance complémentaire avant la première consultation pour connaître exactement votre couverture.',
                  features: [
                    'Couverture exacte',
                    'Montant annuel',
                    'Démarches à suivre',
                    'Documents requis',
                  ],
                  icon: (
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#1B998B'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                      <polyline points='14 2 14 8 20 8' />
                      <line x1='16' y1='13' x2='8' y2='13' />
                      <line x1='16' y1='17' x2='8' y2='17' />
                    </svg>
                  ),
                },
                {
                  title: 'Conservez vos factures',
                  subtitle: 'Organisation essentielle',
                  description:
                    'Gardez une copie de toutes vos factures et les preuves de paiement pour vos dossiers personnels.',
                  features: [
                    'Factures originales',
                    'Preuves de paiement',
                    'Copies numériques',
                    'Classement chronologique',
                  ],
                  icon: (
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#1B998B'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                      <polyline points='17 8 12 3 7 8' />
                      <line x1='12' y1='3' x2='12' y2='15' />
                    </svg>
                  ),
                },
                {
                  title: 'Soumettez rapidement',
                  subtitle: 'Respect des délais',
                  description:
                    'Envoyez vos demandes de remboursement dans les délais prévus par votre contrat.',
                  features: [
                    'Délai généralement 1 an',
                    'Envoi dès réception',
                    'Suivi de dossier',
                    'Confirmation écrite',
                  ],
                  icon: (
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#1B998B'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <circle cx='12' cy='12' r='10' />
                      <polyline points='12 6 12 12 16 14' />
                    </svg>
                  ),
                },
                {
                  title: 'Application mobile',
                  subtitle: 'Simplicité digitale',
                  description:
                    "Utilisez l'app de votre assurance complémentaire pour soumettre vos factures facilement.",
                  features: [
                    'Scan de factures',
                    'Envoi instantané',
                    'Suivi en temps réel',
                    'Historique complet',
                  ],
                  icon: (
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#1B998B'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <rect x='5' y='2' width='14' height='20' rx='2' ry='2' />
                      <line x1='12' y1='18' x2='12.01' y2='18' />
                    </svg>
                  ),
                },
              ].map((advice, index) => (
                <motion.div
                  key={advice.title}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '16px',
                    padding: '28px 24px',
                    boxShadow:
                      '6px 6px 0 #E5DED6' /* Sage Shadow - Style Guide */,
                    ...(isFirstVisit
                      ? {
                          opacity: 0,
                          transform: 'translateY(60px) scale(0.9)',
                          filter: 'blur(8px)',
                        }
                      : {}),
                  }}
                  animate={
                    isAdviceInView
                      ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
                      : { opacity: 0, y: 60, scale: 0.9, filter: 'blur(8px)' }
                  }
                  transition={
                    isFirstVisit
                      ? {
                          duration: 0.7,
                          delay: 0.2 + index * 0.12,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }
                      : { duration: 0 }
                  }
                >
                  {/* Icon */}
                  <motion.div
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'rgba(27, 153, 139, 0.08)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      ...(isFirstVisit
                        ? { transform: 'scale(0) rotate(-180deg)' }
                        : {}),
                    }}
                    animate={
                      isAdviceInView
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0, rotate: -180 }
                    }
                    transition={
                      isFirstVisit
                        ? {
                            duration: 0.5,
                            delay: 0.3 + index * 0.1,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }
                        : { duration: 0 }
                    }
                  >
                    {advice.icon}
                  </motion.div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "'Marcellus', serif",
                      fontSize: '20px',
                      fontWeight: 700,
                      lineHeight: '26px',
                      color: '#1B998B',
                      marginBottom: '4px',
                    }}
                  >
                    {advice.title}
                  </h3>

                  {/* Subtitle */}
                  <p
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#1B998B',
                      fontStyle: 'italic',
                      marginBottom: '12px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #E5DED6',
                    }}
                  >
                    {advice.subtitle}
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
                    {advice.description}
                  </p>

                  {/* Features List */}
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {advice.features.map((item, itemIndex) => (
                      <motion.li
                        key={itemIndex}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          ...(isFirstVisit
                            ? { opacity: 0, transform: 'translateX(-10px)' }
                            : {}),
                        }}
                        animate={
                          isAdviceInView
                            ? { opacity: 1, x: 0 }
                            : { opacity: 0, x: -10 }
                        }
                        transition={
                          isFirstVisit
                            ? {
                                duration: 0.3,
                                delay: 0.5 + index * 0.1 + itemIndex * 0.05,
                                ease: [0.25, 0.46, 0.45, 0.94],
                              }
                            : { duration: 0 }
                        }
                      >
                        <motion.div
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
                            ...(isFirstVisit ? { transform: 'scale(0)' } : {}),
                          }}
                          animate={isAdviceInView ? { scale: 1 } : { scale: 0 }}
                          transition={
                            isFirstVisit
                              ? {
                                  duration: 0.3,
                                  delay: 0.5 + index * 0.1 + itemIndex * 0.05,
                                  ease: [0.25, 0.46, 0.45, 0.94],
                                }
                              : { duration: 0 }
                          }
                        >
                          <svg
                            width='9'
                            height='9'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='#ffffff'
                            strokeWidth='3'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          >
                            <polyline points='20 6 9 17 4 12' />
                          </svg>
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
                  </ul>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom Note - Style "Important" */}
            <motion.div
              style={{
                marginTop: '64px',
                textAlign: 'center',
                ...(isFirstVisit
                  ? { opacity: 0, transform: 'translateY(30px) scale(0.95)' }
                  : {}),
              }}
              animate={
                isAdviceInView
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 30, scale: 0.95 }
              }
              transition={
                isFirstVisit
                  ? {
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: 0.6,
                    }
                  : { duration: 0 }
              }
            >
              <div
                style={{
                  backgroundColor: 'rgba(27, 153, 139, 0.08)',
                  borderRadius: '16px',
                  padding: '32px 40px',
                  border: '1px solid #E5DED6',
                  maxWidth: '800px',
                  margin: '0 auto',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '24px',
                    fontWeight: 700,
                    lineHeight: '32px',
                    color: '#1B998B',
                    marginBottom: '12px',
                  }}
                >
                  Important
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
                  Les montants et taux de remboursement varient selon votre
                  contrat d'assurance complémentaire. Ces informations sont
                  données à titre indicatif. Nous vous recommandons de contacter
                  directement votre assurance complémentaire pour connaître
                  votre couverture exacte.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Responsive styles */}
          <style jsx>{`
            @media (max-width: 1024px) {
              .advice-grid {
                grid-template-columns: repeat(2, 1fr) !important;
              }
            }

            @media (max-width: 768px) {
              .advice-title {
                font-size: 36px !important;
                line-height: 44px !important;
              }

              .advice-subtitle {
                font-size: 16px !important;
                line-height: 24px !important;
              }
            }

            @media (max-width: 640px) {
              .advice-grid {
                grid-template-columns: 1fr !important;
              }

              .advice-title {
                font-size: 32px !important;
                line-height: 40px !important;
              }
            }
          `}</style>
        </section>

        {/* ============================================ */}
        {/* SECTION FAQ REMBOURSEMENT                   */}
        {/* Style Turquoise avec accordion              */}
        {/* ============================================ */}
        <section
          id='faq-remboursement'
          ref={faqRef}
          style={{
            backgroundColor: '#1B998B' /* Turquoise Azur - Méditerranée */,
            padding: '100px 24px 80px',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <motion.h2
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: '48px',
                  lineHeight: '57.6px',
                  fontWeight: 700,
                  color: '#ffffff',
                  ...getInitialStyle(30),
                }}
                animate={
                  isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={getTransition(0.6)}
                className='faq-title'
              >
                Questions fréquentes
              </motion.h2>
              <motion.p
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  maxWidth: '600px',
                  margin: '16px auto 0',
                  ...getInitialStyle(20),
                }}
                animate={
                  isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={getTransition(0.5, 0.1)}
                className='faq-subtitle'
              >
                Tout ce que vous devez savoir sur le remboursement de vos
                consultations
              </motion.p>
            </div>

            {/* Accordion Container */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {remboursementFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <motion.div
                    key={faq.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: index === 0 ? '0 0 24px 0' : '24px 0',
                      ...(isFirstVisit
                        ? { opacity: 0, transform: 'translateY(20px)' }
                        : {}),
                    }}
                    animate={
                      isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                    }
                    transition={
                      isFirstVisit
                        ? { duration: 0.6, delay: index * 0.1 }
                        : { duration: 0 }
                    }
                  >
                    {/* Question Button */}
                    <button
                      onClick={() => toggleFaqAccordion(index)}
                      onKeyDown={e => handleFaqKeyDown(e, index)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        padding: '8px 0',
                        cursor: 'pointer',
                        minHeight: '44px',
                      }}
                      aria-expanded={isOpen}
                      aria-controls={`faq-remboursement-answer-${faq.id}`}
                    >
                      {/* Question Text */}
                      <span
                        style={{
                          fontFamily:
                            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#ffffff',
                          lineHeight: '27px',
                          flex: 1,
                          paddingRight: '16px',
                        }}
                      >
                        {faq.question}
                      </span>

                      {/* Chevron Icon */}
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ flexShrink: 0 }}
                      >
                        <svg
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#ffffff'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <polyline points='6 9 12 15 18 9' />
                        </svg>
                      </motion.div>
                    </button>

                    {/* Answer Panel */}
                    <motion.div
                      id={`faq-remboursement-answer-${faq.id}`}
                      initial={false}
                      animate={{
                        height: isOpen ? 'auto' : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <motion.div
                        initial={false}
                        animate={{ y: isOpen ? 0 : -10 }}
                        transition={{ duration: 0.3 }}
                        style={{ paddingTop: '16px' }}
                      >
                        <p
                          style={{
                            fontFamily:
                              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: 'rgba(255, 255, 255, 0.9)',
                            margin: 0,
                          }}
                        >
                          {faq.answer}
                        </p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Button */}
            <motion.div
              style={{
                textAlign: 'center',
                marginTop: '48px',
                ...getInitialStyle(20),
              }}
              animate={
                isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.6, 0.8)}
            >
              <a
                href='/contact?type=question'
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '8px 4px',
                  borderBottom: '2px solid transparent',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderBottomColor = '#ffffff';
                  e.currentTarget.style.gap = '12px';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderBottomColor = 'transparent';
                  e.currentTarget.style.gap = '8px';
                }}
              >
                <span>→</span>
                <span>Vous avez une autre question ?</span>
              </a>
            </motion.div>
          </div>

          {/* Responsive styles */}
          <style jsx>{`
            @media (max-width: 768px) {
              .faq-title {
                font-size: 36px !important;
                line-height: 44px !important;
              }

              .faq-subtitle {
                font-size: 16px !important;
                line-height: 24px !important;
              }
            }

            @media (max-width: 640px) {
              .faq-title {
                font-size: 32px !important;
                line-height: 40px !important;
              }
            }
          `}</style>
        </section>

        {/* Footer Marketing */}
        <MarketingFooter />
      </div>
    </SmoothScrollProvider>
  );
}
