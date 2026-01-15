'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  const [activeTab, setActiveTab] = useState<
    'fondation' | 'transformation' | 'parcours'
  >('transformation');

  // Animation refs
  const { elementRef: heroRef, isInView: heroVisible } = useScrollAnimation();
  const { elementRef: discoveryRef, isInView: discoveryVisible } =
    useScrollAnimation();
  const { elementRef: pricingRef, isInView: pricingVisible } =
    useScrollAnimation();
  const { elementRef: comparisonRef, isInView: comparisonVisible } =
    useScrollAnimation();
  const { elementRef: consultationsRef, isInView: consultationsVisible } =
    useScrollAnimation();
  const { elementRef: platformRef, isInView: platformVisible } =
    useScrollAnimation();
  const { elementRef: addonsRef, isInView: addonsVisible } =
    useScrollAnimation();
  const { elementRef: insuranceRef, isInView: insuranceVisible } =
    useScrollAnimation();
  const { elementRef: termsRef, isInView: termsVisible } = useScrollAnimation();
  const { elementRef: faqRef, isInView: faqVisible } = useScrollAnimation();
  const { elementRef: ctaRef, isInView: ctaVisible } = useScrollAnimation();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Modalités accordion state and refs
  const modalitesRef = useRef(null);
  const modalitesInView = useInView(modalitesRef, { once: true, margin: '-100px' });
  const [openModalite, setOpenModalite] = useState<number | null>(null);

  const modalitesImages: Record<number, string> = {
    1: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80', // Paiement
    2: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop&q=80', // Annulation
    3: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&q=80', // Report
  };
  const [activeModaliteImage, setActiveModaliteImage] = useState(modalitesImages[1]);

  const handleToggleModalite = (id: number) => {
    if (openModalite === id) {
      setOpenModalite(null);
    } else {
      setOpenModalite(id);
      setActiveModaliteImage(modalitesImages[id]);
    }
  };

  // Remboursement banner ref
  const remboursementBannerRef = useRef(null);
  const remboursementBannerInView = useInView(remboursementBannerRef, { once: true, margin: '-50px' });

  // Données pour les onglets de comparaison mobile
  const comparisonData = {
    fondation: {
      name: 'Fondation',
      price: 'CHF 449',
      duration: '2 mois',
      badge: 'IDÉAL POUR DÉMARRER',
      badgeColor: 'bg-[#7C9885]/15 text-[#2C3E3C]',
      features: [
        { label: 'Consultation découverte', value: '✓ Incluse' },
        { label: 'Consultations de suivi', value: '2 consultations' },
        { label: 'Accès plateforme', value: '2 mois' },
        { label: 'Plan alimentaire personnalisé', value: '✓ Inclus' },
        { label: 'Suivi des habitudes', value: '✓ Inclus' },
        { label: 'Messagerie standard', value: '✓ Incluse' },
        { label: 'Messagerie prioritaire', value: '✗ Non incluse' },
        { label: 'Garantie satisfaction', value: '30 jours' },
      ],
    },
    transformation: {
      name: 'Transformation',
      price: 'CHF 749',
      duration: '3 mois',
      badge: '⭐ LE PLUS CHOISI',
      badgeColor: 'bg-[#D4A574] text-white',
      features: [
        { label: 'Consultation découverte', value: '✓ Incluse' },
        { label: 'Consultations de suivi', value: '4 consultations' },
        { label: 'Accès plateforme', value: '3 mois' },
        { label: 'Plan alimentaire personnalisé', value: '✓ Inclus' },
        { label: 'Suivi des habitudes', value: '✓ Inclus' },
        { label: 'Messagerie standard', value: '✓ Incluse' },
        { label: 'Messagerie prioritaire', value: '1 mois offert' },
        { label: 'Garantie satisfaction', value: '60 jours' },
      ],
    },
    parcours: {
      name: 'Parcours Complet',
      price: "CHF 1'299",
      duration: '6 mois',
      badge: 'TRANSFORMATION PROFONDE',
      badgeColor: 'bg-[#7C9885]/15 text-[#2C3E3C]',
      features: [
        { label: 'Consultation découverte', value: '✓ Incluse' },
        { label: 'Consultations de suivi', value: '8 consultations' },
        { label: 'Accès plateforme', value: '6 mois' },
        { label: 'Plan alimentaire personnalisé', value: '✓ Inclus' },
        { label: 'Suivi des habitudes', value: '✓ Inclus' },
        { label: 'Messagerie standard', value: '✓ Incluse' },
        { label: 'Messagerie prioritaire', value: '✓ Incluse (6 mois)' },
        { label: 'Garantie satisfaction', value: '90 jours' },
      ],
    },
  };

  const faqData = [
    {
      question: 'Quel forfait choisir ?',
      answer:
        "Cela dépend de vos objectifs :\n- Fondation : Pour tester ou un besoin ponctuel (2 mois)\n- Transformation : Pour créer de vraies habitudes durables (3 mois) - Le plus choisi !\n- Parcours Complet : Pour une transformation profonde avec soutien continu (6 mois)\n\nSi vous hésitez, réservez d'abord la consultation découverte. Nous déciderons ensemble du meilleur forfait pour vous.",
    },
    {
      question: 'Puis-je payer en plusieurs fois ?',
      answer:
        'Actuellement, les forfaits sont payables en une fois. Si vous avez des contraintes financières, contactez-moi pour voir ce qui est possible.',
    },
    {
      question: 'Que se passe-t-il après la fin de mon forfait ?',
      answer:
        "Vous avez plusieurs options :\n- Continuer avec des consultations à l'unité (CHF 180/consultation)\n- Prolonger l'accès à la plateforme uniquement (CHF 90/mois)\n- Arrêter l'accompagnement (vous gardez tout ce que vous avez appris !)\n\nL'objectif est que vous deveniez autonome, pas dépendante de moi.",
    },
    {
      question: 'Les forfaits sont-ils remboursés en entier ?',
      answer:
        "Cela dépend de votre contrat d'assurance complémentaire. La plupart des assurances remboursent entre 50% et 90% de vos consultations, dans la limite d'un plafond annuel (généralement CHF 500 à CHF 3'000).\n\nVérifiez auprès de votre assurance avant de débuter.",
    },
    {
      question: 'Puis-je changer de forfait en cours de route ?',
      answer:
        'Oui ! Si vous commencez avec Fondation et souhaitez prolonger :\n- Vous payez la différence pour passer au forfait supérieur\n- Les consultations déjà effectuées sont déduites\n- Vous bénéficiez du tarif avantageux du forfait étendu',
    },
    {
      question: 'Dois-je prendre la consultation découverte avant un forfait ?',
      answer:
        "Oui, c'est obligatoire. La consultation découverte est incluse dans tous les forfaits. C'est le point de départ indispensable pour :\n- Comprendre votre situation\n- Créer votre programme personnalisé\n- Vérifier que mon approche vous convient",
    },
    {
      question: 'La messagerie prioritaire est-elle vraiment utile ?',
      answer:
        "Cela dépend de votre besoin de soutien :\n- Si vous êtes autonome et patiente : Pas nécessaire\n- Si vous avez besoin d'être rassurée ou guidée rapidement : Très utile\n\nElle est particulièrement recommandée pour :\n- Les débuts d'accompagnement (premiers mois)\n- Les périodes de stress ou difficultés\n- Les personnes qui aiment poser beaucoup de questions\n\nElle est incluse dans le Parcours Complet.",
    },
    {
      question: "Puis-je offrir un forfait à quelqu'un ?",
      answer:
        'Oui ! Contactez-moi pour créer un bon cadeau personnalisé. La personne pourra réserver sa consultation découverte quand elle le souhaite.',
    },
    {
      question: 'Y a-t-il des frais cachés ?',
      answer:
        'Non, aucun. Le prix affiché est le prix final. Vous ne payez rien de plus.\n\nLes seules options supplémentaires possibles (mais non obligatoires) :\n- Messagerie prioritaire : CHF 90/mois\n- Prolongation plateforme après forfait : CHF 90/mois',
    },
    {
      question: "Puis-je essayer avant de m'engager ?",
      answer:
        "Oui ! Vous pouvez :\n- Réserver juste la consultation découverte (CHF 150) pour voir si ça vous convient\n- Essayer la plateforme gratuitement pendant 7 jours (via le site)\n- Décider ensuite si vous souhaitez un forfait ou continuer à l'unité",
    },
  ];

  return (
    <div className='min-h-screen'>
      {/* Header Marketing */}
      <MarketingHeader />

      {/* Section Hero */}
      <section
        ref={heroRef}
        className='min-h-[60vh] bg-gradient-to-br from-white to-[#7C9885]/[0.03] flex items-center justify-center text-center px-6 py-[60px] sm:py-[100px] md:px-10 md:py-[120px] pt-[140px] md:pt-[160px]'
      >
        <div className='max-w-[900px] mx-auto'>
          {/* Label au-dessus du H1 */}
          <div
            className={`transition-all duration-600 ${
              heroVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-[#7C9885] text-sm font-semibold uppercase tracking-[2px] mb-5 font-['Inter']">
              NOS FORFAITS
            </p>
          </div>

          {/* Titre principal H1 */}
          <div
            className={`transition-all duration-800 delay-100 ${
              heroVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 className="font-['Playfair_Display'] text-[2.25rem] sm:text-4xl lg:text-5xl font-bold text-[#2C3E3C] leading-[1.2] max-w-[800px] mx-auto mb-6 text-center">
              Des Formules Adaptées à Vos Besoins et Votre Rythme
            </h1>
          </div>

          {/* Sous-titre */}
          <div
            className={`transition-all duration-800 delay-200 ${
              heroVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="font-['Inter'] text-base sm:text-lg lg:text-xl font-normal text-[#667674] leading-[1.7] max-w-[750px] mx-auto mb-10 text-center">
              Que vous cherchiez un accompagnement ponctuel ou une
              transformation profonde, il y a une formule pour vous. Tous les
              forfaits incluent l'accès à la plateforme digitale et sont
              remboursables par votre assurance complémentaire.
            </p>
          </div>

          {/* Badges de confiance */}
          <div
            className={`mt-10 transition-all duration-800 delay-300 ${
              heroVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className='flex flex-wrap justify-center items-center gap-4 sm:gap-6'>
              {/* Badge 1 */}
              <div
                className={`flex items-center bg-[#7C9885]/10 px-5 py-2.5 rounded-full gap-2 transition-all duration-800 ${
                  heroVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: '350ms' }}
              >
                <svg
                  className='w-4 h-4 text-[#7C9885]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                <span className="font-['Inter'] text-sm font-semibold text-[#2C3E3C]">
                  Remboursable ASCA/RME
                </span>
              </div>

              {/* Badge 2 */}
              <div
                className={`flex items-center bg-[#7C9885]/10 px-5 py-2.5 rounded-full gap-2 transition-all duration-800 ${
                  heroVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: '400ms' }}
              >
                <svg
                  className='w-4 h-4 text-[#7C9885]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                <span className="font-['Inter'] text-sm font-semibold text-[#2C3E3C]">
                  Sans engagement
                </span>
              </div>

              {/* Badge 3 */}
              <div
                className={`flex items-center bg-[#7C9885]/10 px-5 py-2.5 rounded-full gap-2 transition-all duration-800 ${
                  heroVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: '450ms' }}
              >
                <svg
                  className='w-4 h-4 text-[#7C9885]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                <span className="font-['Inter'] text-sm font-semibold text-[#2C3E3C]">
                  Plateforme incluse
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Consultation Découverte */}
      <section
        ref={discoveryRef}
        className='bg-white py-[60px] sm:py-[100px] px-6 sm:px-10 md:py-[60px] md:px-6'
      >
        <div className='max-w-[1000px] mx-auto'>
          {/* Titre de section */}
          <h2
            className={`font-['Playfair_Display'] text-[2.5rem] md:text-[2rem] font-bold text-[#2C3E3C] text-left md:text-center mb-10 transition-all duration-800 ${
              discoveryVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            Tout Commence Par la Consultation Découverte
          </h2>

          {/* Layout Split - 60% contenu / 40% carte */}
          <div className='flex flex-col lg:flex-row items-center gap-[60px]'>
            {/* Côté gauche - Contenu explicatif (60%) */}
            <div className='flex-1 lg:w-[60%] animate-fade-slide-up'>
              {/* Texte principal */}
              <p className="font-['Inter'] text-lg md:text-base text-[#667674] leading-[1.7] mb-6">
                Que vous choisissiez un forfait ou une consultation unique,
                votre parcours commence toujours par une consultation découverte
                de 1h30.
              </p>

              <p className="font-['Inter'] text-lg md:text-base text-[#667674] leading-[1.7] mb-6">
                C'est durant cette première rencontre que :
              </p>

              {/* Liste à puces */}
              <div className='flex flex-col gap-3 ml-0'>
                <div className='flex items-start gap-3'>
                  <svg
                    className='w-4 h-4 text-[#7C9885] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-base leading-[1.6] text-[#667674]">
                    J'analyse votre situation complète (santé, habitudes,
                    objectifs)
                  </span>
                </div>

                <div className='flex items-start gap-3'>
                  <svg
                    className='w-4 h-4 text-[#7C9885] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-base leading-[1.6] text-[#667674]">
                    Vous comprenez mon approche et comment je travaille
                  </span>
                </div>

                <div className='flex items-start gap-3'>
                  <svg
                    className='w-4 h-4 text-[#7C9885] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-base leading-[1.6] text-[#667674]">
                    Nous définissons ensemble le meilleur plan d'action pour
                    vous
                  </span>
                </div>

                <div className='flex items-start gap-3'>
                  <svg
                    className='w-4 h-4 text-[#7C9885] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-base leading-[1.6] text-[#667674]">
                    Vous décidez si vous souhaitez poursuivre avec un forfait ou
                    à l'unité
                  </span>
                </div>
              </div>
            </div>

            {/* Côté droit - Carte d'information (40%) */}
            <div className='w-full lg:w-[40%] lg:sticky lg:top-[100px] animate-fade-slide-up animation-delay-200'>
              <div className='bg-[#F8FAF9] p-10 md:p-8 rounded-xl border-l-[6px] border-[#7C9885] shadow-[0_4px_20px_rgba(124,152,133,0.12)] max-w-[400px] mx-auto lg:max-w-none'>
                {/* Titre de la carte */}
                <h3 className="font-['Inter'] text-xl font-bold uppercase tracking-[0.5px] text-[#2C3E3C] mb-5">
                  CONSULTATION DÉCOUVERTE
                </h3>

                {/* Durée et Prix */}
                <div className='flex justify-between items-center mb-6'>
                  <span className="font-['Inter'] text-base text-[#667674]">
                    Durée : 1h30
                  </span>
                  <span className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Prix : CHF 150
                  </span>
                </div>

                {/* Ligne de séparation */}
                <div className='w-full h-px bg-[#7C9885]/20 my-6'></div>

                {/* Label "Inclus" */}
                <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-4">
                  Inclus :
                </h4>

                {/* Liste des éléments inclus */}
                <div className='flex flex-col gap-3 mb-5'>
                  <div className='flex items-start gap-2.5 animate-fade-slide-up animation-delay-300'>
                    <svg
                      className='w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                      Anamnèse complète et approfondie
                    </span>
                  </div>

                  <div className='flex items-start gap-2.5 animate-fade-slide-up animation-delay-350'>
                    <svg
                      className='w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                      Analyse de vos habitudes alimentaires
                    </span>
                  </div>

                  <div className='flex items-start gap-2.5 animate-fade-slide-up animation-delay-400'>
                    <svg
                      className='w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                      Évaluation de vos symptômes
                    </span>
                  </div>

                  <div className='flex items-start gap-2.5 animate-fade-slide-up animation-delay-450'>
                    <svg
                      className='w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                      Premières recommandations personnalisées
                    </span>
                  </div>

                  <div className='flex items-start gap-2.5 animate-fade-slide-up animation-delay-500'>
                    <svg
                      className='w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                      Plan d'action clair
                    </span>
                  </div>

                  <div className='flex items-start gap-2.5 animate-fade-slide-up animation-delay-550'>
                    <svg
                      className='w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                      Accès à votre plateforme NutriSensia
                    </span>
                  </div>
                </div>

                {/* Note de remboursement */}
                <p className="font-['Inter'] text-sm italic text-[#9BA5A3] mt-5 mb-8">
                  Remboursable par votre assurance complémentaire
                </p>

                {/* Bouton CTA */}
                <Button className='w-full bg-gradient-to-r from-[#7C9885] to-[#6B8574] hover:from-[#6B8574] hover:to-[#5A7463] text-white font-semibold py-4 px-6 text-base transition-all duration-200 shadow-lg hover:shadow-xl'>
                  <div className='flex items-center justify-center gap-2'>
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    <span>Réserver Ma Consultation Découverte</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Forfaits */}
      <section
        ref={pricingRef}
        className='bg-gradient-to-br from-[#7C9885]/[0.03] to-[#7C9885]/[0.05] py-[60px] sm:py-[100px] px-6 sm:px-10 md:py-[60px] md:px-6'
      >
        <div className='max-w-[1300px] mx-auto'>
          {/* Header de section */}
          <div
            className={`text-center mb-[60px] transition-all duration-800 ${
              pricingVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="font-['Inter'] text-sm font-semibold uppercase tracking-[1.5px] text-[#7C9885] mb-3">
              CHOISISSEZ VOTRE FORMULE
            </p>

            <h2 className="font-['Playfair_Display'] text-[1.75rem] sm:text-[2rem] lg:text-[2.5rem] font-bold text-[#2C3E3C] mb-5">
              Choisissez le Forfait Qui Vous Correspond
            </h2>

            <p className="font-['Inter'] text-lg text-[#667674] max-w-[800px] mx-auto">
              Plus vous vous engagez sur la durée, plus le prix par consultation
              diminue. Chaque forfait est conçu pour des objectifs différents.
            </p>
          </div>

          {/* Grid des cartes forfaits */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start'>
            {/* Carte Fondation */}
            <div
              className={`bg-white border-2 border-[#E5E7E6] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_2px_15px_rgba(44,62,60,0.06)] flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(44,62,60,0.12)] ${
                pricingVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              } delay-100`}
            >
              {/* Badge */}
              <div className='bg-[#7C9885]/15 text-[#2C3E3C] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.5px] mb-5 self-start'>
                IDÉAL POUR DÉMARRER
              </div>

              {/* Nom du forfait */}
              <h3 className="font-['Inter'] text-xl sm:text-2xl font-bold uppercase tracking-[1px] text-[#2C3E3C] mb-3">
                FONDATION
              </h3>

              {/* Durée */}
              <p className="font-['Inter'] text-base text-[#667674] mb-6">
                2 mois d'accompagnement
              </p>

              {/* Prix */}
              <div className='mb-4'>
                <div className='flex items-baseline mb-2'>
                  <span className="font-['Inter'] text-xl text-[#667674] mr-2">
                    CHF
                  </span>
                  <span className="font-['Playfair_Display'] text-[2.5rem] sm:text-[3rem] lg:text-[3.5rem] font-bold text-[#7C9885]">
                    449
                  </span>
                </div>
                <p className="font-['Inter'] text-sm italic text-[#9BA5A3]">
                  Soit CHF 150 par consultation (au lieu de CHF 180)
                </p>
              </div>

              {/* Description */}
              <div className='bg-[#7C9885]/5 p-4 rounded-lg mb-8'>
                <p className="font-['Inter'] text-base italic text-[#667674] leading-[1.5]">
                  Pour poser de bonnes bases et voir les premiers résultats
                </p>
              </div>

              {/* Séparateur */}
              <div className='w-full h-px bg-[#E5E7E6] my-8'></div>

              {/* Ce qui est inclus */}
              <h4 className="font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C] mb-5">
                CE QUI EST INCLUS :
              </h4>

              {/* Section Consultations */}
              <div className='mb-5'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>📋</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Consultations
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      1 consultation découverte (1h30)
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      2 consultations de suivi (1h chacune)
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Total : 3 consultations sur 2 mois
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Programme nutritionnel */}
              <div className='mb-5'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>🍴</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Programme nutritionnel
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Programme alimentaire personnalisé
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Plans de repas adaptés à vos goûts
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Listes de courses automatiques
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Recettes et alternatives
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Plateforme */}
              <div className='mb-5'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>📱</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Plateforme digitale (2 mois)
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Accès 24/7
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Journal alimentaire avec photos
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Suivi de vos progrès
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Ressources éducatives
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Gestion rendez-vous
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Documents assurance
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Suivi */}
              <div className='mb-8'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>📊</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Suivi
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Ajustements selon résultats
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Réponses à vos questions
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Suivi alimentaire illimité
                    </span>
                  </div>
                </div>
              </div>

              {/* Séparateur */}
              <div className='w-full h-px bg-[#E5E7E6] my-8'></div>

              {/* Pour qui */}
              <h4 className="font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C] mb-3">
                POUR QUI ?
              </h4>
              <div className='space-y-2.5 mb-8'>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Vous voulez tester l'accompagnement
                </p>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Besoin d'un coup de pouce ponctuel
                </p>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Objectifs simples et à court terme
                </p>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Poser de bonnes bases
                </p>
              </div>

              {/* Bouton CTA */}
              <Button
                variant='outline'
                className='w-full mt-auto border-2 border-[#7C9885] text-[#7C9885] hover:bg-[#7C9885]/5 py-3.5 px-6 text-base font-semibold transition-all duration-200'
              >
                Choisir Fondation
              </Button>
            </div>

            {/* Carte Transformation - MISE EN VALEUR */}
            <div
              className={`bg-white border-[3px] border-[#7C9885] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_8px_30px_rgba(124,152,133,0.15)] flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(124,152,133,0.2)] lg:scale-105 z-10 ${
                pricingVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              } delay-200`}
            >
              {/* Badge spécial */}
              <div className='bg-[#D4A574] text-white px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.5px] mb-5 self-start'>
                ⭐ LE PLUS CHOISI
              </div>

              {/* Nom du forfait */}
              <h3 className="font-['Inter'] text-2xl font-bold uppercase tracking-[1px] text-[#2C3E3C] mb-3">
                TRANSFORMATION
              </h3>

              {/* Durée */}
              <p className="font-['Inter'] text-base text-[#667674] mb-6">
                3 mois d'accompagnement
              </p>

              {/* Prix */}
              <div className='mb-4'>
                <div className='flex items-baseline mb-2'>
                  <span className="font-['Inter'] text-xl text-[#667674] mr-2">
                    CHF
                  </span>
                  <span className="font-['Playfair_Display'] text-[3.5rem] font-bold text-[#7C9885]">
                    1'199
                  </span>
                </div>
                <p className="font-['Inter'] text-sm italic text-[#9BA5A3]">
                  Soit CHF 171 par consultation (au lieu de CHF 180)
                </p>
              </div>

              {/* Description */}
              <div className='bg-[#7C9885]/5 p-4 rounded-lg mb-8'>
                <p className="font-['Inter'] text-base italic text-[#667674] leading-[1.5]">
                  L'équilibre parfait pour ancrer de vraies habitudes durables
                </p>
              </div>

              {/* Pourquoi c'est le plus choisi - UNIQUE */}
              <div className='bg-[#D4A574]/10 border-l-[3px] border-[#D4A574] p-5 rounded-lg mb-6'>
                <h5 className="font-['Inter'] text-[0.95rem] font-bold text-[#2C3E3C] mb-3">
                  Pourquoi c'est le plus choisi ?
                </h5>
                <div className='space-y-2'>
                  <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                    → Voir résultats concrets (énergie, digestion, poids)
                  </p>
                  <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                    → Ancrer vraies habitudes alimentaires
                  </p>
                  <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                    → Traverser différentes situations
                  </p>
                  <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                    → Ajuster finement selon besoins
                  </p>
                </div>
              </div>

              {/* Séparateur */}
              <div className='w-full h-px bg-[#E5E7E6] my-8'></div>

              {/* Ce qui est inclus */}
              <h4 className="font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C] mb-5">
                CE QUI EST INCLUS :
              </h4>

              {/* Section Consultations */}
              <div className='mb-5'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>📋</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Consultations
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      1 consultation découverte (1h30)
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      5 consultations de suivi (1h chacune)
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Total : 6 consultations sur 3 mois
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Rythme : Toutes les 2 semaines
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Programme nutritionnel */}
              <div className='mb-5'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>🍴</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Programme nutritionnel
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Programme personnalisé et évolutif
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Plans de repas variés et saisonniers
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Listes de courses automatiques
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Recettes et alternatives multiples
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Ajustements réguliers
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Plateforme */}
              <div className='mb-5'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>📱</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Plateforme digitale (3 mois)
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Accès 24/7
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Journal alimentaire avec analyses
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Suivi détaillé des progrès
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Ressources éducatives avancées
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Fiches pratiques
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Gestion rendez-vous
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Documents assurance
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Suivi renforcé */}
              <div className='mb-5'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>📊</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Suivi renforcé
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Ajustements toutes les 2 semaines
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Coaching et motivation
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Suivi alimentaire illimité
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Réponses détaillées
                    </span>
                  </div>
                </div>
              </div>

              {/* Option messagerie */}
              <div className='bg-[#7C9885]/5 p-4 rounded-lg mb-8'>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.5]">
                  + Messagerie prioritaire (CHF 90/mois option)
                </p>
              </div>

              {/* Séparateur */}
              <div className='w-full h-px bg-[#E5E7E6] my-8'></div>

              {/* Pour qui */}
              <h4 className="font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C] mb-3">
                POUR QUI ?
              </h4>
              <div className='space-y-2.5 mb-8'>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Résultats durables (pas temporaires)
                </p>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Transformation corporelle/métabolique
                </p>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Troubles hormonaux ou digestifs
                </p>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Créer habitudes qui tiennent
                </p>
              </div>

              {/* Bouton CTA principal */}
              <Button className='w-full mt-auto bg-[#7C9885] hover:bg-[#6B8574] text-white py-3.5 px-6 text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl'>
                Choisir Transformation
              </Button>
            </div>

            {/* Carte Parcours Complet */}
            <div
              className={`bg-white border-2 border-[#E5E7E6] rounded-2xl p-10 md:p-8 shadow-[0_2px_15px_rgba(44,62,60,0.06)] flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(44,62,60,0.12)] ${
                pricingVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              } delay-300`}
            >
              {/* Badge */}
              <div className='bg-[#7C9885]/15 text-[#2C3E3C] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.5px] mb-5 self-start'>
                TRANSFORMATION PROFONDE
              </div>

              {/* Nom du forfait */}
              <h3 className="font-['Inter'] text-2xl font-bold uppercase tracking-[1px] text-[#2C3E3C] mb-3">
                PARCOURS COMPLET
              </h3>

              {/* Durée */}
              <p className="font-['Inter'] text-base text-[#667674] mb-6">
                6 mois d'accompagnement
              </p>

              {/* Prix */}
              <div className='mb-4'>
                <div className='flex items-baseline mb-2'>
                  <span className="font-['Inter'] text-xl text-[#667674] mr-2">
                    CHF
                  </span>
                  <span className="font-['Playfair_Display'] text-[3.5rem] font-bold text-[#7C9885]">
                    2'199
                  </span>
                </div>
                <p className="font-['Inter'] text-sm italic text-[#9BA5A3]">
                  Soit CHF 183 par consultation + 6 mois de plateforme (valeur
                  CHF 540)
                </p>
              </div>

              {/* Description */}
              <div className='bg-[#7C9885]/5 p-4 rounded-lg mb-8'>
                <p className="font-['Inter'] text-base italic text-[#667674] leading-[1.5]">
                  Pour une transformation complète et un accompagnement sur
                  mesure
                </p>
              </div>

              {/* Séparateur */}
              <div className='w-full h-px bg-[#E5E7E6] my-8'></div>

              {/* Ce qui est inclus */}
              <h4 className="font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C] mb-5">
                CE QUI EST INCLUS :
              </h4>

              {/* Section Consultations */}
              <div className='mb-5'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>📋</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Consultations
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      1 consultation découverte (1h30)
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      11 consultations de suivi (1h chacune)
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Total : 12 consultations sur 6 mois
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Rythme : Toutes les 2 semaines
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Programme nutritionnel */}
              <div className='mb-5'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>🍴</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Programme nutritionnel
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Programme personnalisé et évolutif
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Plans variés et saisonniers
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Listes de courses automatiques
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Recettes multiples
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Ajustements réguliers
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Accompagnement plusieurs cycles
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Plateforme */}
              <div className='mb-5'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>📱</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Plateforme digitale (6 mois)
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Accès 24/7
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Journal avec analyses
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Suivi détaillé
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Ressources premium
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Contenus exclusifs
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Gestion complète
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Documents assurance
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Suivi premium */}
              <div className='mb-5'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>📊</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Suivi premium
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Ajustements toutes les 2 semaines
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Coaching approfondi
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Suivi illimité
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Stratégies situations complexes
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Messagerie incluse */}
              <div className='mb-8'>
                <div className='flex items-center gap-2.5 mb-2.5'>
                  <span className='text-xl'>💬</span>
                  <h5 className="font-['Inter'] text-base font-bold text-[#7C9885]">
                    Messagerie incluse
                  </h5>
                </div>
                <div className='pl-8 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Chat direct avec moi
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Questions quand vous voulez
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Réponse sous 48h
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <svg
                      className='w-3 h-3 text-green-600 mt-1 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm leading-[1.5] text-[#667674]">
                      Soutien continu 6 mois
                    </span>
                  </div>
                </div>
              </div>

              {/* Séparateur */}
              <div className='w-full h-px bg-[#E5E7E6] my-8'></div>

              {/* Pour qui */}
              <h4 className="font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C] mb-3">
                POUR QUI ?
              </h4>
              <div className='space-y-2.5 mb-8'>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Objectifs complexes ou multiples
                </p>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Pathologies chroniques
                </p>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Accompagnement ultra-personnalisé
                </p>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Transformation profonde
                </p>
                <p className="font-['Inter'] text-sm text-[#667674] leading-[1.6]">
                  • Soutien long terme
                </p>
              </div>

              {/* Bouton CTA */}
              <Button
                variant='outline'
                className='w-full mt-auto border-2 border-[#7C9885] text-[#7C9885] hover:bg-[#7C9885]/5 py-3.5 px-6 text-base font-semibold transition-all duration-200'
              >
                Choisir Parcours Complet
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Comparaison des Forfaits */}
      <section
        id='comparison-section'
        className='bg-white py-[100px] px-10 md:py-[60px] md:px-6'
      >
        <div className='max-w-[1200px] mx-auto'>
          {/* Header de section */}
          <div
            className={`text-center mb-[60px] transition-all duration-800 ${
              comparisonVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="font-['Playfair_Display'] text-[1.75rem] sm:text-[2rem] lg:text-[2.5rem] font-bold text-[#2C3E3C] mb-5">
              Comparaison Détaillée des Forfaits
            </h2>
          </div>

          {/* Version Mobile - Onglets */}
          <div className='md:hidden'>
            {/* Onglets */}
            <div className='flex mb-8 bg-[#F8FAF9] rounded-xl p-1'>
              {Object.entries(comparisonData).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 min-h-[48px] ${
                    activeTab === key
                      ? 'bg-[#7C9885] text-white shadow-md'
                      : 'text-[#667674] hover:text-[#2C3E3C]'
                  }`}
                >
                  {data.name}
                </button>
              ))}
            </div>

            {/* Contenu de l'onglet actif */}
            <div className='bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(44,62,60,0.08)]'>
              {(() => {
                const currentData = comparisonData[activeTab];
                return (
                  <>
                    {/* Badge */}
                    <div
                      className={`${currentData.badgeColor} px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.5px] mb-4 inline-block`}
                    >
                      {currentData.badge}
                    </div>

                    {/* Nom et prix */}
                    <div className='mb-6'>
                      <h3 className="font-['Inter'] text-xl font-bold uppercase tracking-[1px] text-[#2C3E3C] mb-2">
                        {currentData.name}
                      </h3>
                      <div className='flex items-baseline mb-2'>
                        <span className="font-['Playfair_Display'] text-[2.5rem] font-bold text-[#7C9885]">
                          {currentData.price}
                        </span>
                      </div>
                      <p className="font-['Inter'] text-base text-[#667674]">
                        {currentData.duration} d'accompagnement
                      </p>
                    </div>

                    {/* Caractéristiques */}
                    <div className='space-y-4'>
                      {currentData.features.map((feature, index) => (
                        <div
                          key={index}
                          className='flex justify-between items-center py-3 border-b border-[#E5E7E6] last:border-b-0'
                        >
                          <span className="font-['Inter'] text-sm text-[#2C3E3C] font-medium">
                            {feature.label}
                          </span>
                          <span className="font-['Inter'] text-sm text-[#667674] text-right">
                            {feature.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className='mt-6'>
                      <Button
                        variant='primary'
                        size='lg'
                        className='w-full min-h-[48px] bg-[#7C9885] hover:bg-[#6A8773] text-white font-semibold'
                      >
                        Choisir {currentData.name}
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Table de comparaison - Desktop */}
          <div className='hidden md:block'>
            <div className='w-full rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(44,62,60,0.08)]'>
              <table className='w-full'>
                {/* Header de table */}
                <thead className='bg-[#F8FAF9] sticky top-[80px] z-[5] border-b-2 border-[#7C9885]'>
                  <tr>
                    <th
                      scope='col'
                      className="text-left p-5 font-['Inter'] text-base font-bold text-[#2C3E3C] w-[35%]"
                    >
                      Caractéristique
                    </th>
                    <th
                      scope='col'
                      className="text-center p-5 font-['Inter'] text-base font-bold text-[#2C3E3C] w-[21.67%]"
                    >
                      FONDATION
                    </th>
                    <th
                      scope='col'
                      className="text-center p-5 font-['Inter'] text-base font-bold text-[#2C3E3C] w-[21.67%] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]"
                    >
                      TRANSFORMATION
                    </th>
                    <th
                      scope='col'
                      className="text-center p-5 font-['Inter'] text-base font-bold text-[#2C3E3C] w-[21.67%]"
                    >
                      PARCOURS COMPLET
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {/* Groupe: Informations générales */}
                  <tr className='bg-[#7C9885]/[0.05]'>
                    <td
                      colSpan={4}
                      className="p-3 px-5 font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C]"
                    >
                      Informations générales
                    </td>
                  </tr>

                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Durée
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      2 mois
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      3 mois
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      6 mois
                    </td>
                  </tr>

                  <tr className='bg-white hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Prix total
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] font-bold text-[#7C9885]">
                      CHF 449
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] font-bold text-[#7C9885] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      CHF 1'199
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] font-bold text-[#7C9885]">
                      CHF 2'199
                    </td>
                  </tr>

                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Prix par consultation
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] font-bold text-[#2C3E3C]">
                      CHF 150
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] font-bold text-[#2C3E3C] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      CHF 171
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] font-bold text-[#2C3E3C]">
                      CHF 183
                    </td>
                  </tr>

                  {/* Groupe: Consultations */}
                  <tr className='bg-[#7C9885]/[0.05]'>
                    <td
                      colSpan={4}
                      className="p-3 px-5 font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C]"
                    >
                      Consultations
                    </td>
                  </tr>

                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Consultation découverte
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        1h30
                      </div>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        1h30
                      </div>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        1h30
                      </div>
                    </td>
                  </tr>

                  <tr className='bg-white hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Consultations de suivi
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      2 × 1h
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      5 × 1h
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      11 × 1h
                    </td>
                  </tr>

                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Total consultations
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] font-bold text-[#2C3E3C]">
                      3
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] font-bold text-[#2C3E3C] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      6
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] font-bold text-[#2C3E3C]">
                      12
                    </td>
                  </tr>

                  <tr className='bg-white hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Rythme
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      1×/mois
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      2×/mois
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      2×/mois
                    </td>
                  </tr>

                  {/* Groupe: Programme */}
                  <tr className='bg-[#7C9885]/[0.05]'>
                    <td
                      colSpan={4}
                      className="p-3 px-5 font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C]"
                    >
                      Programme
                    </td>
                  </tr>

                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Programme personnalisé
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <svg
                        className='w-4 h-4 mx-auto'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Évolutif
                      </div>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Premium
                      </div>
                    </td>
                  </tr>

                  <tr className='bg-white hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Plans de repas
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <svg
                        className='w-4 h-4 mx-auto'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Variés
                      </div>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Variés + Saisonniers
                      </div>
                    </td>
                  </tr>

                  {/* Groupe: Plateforme */}
                  <tr className='bg-[#7C9885]/[0.05]'>
                    <td
                      colSpan={4}
                      className="p-3 px-5 font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C]"
                    >
                      Plateforme
                    </td>
                  </tr>

                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Accès plateforme
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      2 mois
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      3 mois
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      6 mois
                    </td>
                  </tr>

                  <tr className='bg-white hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Journal alimentaire
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <svg
                        className='w-4 h-4 mx-auto'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      <svg
                        className='w-4 h-4 mx-auto'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <svg
                        className='w-4 h-4 mx-auto'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </td>
                  </tr>

                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Suivi des progrès
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <svg
                        className='w-4 h-4 mx-auto'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Détaillé
                      </div>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Détaillé
                      </div>
                    </td>
                  </tr>

                  <tr className='bg-white hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Ressources éducatives
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Basiques
                      </div>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Avancées
                      </div>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Premium
                      </div>
                    </td>
                  </tr>

                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Documents assurance
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <svg
                        className='w-4 h-4 mx-auto'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      <svg
                        className='w-4 h-4 mx-auto'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <svg
                        className='w-4 h-4 mx-auto'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </td>
                  </tr>

                  {/* Groupe: Support */}
                  <tr className='bg-[#7C9885]/[0.05]'>
                    <td
                      colSpan={4}
                      className="p-3 px-5 font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C]"
                    >
                      Support
                    </td>
                  </tr>

                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Messagerie prioritaire
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#9BA5A3]">
                      –
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      Option +CHF 90/mois
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Inclus
                      </div>
                    </td>
                  </tr>

                  <tr className='bg-white hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Chat direct
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#9BA5A3]">
                      –
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#9BA5A3] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      –
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#6BA583]">
                      <div className='flex items-center justify-center gap-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Inclus
                      </div>
                    </td>
                  </tr>

                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Ajustements
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      À chaque suivi
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      Réguliers
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      Continus
                    </td>
                  </tr>

                  {/* Groupe: Idéal pour */}
                  <tr className='bg-[#7C9885]/[0.05]'>
                    <td
                      colSpan={4}
                      className="p-3 px-5 font-['Inter'] text-sm font-bold uppercase tracking-[1px] text-[#2C3E3C]"
                    >
                      Idéal pour
                    </td>
                  </tr>

                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200'>
                    <td
                      scope='row'
                      className="p-4 px-5 font-['Inter'] text-[0.95rem] font-medium text-[#667674]"
                    >
                      Profil type
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      <div className='text-sm leading-relaxed'>
                        Démarrer un suivi nutritionnel
                      </div>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C] bg-[#7C9885]/[0.03] border-l-2 border-r-2 border-[#7C9885]">
                      <div className='text-sm leading-relaxed'>
                        Transformation durable des habitudes
                      </div>
                    </td>
                    <td className="p-4 text-center font-['Inter'] text-[0.95rem] text-[#2C3E3C]">
                      <div className='text-sm leading-relaxed'>
                        Changement profond et accompagnement long terme
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Version Mobile - Tabs */}
          <div className='md:hidden'>
            <div className='mb-6'>
              <div className='flex bg-[#F8FAF9] rounded-lg p-1'>
                <button className='flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors bg-[#7C9885] text-white'>
                  Fondation
                </button>
                <button className='flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-[#667674] hover:text-[#2C3E3C]'>
                  Transformation
                </button>
                <button className='flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-[#667674] hover:text-[#2C3E3C]'>
                  Parcours
                </button>
              </div>
            </div>

            {/* Contenu de la tab active (Fondation par défaut) */}
            <div className='bg-white rounded-xl border border-[#E5E7E6] p-6 shadow-sm'>
              <div className='text-center mb-6'>
                <h3 className="font-['Inter'] text-xl font-bold text-[#2C3E3C] mb-2">
                  FONDATION
                </h3>
                <div className='text-2xl font-bold text-[#7C9885] mb-1'>
                  CHF 449
                </div>
                <div className='text-sm text-[#667674]'>
                  2 mois • CHF 150/consultation
                </div>
              </div>

              <div className='space-y-4'>
                <div className='flex justify-between py-2 border-b border-[#F0F0F0]'>
                  <span className='text-[#667674]'>Consultations totales</span>
                  <span className='font-medium'>3</span>
                </div>
                <div className='flex justify-between py-2 border-b border-[#F0F0F0]'>
                  <span className='text-[#667674]'>Programme personnalisé</span>
                  <svg
                    className='w-4 h-4 text-[#6BA583]'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
                <div className='flex justify-between py-2 border-b border-[#F0F0F0]'>
                  <span className='text-[#667674]'>Accès plateforme</span>
                  <span className='font-medium'>2 mois</span>
                </div>
                <div className='flex justify-between py-2 border-b border-[#F0F0F0]'>
                  <span className='text-[#667674]'>Messagerie prioritaire</span>
                  <span className='text-[#9BA5A3]'>–</span>
                </div>
                <div className='flex justify-between py-2'>
                  <span className='text-[#667674]'>Idéal pour</span>
                  <span className='font-medium text-right text-sm'>
                    Démarrer
                  </span>
                </div>
              </div>

              <Button className='w-full mt-6 bg-[#7C9885] hover:bg-[#6B8574] text-white'>
                Choisir Fondation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Consultations à l'Unité */}
      <section className='bg-gradient-to-br from-[#7C9885]/[0.03] to-[#7C9885]/[0.04] py-[80px] px-10 md:py-[60px] md:px-6'>
        <div className='max-w-[1000px] mx-auto'>
          {/* Header de section */}
          <div className='text-center mb-[60px]'>
            <h2 className="font-['Playfair_Display'] text-[2.5rem] md:text-[2rem] font-bold text-[#2C3E3C] mb-5">
              Vous Préférez Avancer à Votre Rythme ?
            </h2>
            <p className="font-['Inter'] text-lg text-[#667674] max-w-[700px] mx-auto leading-[1.6]">
              Après votre consultation découverte, vous pouvez continuer avec
              des consultations à l'unité sans vous engager sur un forfait.
            </p>
          </div>

          {/* Grid des cartes consultations */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-[30px] mb-10'>
            {/* Carte Consultation de Suivi */}
            <div className='bg-white p-10 md:p-8 rounded-xl border-2 border-[#E5E7E6] shadow-[0_2px_15px_rgba(44,62,60,0.06)] flex flex-col transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_8px_25px_rgba(44,62,60,0.12)] animate-fade-slide-up'>
              {/* Titre de la carte */}
              <h3 className="font-['Inter'] text-xl font-bold uppercase tracking-[0.5px] text-[#2C3E3C] mb-5">
                CONSULTATION DE SUIVI
              </h3>

              {/* Durée et Prix */}
              <div className='flex flex-col gap-2 mb-6 pb-6 border-b border-[#E5E7E6]'>
                <span className="font-['Inter'] text-base text-[#667674]">
                  Durée : 1h
                </span>
                <div className='flex items-baseline'>
                  <span className="font-['Inter'] text-xl text-[#667674] mr-2">
                    CHF
                  </span>
                  <span className="font-['Playfair_Display'] text-[2.5rem] font-bold text-[#7C9885]">
                    180
                  </span>
                </div>
              </div>

              {/* Pour : */}
              <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-3">
                Pour :
              </h4>

              {/* Liste des cas d'usage */}
              <div className='flex flex-col gap-[10px] mb-6'>
                <div className='flex items-start gap-[10px]'>
                  <span className='text-[#7C9885] mt-1 text-sm'>→</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Faire le point sur vos progrès
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <span className='text-[#7C9885] mt-1 text-sm'>→</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Ajuster votre programme
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <span className='text-[#7C9885] mt-1 text-sm'>→</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Résoudre des difficultés
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <span className='text-[#7C9885] mt-1 text-sm'>→</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Répondre à vos questions
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <span className='text-[#7C9885] mt-1 text-sm'>→</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Recevoir de nouvelles recommandations
                  </span>
                </div>
              </div>

              {/* Note de remboursement */}
              <div className='mt-auto pt-5 border-t border-[#E5E7E6]'>
                <p className="font-['Inter'] text-sm italic text-[#9BA5A3] mb-6">
                  Remboursable par assurance complémentaire
                </p>

                {/* Bouton CTA */}
                <Button
                  variant='outline'
                  className='w-full border-2 border-[#7C9885] text-[#7C9885] hover:bg-[#7C9885]/[0.05] py-[14px] px-6 text-base font-semibold transition-all duration-200'
                >
                  Réserver une Consultation
                </Button>
              </div>
            </div>

            {/* Carte Consultation Express */}
            <div className='bg-white p-10 md:p-8 rounded-xl border-2 border-[#E5E7E6] shadow-[0_2px_15px_rgba(44,62,60,0.06)] flex flex-col transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_8px_25px_rgba(44,62,60,0.12)] animate-fade-slide-up animation-delay-150'>
              {/* Titre de la carte */}
              <h3 className="font-['Inter'] text-xl font-bold uppercase tracking-[0.5px] text-[#2C3E3C] mb-5">
                CONSULTATION EXPRESS
              </h3>

              {/* Durée et Prix */}
              <div className='flex flex-col gap-2 mb-6 pb-6 border-b border-[#E5E7E6]'>
                <span className="font-['Inter'] text-base text-[#667674]">
                  Durée : 30 min
                </span>
                <div className='flex items-baseline'>
                  <span className="font-['Inter'] text-xl text-[#667674] mr-2">
                    CHF
                  </span>
                  <span className="font-['Playfair_Display'] text-[2.5rem] font-bold text-[#7C9885]">
                    90
                  </span>
                </div>
              </div>

              {/* Pour : */}
              <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-3">
                Pour :
              </h4>

              {/* Liste des cas d'usage */}
              <div className='flex flex-col gap-[10px] mb-4'>
                <div className='flex items-start gap-[10px]'>
                  <span className='text-[#7C9885] mt-1 text-sm'>→</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Poser une question ponctuelle
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <span className='text-[#7C9885] mt-1 text-sm'>→</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Obtenir un conseil rapide
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <span className='text-[#7C9885] mt-1 text-sm'>→</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Valider un choix alimentaire
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <span className='text-[#7C9885] mt-1 text-sm'>→</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Ajuster un détail de votre programme
                  </span>
                </div>
              </div>

              {/* Note additionnelle */}
              <p className="font-['Inter'] text-[0.9rem] italic text-[#667674] mb-4">
                Idéal pour un coup de pouce sans engagement
              </p>

              {/* Note de remboursement */}
              <div className='mt-auto pt-5 border-t border-[#E5E7E6]'>
                <p className="font-['Inter'] text-sm italic text-[#9BA5A3] mb-6">
                  Remboursable par assurance complémentaire
                </p>

                {/* Bouton CTA */}
                <Button
                  variant='outline'
                  className='w-full border-2 border-[#7C9885] text-[#7C9885] hover:bg-[#7C9885]/[0.05] py-[14px] px-6 text-base font-semibold transition-all duration-200'
                >
                  Réserver une Consultation Express
                </Button>
              </div>
            </div>
          </div>

          {/* Encadré informatif */}
          <div className='bg-[#7C9885]/[0.1] border-l-[4px] border-[#7C9885] p-5 rounded-lg max-w-[800px] mx-auto animate-fade-slide-up animation-delay-300'>
            <div className='flex items-start gap-3'>
              <span className='text-2xl'>💡</span>
              <p className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                <strong>Bon à savoir :</strong> Les forfaits offrent un meilleur
                prix par consultation et incluent l'accès à la plateforme
                digitale. Si vous prévoyez plusieurs consultations, un forfait
                sera plus avantageux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Plateforme */}
      <section className='bg-white py-[100px] px-10 md:py-[60px] md:px-6'>
        <div className='max-w-[1200px] mx-auto'>
          {/* Header de section */}
          <div className='text-center mb-[60px]'>
            <div className="font-['Inter'] text-sm uppercase tracking-[1.5px] text-[#7C9885] font-semibold mb-3">
              LA PLATEFORME
            </div>
            <h2 className="font-['Playfair_Display'] text-[2.5rem] md:text-[2rem] font-bold text-[#2C3E3C] mb-5">
              La Plateforme NutriSensia : Votre Allié Quotidien
            </h2>
            <p className="font-['Inter'] text-lg text-[#667674] max-w-[800px] mx-auto leading-[1.6]">
              Tous les forfaits incluent l'accès à votre plateforme digitale
              personnelle. Voici tout ce que vous y trouvez :
            </p>
          </div>

          {/* Grid des fonctionnalités */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px] mb-[60px]'>
            {/* Fonctionnalité 1: Plans de Repas */}
            <div className='bg-[#F8FAF9] p-[35px] md:p-[25px] rounded-xl border-t-[4px] border-[#7C9885] shadow-[0_2px_12px_rgba(44,62,60,0.06)] flex flex-col text-left transition-all duration-300 hover:-translate-y-[5px] hover:border-t-[6px] hover:shadow-[0_4px_20px_rgba(44,62,60,0.1)] animate-fade-slide-up'>
              {/* Icône */}
              <div className='text-[2.5rem] text-[#7C9885] mb-5'>📋</div>

              {/* Titre */}
              <h3 className="font-['Inter'] text-xl font-bold text-[#2C3E3C] mb-4 leading-[1.3]">
                Plans de Repas Personnalisés
              </h3>

              {/* Liste des fonctionnalités */}
              <div className='flex flex-col gap-[10px]'>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Petit-déjeuners, déjeuners, dîners, collations
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Adaptés à vos goûts et contraintes
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Alternatives pour chaque repas
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Recettes détaillées avec instructions
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Portions ajustables selon votre faim
                  </span>
                </div>
              </div>
            </div>

            {/* Fonctionnalité 2: Listes de Courses */}
            <div className='bg-[#F8FAF9] p-[35px] md:p-[25px] rounded-xl border-t-[4px] border-[#7C9885] shadow-[0_2px_12px_rgba(44,62,60,0.06)] flex flex-col text-left transition-all duration-300 hover:-translate-y-[5px] hover:border-t-[6px] hover:shadow-[0_4px_20px_rgba(44,62,60,0.1)] animate-fade-slide-up animation-delay-100'>
              {/* Icône */}
              <div className='text-[2.5rem] text-[#7C9885] mb-5'>🛒</div>

              {/* Titre */}
              <h3 className="font-['Inter'] text-xl font-bold text-[#2C3E3C] mb-4 leading-[1.3]">
                Listes de Courses Automatiques
              </h3>

              {/* Liste des fonctionnalités */}
              <div className='flex flex-col gap-[10px]'>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Générées automatiquement depuis vos plans
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Organisées par catégorie
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Quantités précises (éviter gaspillage)
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Modifiables selon vos achats
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Exportables sur votre téléphone
                  </span>
                </div>
              </div>
            </div>

            {/* Fonctionnalité 3: Journal Alimentaire */}
            <div className='bg-[#F8FAF9] p-[35px] md:p-[25px] rounded-xl border-t-[4px] border-[#7C9885] shadow-[0_2px_12px_rgba(44,62,60,0.06)] flex flex-col text-left transition-all duration-300 hover:-translate-y-[5px] hover:border-t-[6px] hover:shadow-[0_4px_20px_rgba(44,62,60,0.1)] animate-fade-slide-up animation-delay-200'>
              {/* Icône */}
              <div className='text-[2.5rem] text-[#7C9885] mb-5'>📸</div>

              {/* Titre */}
              <h3 className="font-['Inter'] text-xl font-bold text-[#2C3E3C] mb-4 leading-[1.3]">
                Journal Alimentaire Simplifié
              </h3>

              {/* Liste des fonctionnalités */}
              <div className='flex flex-col gap-[10px]'>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Notez vos repas en quelques secondes
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Ajoutez des photos pour suivi visuel
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Tracez hydratation et énergie
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Identifiez patterns et déclencheurs
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    J'analyse pour ajuster le programme
                  </span>
                </div>
              </div>
            </div>

            {/* Fonctionnalité 4: Suivi des Progrès */}
            <div className='bg-[#F8FAF9] p-[35px] md:p-[25px] rounded-xl border-t-[4px] border-[#7C9885] shadow-[0_2px_12px_rgba(44,62,60,0.06)] flex flex-col text-left transition-all duration-300 hover:-translate-y-[5px] hover:border-t-[6px] hover:shadow-[0_4px_20px_rgba(44,62,60,0.1)] animate-fade-slide-up animation-delay-300'>
              {/* Icône */}
              <div className='text-[2.5rem] text-[#7C9885] mb-5'>📊</div>

              {/* Titre */}
              <h3 className="font-['Inter'] text-xl font-bold text-[#2C3E3C] mb-4 leading-[1.3]">
                Suivi de Vos Progrès
              </h3>

              {/* Liste des fonctionnalités */}
              <div className='flex flex-col gap-[10px]'>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Évolution du poids (si pertinent)
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Niveau d'énergie jour par jour
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Qualité du sommeil
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Symptômes digestifs et hormonaux
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Graphiques et visualisations claires
                  </span>
                </div>
              </div>
            </div>

            {/* Fonctionnalité 5: Bibliothèque de Ressources */}
            <div className='bg-[#F8FAF9] p-[35px] md:p-[25px] rounded-xl border-t-[4px] border-[#7C9885] shadow-[0_2px_12px_rgba(44,62,60,0.06)] flex flex-col text-left transition-all duration-300 hover:-translate-y-[5px] hover:border-t-[6px] hover:shadow-[0_4px_20px_rgba(44,62,60,0.1)] animate-fade-slide-up animation-delay-400'>
              {/* Icône */}
              <div className='text-[2.5rem] text-[#7C9885] mb-5'>📚</div>

              {/* Titre */}
              <h3 className="font-['Inter'] text-xl font-bold text-[#2C3E3C] mb-4 leading-[1.3]">
                Bibliothèque de Ressources
              </h3>

              {/* Liste des fonctionnalités */}
              <div className='flex flex-col gap-[10px]'>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Fiches éducatives sur la nutrition
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Guides pratiques (restaurant, voyage, fêtes)
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Recettes exclusives et idées
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Astuces et conseils quotidiens
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Contenus mis à jour régulièrement
                  </span>
                </div>
              </div>
            </div>

            {/* Fonctionnalité 6: Messagerie & Documents */}
            <div className='bg-[#F8FAF9] p-[35px] md:p-[25px] rounded-xl border-t-[4px] border-[#7C9885] shadow-[0_2px_12px_rgba(44,62,60,0.06)] flex flex-col text-left transition-all duration-300 hover:-translate-y-[5px] hover:border-t-[6px] hover:shadow-[0_4px_20px_rgba(44,62,60,0.1)] animate-fade-slide-up animation-delay-500'>
              {/* Icône */}
              <div className='text-[2.5rem] text-[#7C9885] mb-5'>💬</div>

              {/* Titre */}
              <h3 className="font-['Inter'] text-xl font-bold text-[#2C3E3C] mb-4 leading-[1.3]">
                Messagerie & Documents
              </h3>

              {/* Liste des fonctionnalités */}
              <div className='flex flex-col gap-[10px]'>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Posez vos questions (selon forfait)
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Recevez mes recommandations
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Accédez à vos factures pour assurance
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Gérez vos rendez-vous
                  </span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-[#7C9885] mt-1 text-xs'>•</span>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.5] text-[#667674]">
                    Historique de toutes vos consultations
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Texte de clôture */}
          <div className='max-w-[800px] mx-auto text-center p-[30px] bg-[#7C9885]/[0.05] rounded-xl border-l-[4px] border-[#7C9885]'>
            <p className="font-['Inter'] text-base italic text-[#667674] leading-[1.7]">
              La plateforme reste accessible pendant toute la durée de votre
              forfait. Après, vous pouvez prolonger l'accès pour CHF 90/mois si
              vous souhaitez garder vos données et ressources.
            </p>
          </div>
        </div>
      </section>

      {/* Section Options Supplémentaires */}
      <section className='bg-gradient-to-br from-[#7C9885]/[0.03] to-[#7C9885]/[0.05] py-[80px] px-10 md:py-[60px] md:px-6'>
        <div className='max-w-[1000px] mx-auto'>
          {/* Header de section */}
          <div className='text-center mb-[60px]'>
            <h2 className="font-['Playfair_Display'] text-[2.5rem] md:text-[2rem] font-bold text-[#2C3E3C] mb-5">
              Personnalisez Votre Accompagnement
            </h2>
            <p className="font-['Inter'] text-lg text-[#667674] max-w-[700px] mx-auto leading-[1.6]">
              Besoin de plus de soutien entre les consultations ? Ajoutez une
              option à votre forfait.
            </p>
          </div>

          {/* Grid des options */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-[30px]'>
            {/* Option 1: Messagerie Prioritaire */}
            <div className='bg-white p-[35px] md:p-[25px] rounded-xl border-2 border-[#E5E7E6] shadow-[0_2px_15px_rgba(44,62,60,0.06)] flex flex-col transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_8px_25px_rgba(44,62,60,0.12)] animate-fade-slide-up'>
              {/* Icône + Titre */}
              <div className='flex items-center gap-3 mb-5'>
                <div className='text-[2rem] text-[#7C9885]'>💬</div>
                <h3 className="font-['Inter'] text-xl font-bold uppercase tracking-[0.5px] text-[#2C3E3C]">
                  MESSAGERIE PRIORITAIRE
                </h3>
              </div>

              {/* Prix */}
              <div className='flex items-baseline mb-6'>
                <span className="font-['Inter'] text-base text-[#667674] mr-1">
                  CHF
                </span>
                <span className="font-['Playfair_Display'] text-[2rem] font-bold text-[#7C9885]">
                  90
                </span>
                <span className="font-['Inter'] text-base text-[#667674] ml-1">
                  /mois
                </span>
              </div>

              {/* Séparateur */}
              <div className='w-full h-[1px] bg-[#E5E7E6] my-5'></div>

              {/* Pour : */}
              <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-3">
                Pour :
              </h4>

              {/* Liste des bénéfices */}
              <div className='flex flex-col gap-[10px] mb-5'>
                <div className='flex items-start gap-[10px]'>
                  <svg
                    className='w-[14px] h-[14px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Poser vos questions entre les consultations
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <svg
                    className='w-[14px] h-[14px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Recevoir mes réponses sous 48h maximum
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <svg
                    className='w-[14px] h-[14px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Être soutenue dans les moments difficiles
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <svg
                    className='w-[14px] h-[14px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Valider vos choix alimentaires au quotidien
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <svg
                    className='w-[14px] h-[14px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Ajuster rapidement si quelque chose ne va pas
                  </span>
                </div>
              </div>

              {/* Séparateur */}
              <div className='w-full h-[1px] bg-[#E5E7E6] my-5'></div>

              {/* Note de compatibilité */}
              <p className="font-['Inter'] text-sm italic text-[#9BA5A3] leading-[1.5] mt-auto">
                Compatible avec : Forfait Fondation et Transformation
                <br />
                (Inclus dans Parcours Complet)
              </p>
            </div>

            {/* Option 2: Prolongation Plateforme */}
            <div className='bg-white p-[35px] md:p-[25px] rounded-xl border-2 border-[#E5E7E6] shadow-[0_2px_15px_rgba(44,62,60,0.06)] flex flex-col transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_8px_25px_rgba(44,62,60,0.12)] animate-fade-slide-up animation-delay-150'>
              {/* Icône + Titre */}
              <div className='flex items-center gap-3 mb-5'>
                <div className='text-[2rem] text-[#7C9885]'>📱</div>
                <h3 className="font-['Inter'] text-xl font-bold uppercase tracking-[0.5px] text-[#2C3E3C]">
                  PROLONGATION PLATEFORME
                </h3>
              </div>

              {/* Prix */}
              <div className='flex items-baseline mb-6'>
                <span className="font-['Inter'] text-base text-[#667674] mr-1">
                  CHF
                </span>
                <span className="font-['Playfair_Display'] text-[2rem] font-bold text-[#7C9885]">
                  90
                </span>
                <span className="font-['Inter'] text-base text-[#667674] ml-1">
                  /mois
                </span>
              </div>
              <p className="font-['Inter'] text-sm text-[#667674] mb-4 -mt-2">
                (après la fin de votre forfait)
              </p>

              {/* Séparateur */}
              <div className='w-full h-[1px] bg-[#E5E7E6] my-5'></div>

              {/* Pour : */}
              <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-3">
                Pour :
              </h4>

              {/* Liste des bénéfices */}
              <div className='flex flex-col gap-[10px] mb-5'>
                <div className='flex items-start gap-[10px]'>
                  <svg
                    className='w-[14px] h-[14px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Garder l'accès à tous vos plans de repas
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <svg
                    className='w-[14px] h-[14px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Continuer à utiliser le journal alimentaire
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <svg
                    className='w-[14px] h-[14px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Conserver l'historique de vos progrès
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <svg
                    className='w-[14px] h-[14px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Accéder aux ressources éducatives
                  </span>
                </div>
                <div className='flex items-start gap-[10px]'>
                  <svg
                    className='w-[14px] h-[14px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-[0.95rem] leading-[1.6] text-[#667674]">
                    Maintenir vos bonnes habitudes
                  </span>
                </div>
              </div>

              {/* Séparateur */}
              <div className='w-full h-[1px] bg-[#E5E7E6] my-5'></div>

              {/* Note de compatibilité */}
              <p className="font-['Inter'] text-sm italic text-[#9BA5A3] leading-[1.5] mt-auto">
                Sans engagement, résiliable à tout moment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Remboursement Assurance */}
      <section className='bg-white py-[100px] px-10 md:py-[60px] md:px-6'>
        <div className='max-w-[1100px] mx-auto'>
          {/* Header de section */}
          <div className='text-center mb-[60px]'>
            <div className="font-['Inter'] text-sm uppercase tracking-[1.5px] text-[#7C9885] font-semibold mb-3">
              REMBOURSEMENT
            </div>
            <h2 className="font-['Playfair_Display'] text-[2.5rem] md:text-[2rem] font-bold text-[#2C3E3C] mb-5">
              Remboursement par Votre Assurance Complémentaire
            </h2>
            <p className="font-['Inter'] text-lg text-[#667674] max-w-[800px] mx-auto leading-[1.6]">
              En tant que thérapeute diplômée et reconnue ASCA/RME, mes
              consultations sont remboursables par la plupart des assurances
              complémentaires suisses.
            </p>
          </div>

          {/* Sous-section: Comment ça marche */}
          <div className='mb-[60px]'>
            <h3 className="font-['Inter'] text-2xl font-bold text-[#2C3E3C] mb-10 text-center">
              Comment ça marche ?
            </h3>

            {/* Timeline - Desktop */}
            <div className='hidden md:flex justify-between items-start gap-6 mb-10'>
              {/* Étape 1 */}
              <div className='flex-1 flex flex-col items-center text-center animate-fade-slide-up'>
                <div className="w-[60px] h-[60px] rounded-full bg-[#7C9885] text-white font-['Playfair_Display'] text-[1.75rem] font-bold flex items-center justify-center shadow-[0_4px_12px_rgba(124,152,133,0.3)] mb-5">
                  1
                </div>
                <h4 className="font-['Inter'] text-lg font-bold text-[#2C3E3C] mb-3">
                  Vous Consultez
                </h4>
                <p className="font-['Inter'] text-[0.95rem] text-[#667674] leading-[1.6] max-w-[200px]">
                  Vous réservez et suivez vos consultations normalement. Vous
                  payez à l'avance (carte ou virement).
                </p>
              </div>

              {/* Connecteur 1 */}
              <div className='flex items-center justify-center mt-[30px]'>
                <svg
                  className='w-10 h-6 text-[#7C9885]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 7l5 5m0 0l-5 5m5-5H6'
                  />
                </svg>
              </div>

              {/* Étape 2 */}
              <div className='flex-1 flex flex-col items-center text-center animate-fade-slide-up animation-delay-200'>
                <div className="w-[60px] h-[60px] rounded-full bg-[#7C9885] text-white font-['Playfair_Display'] text-[1.75rem] font-bold flex items-center justify-center shadow-[0_4px_12px_rgba(124,152,133,0.3)] mb-5">
                  2
                </div>
                <h4 className="font-['Inter'] text-lg font-bold text-[#2C3E3C] mb-3">
                  Vous Recevez Votre Facture
                </h4>
                <p className="font-['Inter'] text-[0.95rem] text-[#667674] leading-[1.6] max-w-[200px]">
                  Après chaque consultation, vous recevez automatiquement une
                  facture conforme ASCA/RME via votre plateforme.
                </p>
              </div>

              {/* Connecteur 2 */}
              <div className='flex items-center justify-center mt-[30px]'>
                <svg
                  className='w-10 h-6 text-[#7C9885]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 7l5 5m0 0l-5 5m5-5H6'
                  />
                </svg>
              </div>

              {/* Étape 3 */}
              <div className='flex-1 flex flex-col items-center text-center animate-fade-slide-up animation-delay-400'>
                <div className="w-[60px] h-[60px] rounded-full bg-[#7C9885] text-white font-['Playfair_Display'] text-[1.75rem] font-bold flex items-center justify-center shadow-[0_4px_12px_rgba(124,152,133,0.3)] mb-5">
                  3
                </div>
                <h4 className="font-['Inter'] text-lg font-bold text-[#2C3E3C] mb-3">
                  Vous Transmettez
                </h4>
                <p className="font-['Inter'] text-[0.95rem] text-[#667674] leading-[1.6] max-w-[200px]">
                  Vous envoyez la facture à votre assurance complémentaire
                  (courrier, email, ou app).
                </p>
              </div>

              {/* Connecteur 3 */}
              <div className='flex items-center justify-center mt-[30px]'>
                <svg
                  className='w-10 h-6 text-[#7C9885]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 7l5 5m0 0l-5 5m5-5H6'
                  />
                </svg>
              </div>

              {/* Étape 4 */}
              <div className='flex-1 flex flex-col items-center text-center animate-fade-slide-up animation-delay-500'>
                <div className="w-[60px] h-[60px] rounded-full bg-[#7C9885] text-white font-['Playfair_Display'] text-[1.75rem] font-bold flex items-center justify-center shadow-[0_4px_12px_rgba(124,152,133,0.3)] mb-5">
                  4
                </div>
                <h4 className="font-['Inter'] text-lg font-bold text-[#2C3E3C] mb-3">
                  Vous Êtes Remboursée
                </h4>
                <p className="font-['Inter'] text-[0.95rem] text-[#667674] leading-[1.6] max-w-[200px]">
                  Votre assurance vous rembourse selon votre contrat
                  (généralement sous 2-4 semaines).
                </p>
              </div>
            </div>

            {/* Timeline - Mobile */}
            <div className='md:hidden space-y-6'>
              {/* Étape 1 Mobile */}
              <div className='flex items-start gap-4 animate-fade-slide-up'>
                <div className="w-[50px] h-[50px] rounded-full bg-[#7C9885] text-white font-['Playfair_Display'] text-xl font-bold flex items-center justify-center shadow-[0_4px_12px_rgba(124,152,133,0.3)] flex-shrink-0">
                  1
                </div>
                <div className='flex-1'>
                  <h4 className="font-['Inter'] text-lg font-bold text-[#2C3E3C] mb-2">
                    Vous Consultez
                  </h4>
                  <p className="font-['Inter'] text-[0.95rem] text-[#667674] leading-[1.6]">
                    Vous réservez et suivez vos consultations normalement. Vous
                    payez à l'avance (carte ou virement).
                  </p>
                </div>
              </div>

              {/* Flèche Mobile */}
              <div className='flex justify-center'>
                <svg
                  className='w-6 h-8 text-[#7C9885]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 14l-7 7m0 0l-7-7m7 7V3'
                  />
                </svg>
              </div>

              {/* Étape 2 Mobile */}
              <div className='flex items-start gap-4 animate-fade-slide-up animation-delay-200'>
                <div className="w-[50px] h-[50px] rounded-full bg-[#7C9885] text-white font-['Playfair_Display'] text-xl font-bold flex items-center justify-center shadow-[0_4px_12px_rgba(124,152,133,0.3)] flex-shrink-0">
                  2
                </div>
                <div className='flex-1'>
                  <h4 className="font-['Inter'] text-lg font-bold text-[#2C3E3C] mb-2">
                    Vous Recevez Votre Facture
                  </h4>
                  <p className="font-['Inter'] text-[0.95rem] text-[#667674] leading-[1.6]">
                    Après chaque consultation, vous recevez automatiquement une
                    facture conforme ASCA/RME via votre plateforme.
                  </p>
                </div>
              </div>

              {/* Flèche Mobile */}
              <div className='flex justify-center'>
                <svg
                  className='w-6 h-8 text-[#7C9885]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 14l-7 7m0 0l-7-7m7 7V3'
                  />
                </svg>
              </div>

              {/* Étape 3 Mobile */}
              <div className='flex items-start gap-4 animate-fade-slide-up animation-delay-400'>
                <div className="w-[50px] h-[50px] rounded-full bg-[#7C9885] text-white font-['Playfair_Display'] text-xl font-bold flex items-center justify-center shadow-[0_4px_12px_rgba(124,152,133,0.3)] flex-shrink-0">
                  3
                </div>
                <div className='flex-1'>
                  <h4 className="font-['Inter'] text-lg font-bold text-[#2C3E3C] mb-2">
                    Vous Transmettez
                  </h4>
                  <p className="font-['Inter'] text-[0.95rem] text-[#667674] leading-[1.6]">
                    Vous envoyez la facture à votre assurance complémentaire
                    (courrier, email, ou app).
                  </p>
                </div>
              </div>

              {/* Flèche Mobile */}
              <div className='flex justify-center'>
                <svg
                  className='w-6 h-8 text-[#7C9885]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 14l-7 7m0 0l-7-7m7 7V3'
                  />
                </svg>
              </div>

              {/* Étape 4 Mobile */}
              <div className='flex items-start gap-4 animate-fade-slide-up animation-delay-500'>
                <div className="w-[50px] h-[50px] rounded-full bg-[#7C9885] text-white font-['Playfair_Display'] text-xl font-bold flex items-center justify-center shadow-[0_4px_12px_rgba(124,152,133,0.3)] flex-shrink-0">
                  4
                </div>
                <div className='flex-1'>
                  <h4 className="font-['Inter'] text-lg font-bold text-[#2C3E3C] mb-2">
                    Vous Êtes Remboursée
                  </h4>
                  <p className="font-['Inter'] text-[0.95rem] text-[#667674] leading-[1.6]">
                    Votre assurance vous rembourse selon votre contrat
                    (généralement sous 2-4 semaines).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sous-section: Taux de remboursement */}
          <div className='mb-[60px]'>
            <h3 className="font-['Inter'] text-2xl font-bold text-[#2C3E3C] mb-[30px]">
              Taux de remboursement
            </h3>
            <p className="font-['Inter'] text-[0.95rem] italic text-[#667674] mb-[30px]">
              Tableau indicatif - Vérifiez votre contrat pour les montants
              exacts
            </p>

            {/* Tableau - Desktop */}
            <div className='hidden md:block rounded-xl overflow-hidden shadow-[0_2px_15px_rgba(44,62,60,0.08)] mb-[30px]'>
              <table className='w-full'>
                <thead className='bg-[#F8FAF9] border-b-2 border-[#7C9885]'>
                  <tr>
                    <th
                      scope='col'
                      className="text-left p-4 font-['Inter'] text-[0.95rem] font-bold text-[#2C3E3C] w-[25%]"
                    >
                      Assurance
                    </th>
                    <th
                      scope='col'
                      className="text-left p-4 font-['Inter'] text-[0.95rem] font-bold text-[#2C3E3C] w-[35%]"
                    >
                      Couverture Typique
                    </th>
                    <th
                      scope='col'
                      className="text-left p-4 font-['Inter'] text-[0.95rem] font-bold text-[#2C3E3C] w-[40%]"
                    >
                      Remarques
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td className="p-4 font-['Inter'] text-[0.95rem] font-medium text-[#2C3E3C]">
                      CSS
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      75% jusqu'à CHF 500/an
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      Selon contrat myFlex
                    </td>
                  </tr>
                  <tr className='bg-white hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td className="p-4 font-['Inter'] text-[0.95rem] font-medium text-[#2C3E3C]">
                      Helsana
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      75% jusqu'à CHF 1'000/an
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      Module COMPLETA
                    </td>
                  </tr>
                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td className="p-4 font-['Inter'] text-[0.95rem] font-medium text-[#2C3E3C]">
                      Swica
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      90% jusqu'à CHF 3'000/an
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      COMPLETA PRAEVENTA
                    </td>
                  </tr>
                  <tr className='bg-white hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td className="p-4 font-['Inter'] text-[0.95rem] font-medium text-[#2C3E3C]">
                      Visana
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      75% jusqu'à CHF 750/an
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      SANA complémentaire
                    </td>
                  </tr>
                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td className="p-4 font-['Inter'] text-[0.95rem] font-medium text-[#2C3E3C]">
                      Groupe Mutuel
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      80% jusqu'à CHF 1'000/an
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      Selon contrat
                    </td>
                  </tr>
                  <tr className='bg-white hover:bg-[#7C9885]/[0.02] transition-colors duration-200 border-b border-[#F0F0F0]'>
                    <td className="p-4 font-['Inter'] text-[0.95rem] font-medium text-[#2C3E3C]">
                      Assura
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      50% jusqu'à CHF 500/an
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      Complémentaire
                    </td>
                  </tr>
                  <tr className='hover:bg-[#7C9885]/[0.02] transition-colors duration-200'>
                    <td className="p-4 font-['Inter'] text-[0.95rem] font-medium text-[#2C3E3C]">
                      Sanitas
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      75% jusqu'à CHF 500/an
                    </td>
                    <td className="p-4 font-['Inter'] text-[0.95rem] text-[#667674]">
                      Compact ONE
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cartes - Mobile */}
            <div className='md:hidden space-y-4 mb-[30px]'>
              <div className='bg-white p-4 rounded-lg border border-[#E5E7E6] shadow-sm'>
                <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-2">
                  CSS
                </h4>
                <p className="font-['Inter'] text-sm text-[#667674] mb-1">
                  75% jusqu'à CHF 500/an
                </p>
                <p className="font-['Inter'] text-xs text-[#9BA5A3]">
                  Selon contrat myFlex
                </p>
              </div>
              <div className='bg-white p-4 rounded-lg border border-[#E5E7E6] shadow-sm'>
                <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-2">
                  Helsana
                </h4>
                <p className="font-['Inter'] text-sm text-[#667674] mb-1">
                  75% jusqu'à CHF 1'000/an
                </p>
                <p className="font-['Inter'] text-xs text-[#9BA5A3]">
                  Module COMPLETA
                </p>
              </div>
              <div className='bg-white p-4 rounded-lg border border-[#E5E7E6] shadow-sm'>
                <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-2">
                  Swica
                </h4>
                <p className="font-['Inter'] text-sm text-[#667674] mb-1">
                  90% jusqu'à CHF 3'000/an
                </p>
                <p className="font-['Inter'] text-xs text-[#9BA5A3]">
                  COMPLETA PRAEVENTA
                </p>
              </div>
              <div className='bg-white p-4 rounded-lg border border-[#E5E7E6] shadow-sm'>
                <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-2">
                  Visana
                </h4>
                <p className="font-['Inter'] text-sm text-[#667674] mb-1">
                  75% jusqu'à CHF 750/an
                </p>
                <p className="font-['Inter'] text-xs text-[#9BA5A3]">
                  SANA complémentaire
                </p>
              </div>
              <div className='bg-white p-4 rounded-lg border border-[#E5E7E6] shadow-sm'>
                <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-2">
                  Groupe Mutuel
                </h4>
                <p className="font-['Inter'] text-sm text-[#667674] mb-1">
                  80% jusqu'à CHF 1'000/an
                </p>
                <p className="font-['Inter'] text-xs text-[#9BA5A3]">
                  Selon contrat
                </p>
              </div>
              <div className='bg-white p-4 rounded-lg border border-[#E5E7E6] shadow-sm'>
                <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-2">
                  Assura
                </h4>
                <p className="font-['Inter'] text-sm text-[#667674] mb-1">
                  50% jusqu'à CHF 500/an
                </p>
                <p className="font-['Inter'] text-xs text-[#9BA5A3]">
                  Complémentaire
                </p>
              </div>
              <div className='bg-white p-4 rounded-lg border border-[#E5E7E6] shadow-sm'>
                <h4 className="font-['Inter'] text-base font-bold text-[#2C3E3C] mb-2">
                  Sanitas
                </h4>
                <p className="font-['Inter'] text-sm text-[#667674] mb-1">
                  75% jusqu'à CHF 500/an
                </p>
                <p className="font-['Inter'] text-xs text-[#9BA5A3]">
                  Compact ONE
                </p>
              </div>
            </div>

            {/* Encadré d'avertissement */}
            <div className='bg-[#D4A574]/[0.1] border-l-[4px] border-[#D4A574] p-5 rounded-lg flex items-start gap-3'>
              <span className='text-2xl'>⚠️</span>
              <div>
                <h4 className="font-['Inter'] text-[0.95rem] font-bold text-[#2C3E3C] mb-2">
                  Important
                </h4>
                <p className="font-['Inter'] text-[0.95rem] text-[#2C3E3C] leading-[1.6]">
                  Ces montants sont indicatifs. Le taux et le plafond exact
                  dépendent de votre contrat d'assurance complémentaire.
                  Vérifiez vos conditions avant de débuter.
                </p>
              </div>
            </div>
          </div>

          {/* Sous-section: Documents fournis */}
          <div className='mb-[60px]'>
            <h3 className="font-['Inter'] text-2xl font-bold text-[#2C3E3C] mb-[30px]">
              Documents fournis
            </h3>
            <p className="font-['Inter'] text-base text-[#667674] mb-5">
              Je vous fournis systématiquement :
            </p>

            <div className='bg-[#7C9885]/[0.03] p-[30px] rounded-xl max-w-[700px]'>
              <div className='space-y-3'>
                <div className='flex items-start gap-3'>
                  <svg
                    className='w-[18px] h-[18px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-base leading-[1.6] text-[#667674]">
                    Facture conforme aux exigences des assureurs ASCA/RME
                  </span>
                </div>
                <div className='flex items-start gap-3'>
                  <svg
                    className='w-[18px] h-[18px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-base leading-[1.6] text-[#667674]">
                    Récapitulatif détaillé de chaque consultation (date, durée,
                    type)
                  </span>
                </div>
                <div className='flex items-start gap-3'>
                  <svg
                    className='w-[18px] h-[18px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-base leading-[1.6] text-[#667674]">
                    Numéro RCC (Registre de Commerce des Cantons)
                  </span>
                </div>
                <div className='flex items-start gap-3'>
                  <svg
                    className='w-[18px] h-[18px] text-[#6BA583] mt-1 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className="font-['Inter'] text-base leading-[1.6] text-[#667674]">
                    Tous les éléments nécessaires à votre remboursement
                  </span>
                </div>
              </div>

              <p className="font-['Inter'] text-base font-bold text-[#7C9885] mt-5">
                Vous n'avez qu'à transmettre, je m'occupe de la paperasse !
              </p>
            </div>
          </div>

          {/* Sous-section: Vérifier couverture */}
          <div className='bg-white border-2 border-[#7C9885] p-[30px] rounded-xl text-center max-w-[700px] mx-auto'>
            <h3 className="font-['Inter'] text-lg font-bold text-[#2C3E3C] mb-4">
              Vérifier votre couverture
            </h3>

            <Button
              variant='outline'
              className='border-2 border-[#7C9885] text-[#7C9885] hover:bg-[#7C9885]/[0.05] py-[14px] px-7 text-base font-semibold mb-4 transition-all duration-200'
            >
              → Contacter votre assurance pour vérifier
            </Button>

            <p className="font-['Inter'] text-sm italic text-[#9BA5A3] leading-[1.6] max-w-[600px] mx-auto">
              Astuce : Demandez à votre assurance combien vous avez droit par
              année civile pour les « médecines complémentaires » ou « thérapies
              naturelles » avec reconnaissance ASCA/RME.
            </p>
          </div>
        </div>
      </section>

      {/* Banner Remboursement - Style CTABannerSection avec fond vert */}
      <section
        ref={remboursementBannerRef}
        style={{
          backgroundColor: '#3f6655',
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
            animate={remboursementBannerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Texte */}
            <motion.span
              style={{
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '18px',
                fontWeight: 600,
                color: '#ffffff',
                textAlign: 'center',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={remboursementBannerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            >
              Mes consultations sont remboursées par les assurances complémentaires
            </motion.span>

            {/* Bouton CTA */}
            <motion.a
              href='/remboursement'
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '35px',
                padding: '14px 32px',
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#3f6655',
                textDecoration: 'none',
                textAlign: 'center',
                lineHeight: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={remboursementBannerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
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
            animate={modalitesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Titre principal */}
            <h2
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '48px',
                fontWeight: 700,
                lineHeight: '57.6px',
                color: '#3f6655',
                marginBottom: '24px',
              }}
            >
              Modalités de Paiement et d'Annulation
            </h2>

            {/* Sous-titre */}
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '18px',
                lineHeight: '28px',
                color: '#41556b',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              Tout ce que vous devez savoir avant de réserver votre consultation
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
                animate={modalitesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
                      lineHeight: '1.3',
                      color: '#3f6655',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Comment Payer ?
                  </h3>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '24px',
                      color: '#3f6655',
                      transition: 'transform 0.3s ease',
                      transform: openModalite === 1 ? 'rotate(180deg)' : 'rotate(0deg)',
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
                            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#3f6655',
                            marginBottom: '8px',
                          }}
                        >
                          Options acceptées :
                        </h4>
                        <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b', marginBottom: '4px' }}>
                            Carte bancaire (Visa, Mastercard)
                          </li>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b', marginBottom: '4px' }}>
                            Virement bancaire (IBAN fourni après réservation)
                          </li>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b' }}>
                            Twint (pour les consultations à l'unité)
                          </li>
                        </ul>

                        <h4
                          style={{
                            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#3f6655',
                            marginBottom: '8px',
                          }}
                        >
                          Quand :
                        </h4>
                        <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b', marginBottom: '4px' }}>
                            Forfaits : Paiement en une fois au moment de la réservation
                          </li>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b' }}>
                            Consultations à l'unité : Paiement avant chaque consultation
                          </li>
                        </ul>

                        <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b' }}>
                          Un reçu vous est automatiquement envoyé pour chaque paiement.
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

              {/* Item 2: Annulation */}
              <motion.div
                style={{
                  borderBottom: '1px solid #b6ccae',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={modalitesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
                      lineHeight: '1.3',
                      color: '#3f6655',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Annulation
                  </h3>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '24px',
                      color: '#3f6655',
                      transition: 'transform 0.3s ease',
                      transform: openModalite === 2 ? 'rotate(180deg)' : 'rotate(0deg)',
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
                        <h4
                          style={{
                            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#3f6655',
                            marginBottom: '8px',
                          }}
                        >
                          Annulation gratuite :
                        </h4>
                        <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b', marginBottom: '4px' }}>
                            Jusqu'à 48h avant votre rendez-vous
                          </li>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b' }}>
                            Par email ou via la plateforme
                          </li>
                        </ul>

                        <h4
                          style={{
                            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#3f6655',
                            marginBottom: '8px',
                          }}
                        >
                          Annulation tardive (moins de 48h) :
                        </h4>
                        <ul style={{ paddingLeft: '20px' }}>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b', marginBottom: '4px' }}>
                            La consultation est facturée et non remboursée
                          </li>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b' }}>
                            Sauf cas exceptionnel (maladie avec certificat médical)
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
                            alt='Annulation'
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

              {/* Item 3: Report */}
              <motion.div
                style={{
                  borderBottom: '1px solid #b6ccae',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={modalitesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
                      lineHeight: '1.3',
                      color: '#3f6655',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Report
                  </h3>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '24px',
                      color: '#3f6655',
                      transition: 'transform 0.3s ease',
                      transform: openModalite === 3 ? 'rotate(180deg)' : 'rotate(0deg)',
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
                        <h4
                          style={{
                            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#3f6655',
                            marginBottom: '8px',
                          }}
                        >
                          En cas d'empêchement de votre part :
                        </h4>
                        <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b', marginBottom: '4px' }}>
                            Possible jusqu'à 24h avant le rendez-vous
                          </li>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b', marginBottom: '4px' }}>
                            Nous fixons ensemble une nouvelle date
                          </li>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b' }}>
                            Sans frais supplémentaires
                          </li>
                        </ul>

                        <h4
                          style={{
                            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#3f6655',
                            marginBottom: '8px',
                          }}
                        >
                          En cas d'empêchement de ma part :
                        </h4>
                        <ul style={{ paddingLeft: '20px' }}>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b', marginBottom: '4px' }}>
                            Je vous préviens dès que possible
                          </li>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b', marginBottom: '4px' }}>
                            Nous replanifions à votre convenance
                          </li>
                          <li style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '16px', lineHeight: '26px', color: '#41556b' }}>
                            Aucun frais ne vous est facturé
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
                            src={modalitesImages[3]}
                            alt='Report'
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

      {/* Section FAQ */}
      <section className='bg-white py-[100px] px-10 md:py-[60px] md:px-6'>
        <div className='max-w-[900px] mx-auto'>
          {/* Header de section */}
          <div className='text-center mb-[50px]'>
            <div className="font-['Inter'] text-sm uppercase tracking-[1.5px] text-[#7C9885] font-semibold mb-3">
              VOS QUESTIONS
            </div>
            <h2 className="font-['Playfair_Display'] text-[2.25rem] md:text-[1.75rem] font-bold text-[#2C3E3C]">
              Questions Fréquentes sur les Tarifs
            </h2>
          </div>

          {/* Accordéon FAQ */}
          <div className='flex flex-col'>
            {faqData.map((faq, index) => (
              <div
                key={index}
                className={`border-b border-[#E5E7E6] py-6 ${index === 0 ? 'pt-0' : ''} transition-all duration-300 ease-in-out`}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleFaq(index)}
                  className='w-full flex justify-between items-center bg-transparent border-none text-left p-0 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#7C9885] focus:ring-opacity-50 rounded-md'
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                  role='button'
                >
                  {/* Question Text */}
                  <span
                    className={`font-['Inter'] text-lg md:text-base font-bold leading-[1.4] flex-1 pr-4 transition-colors duration-200 ${
                      openFaq === index
                        ? 'text-[#7C9885]'
                        : 'text-[#2C3E3C] group-hover:text-[#7C9885]'
                    }`}
                  >
                    {faq.question}
                  </span>

                  {/* Chevron Icon */}
                  <div className='flex-shrink-0 ml-4'>
                    <svg
                      className={`w-6 h-6 text-[#7C9885] transition-transform duration-300 ease-in-out ${
                        openFaq === index ? 'rotate-180' : 'rotate-0'
                      }`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </button>

                {/* Answer Panel */}
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index
                      ? 'max-h-[1000px] pt-4 opacity-100'
                      : 'max-h-0 pt-0 opacity-0'
                  }`}
                >
                  <div className='pb-2'>
                    <p className="font-['Inter'] text-base md:text-[0.95rem] leading-[1.7] text-[#667674] whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section CTA Finale */}
      <section
        ref={ctaRef}
        className='bg-white py-[100px] px-10 pb-[80px] md:py-[60px] md:px-6 md:pb-[50px]'
      >
        <div className='max-w-[1200px] mx-auto'>
          {/* CTA Box */}
          <div
            className={`bg-gradient-to-br from-[#7C9885] to-[#6A8773] rounded-[20px] md:rounded-[16px] p-[80px_60px] md:p-[50px_30px] shadow-[0_10px_40px_rgba(124,152,133,0.25)] text-center max-w-[900px] mx-auto transition-all duration-800 ${
              ctaVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {/* Titre principal */}
            <h2
              className={`font-['Playfair_Display'] text-[1.75rem] sm:text-[2rem] lg:text-[2.5rem] font-bold text-white text-center mb-6 text-shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-800 delay-100 ${
                ctaVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              Choisissez Votre Formule et Démarrez Votre Transformation
            </h2>

            {/* Texte de soutien */}
            <div
              className={`max-w-[750px] mx-auto mb-10 transition-all duration-800 delay-200 ${
                ctaVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="font-['Inter'] text-xl md:text-lg font-normal text-white/95 leading-[1.8] mb-4">
                Vous avez toutes les informations. Maintenant, c'est à vous de
                décider.
              </p>
              <p className="font-['Inter'] text-xl md:text-lg font-normal text-white/95 leading-[1.8] mb-4">
                Quel que soit le forfait que vous choisissez, vous faites le
                premier pas vers une relation apaisée avec votre alimentation et
                votre corps.
              </p>
              <p className="font-['Inter'] text-xl md:text-lg font-normal text-white/95 leading-[1.8]">
                Encore des questions ? N'hésitez pas à me contacter avant de
                réserver.
              </p>
            </div>

            {/* Groupe de CTA */}
            <div className='flex flex-col items-center gap-4 mb-6'>
              {/* CTA Primaire */}
              <button
                className={`bg-white text-[#2C3E3C] font-['Inter'] text-base sm:text-lg font-semibold py-4 px-6 sm:py-[18px] sm:px-9 rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.15)] w-[90%] sm:min-w-[350px] min-h-[48px] transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 delay-300 ${
                  ctaVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                Réserver Ma Consultation Découverte
              </button>

              {/* CTA Secondaire */}
              <button
                onClick={() => {
                  const comparisonSection = document.querySelector(
                    '#comparison-section'
                  );
                  if (comparisonSection) {
                    comparisonSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-transparent border-2 border-white text-white font-['Inter'] text-lg font-semibold py-4 px-[34px] md:py-[14px] md:px-[30px] rounded-lg min-w-[350px] md:min-w-[90%] transition-all duration-300 ease-in-out hover:bg-white/15 hover:-translate-y-[2px] flex items-center justify-center gap-3 animate-fade-slide-up animation-delay-300"
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 10h16M4 14h16M4 18h16'
                  />
                </svg>
                Comparer les Forfaits
              </button>

              {/* CTA Tertiaire */}
              <button className="bg-transparent text-white font-['Inter'] text-base font-semibold py-3 px-6 transition-all duration-300 ease-in-out hover:underline hover:-translate-y-[2px] flex items-center justify-center gap-3 animate-fade-slide-up animation-delay-400">
                <svg
                  className='w-[18px] h-[18px]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                  />
                </svg>
                Me Poser Une Question
              </button>
            </div>

            {/* Texte de réassurance */}
            <div className="flex flex-wrap justify-center items-center gap-5 md:gap-[10px] text-white/85 font-['Inter'] text-sm tracking-[0.3px] animate-fade-slide-up animation-delay-500">
              <div className='flex items-center gap-2'>
                <span>✓</span>
                <span>Remboursable par assurance</span>
              </div>
              <div className='flex items-center gap-2'>
                <span>✓</span>
                <span>Annulation gratuite jusqu'à 48h</span>
              </div>
              <div className='flex items-center gap-2'>
                <span>✓</span>
                <span>Sans engagement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Marketing */}
      <MarketingFooter />
    </div>
  );
}
