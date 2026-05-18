'use client';

import React, { useState } from 'react';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { SmoothScrollProvider } from '@/components/ui/SmoothScrollProvider';

/**
 * Page Remboursement — DS v2 Editorial
 *
 * Refonte intégrale du parcours remboursement assurance :
 * hero, partenaires, explicatif, CTA, maladies chroniques,
 * processus 4 étapes, conseils pratiques, FAQ accordion.
 * Marcellus/teal/terracotta → Fraunces/cream/ink/peps.
 */

const processSteps = [
  {
    number: 1,
    title: 'Consultation',
    description:
      'Vous réservez en ligne et vous suivez vos consultations. Paiement par carte, virement ou Twint au moment de la réservation.',
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&h=600&fit=crop&q=85',
  },
  {
    number: 2,
    title: 'Facture',
    description:
      'Vous recevez automatiquement une facture conforme ASCA/RME par email. Aucune démarche à faire de notre côté.',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&h=600&fit=crop&q=85',
  },
  {
    number: 3,
    title: 'Transmission',
    description:
      'Vous transmettez la facture à votre assurance complémentaire — par courrier, par email, ou via leur application mobile.',
    image:
      'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=900&h=600&fit=crop&q=85',
  },
  {
    number: 4,
    title: 'Remboursement',
    description:
      "Votre assurance vous rembourse sous 2 à 4 semaines selon votre contrat. Et c'est tout.",
    image:
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=900&h=600&fit=crop&q=85',
  },
];

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

const adviceCards = [
  {
    title: 'Vérifiez votre contrat',
    subtitle: 'Avant de commencer',
    description:
      'Un coup de fil à votre complémentaire avant la première consultation. Cinq minutes pour connaître votre couverture exacte — taux, plafond annuel, et pièces à fournir.',
    features: [
      'Couverture exacte',
      'Plafond annuel',
      'Démarches à suivre',
      'Documents requis',
    ],
  },
  {
    title: 'Conservez vos factures',
    subtitle: 'Organisation essentielle',
    description:
      "Gardez une copie de toutes vos factures et preuves de paiement. Un dossier numérique dans le cloud, et vous êtes tranquille pour la fin d'année.",
    features: [
      'Factures originales',
      'Preuves de paiement',
      'Copies numériques',
      'Classement chronologique',
    ],
  },
  {
    title: 'Soumettez rapidement',
    subtitle: 'Respect des délais',
    description:
      "Envoyez vos demandes dans les délais prévus par votre contrat — souvent 1 an, mais vérifiez. Plus c'est rapide, plus c'est traité vite.",
    features: [
      'Délai généralement 1 an',
      'Envoi dès réception',
      'Suivi de dossier',
      'Confirmation écrite',
    ],
  },
  {
    title: 'Application mobile',
    subtitle: 'Simplicité digitale',
    description:
      'Toutes les grandes complémentaires ont leur app : photo de la facture, envoi en 30 secondes, suivi en temps réel. La meilleure façon de gagner du temps.',
    features: [
      'Scan de factures',
      'Envoi instantané',
      'Suivi en temps réel',
      'Historique complet',
    ],
  },
];

