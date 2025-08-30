'use client';

import React from 'react';

/**
 * Interface pour les critères de force du mot de passe
 */
interface PasswordCriteria {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

/**
 * Props du composant PasswordStrengthIndicator
 */
interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

/**
 * Composant pour afficher la force du mot de passe
 */
export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, className = '' }) => {
  // Calcul de la force du mot de passe
  const calculateStrength = (password: string): number => {
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return Math.min(strength, 5);
  };

  // Critères de validation
  const criteria: PasswordCriteria[] = [
    {
      label: 'Au moins 8 caractères',
      test: pwd => pwd.length >= 8,
      met: password.length >= 8,
    },
    {
      label: 'Au moins une minuscule',
      test: pwd => /[a-z]/.test(pwd),
      met: /[a-z]/.test(password),
    },
    {
      label: 'Au moins une majuscule',
      test: pwd => /[A-Z]/.test(pwd),
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Au moins un chiffre',
      test: pwd => /\d/.test(pwd),
      met: /\d/.test(password),
    },
    {
      label: 'Au moins un caractère spécial',
      test: pwd => /[^A-Za-z0-9]/.test(pwd),
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const strength = calculateStrength(password);
  const strengthPercentage = (strength / 5) * 100;

  // Couleurs et textes selon la force
  const getStrengthInfo = () => {
    if (strength <= 1) {
      return {
        color: 'bg-functional-error',
        text: 'Très faible',
        textColor: 'text-functional-error',
      };
    } else if (strength <= 2) {
      return {
        color: 'bg-orange-500',
        text: 'Faible',
        textColor: 'text-orange-500',
      };
    } else if (strength <= 3) {
      return {
        color: 'bg-yellow-500',
        text: 'Moyenne',
        textColor: 'text-yellow-500',
      };
    } else if (strength <= 4) {
      return {
        color: 'bg-blue-500',
        text: 'Forte',
        textColor: 'text-blue-500',
      };
    } else {
      return {
        color: 'bg-functional-success',
        text: 'Très forte',
        textColor: 'text-functional-success',
      };
    }
  };

  const strengthInfo = getStrengthInfo();

  return (
    <div className={`space-y-12dp ${className}`}>
      {/* Barre de progression */}
      <div className='space-y-8dp'>
        <div className='flex justify-between items-center'>
          <span className='text-caption text-neutral-medium dark:text-neutral-medium'>
            Force du mot de passe
          </span>
          <span
            className={`text-caption font-medium ${strengthInfo.textColor}`}
          >
            {strengthInfo.text}
          </span>
        </div>

        <div className='w-full bg-neutral-light dark:bg-neutral-dark rounded-full h-8dp overflow-hidden'>
          <div
            className={`h-full transition-all duration-300 ease-out ${strengthInfo.color}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Critères de validation */}
      <div className='space-y-8dp'>
        <span className='text-caption text-neutral-medium dark:text-neutral-medium'>
          Critères requis :
        </span>

        <div className='space-y-6dp'>
          {criteria.map((criterion, index) => (
            <div key={index} className='flex items-center space-x-8dp'>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  criterion.met
                    ? 'bg-functional-success text-white'
                    : 'bg-neutral-light dark:bg-neutral-dark text-transparent'
                }`}
              >
                {criterion.met && (
                  <svg
                    className='w-3 h-3'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-caption ${
                  criterion.met
                    ? 'text-functional-success'
                    : 'text-neutral-medium dark:text-neutral-medium'
                }`}
              >
                {criterion.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Hook personnalisé pour la validation du mot de passe
 */
export const usePasswordValidation = (password: string) => {
  const criteria = [
    { test: (pwd: string) => pwd.length >= 8, met: password.length >= 8 },
    { test: (pwd: string) => /[a-z]/.test(pwd), met: /[a-z]/.test(password) },
    { test: (pwd: string) => /[A-Z]/.test(pwd), met: /[A-Z]/.test(password) },
    { test: (pwd: string) => /\d/.test(pwd), met: /\d/.test(password) },
    {
      test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const isValid = criteria.every(criterion => criterion.met);
  const strength = criteria.filter(criterion => criterion.met).length;

  return {
    isValid,
    strength,
    criteria,
  };
};
