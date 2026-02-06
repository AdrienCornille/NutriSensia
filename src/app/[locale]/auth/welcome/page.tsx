'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { AuthSplitLayout, AuthGuard } from '@/components/auth';

/**
 * Icône de succès animée
 */
const SuccessIcon: React.FC = () => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
    className='relative'
  >
    <div
      className='w-20 h-20 rounded-full flex items-center justify-center'
      style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
    >
      <motion.svg
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        xmlns='http://www.w3.org/2000/svg'
        width='40'
        height='40'
        viewBox='0 0 24 24'
        fill='none'
        stroke='#22c55e'
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          d='M20 6L9 17l-5-5'
        />
      </motion.svg>
    </div>
  </motion.div>
);

/**
 * Contenu de la page de bienvenue
 */
function WelcomePageContent() {
  return (
    <AuthSplitLayout
      imageSrc='/images/hero-healthy-plate.jpg'
      imageAlt='Assiette saine et équilibrée - NutriSensia'
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-sm mx-auto text-center'
      >
        {/* Icône de succès */}
        <div className='flex justify-center mb-6'>
          <SuccessIcon />
        </div>

        {/* Titre */}
        <h1
          className='text-[32px] leading-[40px] font-bold mb-3'
          style={{
            fontFamily: 'Marcellus, serif',
            color: '#3f6655',
          }}
        >
          Compte activé !
        </h1>
        <p className='text-body mb-8' style={{ color: '#41556b' }}>
          Votre adresse email a été vérifiée avec succès. Vous êtes maintenant
          connecté(e) à votre compte.
        </p>

        {/* Message de bienvenue */}
        <div
          className='p-5 rounded-xl mb-8 text-left'
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)' }}
        >
          <p
            style={{
              fontSize: '14px',
              lineHeight: '22px',
              color: '#41556b',
            }}
          >
            Bienvenue dans la communauté NutriSensia ! Réservez dès maintenant
            votre première consultation pour débuter votre parcours vers une
            alimentation plus saine.
          </p>
        </div>

        {/* Bouton vers le dashboard */}
        <Link href='/dashboard/patient'>
          <motion.button
            type='button'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 24px',
              borderRadius: '35px',
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: 'none',
              background: 'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
              color: '#FDFCFB',
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
            Accéder à mon espace
          </motion.button>
        </Link>
      </motion.div>
    </AuthSplitLayout>
  );
}

/**
 * Page de bienvenue après vérification d'email
 * Affichée après que l'utilisateur a cliqué sur le lien de confirmation
 * Protégée par AuthGuard pour s'assurer que l'utilisateur est connecté
 */
export default function WelcomePage() {
  return (
    <AuthGuard>
      <WelcomePageContent />
    </AuthGuard>
  );
}