const remboursementFaqs = [
  {
    id: 1,
    question:
      'Quelles assurances complémentaires remboursent les consultations nutritionnelles ?',
    answer:
      'La grande majorité — y compris les principales caisses suisses : Swica, Helsana, CSS, Visana, Groupe Mutuel, Assura, Concordia et Zurich. La condition principale : votre contrat doit inclure le volet « médecines complémentaires » et reconnaître les agréments ASCA et/ou RME (que Lucie possède).',
  },
  {
    id: 2,
    question: 'Quel est le taux de remboursement habituel ?',
    answer:
      "Cela dépend de votre contrat. Typiquement, les complémentaires remboursent entre 75 % et 90 % de la consultation, jusqu'à un plafond annuel qui varie selon les formules. Le détail exact figure dans vos conditions générales — ou en un appel à votre conseiller.",
  },
  {
    id: 3,
    question: 'Comment obtenir mon remboursement ?',
    answer:
      "Vous payez la consultation au moment de la réservation. Vous recevez automatiquement une facture conforme ASCA/RME par email. Vous transmettez cette facture à votre assurance (app, email ou courrier). L'assurance vous rembourse sous 2 à 4 semaines, directement sur votre compte.",
  },
  {
    id: 4,
    question: 'Dois-je avancer les frais de consultation ?',
    answer:
      "Oui. Le système suisse fonctionne en avance de frais : vous réglez la consultation, puis vous êtes remboursée par votre complémentaire. C'est le fonctionnement standard, identique aux autres prestations en médecines complémentaires.",
  },
  {
    id: 5,
    question: 'Les consultations en ligne sont-elles aussi remboursées ?',
    answer:
      "Oui. Les consultations en visio sont remboursées dans les mêmes conditions que les consultations en présentiel — du moment que le praticien est certifié ASCA/RME. La majorité des complémentaires ont aligné leurs conditions pendant la pandémie et n'ont pas reculé depuis.",
  },
  {
    id: 6,
    question:
      'Que faire si mon assurance complémentaire refuse le remboursement ?',
    answer:
      "D'abord, vérifiez que votre contrat inclut bien le volet « médecines complémentaires » et que les agréments ASCA/RME y sont reconnus (la base, mais parfois oubliée). Si tout est en ordre et que le refus persiste, contactez votre conseiller pour comprendre les motifs — souvent un détail administratif à corriger. Et écrivez-nous : on peut vérifier ensemble ce qui coince.",
  },
];

