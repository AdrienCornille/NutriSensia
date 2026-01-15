'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { AuthGuard } from '@/components/auth/AuthGuard';

/**
 * Page de confirmation de réservation
 *
 * Cette page s'affiche après qu'un utilisateur a réservé une consultation via Cal.com.
 * Elle confirme la réservation et affiche les prochaines étapes.
 */

// Icône de succès animée
const SuccessIcon: React.FC = () => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
    className="relative"
  >
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center"
      style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
    >
      <motion.svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.path
          d="M20 6L9 17l-5-5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
      </motion.svg>
    </div>
  </motion.div>
);

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
  </svg>
);

// Liste des prochaines étapes
const nextSteps = [
  {
    number: 1,
    title: 'Vérifiez votre email',
    description: 'Vous recevrez un email de confirmation avec le lien de la visioconférence.',
  },
  {
    number: 2,
    title: 'Préparez vos questions',
    description: 'Notez vos objectifs, habitudes alimentaires et questions pour optimiser notre échange.',
  },
  {
    number: 3,
    title: 'Rejoignez la consultation',
    description: 'Connectez-vous à l\'heure prévue via le lien reçu par email.',
  },
];

function ConfirmationPageContent() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
      {/* Header */}
      <MarketingHeader />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-20 pt-[140px] md:pt-[160px]">
        <div className="max-w-[600px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <SuccessIcon />
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-[#2C3E3C] mb-4"
              style={{ fontFamily: 'Marcellus, serif' }}
            >
              Réservation confirmée !
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-[#667674]"
            >
              Votre consultation a été réservée avec succès.
              <br />
              Vous recevrez un email de confirmation sous peu.
            </motion.p>
          </motion.div>

          {/* Recap Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="border-2 border-[#E5DED6] shadow-lg mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1B998B]/10 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-[#1B998B]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#2C3E3C]">
                    Récapitulatif
                  </h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#E5DED6]">
                    <span className="text-[#667674]">Type</span>
                    <span className="font-medium text-[#2C3E3C]">Consultation initiale</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E5DED6]">
                    <span className="text-[#667674]">Durée</span>
                    <span className="font-medium text-[#2C3E3C]">90 minutes</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#667674]">Format</span>
                    <span className="font-medium text-[#2C3E3C]">Visioconférence</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <h3 className="text-sm font-semibold text-[#667674] uppercase tracking-wider mb-4 text-center">
              Prochaines étapes
            </h3>
            <div className="space-y-4">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1B998B] text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    {step.number}
                  </div>
                  <div>
                    <p className="font-medium text-[#2C3E3C]">{step.title}</p>
                    <p className="text-sm text-[#667674]">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/dashboard">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                Aller au tableau de bord
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                Retour à l&apos;accueil
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <AuthGuard>
      <ConfirmationPageContent />
    </AuthGuard>
  );
}
