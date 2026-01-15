'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { AuthSplitLayout } from '@/components/auth';

/**
 * Icone d'email animee
 */
const EmailIcon: React.FC = () => (
  <div className='relative'>
    <div
      className='w-20 h-20 rounded-full flex items-center justify-center'
      style={{ backgroundColor: 'rgba(27, 153, 139, 0.08)' }}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='40'
        height='40'
        viewBox='0 0 24 24'
        fill='none'
        stroke='#1b998b'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='animate-pulse'
      >
        <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
        <polyline points='22,6 12,13 2,6' />
      </svg>
    </div>
  </div>
);

/**
 * Page de confirmation d'inscription
 * Affichee apres une inscription reussie pour demander a l'utilisateur
 * de verifier son email.
 */
export default function ConfirmPage() {
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
        {/* Icone d'email */}
        <div className='flex justify-center mb-6'>
          <EmailIcon />
        </div>

        {/* Titre */}
        <h1
          className='text-[32px] leading-[40px] font-bold mb-3'
          style={{
            fontFamily: 'Marcellus, serif',
            color: '#3f6655',
          }}
        >
          Vérifiez votre email
        </h1>
        <p className='text-body mb-8' style={{ color: '#41556b' }}>
          Nous avons envoyé un lien de confirmation à votre adresse email.
        </p>

        {/* Instructions */}
        <div
          className='p-5 rounded-xl mb-6 text-left'
          style={{ backgroundColor: 'rgba(27, 153, 139, 0.08)' }}
        >
          <h3
            className='font-semibold mb-3'
            style={{
              fontSize: '15px',
              color: '#1b998b',
            }}
          >
            Prochaines étapes :
          </h3>
          <ol
            className='space-y-2 list-decimal list-inside'
            style={{
              fontSize: '14px',
              lineHeight: '22px',
              color: '#41556b',
            }}
          >
            <li>Ouvrez votre boîte de réception</li>
            <li>
              Cherchez un email de{' '}
              <span className='font-semibold' style={{ color: '#1b998b' }}>
                NutriSensia
              </span>
            </li>
            <li>Cliquez sur le lien de confirmation</li>
          </ol>
        </div>

        {/* Note sur les spams */}
        <div
          className='flex items-start gap-3 p-4 rounded-xl mb-6 text-left'
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#f59e0b'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='flex-shrink-0 mt-0.5'
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='12' y1='8' x2='12' y2='12' />
            <line x1='12' y1='16' x2='12.01' y2='16' />
          </svg>
          <p
            style={{
              fontSize: '14px',
              lineHeight: '20px',
              color: '#41556b',
            }}
          >
            Si vous ne trouvez pas l'email, vérifiez votre dossier{' '}
            <strong>spam</strong> ou <strong>courriers indésirables</strong>.
          </p>
        </div>

        {/* Info expiration */}
        <p
          className='mb-6 text-xs'
          style={{ color: '#41556b' }}
        >
          Le lien de confirmation expire dans 24 heures.
        </p>

        {/* Bouton vers la connexion */}
        <Link href='/auth/signin'>
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
            Retour à la connexion
          </motion.button>
        </Link>
      </motion.div>
    </AuthSplitLayout>
  );
}