export default function RemboursementPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <SmoothScrollProvider>
      <div
        className='ns2 min-h-screen'
        style={{ backgroundColor: 'var(--ns-cream-100)' }}
      >
        <MarketingHeader />
        <div style={{ height: 80 }} />

        {/* HERO — split 1.3fr / 1fr */}
        <section style={{ padding: '64px 0 80px' }}>
          <div className='ns2-container'>
            <div className='rb-hero-grid'>
              <div>
                <span className='ns2-sticker' style={{ marginBottom: 24 }}>
                  ✓ Certifiée ASCA / RME
                </span>
                <h1
                  className='ns2-display'
                  style={{
                    fontSize: 'clamp(40px, 6.4vw, 84px)',
                    margin: '16px 0 24px',
                    lineHeight: 0.95,
                    letterSpacing: '-0.035em',
                    color: 'var(--ns-ink)',
                  }}
                >
                  Une nutritionniste <em>remboursée</em>
                  <br />
                  par votre <span className='hl'>assurance.</span>
                </h1>
                <p
                  className='ns2-body-lg'
                  style={{
                    maxWidth: 540,
                    marginBottom: 32,
                    color: 'var(--ns-ink-2)',
                  }}
                >
                  Lucie est certifiée{' '}
                  <strong style={{ color: 'var(--ns-ink)' }}>ASCA</strong> et{' '}
                  <strong style={{ color: 'var(--ns-ink)' }}>RME</strong> — les
                  deux agréments suisses reconnus pour le remboursement des
                  soins nutritionnels par les assurances complémentaires. Swica,
                  Helsana, CSS, Visana, Groupe Mutuel, Assura, Concordia, Zurich
                  : la plupart prennent en charge tout ou partie de vos
                  consultations.
                </p>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href='/contact?type=consultation'
                  className='ns2-btn ns2-btn-peps'
                >
                  Réserver ma première consultation →
                </a>
              </div>
              <div className='rb-hero-image-wrap'>
                <div className='ns2-frame' style={{ aspectRatio: '4 / 3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src='https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&h=675&fit=crop&q=85'
                    alt='Consultation nutritionnelle en ligne'
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PARTENAIRES — bandeau logos cream-200 entre 2 bordures ink */}
        <section
          style={{
            background: 'var(--ns-cream-200)',
            borderTop: '1.5px solid var(--ns-ink)',
            borderBottom: '1.5px solid var(--ns-ink)',
            padding: '40px 24px',
          }}
        >
          <div
            className='ns2-container'
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div
              className='ns2-eyebrow ns2-eyebrow-dot'
              style={{ textAlign: 'center', color: 'var(--ns-ink-3)' }}
            >
              Assurances partenaires · 8 caisses
            </div>
            <div className='rb-logos-row'>
              {insurancePartners.map(insurance => (
                <div
                  key={insurance.name}
                  className='rb-logo-item'
                  title={insurance.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={insurance.logo}
                    alt={`Logo ${insurance.name}`}
                    style={{
                      height: 32,
                      width: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ ASSURANCE — split image gauche / texte droite */}
        <section style={{ padding: '96px 0' }}>
          <div className='ns2-container'>
            <div className='rb-split-grid'>
              <div className='ns2-frame' style={{ aspectRatio: '4 / 5' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src='https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&h=1125&fit=crop&q=85'
                  alt="Documents d'assurance et consultation nutritionnelle"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
              <div>
                <span
                  className='ns2-eyebrow ns2-eyebrow-dot'
                  style={{ color: 'var(--ns-ink-3)' }}
                >
                  La question qui revient toujours
                </span>
                <h2
                  className='ns2-display'
                  style={{
                    fontSize: 'clamp(28px, 4vw, 44px)',
                    margin: '12px 0 24px',
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em',
                    color: 'var(--ns-ink)',
                  }}
                >
                  La nutrition est-elle <em>remboursée</em> par votre assurance
                  ?
                </h2>
                <p
                  className='ns2-body-lg'
                  style={{ color: 'var(--ns-ink-2)', marginBottom: 16 }}
                >
                  <strong style={{ color: 'var(--ns-ink)' }}>Oui —</strong> pour
                  la grande majorité de nos patient·e·s. En Suisse,
                  l&apos;assurance de base LAMal ne couvre pas les consultations
                  avec un·e nutritionniste, mais la plupart des assurances
                  complémentaires le font. Les montants varient selon votre
                  contrat, mais le remboursement est souvent substantiel.
                </p>
                <p
                  className='ns2-body-lg'
                  style={{ color: 'var(--ns-ink-2)', marginBottom: 16 }}
                >
                  Le plus simple : un appel à votre caisse maladie avant la
                  première consultation. Demandez si la nutrition est couverte
                  par votre complémentaire, et à quel taux. Cinq minutes au
                  téléphone, et vous saurez exactement à quoi vous attendre.
                </p>
                <p
                  className='ns2-body-lg'
                  style={{ color: 'var(--ns-ink-2)', margin: 0 }}
                >
                  Nos consultations relèvent du volet «&nbsp;médecines
                  complémentaires&nbsp;» de votre assurance — celui qui couvre
                  une large gamme de besoins : gestion du poids, alimentation
                  sportive, prévention santé, équilibre familial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER — slab peps */}
        <section style={{ padding: '0 24px 96px' }}>
          <div className='ns2-container'>
            <div
              style={{
                background: 'var(--ns-peps)',
                border: '1.5px solid var(--ns-ink)',
                borderRadius: 'var(--ns-r-md)',
                boxShadow: 'var(--ns-shadow-hard-lg)',
                padding: 'clamp(28px, 4vw, 48px)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
              }}
            >
              <h3
                className='ns2-display'
                style={{
                  fontSize: 'clamp(22px, 2.6vw, 32px)',
                  margin: 0,
                  lineHeight: 1.1,
                  letterSpacing: '-0.025em',
                  color: 'var(--ns-ink)',
                  flex: '1 1 320px',
                }}
              >
                Réservez une consultation avec une{' '}
                <em>nutritionniste certifiée.</em>
              </h3>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href='/contact?type=consultation'
                className='ns2-btn ns2-btn-dark'
              >
                Commencer →
              </a>
            </div>
          </div>
        </section>

        {/* MALADIES CHRONIQUES — split texte gauche / image droite */}
        <section style={{ padding: '0 0 96px' }}>
          <div className='ns2-container'>
            <div className='rb-split-grid'>
              <div className='rb-split-text-first'>
                <span
                  className='ns2-eyebrow ns2-eyebrow-dot'
                  style={{ color: 'var(--ns-ink-3)' }}
                >
                  Accompagnement personnalisé
                </span>
                <h2
                  className='ns2-display'
                  style={{
                    fontSize: 'clamp(28px, 4vw, 44px)',
                    margin: '12px 0 24px',
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em',
                    color: 'var(--ns-ink)',
                  }}
                >
                  Pour les <em>maladies chroniques.</em>
                </h2>
                <p
                  className='ns2-body-lg'
                  style={{ color: 'var(--ns-ink-2)', marginBottom: 16 }}
                >
                  L&apos;accompagnement nutritionnel est une approche reconnue
                  pour gérer les maladies chroniques, ralentir leur progression
                  et réduire les risques de complications. La littérature
                  scientifique le démontre depuis longtemps : gestion du poids,
                  diabète, maladies cardiovasculaires, cholestérol — la
                  nutrition fait partie de la solution.
                </p>
                <p
                  className='ns2-body-lg'
                  style={{ color: 'var(--ns-ink-2)', marginBottom: 16 }}
                >
                  Diabète de type 2, maladies cardiovasculaires, surpoids,
                  syndrome métabolique ou autres conditions chroniques : un
                  suivi nutritionnel régulier peut faire une vraie différence
                  dans votre quotidien — et dans la trajectoire de votre santé.
                </p>
                <p
                  className='ns2-body-lg'
                  style={{ color: 'var(--ns-ink-2)', marginBottom: 32 }}
                >
                  Notre approche combine les connaissances scientifiques
                  actuelles avec un travail sur les habitudes — par petits
                  ajustements progressifs, qui s&apos;inscrivent dans la durée.
                </p>
                <div
                  style={{
                    background: 'var(--ns-cream-50)',
                    border: '1.5px solid var(--ns-ink)',
                    borderRadius: 'var(--ns-r-md)',
                    padding: '28px 32px',
                    boxShadow: 'var(--ns-shadow-hard)',
                  }}
                >
                  <div
                    className='ns2-eyebrow'
                    style={{ color: 'var(--ns-peps-deep)', marginBottom: 8 }}
                  >
                    ✦ Important
                  </div>
                  <p
                    className='ns2-body'
                    style={{ margin: 0, color: 'var(--ns-ink-2)' }}
                  >
                    En tant que nutritionniste, Lucie propose un accompagnement
                    complémentaire à votre suivi médical — axé sur la prévention
                    et les changements durables. Il ne remplace pas un
                    traitement médical, il l&apos;enrichit.
                  </p>
                </div>
              </div>
              <div
                className='ns2-frame rb-split-image-second'
                style={{ aspectRatio: '4 / 5' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src='https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=900&h=1125&fit=crop&q=85'
                  alt='Alimentation saine pour la gestion des maladies chroniques'
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* COMMENT ÇA MARCHE — 4 cartes processus */}
        <section
          style={{
            padding: '96px 0',
            background: 'var(--ns-cream-200)',
            borderTop: '1.5px solid var(--ns-ink)',
            borderBottom: '1.5px solid var(--ns-ink)',
          }}
        >
          <div className='ns2-container'>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: 56,
              }}
            >
              <span className='ns2-eyebrow ns2-eyebrow-dot'>
                Le processus · 4 étapes
              </span>
              <h2
                className='ns2-display'
                style={{
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  margin: '12px 0 16px',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  color: 'var(--ns-ink)',
                }}
              >
                Comment <em>ça marche</em> ?
              </h2>
              <p
                className='ns2-body-lg'
                style={{
                  maxWidth: 600,
                  color: 'var(--ns-ink-2)',
                  margin: 0,
                }}
              >
                Quatre étapes simples. Aucun papier à imprimer, aucune queue au
                guichet.
              </p>
            </div>

            <div className='grid-4'>
              {processSteps.map(step => (
                <div key={step.number} className='acard'>
                  <div
                    className='acard-img'
                    style={{
                      backgroundImage: `url('${step.image}')`,
                      position: 'relative',
                    }}
                  >
                    <span
                      className='ns2-sticker'
                      style={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        background: 'var(--ns-ink)',
                        color: 'var(--ns-peps)',
                        transform: 'rotate(-3deg)',
                      }}
                    >
                      {String(step.number).padStart(2, '0')}
                    </span>
                  </div>
                  <div className='acard-body'>
                    <h3
                      style={{
                        fontFamily: 'var(--ns-font-serif-stack)',
                        fontSize: 22,
                        fontWeight: 500,
                        margin: '0 0 12px',
                        letterSpacing: '-0.02em',
                        color: 'var(--ns-ink)',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className='ns2-body'
                      style={{ margin: 0, color: 'var(--ns-ink-2)' }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 56 }}>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href='/contact?type=consultation'
                className='ns2-btn ns2-btn-dark'
              >
                Réserver ma première consultation →
              </a>
            </div>
          </div>
        </section>

        {/* BON À SAVOIR — 4 cartes conseils */}
        <section style={{ padding: '96px 0' }}>
          <div className='ns2-container'>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: 56,
              }}
            >
              <span className='ns2-eyebrow ns2-eyebrow-dot'>
                Conseils pratiques
              </span>
              <h2
                className='ns2-display'
                style={{
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  margin: '12px 0 16px',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  color: 'var(--ns-ink)',
                }}
              >
                Bon à <em>savoir.</em>
              </h2>
              <p
                className='ns2-body-lg'
                style={{
                  maxWidth: 600,
                  color: 'var(--ns-ink-2)',
                  margin: 0,
                }}
              >
                Quatre réflexes pour des remboursements rapides et sans
                casse-tête.
              </p>
            </div>

            <div className='grid-4'>
              {adviceCards.map(advice => (
                <article
                  key={advice.title}
                  className='ns2-card-static'
                  style={{
                    padding: 28,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--ns-font-serif-stack)',
                      fontSize: 22,
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                      margin: '0 0 4px',
                      color: 'var(--ns-ink)',
                      lineHeight: 1.15,
                    }}
                  >
                    {advice.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--ns-font-serif-stack)',
                      fontStyle: 'italic',
                      fontSize: 14,
                      color: 'var(--ns-ink-3)',
                      margin: '0 0 14px',
                      paddingBottom: 14,
                      borderBottom: '1px dashed var(--ns-ink-4)',
                    }}
                  >
                    {advice.subtitle}
                  </p>
                  <p
                    className='ns2-body'
                    style={{ color: 'var(--ns-ink-2)', margin: '0 0 18px' }}
                  >
                    {advice.description}
                  </p>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    {advice.features.map(item => (
                      <li
                        key={item}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: 'var(--ns-peps)',
                            border: '1.5px solid var(--ns-ink)',
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                          aria-hidden='true'
                        >
                          <svg
                            width='10'
                            height='10'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='var(--ns-ink)'
                            strokeWidth='3'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          >
                            <polyline points='20 6 9 17 4 12' />
                          </svg>
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--ns-font-sans-stack)',
                            fontSize: 13,
                            lineHeight: 1.5,
                            color: 'var(--ns-ink-2)',
                          }}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div
              style={{
                marginTop: 56,
                maxWidth: 800,
                marginInline: 'auto',
                background: 'var(--ns-cream-50)',
                border: '1.5px solid var(--ns-ink)',
                borderRadius: 'var(--ns-r-md)',
                padding: '28px 36px',
                boxShadow: 'var(--ns-shadow-hard)',
                textAlign: 'center',
              }}
            >
              <div
                className='ns2-eyebrow'
                style={{ color: 'var(--ns-peps-deep)', marginBottom: 8 }}
              >
                ✦ Important
              </div>
              <p
                className='ns2-body'
                style={{ margin: 0, color: 'var(--ns-ink-2)' }}
              >
                Les montants et taux de remboursement varient selon votre
                contrat. Toutes les informations de cette page sont données à
                titre indicatif. Pour connaître votre couverture exacte,
                contactez directement votre assurance complémentaire.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION — panneau ink */}
        <section
          id='faq-remboursement'
          style={{
            background: 'var(--ns-ink)',
            color: 'var(--ns-cream-100)',
            padding: '96px 0',
            borderTop: '1.5px solid var(--ns-ink)',
          }}
        >
          <div className='ns2-container'>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: 48,
              }}
            >
              <span className='ns2-eyebrow' style={{ color: 'var(--ns-peps)' }}>
                ↘ FAQ Remboursement
              </span>
              <h2
                className='ns2-display'
                style={{
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  margin: '12px 0 16px',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  color: 'var(--ns-cream-100)',
                }}
              >
                Questions{' '}
                <em style={{ color: 'var(--ns-peps)' }}>fréquentes.</em>
              </h2>
              <p
                className='ns2-body-lg'
                style={{
                  maxWidth: 600,
                  color: 'var(--ns-ink-4)',
                  margin: 0,
                }}
              >
                Tout ce qu&apos;il faut savoir avant de soumettre votre première
                facture.
              </p>
            </div>

            <div style={{ maxWidth: 880, marginInline: 'auto' }}>
              {remboursementFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={faq.id}
                    style={{
                      borderTop:
                        index === 0
                          ? '1.5px solid rgba(255, 255, 255, 0.2)'
                          : 'none',
                      borderBottom: '1.5px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <button
                      type='button'
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-${faq.id}-answer`}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'transparent',
                        border: 'none',
                        padding: '24px 0',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--ns-cream-100)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--ns-font-serif-stack)',
                          fontSize: 'clamp(18px, 2vw, 22px)',
                          fontWeight: 500,
                          lineHeight: 1.3,
                          letterSpacing: '-0.018em',
                          flex: 1,
                          paddingRight: 16,
                        }}
                      >
                        {faq.question}
                      </span>
                      <span
                        aria-hidden='true'
                        style={{
                          flexShrink: 0,
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          border: '1.5px solid var(--ns-peps)',
                          color: 'var(--ns-peps)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 300ms var(--ns-ease)',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        <svg
                          width='18'
                          height='18'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <polyline points='6 9 12 15 18 9' />
                        </svg>
                      </span>
                    </button>
                    <div
                      id={`faq-${faq.id}-answer`}
                      style={{
                        maxHeight: isOpen ? '500px' : 0,
                        overflow: 'hidden',
                        transition:
                          'max-height 400ms var(--ns-ease), opacity 300ms var(--ns-ease)',
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--ns-font-sans-stack)',
                          fontSize: 16,
                          lineHeight: 1.65,
                          color: 'var(--ns-ink-4)',
                          margin: '0 0 24px',
                          paddingRight: 52,
                        }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: 48 }}>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href='/contact?type=question'
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  fontFamily: 'var(--ns-font-sans-stack)',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--ns-peps)',
                  textDecoration: 'none',
                  paddingBottom: 4,
                  borderBottom: '1.5px solid var(--ns-peps)',
                  transition: 'gap 200ms var(--ns-ease)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.gap = '14px';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.gap = '10px';
                }}
              >
                <span>→</span>
                <span>Vous avez une autre question ?</span>
              </a>
            </div>
          </div>
        </section>

        <MarketingFooter />

        <style jsx global>{`
          .rb-hero-grid {
            display: grid;
            grid-template-columns: 1.3fr 1fr;
            gap: 56px;
            align-items: center;
          }
          .rb-hero-image-wrap {
            display: flex;
            justify-content: center;
          }
          .rb-split-grid {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 56px;
            align-items: center;
          }
          .rb-logos-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 48px;
          }
          .rb-logo-item {
            display: inline-flex;
            align-items: center;
            opacity: 0.85;
            transition:
              opacity 200ms var(--ns-ease),
              transform 200ms var(--ns-ease);
            filter: grayscale(15%);
          }
          .rb-logo-item:hover {
            opacity: 1;
            transform: scale(1.05);
            filter: grayscale(0%);
          }
          @media (max-width: 1024px) {
            .rb-hero-grid,
            .rb-split-grid {
              grid-template-columns: 1fr;
              gap: 40px;
            }
            .rb-split-image-second {
              order: -1;
            }
            .rb-split-text-first {
              order: 1;
            }
          }
          @media (max-width: 640px) {
            .rb-logos-row {
              gap: 28px;
            }
          }
        `}</style>
      </div>
    </SmoothScrollProvider>
  );
}
