'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Variantes d'inputs disponibles selon le design system NutriSensia
 */
export type InputVariant = 'standard' | 'search' | 'textarea';

/**
 * Tailles d'inputs disponibles
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Props du composant Input
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Variante de l'input selon le design system
   */
  variant?: InputVariant;
  /**
   * Taille de l'input
   */
  inputSize?: InputSize;
  /**
   * Label de l'input
   */
  label?: string;
  /**
   * Message d'aide
   */
  helperText?: string;
  /**
   * Message d'erreur
   */
  error?: string;
  /**
   * Icône à gauche
   */
  leftIcon?: React.ReactNode;
  /**
   * Icône à droite
   */
  rightIcon?: React.ReactNode;
  /**
   * État de chargement
   */
  loading?: boolean;
  /**
   * Input plein largeur
   */
  fullWidth?: boolean;
}

/**
 * Props du composant Textarea
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label du textarea
   */
  label?: string;
  /**
   * Message d'aide
   */
  helperText?: string;
  /**
   * Message d'erreur
   */
  error?: string;
  /**
   * État de chargement
   */
  loading?: boolean;
  /**
   * Textarea plein largeur
   */
  fullWidth?: boolean;
  /**
   * Nombre de lignes visibles
   */
  rows?: number;
}

/**
 * Props du composant InputWrapper
 */
export interface InputWrapperProps {
  /**
   * Label de l'input
   */
  label?: string;
  /**
   * Message d'aide
   */
  helperText?: string;
  /**
   * Message d'erreur
   */
  error?: string;
  /**
   * Contenu de l'input
   */
  children: React.ReactNode;
  /**
   * ID de l'input pour l'association avec le label
   */
  inputId?: string;
  /**
   * Input requis
   */
  required?: boolean;
}

/**
 * Composant InputWrapper pour encapsuler les inputs avec label et messages
 */
