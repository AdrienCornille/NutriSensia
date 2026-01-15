'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Cal, { getCalApi } from '@calcom/embed-react';
import { Card, CardContent } from '@/components/ui/Card';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Configuration Cal.com
const CAL_LINK = 'adrien-cornille-ek4b7i/consultation-initiale';

/**
 * Page de réservation de consultation
 *
 * Cette page permet aux utilisateurs authentifiés de réserver leur consultation initiale.
 * Elle affiche les détails de la consultation et intègre Cal.com pour la prise de rendez-vous.
 */

// Icône calendrier
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
  </svg>
);

// Icône horloge
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Icône prix
const CurrencyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M14.5 9a3.5 3.5 0 0 0-5 0M9.5 15a3.5 3.5 0 0 0 5 0M12 6v2M12 16v2" />
  </svg>
);

// Icône vidéo
const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="14" height="14" rx="2" />
    <path d="M16 10l4-2v8l-4-2" />
  </svg>
);

// Icône check
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Icône bouclier (sécurité)
const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

// Icône remboursement
const RefundIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12a10 10 0 1 0 10-10" />
    <path d="M12 6v6l4 2" />
    <path d="M2 12h4M4 10l-2 2 2 2" />
  </svg>
);

// Icône certificat
const CertificateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

// Liste des fonctionnalités incluses
const includedFeatures = [
  'Analyse complète de vos habitudes alimentaires',
  'Identification de vos besoins nutritionnels',
  'Plan alimentaire personnalisé initial',
  'Recommandations adaptées à votre mode de vie',
  'Support par email après la consultation',
];

// Badges de confiance
const trustBadges = [
  {
    icon: CertificateIcon,
    title: 'ASCA/RME',
    description: 'Certifiée',
  },
  {
    icon: RefundIcon,
    title: 'Remboursable',
    description: 'Assurance complémentaire',
  },
  {
    icon: ShieldIcon,
    title: 'Confidentiel',
    description: '100% sécurisé',
  },
];

function ReserverPageContent() {
  const { elementRef: heroRef, isInView: heroVisible } = useScrollAnimation();
  const { elementRef: mainRef, isInView: mainVisible } = useScrollAnimation();
  const { elementRef: trustRef, isInView: trustVisible } = useScrollAnimation();

  // Initialiser Cal.com API avec le thème personnalisé
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: 'consultation' });
      cal('ui', {
        theme: 'light',
        styles: {
          branding: {
            brandColor: '#1B998B',
          },
        },
        hideEventTypeDetails: false,
      });
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Header */}
      <MarketingHeader />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="pt-[140px] md:pt-[160px] pb-12 md:pb-16 px-6 md:px-10 bg-gradient-to-br from-[#E8F3EF] via-[#F8F5F2] to-[#FDFCFB]"
      >
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#1B998B] text-sm font-semibold uppercase tracking-[2px] mb-4"
          >
            Consultation initiale
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C3E3C] mb-4"
            style={{ fontFamily: 'Marcellus, serif' }}
          >
            Réservez votre consultation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-[#667674] max-w-[600px] mx-auto"
          >
            Première étape vers votre bien-être nutritionnel.
            Choisissez le créneau qui vous convient.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section ref={mainRef} className="py-12 md:py-20 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column - Consultation Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={mainVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-4"
            >
              {/* Consultation Card */}
              <Card className="border-2 border-[#1B998B]/20 shadow-lg mb-8">
                <CardContent className="p-6 md:p-8">
                  <h2
                    className="text-xl md:text-2xl font-bold text-[#2C3E3C] mb-6"
                    style={{ fontFamily: 'Marcellus, serif' }}
                  >
                    Bilan nutritionnel initial
                  </h2>

                  {/* Details Grid */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1B998B]/10 flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-[#1B998B]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#667674]">Durée</p>
                        <p className="text-lg font-semibold text-[#2C3E3C]">90 minutes</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1B998B]/10 flex items-center justify-center">
                        <CurrencyIcon className="w-6 h-6 text-[#1B998B]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#667674]">Tarif</p>
                        <p className="text-lg font-semibold text-[#2C3E3C]">CHF 150</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1B998B]/10 flex items-center justify-center">
                        <VideoIcon className="w-6 h-6 text-[#1B998B]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#667674]">Format</p>
                        <p className="text-lg font-semibold text-[#2C3E3C]">Visioconférence</p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#E5DED6] my-6" />

                  {/* Included Features */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#667674] uppercase tracking-wider mb-4">
                      Ce qui est inclus
                    </h3>
                    <ul className="space-y-3">
                      {includedFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckIcon className="w-3 h-3 text-[#22C55E]" />
                          </div>
                          <span className="text-sm text-[#2C3E3C]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Info Note */}
              <div className="bg-[#E9C46A]/10 rounded-xl p-4 border border-[#E9C46A]/20">
                <p className="text-sm text-[#2C3E3C]">
                  <span className="font-semibold">Bon à savoir :</span> Cette consultation est remboursée par la plupart des assurances complémentaires (ASCA/RME).
                </p>
              </div>
            </motion.div>

            {/* Right Column - Calendar Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={mainVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-8"
            >
              <Card className="border-2 border-[#E5DED6] shadow-lg h-full">
                <CardContent className="p-0">
                  {/* Calendar Header */}
                  <div className="border-b border-[#E5DED6] p-6">
                    <h2
                      className="text-xl font-bold text-[#2C3E3C]"
                      style={{ fontFamily: 'Marcellus, serif' }}
                    >
                      Choisissez votre créneau
                    </h2>
                    <p className="text-sm text-[#667674] mt-1">
                      Sélectionnez une date et un horaire qui vous conviennent
                    </p>
                  </div>

                  {/* Cal.com Calendar Embed */}
                  <div className="min-h-[600px] bg-white">
                    <Cal
                      namespace="consultation"
                      calLink={CAL_LINK}
                      style={{
                        width: '100%',
                        height: '100%',
                        minHeight: '600px',
                      }}
                      config={{
                        layout: 'month_view',
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section ref={trustRef} className="py-12 md:py-16 px-6 md:px-10 bg-[#F8F5F2]">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={trustVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="flex items-center gap-4 bg-white rounded-xl p-5 border border-[#E5DED6] shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1B998B]/10 flex items-center justify-center">
                  <badge.icon className="w-6 h-6 text-[#1B998B]" />
                </div>
                <div>
                  <p className="font-semibold text-[#2C3E3C]">{badge.title}</p>
                  <p className="text-sm text-[#667674]">{badge.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}

export default function ReserverPage() {
  return (
    <AuthGuard>
      <ReserverPageContent />
    </AuthGuard>
  );
}
