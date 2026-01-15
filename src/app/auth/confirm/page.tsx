'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * Icône d'email animée - Design Palette Méditerranée
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
    {/* Cercle animé autour de l'icône */}
    <div
      className='absolute inset-0 -m-2 rounded-full animate-ping'
      style={{ border: '2px solid rgba(27, 153, 139, 0.2)' }}
    />
  </div>
);

/**
 * Composant de barre de progression - Design Palette Méditerranée
 */
const ProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className='w-full mb-8'>
      <div className='flex justify-between items-center mb-2'>
        <span
          style={{
            fontFamily:
              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '14px',
            color: '#41556b',
          }}
        >
          Étape {currentStep} sur {totalSteps}
        </span>
        <span
          style={{
            fontFamily:
              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            color: '#1b998b',
          }}
        >
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      <div
        className='w-full h-2 rounded-full overflow-hidden'
        style={{ backgroundColor: '#e5ded6' }}
      >
        <div
          className='h-full rounded-full transition-all duration-500 ease-out'
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
            background: 'linear-gradient(135deg, #1b998b 0%, #147569 100%)',
          }}
        />
      </div>
    </div>
  );
};

/**
 * Modal de confirmation d'envoi d'email
 */
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  email: string;
  type: 'success' | 'error';
  message: string;
}> = ({ isOpen, onClose, email, type, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className='bg-white p-6 max-w-sm w-full text-center'
        style={{
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icône */}
        <div className='flex justify-center mb-4'>
          {type === 'success' ? (
            <div
              className='w-16 h-16 rounded-full flex items-center justify-center'
              style={{ backgroundColor: 'rgba(27, 153, 139, 0.1)' }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='32'
                height='32'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#1b998b'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                <polyline points='22 4 12 14.01 9 11.01' />
              </svg>
            </div>
          ) : (
            <div
              className='w-16 h-16 rounded-full flex items-center justify-center'
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='32'
                height='32'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#ef4444'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle cx='12' cy='12' r='10' />
                <line x1='15' y1='9' x2='9' y2='15' />
                <line x1='9' y1='9' x2='15' y2='15' />
              </svg>
            </div>
          )}
        </div>

        {/* Titre */}
        <h3
          className='text-xl font-bold mb-2'
          style={{
            fontFamily: "'Marcellus', serif",
            color: type === 'success' ? '#1b998b' : '#ef4444',
          }}
        >
          {type === 'success' ? 'Email envoyé !' : 'Erreur'}
        </h3>

        {/* Message */}
        <p
          className='mb-2'
          style={{
            fontSize: '14px',
            lineHeight: '22px',
            color: '#41556b',
          }}
        >
          {message}
        </p>

        {/* Email affiché */}
        {type === 'success' && email && (
          <p
            className='font-semibold mb-4'
            style={{
              fontSize: '14px',
              color: '#1b998b',
            }}
          >
            {email}
          </p>
        )}

        {/* Bouton fermer */}
        <button
          type='button'
          onClick={onClose}
          className='w-full py-3 px-6 font-semibold text-white transition-all duration-300'
          style={{
            fontSize: '14px',
            background:
              type === 'success'
                ? 'linear-gradient(135deg, #1b998b 0%, #147569 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '35px',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.background =
              type === 'success'
                ? 'linear-gradient(135deg, #147569 0%, #0f5a50 100%)'
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.background =
              type === 'success'
                ? 'linear-gradient(135deg, #1b998b 0%, #147569 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
          }}
        >
          Compris
        </button>
      </div>
    </div>
  );
};

/**
 * Page de confirmation d'inscription
 * Design: Palette Méditerranée
 *
 * Affichée après une inscription réussie pour demander à l'utilisateur
 * de vérifier son email.
 */
export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  // Récupérer l'email depuis les query params ou localStorage
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      const storedEmail = localStorage.getItem('nutrisensia-pending-email');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [searchParams]);

  const handleResendConfirmation = async () => {
    if (!email) {
      setModalState({
        isOpen: true,
        type: 'error',
        message: 'Aucune adresse email trouvée. Veuillez vous réinscrire.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setModalState({
        isOpen: true,
        type: 'error',
        message: 'Adresse email invalide.',
      });
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur s'est produite");
      }

      setModalState({
        isOpen: true,
        type: 'success',
        message: 'Un nouvel email de confirmation a été envoyé à :',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors de l'envoi";

      setModalState({
        isOpen: true,
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div
      className='min-h-screen flex items-center justify-center p-6'
      style={{
        backgroundColor: '#f8f7ef',
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        email={email}
        type={modalState.type}
        message={modalState.message}
      />

      {/* Header avec logo */}
      <header
        className='fixed top-0 left-0 right-0 z-40'
        style={{ backgroundColor: '#f8f7ef' }}
      >
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-center'>
          <Link href='/' className='flex items-center gap-2'>
            <div
              className='w-8 h-8 rounded-full flex items-center justify-center'
              style={{
                background: 'linear-gradient(135deg, #1b998b 0%, #147569 100%)',
              }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='white'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5' />
                <circle cx='12' cy='12' r='3' fill='white' />
              </svg>
            </div>
            <span
              className='font-bold text-lg'
              style={{
                fontFamily: "'Marcellus', serif",
                color: '#1b998b',
              }}
            >
              NutriSensia
            </span>
          </Link>
        </div>
      </header>

      {/* Carte principale */}
      <div
        className='w-full max-w-md bg-white p-8 text-center'
        style={{
          borderRadius: '20px',
          border: '1px solid #e5e5e5',
          boxShadow: '8px 8px 0 #e5ded6',
        }}
      >
        {/* Barre de progression - Étape 2/3 */}
        <ProgressBar currentStep={2} totalSteps={3} />

        {/* Icône d'email */}
        <div className='flex justify-center mb-6'>
          <EmailIcon />
        </div>

        {/* Titre */}
        <h1
          className='text-3xl font-bold mb-3'
          style={{
            fontFamily: "'Marcellus', serif",
            color: '#1b998b',
          }}
        >
          Vérifiez votre email
        </h1>
        <p
          className='mb-8'
          style={{
            fontSize: '16px',
            lineHeight: '24px',
            color: '#41556b',
          }}
        >
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
            <li>Connectez-vous à votre compte</li>
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
            Si vous ne trouvez pas l&apos;email, vérifiez votre dossier{' '}
            <strong>spam</strong> ou <strong>courriers indésirables</strong>.
          </p>
        </div>

        {/* Timer / Info */}
        <p
          className='mb-6'
          style={{
            fontSize: '13px',
            color: '#41556b',
          }}
        >
          Le lien de confirmation expire dans 24 heures.
        </p>

        {/* Bouton Retour à la connexion */}
        <Link href='/auth/signin' className='block mb-6'>
          <button
            className='w-full py-3.5 px-6 font-semibold text-white transition-all duration-300'
            style={{
              fontSize: '15px',
              background: 'linear-gradient(135deg, #1b998b 0%, #147569 100%)',
              borderRadius: '35px',
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.background =
                'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.background =
                'linear-gradient(135deg, #1b998b 0%, #147569 100%)';
            }}
          >
            Retour à la connexion
          </button>
        </Link>

        {/* Séparateur gris */}
        <div
          className='w-full h-px mb-6'
          style={{ backgroundColor: '#e5e5e5' }}
        />

        {/* Section renvoyer l'email */}
        <div className='text-center'>
          <p
            className='mb-4'
            style={{
              fontSize: '14px',
              color: '#41556b',
            }}
          >
            Vous n&apos;avez pas reçu l&apos;email ?
          </p>

          <button
            type='button'
            onClick={handleResendConfirmation}
            disabled={isResending}
            className='w-full py-3.5 px-6 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
            style={{
              fontSize: '15px',
              color: '#1b998b',
              backgroundColor: '#ffffff',
              border: '2px solid #1b998b',
              borderRadius: '35px',
            }}
            onMouseEnter={e => {
              if (!isResending) {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  'rgba(27, 153, 139, 0.08)';
              }
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#ffffff';
            }}
          >
            {isResending ? (
              <span className='flex items-center justify-center gap-2'>
                <svg
                  className='animate-spin h-5 w-5'
                  viewBox='0 0 24 24'
                  fill='none'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Envoi en cours...
              </span>
            ) : (
              "Renvoyer l'email de confirmation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