const InputWrapper: React.FC<InputWrapperProps> = ({
  label,
  helperText,
  error,
  children,
  inputId,
  required,
}) => {
  return (
    <div className='space-y-8dp'>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className='block text-label font-medium text-neutral-dark dark:text-neutral-light'
        >
          {label}
          {required && <span className='text-functional-error ml-4dp'>*</span>}
        </label>
      )}

      {/* Input */}
      {children}

      {/* Messages d'aide et d'erreur */}
      {(helperText || error) && (
        <div className='space-y-4dp'>
          {helperText && (
            <p className='text-caption text-neutral-medium dark:text-neutral-medium'>
              {helperText}
            </p>
          )}
          {error && (
            <p className='text-caption text-functional-error'>{error}</p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Composant Input réutilisable selon le design system NutriSensia
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="votre@email.com"
 *   variant="standard"
 *   required
 * />
 *
 * <Input
 *   placeholder="Rechercher..."
 *   variant="search"
 *   leftIcon={<SearchIcon />}
 * />
 *
 * <Input
 *   label="Message"
 *   variant="textarea"
 *   rows={4}
 *   placeholder="Votre message..."
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'standard',
      inputSize = 'md',
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      loading = false,
      fullWidth = false,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    // Classes de base communes à tous les inputs
    const baseClasses = [
      'transition-all duration-standard ease-out',
      'focus:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-neutral-medium',
    ];

    // Classes spécifiques aux variantes
    const variantClasses = {
      standard: [
        'h-56dp border-2 border-neutral-border dark:border-neutral-medium',
        'rounded-8dp bg-background-primary dark:bg-background-secondary',
        'focus:border-primary focus:shadow-focus',
        'hover:border-neutral-dark dark:hover:border-neutral-light',
        'px-16dp',
        'text-neutral-dark dark:text-neutral-light',
      ],
      search: [
        'h-44dp bg-background-secondary dark:bg-neutral-dark',
        'rounded-22dp border-none',
        'focus:bg-background-primary dark:focus:bg-background-secondary focus:shadow-focus',
        'hover:bg-background-accent dark:hover:bg-neutral-medium',
        'px-16dp',
        'text-neutral-dark dark:text-neutral-light',
      ],
      textarea: [
        'min-h-120dp border-2 border-neutral-border dark:border-neutral-medium',
        'rounded-8dp bg-background-primary dark:bg-background-secondary',
        'focus:border-primary focus:shadow-focus',
        'hover:border-neutral-dark dark:hover:border-neutral-light',
        'px-16dp py-12dp',
        'resize-vertical',
        'text-neutral-dark dark:text-neutral-light',
      ],
    };

    // Classes spécifiques aux tailles
    const sizeClasses = {
      sm: ['text-body-small'],
      md: ['text-body'],
      lg: ['text-body-large'],
    };

    // Classes pour la largeur
    const widthClasses = fullWidth ? ['w-full'] : [];

    // Classes pour l'état d'erreur
    const errorClasses = error
      ? ['border-functional-error', 'focus:border-functional-error']
      : [];

    // Classes pour l'état de chargement
    const loadingClasses = loading ? ['animate-pulse'] : [];

    // Combinaison de toutes les classes
    const inputClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[inputSize],
      widthClasses,
      errorClasses,
      loadingClasses,
      className
    );

    // Classes pour le conteneur avec icônes
    const containerClasses = cn('relative', fullWidth && 'w-full');

    const inputElement = (
      <div className={containerClasses}>
        {/* Icône gauche */}
        {leftIcon && (
          <div className='absolute left-16dp top-1/2 transform -translate-y-1/2 text-neutral-medium dark:text-neutral-medium'>
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={id}
          className={cn(
            inputClasses,
            leftIcon && 'pl-48dp',
            rightIcon && 'pr-48dp'
          )}
          disabled={disabled || loading}
          {...props}
        />

        {/* Icône droite */}
        {rightIcon && (
          <div className='absolute right-16dp top-1/2 transform -translate-y-1/2 text-neutral-medium dark:text-neutral-medium'>
            {rightIcon}
          </div>
        )}

        {/* Spinner de chargement */}
        {loading && (
          <div className='absolute right-16dp top-1/2 transform -translate-y-1/2'>
            <svg
              className='animate-spin h-5 w-5 text-neutral-medium dark:text-neutral-medium'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
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
          </div>
        )}
      </div>
    );

    // Si on a un label ou des messages, on utilise le wrapper
    if (label || helperText || error) {
      return (
        <InputWrapper
          label={label}
          helperText={helperText}
          error={error}
          inputId={id}
          required={required}
        >
          {inputElement}
        </InputWrapper>
      );
    }

    return inputElement;
  }
);

Input.displayName = 'Input';

/**
 * Composant Textarea réutilisable selon le design system NutriSensia
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      loading = false,
      fullWidth = false,
      rows = 4,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    // Classes de base pour le textarea
    const baseClasses = [
      'min-h-96dp border-2 border-neutral-border dark:border-neutral-medium',
      'rounded-8dp bg-background-primary dark:bg-background-secondary',
      'transition-all duration-standard ease-out',
      'focus:outline-none focus:border-primary focus:shadow-focus',
      'hover:border-neutral-dark dark:hover:border-neutral-light',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-neutral-medium dark:text-neutral-medium',
      'resize-y',
      'p-16dp',
      'text-body',
      'text-neutral-dark dark:text-neutral-light',
    ];

    // Classes pour la largeur
    const widthClasses = fullWidth ? ['w-full'] : [];

    // Classes pour l'état d'erreur
    const errorClasses = error
      ? ['border-functional-error', 'focus:border-functional-error']
      : [];

    // Classes pour l'état de chargement
    const loadingClasses = loading ? ['animate-pulse'] : [];

    // Combinaison de toutes les classes
    const textareaClasses = cn(
      baseClasses,
      widthClasses,
      errorClasses,
      loadingClasses,
      className
    );

    const textareaElement = (
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={textareaClasses}
        disabled={disabled || loading}
        {...props}
      />
    );

    // Si on a un label ou des messages, on utilise le wrapper
    if (label || helperText || error) {
      return (
        <InputWrapper
          label={label}
          helperText={helperText}
          error={error}
          inputId={id}
          required={required}
        >
          {textareaElement}
        </InputWrapper>
      );
    }

    return textareaElement;
  }
);

Textarea.displayName = 'Textarea';

/**
 * Composants d'inputs pré-configurés pour un usage rapide
 */
export const StandardInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'variant'>
>((props, ref) => <Input ref={ref} variant='standard' {...props} />);
StandardInput.displayName = 'StandardInput';

export const SearchInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'variant'>
>((props, ref) => <Input ref={ref} variant='search' {...props} />);
SearchInput.displayName = 'SearchInput';
