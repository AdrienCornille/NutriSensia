'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Page Dashboard utilisateur
 *
 * Cette page est le tableau de bord principal pour les utilisateurs connectés.
 * Elle affiche un aperçu de leur compte et les actions principales disponibles.
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
  </svg>
);

// Icône utilisateur
const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Icône document
const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// Icône message
const MessageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Actions rapides
const quickActions = [
  {
    icon: CalendarIcon,
    title: 'Réserver une consultation',
    description: 'Planifiez votre prochaine consultation avec votre nutritionniste.',
    href: '/consultation/reserver',
    primary: true,
  },
  {
    icon: UserIcon,
    title: 'Mon profil',
    description: 'Gérez vos informations personnelles et préférences.',
    href: '/profile',
    primary: false,
  },
  {
    icon: DocumentIcon,
    title: 'Mes documents',
    description: 'Accédez à vos plans alimentaires et recommandations.',
    href: '/documents',
    primary: false,
  },
  {
    icon: MessageIcon,
    title: 'Messagerie',
    description: 'Contactez votre nutritionniste directement.',
    href: '/messages',
    primary: false,
  },
];

function DashboardContent() {
  const { user } = useAuth();

  // Extraire le prénom de l'utilisateur
  const firstName = user?.user_metadata?.first_name ||
                    user?.user_metadata?.full_name?.split(' ')[0] ||
                    'vous';

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
      {/* Header */}
      <MarketingHeader />

      {/* Main Content */}
      <main className="flex-1 pt-[140px] md:pt-[160px] pb-12 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1
              className="text-3xl md:text-4xl font-bold text-[#2C3E3C] mb-2"
              style={{ fontFamily: 'Marcellus, serif' }}
            >
              Bonjour, {firstName} !
            </h1>
            <p className="text-lg text-[#667674]">
              Bienvenue sur votre espace personnel NutriSensia.
            </p>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-sm font-semibold text-[#667674] uppercase tracking-wider mb-4">
              Actions rapides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                >
                  <Link href={action.href}>
                    <Card
                      className={`h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                        action.primary
                          ? 'border-2 border-[#1B998B] bg-[#1B998B]/5 hover:shadow-lg'
                          : 'border border-[#E5DED6] hover:border-[#1B998B]/30 hover:shadow-md'
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                          action.primary ? 'bg-[#1B998B]' : 'bg-[#1B998B]/10'
                        }`}>
                          <action.icon className={`w-6 h-6 ${action.primary ? 'text-white' : 'text-[#1B998B]'}`} />
                        </div>
                        <h3 className="font-semibold text-[#2C3E3C] mb-1">{action.title}</h3>
                        <p className="text-sm text-[#667674]">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="border-2 border-[#E9C46A]/30 bg-[#E9C46A]/5">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2C3E3C] mb-1">
                    Prêt(e) à commencer votre parcours ?
                  </h3>
                  <p className="text-sm text-[#667674]">
                    Réservez votre première consultation pour établir ensemble votre bilan nutritionnel personnalisé.
                  </p>
                </div>
                <Link href="/consultation/reserver">
                  <Button variant="primary" size="lg">
                    Réserver maintenant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
